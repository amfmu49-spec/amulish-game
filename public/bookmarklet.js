(function () {
  (async function () {
    const VER = 'v2.2.2';
    const AMULISH_URL = 'https://amfmu49-spec.github.io/amulish-game/';

    // --- Get auth token (same as AMUVI) ---
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
      alert(`[AMULISH ${VER}] 曲IDを検出できませんでした。\nsuno.com/song/... のページで実行してください。`);
      return;
    }

    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // --- Get audio URL ---
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

    // --- Open AMULISH ---
    let url = `${AMULISH_URL}?audio=${encodeURIComponent(audioUrl)}&title=${encodeURIComponent(title)}`;
    if (srtText) url += `&lyrics=${encodeURIComponent(srtText.substring(0, 4000))}`;
    else if (plainLyrics) url += `&lyrics=${encodeURIComponent(plainLyrics.substring(0, 3000))}`;

    console.log(`[AMULISH ${VER}] SRT lines: ${srtText ? srtText.split('\n\n').length : 0}, audio: ${audioUrl}`);
    window.open(url, '_blank');
  })();
})();
