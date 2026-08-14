import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const OUTPUT = path.join(PUBLIC_DIR, 'data.json');
const CACHE_FILE = path.join(PUBLIC_DIR, 'metadata-cache.json');
const LEGACY_CACHE_FILE = path.join(PUBLIC_DIR, 'jikan-cache.json');
const ZIP_URL = process.env.ANITOUSEN_ZIP_URL || 'https://github.com/Avriole/AniTousen/archive/refs/heads/main.zip';

const CACHE_VERSION = 3;
const CACHE_TTL_DAYS = readPositiveNumber('METADATA_CACHE_TTL_DAYS', 14);
const CACHE_TTL_MS = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = readPositiveNumber('API_REQUEST_TIMEOUT_MS', 15_000);
const API_DELAY_MS = readPositiveNumber('API_DELAY_MS', 2_100);
const MAX_RETRIES = readPositiveNumber('API_MAX_RETRIES', 2);
const RETRY_BASE_MS = readPositiveNumber('API_RETRY_BASE_MS', 2_000);
const MAX_BACKOFF_MS = readPositiveNumber('API_MAX_BACKOFF_MS', 60_000);
const PROVIDER_MAX_FAILURES = readPositiveNumber('PROVIDER_MAX_FAILURES', 3);
const CHECKPOINT_INTERVAL = readPositiveNumber('BUILD_CHECKPOINT_INTERVAL', 5);
const SKIP_METADATA = process.env.SKIP_METADATA === '1' || process.argv.includes('--skip-metadata');

function readPositiveNumber(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function writeJsonAtomic(filePath, value) {
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    await fs.writeFile(temporaryPath, JSON.stringify(value, null, 2));
    await fs.rename(temporaryPath, filePath);
  } catch (error) {
    await fs.rm(temporaryPath, { force: true }).catch(() => {});
    throw error;
  }
}

