(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e){return e?e.replace(/\[[^\]]{1,40}\]/g,``).replace(/\([^\)]{1,30}\)/g,``).replace(/\*\*[^*]+\*\*/g,``).trim():``}function t(e){if(!e||e.trim().length===0)return!0;let t=e.trim();if(t.length<2)return!0;if(/[\u3040-\u30ff\u4e00-\u9faf]/.test(t))return!1;if(t.includes(` · `)||t.includes(` • `)||/^https?:\/\//.test(t)||t.length<20&&/^[A-Z][a-z]/.test(t)&&!/[,!?'"…\u3000-\u9fff]/.test(t)&&!/\s/.test(t.slice(1))||(t.match(/,/g)||[]).length>=3)return!0;let n=t.toLowerCase();return!!(n.startsWith(`style:`)||n.startsWith(`genre:`)||n.startsWith(`prompt:`))}function n(n){let r=[],i=n.replace(/\r\n/g,`
`).replace(/\r/g,`
`).trim().split(/\n\n+/);for(let n of i){let i=n.trim().split(`
`);if(i.length<3)continue;let a=i[1].match(/(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)/);if(!a)continue;let o=(e,t,n,r)=>parseInt(e)*36e5+parseInt(t)*6e4+parseInt(n)*1e3+parseInt(r.padEnd(3,`0`).substring(0,3)),s=o(a[1],a[2],a[3],a[4]),c=o(a[5],a[6],a[7],a[8]),l=e(i.slice(2).join(` `).replace(/<[^>]+>/g,``).trim());l&&!t(l)&&r.push({id:n.substring(0,20)+s,time:s,end:c,text:l})}return r.sort((e,t)=>e.time-t.time)}function r(n){let r=[],i=n.split(`
`);for(let n of i){let i=n.match(/\[(\d+):(\d+)[\.:](\d+)\](.*)/);if(!i)continue;let a=parseInt(i[1])*6e4+parseInt(i[2])*1e3+parseInt(i[3].padEnd(3,`0`).substring(0,3)),o=e(i[4]);o&&!t(o)&&r.push({id:n+a,time:a,end:a+3e3,text:o})}return r.sort((e,t)=>e.time-t.time)}function i(n){let r=[],i=n.replace(/\r\n/g,`
`).replace(/\r/g,`
`).split(`
`).map(t=>e(t).trim()).filter(e=>!(!e||e.length<2||t(e)||e.length>120||/^[A-Z]{2,}$/.test(e))),a=500;for(let e=0;e<i.length;e++){let t=i[e];t&&(r.push({id:`raw_`+e+`_`+Math.random(),time:a,end:a+2500,text:t}),a+=1800)}return r}function a(e){return e.trim()?e.includes(`-->`)?n(e):/\[\d+:\d+/.test(e)?r(e):i(e):[]}var o=class{audio=null;ctx=null;_currentTime=0;beatInterval=null;onTime=null;setOnTime(e){this.onTime=e}getCtx(){return this.ctx||=new AudioContext,this.ctx}loadMusic(e,t){this.audio&&(this.audio.pause(),this.audio.src=``),this.stopPresetBeat();let n=new Audio;this.audio=n,this._currentTime=0;let r=()=>{if(n.duration>0&&n.buffered.length>0){let e=Math.min(100,Math.round(n.buffered.end(0)/n.duration*100));t?.(e)}};n.addEventListener(`loadedmetadata`,()=>{r()}),n.addEventListener(`progress`,()=>{r()}),n.addEventListener(`canplay`,()=>{r()}),n.addEventListener(`canplaythrough`,()=>{t?.(100)}),n.addEventListener(`error`,()=>{t?.(-1)}),n.addEventListener(`timeupdate`,()=>{this._currentTime=n.currentTime*1e3,this.onTime?.(this._currentTime)}),n.addEventListener(`ended`,()=>{this._currentTime=0}),n.preload=`auto`,n.src=e,n.load(),n.play().catch(()=>{})}playMusic(){this.audio&&this.audio.play().catch(e=>{console.warn(`Audio play failed:`,e)})}setPresetBeat(e){this.audio&&=(this.audio.pause(),null),this.stopPresetBeat(),this._currentTime=0;let t=60/e*1e3,n=performance.now(),r=()=>{this._currentTime=performance.now()-n,this.onTime?.(this._currentTime),this._beep(220+Math.random()*40,.05,.04)};this.beatInterval=setInterval(r,t)}stopPresetBeat(){this.beatInterval&&=(clearInterval(this.beatInterval),null)}_beep(e,t,n){try{let r=this.getCtx(),i=r.createOscillator(),a=r.createGain();i.connect(a),a.connect(r.destination),i.frequency.value=e,a.gain.setValueAtTime(t,r.currentTime),a.gain.exponentialRampToValueAtTime(1e-4,r.currentTime+n),i.start(),i.stop(r.currentTime+n)}catch{}}playShotSound(){this._beep(1400,.03,.018)}playHitSound(){try{let e=this.getCtx(),t=e.createBuffer(1,Math.floor(e.sampleRate*.04),e.sampleRate),n=t.getChannelData(0);for(let e=0;e<n.length;e++)n[e]=(Math.random()*2-1)*(1-e/n.length)*.6;let r=e.createBufferSource(),i=e.createGain();r.buffer=t,r.connect(i),i.connect(e.destination),i.gain.value=.3,r.start()}catch{}}playExplodeSound(){try{let e=this.getCtx(),t=e.createBuffer(1,Math.floor(e.sampleRate*.12),e.sampleRate),n=t.getChannelData(0);for(let e=0;e<n.length;e++)n[e]=(Math.random()*2-1)*(1-e/n.length);let r=e.createBufferSource(),i=e.createGain(),a=e.createBiquadFilter();a.type=`lowpass`,a.frequency.value=700,r.buffer=t,r.connect(a),a.connect(i),i.connect(e.destination),i.gain.value=.5,r.start()}catch{}}playComboSound(e){let t=[523,659,784,1047,1319];this._beep(t[Math.min(Math.floor(e/20),t.length-1)],.12,.1)}resume(){this.getCtx().resume().catch(()=>{}),this.playMusic()}pause(){this.audio?.pause(),this.stopPresetBeat()}seek(e){this.audio&&(this.audio.currentTime=e/1e3)}currentTime(){return this._currentTime}},s=class{ctx;W=0;H=0;stars=[];STAR_COUNT=70;constructor(e,t,n){this.ctx=e,this.setSize(t,n)}setSize(e,t){this.W=e,this.H=t,this.stars=Array.from({length:this.STAR_COUNT},()=>({x:Math.random()*e,y:Math.random()*t,speed:.6+Math.random()*1.4}))}render(e,t,n){let r=this.ctx;r.save(),e.shakeAmt>0&&r.translate((Math.random()-.5)*e.shakeAmt*2,(Math.random()-.5)*e.shakeAmt*2),r.fillStyle=e.isFever?`#08000e`:`#000010`,r.fillRect(0,0,t,n),this._stars(e.isFever),(e.isFever||e.combo>=50)&&this._speedlines(e.combo,e.isFever);for(let t of e.items){r.save(),r.translate(t.x,t.y);let e=1+Math.sin(Date.now()*.008)*.15;r.scale(e,e),r.shadowColor=t.color,r.shadowBlur=16,r.fillStyle=`rgba(10,15,30,0.85)`,r.strokeStyle=t.color,r.lineWidth=2.5,r.beginPath(),r.arc(0,0,t.r,0,Math.PI*2),r.fill(),r.stroke(),r.font=`bold 16px sans-serif`,r.textAlign=`center`,r.textBaseline=`middle`,r.shadowBlur=0,r.fillText(t.label,0,1),r.restore()}for(let t of e.enemies)for(let n of t.chars){if(n.hp<=0)continue;let i=t.x+n.relX,a=t.y+n.relY;if(r.save(),r.translate(i,a),r.rotate(n.rot),r.font=`900 ${n.fontSize}px '${n.font}', sans-serif`,r.textAlign=`center`,r.textBaseline=`middle`,r.lineJoin=`round`,r.shadowBlur=0,r.strokeStyle=`rgba(0,0,0,0.85)`,r.lineWidth=n.fontSize*.1,r.strokeText(n.ch,0,0),r.shadowColor=n.flash>0?`#ffffff`:n.glow,r.shadowBlur=n.flash>0?20:e.isFever?16:10,r.strokeStyle=n.flash>0?`#ffffff`:n.color,r.lineWidth=n.fontSize*.05,r.strokeText(n.ch,0,0),r.shadowBlur=0,r.fillStyle=`#ffffff`,r.fillText(n.ch,0,0),n.maxHp>1){let e=n.fontSize*.7;r.fillStyle=`rgba(0,0,0,0.7)`,r.fillRect(-e/2-1,n.fontSize*.52-1,e+2,5),r.fillStyle=`rgba(255,255,255,0.2)`,r.fillRect(-e/2,n.fontSize*.52,e,3),r.fillStyle=n.hp/n.maxHp>.5?`#00ff66`:`#ff2255`,r.fillRect(-e/2,n.fontSize*.52,e*(n.hp/n.maxHp),3)}r.restore()}r.shadowBlur=10;for(let t of e.bullets)r.shadowColor=t.color,r.fillStyle=t.color,r.beginPath(),r.ellipse(t.x,t.y,t.r,t.r*2.5,0,0,Math.PI*2),r.fill();r.shadowBlur=14;for(let t of e.enemyBullets)r.shadowColor=`#ff3355`,r.fillStyle=`#ff3355`,r.beginPath(),r.arc(t.x,t.y,t.r,0,Math.PI*2),r.fill(),r.shadowBlur=0,r.fillStyle=`#ffaaaa`,r.beginPath(),r.arc(t.x,t.y,t.r*.45,0,Math.PI*2),r.fill(),r.shadowBlur=14;r.shadowBlur=0;for(let t of e.particles){let e=t.life/t.maxLife;r.save(),r.globalAlpha=e,r.shadowColor=t.color,r.shadowBlur=6,t.text&&t.font?(r.font=`bold ${t.size*2.5}px '${t.font}', sans-serif`,r.textAlign=`center`,r.textBaseline=`middle`,r.fillStyle=t.color,r.fillText(t.text,t.x,t.y)):(r.fillStyle=t.color,r.beginPath(),r.arc(t.x,t.y,t.size*e,0,Math.PI*2),r.fill()),r.restore()}for(let t of e.floatingTexts){let e=Math.min(1,t.life/300);r.save(),r.globalAlpha=e,r.font=`900 16px 'Dela Gothic One', sans-serif`,r.textAlign=`center`,r.textBaseline=`middle`,r.fillStyle=t.color,r.shadowColor=t.color,r.shadowBlur=12,r.fillText(t.text,t.x,t.y),r.restore()}(e.invincibleTimer<=0||Math.floor(Date.now()/80)%2==0)&&this._player(e.px,e.py,e.shotLevel(),e.isFever,e.shieldTimer>0),this._hud(e,t,n),r.restore()}renderTitle(e,t,n){let r=this.ctx;r.fillStyle=`#000010`,r.fillRect(0,0,t,n),this._stars(!1),r.save(),r.globalAlpha=.12,r.font=`900 ${t*.18}px 'Dela Gothic One', sans-serif`,r.fillStyle=`#00f3ff`,r.textAlign=`center`,r.textBaseline=`middle`,r.fillText(`AMULISH`,t/2,n*.5),r.restore()}renderResult(e,t,n){let r=this.ctx;r.fillStyle=`#000010`,r.fillRect(0,0,t,n),this._stars(!1)}_stars(e){let t=this.ctx;for(let n of this.stars)n.y+=n.speed*(e?7:1),n.y>this.H&&(n.y=0,n.x=Math.random()*this.W),t.fillStyle=e?`rgba(255,220,80,${n.speed*.4})`:`rgba(255,255,255,${n.speed*.35})`,t.fillRect(n.x,n.y,1.5,e?10:2)}_speedlines(e,t){let n=this.ctx,r=Math.min(18,6+Math.floor(e/8));n.strokeStyle=t?`rgba(255,220,0,0.18)`:`rgba(0,243,255,0.1)`,n.lineWidth=1.5,n.beginPath();for(let e=0;e<r;e++){let e=Math.random()*this.W,t=Math.random()*this.H;n.moveTo(e,t),n.lineTo(e,t+40+Math.random()*80)}n.stroke()}_player(e,t,n,r,i=!1){let a=this.ctx;a.save(),a.translate(e,t),i&&(a.strokeStyle=`#00f3ff`,a.shadowColor=`#00f3ff`,a.shadowBlur=18,a.lineWidth=3,a.beginPath(),a.arc(0,0,32+Math.sin(Date.now()*.01)*3,0,Math.PI*2),a.stroke());let o=a.createRadialGradient(0,12,0,0,12,28);o.addColorStop(0,r?`rgba(255,200,0,0.7)`:`rgba(0,180,255,0.7)`),o.addColorStop(1,`transparent`),a.fillStyle=o,a.beginPath(),a.arc(0,12,28,0,Math.PI*2),a.fill();let s=r?`#ffe600`:`#00f3ff`;a.shadowColor=s,a.shadowBlur=r?22:14,a.fillStyle=s,a.beginPath(),a.moveTo(0,-22),a.lineTo(-11,13),a.lineTo(-4,7),a.lineTo(0,11),a.lineTo(4,7),a.lineTo(11,13),a.closePath(),a.fill(),a.fillStyle=r?`#ff9900`:`#0099ff`,a.beginPath(),a.moveTo(-12,10),a.lineTo(-20,18),a.lineTo(-10,13),a.closePath(),a.fill(),a.beginPath(),a.moveTo(12,10),a.lineTo(20,18),a.lineTo(10,13),a.closePath(),a.fill(),a.restore()}_hud(e,t,n){let r=this.ctx;r.save(),r.font=`bold 16px 'Dela Gothic One', monospace`,r.fillStyle=`#fff`,r.shadowColor=`#00f3ff`,r.shadowBlur=6,r.textAlign=`left`,r.textBaseline=`top`,r.fillText(e.score.toLocaleString(),12,44),e.combo>1&&(r.font=`900 ${Math.min(20,12+e.combo*.07)}px 'Dela Gothic One', monospace`,r.textAlign=`right`,r.textBaseline=`top`,r.fillStyle=e.isFever?`#ffe600`:`#00f3ff`,r.shadowColor=r.fillStyle,r.shadowBlur=14,r.fillText(`${e.combo}x`,t-12,44));let i=t*.45,a=t/2-i/2;if(r.shadowBlur=0,r.fillStyle=`rgba(255,255,255,0.08)`,r.beginPath(),r.roundRect(a,14,i,6,3),r.fill(),e.fever>0){let t=r.createLinearGradient(a,0,a+i,0);t.addColorStop(0,`#00f3ff`),t.addColorStop(1,e.isFever?`#ffe600`:`#ff00bb`),r.fillStyle=t,r.shadowColor=e.isFever?`#ffe600`:`#ff00bb`,r.shadowBlur=8,r.beginPath(),r.roundRect(a,14,i*(e.fever/100),6,3),r.fill()}let o=Math.max(0,e.playerHp/e.maxPlayerHp);if(r.fillStyle=`rgba(0,0,0,0.6)`,r.strokeStyle=`rgba(255,255,255,0.2)`,r.lineWidth=1,r.beginPath(),r.roundRect(12,66,120,10,5),r.fill(),r.stroke(),o>0){let e=o>.5?`#00ff66`:o>.25?`#ffe600`:`#ff2255`;r.fillStyle=e,r.shadowColor=e,r.shadowBlur=6,r.beginPath(),r.roundRect(12,66,120*o,10,5),r.fill()}r.shadowBlur=0,r.font=`bold 9px sans-serif`,r.fillStyle=`#ffffff`,r.textAlign=`left`,r.textBaseline=`middle`,r.fillText(`HP ${Math.ceil(e.playerHp)}`,18,71),e.isFever&&(r.font=`900 11px 'Dela Gothic One', monospace`,r.fillStyle=`#ffe600`,r.shadowColor=`#ffe600`,r.shadowBlur=18,r.textAlign=`center`,r.textBaseline=`top`,r.fillText(`⚡ FEVER ⚡`,t/2,22)),r.restore()}},c=[`Dela Gothic One`,`Reggae One`,`DotGothic16`,`RocknRoll One`,`Mochiy Pop One`,`Potta One`,`Rampart One`,`Kaisei Tokumin`,`Shippori Mincho`],l=[{text:`#00f3ff`,glow:`rgba(0,243,255,0.9)`},{text:`#ff007f`,glow:`rgba(255,0,127,0.9)`},{text:`#ffe600`,glow:`rgba(255,230,0,0.9)`},{text:`#00ff66`,glow:`rgba(0,255,102,0.9)`},{text:`#cc44ff`,glow:`rgba(204,68,255,0.9)`},{text:`#ff6622`,glow:`rgba(255,102,34,0.9)`}],u=class{W;H;phase=`TITLE`;px=0;py=0;playerHp=100;maxPlayerHp=100;invincibleTimer=0;shieldTimer=0;enemies=[];bullets=[];particles=[];floatingTexts=[];items=[];score=0;combo=0;maxCombo=0;fever=0;isFever=!1;shakeAmt=0;totalShots=0;hits=0;enemyBullets=[];difficulty=`NORMAL`;timeMs=0;lyrics=[];lyricIdx=0;lyricTimeOffset=0;lastFallbackSpawn=-999999;fireTimer=0;enemyFireTimer=0;FIRE_MS=220;ENEMY_FIRE_MS=1500;ENEMY_MAX_SHOOTERS=1;ENEMY_BASE_BULLETS=1;audio=null;setDifficulty(e){this.difficulty=e,e===`EASY`?(this.ENEMY_FIRE_MS=2e3,this.ENEMY_MAX_SHOOTERS=1,this.ENEMY_BASE_BULLETS=1):e===`NORMAL`?(this.ENEMY_FIRE_MS=1400,this.ENEMY_MAX_SHOOTERS=1,this.ENEMY_BASE_BULLETS=1):(this.ENEMY_FIRE_MS=600,this.ENEMY_MAX_SHOOTERS=3,this.ENEMY_BASE_BULLETS=2)}constructor(e,t){this.W=e,this.H=t,this.px=e/2,this.py=t*.75}setAudio(e){this.audio=e}setLyrics(e){this.lyrics=e.filter(e=>!t(e.text)),this.lyricIdx=0}syncTime(e){this.timeMs=e}startGame(){this.phase=`PLAYING`,this.enemies=[],this.bullets=[],this.particles=[],this.floatingTexts=[],this.enemyBullets=[],this.items=[],this.score=0,this.combo=0,this.maxCombo=0,this.fever=0,this.isFever=!1,this.playerHp=100,this.maxPlayerHp=100,this.invincibleTimer=0,this.shieldTimer=0,this.shakeAmt=0,this.totalShots=0,this.hits=0,this.lyricIdx=0,this.timeMs=0,this.lyricTimeOffset=0,this.fireTimer=0,this.enemyFireTimer=0,this.lastFallbackSpawn=-999999,this.spawnTimer=0,this.px=this.W/2,this.py=this.H*.75}goToTitle(){this.phase=`TITLE`,this.enemies=[],this.bullets=[],this.particles=[],this.floatingTexts=[],this.enemyBullets=[],this.items=[]}movePlayer(e,t){this.px=Math.max(20,Math.min(this.W-20,this.px+e)),this.py=Math.max(60,Math.min(this.H-60,this.py+t))}update(e){if(this.phase===`PLAYING`){this.invincibleTimer>0&&(this.invincibleTimer-=e),this.shieldTimer>0&&(this.shieldTimer-=e),this._spawnLyrics(e),this.fireTimer-=e,this.fireTimer<=0&&(this._fire(),this.fireTimer=this.FIRE_MS),this.enemyFireTimer-=e,this.enemyFireTimer<=0&&(this._enemyFire(),this.enemyFireTimer=this.ENEMY_FIRE_MS);for(let t=this.bullets.length-1;t>=0;t--){let n=this.bullets[t];n.x+=n.vx*e*.06,n.y+=n.vy*e*.06,(n.y<-20||n.x<-20||n.x>this.W+20)&&this.bullets.splice(t,1)}for(let t=this.items.length-1;t>=0;t--){let n=this.items[t];if(n.y+=n.vy*e*.06,n.y>this.H+40){this.items.splice(t,1);continue}let r=n.x-this.px,i=n.y-this.py;r*r+i*i<784&&(this._collectItem(n),this.items.splice(t,1))}for(let t=this.enemyBullets.length-1;t>=0;t--){let n=this.enemyBullets[t];if(n.x+=n.vx*e*.06,n.y+=n.vy*e*.06,n.y>this.H+20||n.x<-20||n.x>this.W+20){this.enemyBullets.splice(t,1);continue}let r=n.x-this.px,i=n.y-this.py;r*r+i*i<400&&(this.enemyBullets.splice(t,1),this._damagePlayer(20,`BULLET`))}for(let t=this.enemies.length-1;t>=0;t--){let n=this.enemies[t];if(n.x+=n.vx*e*.06,n.y+=n.vy*e*.06,(n.x-n.w/2<0&&n.vx<0||n.x+n.w/2>this.W&&n.vx>0)&&(n.vx*=-1),n.y>this.H+120){this.combo=0,this.enemies.splice(t,1);continue}let r=n.x-this.px,i=n.y-this.py;r*r+i*i<(n.w*.45)**2+400&&this._damagePlayer(25,`CRASH`);for(let t of n.chars)t.flash>0&&(t.flash-=e)}if(this._checkCollisions(),this.playerHp<=0){this.playerHp=0,this.phase=`RESULT`,this.audio?.playExplodeSound();return}for(let t=this.particles.length-1;t>=0;t--){let n=this.particles[t];if(n.life-=e,n.life<=0){this.particles.splice(t,1);continue}n.x+=n.vx*e*.06,n.y+=n.vy*e*.06,n.vy+=.04*e}for(let t=this.floatingTexts.length-1;t>=0;t--){let n=this.floatingTexts[t];if(n.life-=e,n.life<=0){this.floatingTexts.splice(t,1);continue}n.y+=n.vy*e*.06}this.isFever&&(this.fever-=e*.055,this.fever<=0&&(this.fever=0,this.isFever=!1)),this.shakeAmt>0&&(this.shakeAmt=Math.max(0,this.shakeAmt-e*.012)),this.particles.length>120&&this.particles.splice(0,this.particles.length-120),this.bullets.length>60&&this.bullets.splice(0,this.bullets.length-60),this.enemyBullets.length>30&&this.enemyBullets.splice(0,this.enemyBullets.length-30)}}_damagePlayer(e,t){this.invincibleTimer>0||this.shieldTimer>0||(this.playerHp-=e,this.invincibleTimer=1200,this.combo=Math.max(0,this.combo-5),this.fever=Math.max(0,this.fever-25),this.fever<100&&(this.isFever=!1),this.shakeAmt=Math.max(this.shakeAmt,10),this.floatingTexts.push({x:this.px,y:this.py-20,vy:-2,life:600,text:t===`CRASH`?`CRASH! -25HP`:`-20 HP!`,color:`#ff2255`}),this.audio?.playHitSound())}_collectItem(e){if(this.audio?.playComboSound(20),e.type===`HEAL`)this.playerHp=Math.min(this.maxPlayerHp,this.playerHp+35),this.floatingTexts.push({x:e.x,y:e.y-10,vy:-2,life:700,text:`❤️ HP RECOVER +35!`,color:`#00ff66`});else if(e.type===`SHIELD`)this.shieldTimer=7e3,this.floatingTexts.push({x:e.x,y:e.y-10,vy:-2,life:700,text:`🛡️ SHIELD ACTIVE! (7s)`,color:`#00f3ff`});else if(e.type===`FEVER`)this.fever=100,this.isFever=!0,this.floatingTexts.push({x:e.x,y:e.y-10,vy:-2,life:700,text:`⚡ FEVER MAX!`,color:`#ffe600`});else if(e.type===`BOMB`){this.enemyBullets=[];for(let e of this.enemies)for(let t of e.chars)t.hp=0,this._burst(e.x+t.relX,e.y+t.relY,t);this.enemies=[],this.shakeAmt=15,this.floatingTexts.push({x:e.x,y:e.y-10,vy:-2,life:700,text:`💣 BOMB CLEAR!`,color:`#ff44aa`})}}_spawnItem(){let e=[{type:`HEAL`,label:`❤️`,color:`#00ff66`},{type:`SHIELD`,label:`🛡️`,color:`#00f3ff`},{type:`FEVER`,label:`⚡`,color:`#ffe600`},{type:`BOMB`,label:`💣`,color:`#ff007f`}],t=e[Math.floor(Math.random()*e.length)];this.items.push({id:Math.random().toString(36).slice(2),x:30+Math.random()*(this.W-60),y:-30,vy:1.2+Math.random()*.8,type:t.type,label:t.label,color:t.color,r:16})}customWords=[];setCustomWords(e){this.customWords=e.filter(e=>!t(e))}spawnTimer=0;_spawnLyrics(e){if(this.lyrics.length===0){if(this.spawnTimer-=e,this.spawnTimer<=0){let e=this.customWords.filter(e=>e&&!t(e)),n=e.length>0?[...e,`AMULISH`,`FEVER`,`BEAT`,`SONIC`,`爆発`,`電撃`,`RHYTHM`,`OVERDRIVE`,`極限`,`覇道`]:[`AMULISH`,`FEVER`,`BEAT`,`COMBO`,`SONIC`,`RHYTHM`,`BLAZE`,`NOVA`,`爆発`,`電撃`,`嵐`,`覇道`,`狂乱`,`轟音`],r=n[Math.floor(Math.random()*n.length)];this._spawnEnemy(r),this.spawnTimer=800+Math.random()*500}return}let n=this.timeMs-this.lyricTimeOffset;for(;this.lyricIdx<this.lyrics.length&&n>=this.lyrics[this.lyricIdx].time;)this._spawnEnemy(this.lyrics[this.lyricIdx].text),this.lyricIdx++;this.lyricIdx>=this.lyrics.length&&n>=this.lyrics[this.lyrics.length-1].time+3e3&&(this.lyricTimeOffset=this.timeMs,this.lyricIdx=0)}_spawnEnemy(n){let r=e(n).trim();if(!r||t(r))return;Math.random()<.4&&this._spawnItem();let i=[],a=r.length,o=`HORIZONTAL`,s=Math.random();if(/[\u3040-\u30ff\u4e00-\u9faf]/.test(r)&&s<.32?o=`VERTICAL`:(a>6||s<.45)&&(o=`BLOCK`),o===`VERTICAL`){let e=0,t=0;for(let n of r){let r=32+Math.random()*20,a=c[Math.floor(Math.random()*c.length)],o=l[Math.floor(Math.random()*l.length)],s=(Math.random()-.5)*.15,u=/[\u4e00-\u9faf]/.test(n)?3:/[\u3040-\u30ff]/.test(n)?2:1,d=(Math.random()-.5)*6;i.push({ch:n,relX:d,relY:e,fontSize:r,font:a,color:o.text,glow:o.glow,rot:s,hp:u,maxHp:u,flash:0}),e+=r*1.08,r>t&&(t=r)}let n=e/2;for(let e of i)e.relY-=n;let a=Math.max(t+20,Math.min(this.W-t-20,Math.random()*this.W));this.enemies.push({id:Math.random().toString(36).slice(2),x:a,y:-(e+20),vx:(Math.random()-.5)*1,vy:.9+Math.random()*.7,chars:i,w:t*1.2,h:e})}else if(o===`BLOCK`){let e=a>12?5:a>8?4:3,t=0,n=0,o=a>12?30:36,s=0,u=0,d=[],f=0;for(let u=0;u<a;u++){let p=r[u],m=o+Math.random()*12,h=c[Math.floor(Math.random()*c.length)],g=l[Math.floor(Math.random()*l.length)],_=(Math.random()-.5)*.2,v=/[\u4e00-\u9faf]/.test(p)?3:/[\u3040-\u30ff]/.test(p)?2:1,y=m*1.05,b=m*1.1,x=f,S=n*b;i.push({ch:p,relX:x,relY:S,fontSize:m,font:h,color:g.text,glow:g.glow,rot:_,hp:v,maxHp:v,flash:0}),f+=y,t++,(t>=e||u===a-1)&&(d.push(f),f>s&&(s=f),f=0,t=0,n++)}u=o*1.15*n;let p=0;for(let e=0;e<d.length;e++){let t=-d[e]/2,n=-u/2;for(;p<i.length&&i[p].relY<(e+.9)*(o*1.1);)i[p].relX+=t,i[p].relY+=n,p++}let m=Math.max(s/2+20,Math.min(this.W-s/2-20,Math.random()*this.W));this.enemies.push({id:Math.random().toString(36).slice(2),x:m,y:-(u+20),vx:(Math.random()-.5)*1.1,vy:.9+Math.random()*.6,chars:i,w:s,h:u})}else{let e=0,t=0;for(let n of r){let r=34+Math.random()*20,a=c[Math.floor(Math.random()*c.length)],o=l[Math.floor(Math.random()*l.length)],s=(Math.random()-.5)*.2,u=/[\u4e00-\u9faf]/.test(n)?3:/[\u3040-\u30ff]/.test(n)?2:1,d=(Math.random()-.5)*6,f=r*1.08;i.push({ch:n,relX:e,relY:d,fontSize:r,font:a,color:o.text,glow:o.glow,rot:s,hp:u,maxHp:u,flash:0}),e+=f,r+Math.abs(d)>t&&(t=r+Math.abs(d))}let n=e/2;for(let e of i)e.relX-=n;let a=Math.max(n+10,Math.min(this.W-n-10,Math.random()*this.W));this.enemies.push({id:Math.random().toString(36).slice(2),x:a,y:-(t+20),vx:(Math.random()-.5)*1.2,vy:1+Math.random()*.7,chars:i,w:e,h:t})}}_fire(){let e=this.shotLevel(),t=this.isFever,n=this.px,r=this.py-22,i=t?`#ffe600`:`#00f3ff`;this.totalShots++,this.audio?.playShotSound();let a=(e,t,i,a,o)=>this.bullets.push({x:n,y:r,vx:e,vy:t,r:i,color:a,damage:o});if(e===1)a(0,-18,4,i,1);else if(e===2)a(-.4,-18,4,i,1),a(.4,-18,4,i,1);else if(e===3)a(0,-18,5,`#ff00ff`,1.5),a(-2.5,-16,4,i,1),a(2.5,-16,4,i,1);else if(e===4)for(let e=-1.5;e<=1.5;e+=.75)a(Math.sin(e)*13,-Math.cos(e)*18,5,`#00ff66`,1.5);else for(let e=-2;e<=2;e+=.5)a(Math.sin(e)*14,-Math.cos(e)*20,6,`#ffe600`,2)}_enemyFire(){if(this.enemies.length===0)return;let e=this.enemies.filter(e=>e.y>0&&e.y<this.H*.7).sort(()=>Math.random()-.5).slice(0,this.ENEMY_MAX_SHOOTERS);for(let t of e){let e=this.px-t.x,n=this.py-t.y,r=Math.sqrt(e*e+n*n)||1,i=4+Math.random()*2.5;if(this.difficulty===`HARD`)for(let a=0;a<3;a++){let o=(a-1)*2.5;this.enemyBullets.push({x:t.x,y:t.y,vx:e/r*i+o,vy:n/r*i,r:5,color:`#ff3355`})}else this.enemyBullets.push({x:t.x,y:t.y,vx:e/r*i,vy:n/r*i,r:4.5,color:`#ff3355`})}}_checkCollisions(){outer:for(let e=this.bullets.length-1;e>=0;e--){let t=this.bullets[e];for(let n of this.enemies)for(let r of n.chars){if(r.hp<=0)continue;let i=t.x-(n.x+r.relX),a=t.y-(n.y+r.relY);if(i*i+a*a<(r.fontSize*.52)**2){r.hp-=t.damage,r.flash=140,this.hits++,this.audio?.playHitSound(),this.bullets.splice(e,1),r.hp<=0&&(this.combo++,this.combo>this.maxCombo&&(this.maxCombo=this.combo),this.score+=100*this.combo,this.combo%10==0&&this.audio?.playComboSound(this.combo),this.fever=Math.min(100,this.fever+3.5),this.fever>=100&&(this.isFever=!0),this.combo>=10&&(this.shakeAmt=Math.min(8,this.combo*.07)),this._burst(n.x+r.relX,n.y+r.relY,r),this.combo>=20&&this.floatingTexts.push({x:n.x+r.relX,y:n.y+r.relY-18,vy:-1.8,life:600,text:`${this.combo} COMBO!`,color:`#ffe600`}));continue outer}}}for(let e=this.enemies.length-1;e>=0;e--)this.enemies[e].chars.every(e=>e.hp<=0)&&(this.audio?.playExplodeSound(),this.enemies.splice(e,1))}_burst(e,t,n){let r=5+Math.floor(Math.random()*4);for(let i=0;i<r;i++){let r=Math.random()*Math.PI*2,i=2+Math.random()*4;this.particles.push({x:e,y:t,vx:Math.cos(r)*i,vy:Math.sin(r)*i-2,life:350+Math.random()*280,maxLife:630,color:n.color,size:3+Math.random()*3.5,text:Math.random()<.35?n.ch:void 0,font:n.font})}}shotLevel(){return this.isFever?5:this.combo>=100?4:this.combo>=50?3:this.combo>=20?2:1}get accuracy(){return this.totalShots===0?100:Math.round(this.hits/this.totalShots*100)}get rank(){return this.accuracy>=85&&this.maxCombo>=30?`S`:this.accuracy>=70||this.maxCombo>=20?`A`:this.accuracy>=50?`B`:`C`}},d=`v2.4.0`,f=document.getElementById(`game`),p=f.getContext(`2d`,{alpha:!1}),m=0,h=0;function g(){let e=9/16,t=window.innerWidth,n=window.innerHeight;t/n<e?(m=t,h=Math.round(t/e)):(h=n,m=Math.round(n*e)),f.width=m,f.height=h,f.style.width=m+`px`,f.style.height=h+`px`,v.W=m,v.H=h,y.setSize(m,h)}var _=new o,v=new u(0,0);v.setAudio(_);var y=new s(p,0,0);g(),window.addEventListener(`resize`,g);function b(e){if(!e)return``;let t=e.match(/([a-f0-9]{8}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{12})/i);return t?`https://cdn1.suno.ai/${t[1]}.mp3`:e}var x=new URLSearchParams(location.search),S=x.get(`audio`),C=S?b(S):null,w=x.get(`title`)||`SUNO Track`,T=x.get(`lyrics`),E=x.get(`srt`),D=x.get(`dbg`),O=[],k=``;if(T){let e=decodeURIComponent(T);console.log(`[AMULISH] Raw lyrics received:`,e.substring(0,300)),O=a(e),console.log(`[AMULISH] Parsed lyrics count:`,O.length,O.slice(0,5).map(e=>e.text)),k=`歌詞取得OK: ${O.length}フレーズ`}else E?(O=a(decodeURIComponent(E)),k=`SRT取得OK: ${O.length}フレーズ`):D&&(k=`歌詞未取得: "${decodeURIComponent(D)}"`,console.warn(`[AMULISH] No lyrics received. Debug:`,decodeURIComponent(D)));if(O.length>0)v.setLyrics(O);else if(T||E){let e=decodeURIComponent(T||E||``).replace(/\r\n/g,`
`).split(`
`).map(e=>e.trim()).filter(e=>e.length>0&&!/^\[.*\]$/.test(e)&&!/^\(.*\)$/.test(e)).map((e,t)=>({id:`fb_`+t,time:500+t*1800,end:3e3+t*1800,text:e}));e.length>0&&(v.setLyrics(e),k=`フォールバック歌詞: ${e.length}行`,console.log(`[AMULISH] Using fallback lines:`,e.slice(0,5).map(e=>e.text)))}if(C){let e=w.split(/[\s,._\-／/]+/).filter(e=>e.length>1).filter(e=>!t(e));v.setCustomWords(e)}V(),k&&setTimeout(()=>{let e=document.getElementById(`suno-status-box`),t=document.querySelector(`.suno-status-title`),n=document.getElementById(`suno-track-name`);e&&(e.style.display=`flex`),t&&(O.length>0?(t.textContent=`✅ 歌詞セット完了！`,t.style.color=`#00ff66`):(t.textContent=`⚠️ 歌詞取得できず（デモ語で表示）`,t.style.color=`#ff6622`)),n&&(n.textContent=k)},100),C&&_.loadMusic(C,e=>{H(e)}),_.setOnTime(e=>v.syncTime(e));var A=0,j=`TITLE`;function M(e){let t=Math.min(e-A,50);A=e,v.phase===`PLAYING`?(v.update(t),y.render(v,m,h)):v.phase===`TITLE`?y.renderTitle(v,m,h):v.phase===`RESULT`&&(j!==`RESULT`&&N(),y.renderResult(v,m,h)),j=v.phase,requestAnimationFrame(M)}requestAnimationFrame(M);function N(){let e={S:`#ffe600`,A:`#00ff66`,B:`#00f3ff`,C:`#ff6622`},t=document.querySelector(`#result-panel h2`),n=v.playerHp<=0;t&&(n?(t.textContent=`💀 GAME OVER`,t.style.color=`#ff2255`,t.style.textShadow=`0 0 20px #ff2255`):(t.textContent=`🎉 STAGE CLEAR`,t.style.color=`#ffe600`,t.style.textShadow=`0 0 20px #ffe600`)),document.getElementById(`result-rank`).textContent=n?`FAILED`:v.rank,document.getElementById(`result-rank`).style.color=n?`#ff2255`:e[v.rank],document.getElementById(`r-score`).textContent=v.score.toLocaleString(),document.getElementById(`r-combo`).textContent=v.maxCombo+`x`,document.getElementById(`r-acc`).textContent=v.accuracy+`%`,document.getElementById(`r-diff`).textContent=v.difficulty,document.getElementById(`ui-panel`).style.display=`none`,document.getElementById(`result-panel`).style.display=`flex`}var P=0,F=0,I=!1;function L(e,t){P=e,F=t,I=!0,v.phase!==`PLAYING`&&(_.resume(),v.startGame(),U())}function R(e,t){I&&(v.movePlayer(e-P,t-F),P=e,F=t)}function z(){I=!1}f.addEventListener(`touchstart`,e=>{e.preventDefault(),L(e.changedTouches[0].clientX,e.changedTouches[0].clientY)},{passive:!1}),f.addEventListener(`touchmove`,e=>{e.preventDefault(),R(e.changedTouches[0].clientX,e.changedTouches[0].clientY)},{passive:!1}),f.addEventListener(`touchend`,z),f.addEventListener(`mousedown`,e=>L(e.clientX,e.clientY)),f.addEventListener(`mousemove`,e=>R(e.clientX,e.clientY)),f.addEventListener(`mouseup`,z);var B=`javascript:(function(){var s=document.createElement('script');s.src='https://amfmu49-spec.github.io/amulish-game/bookmarklet.js?t='+Date.now();document.body.appendChild(s);})();`;function V(){let e=document.createElement(`div`);if(e.id=`ui-overlay`,e.innerHTML=`
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
          <span class="ver-badge">${d}</span>
        </div>
      </div>

      <!-- SUNO Loading status box -->
      <div class="suno-status-box" id="suno-status-box">
        <div class="suno-status-title">🎵 SUNO曲を読み込み中...</div>
        <div class="suno-status-track" id="suno-track-name">${w}</div>
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
  `,document.body.appendChild(e),document.getElementById(`bm-copy`).addEventListener(`click`,async()=>{try{await navigator.clipboard.writeText(B);let e=document.getElementById(`bm-copy`);e.textContent=`✅ コピー完了！ブックマークに保存してね`,e.classList.add(`bm-copied`),setTimeout(()=>{e.textContent=`📋 ブックマークレットをコピー`,e.classList.remove(`bm-copied`)},3e3)}catch{prompt(`コピーしてブックマークに登録してください:`,B)}}),document.querySelectorAll(`.diff-btn`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.diff-btn`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),v.setDifficulty(e.dataset.diff)})}),document.getElementById(`btn-start`).addEventListener(`click`,()=>{_.resume(),v.startGame(),U()}),document.getElementById(`btn-retry`).addEventListener(`click`,()=>{_.seek(0),v.startGame(),U()}),document.getElementById(`btn-to-title`).addEventListener(`click`,()=>{_.pause(),v.goToTitle(),W()}),C){let e=document.getElementById(`suno-status-box`);e.style.display=`flex`}}function H(e){let t=document.getElementById(`progress-bar-fill`),n=document.getElementById(`progress-text`),r=document.querySelector(`.suno-status-title`);if(e===-1){t&&(t.style.width=`100%`),t&&(t.style.background=`#ff3355`),n&&(n.textContent=`準備完了`),r&&(r.textContent=`🎵 SUNO曲セット完了 («START»で再生)`,r.style.color=`#ffe600`);return}let i=Math.max(0,Math.min(100,e));t&&(t.style.width=Math.max(4,i)+`%`),n&&(n.textContent=i>0?i+`%`:`読込中... (STARTで起動)`),i>=100&&r&&(r.textContent=`✅ SUNO曲の読み込み完了！`,r.style.color=`#00ff66`)}function U(){document.getElementById(`ui-panel`).style.display=`none`,document.getElementById(`result-panel`).style.display=`none`}function W(){document.getElementById(`ui-panel`).style.display=`flex`,document.getElementById(`result-panel`).style.display=`none`}