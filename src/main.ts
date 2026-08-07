// =============================================
// AMULISH - Lyric Shooter Game
// Pure Canvas 2D, no frameworks, max performance
// =============================================

import { parseSRT, parseLRC } from './srtParser';
import { AudioEngine } from './audioEngine';
import { Renderer } from './renderer';
import { GameState } from './gameState';
import { PRESETS } from './presets';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d', { alpha: false })!;

let W = 0, H = 0;

function resize() {
  const ratio = 9 / 16;
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  if (winW / winH < ratio) { W = winW; H = Math.round(winW / ratio); }
  else { H = winH; W = Math.round(winH * ratio); }
  canvas.width = W; canvas.height = H;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  state.W = W; state.H = H;
  renderer.setSize(W, H);
}

const audio = new AudioEngine();
const state = new GameState(0, 0);
state.setAudio(audio);
const renderer = new Renderer(ctx, 0, 0);

resize();
window.addEventListener('resize', resize);

// ---- Check URL params (from bookmarklet) ----
const params = new URLSearchParams(location.search);
const urlAudio = params.get('audio');
const urlTitle = params.get('title') || 'SUNO Track';
if (urlAudio) {
  audio.loadMusic(urlAudio);
  // Try to get SRT from URL param too
  const urlSrt = params.get('srt');
  if (urlSrt) {
    const lrc = parseLRC(decodeURIComponent(urlSrt));
    state.setLyrics(lrc);
  }
}

// ---- Build UI ----
buildUI();

// ---- Audio time sync ----
audio.setOnTime(t => state.syncTime(t));

