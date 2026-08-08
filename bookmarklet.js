(function () {
  (async function () {
    const VER = 'v2.4.2';
    const AMULISH_URL = 'https://amfmu49-spec.github.io/amulish-game/';

    // --- Show toast/overlay notification on SUNO page ---
    const overlay = document.createElement('div');
    overlay.id = 'amulish-bookmarklet-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: '999999',
      background: 'rgba(10, 10, 26, 0.95)',
      color: '#fff',
      border: '2px solid #00f0ff',
      borderRadius: '12px',
      padding: '16px 20px',
      fontFamily: 'sans-serif',
      boxShadow: '0 0 30px rgba(0, 240, 255, 0.4)',
      maxWidth: '360px',
      transition: 'all 0.3s ease'
    });
    overlay.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <span style="font-size:20px;">⚡</span>
        <strong style="color:#00f0ff;font-size:16px;">AMULISH ${VER}</strong>
      </div>
      <div id="amulish-bm-status" style="font-size:13px;color:#ccc;margin-bottom:12px;">SUNOデータを取得中...</div>
      <div id="amulish-bm-actions" style="display:flex;gap:8px;"></div>
    `;
    document.body.appendChild(overlay);

    function setStatus(msg, isError = false) {
      const el = document.getElementById('amulish-bm-status');
      if (el) {
        el.textContent = msg;
        if (isError) el.style.color = '#ff4444';
      }
    }

    // --- Helper Functions ---
    function getCookie(n) {
      let e = `; ${document.cookie}`.split(`; ${n}=`);
      return e.length >= 2 ? e.pop().split(';').shift() : null;
    }
    function getToken() {
      return getCookie('__session') ||
        localStorage.getItem('clerk-db-jwt') ||
        localStorage.getItem('__session') || '';
    }
    function cleanText(t) {
      return (t || '').replace(/\r/g, '').replace(/[\u200B-\u200D\u2060\uFEFF]/g, '').trim();
    }
    function isSectionTag(t) {
      const s = cleanText(t);
      return /^\[.*\]$/.test(s) || /^\(.*\)$/.test(s) || /^\uFF08.*\uFF09$/.test(s) || /^【.*】$/.test(s);
    }
    function formatSrtTime(t) {
      const h = Math.floor(t / 3600), r = t % 3600;
      const m = Math.floor(r / 60), s = Math.floor(r % 60);
      const ms = Math.floor((t % 1) * 1000);
      return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms).padStart(3,'0')}`;
    }

    // --- Get song ID ---
    let songId = null;
    const pm = window.location.pathname.match(/\/song\/([a-f0-9\-]+)/i);
    if (pm) songId = pm[1];
    if (!songId) {
      const audioEl = document.querySelector('audio');
      if (audioEl && audioEl.src) {
        const mm = audioEl.src.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
        if (mm) songId = mm[1];
      }
    }
    if (!songId) {
      const mm = window.location.href.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
      if (mm) songId = mm[1];
    }
    if (!songId) {
      setStatus('❌ 曲IDを検出できませんでした。suno.com/song/... のページで実行してください。', true);
      setTimeout(() => overlay.remove(), 5000);
      return;
    }

    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // --- Get audio URL ---
    setStatus('🎵 音源と歌詞を取得中...');
    let audioUrl = `https://cdn1.suno.ai/${songId}.mp3`;
    try {
      const res = await fetch(`https://studio-api.prod.suno.com/api/clip/${songId}`, { headers });
      if (res.ok) {
        const d = await res.json();
        if (d.audio_url) audioUrl = d.audio_url;
        else if (d.clip_url) audioUrl = d.clip_url;
      }
    } catch (e) { console.warn('Clip API fallback', e); }
    const pageAudio = document.querySelector('audio')?.src;
    if (pageAudio && pageAudio.startsWith('http')) audioUrl = pageAudio;

    // --- Get SRT lyrics via aligned_lyrics API ---
    let srtText = '';
    try {
      const res = await fetch(`https://studio-api.prod.suno.com/api/gen/${songId}/aligned_lyrics/v2/`, { headers });
      if (res.ok) {
        const json = await res.json();
        const raw = json.aligned_lyrics || json.data?.aligned_lyrics || [];
        if (Array.isArray(raw) && raw.length > 0) {
          const lines = raw
            .map(i => ({ text: cleanText(i.text || i.word || ''), start: i.start_s || i.start || 0, end: i.end_s || i.end || (i.start_s || 0) + 2 }))
            .filter(i => i.text.length > 0 && !isSectionTag(i.text));

          if (lines.length > 0) {
            srtText = lines.map((l, idx) =>
              `${idx + 1}\n${formatSrtTime(l.start)} --> ${formatSrtTime(l.end)}\n${l.text}`
            ).join('\n\n');
          }
        }
      }
    } catch (e) { console.warn('Aligned Lyrics API error', e); }

    // --- Fallback: plain text from DOM ---
    let plainLyrics = '';
    if (!srtText) {
      let best = '', bn = 0;
      document.querySelectorAll('div,pre,p,section').forEach(el => {
        if (el.childElementCount > 8) return;
        const t = (el.innerText || '').trim();
        const n = (t.match(/\n/g) || []).length;
        if (n > bn && t.length > 80 && t.length < 4000) { bn = n; best = t; }
      });
      plainLyrics = best;
    }

    // --- Get title ---
    const title = (document.title || '').replace(/[|\u2013\-].*/, '').trim() || 'SUNO';
    const finalLyrics = srtText || plainLyrics;

    // --- Prepare Compact URL (Prevent URL Too Long 414 error!) ---
    // Keep URL under 300 chars. Pass large lyrics via window.name JSON payload
    const compactUrl = `${AMULISH_URL}?audio=${encodeURIComponent(audioUrl)}&title=${encodeURIComponent(title)}`;
    const payloadStr = JSON.stringify({ audio: audioUrl, title, lyrics: finalLyrics });

    const lineCount = srtText ? srtText.split('\n\n').length : (plainLyrics ? plainLyrics.split('\n').length : 0);
    setStatus(`✅ 準備完了！歌詞: ${lineCount}行 (${srtText ? 'SRT同期' : 'テキスト'})`);

    const openGame = (isSameTab = false) => {
      if (isSameTab) {
        window.name = payloadStr;
        window.location.href = compactUrl;
      } else {
        const win = window.open(compactUrl, '_blank');
        if (win) {
          win.name = payloadStr;
        } else {
          window.name = payloadStr;
          window.location.href = compactUrl;
        }
      }
    };

    const actions = document.getElementById('amulish-bm-actions');
    if (actions) {
      actions.innerHTML = `
        <button id="amulish-open-tab-btn" style="flex:1;background:linear-gradient(135deg,#00f0ff,#7000ff);color:#fff;text-align:center;padding:10px 14px;border:none;border-radius:8px;font-weight:bold;font-size:13px;cursor:pointer;">🎮 ゲームを開始 (別タブ)</button>
        <button id="amulish-direct-btn" style="background:#222;color:#fff;border:1px solid #444;padding:10px;border-radius:8px;cursor:pointer;font-size:12px;">Direct</button>
      `;

      document.getElementById('amulish-open-tab-btn').onclick = () => openGame(false);
      document.getElementById('amulish-direct-btn').onclick = () => openGame(true);
    }

    // Auto navigate after 1秒
    setTimeout(() => {
      openGame(false);
    }, 1000);

  })();
})();