function cleanDescription(description) {
  if (!description) return null;
  return description
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function finiteOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function emptyDetails(status = 'error') {
  return {
    status,
    source: null,
    sourceUrl: null,
    sourceLabel: null,
    malUrl: null,
    coverImage: null,
    synopsis: null,
    genres: [],
    studios: [],
    score: null,
    episodes: null,
    trailerUrl: null,
    cachedAt: new Date().toISOString(),
  };
}

function normalizeDetails(details, source) {
  return {
    status: 'found',
    source,
    sourceUrl: details.sourceUrl || null,
    sourceLabel: details.sourceLabel || source,
    malUrl: details.malUrl || null,
    coverImage: details.coverImage || null,
    synopsis: details.synopsis || null,
    genres: Array.isArray(details.genres) ? details.genres : [],
    studios: Array.isArray(details.studios) ? details.studios : [],
    score: details.score ?? null,
    episodes: details.episodes ?? null,
    trailerUrl: details.trailerUrl || null,
    cachedAt: new Date().toISOString(),
  };
}

class HttpError extends Error {
  constructor(message, status, retryAfterMs = null) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

function parseRetryAfter(value) {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? Math.max(0, timestamp - Date.now()) : null;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${REQUEST_TIMEOUT_MS}ms: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function responseJson(url, options = {}, label = 'request') {
  const response = await fetchWithTimeout(url, options);
  if (!response.ok) {
    throw new HttpError(
      `${label} error ${response.status}`,
      response.status,
      parseRetryAfter(response.headers.get('retry-after'))
    );
  }

  return response.json();
}

async function responseBuffer(url, options = {}, label = 'request') {
  const response = await fetchWithTimeout(url, options);
  if (!response.ok) {
    throw new HttpError(
      `${label} error ${response.status} ${response.statusText}`,
      response.status,
      parseRetryAfter(response.headers.get('retry-after'))
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

function isRetryable(error) {
  return (
    error instanceof HttpError && (error.status === 429 || error.status >= 500)
  ) || error.name === 'TypeError' || error.message.startsWith('Request timeout');
}

let lastApiCall = 0;

async function waitForRateLimit() {
  const elapsed = Date.now() - lastApiCall;
  if (elapsed < API_DELAY_MS) {
    await sleep(API_DELAY_MS - elapsed);
  }
}

async function fetchWithRetry(operation, label) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      await waitForRateLimit();
      const result = await operation();
      lastApiCall = Date.now();
      return { success: true, result };
    } catch (error) {
      lastApiCall = Date.now();
      const canRetry = isRetryable(error) && attempt < MAX_RETRIES - 1;

      if (!canRetry) {
        return { success: false, error: `${label}: ${error.message}` };
      }

      const requestedBackoff = error.retryAfterMs ?? RETRY_BASE_MS * 2 ** attempt;
      const backoff = Math.min(Math.max(requestedBackoff, RETRY_BASE_MS), MAX_BACKOFF_MS);
      console.warn(`  ↳ ${label}: ${error.message}; retrying in ${Math.ceil(backoff / 1000)}s...`);
      await sleep(backoff);
    }
  }

  return { success: false, error: `${label}: exhausted retries` };
}

async function fetchRepoZip() {
  console.log(`Downloading ${ZIP_URL}...`);
  const result = await fetchWithRetry(
    () => responseBuffer(`${ZIP_URL}?t=${Date.now()}`, {}, 'AniTousen'),
    'AniTousen'
  );

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.result;
}

function parseIndex(buffer) {
  const zip = new AdmZip(buffer);
  const items = [];

  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;

    const match = entry.entryName.match(/^AniTousen-main\/URL\/([^/]+)\/(.+)$/);
    if (!match) continue;

    const [season, yearText] = match[1].split(' ');
    const year = Number(yearText);
    if (!season || !Number.isInteger(year)) continue;

    const title = match[2].trim();
    if (!title) continue;

    const content = zip.readAsText(entry);
    const href = content.match(/href\s*=\s*["']([^"']+)["']/i)?.[1] || null;

    items.push({
      title,
      season,
      year,
      downloadLink: href,
    });
  }

  items.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  return items;
}

async function loadCache() {
  for (const filePath of [CACHE_FILE, LEGACY_CACHE_FILE]) {
    try {
      const parsed = JSON.parse(await fs.readFile(filePath, 'utf8'));
      if (parsed.version !== CACHE_VERSION) continue;

      const cache = new Map();
      for (const [key, value] of Object.entries(parsed.entries || {})) {
        if (value?.status === 'found' || value?.status === 'not_found') {
          cache.set(key, value);
        }
      }
      return cache;
    } catch {
      // A missing or damaged cache must never prevent a fresh build.
    }
  }

  return new Map();
}

async function saveCache(cache) {
  await writeJsonAtomic(CACHE_FILE, {
    version: CACHE_VERSION,
    cacheTtlDays: CACHE_TTL_DAYS,
    entries: Object.fromEntries(cache),
  });
}

function cacheKey({ title, season, year }) {
  return `${title}|${season}|${year}`;
}

function isFreshCacheEntry(entry) {
  if (!entry || !['found', 'not_found'].includes(entry.status)) return false;
  const cachedAt = Date.parse(entry.cachedAt || '');
  return Number.isFinite(cachedAt) && Date.now() - cachedAt < CACHE_TTL_MS;
}

const providerState = {
  anilist: { healthy: true, failures: 0 },
  kitsu: { healthy: true, failures: 0 },
};

function markProviderSuccess(name) {
  providerState[name].failures = 0;
}

function markProviderFailure(name, error) {
  const state = providerState[name];
  state.failures += 1;
  console.warn(`  ↳ ${error} (${state.failures} consecutive ${name} failures)`);

  if (state.failures >= PROVIDER_MAX_FAILURES) {
    state.healthy = false;
    console.warn(`  ↳ ${name} disabled for the rest of this build; continuing without it.`);
  }
}

async function fetchAniListDetails(title) {
  const query = `
    query ($search: String) {
      Page(page: 1, perPage: 1) {
        media(search: $search, type: ANIME) {
          id
          idMal
          siteUrl
          title { romaji english native }
          coverImage { large }
          description
          genres
          studios { nodes { name } }
          averageScore
          episodes
          trailer { id site }
        }
      }
    }
  `;

  const payload = await responseJson(
    'https://graphql.anilist.co',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { search: title } }),
    },
    'AniList'
  );

  if (payload.errors?.length) {
    const error = payload.errors[0];
    const apiError = new HttpError(`AniList GraphQL: ${error.message}`, error.status || 500);
    throw apiError;
  }

  const media = payload.data?.Page?.media?.[0];
  if (!media) return null;

  const trailerSite = media.trailer?.site?.toLowerCase();
  const score = finiteOrNull(media.averageScore);
  return {
    sourceUrl: media.siteUrl || null,
    sourceLabel: 'AniList',
    malUrl: media.idMal ? `https://myanimelist.net/anime/${media.idMal}` : null,
    coverImage: media.coverImage?.large || null,
    synopsis: cleanDescription(media.description),
    genres: media.genres || [],
    studios: media.studios?.nodes?.map((studio) => studio.name) || [],
    score: score === null ? null : score / 10,
    episodes: media.episodes ?? null,
    trailerUrl:
      trailerSite === 'youtube' && media.trailer?.id
        ? `https://www.youtube.com/watch?v=${media.trailer.id}`
        : null,
  };
}

