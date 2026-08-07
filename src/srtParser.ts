// SRT parser - returns array of { time: number (ms), text: string }
export interface LyricLine {
  id: string;
  time: number; // start time in ms
  end: number;  // end time in ms
  text: string;
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
    const text    = parts.slice(2).join(' ').replace(/<[^>]+>/g, '').trim();

    if (text) {
      lines.push({ id: block.substring(0, 20) + startMs, time: startMs, end: endMs, text });
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}

// Also supports LRC format: [mm:ss.xx] text
export function parseLRC(raw: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const rows = raw.split('\n');
  for (const row of rows) {
    const match = row.match(/\[(\d+):(\d+)\.(\d+)\](.*)/);
    if (!match) continue;
    const ms = parseInt(match[1]) * 60000 + parseInt(match[2]) * 1000 + parseInt(match[3].padEnd(3, '0').substring(0, 3));
    const text = match[4].trim();
    if (text) lines.push({ id: row, time: ms, end: ms + 3000, text });
  }
  return lines.sort((a, b) => a.time - b.time);
}
