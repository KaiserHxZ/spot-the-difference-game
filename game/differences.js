// differences.js — the data behind every round of "The Clockmaker's Eye".
//
// One scene is a small world drawn twice: the left panel is the original, the
// right panel is the same world with seven small changes applied. Each
// difference carries the exact spot it lives at (panel coordinates, 560 x 420),
// the radius a click must land inside, and a plain-language label shown when
// the player finds it. The drawing code in scenes.js reads the same layout
// positions, so a difference can never drift away from the thing it describes.
//
// Difficulty rises across the three rounds: round 1 changes whole objects,
// round 2 changes counts and colours, round 3 changes single tiny marks.

export const PANEL_WIDTH = 560;
export const PANEL_HEIGHT = 420;

export const SCENES = [
  {
    id: 'workshop',
    title: "The Clockmaker's Workshop",
    subtitle: 'Round 1 · Warm-up · 2:30 on the clock',
    timeLimit: 150,
    hintText: 'Look at the wall, the bench and the window.',
    layout: {
      bigClock: { x: 120, y: 95, r: 55 },
      cuckoo: { x: 250, y: 78, w: 74, h: 88 },
      cuckooBird: { x: 250, y: 100 },
      pendulumClock: { x: 330, y: 120, w: 76, h: 200 },
      pendulumBob: { x: 368, y: 268 },
      bench: { y: 300 },
      benchGear: { x: 150, y: 306, r: 20 },
      lamp: { x: 472, y: 288 },
      mug: { x: 322, y: 300 },
      window: { x: 428, y: 38, w: 104, h: 112 },
      moon: { x: 480, y: 86, r: 16 },
      shelf: { y: 186 },
      shelfJars: [55, 95, 135],
      pocketWatch: { x: 258, y: 336 },
    },
    differences: [
      { id: 'hour-hand', x: 120, y: 95, r: 30, label: 'The big clock shows a different hour' },
      { id: 'cuckoo-bird', x: 250, y: 100, r: 22, label: 'The cuckoo has flown out — or back in' },
      { id: 'bench-gear', x: 150, y: 306, r: 26, label: 'A gear is missing from the bench' },
      { id: 'lamp-glow', x: 472, y: 288, r: 30, label: 'The desk lamp is lit — or it is not' },
      { id: 'mug-colour', x: 322, y: 300, r: 20, label: 'The mug changed colour' },
      { id: 'moon-star', x: 480, y: 86, r: 22, label: 'The moon in the window became a star' },
      { id: 'shelf-jar', x: 95, y: 168, r: 20, label: 'One jar is gone from the shelf' },
    ],
  },
  {
    id: 'market',
    title: 'Lantern Night Market',
    subtitle: 'Round 2 · Busier · 2:00 on the clock',
    timeLimit: 120,
    hintText: 'Count the fruit, watch the lanterns and the steam.',
    layout: {
      lanterns: [
        { x: 60, y: 80 }, { x: 150, y: 72 }, { x: 240, y: 68 },
        { x: 330, y: 68 }, { x: 420, y: 74 }, { x: 510, y: 82 },
      ],
      fruitStall: { x: 28, y: 205, w: 200, h: 135 },
      oranges: { x: 86, y: 284, r: 30 },
      apples: { x: 168, y: 288, r: 26 },
      noodleCart: { x: 330, y: 210, w: 200, h: 130 },
      steam: { x: 432, y: 232 },
      sign: { x: 285, y: 118, w: 62, h: 42 },
      bicycle: { wheels: [{ x: 228, y: 366 }, { x: 296, y: 366 }], bell: { x: 258, y: 320 } },
      vendor: { x: 126, y: 178 },
      vendorHat: { x: 126, y: 152 },
      pocketWatch: { x: 216, y: 152 },
    },
    differences: [
      { id: 'lantern-colour', x: 240, y: 68, r: 20, label: 'One lantern changed colour' },
      { id: 'orange-count', x: 86, y: 284, r: 28, label: 'An orange is missing from the pile' },
      { id: 'steam', x: 432, y: 232, r: 26, label: 'The noodle pot stopped steaming' },
      { id: 'sign-symbol', x: 285, y: 118, r: 24, label: 'The sign shows a different symbol' },
      { id: 'bike-bell', x: 258, y: 320, r: 16, label: 'The bicycle bell is gone' },
      { id: 'paper-lantern', x: 420, y: 74, r: 18, label: 'A paper lantern is missing from the string' },
      { id: 'vendor-hat', x: 126, y: 152, r: 22, label: 'The ribbon on the vendor’s hat changed' },
    ],
  },
  {
    id: 'observatory',
    title: 'The Observatory Roof',
    subtitle: 'Round 3 · Night watch · 1:40 on the clock',
    timeLimit: 100,
    hintText: 'Tiny marks now: one star, one crater, one glance.',
    layout: {
      moon: { x: 486, y: 68, r: 22 },
      comet: { head: { x: 122, y: 76 }, tailTip: { x: 58, y: 112 } },
      dome: { x: 160, y: 330, r: 112 },
      domeSlit: { x: 160, y: 238 },
      telescope: { pivot: { x: 352, y: 262 } },
      chart: { x: 396, y: 268, w: 74, h: 48 },
      chartStar: { x: 446, y: 282 },
      mug: { x: 516, y: 322 },
      owl: { x: 276, y: 172 },
      pocketWatch: { x: 470, y: 344 },
    },
    differences: [
      { id: 'moon-crater', x: 486, y: 68, r: 26, label: 'The moon lost a crater' },
      { id: 'comet-star', x: 122, y: 76, r: 20, label: 'A small star beside the comet is gone' },
      { id: 'dome-slit', x: 160, y: 238, r: 26, label: 'The dome’s slit is shut' },
      { id: 'telescope-angle', x: 396, y: 224, r: 28, label: 'The telescope points somewhere else' },
      { id: 'chart-star', x: 446, y: 282, r: 16, label: 'One star is missing from the chart' },
      { id: 'mug-steam', x: 516, y: 298, r: 20, label: 'The cocoa stopped steaming' },
      { id: 'owl-eyes', x: 276, y: 172, r: 18, label: 'The owl blinked — eyes open, eyes shut' },
    ],
  },
];

// A tiny deterministic random source so both panels share one identical sky.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fixed star fields, one per scene, drawn identically on both panels.
export function starField(seed, count, width, height, top) {
  const rand = mulberry32(seed);
  const stars = [];
  for (let i = 0; i < count; i += 1) {
    stars.push({
      x: 12 + rand() * (width - 24),
      y: 8 + rand() * (top - 16),
      r: 0.7 + rand() * 1.4,
      phase: rand() * Math.PI * 2,
    });
  }
  return stars;
}
