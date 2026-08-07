// SRT / LRC / Plain Text Lyrics parser with meta-tag cleaning
export interface LyricLine {
  id: string;
  time: number; // start time in ms
  end: number;  // end time in ms
  text: string;
}

export function cleanLyricsText(raw: string): string {
  if (!raw) return '';
  return raw
    // Remove all bracket meta tags: [Verse 1], [Chorus], [Bridge], [Guitar Solo], [Intro], [Outro], [Drop], etc.
    .replace(/\[[^\]]*\]/g, '')
    // Remove parentheses meta tags: (Chorus), (Solo), (Repeat x2), etc.
    .replace(/\([^\)]*\)/g, '')
    // Remove common prompt metadata words if isolated
    .replace(/\b(Verse|Chorus|Bridge|Intro|Outro|Hook|Pre-Chorus|Solo|Instrumental|Drop)\s*\d*\b/gi, '')
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

    if (text) {
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
    if (text) lines.push({ id: row + ms, time: ms, end: ms + 3000, text });
  }
  return lines.sort((a, b) => a.time - b.time);
}

export function parseRawText(raw: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const cleanedText = cleanLyricsText(raw);
  const rawRows = cleanedText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const phrases: string[] = [];
  for (const row of rawRows) {
    if (row.length > 14) {
      const sub = row.split(/[、,。.！!？?\s]+/).map(s => cleanLyricsText(s)).filter(s => s.length > 0);
      if (sub.length > 0) phrases.push(...sub);
      else phrases.push(row);
    } else {
      phrases.push(row);
    }
  }

  let time = 1000;
  for (let i = 0; i < phrases.length; i++) {
    const text = phrases[i].trim();
    if (!text) continue;
    lines.push({
      id: 'raw_' + i + '_' + Math.random(),
      time,
      end: time + 3000,
      text,
    });
    time += 2000; // Spawns next phrase every 2 seconds
  }
  return lines;
}

export function parseAnyLyrics(raw: string): LyricLine[] {
  if (!raw.trim()) return [];
  if (raw.includes('-->')) return parseSRT(raw);
  if (/\[\d+:\d+/.test(raw)) return parseLRC(raw);
  return parseRawText(raw);
}
