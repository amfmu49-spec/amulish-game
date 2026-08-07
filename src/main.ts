// =============================================
// AMULISH - Lyric Shooter Game v2.1.3
// Pure Canvas 2D, SUNO Bookmarklet Lyric Shooter
// =============================================

import { parseSRT, parseLRC, parseAnyLyrics, isStylePromptLine, type LyricLine } from './srtParser';
import { AudioEngine } from './audioEngine';
import { Renderer } from './renderer';
import { GameState } from './gameState';

const APP_VERSION = 'v2.3.0';

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

// Helper to convert any SUNO song URL or page link into CDN mp3 link
function resolveSunoUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const uuidMatch = rawUrl.match(/([a-f0-9]{8}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{12})/i);
  if (uuidMatch) {
    return `https://cdn1.suno.ai/${uuidMatch[1]}.mp3`;
  }
  return rawUrl;
}

// ---- Check URL params (from bookmarklet) ----
const params = new URLSearchParams(location.search);
const rawAudio = params.get('audio');
const urlAudio = rawAudio ? resolveSunoUrl(rawAudio) : null;
const urlTitle = params.get('title') || 'SUNO Track';
const urlLyrics = params.get('lyrics');
const urlSrt = params.get('srt');
const urlDebug = params.get('dbg');

let loadedLyrics: LyricLine[] = [];
let debugMsg = '';

if (urlLyrics) {
  const raw = decodeURIComponent(urlLyrics);
  console.log('[AMULISH] Raw lyrics received:', raw.substring(0, 300));
  loadedLyrics = parseAnyLyrics(raw);
  console.log('[AMULISH] Parsed lyrics count:', loadedLyrics.length, loadedLyrics.slice(0, 5).map(l => l.text));
  debugMsg = `歌詞取得OK: ${loadedLyrics.length}フレーズ`;
} else if (urlSrt) {
  const raw = decodeURIComponent(urlSrt);
  loadedLyrics = parseAnyLyrics(raw);
  debugMsg = `SRT取得OK: ${loadedLyrics.length}フレーズ`;
} else if (urlDebug) {
  debugMsg = `歌詞未取得: "${decodeURIComponent(urlDebug)}"`;
  console.warn('[AMULISH] No lyrics received. Debug:', decodeURIComponent(urlDebug));
}

if (loadedLyrics.length > 0) {
  state.setLyrics(loadedLyrics);
} else if (urlLyrics || urlSrt) {
  // Had raw data but parser filtered everything out — use raw lines as-is
  const raw = decodeURIComponent(urlLyrics || urlSrt || '');
  const fallbackLines: LyricLine[] = raw.replace(/\r\n/g, '\n').split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !/^\[.*\]$/.test(s) && !/^\(.*\)$/.test(s))
    .map((text, i) => ({ id: 'fb_' + i, time: 500 + i * 1800, end: 3000 + i * 1800, text }));
  if (fallbackLines.length > 0) {
    state.setLyrics(fallbackLines);
    debugMsg = `フォールバック歌詞: ${fallbackLines.length}行`;
    console.log('[AMULISH] Using fallback lines:', fallbackLines.slice(0, 5).map(l => l.text));
  }
}

if (urlAudio) {
  const rawWords = urlTitle.split(/[\s,._\-／/]+/).filter(w => w.length > 1);
  const cleanTitleWords = rawWords.filter(w => !isStylePromptLine(w));
  state.setCustomWords(cleanTitleWords);
}

// ---- Build UI ----
buildUI();

// Show lyric debug status in UI
if (debugMsg) {
  setTimeout(() => {
    const box = document.getElementById('suno-status-box');
    const titleEl = document.querySelector('.suno-status-title') as HTMLElement | null;
    const trackEl = document.getElementById('suno-track-name') as HTMLElement | null;
    if (box) box.style.display = 'flex';
    if (titleEl) {
      if (loadedLyrics.length > 0) {
        titleEl.textContent = '✅ 歌詞セット完了！';
        titleEl.style.color = '#00ff66';
      } else {
        titleEl.textContent = '⚠️ 歌詞取得できず（デモ語で表示）';
        titleEl.style.color = '#ff6622';
      }
    }
    if (trackEl) trackEl.textContent = debugMsg;
  }, 100);
}

