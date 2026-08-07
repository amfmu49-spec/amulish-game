// SRT / LRC / Plain Text Lyrics parser
export interface LyricLine {
  id: string;
  time: number; // start time in ms
  end: number;  // end time in ms
  text: string;
}

// CONSERVATIVE style prompt detector - only catch lines that are PURELY style tags.
// Japanese text is ALWAYS treated as lyrics. English lyrics should NOT be filtered.
const PURE_STYLE_WORDS = new Set([
  'cyberpunk', 'synthwave', 'edm', 'jpop', 'j-pop', 'kpop', 'k-pop',
  'hiphop', 'hip-hop', 'orchestral', 'instrumental',
]);

export function isStylePromptLine(text: string): boolean {
  if (!text || text.trim().length === 0) return true;
  // Japanese text (hiragana, katakana, kanji) is ALWAYS valid lyrics
  if (/[\u3040-\u30ff\u4e00-\u9faf]/.test(text)) return false;

  const lower = text.toLowerCase().trim();

  // Only reject lines that LOOK LIKE prompt headers
  if (/^style:/i.test(lower)) return true;
  if (/^genre:/i.test(lower)) return true;
  if (/^prompt:/i.test(lower)) return true;

  // Reject lines that are pure BPM/genre tags like "140 BPM, Male Vocals, Cyberpunk"
  // These have NO normal English words - just comma-separated tech tags
  const words = lower.split(/[\s,]+/).filter(Boolean);
  if (words.length === 0) return true;

  // Only filter if EVERY word is a pure style keyword or number/bpm pattern
  const allStyleWords = words.every(w =>
    PURE_STYLE_WORDS.has(w) ||
    /^\d+$/.test(w) ||
    /^\d+bpm$/.test(w) ||
    ['male', 'female', 'vocal', 'vocals', 'upbeat', 'tempo', 'fast', 'slow'].includes(w)
  );

  // Must have multiple words AND all be style words to be a style prompt
  return words.length >= 2 && allStyleWords;
}

export function cleanLyricsText(raw: string): string {
  if (!raw) return '';
  return raw
    // Remove bracket tags like [Verse 1], [Chorus]
    .replace(/\[[^\]]{1,40}\]/g, '')
    // Remove parenthesis tags like (Chorus), (Solo)
    .replace(/\([^\)]{1,30}\)/g, '')
    .trim();
}

export function parseSRT(raw: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const blocks = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split(/\n\n+/);

  for (const block of blocks) {
    const parts = block.trim().split('\n');
    if (parts.length < 3) continue;

    const timeLine = parts[1];
    const match = timeLine.match(
      /(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)/
    );
    if (!match) continue;

    const toMs = (h: string, m: string, s: string, ms: string) =>
      parseInt(h) * 3600000 + parseInt(m) * 60000 + parseInt(s) * 1000 + parseInt(ms.padEnd(3, '0').substring(0, 3));

    const startMs = toMs(match[1], match[2], match[3], match[4]);
    const endMs   = toMs(match[5], match[6], match[7], match[8]);
    const rawText = parts.slice(2).join(' ').replace(/<[^>]+>/g, '').trim();
    const text    = cleanLyricsText(rawText);
    if (text && !isStylePromptLine(text)) {
      lines.push({ id: block.substring(0, 20) + startMs, time: startMs, end: endMs, text });
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}

export function parseLRC(raw: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const rows = raw.split('\n');
  for (const row of rows) {
    const match = row.match(/\[(\d+):(\d+)[\.:](\d+)\](.*)/);
    if (!match) continue;
    const ms = parseInt(match[1]) * 60000 + parseInt(match[2]) * 1000 + parseInt(match[3].padEnd(3, '0').substring(0, 3));
    const text = cleanLyricsText(match[4]);
    if (text && !isStylePromptLine(text)) {
      lines.push({ id: row + ms, time: ms, end: ms + 3000, text });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

export function parseRawText(raw: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const rows = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
    .map(s => cleanLyricsText(s).trim())
    .filter(s => s.length > 0 && !isStylePromptLine(s));

  let time = 500;
  for (let i = 0; i < rows.length; i++) {
    const text = rows[i];
    if (!text) continue;
    lines.push({
      id: 'raw_' + i + '_' + Math.random(),
      time,
      end: time + 2500,
      text,
    });
    time += 1800;
  }
  return lines;
}

export function parseAnyLyrics(raw: string): LyricLine[] {
  if (!raw.trim()) return [];
  if (raw.includes('-->')) return parseSRT(raw);
  if (/\[\d+:\d+/.test(raw)) return parseLRC(raw);
  return parseRawText(raw);
}
