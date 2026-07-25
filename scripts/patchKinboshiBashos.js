/**
 * Kinboshi Basho Patcher
 *
 * Patches career-stats.json with per-basho kinboshi data by fetching only
 * Makuuchi banzuke (kinboshi only applies in Makuuchi — Maegashira vs Yokozuna).
 *
 * Much faster than a full rebuild: ~412 requests instead of ~2900.
 *
 * Adds two new fields per wrestler:
 *   kinboshiWonByBasho:   { [bashoId]: count }  — Maegashira wins vs Yokozuna
 *   kinboshiGivenByBasho: { [bashoId]: count }  — Yokozuna losses vs Maegashira
 *
 * Usage:
 *   node scripts/patchKinboshiBashos.js
 *   node scripts/patchKinboshiBashos.js --output path/to/career-stats.json
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PATH = path.join(__dirname, '..', 'public', 'career-stats.json');

const BASHO_MONTHS  = ['01', '03', '05', '07', '09', '11'];
const BATCH_SIZE    = 5;
const BATCH_DELAY_MS = 8_000; // 5 req/8s = ~37 req/min, under 60 limit

function parseArgs() {
  const args = process.argv.slice(2);
  let output = DEFAULT_PATH;
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--output' || args[i] === '-o') && args[i + 1]) {
      output = args[++i];
    }
  }
  return { output };
}

function generateBashoIds() {
  const ids = [];
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  for (let y = 1958; y <= cy; y++) {
    for (const m of BASHO_MONTHS) {
      if (y === cy && parseInt(m, 10) > cm) continue;
      ids.push(`${y}${m}`);
    }
  }
  return ids;
}

function fetchJson(urlPath) {
  return new Promise((resolve) => {
    const req = https.get(
      { hostname: 'www.sumo-api.com', path: urlPath, family: 4, timeout: 30_000 },
      (res) => {
        let raw = '';
        res.on('data', (c) => { raw += c; });
        res.on('end', () => {
          if (res.statusCode !== 200) { resolve(null); return; }
          try { resolve(JSON.parse(raw)); } catch { resolve(null); }
        });
      },
    );
    req.on('error',   () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function wrestlerId(obj) {
  return obj.rikishiID ?? obj.rikishiId ?? obj.id ?? null;
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function processBanzuke(bashoId, banzuke, kinboshiByWrestler) {
  if (!banzuke) return;

  const rankLookup = new Map();
  for (const w of [...(banzuke.east ?? []), ...(banzuke.west ?? [])]) {
    const id = wrestlerId(w);
    if (id && w.rank) rankLookup.set(id, w.rank);
  }

  const seen = new Set();
  for (const w of [...(banzuke.east ?? []), ...(banzuke.west ?? [])]) {
    const id = wrestlerId(w);
    if (!id || seen.has(id)) continue;
    seen.add(id);

    const rank = w.rank ?? '';
    const isMaegashira = rank.toLowerCase().startsWith('maegashira');
    const isYokozuna   = rank.toLowerCase().startsWith('yokozuna');
    if ((!isMaegashira && !isYokozuna) || !Array.isArray(w.record)) continue;

    let wonCount   = 0;
    let givenCount = 0;

    for (const match of w.record) {
      const opponentRank = rankLookup.get(match.opponentID) ?? '';
      if (isMaegashira && match.result === 'win'  && opponentRank.toLowerCase().startsWith('yokozuna')) wonCount++;
      if (isYokozuna   && match.result === 'loss' && opponentRank.toLowerCase().startsWith('maegashira')) givenCount++;
    }

    if (wonCount > 0 || givenCount > 0) {
      if (!kinboshiByWrestler.has(id)) kinboshiByWrestler.set(id, { kinboshiWonByBasho: {}, kinboshiGivenByBasho: {} });
      const entry = kinboshiByWrestler.get(id);
      if (wonCount   > 0) entry.kinboshiWonByBasho[bashoId]   = wonCount;
      if (givenCount > 0) entry.kinboshiGivenByBasho[bashoId] = givenCount;
    }
  }
}

async function main() {
  const { output } = parseArgs();

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           KINBOSHI BASHO PATCHER                             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log();

  if (!fs.existsSync(output)) {
    console.error(`career-stats.json not found at: ${output}`);
    process.exit(1);
  }

  console.log(`Loading ${output}…`);
  const existing = JSON.parse(fs.readFileSync(output, 'utf8'));
  console.log(`  ${Object.keys(existing.records ?? {}).length.toLocaleString()} wrestler records loaded.`);
  console.log();

  const bashoIds = generateBashoIds();
  const kinboshiByWrestler = new Map();
  const batches = Math.ceil(bashoIds.length / BATCH_SIZE);
  const estimatedSeconds = batches * (BATCH_DELAY_MS / 1000);

  console.log(`Fetching ${bashoIds.length} Makuuchi banzukes in batches of ${BATCH_SIZE}…`);
  console.log(`Estimated time: ${formatDuration(estimatedSeconds)}`);
  console.log();

  const startTime = Date.now();

  for (let i = 0; i < bashoIds.length; i += BATCH_SIZE) {
    const batch = bashoIds.slice(i, i + BATCH_SIZE);
    const isLast = i + BATCH_SIZE >= bashoIds.length;

    const [banzukes] = await Promise.all([
      Promise.all(batch.map((id) => fetchJson(`/api/basho/${id}/banzuke/Makuuchi`))),
      isLast ? Promise.resolve() : sleep(BATCH_DELAY_MS),
    ]);

    for (let j = 0; j < batch.length; j++) {
      processBanzuke(batch[j], banzukes[j], kinboshiByWrestler);
    }

    const done    = Math.min(i + BATCH_SIZE, bashoIds.length);
    const pct     = Math.round((done / bashoIds.length) * 100);
    const elapsed = (Date.now() - startTime) / 1000;
    const rate    = done / elapsed;
    const eta     = formatDuration(Math.round((bashoIds.length - done) / rate));
    const filled  = Math.round((pct / 100) * 20);
    const bar     = '█'.repeat(filled) + '░'.repeat(20 - filled);
    process.stdout.write(`\r[${bar}] ${pct}% (${done}/${bashoIds.length}) | ETA: ${eta}   `);
  }

  console.log('\n');
  console.log(`Found kinboshi data for ${kinboshiByWrestler.size} wrestlers.`);
  console.log('Patching career-stats.json…');

  let patched = 0;
  for (const [id, data] of kinboshiByWrestler) {
    const record = existing.records?.[String(id)];
    if (!record) continue;
    record.kinboshiWonByBasho   = data.kinboshiWonByBasho;
    record.kinboshiGivenByBasho = data.kinboshiGivenByBasho;
    patched++;
  }

  fs.writeFileSync(output, JSON.stringify(existing));
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`Patched ${patched} wrestlers. Saved in ${formatDuration(elapsed)}.`);
}

main().catch(console.error);
