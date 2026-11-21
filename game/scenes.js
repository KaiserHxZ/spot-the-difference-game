// scenes.js — every picture in the game, drawn by hand in canvas code.
//
// drawScene(ctx, scene, mods, time) paints one panel. `mods` is the set of
// difference ids to apply, so the left panel is drawn with an empty set and
// the right panel with all seven — the two pictures are the same drawing
// function with seven small switches flipped. `time` (seconds) drives the
// gentle motion: the pendulum, the lantern sway, the twinkling stars.
//
// Nothing here loads an image or a font from anywhere: every shape, colour
// and letter is drawn by this file.

import { PANEL_WIDTH, PANEL_HEIGHT, starField } from './differences.js';

const W = PANEL_WIDTH;
const H = PANEL_HEIGHT;

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h) {
  ctx.fillRect(x, y, w, h);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function poly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function drawStar(ctx, x, y, r, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawGear(ctx, x, y, r, teeth, colour) {
  ctx.fillStyle = colour;
  ctx.strokeStyle = colour;
  ctx.lineWidth = 3;
  for (let i = 0; i < teeth; i += 1) {
    const a = (i / teeth) * Math.PI * 2;
    line(ctx, x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8,
      x + Math.cos(a) * r * 1.25, y + Math.sin(a) * r * 1.25);
  }
  circle(ctx, x, y, r * 0.85);
  ctx.fillStyle = '#2c2118';
  circle(ctx, x, y, r * 0.3);
}

function drawClockFace(ctx, x, y, r, hourAngle, minuteAngle) {
  ctx.fillStyle = '#fdf6e3';
  circle(ctx, x, y, r);
  ctx.strokeStyle = '#5a3d24';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#5a3d24';
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    circle(ctx, x + Math.cos(a) * (r - 8), y + Math.sin(a) * (r - 8), i % 3 === 0 ? 2.6 : 1.4);
  }
  ctx.strokeStyle = '#2c2118';
  ctx.lineCap = 'round';
  ctx.lineWidth = 5;
  line(ctx, x, y, x + Math.cos(hourAngle) * r * 0.5, y + Math.sin(hourAngle) * r * 0.5);
  ctx.lineWidth = 3;
  line(ctx, x, y, x + Math.cos(minuteAngle) * r * 0.78, y + Math.sin(minuteAngle) * r * 0.78);
  ctx.fillStyle = '#b3402a';
  circle(ctx, x, y, 3.5);
}

function drawPocketWatch(ctx, x, y) {
  // The brass pocket watch that turns up in every room: the clockmaker's mark.
  ctx.strokeStyle = '#8a6d2f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y - 16, 7, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = '#d9a441';
  circle(ctx, x, y, 13);
  ctx.strokeStyle = '#8a6d2f';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#fdf6e3';
  circle(ctx, x, y, 10);
  ctx.strokeStyle = '#2c2118';
  ctx.lineWidth = 1.6;
  line(ctx, x, y, x + 3, y - 6);
  line(ctx, x, y, x - 5, y + 2);
}

function drawStars(ctx, stars, time) {
  for (const s of stars) {
    const twinkle = 0.55 + 0.45 * Math.sin(time * 1.6 + s.phase);
    ctx.fillStyle = `rgba(255, 244, 200, ${twinkle.toFixed(3)})`;
    circle(ctx, s.x, s.y, s.r);
  }
}

function drawSteam(ctx, x, y, time, present) {
  if (!present) return;
  ctx.strokeStyle = 'rgba(240, 240, 245, 0.75)';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i += 1) {
    const sway = Math.sin(time * 1.4 + i * 2.1) * 4;
    ctx.beginPath();
    ctx.moveTo(x - 8 + i * 8, y);
    ctx.bezierCurveTo(
      x - 12 + i * 8 + sway, y - 10,
      x + 2 + i * 8 - sway, y - 18,
      x - 4 + i * 8 + sway, y - 28,
    );
    ctx.stroke();
  }
}

// ---------------------------------------------------------------- workshop
const WORKSHOP_STARS = starField(11, 14, W, H, 120);

