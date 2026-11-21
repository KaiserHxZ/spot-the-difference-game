# The Clockmaker’s Eye — Spot the Difference

An original spot-the-difference game in plain HTML, CSS and canvas
JavaScript. No build step, no network requests, no libraries: every picture
is drawn by the game's own code.

## The game

Two pictures sit side by side — the same room, drawn twice, with seven
small changes hiding in the second one. Click a difference on either picture
to circle it in red. Find all seven before the clock runs out, then move on
to the next room.

Three rooms, rising in difficulty:

1. **The Clockmaker's Workshop** — 2:30 on the clock, whole objects change.
2. **Lantern Night Market** — 2:00, counts and colours change.
3. **The Observatory Roof** — 1:40, single tiny marks change.

A brass pocket watch hides in every room: the clockmaker's mark.

## How to play

- **Mouse:** click a difference on either panel.
- **H** — hint (3 per room, rings the neighbourhood of one unfound difference).
- **N** — next room, once a room is complete.
- **R** — restart / retry the room.
- **M** — sound on/off.
- Wrong clicks are gentle: a soft ripple, no penalty. Finding all seven
  earns a time bonus; hints cost a little of it.

## How to run

Serve the `game/` folder with any static server and open `index.html`:

```sh
cd game
python3 -m http.server 8000
# open http://localhost:8000/
```

## Files

- `game/index.html` — the page
- `game/style.css` — the warm brass-and-ink look
- `game/scenes.js` — every picture, drawn in canvas code
- `game/differences.js` — the rooms and their seven differences each
- `game/game.js` — the rules, input, timer, scoring and screens
- `game/audio.js` — WebAudio bleeps, generated in code
- `main.ts` — the entry program: copies `game/` and `screenshots/` to the
  output directory and writes `dossier.json`
- `vendor/makefun-game.ts` — the make.fun dossier library, unchanged from the kit
