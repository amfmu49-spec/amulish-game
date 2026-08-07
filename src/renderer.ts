// Renderer - pure Canvas 2D, optimized for 60fps on mobile
import type { GameState } from './gameState';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private W = 0; private H = 0;
  private stars: { x: number; y: number; speed: number }[] = [];
  private readonly STAR_COUNT = 70;

  constructor(ctx: CanvasRenderingContext2D, W: number, H: number) {
    this.ctx = ctx;
    this.setSize(W, H);
  }

  setSize(W: number, H: number) {
    this.W = W; this.H = H;
    this.stars = Array.from({ length: this.STAR_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      speed: 0.6 + Math.random() * 1.4,
    }));
  }

  render(state: GameState, W: number, H: number) {
    const ctx = this.ctx;

    ctx.save();
    if (state.shakeAmt > 0) {
      ctx.translate(
        (Math.random() - 0.5) * state.shakeAmt * 2,
        (Math.random() - 0.5) * state.shakeAmt * 2
      );
    }

    // BG
    ctx.fillStyle = state.isFever ? '#08000e' : '#000010';
    ctx.fillRect(0, 0, W, H);

    this._stars(state.isFever);
    if (state.isFever || state.combo >= 50) this._speedlines(state.combo, state.isFever);

    // Items
    for (const item of state.items) {
      ctx.save();
      ctx.translate(item.x, item.y);
      // Pulsing glow
      const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.15;
      ctx.scale(pulse, pulse);

      ctx.shadowColor = item.color;
      ctx.shadowBlur = 16;
      ctx.fillStyle = 'rgba(10,15,30,0.85)';
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, item.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = `bold 16px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowBlur = 0;
      ctx.fillText(item.label, 0, 1);
      ctx.restore();
    }

    // Enemies
    for (const e of state.enemies) {
      for (const c of e.chars) {
        if (c.hp <= 0) continue;
        const cx = e.x + c.relX;
        const cy = e.y + c.relY;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(c.rot);
        ctx.font = `900 ${c.fontSize}px '${c.font}', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';

        // Layer 1: Outline
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(0,0,0,0.85)';
        ctx.lineWidth = c.fontSize * 0.10;
        ctx.strokeText(c.ch, 0, 0);

        // Layer 2: Glow
        ctx.shadowColor = c.flash > 0 ? '#ffffff' : c.glow;
        ctx.shadowBlur = c.flash > 0 ? 20 : (state.isFever ? 16 : 10);
        ctx.strokeStyle = c.flash > 0 ? '#ffffff' : c.color;
        ctx.lineWidth = c.fontSize * 0.05;
        ctx.strokeText(c.ch, 0, 0);

        // Layer 3: Fill
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(c.ch, 0, 0);

        // HP bar (kanji/kana have multiple HP)
        if (c.maxHp > 1) {
          const bw = c.fontSize * 0.7;
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillRect(-bw / 2 - 1, c.fontSize * 0.52 - 1, bw + 2, 5);
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect(-bw / 2, c.fontSize * 0.52, bw, 3);
          ctx.fillStyle = c.hp / c.maxHp > 0.5 ? '#00ff66' : '#ff2255';
          ctx.fillRect(-bw / 2, c.fontSize * 0.52, bw * (c.hp / c.maxHp), 3);
        }
        ctx.restore();
      }
    }

    // Player bullets
    ctx.shadowBlur = 10;
    for (const b of state.bullets) {
      ctx.shadowColor = b.color;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.r, b.r * 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Enemy bullets
    ctx.shadowBlur = 14;
    for (const eb of state.enemyBullets) {
      ctx.shadowColor = '#ff3355';
      ctx.fillStyle = '#ff3355';
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, eb.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffaaaa';
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, eb.r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 14;
    }
    ctx.shadowBlur = 0;

    // Particles
    for (const p of state.particles) {
      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      if (p.text && p.font) {
        ctx.font = `bold ${p.size * 2.5}px '${p.font}', sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }

    // Floating combo texts
    for (const f of state.floatingTexts) {
      const alpha = Math.min(1, f.life / 300);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `900 16px 'Dela Gothic One', sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = f.color;
      ctx.shadowColor = f.color; ctx.shadowBlur = 12;
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }

    // Player (with invulnerability blinking & shield aura)
    if (state.invincibleTimer <= 0 || Math.floor(Date.now() / 80) % 2 === 0) {
      this._player(state.px, state.py, state.shotLevel(), state.isFever, state.shieldTimer > 0);
    }

    // HUD
    this._hud(state, W, H);

    ctx.restore();
  }

  renderTitle(_state: GameState, W: number, H: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#000010';
    ctx.fillRect(0, 0, W, H);
    this._stars(false);
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.font = `900 ${W * 0.18}px 'Dela Gothic One', sans-serif`;
    ctx.fillStyle = '#00f3ff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('AMULISH', W / 2, H * 0.5);
    ctx.restore();
  }

  renderResult(_state: GameState, W: number, H: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#000010';
    ctx.fillRect(0, 0, W, H);
    this._stars(false);
  }

  private _stars(fever: boolean) {
    const ctx = this.ctx;
    for (const s of this.stars) {
      s.y += s.speed * (fever ? 7 : 1);
      if (s.y > this.H) { s.y = 0; s.x = Math.random() * this.W; }
      ctx.fillStyle = fever
        ? `rgba(255,220,80,${s.speed * 0.4})`
        : `rgba(255,255,255,${s.speed * 0.35})`;
      ctx.fillRect(s.x, s.y, 1.5, fever ? 10 : 2);
    }
  }

  private _speedlines(combo: number, fever: boolean) {
    const ctx = this.ctx;
    const n = Math.min(18, 6 + Math.floor(combo / 8));
    ctx.strokeStyle = fever ? 'rgba(255,220,0,0.18)' : 'rgba(0,243,255,0.1)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = Math.random() * this.W;
      const y = Math.random() * this.H;
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 40 + Math.random() * 80);
    }
    ctx.stroke();
  }

  private _player(px: number, py: number, _level: number, fever: boolean, hasShield = false) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(px, py);

    // Shield barrier aura
    if (hasShield) {
      ctx.strokeStyle = '#00f3ff';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 32 + Math.sin(Date.now() * 0.01) * 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Engine glow
    const grad = ctx.createRadialGradient(0, 12, 0, 0, 12, 28);
    grad.addColorStop(0, fever ? 'rgba(255,200,0,0.7)' : 'rgba(0,180,255,0.7)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(0, 12, 28, 0, Math.PI * 2); ctx.fill();

    const col = fever ? '#ffe600' : '#00f3ff';
    ctx.shadowColor = col; ctx.shadowBlur = fever ? 22 : 14;
    ctx.fillStyle = col;

    // Body
    ctx.beginPath();
    ctx.moveTo(0, -22); ctx.lineTo(-11, 13); ctx.lineTo(-4, 7);
    ctx.lineTo(0, 11); ctx.lineTo(4, 7); ctx.lineTo(11, 13);
    ctx.closePath(); ctx.fill();

    // Wings
    ctx.fillStyle = fever ? '#ff9900' : '#0099ff';
    ctx.beginPath(); ctx.moveTo(-12, 10); ctx.lineTo(-20, 18); ctx.lineTo(-10, 13); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(12, 10); ctx.lineTo(20, 18); ctx.lineTo(10, 13); ctx.closePath(); ctx.fill();

    ctx.restore();
  }

  private _hud(state: GameState, W: number, _H: number) {
    const ctx = this.ctx;
    ctx.save();

    // Score top-left
    ctx.font = `bold 16px 'Dela Gothic One', monospace`;
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#00f3ff'; ctx.shadowBlur = 6;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(state.score.toLocaleString(), 12, 44);

    // Combo top-right
    if (state.combo > 1) {
      const sz = Math.min(20, 12 + state.combo * 0.07);
      ctx.font = `900 ${sz}px 'Dela Gothic One', monospace`;
      ctx.textAlign = 'right'; ctx.textBaseline = 'top';
      ctx.fillStyle = state.isFever ? '#ffe600' : '#00f3ff';
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 14;
      ctx.fillText(`${state.combo}x`, W - 12, 44);
    }

    // Fever bar (top bar)
    const bW = W * 0.45; const bX = W / 2 - bW / 2;
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.roundRect(bX, 14, bW, 6, 3); ctx.fill();
    if (state.fever > 0) {
      const g = ctx.createLinearGradient(bX, 0, bX + bW, 0);
      g.addColorStop(0, '#00f3ff'); g.addColorStop(1, state.isFever ? '#ffe600' : '#ff00bb');
      ctx.fillStyle = g;
      ctx.shadowColor = state.isFever ? '#ffe600' : '#ff00bb'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.roundRect(bX, 14, bW * (state.fever / 100), 6, 3); ctx.fill();
    }

    // HP Bar (Player Health Bar above bottom or below top HUD)
    const hpW = 120;
    const hpX = 12;
    const hpY = 66;
    const hpPct = Math.max(0, state.playerHp / state.maxPlayerHp);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(hpX, hpY, hpW, 10, 5); ctx.fill(); ctx.stroke();

    if (hpPct > 0) {
      const hpColor = hpPct > 0.5 ? '#00ff66' : (hpPct > 0.25 ? '#ffe600' : '#ff2255');
      ctx.fillStyle = hpColor;
      ctx.shadowColor = hpColor; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.roundRect(hpX, hpY, hpW * hpPct, 10, 5); ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.font = `bold 9px sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(`HP ${Math.ceil(state.playerHp)}`, hpX + 6, hpY + 5);

    // FEVER text
    if (state.isFever) {
      ctx.font = `900 11px 'Dela Gothic One', monospace`;
      ctx.fillStyle = '#ffe600'; ctx.shadowColor = '#ffe600'; ctx.shadowBlur = 18;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('⚡ FEVER ⚡', W / 2, 22);
    }

    ctx.restore();
  }
}
