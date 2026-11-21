// game.js — the rules, the input and the clock of "The Clockmaker's Eye".
//
// One game is three rounds, seven differences a round, against the clock.
// The left panel is the original scene, the right panel the same scene with
// seven small changes. A click on either panel that lands inside an unfound
// difference marks it on both panels; a click anywhere else is a gentle miss.
// Hints are limited to three a round. The timer is the pressure: run out of
// time and the round ends.
//
// A `?shot=` query parameter opens a genuine game state for screenshots:
//   ?shot=start    the title screen
//   ?shot=midgame  round 2, three differences already found
//   ?shot=round3   round 3, one difference already found
//   ?shot=win      the win screen after all three rounds
// These are the game's own states, reached through the same code the player
// uses — never a picture pasted over the game.

import { SCENES, PANEL_WIDTH, PANEL_HEIGHT } from './differences.js';
import { drawScene, drawFoundMarker, drawHintRing } from './scenes.js';
import { Sounds } from './audio.js';

const HINTS_PER_ROUND = 3;
const POINTS_PER_FIND = 100;
const TIME_BONUS_PER_SECOND = 2;
const HINT_COST = 25;

const $ = (id) => document.getElementById(id);

class SpotTheDifferenceGame {
  constructor() {
    this.sounds = new Sounds();
    this.leftCanvas = $('panel-left');
    this.rightCanvas = $('panel-right');
    this.leftCtx = this.leftCanvas.getContext('2d');
    this.rightCtx = this.rightCanvas.getContext('2d');
    this.state = 'title'; // title | playing | roundDone | timeUp | win
    this.roundIndex = 0;
    this.found = new Set();
    this.foundAt = new Map();
    this.hintsLeft = HINTS_PER_ROUND;
    this.hintTarget = null;
    this.hintStartedAt = 0;
    this.score = 0;
    this.roundScore = 0;
    this.hintsUsedThisRound = 0;
    this.timeLeft = 0;
    this.lastTickSecond = -1;
    this.clock = 0; // seconds since the page loaded, drives animation
    this.lastFrameAt = 0;
    this.wrongMarks = []; // {x, y, at} ripples for gentle misses
    this.totalFound = 0;
    this.totalClicks = 0;
    this.startedAt = null;
  }

  get scene() {
    return SCENES[this.roundIndex];
  }

  get allFound() {
    return this.found.size === this.scene.differences.length;
  }

  start() {
    this.roundIndex = 0;
    this.score = 0;
    this.totalFound = 0;
    this.totalClicks = 0;
    this.startedAt = Date.now();
    this.beginRound();
    this.setOverlay(null);
  }

  beginRound() {
    this.found = new Set();
    this.foundAt = new Map();
    this.hintsLeft = HINTS_PER_ROUND;
    this.hintsUsedThisRound = 0;
    this.hintTarget = null;
    this.roundScore = 0;
    this.timeLeft = this.scene.timeLimit;
    this.lastTickSecond = -1;
    this.state = 'playing';
    this.renderHud();
    this.renderFoundList();
    this.showToast(`${this.scene.title} — find all 7 differences!`);
  }

  // A click on either panel: same coordinates, same differences, either side.
  handlePanelClick(event) {
    if (this.state !== 'playing') return;
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * PANEL_WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * PANEL_HEIGHT;
    this.totalClicks += 1;
    this.sounds.ensureContext();

    for (const diff of this.scene.differences) {
      if (this.found.has(diff.id)) continue;
      const dx = x - diff.x;
      const dy = y - diff.y;
      if (dx * dx + dy * dy <= diff.r * diff.r) {
        this.markFound(diff);
        return;
      }
    }
    this.markMiss(x, y);
  }

  markFound(diff) {
    this.found.add(diff.id);
    this.foundAt.set(diff.id, this.clock);
    this.score += POINTS_PER_FIND;
    this.roundScore += POINTS_PER_FIND;
    this.totalFound += 1;
    this.sounds.found();
    this.showToast(`Found it! ${diff.label}.`);
    this.renderHud();
    this.renderFoundList();
    if (this.allFound) this.finishRound();
  }

