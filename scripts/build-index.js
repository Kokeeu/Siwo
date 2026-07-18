import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const OUTPUT = path.join(PUBLIC_DIR, 'data.json');
const CACHE_FILE = path.join(PUBLIC_DIR, 'jikan-cache.json');
const ZIP_URL = 'https://github.com/Avriole/AniTousen/archive/refs/heads/main.zip';
const API_DELAY_MS = 1500;
const JIKAN_MAX_CONSECUTIVE_FAILURES = 5;
const MAX_RETRIES = 3;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchRepoZip() {
  console.log(`Downloading ${ZIP_URL}...`);
  const res = await fetch(`${ZIP_URL}?t=${Date.now()}`);
  if (!res.ok) {
    throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

function parseIndex(buffer) {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  const items = [];

  for (const entry of entries) {
    if (entry.isDirectory) continue;

    const match = entry.entryName.match(/^AniTousen-main\/URL\/([^/]+)\/(.+)$/);
    if (!match) continue;

    const [season, year] = match[1].split(' ');
    const title = match[2].trim();
    const content = zip.readAsText(entry);
    const hrefMatch = content.match(/href="([^"]+)"/);

    items.push({
      title,
      season,
      year: Number(year),
      downloadLink: hrefMatch?.[1] || null,
    });
  }

  items.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  return items;
}

const CACHE_VERSION = 2;

async function loadCache() {
  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);

    if (parsed.version !== CACHE_VERSION) {
      console.log('Cache version changed; rebuilding enriched cache...');
      return new Map();
    }

    const cache = new Map();
    for (const [key, value] of Object.entries(parsed.entries || {})) {
      if (value.status === 'found') {
        cache.set(key, value);
      } else if (value.status === 'not_found') {
        cache.set(key, value);
      }
    }
    return cache;
  } catch {
    return new Map();
  }
}

async function saveCache(cache) {
  await fs.writeFile(
    CACHE_FILE,
    JSON.stringify({ version: CACHE_VERSION, entries: Object.fromEntries(cache) }, null, 2)
  );
}

function cacheKey({ title, season, year }) {
  return `${title}|${season}|${year}`;
}

let lastApiCall = 0;
let jikanConsecutiveFailures = 0;
let jikanHealthy = true;

async function waitForRateLimit() {
  const now = Date.now();
  const elapsed = now - lastApiCall;
  if (elapsed < API_DELAY_MS) {
    await sleep(API_DELAY_MS - elapsed);
  }
}

async function fetchWithRetry(operation) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await waitForRateLimit();
      const result = await operation();
      lastApiCall = Date.now();
      return { success: true, result };
    } catch (err) {
      lastApiCall = Date.now();
      const isRateLimit = err.message.includes('429');
      const isServerError = /^(5|Jikan error 5|AniList error 5)/.test(err.message);

      if ((isRateLimit || isServerError) && attempt < MAX_RETRIES - 1) {
        const backoff = 5000 * 2 ** attempt;
        console.warn(`  ↳ ${err.message}, retrying in ${backoff / 1000}s...`);
        await sleep(backoff);
      } else {
        return { success: false, error: err.message };
      }
    }
  }
}

async function fetchJikanDetails(title) {
  const encodedTitle = encodeURIComponent(title);
  const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodedTitle}&limit=1`);
  if (!res.ok) {
    throw new Error(`Jikan error ${res.status}`);
  }
  const { data } = await res.json();
  const anime = data?.[0];
  if (!anime) return null;

  const coverImage =
    anime.images?.webp?.large_image_url ||
    anime.images?.jpg?.large_image_url ||
    null;

  return {
    coverImage,
    synopsis: anime.synopsis || null,
    genres: anime.genres?.map((g) => g.name) || [],
    studios: anime.studios?.map((s) => s.name) || [],
    score: anime.score ?? null,
    episodes: anime.episodes ?? null,
    trailerUrl: anime.trailer?.url || anime.trailer?.embed_url || null,
    malUrl: anime.url || null,
  };
}

async function fetchAniListDetails(title) {
  const query = `
    query ($search: String) {
      Page(page: 1, perPage: 1) {
        media(search: $search, type: ANIME) {
          coverImage { large }
          description
          genres
          studios { nodes { name } }
          averageScore
          episodes
          trailer { id site }
          siteUrl
        }
      }
    }
  `;
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { search: title } }),
  });
  if (!res.ok) {
    throw new Error(`AniList error ${res.status}`);
  }
  const { data } = await res.json();
  const media = data?.Page?.media?.[0];
  if (!media) return null;

  let trailerUrl = null;
  if (media.trailer?.site === 'youtube' && media.trailer.id) {
    trailerUrl = `https://www.youtube.com/watch?v=${media.trailer.id}`;
  }

  const cleanDescription = media.description
    ? media.description.replace(/\u003cbr\u003e/g, '\n').replace(/\u003c[^\u003e]+\u003e/g, '')
    : null;

  return {
    coverImage: media.coverImage?.large || null,
    synopsis: cleanDescription,
    genres: media.genres || [],
    studios: media.studios?.nodes?.map((s) => s.name) || [],
    score: media.averageScore ? media.averageScore / 10 : null,
    episodes: media.episodes ?? null,
    trailerUrl,
    malUrl: media.siteUrl || null,
  };
}

