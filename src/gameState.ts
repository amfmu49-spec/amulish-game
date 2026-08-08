import { type LyricLine, isStylePromptLine, cleanLyricsText } from './srtParser';
import type { AudioEngine } from './audioEngine';

const FONTS = [
  'Dela Gothic One', 'Reggae One', 'DotGothic16', 'RocknRoll One',
  'Mochiy Pop One', 'Potta One', 'Rampart One', 'Kaisei Tokumin', 'Shippori Mincho'
];

const PALETTES = [
  { text: '#00f3ff', glow: 'rgba(0,243,255,0.9)' },
  { text: '#ff007f', glow: 'rgba(255,0,127,0.9)' },
  { text: '#ffe600', glow: 'rgba(255,230,0,0.9)' },
  { text: '#00ff66', glow: 'rgba(0,255,102,0.9)' },
  { text: '#cc44ff', glow: 'rgba(204,68,255,0.9)' },
  { text: '#ff6622', glow: 'rgba(255,102,34,0.9)' },
];

export interface Char {
  ch: string;
  relX: number; relY: number;
  fontSize: number; font: string;
  color: string; glow: string;
  rot: number;
  hp: number; maxHp: number;
  flash: number;
}

export interface Enemy {
  id: string;
  x: number; y: number;
  vx: number; vy: number;
  chars: Char[];
  w: number; h: number;
}

export interface Bullet {
  x: number; y: number;
  vx: number; vy: number;
  r: number; color: string; damage: number;
}

export interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
  text?: string; font?: string;
}

export interface FloatingText {
  x: number; y: number;
  vy: number; life: number;
  text: string; color: string;
}

export interface EnemyBullet {
  x: number; y: number;
  vx: number; vy: number;
  r: number; color: string;
}

export class GameState {
  W: number; H: number;
  phase: 'TITLE' | 'PLAYING' | 'RESULT' = 'TITLE';

  px = 0; py = 0;
  playerHp = 100;
  maxPlayerHp = 100;
  invincibleTimer = 0;

  enemies: Enemy[] = [];
  bullets: Bullet[] = [];
  particles: Particle[] = [];
  floatingTexts: FloatingText[] = [];

  score = 0; combo = 0; maxCombo = 0;
  fever = 0; isFever = false;
  shakeAmt = 0;
  totalShots = 0; hits = 0;

  enemyBullets: EnemyBullet[] = [];
  difficulty: 'EASY' | 'NORMAL' | 'HARD' = 'NORMAL';

  private timeMs = 0;
  private lyrics: LyricLine[] = [];
  private lyricIdx = 0;
  private lyricTimeOffset = 0;
  private fireTimer = 0;
  private enemyFireTimer = 0;
  private readonly FIRE_MS = 220;

  private ENEMY_FIRE_MS = 1400;
  private ENEMY_MAX_SHOOTERS = 1;

  private audio: AudioEngine | null = null;

  setDifficulty(d: 'EASY' | 'NORMAL' | 'HARD') {
    this.difficulty = d;
    if (d === 'EASY') {
      this.ENEMY_FIRE_MS = 1800;
      this.ENEMY_MAX_SHOOTERS = 1;
    } else if (d === 'NORMAL') {
      this.ENEMY_FIRE_MS = 1400;
      this.ENEMY_MAX_SHOOTERS = 1;
    } else {
      this.ENEMY_FIRE_MS = 650;
      this.ENEMY_MAX_SHOOTERS = 3;
    }
  }

  constructor(W: number, H: number) {
    this.W = W; this.H = H;
    this.px = W / 2; this.py = H * 0.75;
  }

  setAudio(a: AudioEngine) { this.audio = a; }
  setLyrics(l: LyricLine[]) { this.lyrics = l.filter(line => !isStylePromptLine(line.text)); this.lyricIdx = 0; }
  syncTime(ms: number) { this.timeMs = ms; }