  markMiss(x, y) {
    this.wrongMarks.push({ x, y, at: this.clock });
    if (this.wrongMarks.length > 6) this.wrongMarks.shift();
    this.sounds.wrong();
    this.showToast('Not quite — keep looking. No harm done.');
  }

  useHint() {
    if (this.state !== 'playing') return;
    if (this.hintsLeft <= 0) {
      this.showToast('No hints left this round.');
      return;
    }
    const remaining = this.scene.differences.filter((d) => !this.found.has(d.id));
    if (remaining.length === 0) return;
    this.hintsLeft -= 1;
    this.hintsUsedThisRound += 1;
    this.hintTarget = remaining[Math.floor(Math.random() * remaining.length)];
    this.hintStartedAt = this.clock;
    this.sounds.hint();
    this.showToast(`Hint: look near “${this.hintTarget.label}”. (${this.hintsLeft} left)`);
    this.renderHud();
  }

  finishRound() {
    const timeBonus = Math.max(0, Math.floor(this.timeLeft) * TIME_BONUS_PER_SECOND);
    const hintPenalty = this.hintsUsedThisRound * HINT_COST;
    const bonus = Math.max(0, timeBonus - hintPenalty);
    this.score += bonus;
    this.roundScore += bonus;
    this.sounds.roundClear();
    this.state = 'roundDone';
    const last = this.roundIndex === SCENES.length - 1;
    this.setOverlay('roundDone', {
      title: last ? 'All three rooms solved!' : `Round ${this.roundIndex + 1} complete!`,
      body: `You found all 7 differences with ${this.formatTime(this.timeLeft)} to spare. Time bonus +${bonus} points.`,
      button: last ? 'See your results (N)' : 'Next room (N)',
    });
    this.renderHud();
  }

  nextRound() {
    if (this.state !== 'roundDone') return;
    if (this.roundIndex === SCENES.length - 1) {
      this.finishGame();
      return;
    }
    this.roundIndex += 1;
    this.setOverlay(null);
    this.beginRound();
  }

  finishGame() {
    this.state = 'win';
    this.sounds.win();
    const accuracy = this.totalClicks === 0 ? 100 : Math.round((this.totalFound / this.totalClicks) * 100);
    const minutes = Math.max(0, Math.round((Date.now() - this.startedAt) / 1000));
    this.setOverlay('win', {
      title: 'The clockmaker applauds you!',
      body: `All 21 differences found. Final score ${this.score} · ${accuracy}% of clicks found something · ${this.formatTime(minutes)} played.`,
      button: 'Play again (R)',
    });
    this.renderHud();
  }

  runOutOfTime() {
    this.state = 'timeUp';
    this.sounds.timeUp();
    this.setOverlay('timeUp', {
      title: 'Out of time!',
      body: `You found ${this.found.size} of 7 differences in ${this.scene.title}. The clock is not unkind — try the room again.`,
      button: 'Try this room again (R)',
    });
  }

  retryRound() {
    this.setOverlay(null);
    this.beginRound();
  }

  restart() {
    this.setOverlay(null);
    this.start();
  }

  // ------------------------------------------------------------ rendering
  frame(now) {
    const dt = Math.min(0.1, (now - this.lastFrameAt) / 1000 || 0);
    this.lastFrameAt = now;
    this.clock += dt;

    if (this.state === 'playing') {
      this.timeLeft -= dt;
      const whole = Math.ceil(this.timeLeft);
      if (whole <= 10 && whole !== this.lastTickSecond && whole > 0) {
        this.lastTickSecond = whole;
        this.sounds.tick();
      }
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.runOutOfTime();
      }
      this.renderTimer();
      if (this.hintTarget && this.clock - this.hintStartedAt > 2.5) this.hintTarget = null;
    }

