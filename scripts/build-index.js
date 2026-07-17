import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '..', 'public', 'data.json');
const ZIP_URL = 'https://github.com/Avriole/AniTousen/archive/refs/heads/main.zip';

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

    const match = entry.entryName.match(
      /^AniTousen-main\/URL\/([^/]+)\/(.+)$/
    );
    if (!match) continue;

    const [season, year] = match[1].split(' ');
    const title = match[2].trim();
    const content = zip.readAsText(entry);
    const hrefMatch = content.match(/href="([^"]+)"/);

    items.push({
      title,
      season,
      year: Number(year),
      url: hrefMatch?.[1] || null,
    });
  }

  items.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  return items;
}

async function build() {
  const zipBuffer = await fetchRepoZip();
  const items = parseIndex(zipBuffer);
  await fs.writeFile(OUTPUT, JSON.stringify(items, null, 2));
  console.log(`Index generated: ${items.length} entries in ${OUTPUT}`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