function drawWorkshop(ctx, scene, mods, time) {
  const L = scene.layout;
  // Room: warm plaster wall, wooden floor.
  const wall = ctx.createLinearGradient(0, 0, 0, 330);
  wall.addColorStop(0, '#f3dfba');
  wall.addColorStop(1, '#e8c795');
  ctx.fillStyle = wall;
  rect(ctx, 0, 0, W, 330);
  ctx.fillStyle = '#9a6b3f';
  rect(ctx, 0, 330, W, 90);
  ctx.fillStyle = '#8a5a33';
  for (let y = 350; y < H; y += 22) rect(ctx, 0, y, W, 2);
  // Rug.
  ctx.fillStyle = '#a63a2e';
  ellipse(ctx, 280, 392, 150, 18);
  ctx.fillStyle = '#d9a441';
  ellipse(ctx, 280, 392, 110, 12);
  ctx.fillStyle = '#a63a2e';
  ellipse(ctx, 280, 392, 70, 7);

  // Window with the night sky.
  ctx.fillStyle = '#2e3a5c';
  rect(ctx, L.window.x, L.window.y, L.window.w, L.window.h);
  drawStars(ctx, WORKSHOP_STARS.filter((s) => s.x > L.window.x && s.x < L.window.x + L.window.w), time);
  if (mods.has('moon-star')) {
    ctx.fillStyle = '#ffe9a3';
    drawStar(ctx, L.moon.x, L.moon.y, 13);
  } else {
    ctx.fillStyle = '#ffe9a3';
    circle(ctx, L.moon.x, L.moon.y, L.moon.r);
    ctx.fillStyle = '#e8cf8a';
    circle(ctx, L.moon.x - 5, L.moon.y - 3, 3);
    circle(ctx, L.moon.x + 5, L.moon.y + 5, 2.2);
  }
  ctx.strokeStyle = '#5a3d24';
  ctx.lineWidth = 5;
  ctx.strokeRect(L.window.x, L.window.y, L.window.w, L.window.h);
  line(ctx, L.window.x + L.window.w / 2, L.window.y, L.window.x + L.window.w / 2, L.window.y + L.window.h);
  line(ctx, L.window.x, L.window.y + L.window.h / 2, L.window.x + L.window.w, L.window.y + L.window.h / 2);

  // Big wall clock. The hour hand points at three — or at five.
  const hourAngle = mods.has('hour-hand') ? -Math.PI / 6 : Math.PI / 6;
  drawClockFace(ctx, L.bigClock.x, L.bigClock.y, L.bigClock.r, hourAngle, -Math.PI / 2.4);

  // Cuckoo clock with its little bird.
  ctx.fillStyle = '#6b4423';
  roundRect(ctx, L.cuckoo.x - L.cuckoo.w / 2, L.cuckoo.y - L.cuckoo.h / 2, L.cuckoo.w, L.cuckoo.h, 6);
  ctx.fillStyle = '#4a2d16';
  poly(ctx, [
    [L.cuckoo.x - L.cuckoo.w / 2 - 6, L.cuckoo.y - L.cuckoo.h / 2],
    [L.cuckoo.x + L.cuckoo.w / 2 + 6, L.cuckoo.y - L.cuckoo.h / 2],
    [L.cuckoo.x, L.cuckoo.y - L.cuckoo.h / 2 - 26],
  ]);
  ctx.fillStyle = '#fdf6e3';
  circle(ctx, L.cuckoo.x, L.cuckoo.y + 18, 20);
  ctx.strokeStyle = '#5a3d24';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(L.cuckoo.x, L.cuckoo.y + 18, 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#2c2118';
  ctx.lineWidth = 2;
  line(ctx, L.cuckoo.x, L.cuckoo.y + 18, L.cuckoo.x + 6, L.cuckoo.y + 6);
  line(ctx, L.cuckoo.x, L.cuckoo.y + 18, L.cuckoo.x - 4, L.cuckoo.y + 2);
  if (mods.has('cuckoo-bird')) {
    // The bird has flown: the little door stands shut.
    ctx.fillStyle = '#4a2d16';
    circle(ctx, L.cuckooBird.x, L.cuckooBird.y, 10);
  } else {
    ctx.fillStyle = '#3f7d5a';
    circle(ctx, L.cuckooBird.x, L.cuckooBird.y, 10);
    ctx.fillStyle = '#2c2118';
    circle(ctx, L.cuckooBird.x - 3, L.cuckooBird.y - 2, 1.6);
    circle(ctx, L.cuckooBird.x + 3, L.cuckooBird.y - 2, 1.6);
    ctx.fillStyle = '#e8a33d';
    poly(ctx, [
      [L.cuckooBird.x + 8, L.cuckooBird.y],
      [L.cuckooBird.x + 14, L.cuckooBird.y + 2],
      [L.cuckooBird.x + 8, L.cuckooBird.y + 4],
    ]);
  }
  ctx.strokeStyle = '#8a6d2f';
  ctx.lineWidth = 2;
  line(ctx, L.cuckoo.x - 8, L.cuckoo.y + L.cuckoo.h / 2, L.cuckoo.x - 8, L.cuckoo.y + L.cuckoo.h / 2 + 22);
  line(ctx, L.cuckoo.x + 8, L.cuckoo.y + L.cuckoo.h / 2, L.cuckoo.x + 8, L.cuckoo.y + L.cuckoo.h / 2 + 30);
  ctx.fillStyle = '#d9a441';
  circle(ctx, L.cuckoo.x - 8, L.cuckoo.y + L.cuckoo.h / 2 + 26, 5);
  circle(ctx, L.cuckoo.x + 8, L.cuckoo.y + L.cuckoo.h / 2 + 34, 5);

  // Grandfather clock with a swinging pendulum.
  ctx.fillStyle = '#5a3d24';
  roundRect(ctx, L.pendulumClock.x, L.pendulumClock.y, L.pendulumClock.w, L.pendulumClock.h, 8);
  ctx.fillStyle = '#fdf6e3';
  circle(ctx, L.pendulumClock.x + 38, L.pendulumClock.y + 34, 24);
  ctx.strokeStyle = '#3a2412';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(L.pendulumClock.x + 38, L.pendulumClock.y + 34, 24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#2c2118';
  line(ctx, L.pendulumClock.x + 38, L.pendulumClock.y + 34, L.pendulumClock.x + 44, L.pendulumClock.y + 22);
  line(ctx, L.pendulumClock.x + 38, L.pendulumClock.y + 34, L.pendulumClock.x + 30, L.pendulumClock.y + 18);
  const swing = Math.sin(time * 1.1) * 0.22;
  const bobX = L.pendulumBob.x + Math.sin(swing) * 46;
  const bobY = L.pendulumBob.y + (1 - Math.cos(swing)) * 46;
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 3;
  line(ctx, L.pendulumClock.x + 38, L.pendulumClock.y + 70, bobX, bobY);
  ctx.fillStyle = '#d9a441';
  circle(ctx, bobX, bobY, 13);
  ctx.strokeStyle = '#8a6d2f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(bobX, bobY, 13, 0, Math.PI * 2);
  ctx.stroke();

  // Shelf with three jars; one may be missing.
  ctx.fillStyle = '#6b4423';
  rect(ctx, 28, L.shelf.y, 180, 8);
  ctx.fillStyle = '#7fb069';
  roundRect(ctx, L.shelfJars[0] - 13, L.shelf.y - 26, 26, 26, 5);
  if (!mods.has('shelf-jar')) {
    ctx.fillStyle = '#4a7fb5';
    roundRect(ctx, L.shelfJars[1] - 13, L.shelf.y - 26, 26, 26, 5);
  }
  ctx.fillStyle = '#c96f4a';
  roundRect(ctx, L.shelfJars[2] - 13, L.shelf.y - 26, 26, 26, 5);
  ctx.fillStyle = '#2c2118';
  circle(ctx, L.shelfJars[0], L.shelf.y - 30, 3);
  circle(ctx, L.shelfJars[2], L.shelf.y - 30, 3);

  // Workbench.
  ctx.fillStyle = '#7a5230';
  rect(ctx, 16, L.bench.y, W - 32, 14);
  ctx.fillStyle = '#6b4423';
  rect(ctx, 30, L.bench.y + 14, 12, 46);
  rect(ctx, W - 42, L.bench.y + 14, 12, 46);
  // Gears on the bench; one may be gone.
  if (!mods.has('bench-gear')) drawGear(ctx, L.benchGear.x, L.benchGear.y, L.benchGear.r, 8, '#d9a441');
  drawGear(ctx, 205, 312, 15, 7, '#b9b9c4');
  drawGear(ctx, 248, 314, 11, 6, '#c98a3d');
  // The clockmaker's mug: red, or blue.
  ctx.fillStyle = mods.has('mug-colour') ? '#3d6fb4' : '#b3402a';
  roundRect(ctx, L.mug.x - 12, L.mug.y - 14, 24, 26, 4);
  ctx.strokeStyle = mods.has('mug-colour') ? '#3d6fb4' : '#b3402a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(L.mug.x + 14, L.mug.y - 2, 7, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  // Desk lamp with a warm cone of light — or a dark room.
  ctx.fillStyle = '#2c2118';
  rect(ctx, L.lamp.x - 3, L.lamp.y - 6, 6, 26);
  ctx.fillStyle = '#3d6fb4';
  poly(ctx, [[L.lamp.x - 20, L.lamp.y - 6], [L.lamp.x + 20, L.lamp.y - 6], [L.lamp.x, L.lamp.y - 30]]);
  if (mods.has('lamp-glow')) {
    ctx.fillStyle = 'rgba(255, 214, 130, 0.20)';
    poly(ctx, [[L.lamp.x - 14, L.lamp.y - 6], [L.lamp.x + 14, L.lamp.y - 6], [L.lamp.x + 34, L.lamp.y + 34], [L.lamp.x - 34, L.lamp.y + 34]]);
    ctx.fillStyle = '#ffe9a3';
    circle(ctx, L.lamp.x, L.lamp.y - 10, 5);
  }
  drawPocketWatch(ctx, L.pocketWatch.x, L.pocketWatch.y);
}

// ------------------------------------------------------------------- market
function drawLantern(ctx, x, y, colour, sway) {
  ctx.strokeStyle = '#2c2118';
  ctx.lineWidth = 1.6;
  line(ctx, x, y - 26, x, y - 8);
  ctx.fillStyle = colour;
  ellipse(ctx, x, y + sway, 13, 16);
  ctx.fillStyle = '#e8a33d';
  rect(ctx, x - 13, y - 2 + sway, 26, 3);
  rect(ctx, x - 13, y + 10 + sway, 26, 3);
  ctx.fillStyle = '#8a1f16';
  rect(ctx, x - 4, y - 8 + sway, 8, 4);
  rect(ctx, x - 4, y + 14 + sway, 8, 4);
}

function drawMarket(ctx, scene, mods, time) {
  const L = scene.layout;
  // Dusk sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#3a2b5c');
  sky.addColorStop(0.6, '#8a4a6b');
  sky.addColorStop(1, '#e08a4a');
  ctx.fillStyle = sky;
  rect(ctx, 0, 0, W, 300);
  ctx.fillStyle = '#ffe9a3';
  circle(ctx, 505, 60, 20);
  ctx.fillStyle = '#f2c96b';
  circle(ctx, 497, 54, 4);
  circle(ctx, 512, 66, 3);
  // Rooftops far away.
  ctx.fillStyle = '#2c2140';
  poly(ctx, [[0, 300], [0, 240], [90, 240], [120, 300]]);
  poly(ctx, [[440, 300], [470, 230], [560, 230], [560, 300]]);
  ctx.fillStyle = '#241a36';
  rect(ctx, 0, 300, W, 120);
  // Lantern strings across the street.
  ctx.strokeStyle = '#241a36';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 46);
  ctx.quadraticCurveTo(W / 2, 78, W, 50);
  ctx.stroke();
  L.lanterns.forEach((lan, i) => {
    if (lan.x === 420 && mods.has('paper-lantern')) return; // one lantern missing
    const sway = Math.sin(time * 0.9 + i) * 2.5;
    const colour = lan.x === 240 && mods.has('lantern-colour') ? '#e8c33d' : '#c93a2e';
    drawLantern(ctx, lan.x, lan.y, colour, sway);
  });

  // The vendor behind the fruit stall.
  ctx.fillStyle = '#f2c9a0';
  circle(ctx, L.vendor.x, L.vendor.y, 16);
  ctx.fillStyle = '#2c2118';
  circle(ctx, L.vendor.x - 6, L.vendor.y - 2, 1.8);
  circle(ctx, L.vendor.x + 6, L.vendor.y - 2, 1.8);
  ctx.strokeStyle = '#2c2118';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(L.vendor.x, L.vendor.y + 4, 6, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = '#e8c33d';
  poly(ctx, [[L.vendor.x - 26, L.vendorHat.y + 2], [L.vendor.x + 26, L.vendorHat.y + 2], [L.vendor.x, L.vendorHat.y - 18]]);
  ctx.fillStyle = mods.has('vendor-hat') ? '#3d6fb4' : '#b3402a';
  rect(ctx, L.vendor.x - 20, L.vendorHat.y - 2, 40, 5);
  ctx.fillStyle = '#4a7fb5';
  roundRect(ctx, L.vendor.x - 26, L.vendor.y + 16, 52, 44, 8);

  // Fruit stall with its striped awning.
  ctx.fillStyle = '#c93a2e';
  poly(ctx, [[L.fruitStall.x, L.fruitStall.y], [L.fruitStall.x + L.fruitStall.w, L.fruitStall.y], [L.fruitStall.x + L.fruitStall.w - 12, L.fruitStall.y + 26], [L.fruitStall.x + 12, L.fruitStall.y + 26]]);
  ctx.fillStyle = '#fdf6e3';
  for (let i = 0; i < 5; i += 1) {
    poly(ctx, [
      [L.fruitStall.x + 8 + i * 40, L.fruitStall.y],
      [L.fruitStall.x + 28 + i * 40, L.fruitStall.y],
      [L.fruitStall.x + 24 + i * 40, L.fruitStall.y + 26],
      [L.fruitStall.x + 12 + i * 40, L.fruitStall.y + 26],
    ]);
  }
  ctx.fillStyle = '#6b4423';
  rect(ctx, L.fruitStall.x, L.fruitStall.y + 26, L.fruitStall.w, 8);
  ctx.fillStyle = '#8a5a33';
  rect(ctx, L.fruitStall.x + 10, L.fruitStall.y + 34, L.fruitStall.w - 20, 100);
  // Baskets of fruit.
  ctx.fillStyle = '#a8642f';
  ellipse(ctx, L.oranges.x, L.oranges.y + 16, 42, 12);
  const orangeCount = mods.has('orange-count') ? 4 : 5;
  ctx.fillStyle = '#e8852a';
  const orangeSpots = [[-22, 8], [-8, 2], [6, 8], [20, 4], [-2, -8]];
  for (let i = 0; i < orangeCount; i += 1) circle(ctx, L.oranges.x + orangeSpots[i][0], L.oranges.y + orangeSpots[i][1], 10);
  ctx.fillStyle = '#3f7d5a';
  circle(ctx, L.oranges.x - 2, L.oranges.y - 16, 3);
  ctx.fillStyle = '#a8642f';
  ellipse(ctx, L.apples.x, L.apples.y + 14, 38, 11);
  ctx.fillStyle = '#b3402a';
  [[-18, 6], [-4, 0], [10, 6], [-10, -8], [16, -4]].forEach(([dx, dy]) => circle(ctx, L.apples.x + dx, L.apples.y + dy, 9));

  // Noodle cart with its steaming pot.
  ctx.fillStyle = '#2f6b4a';
  poly(ctx, [[L.noodleCart.x, L.noodleCart.y], [L.noodleCart.x + L.noodleCart.w, L.noodleCart.y], [L.noodleCart.x + L.noodleCart.w - 12, L.noodleCart.y + 24], [L.noodleCart.x + 12, L.noodleCart.y + 24]]);
  ctx.fillStyle = '#fdf6e3';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('NOODLES', L.noodleCart.x + L.noodleCart.w / 2, L.noodleCart.y + 18);
  ctx.fillStyle = '#5a3d24';
  rect(ctx, L.noodleCart.x + 8, L.noodleCart.y + 24, L.noodleCart.w - 16, 104);
  ctx.fillStyle = '#3a3a44';
  ellipse(ctx, 432, 268, 34, 10);
  ctx.fillStyle = '#d9a441';
  ellipse(ctx, 432, 264, 30, 7);
  drawSteam(ctx, L.steam.x, L.steam.y, time, !mods.has('steam'));
  // Hanging sign: a star — or a crescent moon.
  ctx.strokeStyle = '#2c2118';
  ctx.lineWidth = 2;
  line(ctx, L.sign.x, L.sign.y - 34, L.sign.x, L.sign.y - L.sign.h / 2);
  ctx.fillStyle = '#fdf6e3';
  roundRect(ctx, L.sign.x - L.sign.w / 2, L.sign.y - L.sign.h / 2, L.sign.w, L.sign.h, 6);
  ctx.strokeStyle = '#5a3d24';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(L.sign.x - L.sign.w / 2, L.sign.y - L.sign.h / 2, L.sign.w, L.sign.h);
  if (mods.has('sign-symbol')) {
    ctx.fillStyle = '#e8c33d';
    ctx.beginPath();
    ctx.arc(L.sign.x, L.sign.y, 11, 0.3, Math.PI * 1.7);
    ctx.arc(L.sign.x + 5, L.sign.y - 3, 9, Math.PI * 1.6, Math.PI * 0.4, true);
    ctx.fill();
  } else {
    ctx.fillStyle = '#e8a33d';
    drawStar(ctx, L.sign.x, L.sign.y, 11);
  }

  // Bicycle leaning by the cart.
  ctx.strokeStyle = '#2c2118';
  ctx.lineWidth = 3;
  L.bicycle.wheels.forEach((wh) => {
    ctx.beginPath();
    ctx.arc(wh.x, wh.y, 20, 0, Math.PI * 2);
    ctx.stroke();
  });
  line(ctx, 228, 366, 262, 322);
  line(ctx, 296, 366, 262, 322);
  line(ctx, 228, 366, 296, 366);
  line(ctx, 262, 322, 296, 344);
  line(ctx, 262, 322, 240, 322);
  if (!mods.has('bike-bell')) {
    ctx.fillStyle = '#d9a441';
    circle(ctx, L.bicycle.bell.x, L.bicycle.bell.y, 5);
  }
  drawPocketWatch(ctx, L.pocketWatch.x, L.pocketWatch.y);
}

// -------------------------------------------------------------- observatory
const OBS_STARS = starField(77, 60, W, H, 260);

function drawObservatory(ctx, scene, mods, time) {
  const L = scene.layout;
  // Deep night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 340);
  sky.addColorStop(0, '#0d1530');
  sky.addColorStop(1, '#274060');
  ctx.fillStyle = sky;
  rect(ctx, 0, 0, W, 340);
  drawStars(ctx, OBS_STARS, time);
  // The moon, with three craters — or two.
  ctx.fillStyle = '#f2ead0';
  circle(ctx, L.moon.x, L.moon.y, L.moon.r);
  ctx.fillStyle = '#d8cda8';
  circle(ctx, L.moon.x - 7, L.moon.y - 5, 4);
  circle(ctx, L.moon.x + 6, L.moon.y + 6, 3.2);
  if (!mods.has('moon-crater')) circle(ctx, L.moon.x + 8, L.moon.y - 8, 2.6);
  // The comet and its small companion star.
  ctx.strokeStyle = 'rgba(190, 220, 255, 0.85)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  line(ctx, L.comet.head.x, L.comet.head.y, L.comet.tailTip.x, L.comet.tailTip.y);
  ctx.strokeStyle = 'rgba(190, 220, 255, 0.4)';
  ctx.lineWidth = 7;
  line(ctx, L.comet.head.x, L.comet.head.y, L.comet.tailTip.x + 14, L.comet.tailTip.y - 8);
  ctx.fillStyle = '#eaf4ff';
  circle(ctx, L.comet.head.x, L.comet.head.y, 5);
  if (!mods.has('comet-star')) {
    ctx.fillStyle = '#ffe9a3';
    drawStar(ctx, L.comet.head.x + 16, L.comet.head.y - 12, 4);
  }

  // Roof and the great dome.
  ctx.fillStyle = '#1c2436';
  rect(ctx, 0, 330, W, 90);
  ctx.fillStyle = '#31405e';
  ctx.beginPath();
  ctx.arc(L.dome.x, L.dome.y, L.dome.r, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#24304a';
  ctx.beginPath();
  ctx.arc(L.dome.x, L.dome.y, L.dome.r - 14, Math.PI, 0);
  ctx.fill();
  if (mods.has('dome-slit')) {
    // The slit is shut: one smooth dome.
    ctx.strokeStyle = '#3d5478';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(L.dome.x, L.dome.y, L.dome.r - 7, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#0a0f1e';
    poly(ctx, [[L.dome.x - 16, L.domeSlit.y - 66], [L.dome.x + 16, L.domeSlit.y - 66], [L.dome.x + 12, L.domeSlit.y + 62], [L.dome.x - 12, L.domeSlit.y + 62]]);
    ctx.strokeStyle = '#3d5478';
    ctx.lineWidth = 3;
    line(ctx, L.dome.x - 16, L.domeSlit.y - 66, L.dome.x - 12, L.domeSlit.y + 62);
    line(ctx, L.dome.x + 16, L.domeSlit.y - 66, L.dome.x + 12, L.domeSlit.y + 62);
  }
  // The owl on the dome's edge: eyes open, or shut.
  ctx.fillStyle = '#8a6b4a';
  ellipse(ctx, L.owl.x, L.owl.y, 16, 20);
  ctx.fillStyle = '#6b4f33';
  poly(ctx, [[L.owl.x - 12, L.owl.y - 16], [L.owl.x - 4, L.owl.y - 24], [L.owl.x - 2, L.owl.y - 14]]);
  poly(ctx, [[L.owl.x + 12, L.owl.y - 16], [L.owl.x + 4, L.owl.y - 24], [L.owl.x + 2, L.owl.y - 14]]);
  if (mods.has('owl-eyes')) {
    ctx.strokeStyle = '#2c2118';
    ctx.lineWidth = 1.8;
    line(ctx, L.owl.x - 8, L.owl.y - 6, L.owl.x - 2, L.owl.y - 6);
    line(ctx, L.owl.x + 2, L.owl.y - 6, L.owl.x + 8, L.owl.y - 6);
  } else {
    ctx.fillStyle = '#ffe9a3';
    circle(ctx, L.owl.x - 5, L.owl.y - 6, 3.4);
    circle(ctx, L.owl.x + 5, L.owl.y - 6, 3.4);
    ctx.fillStyle = '#2c2118';
    circle(ctx, L.owl.x - 5, L.owl.y - 6, 1.6);
    circle(ctx, L.owl.x + 5, L.owl.y - 6, 1.6);
  }
  ctx.fillStyle = '#e8a33d';
  poly(ctx, [[L.owl.x - 3, L.owl.y + 2], [L.owl.x + 3, L.owl.y + 2], [L.owl.x, L.owl.y + 7]]);

  // The telescope on its tripod, pointing up — or a little further up.
  const angle = mods.has('telescope-angle') ? -0.62 : -0.38;
  const px = L.telescope.pivot.x;
  const py = L.telescope.pivot.y;
  const tipX = px + Math.cos(angle) * 92;
  const tipY = py + Math.sin(angle) * 92;
  ctx.strokeStyle = '#1c2436';
  ctx.lineWidth = 4;
  line(ctx, px, py + 8, px - 26, 336);
  line(ctx, px, py + 8, px + 26, 336);
  line(ctx, px, py + 8, px, 336);
  ctx.strokeStyle = '#31405e';
  ctx.lineWidth = 13;
  ctx.lineCap = 'round';
  line(ctx, px - Math.cos(angle) * 18, py - Math.sin(angle) * 18, tipX, tipY);
  ctx.fillStyle = '#d9a441';
  circle(ctx, tipX, tipY, 8);
  ctx.fillStyle = '#8fb8d8';
  circle(ctx, tipX, tipY, 4.5);

  // The desk: star chart, books, cocoa, pocket watch.
  ctx.fillStyle = '#5a3d24';
  rect(ctx, 380, 330, 172, 10);
  ctx.fillStyle = '#4a2d16';
  rect(ctx, 392, 340, 10, 60);
  rect(ctx, 530, 340, 10, 60);
  ctx.fillStyle = '#fdf6e3';
  roundRect(ctx, L.chart.x, L.chart.y, L.chart.w, L.chart.h, 4);
  ctx.strokeStyle = '#5a3d24';
  ctx.lineWidth = 1.6;
  ctx.strokeRect(L.chart.x, L.chart.y, L.chart.w, L.chart.h);
  const chartStars = [[410, 282], [428, 276], [446, 282], [458, 292], [430, 296]];
  ctx.fillStyle = '#2c4a6b';
  chartStars.forEach(([sx, sy], i) => {
    if (i === 2 && mods.has('chart-star')) return; // one star missing
    drawStar(ctx, sx, sy, 3.4, 4);
  });
  ctx.strokeStyle = '#2c4a6b';
  ctx.lineWidth = 1;
  line(ctx, 410, 282, 428, 276);
  line(ctx, 428, 276, 446, 282);
  line(ctx, 446, 282, 458, 292);
  line(ctx, 458, 292, 430, 296);
  // Books.
  ctx.fillStyle = '#b3402a';
  rect(ctx, 396, 322, 46, 8);
  ctx.fillStyle = '#3d6fb4';
  rect(ctx, 400, 314, 40, 8);
  // Cocoa mug with steam — or none.
  ctx.fillStyle = '#e8e0d0';
  roundRect(ctx, L.mug.x - 11, L.mug.y - 12, 22, 22, 3);
  ctx.strokeStyle = '#e8e0d0';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(L.mug.x + 12, L.mug.y - 2, 6, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  drawSteam(ctx, L.mug.x, L.mug.y - 14, time, !mods.has('mug-steam'));
  drawPocketWatch(ctx, L.pocketWatch.x, L.pocketWatch.y);
}

const DRAWERS = {
  workshop: drawWorkshop,
  market: drawMarket,
  observatory: drawObservatory,
};

// Paint one panel of a scene. `mods` is a Set of difference ids to apply.
export function drawScene(ctx, scene, mods, time) {
  ctx.clearRect(0, 0, W, H);
  DRAWERS[scene.id](ctx, scene, mods, time);
}

// The marker drawn over a found difference on both panels: a warm ring
// that pops in, then settles into a steady circle with a small tick.
export function drawFoundMarker(ctx, diff, time, bornAt) {
  const age = time - bornAt;
  const pop = age < 0.25 ? 0.6 + (age / 0.25) * 0.55 : 1.15;
  const r = diff.r * pop;
  ctx.strokeStyle = '#ff5a3c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, r + 4, 0, Math.PI * 2);
  ctx.stroke();
  if (age >= 0.25) {
    ctx.strokeStyle = '#ff5a3c';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(diff.x - 7, diff.y);
    ctx.lineTo(diff.x - 1, diff.y + 6);
    ctx.lineTo(diff.x + 8, diff.y - 6);
    ctx.stroke();
  }
}

// The hint ring: a soft pulsing circle around a difference not yet found.
export function drawHintRing(ctx, diff, time, hintStartedAt) {
  const pulse = 1 + Math.sin((time - hintStartedAt) * 5) * 0.12;
  ctx.strokeStyle = 'rgba(255, 214, 130, 0.95)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, diff.r * pulse + 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}