if (urlAudio) {
  audio.loadMusic(urlAudio, (pct) => {
    updateAudioProgress(pct);
  });
}

// ---- Audio time sync ----
audio.setOnTime(t => state.syncTime(t));

let lastTime = 0;
let lastPhase = 'TITLE';
function loop(ts: number) {
  const dt = Math.min(ts - lastTime, 50);
  lastTime = ts;

  if (state.phase === 'PLAYING') {
    state.update(dt);
    renderer.render(state, W, H);
  } else if (state.phase === 'TITLE') {
    renderer.renderTitle(state, W, H);
  } else if (state.phase === 'RESULT') {
    if (lastPhase !== 'RESULT') {
      showResult();
    }
    renderer.renderResult(state, W, H);
  }
  lastPhase = state.phase;
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function showResult() {
  const rankColors: Record<string, string> = { S: '#ffe600', A: '#00ff66', B: '#00f3ff', C: '#ff6622' };
  const h2 = document.querySelector('#result-panel h2') as HTMLElement | null;
  const isDead = state.playerHp <= 0;

  if (h2) {
    if (isDead) {
      h2.textContent = '💀 GAME OVER';
      h2.style.color = '#ff2255';
      h2.style.textShadow = '0 0 20px #ff2255';
    } else {
      h2.textContent = '🎉 STAGE CLEAR';
      h2.style.color = '#ffe600';
      h2.style.textShadow = '0 0 20px #ffe600';
    }
  }

  document.getElementById('result-rank')!.textContent = isDead ? 'FAILED' : state.rank;
  document.getElementById('result-rank')!.style.color = isDead ? '#ff2255' : rankColors[state.rank];
  document.getElementById('r-score')!.textContent = state.score.toLocaleString();
  document.getElementById('r-combo')!.textContent = state.maxCombo + 'x';
  document.getElementById('r-acc')!.textContent = state.accuracy + '%';
  document.getElementById('r-diff')!.textContent = state.difficulty;
  document.getElementById('ui-panel')!.style.display = 'none';
  document.getElementById('result-panel')!.style.display = 'flex';
}

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

// ---- SUNO Lyric-Extraction Bookmarklet ----
const DEPLOY_URL = `https://amfmu49-spec.github.io/amulish-game/`;

// Bookmarklet using external loader (identical pattern to AMUVI for maximum reliability and API fetching)
const BOOKMARKLET = `javascript:(function(){var s=document.createElement('script');s.src='https://amfmu49-spec.github.io/amulish-game/bookmarklet.js?t='+Date.now();document.body.appendChild(s);})();`;

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
        background: rgba(0,0,16,0.94);
        backdrop-filter: blur(18px);
        border: 1px solid rgba(0,243,255,0.4);
        border-radius: 24px;
        padding: 24px 20px 20px;
        display: flex; flex-direction: column; align-items: center;
        gap: 14px;
        max-width: 340px; width: 90%;
        box-shadow: 0 0 50px rgba(0,243,255,0.15), inset 0 1px 0 rgba(255,255,255,0.08);
      }

      /* Logo Header */
      .logo-box {
        display: flex; flex-direction: column; align-items: center; gap: 2px; position: relative;
      }
      #ui-panel h1 {
        font-size: 2.5rem; margin: 0;
        background: linear-gradient(135deg, #ffffff 40%, #00f3ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 2px 10px rgba(0, 243, 255, 0.45));
        letter-spacing: 5px;
        line-height: 1.1;
      }
      .logo-sub-row {
        display: flex; align-items: center; gap: 8px; margin-top: 2px;
      }
      .sub { font-size: 0.68rem; color: rgba(0,243,255,0.85); letter-spacing: 2px; margin: 0; }
      .ver-badge {
        font-size: 0.6rem; padding: 1px 6px;
        background: rgba(0,243,255,0.15); border: 1px solid #00f3ff;
        color: #00f3ff; border-radius: 8px; font-family: monospace; font-weight: bold;
      }

      /* SUNO Loading status box */
      .suno-status-box {
        width: 100%;
        background: rgba(0,243,255,0.08);
        border: 1px solid rgba(0,243,255,0.35);
        border-radius: 14px;
        padding: 10px 12px;
        display: none; flex-direction: column; gap: 6px;
      }
      .suno-status-title { font-size: 0.7rem; color: #00f3ff; letter-spacing: 1px; }
      .suno-status-track { font-size: 0.62rem; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .progress-bar-bg {
        width: 100%; height: 7px;
        background: rgba(255,255,255,0.12);
        border-radius: 4px; overflow: hidden;
      }
      .progress-bar-fill {
        width: 0%; height: 100%;
        background: linear-gradient(90deg, #00f3ff, #ffe600);
        border-radius: 4px;
        transition: width 0.2s ease-out;
      }
      .progress-text { font-size: 0.6rem; color: rgba(255,255,255,0.7); text-align: right; }

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
        width: 100%; padding: 10px;
        background: rgba(255,230,0,0.15);
        border: 1px solid #ffe600; border-radius: 10px;
        color: #ffe600; font-family: inherit; font-size: 0.74rem;
        cursor: pointer; letter-spacing: 1px;
        transition: background 0.2s;
      }
      .bm-btn:hover { background: rgba(255,230,0,0.28); }
      .bm-copied { color: #00ff66 !important; border-color: #00ff66 !important; }

      /* Section label */
      .section-label { font-size: 0.65rem; color: rgba(0,243,255,0.8); letter-spacing: 2px; align-self: flex-start; }

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
      <div class="logo-box">
        <h1>AMULISH</h1>
        <div class="logo-sub-row">
          <span class="sub">LYRIC SHOOTER</span>
          <span class="ver-badge">${APP_VERSION}</span>
        </div>
      </div>

      <!-- SUNO Loading status box -->
      <div class="suno-status-box" id="suno-status-box">
        <div class="suno-status-title">🎵 SUNO曲を読み込み中...</div>
        <div class="suno-status-track" id="suno-track-name">${urlTitle}</div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" id="progress-bar-fill"></div>
        </div>
        <div class="progress-text" id="progress-text">準備中...</div>
      </div>

      <!-- Bookmarklet -->
      <div class="bm-box">
        <div class="bm-title">⚡ SUNO連携ブックマークレット</div>
        <div class="bm-desc">
          ① 下のボタンを押してコードをコピー<br>
          ② ブックマークに登録<br>
          ③ SUNOで好きな曲を再生中に押すだけ！<br>
          ※ 本物の歌詞を自動検出して敵にします！
        </div>
        <button class="bm-btn" id="bm-copy">📋 ブックマークレットをコピー</button>
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

  if (urlAudio) {
    const box = document.getElementById('suno-status-box')!;
    box.style.display = 'flex';
  }
}

function updateAudioProgress(pct: number) {
  const fill = document.getElementById('progress-bar-fill');
  const txt = document.getElementById('progress-text');
  const title = document.querySelector('.suno-status-title');

  if (pct === -1) {
    if (fill) fill.style.width = '100%';
    if (fill) fill.style.background = '#ff3355';
    if (txt) txt.textContent = '準備完了';
    if (title) {
      (title as HTMLElement).textContent = '🎵 SUNO曲セット完了 («START»で再生)';
      (title as HTMLElement).style.color = '#ffe600';
    }
    return;
  }

  const displayPct = Math.max(0, Math.min(100, pct));
  if (fill) fill.style.width = Math.max(4, displayPct) + '%';
  if (txt) txt.textContent = displayPct > 0 ? displayPct + '%' : '読込中... (STARTで起動)';
  if (displayPct >= 100 && title) {
    (title as HTMLElement).textContent = '✅ SUNO曲の読み込み完了！';
    (title as HTMLElement).style.color = '#00ff66';
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