  startGame() {
    this.phase = 'PLAYING';
    this.enemies = []; this.bullets = []; this.particles = [];
    this.floatingTexts = []; this.enemyBullets = [];
    this.score = 0; this.combo = 0; this.maxCombo = 0;
    this.fever = 0; this.isFever = false;
    this.playerHp = 100; this.maxPlayerHp = 100;
    this.invincibleTimer = 0;
    this.shakeAmt = 0; this.totalShots = 0; this.hits = 0;
    this.lyricIdx = 0; this.timeMs = 0; this.lyricTimeOffset = 0;
    this.fireTimer = 0; this.enemyFireTimer = 0;
    this.spawnTimer = 0;
    this.px = this.W / 2; this.py = this.H * 0.75;
  }

  goToTitle() {
    this.phase = 'TITLE';
    this.enemies = []; this.bullets = []; this.particles = [];
    this.floatingTexts = []; this.enemyBullets = [];
  }

  movePlayer(dx: number, dy: number) {
    this.px = Math.max(20, Math.min(this.W - 20, this.px + dx));
    this.py = Math.max(60, Math.min(this.H - 60, this.py + dy));
  }

  update(dt: number) {
    if (this.phase !== 'PLAYING') return;

    if (this.invincibleTimer > 0) this.invincibleTimer -= dt;

    this._spawnLyrics(dt);

    // Player auto-fire
    this.fireTimer -= dt;
    if (this.fireTimer <= 0) { this._fire(); this.fireTimer = this.FIRE_MS; }

    // Enemy fire
    this.enemyFireTimer -= dt;
    if (this.enemyFireTimer <= 0) { this._enemyFire(); this.enemyFireTimer = this.ENEMY_FIRE_MS; }

    // Update player bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt * 0.06;
      b.y += b.vy * dt * 0.06;
      if (b.y < -20 || b.x < -20 || b.x > this.W + 20) this.bullets.splice(i, 1);
    }