async function fetchKitsuDetails(title) {
  const params = new URLSearchParams();
  params.set('filter[text]', title);
  params.set('page[limit]', '1');
  params.set('include', 'categories,mappings');

  const payload = await responseJson(
    `https://kitsu.io/api/edge/anime?${params.toString()}`,
    { headers: { Accept: 'application/vnd.api+json' } },
    'Kitsu'
  );
  const media = payload.data?.[0];
  if (!media) return null;

  const attributes = media.attributes || {};
  const included = payload.included || [];
  const genres = included
    .filter((resource) => resource.type === 'categories')
    .map((resource) => resource.attributes?.title)
    .filter(Boolean);
  const malMapping = included.find(
    (resource) =>
      resource.type === 'mappings' &&
      /myanimelist/i.test(resource.attributes?.externalSite || '')
  );
  const slug = attributes.slug;
  const rating = finiteOrNull(attributes.averageRating);

  return {
    sourceUrl: slug ? `https://kitsu.io/anime/${slug}` : null,
    sourceLabel: 'Kitsu',
    malUrl: malMapping?.attributes?.externalId
      ? `https://myanimelist.net/anime/${malMapping.attributes.externalId}`
      : null,
    coverImage: attributes.posterImage?.large || attributes.posterImage?.original || null,
    synopsis: cleanDescription(attributes.synopsis || attributes.description),
    genres,
    studios: [],
    score: rating === null ? null : rating / 10,
    episodes: attributes.episodeCount ?? null,
    trailerUrl: attributes.youtubeVideoId
      ? `https://www.youtube.com/watch?v=${attributes.youtubeVideoId}`
      : null,
  };
}

async function fetchAnimeDetails(item, cache) {
  const key = cacheKey(item);
  const cached = cache.get(key);
  if (isFreshCacheEntry(cached)) {
    console.log(`  ↳ cache hit (${cached.source || cached.status})`);
    return cached;
  }

  if (SKIP_METADATA) {
    return emptyDetails('skipped');
  }

  let foundDetails = null;
  let hadNotFoundResponse = false;

  if (providerState.anilist.healthy) {
    const result = await fetchWithRetry(() => fetchAniListDetails(item.title), 'AniList');
    if (result.success) {
      markProviderSuccess('anilist');
      if (result.result) {
        foundDetails = normalizeDetails(result.result, 'anilist');
      } else {
        hadNotFoundResponse = true;
        console.log('  ↳ AniList: no match');
      }
    } else {
      markProviderFailure('anilist', result.error);
    }
  }

  if (!foundDetails && providerState.kitsu.healthy) {
    const result = await fetchWithRetry(() => fetchKitsuDetails(item.title), 'Kitsu');
    if (result.success) {
      markProviderSuccess('kitsu');
      if (result.result) {
        foundDetails = normalizeDetails(result.result, 'kitsu');
      } else {
        hadNotFoundResponse = true;
        console.log('  ↳ Kitsu: no match');
      }
    } else {
      markProviderFailure('kitsu', result.error);
    }
  }

  if (foundDetails) return foundDetails;

  return emptyDetails(hadNotFoundResponse ? 'not_found' : 'error');
}

