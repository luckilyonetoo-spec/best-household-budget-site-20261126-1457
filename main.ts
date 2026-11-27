// Hearth & Ledger — the hand-in program (Node 22+, standard library only).
//
// The site is plain static files in app/ beside this file: index.html plus its
// own scripts and stylesheet, no build step, nothing loaded over the network.
// This program copies app/ and screenshots/ into the output directory and
// writes output/dossier.json, the summary the judge reads, with the vendored
// make.fun library. The library's copy in vendor/ is the kit's, unchanged:
// the scorer rebuilds the dossier with its own copy and compares the two
// byte for byte, so the dossier here must come from that library, not from
// anything hand-rolled.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps (from the kit's RULES.txt): the dossier library
// refuses anything past them, so this program checks first and fails loudly
// with the file's name instead of a library error.
const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};
const OUTPUT_MAX_ENTRIES = 1000;
const OUTPUT_MAX_BYTES = 67108864;

function fail(message) {
  throw new Error(message);
}

function countEntries(dir) {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    n += 1;
    if (entry.isDirectory()) n += countEntries(join(dir, entry.name));
  }
  return n;
}

function totalBytes(dir) {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    n += entry.isDirectory() ? totalBytes(path) : statSync(path).size;
  }
  return n;
}

function checkScreenshots(dir) {
  const names = readdirSync(dir).filter((f) => !f.startsWith('.'));
  if (names.length < 3 || names.length > 4) {
    fail(`screenshots/ must hold 3 or 4 images, found ${names.length}`);
  }
  for (const name of names) {
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(name)) {
      fail(`screenshots/${name}: name must use letters, digits, . _ - only`);
    }
    if (!/\.(png|jpe?g)$/i.test(name)) fail(`screenshots/${name}: not a PNG or JPEG`);
    const st = statSync(join(dir, name));
    if (!st.isFile()) fail(`screenshots/${name}: not a regular file`);
    if (st.size > caps.screenshots.max_bytes) {
      fail(`screenshots/${name} is ${st.size} bytes, over the 256 KiB cap`);
    }
  }
  return names;
}

function checkApp(dir) {
  const index = join(dir, 'index.html');
  if (!existsSync(index)) fail('app/index.html is missing — nothing to hand in');
  if (statSync(index).size > 1048576) fail('app/index.html is over the 1 MiB cap');
  const entries = countEntries(dir);
  if (entries > caps.app_max_files) fail(`app/ holds ${entries} entries, over the 993 cap`);
  if (totalBytes(dir) > caps.app_max_bytes) fail('app/ is over the 16 MiB cap');
  return entries;
}

// Start from an empty output directory so a stale file can never be handed in.
// Clear the directory's CONTENTS, never the directory itself: in the grader
// /output is a mounted volume, and deleting the mount point fails outright.
mkdirSync(out, { recursive: true });
for (const entry of readdirSync(out)) {
  rmSync(join(out, entry), { recursive: true, force: true });
}

cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
const shotsDir = join(here, 'screenshots');
if (existsSync(shotsDir)) cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

const appEntries = checkApp(join(out, 'app'));
const shots = checkScreenshots(join(out, 'screenshots'));

writeFileSync(join(out, 'dossier.json'), buildDossier(out, caps));

// Read the dossier back: if the write produced nothing, fail here instead
// of handing in an empty summary.
const dossierPath = join(out, 'dossier.json');
if (statSync(dossierPath).size === 0) {
  fail('dossier.json came out empty — nothing to hand in');
}

// The whole output shares the platform's cap: 1,000 entries, 64 MiB.
const outEntries = countEntries(out);
const outBytes = totalBytes(out);
if (outEntries > OUTPUT_MAX_ENTRIES) fail(`/output holds ${outEntries} entries, over the 1,000 cap`);
if (outBytes > OUTPUT_MAX_BYTES) fail(`/output is ${outBytes} bytes, over the 64 MiB cap`);

console.log(
  `handed in ${appEntries} app entries and ${shots.length} screenshots ` +
    `(${outEntries} entries, ${(outBytes / 1048576).toFixed(2)} MiB) to ${out}`,
);
