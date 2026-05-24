/**
 * Career Stats Generator
 *
 * Scans all historical bashos to build a per-wrestler career statistics file.
 * For each basho it fires 7 parallel requests (1 results + 6 banzuke), then
 * waits BATCH_DELAY_MS before the next basho — keeping the effective request
 * rate well under the API's 60 req/min limit.
 *
 * Aggregated per wrestler:
 *   - yusho wins (all divisions)
 *   - special prize counts (shukunsho, kantosho, ginosho)
 *   - career wins / losses / absences
 *   - basho count per division
 *
 * Output: public/career-stats.json
 *
 * Usage:
 *   node scripts/generateCareerStats.js [options]
 *
 * Options:
 *   --start, -s <year>    Start year for full scan (default: 1958)
 *   --end, -e <year>      End year (default: current year)
 *   --output, -o <path>   Output path (default: public/career-stats.json)
 *   --incremental, -i     Load existing file and process only new bashos
 *   --help, -h            Show this message
 *
 * Examples:
 *   node scripts/generateCareerStats.js                  # full rebuild
 *   node scripts/generateCareerStats.js --incremental    # add latest basho only
 *   node scripts/generateCareerStats.js -s 2020          # rebuild from 2020
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUTPUT = path.join(__dirname, '..', 'public', 'career-stats.json');

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_DIVISIONS = ['Makuuchi', 'Juryo', 'Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi'];
const BASHO_MONTHS  = ['01', '03', '05', '07', '09', '11'];

// Each batch fires 7 requests concurrently (1 results + 6 banzuke).
// BATCH_DELAY_MS runs in parallel with those requests, so effective wall-clock
// rate = 7 / BATCH_DELAY_MS * 60000 req/min ≈ 35 req/min (safely under 60).
const BATCH_DELAY_MS = 12_000;

// ─── CLI ──────────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    startYear:   1958,
    endYear:     new Date().getFullYear(),
    output:      DEFAULT_OUTPUT,
    incremental: false,
    help:        false,
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i], n = args[i + 1];
    switch (a) {
      case '--start':  case '-s': if (n && !n.startsWith('-')) { opts.startYear   = parseInt(n, 10); i++; } break;
      case '--end':    case '-e': if (n && !n.startsWith('-')) { opts.endYear     = parseInt(n, 10); i++; } break;
      case '--output': case '-o': if (n && !n.startsWith('-')) { opts.output      = n;              i++; } break;
      case '--incremental': case '-i': opts.incremental = true; break;
      case '--help':   case '-h': opts.help = true; break;
    }
  }
  return opts;
}

function showHelp() {
  console.log(`
Sumo Career Stats Generator

Usage:
  node scripts/generateCareerStats.js [options]

Options:
  --start, -s <year>    Start year for full scan (default: 1958)
  --end, -e <year>      End year (default: ${new Date().getFullYear()})
  --output, -o <path>   Output path (default: public/career-stats.json)
  --incremental, -i     Load existing file and process only new bashos
  --help, -h            Show this help

Examples:
  node scripts/generateCareerStats.js
  node scripts/generateCareerStats.js --incremental
  node scripts/generateCareerStats.js -s 2020 -e 2024
`);
}

// ─── Basho ID helpers ─────────────────────────────────────────────────────────

function generateBashoIds(startYear, endYear) {
  const ids = [];
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;

  for (let y = startYear; y <= endYear; y++) {
    for (const m of BASHO_MONTHS) {
      if (y === cy && parseInt(m, 10) > cm) continue;
      ids.push(`${y}${m}`);
    }
  }
  return ids;
}

function formatBashoId(id) {
  const names = { '01': 'Jan', '03': 'Mar', '05': 'May', '07': 'Jul', '09': 'Sep', '11': 'Nov' };
  return `${names[id.slice(4)] ?? id.slice(4)} ${id.slice(0, 4)}`;
}

// ─── Formatting ───────────────────────────────────────────────────────────────

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function printProgress(current, total, startTime, bashoId) {
  const pct     = Math.round((current / total) * 100);
  const elapsed = (Date.now() - startTime) / 1000;
  const rate    = current / elapsed;
  const eta     = formatDuration(Math.round((total - current) / rate));
  const filled  = Math.round((pct / 100) * 20);
  const bar     = '█'.repeat(filled) + '░'.repeat(20 - filled);
  process.stdout.write(
    `\r[${bar}] ${pct}% (${current}/${total}) | ${formatBashoId(bashoId)} | ETA: ${eta}   `,
  );
}

// ─── HTTP ─────────────────────────────────────────────────────────────────────

function fetchJson(urlPath) {
  return new Promise((resolve) => {
    const req = https.get(
      { hostname: 'www.sumo-api.com', path: urlPath, family: 4, timeout: 30_000 },
      (res) => {
        let raw = '';
        res.on('data', (c) => { raw += c; });
        res.on('end', () => {
          if (res.statusCode === 404) { resolve(null); return; }
          if (res.statusCode !== 200) { resolve(null); return; }
          try { resolve(JSON.parse(raw)); } catch { resolve(null); }
        });
      },
    );
    req.on('error',   () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Record helpers ───────────────────────────────────────────────────────────

function ensureRecord(records, id) {
  if (!records.has(id)) {
    records.set(id, {
      yusho: 0, yushoByDivision: {}, shukunsho: 0, kantosho: 0, ginosho: 0,
      totalWins: 0, totalLosses: 0, totalAbsences: 0,
      bashosByDivision: {},
    });
  }
  return records.get(id);
}

// Banzuke wrestlers use rikishiID (uppercase); results use rikishiId (lowercase)
function wrestlerId(obj) {
  return obj.rikishiID ?? obj.rikishiId ?? obj.id ?? null;
}

// ─── Per-basho processing ─────────────────────────────────────────────────────

async function processBasho(bashoId, records) {
  const [results, ...banzukes] = await Promise.all([
    fetchJson(`/api/basho/${bashoId}`),
    ...ALL_DIVISIONS.map((d) => fetchJson(`/api/basho/${bashoId}/banzuke/${d}`)),
  ]);

  // Yusho winners (one per division, keyed by type = division name)
  for (const y of results?.yusho ?? []) {
    const id = wrestlerId(y);
    if (!id) continue;
    const r = ensureRecord(records, id);
    r.yusho++;
    if (y.type) r.yushoByDivision[y.type] = (r.yushoByDivision[y.type] ?? 0) + 1;
  }

  // Special prizes (Makuuchi only in practice)
  for (const p of results?.specialPrizes ?? []) {
    const id = wrestlerId(p);
    if (!id) continue;
    const r = ensureRecord(records, id);
    if      (p.type === 'Shukun-sho') r.shukunsho++;
    else if (p.type === 'Kanto-sho')  r.kantosho++;
    else if (p.type === 'Gino-sho')   r.ginosho++;
  }

  // Banzuke — wins/losses/absences and division appearance counts
  for (let i = 0; i < ALL_DIVISIONS.length; i++) {
    const division = ALL_DIVISIONS[i];
    const banzuke  = banzukes[i];
    if (!banzuke) continue;

    const wrestlers = [...(banzuke.east ?? []), ...(banzuke.west ?? [])];
    const seen = new Set();

    for (const w of wrestlers) {
      const id = wrestlerId(w);
      if (!id || seen.has(id)) continue; // skip duplicates (east/west overlap guard)
      seen.add(id);

      const r = ensureRecord(records, id);
      r.totalWins     += w.wins     ?? 0;
      r.totalLosses   += w.losses   ?? 0;
      r.totalAbsences += w.absences ?? 0;
      r.bashosByDivision[division] = (r.bashosByDivision[division] ?? 0) + 1;
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();
  if (opts.help) { showHelp(); return; }

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           SUMO CAREER STATS GENERATOR                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log();

  // ── Load existing data in incremental mode ──────────────────────────────────
  const records = new Map();
  let rangeStart  = null; // earliest bashoId in the final output
  let lastBashoId = null; // latest bashoId already processed

  if (opts.incremental && fs.existsSync(opts.output)) {
    console.log('Incremental mode — loading existing career-stats.json…');
    const existing = JSON.parse(fs.readFileSync(opts.output, 'utf8'));

    for (const [id, stats] of Object.entries(existing.records ?? {})) {
      records.set(Number(id), {
        ...stats,
        yushoByDivision: { ...(stats.yushoByDivision ?? {}) },
        bashosByDivision: { ...(stats.bashosByDivision ?? {}) },
      });
    }

    rangeStart  = existing.bashoRange?.start ?? null;
    lastBashoId = existing.lastBashoId       ?? null;

    console.log(`  Loaded ${records.size.toLocaleString()} wrestler records.`);
    if (lastBashoId) console.log(`  Last processed basho: ${lastBashoId} (${formatBashoId(lastBashoId)})`);
    console.log();
  }

  // ── Determine which bashos to scan ──────────────────────────────────────────
  let bashoIds = generateBashoIds(opts.startYear, opts.endYear);

  if (opts.incremental && lastBashoId) {
    bashoIds = bashoIds.filter((id) => id > lastBashoId);
  }

  if (bashoIds.length === 0) {
    console.log('Nothing to do — career stats are already up to date.');
    return;
  }

  if (!rangeStart) rangeStart = bashoIds[0];

  const estimated = formatDuration(bashoIds.length * (BATCH_DELAY_MS / 1000));
  console.log(`Bashos to process : ${bashoIds.length}`);
  console.log(`Batch delay       : ${BATCH_DELAY_MS / 1000}s (7 parallel req/batch ≈ 35 req/min)`);
  console.log(`Estimated time    : ${estimated}`);
  console.log();

  // ── Scan ────────────────────────────────────────────────────────────────────
  const startTime = Date.now();
  let processedLast = lastBashoId;

  for (let i = 0; i < bashoIds.length; i++) {
    const bashoId = bashoIds[i];
    const isLast  = i === bashoIds.length - 1;

    // Fire all 7 requests for this basho in parallel; delay runs concurrently
    await Promise.all([
      processBasho(bashoId, records),
      isLast ? Promise.resolve() : sleep(BATCH_DELAY_MS),
    ]);

    processedLast = bashoId;
    printProgress(i + 1, bashoIds.length, startTime, bashoId);
  }

  console.log('\n');

  // ── Write output ─────────────────────────────────────────────────────────────
  const output = {
    generated:   new Date().toISOString(),
    lastBashoId: processedLast,
    bashoRange:  { start: rangeStart, end: processedLast },
    wrestlerCount: records.size,
    records: Object.fromEntries(
      [...records.entries()]
        .sort(([a], [b]) => a - b)
        .map(([id, stats]) => [String(id), stats]),
    ),
  };

  fs.writeFileSync(opts.output, JSON.stringify(output, null, 2));

  const elapsed = formatDuration((Date.now() - startTime) / 1000);
  console.log(`✓  Wrote ${records.size.toLocaleString()} wrestlers → ${opts.output}`);
  console.log(`   Basho range : ${rangeStart} → ${processedLast}`);
  console.log(`   Time elapsed: ${elapsed}`);
  console.log();
}

main().catch((err) => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