function baseEntry(item) {
  return {
    title: item.title,
    season: item.season,
    year: item.year,
    url: item.downloadLink,
    downloadLink: item.downloadLink,
    source: null,
    sourceUrl: null,
    sourceLabel: null,
    malUrl: null,
    coverImage: null,
    dominantColor: null,
    synopsis: null,
    genres: [],
    studios: [],
    score: null,
    episodes: null,
    trailerUrl: null,
  };
}

function mergeEntry(item, details) {
  return {
    ...baseEntry(item),
    source: details.source || null,
    sourceUrl: details.sourceUrl || null,
    sourceLabel: details.sourceLabel || null,
    malUrl: details.malUrl || null,
    coverImage: details.coverImage || null,
    synopsis: details.synopsis || null,
    genres: details.genres || [],
    studios: details.studios || [],
    score: details.score ?? null,
    episodes: details.episodes ?? null,
    trailerUrl: details.trailerUrl || null,
  };
}

async function saveOutput(results, generatedAt) {
  await writeJsonAtomic(OUTPUT, {
    generatedAt,
    count: results.length,
    animes: results,
  });
}

async function hasValidOutput() {
  try {
    const parsed = JSON.parse(await fs.readFile(OUTPUT, 'utf8'));
    return Array.isArray(parsed.animes) && parsed.animes.length > 0;
  } catch {
    return false;
  }
}

async function build() {
  let zipBuffer;
  try {
    zipBuffer = await fetchRepoZip();
  } catch (error) {
    if (await hasValidOutput()) {
      console.warn(`Could not refresh AniTousen: ${error.message}`);
      console.warn('Keeping the previous data.json so the static build can continue.');
      return;
    }
    throw error;
  }

  let items;
  try {
    items = parseIndex(zipBuffer);
  } catch (error) {
    if (await hasValidOutput()) {
      console.warn(`Could not parse the downloaded AniTousen ZIP: ${error.message}`);
      console.warn('Keeping the previous data.json so the static build can continue.');
      return;
    }
    throw error;
  }
  if (items.length === 0) {
    if (await hasValidOutput()) {
      console.warn('The downloaded ZIP contained no AniTousen entries; keeping previous data.json.');
      return;
    }
    throw new Error('The downloaded AniTousen ZIP contained no valid entries.');
  }

  const cache = await loadCache();
  const generatedAt = new Date().toISOString();
  const results = items.map(baseEntry);

  // The basic index is immediately valid, even if every metadata provider is unavailable.
  await saveOutput(results, generatedAt);
  console.log(`Processing ${items.length} entries with resilient metadata enrichment...`);

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    console.log(`[${index + 1}/${items.length}] ${item.title}`);
    const details = await fetchAnimeDetails(item, cache);
    results[index] = mergeEntry(item, details);

    if (details.status === 'found' || details.status === 'not_found') {
      cache.set(cacheKey(item), details);
    }

    if ((index + 1) % CHECKPOINT_INTERVAL === 0 || index === items.length - 1) {
      await saveCache(cache);
      await saveOutput(results, generatedAt);
      console.log(`  ↳ checkpoint saved (${index + 1}/${items.length})`);
    }
  }

  console.log(`\nIndex generated: ${results.length} entries in ${OUTPUT}`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