// ---- Game loop ----
let lastTime = 0;
function loop(ts: number) {
  const dt = Math.min(ts - lastTime, 50);
  lastTime = ts;
  if (state.phase === 'PLAYING') { state.update(dt); renderer.render(state, W, H); }
  else if (state.phase === 'TITLE') { renderer.renderTitle(state, W, H); }
  else if (state.phase === 'RESULT') { renderer.renderResult(state, W, H); }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ---- Touch / Mouse ----
let lastX = 0, lastY = 0, pressing = false;
function onStart(x: number, y: number) {
  lastX = x; lastY = y; pressing = true;
  if (state.phase !== 'PLAYING') { audio.resume(); state.startGame(); showGame(); }
}
function onMove(x: number, y: number) {
  if (!pressing) return;
  state.movePlayer(x - lastX, y - lastY);
  lastX = x; lastY = y;
}
function onEnd() { pressing = false; }

canvas.addEventListener('touchstart', e => { e.preventDefault(); onStart(e.changedTouches[0].clientX, e.changedTouches[0].clientY); }, { passive: false });
canvas.addEventListener('touchmove', e => { e.preventDefault(); onMove(e.changedTouches[0].clientX, e.changedTouches[0].clientY); }, { passive: false });
canvas.addEventListener('touchend', onEnd);
canvas.addEventListener('mousedown', e => onStart(e.clientX, e.clientY));
canvas.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
canvas.addEventListener('mouseup', onEnd);

// ---- Bookmarklet code ----
// This bookmarklet runs on suno.com, extracts the audio src, and opens AMULISH with it
const DEPLOY_URL = `https://amfmu49-spec.github.io/amulish-game/`;
const BOOKMARKLET = `javascript:(function(){var a=document.querySelector('audio');if(!a||!a.src){alert('❌ SUNOで曲を再生してから押してください');return;}var t=document.title.replace(' | Suno','').trim();window.open('${DEPLOY_URL}?audio='+encodeURIComponent(a.src)+'&title='+encodeURIComponent(t),'_blank');})();`;

// ---- UI builder ----
function buildUI() {
  const overlay = document.createElement('div');
  overlay.id = 'ui-overlay';
  overlay.innerHTML = `
    <style>
      #ui-overlay {
        position: fixed; inset: 0;
        display: flex; align-items: center; justify-content: center;
        pointer-events: none; z-index: 100;
        font-family: 'Dela Gothic One', sans-serif;
      }
      #ui-panel {
        pointer-events: auto;
        background: rgba(0,0,16,0.93);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(0,243,255,0.35);
        border-radius: 24px;
        padding: 24px 20px 20px;
        display: flex; flex-direction: column; align-items: center;
        gap: 14px;
        max-width: 340px; width: 90%;
        box-shadow: 0 0 60px rgba(0,243,255,0.12), inset 0 1px 0 rgba(255,255,255,0.06);
      }
      #ui-panel h1 {
        font-size: 2.4rem; color: #00f3ff; margin: 0;
        text-shadow: 0 0 24px #00f3ff, 0 0 60px #00f3ff;
        letter-spacing: 4px;
      }
      .sub { font-size: 0.7rem; color: rgba(255,255,255,0.45); letter-spacing: 2px; margin-top: -10px; }

      /* Bookmarklet section */
      .bm-box {
        width: 100%;
        background: rgba(255,230,0,0.06);
        border: 1px solid rgba(255,230,0,0.3);
        border-radius: 14px;
        padding: 12px 14px;
        display: flex; flex-direction: column; gap: 8px;
      }
      .bm-title { font-size: 0.68rem; color: #ffe600; letter-spacing: 2px; }
      .bm-desc { font-size: 0.62rem; color: rgba(255,255,255,0.55); line-height: 1.5; }
      .bm-btn {
        width: 100%; padding: 9px;
        background: rgba(255,230,0,0.15);
        border: 1px solid #ffe600; border-radius: 10px;
        color: #ffe600; font-family: inherit; font-size: 0.72rem;
        cursor: pointer; letter-spacing: 1px;
        transition: background 0.2s;
      }
      .bm-btn:hover { background: rgba(255,230,0,0.28); }
      .bm-copied { color: #00ff66 !important; border-color: #00ff66 !important; }

      /* Preset section */
      .section-label { font-size: 0.65rem; color: rgba(0,243,255,0.8); letter-spacing: 2px; align-self: flex-start; }
      .preset-btns { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; width: 100%; }
      .preset-btn {
        padding: 7px 12px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 10px; color: #ccc;
        font-size: 0.66rem; cursor: pointer; font-family: inherit;
        transition: all 0.2s;
      }
      .preset-btn:hover, .preset-btn.active {
        background: rgba(0,243,255,0.15);
        border-color: #00f3ff; color: #00f3ff;
      }

      /* Difficulty */
      .diff-row { display: flex; gap: 8px; width: 100%; }
      .diff-btn {
        flex: 1; padding: 9px 4px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 10px; color: #aaa;
        font-size: 0.7rem; cursor: pointer; font-family: inherit;
        transition: all 0.2s; text-align: center;
      }
      .diff-btn.easy.active { background: rgba(0,255,102,0.15); border-color: #00ff66; color: #00ff66; }
      .diff-btn.normal.active { background: rgba(0,180,255,0.15); border-color: #00b4ff; color: #00b4ff; }
      .diff-btn.hard.active { background: rgba(255,50,85,0.15); border-color: #ff3355; color: #ff3355; }

      /* Start button */
      .start-btn {
        width: 100%; padding: 14px;
        background: linear-gradient(135deg, #00b4d8, #0077b6);
        border: none; border-radius: 14px;
        color: white; font-size: 1.05rem;
        font-family: 'Dela Gothic One', sans-serif;
        cursor: pointer; letter-spacing: 3px;
        box-shadow: 0 0 24px rgba(0,180,216,0.5);
        transition: opacity 0.2s;
      }
      .start-btn:hover { opacity: 0.88; }
      .tap-hint { font-size: 0.62rem; color: rgba(0,243,255,0.5); letter-spacing: 2px; animation: blink 1.2s infinite; }
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

      /* Result */
      #result-panel {
        pointer-events: auto;
        background: rgba(0,0,16,0.94);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255,230,0,0.4);
        border-radius: 24px; padding: 28px 24px;
        display: none; flex-direction: column; align-items: center;
        gap: 14px; max-width: 340px; width: 90%;
        box-shadow: 0 0 60px rgba(255,230,0,0.1);
      }
      #result-panel h2 { font-size: 1.6rem; color: #ffe600; text-shadow: 0 0 20px #ffe600; margin: 0; letter-spacing: 4px; }
      .result-rank { font-size: 4rem; text-shadow: 0 0 40px currentColor; margin: -8px 0; }
      .result-stats { width: 100%; display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: rgba(255,255,255,0.8); }
      .stat-row { display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 4px; }
      .stat-val { color: #00f3ff; font-weight: bold; }
      .result-btns { display: flex; gap: 10px; width: 100%; }
      .result-btns button {
        flex: 1; padding: 12px; border: 1px solid;
        border-radius: 12px; font-family: 'Dela Gothic One', sans-serif;
        font-size: 0.8rem; cursor: pointer; letter-spacing: 2px; transition: opacity 0.2s;
      }
      .result-btns button:hover { opacity: 0.85; }
      #btn-retry { background: linear-gradient(135deg, #00b4d8, #0077b6); border-color: #00b4d8; color: white; }
      #btn-to-title { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.25); color: #ccc; }
    </style>

    <!-- Title Panel -->
    <div id="ui-panel">
      <h1>AMULISH</h1>
      <p class="sub">LYRIC SHOOTER</p>

      <!-- Bookmarklet -->
      <div class="bm-box">
        <div class="bm-title">⚡ SUNO連携ブックマークレット</div>
        <div class="bm-desc">
          ① 下のボタンをコピーしてブックマークに登録<br>
          ② SUNOで曲を再生しながらブックマークを押す<br>
          ③ AMULISHが曲と一緒に起動！
        </div>
        <button class="bm-btn" id="bm-copy">📋 ブックマークレットをコピー</button>
      </div>

      <!-- Demo presets -->
      <div class="section-label">⚡ DEMO TRACKS</div>
      <div class="preset-btns" id="preset-btns">
        ${PRESETS.map((p, i) => `<button class="preset-btn${i === 0 ? ' active' : ''}" data-preset="${p.id}">🎵 ${p.title}</button>`).join('')}
      </div>

      <!-- Difficulty -->
      <div class="section-label">🎯 DIFFICULTY</div>
      <div class="diff-row">
        <button class="diff-btn easy" data-diff="EASY">😊 EASY</button>
        <button class="diff-btn normal active" data-diff="NORMAL">🎯 NORMAL</button>
        <button class="diff-btn hard" data-diff="HARD">💀 HARD</button>
      </div>

      <button class="start-btn" id="btn-start">▶ GAME START</button>
      <span class="tap-hint">タップして開始 / Tap anywhere to start</span>
    </div>

    <!-- Result Panel -->
    <div id="result-panel">
      <h2>RESULT</h2>
      <div class="result-rank" id="result-rank" style="color:#ffe600">S</div>
      <div class="result-stats">
        <div class="stat-row"><span>SCORE</span><span class="stat-val" id="r-score">0</span></div>
        <div class="stat-row"><span>MAX COMBO</span><span class="stat-val" id="r-combo">0</span></div>
        <div class="stat-row"><span>ACCURACY</span><span class="stat-val" id="r-acc">100%</span></div>
        <div class="stat-row"><span>DIFFICULTY</span><span class="stat-val" id="r-diff">NORMAL</span></div>
      </div>
      <div class="result-btns">
        <button id="btn-retry">🔁 RETRY</button>
        <button id="btn-to-title">🏠 TITLE</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Only load default preset if no SUNO URL audio was passed in
  if (!urlAudio) {
    const firstPreset = PRESETS[0];
    state.setLyrics(firstPreset.lyrics);
    audio.setPresetBeat(firstPreset.bpm);
  } else {
    if (!params.get('srt')) {
      state.setLyrics([]);
    }
    // Extract words from SUNO title to use as kinetic enemy lyrics
    const titleWords = urlTitle.split(/[\s,._\-／/]+/).filter(w => w.length > 0);
    state.setCustomWords(titleWords);
  }

  // Bookmarklet copy
  document.getElementById('bm-copy')!.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(BOOKMARKLET);
      const btn = document.getElementById('bm-copy')!;
      btn.textContent = '✅ コピー完了！ブックマークに保存してね';
      btn.classList.add('bm-copied');
      setTimeout(() => {
        btn.textContent = '📋 ブックマークレットをコピー';
        btn.classList.remove('bm-copied');
      }, 3000);
    } catch {
      prompt('コピーしてブックマークに登録してください:', BOOKMARKLET);
    }
  });

  // Preset buttons
  document.querySelectorAll<HTMLButtonElement>('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const p = PRESETS.find(x => x.id === btn.dataset.preset)!;
      state.setLyrics(p.lyrics);
      audio.setPresetBeat(p.bpm);
    });
  });

  // Difficulty buttons
  document.querySelectorAll<HTMLButtonElement>('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.setDifficulty(btn.dataset.diff as 'EASY' | 'NORMAL' | 'HARD');
    });
  });

  // Start
  document.getElementById('btn-start')!.addEventListener('click', () => {
    audio.resume(); state.startGame(); showGame();
  });

  // Result buttons
  document.getElementById('btn-retry')!.addEventListener('click', () => {
    audio.seek(0); state.startGame(); showGame();
  });
  document.getElementById('btn-to-title')!.addEventListener('click', () => {
    audio.pause(); state.goToTitle(); showTitle();
  });

  // If loaded from bookmarklet URL param, show SUNO track info
  if (urlAudio) {
    const box = document.querySelector('.bm-box')!;
    box.innerHTML = `<div class="bm-title">🎵 SUNO曲を読み込み中...</div><div class="bm-desc">${urlTitle}</div>`;
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  }
}

function showGame() {
  document.getElementById('ui-panel')!.style.display = 'none';
  document.getElementById('result-panel')!.style.display = 'none';
}
function showTitle() {
  document.getElementById('ui-panel')!.style.display = 'flex';
  document.getElementById('result-panel')!.style.display = 'none';
}
function showResult() {
  const rankColors: Record<string, string> = { S: '#ffe600', A: '#00ff66', B: '#00f3ff', C: '#ff6622' };
  document.getElementById('result-rank')!.textContent = state.rank;
  document.getElementById('result-rank')!.style.color = rankColors[state.rank];
  document.getElementById('r-score')!.textContent = state.score.toLocaleString();
  document.getElementById('r-combo')!.textContent = state.maxCombo + 'x';
  document.getElementById('r-acc')!.textContent = state.accuracy + '%';
  document.getElementById('r-diff')!.textContent = state.difficulty;
  document.getElementById('ui-panel')!.style.display = 'none';
  document.getElementById('result-panel')!.style.display = 'flex';
}
// Expose for renderer to call when game ends (optional)
(window as any).__showResult = showResult;