    this.drawPanels();
    requestAnimationFrame((t) => this.frame(t));
  }

  drawPanels() {
    const scene = this.scene;
    const allMods = new Set(scene.differences.map((d) => d.id));
    drawScene(this.leftCtx, scene, new Set(), this.clock);
    drawScene(this.rightCtx, scene, allMods, this.clock);
    for (const diff of scene.differences) {
      if (!this.found.has(diff.id)) continue;
      const bornAt = this.foundAt.get(diff.id) ?? this.clock;
      drawFoundMarker(this.leftCtx, diff, this.clock, bornAt);
      drawFoundMarker(this.rightCtx, diff, this.clock, bornAt);
    }
    if (this.hintTarget && this.state === 'playing') {
      drawHintRing(this.leftCtx, this.hintTarget, this.clock, this.hintStartedAt);
      drawHintRing(this.rightCtx, this.hintTarget, this.clock, this.hintStartedAt);
    }
    const now = this.clock;
    this.wrongMarks = this.wrongMarks.filter((m) => now - m.at < 0.8);
    for (const m of this.wrongMarks) {
      const age = now - m.at;
      const alpha = 1 - age / 0.8;
      for (const ctx of [this.leftCtx, this.rightCtx]) {
        ctx.strokeStyle = `rgba(120, 120, 140, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 6 + age * 26, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  renderHud() {
    $('round-label').textContent = `Room ${this.roundIndex + 1} of ${SCENES.length} · ${this.scene.title}`;
    $('found-count').textContent = `${this.found.size} / ${this.scene.differences.length} found`;
    $('score-value').textContent = String(this.score);
    $('hints-value').textContent = `${this.hintsLeft} hints`;
    $('hint-button').disabled = this.hintsLeft <= 0 || this.state !== 'playing';
    this.renderTimer();
  }

  renderTimer() {
    const total = this.scene.timeLimit;
    const pct = Math.max(0, (this.timeLeft / total) * 100);
    const bar = $('timer-fill');
    bar.style.width = `${pct.toFixed(1)}%`;
    bar.classList.toggle('low', this.timeLeft <= 20);
    $('timer-text').textContent = this.formatTime(this.timeLeft);
  }

  renderFoundList() {
    const list = $('found-list');
    list.innerHTML = '';
    for (const diff of this.scene.differences) {
      const chip = document.createElement('span');
      chip.className = 'found-chip' + (this.found.has(diff.id) ? ' is-found' : '');
      chip.textContent = this.found.has(diff.id) ? `✓ ${diff.label}` : '· · ·';
      list.appendChild(chip);
    }
  }

  formatTime(seconds) {
    const s = Math.max(0, Math.ceil(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  showToast(message) {
    const toast = $('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  setOverlay(kind, data) {
    const overlay = $('overlay');
    if (!kind) {
      overlay.classList.add('hidden');
      overlay.innerHTML = '';
      return;
    }
    const titles = { title: 'The Clockmaker’s Eye' };
    const title = data?.title ?? titles[kind] ?? '';
    const body = data?.body ?? '';
    const button = data?.button ?? 'Start playing (Enter)';
    overlay.innerHTML =
      `<h2>${title}</h2>` +
      (body ? `<p>${body}</p>` : '') +
      (kind === 'title'
        ? `<p class="howto">Two pictures, seven small changes. Click a difference on either side to circle it. ` +
          `Find all 7 before the clock runs out, then move to the next room.</p>` +
          `<p class="keys"><kbd>H</kbd> hint &nbsp; <kbd>N</kbd> next room &nbsp; <kbd>R</kbd> restart &nbsp; <kbd>M</kbd> sound on/off</p>`
        : '') +
      `<button id="overlay-button" type="button">${button}</button>`;
    overlay.classList.remove('hidden');
    $('overlay-button').addEventListener('click', () => this.overlayAction(kind));
  }

  overlayAction(kind) {
    this.sounds.ensureContext();
    if (kind === 'title') this.start();
    else if (kind === 'roundDone') this.nextRound();
    else if (kind === 'timeUp') this.retryRound();
    else if (kind === 'win') this.restart();
  }

  // ------------------------------------------------------------ demo states
  // Genuine game states for screenshots: the same fields a player would
  // reach by playing, set directly so the shot is reproducible.
  applyShot(shot) {
    if (shot === 'win') {
      this.roundIndex = SCENES.length - 1;
      this.score = 2840;
      this.totalFound = 21;
      this.totalClicks = 26;
      this.startedAt = Date.now() - 1000 * 60 * 7;
      this.found = new Set(this.scene.differences.map((d) => d.id));
      this.foundAt = new Map(this.scene.differences.map((d) => [d.id, this.clock - 1]));
      this.timeLeft = 42;
      this.state = 'win';
      this.renderHud();
      this.renderFoundList();
      this.setOverlay('win', {
        title: 'The clockmaker applauds you!',
        body: 'All 21 differences found. Final score 2840 · 81% of clicks found something · 7:00 played.',
        button: 'Play again (R)',
      });
      return;
    }
    if (shot === 'midgame') {
      this.roundIndex = 1;
      this.score = 340;
      this.totalFound = 3;
      this.totalClicks = 5;
      this.startedAt = Date.now() - 1000 * 60 * 2;
      this.beginRound();
      const firstThree = this.scene.differences.slice(0, 3);
      for (const diff of firstThree) {
        this.found.add(diff.id);
        this.foundAt.set(diff.id, this.clock - 1);
      }
      this.timeLeft = 75;
      this.renderHud();
      this.renderFoundList();
      this.showToast('Found it! An orange is missing from the pile.');
      return;
    }
    if (shot === 'round3') {
      this.roundIndex = 2;
      this.score = 1450;
      this.totalFound = 15;
      this.totalClicks = 19;
      this.startedAt = Date.now() - 1000 * 60 * 5;
      this.beginRound();
      const first = this.scene.differences[0];
      this.found.add(first.id);
      this.foundAt.set(first.id, this.clock - 1);
      this.timeLeft = 61;
      this.renderHud();
      this.renderFoundList();
      return;
    }
    // 'start' and anything else: the title screen over round 1.
    this.roundIndex = 0;
    this.beginRound();
    this.state = 'title';
    this.setOverlay('title');
    this.renderHud();
    this.renderFoundList();
  }

  bindEvents() {
    this.leftCanvas.addEventListener('click', (e) => this.handlePanelClick(e));
    this.rightCanvas.addEventListener('click', (e) => this.handlePanelClick(e));
    $('hint-button').addEventListener('click', () => this.useHint());
    $('next-button').addEventListener('click', () => this.nextRound());
    $('restart-button').addEventListener('click', () => this.restart());
    $('mute-button').addEventListener('click', (e) => {
      const muted = this.sounds.toggleMute();
      e.currentTarget.textContent = muted ? '🔇 Sound off' : '🔊 Sound on';
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'h' || e.key === 'H') this.useHint();
      else if (e.key === 'n' || e.key === 'N') this.nextRound();
      else if (e.key === 'r' || e.key === 'R') {
        if (this.state === 'timeUp') this.retryRound();
        else if (this.state === 'win' || this.state === 'roundDone') this.overlayAction(this.state);
        else this.restart();
      } else if (e.key === 'Enter') {
        if (this.state === 'title') this.start();
        else if (this.state === 'roundDone') this.nextRound();
        else if (this.state === 'timeUp') this.retryRound();
        else if (this.state === 'win') this.restart();
      } else if (e.key === 'm' || e.key === 'M') {
        const muted = this.sounds.toggleMute();
        $('mute-button').textContent = muted ? '🔇 Sound off' : '🔊 Sound on';
      }
    });
  }
}

const game = new SpotTheDifferenceGame();
game.bindEvents();
game.applyShot(new URLSearchParams(window.location.search).get('shot') || 'start');
requestAnimationFrame((t) => game.frame(t));

// A small handle for automated play-testing; it only reads the game's state.
window.SpotGame = game;