    // Update enemy bullets
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const eb = this.enemyBullets[i];
      eb.x += eb.vx * dt * 0.06;
      eb.y += eb.vy * dt * 0.06;
      if (eb.y > this.H + 20 || eb.x < -20 || eb.x > this.W + 20) {
        this.enemyBullets.splice(i, 1); continue;
      }
      // Hit player?
      const dx = eb.x - this.px, dy = eb.y - this.py;
      if (dx * dx + dy * dy < 20 * 20) {
        this.enemyBullets.splice(i, 1);
        this._damagePlayer(20, 'BULLET');
      }
    }

    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.x += e.vx * dt * 0.06;
      e.y += e.vy * dt * 0.06;
      if ((e.x - e.w / 2 < 0 && e.vx < 0) || (e.x + e.w / 2 > this.W && e.vx > 0)) e.vx *= -1;
      if (e.y > this.H + 120) { this.combo = 0; this.enemies.splice(i, 1); continue; }

      // Enemy crash into player
      const dx = e.x - this.px, dy = e.y - this.py;
      if (dx * dx + dy * dy < (e.w * 0.45) ** 2 + 20 * 20) {
        this._damagePlayer(25, 'CRASH');
      }

      for (const c of e.chars) { if (c.flash > 0) c.flash -= dt; }
    }

    this._checkCollisions();

    // Check Game Over
    if (this.playerHp <= 0) {
      this.playerHp = 0;
      this.phase = 'RESULT';
      this.audio?.playExplodeSound();
      return;
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      p.x += p.vx * dt * 0.06;
      p.y += p.vy * dt * 0.06;
      p.vy += 0.04 * dt;
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const f = this.floatingTexts[i];
      f.life -= dt;
      if (f.life <= 0) { this.floatingTexts.splice(i, 1); continue; }
      f.y += f.vy * dt * 0.06;
    }

    // Fever decay
    if (this.isFever) {
      this.fever -= dt * 0.055;
      if (this.fever <= 0) { this.fever = 0; this.isFever = false; }
    }

    // Shake decay
    if (this.shakeAmt > 0) this.shakeAmt = Math.max(0, this.shakeAmt - dt * 0.012);

    // Cap object counts
    if (this.particles.length > 120) this.particles.splice(0, this.particles.length - 120);
    if (this.bullets.length > 60) this.bullets.splice(0, this.bullets.length - 60);
    if (this.enemyBullets.length > 30) this.enemyBullets.splice(0, this.enemyBullets.length - 30);
  }

  private _damagePlayer(amount: number, reason: string) {
    if (this.invincibleTimer > 0) return;

    this.playerHp -= amount;
    this.invincibleTimer = 1200;
    this.combo = Math.max(0, this.combo - 5);
    this.fever = Math.max(0, this.fever - 25);
    if (this.fever < 100) this.isFever = false;
    this.shakeAmt = Math.max(this.shakeAmt, 10);
    this.floatingTexts.push({
      x: this.px, y: this.py - 20, vy: -2, life: 600,
      text: reason === 'CRASH' ? 'CRASH! -25HP' : '-20 HP!', color: '#ff2255'
    });
    this.audio?.playHitSound();
  }

  customWords: string[] = [];
  setCustomWords(words: string[]) {
    this.customWords = words.filter(w => !isStylePromptLine(w));
  }

  private spawnTimer = 0;

  private _spawnLyrics(dt: number) {
    if (this.lyrics.length === 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        const cleanCustom = this.customWords.filter(w => w && !isStylePromptLine(w));
        const pool = cleanCustom.length > 0
          ? [...cleanCustom, 'AMULISH', 'FEVER', 'BEAT', 'SONIC', '爆発', '電撃', 'RHYTHM', 'OVERDRIVE', '極限', '覇道']
          : ['AMULISH', 'FEVER', 'BEAT', 'COMBO', 'SONIC', 'RHYTHM', 'BLAZE', 'NOVA', '爆発', '電撃', '嵐', '覇道', '狂乱', '轟音'];
        const word = pool[Math.floor(Math.random() * pool.length)];
        this._spawnEnemy(word);
        this.spawnTimer = 800 + Math.random() * 500;
      }
      return;
    }

    // Relative time lyrics spawning
    const relTime = this.timeMs - this.lyricTimeOffset;
    while (this.lyricIdx < this.lyrics.length && relTime >= this.lyrics[this.lyricIdx].time) {
      this._spawnEnemy(this.lyrics[this.lyricIdx].text);
      this.lyricIdx++;
    }

    // Loop lyrics
    if (this.lyricIdx >= this.lyrics.length) {
      const lastTime = this.lyrics[this.lyrics.length - 1].time;
      if (relTime >= lastTime + 3000) {
        this.lyricTimeOffset = this.timeMs;
        this.lyricIdx = 0;
      }
    }
  }

  private _spawnEnemy(text: string) {
    const cleaned = cleanLyricsText(text).trim();
    if (!cleaned || isStylePromptLine(cleaned)) return;

    const chars: Char[] = [];
    const len = cleaned.length;

    let mode: 'HORIZONTAL' | 'BLOCK' | 'VERTICAL' = 'HORIZONTAL';
    const rand = Math.random();
    const hasJapanese = /[\u3040-\u30ff\u4e00-\u9faf]/.test(cleaned);

    if (hasJapanese && rand < 0.32) {
      mode = 'VERTICAL';
    } else if (len > 6 || rand < 0.45) {
      mode = 'BLOCK';
    }

    if (mode === 'VERTICAL') {
      // 縦書き: 自機(下)から歌の順番で壊せるように文頭が「一番下」に来る配列にする
      const charArr = [...cleaned].reverse();
      let curY = 0;
      let maxW = 0;
      for (const ch of charArr) {
        const fontSize = 32 + Math.random() * 20;
        const font = FONTS[Math.floor(Math.random() * FONTS.length)];
        const pal = PALETTES[Math.floor(Math.random() * PALETTES.length)];
        const rot = (Math.random() - 0.5) * 0.15;
        const hp = 1;
        const relX = (Math.random() - 0.5) * 6;
        chars.push({ ch, relX, relY: curY, fontSize, font, color: pal.text, glow: pal.glow, rot, hp, maxHp: hp, flash: 0 });
        curY += fontSize * 1.08;
        if (fontSize > maxW) maxW = fontSize;
      }
      const halfH = curY / 2;
      for (const c of chars) c.relY -= halfH;

      const spawnX = Math.max(maxW + 20, Math.min(this.W - maxW - 20, Math.random() * this.W));
      this.enemies.push({
        id: Math.random().toString(36).slice(2),
        x: spawnX, y: -(curY + 20),
        vx: (Math.random() - 0.5) * 1.0,
        vy: 0.9 + Math.random() * 0.7,
        chars, w: maxW * 1.2, h: curY,
      });

    } else if (mode === 'BLOCK') {
      const maxCols = len > 12 ? 5 : (len > 8 ? 4 : 3);
      let col = 0, row = 0;
      const baseFontSize = len > 12 ? 30 : 36;
      const rowHeight = baseFontSize * 1.15;

      const charRows: { charObj: Char; rowIdx: number }[] = [];
      let maxRowW = 0;
      const rowWidths: number[] = [];
      let curRowW = 0;

      for (let i = 0; i < len; i++) {
        const ch = cleaned[i];
        const fontSize = baseFontSize + Math.random() * 10;
        const font = FONTS[Math.floor(Math.random() * FONTS.length)];
        const pal = PALETTES[Math.floor(Math.random() * PALETTES.length)];
        const rot = (Math.random() - 0.5) * 0.2;
        const hp = 1; // 1-hit kill!
        const charW = fontSize * 1.05;

        const charObj: Char = {
          ch, relX: curRowW, relY: row * rowHeight,
          fontSize, font, color: pal.text, glow: pal.glow, rot, hp, maxHp: hp, flash: 0
        };

        chars.push(charObj);
        charRows.push({ charObj, rowIdx: row });

        curRowW += charW;
        col++;
        if (col >= maxCols || i === len - 1) {
          rowWidths.push(curRowW);
          if (curRowW > maxRowW) maxRowW = curRowW;
          curRowW = 0;
          col = 0;
          row++;
        }
      }
      const totalH = row * rowHeight;
      const offsetY = -totalH / 2;

      for (const item of charRows) {
        const rW = rowWidths[item.rowIdx] || maxRowW;
        item.charObj.relX -= rW / 2;
        item.charObj.relY += offsetY;
      }

      const spawnX = Math.max(maxRowW / 2 + 20, Math.min(this.W - maxRowW / 2 - 20, Math.random() * this.W));
      this.enemies.push({
        id: Math.random().toString(36).slice(2),
        x: spawnX, y: -(totalH + 20),
        vx: (Math.random() - 0.5) * 1.1,
        vy: 0.9 + Math.random() * 0.6,
        chars, w: maxRowW, h: totalH,
      });

    } else {
      let curX = 0, maxH = 0;
      for (const ch of cleaned) {
        const fontSize = 34 + Math.random() * 20;
        const font = FONTS[Math.floor(Math.random() * FONTS.length)];
        const pal = PALETTES[Math.floor(Math.random() * PALETTES.length)];
        const rot = (Math.random() - 0.5) * 0.2;
        const hp = 1; // 1-hit kill!
        const relY = (Math.random() - 0.5) * 6;
        const charW = fontSize * 1.08;
        chars.push({ ch, relX: curX, relY, fontSize, font, color: pal.text, glow: pal.glow, rot, hp, maxHp: hp, flash: 0 });
        curX += charW;
        if (fontSize + Math.abs(relY) > maxH) maxH = fontSize + Math.abs(relY);
      }

      const half = curX / 2;
      for (const c of chars) c.relX -= half;

      const spawnX = Math.max(half + 10, Math.min(this.W - half - 10, Math.random() * this.W));
      this.enemies.push({
        id: Math.random().toString(36).slice(2),
        x: spawnX, y: -(maxH + 20),
        vx: (Math.random() - 0.5) * 1.2,
        vy: 1.0 + Math.random() * 0.7,
        chars, w: curX, h: maxH,
      });
    }
  }

  private _fire() {
    const lvl = this.shotLevel();
    const fever = this.isFever;
    const cx = this.px, cy = this.py - 22;
    const col = fever ? '#ffe600' : '#00f3ff';
    this.totalShots++;
    this.audio?.playShotSound();

    const push = (vx: number, vy: number, r: number, color: string, dmg: number) =>
      this.bullets.push({ x: cx, y: cy, vx, vy, r, color, damage: dmg });

    if (lvl === 1) { push(0, -18, 4, col, 1); }
    else if (lvl === 2) { push(-0.4, -18, 4, col, 1); push(0.4, -18, 4, col, 1); }
    else if (lvl === 3) { push(0, -18, 5, '#ff00ff', 1.5); push(-2.5, -16, 4, col, 1); push(2.5, -16, 4, col, 1); }
    else if (lvl === 4) {
      for (let a = -1.5; a <= 1.5; a += 0.75) push(Math.sin(a) * 13, -Math.cos(a) * 18, 5, '#00ff66', 1.5);
    } else {
      for (let a = -2; a <= 2; a += 0.5) push(Math.sin(a) * 14, -Math.cos(a) * 20, 6, '#ffe600', 2);
    }
  }

  private _enemyFire() {
    if (this.enemies.length === 0) return;

    const shooters = this.enemies
      .filter(e => e.y > 0 && e.y < this.H * 0.7)
      .sort(() => Math.random() - 0.5)
      .slice(0, this.ENEMY_MAX_SHOOTERS);

    for (const e of shooters) {
      const dx = this.px - e.x;
      const dy = this.py - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const speed = 4 + Math.random() * 2.5;

      if (this.difficulty === 'HARD') {
        const bulletCount = 3;
        for (let i = 0; i < bulletCount; i++) {
          const fan = (i - 1) * 2.5;
          this.enemyBullets.push({
            x: e.x, y: e.y,
            vx: (dx / dist) * speed + fan,
            vy: (dy / dist) * speed,
            r: 5, color: '#ff3355',
          });
        }
      } else {
        this.enemyBullets.push({
          x: e.x, y: e.y,
          vx: (dx / dist) * speed,
          vy: (dy / dist) * speed,
          r: 4.5, color: '#ff3355',
        });
      }
    }
  }

  private _checkCollisions() {
    outer: for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      const b = this.bullets[bi];
      for (const e of this.enemies) {
        for (const c of e.chars) {
          if (c.hp <= 0) continue;
          const dx = b.x - (e.x + c.relX), dy = b.y - (e.y + c.relY);
          if (dx * dx + dy * dy < (c.fontSize * 0.52) ** 2) {
            c.hp -= b.damage; c.flash = 140;
            this.hits++;
            this.audio?.playHitSound();
            this.bullets.splice(bi, 1);

            if (c.hp <= 0) {
              this.combo++;
              if (this.combo > this.maxCombo) this.maxCombo = this.combo;
              this.score += 100 * this.combo;
              if (this.combo % 10 === 0) this.audio?.playComboSound(this.combo);
              this.fever = Math.min(100, this.fever + 3.5);
              if (this.fever >= 100) this.isFever = true;
              if (this.combo >= 10) this.shakeAmt = Math.min(8, this.combo * 0.07);
              this._burst(e.x + c.relX, e.y + c.relY, c);
              if (this.combo >= 20) {
                this.floatingTexts.push({ x: e.x + c.relX, y: e.y + c.relY - 18, vy: -1.8, life: 600, text: `${this.combo} COMBO!`, color: '#ffe600' });
              }
            }
            continue outer;
          }
        }
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (this.enemies[i].chars.every(c => c.hp <= 0)) {
        this.audio?.playExplodeSound();
        this.enemies.splice(i, 1);
      }
    }
  }

  private _burst(x: number, y: number, c: Char) {
    const n = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 4;
      this.particles.push({
        x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd - 2,
        life: 350 + Math.random() * 280, maxLife: 630,
        color: c.color, size: 3 + Math.random() * 3.5,
        text: Math.random() < 0.35 ? c.ch : undefined, font: c.font,
      });
    }
  }

  shotLevel(): number {
    if (this.isFever) return 5;
    if (this.combo >= 100) return 4;
    if (this.combo >= 50) return 3;
    if (this.combo >= 20) return 2;
    return 1;
  }

  get accuracy() {
    return this.totalShots === 0 ? 100 : Math.round((this.hits / this.totalShots) * 100);
  }
  get rank(): 'S' | 'A' | 'B' | 'C' {
    if (this.accuracy >= 85 && this.maxCombo >= 30) return 'S';
    if (this.accuracy >= 70 || this.maxCombo >= 20) return 'A';
    if (this.accuracy >= 50) return 'B';
    return 'C';
  }
}
