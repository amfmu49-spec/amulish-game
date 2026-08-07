// SRT / LRC / Plain Text Lyrics parser
export interface LyricLine {
  id: string;
  time: number; // start time in ms
  end: number;  // end time in ms
  text: string;
}

// Remove section headers and meta formatting
export function cleanLyricsText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\[[^\]]{1,40}\]/g, '')   // [Verse 1], [Chorus], etc.
    .replace(/\([^\)]{1,30}\)/g, '')    // (Solo), (Repeat), etc.
    .replace(/\*\*[^*]+\*\*/g, '')      // **bold** markdown
    .trim();
}

// Returns true if a line is NOT song lyrics:
// - SUNO-style genre tags: "J-Pop · Cyberpunk · 140 BPM"
// - Comma lists of style keywords: "upbeat, electronic, male vocals"
// - UI labels, buttons, navigation text
export function isStylePromptLine(text: string): boolean {
  if (!text || text.trim().length === 0) return true;

  const t = text.trim();

  // Lines shorter than 2 chars are not lyrics
  if (t.length < 2) return true;

  // Japanese text (hiragana, katakana, kanji) → always lyrics
  if (/[\u3040-\u30ff\u4e00-\u9faf]/.test(t)) return false;

  // SUNO-specific: "J-Pop · Cyberpunk" style separators
  if (t.includes(' · ') || t.includes(' • ')) return true;

  // Lines that are only a URL
  if (/^https?:\/\//.test(t)) return true;

  // Lines that look like UI nav / buttons (short, title case, no punctuation, <25 chars)
  if (t.length < 20 && /^[A-Z][a-z]/.test(t) && !/[,!?'"…\u3000-\u9fff]/.test(t) && !/\s/.test(t.slice(1))) return true;

  // Lines with 3+ commas are likely style tag lists ("pop, electronic, dark, female")
  if ((t.match(/,/g) || []).length >= 3) return true;

  const lower = t.toLowerCase();
  if (lower.startsWith('style:') || lower.startsWith('genre:') || lower.startsWith('prompt:')) return true;

  return false;
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
    .filter(s => {
      if (!s || s.length < 2) return false;
      if (isStylePromptLine(s)) return false;
      // Skip very long lines (probably UI text or paragraphs, not lyric phrases)
      if (s.length > 120) return false;
      // Skip lines that are all uppercase single words (likely UI labels)
      if (/^[A-Z]{2,}$/.test(s)) return false;
      return true;
    });

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