async function fetchAnimeDetails(item, cache) {
  const key = cacheKey(item);
  const cached = cache.get(key);

  if (cached && cached.status === 'found') {
    console.log(`  ↳ cache hit`);
    return cached;
  }

  if (cached && cached.status === 'not_found') {
    console.log(`  ↳ cache not found`);
    return { ...cached, coverImage: null };
  }

  let details = null;
  let status = 'error';

  if (jikanHealthy) {
    const jikanResult = await fetchWithRetry(() => fetchJikanDetails(item.title));
    if (jikanResult.success) {
      details = jikanResult.result;
      jikanConsecutiveFailures = 0;
      status = details === null ? 'not_found' : 'found';
      console.log(`  ↳ Jikan ${details ? 'found' : 'not found'}`);
    } else {
      jikanConsecutiveFailures++;
      console.warn(`  ↳ ${jikanResult.error} for "${item.title}" (${jikanConsecutiveFailures} consecutive)`);
      if (jikanConsecutiveFailures >= JIKAN_MAX_CONSECUTIVE_FAILURES) {
        jikanHealthy = false;
        console.warn('Jikan looks unhealthy; switching to AniList for remaining items.');
      }
    }
  }

  if (!details && status !== 'not_found') {
    const anilistResult = await fetchWithRetry(() => fetchAniListDetails(item.title));
    if (anilistResult.success) {
      details = anilistResult.result;
      status = details === null ? 'not_found' : 'found';
      console.log(`  ↳ AniList ${details ? 'found' : 'not found'}`);
    } else {
      console.warn(`  ↳ ${anilistResult.error} for "${item.title}"`);
      status = 'error';
    }
  }

  const cachedEntry = {
    status,
    coverImage: details?.coverImage || null,
    synopsis: details?.synopsis || null,
    genres: details?.genres || [],
    studios: details?.studios || [],
    score: details?.score ?? null,
    episodes: details?.episodes ?? null,
    trailerUrl: details?.trailerUrl || null,
    malUrl: details?.malUrl || null,
    source: details ? 'jikan' : null,
    cachedAt: new Date().toISOString(),
  };

  cache.set(key, cachedEntry);

  return cachedEntry;
}

async function build() {
  const zipBuffer = await fetchRepoZip();
  const items = parseIndex(zipBuffer);
  const cache = await loadCache();

  console.log(`Processing ${items.length} entries...`);

  const results = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log(`[${i + 1}/${items.length}] ${item.title}`);
    const details = await fetchAnimeDetails(item, cache);

    results.push({
      title: item.title,
      season: item.season,
      year: item.year,
      url: item.downloadLink,
      downloadLink: item.downloadLink,
      coverImage: details.coverImage,
      synopsis: details.synopsis,
      genres: details.genres,
      studios: details.studios,
      score: details.score,
      episodes: details.episodes,
      trailerUrl: details.trailerUrl,
      malUrl: details.malUrl,
    });
  }

  await fs.writeFile(
    OUTPUT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        count: results.length,
        animes: results,
      },
      null,
      2
    )
  );
  await saveCache(cache);
  console.log(`\nIndex generated: ${results.length} entries in ${OUTPUT}`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
