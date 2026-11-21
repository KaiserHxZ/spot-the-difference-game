// main.ts — the entry program for "The Clockmaker's Eye" (Node 22, standard
// library only). It hands the game in: it copies this repository's game/ and
// screenshots/ into the output directory and writes dossier.json there with
// buildDossier from the vendored make.fun library.
//
// The grader runs this program twice in a fresh container with no network,
// a read-only copy of the repository and a writable output directory; both
// runs must write the same bytes. Nothing here depends on the time, the
// environment or any file outside this repository, so the output is
// deterministic. Outside the grader, MAKEFUN_OUTPUT_DIR stands in for
// /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function fail(message) {
  throw new Error(`main.ts: ${message}`);
}

// The game the gate checks: index.html must exist, and the screenshots must
// be the 3 or 4 images the maker took. Refusing early keeps a broken entry
// from ever reaching the grader.
const gameDir = join(repoRoot, 'game');
if (!existsSync(join(gameDir, 'index.html'))) fail('game/index.html is missing');
const shotsDir = join(repoRoot, 'screenshots');
if (!existsSync(shotsDir)) fail('screenshots/ is missing');
const shots = readdirSync(shotsDir)
  .filter((name) => !name.startsWith('.'))
  .filter((name) => statSync(join(shotsDir, name)).isFile());
if (shots.length < 3 || shots.length > 4) fail(`expected 3 or 4 screenshots, found ${shots.length}`);
// A screenshot over the gate's 256 KiB cap would fail the entry outright.
for (const name of shots) {
  if (statSync(join(shotsDir, name)).size > 262144) fail(`screenshot ${name} is over 256 KiB`);
}
// The claim file names the wallet the entry belongs to.
const owner = JSON.parse(readFileSync(join(repoRoot, '.makefun', 'owner.json'), 'utf8'));
if (typeof owner.wallet !== 'string' || !owner.wallet) fail('.makefun/owner.json has no wallet');

mkdirSync(outputDir, { recursive: true });
cpSync(gameDir, join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });

// The scorer's own caps (see the kit's RULES.txt): only text_max_bytes shapes
// the dossier's bytes; the other limits refuse an entry the scorer would
// refuse, so a bad bundle fails here instead of silently passing on.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
