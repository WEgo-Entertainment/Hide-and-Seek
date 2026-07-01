window.GameRender = {
  drawProp(ctx, p, cam, ghost = false) {
    const { clamp } = window.GameUtils;
    const x = p.x - cam.x;
    const y = p.y - cam.y;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(p.rot || 0);
    ctx.globalAlpha = ghost ? 0.65 : 1;
    ctx.lineWidth = 2;

    if (p.name === "barrel") {
      ctx.beginPath();
      ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#80664b";
      ctx.fill();
      ctx.strokeStyle = "#d7c0a5";
      ctx.stroke();
    } else if (p.name === "plant") {
      ctx.fillStyle = "#755b42";
      ctx.fillRect(-p.w / 2, 4, p.w, p.h / 2);
      ctx.fillStyle = "#5bb77b";
      ctx.beginPath();
      ctx.arc(-8, -8, 14, 0, Math.PI * 2);
      ctx.arc(8, -8, 14, 0, Math.PI * 2);
      ctx.arc(0, -18, 14, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = p.name === "crate" ? "#9a7a4f" : "#737373";
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.strokeStyle = "#e1d4bd";
      ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
    }

    if (p.suspicious > 0) {
      ctx.globalAlpha = clamp(p.suspicious, 0, 1);
      ctx.strokeStyle = "#fff";
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(p.w, p.h) * 0.75, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  },

  drawWaitingBackground(state) {
    const { ctx, W, H } = state;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#151515";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = "#fff";

    for (let x = 0; x < W; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }

    for (let y = 0; y < H; y += 80) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    ctx.globalAlpha = 1;
  },

  drawVisionCone(state, s, cam) {
    const ctx = state.ctx;
    const x = s.x - cam.x;
    const y = s.y - cam.y;
    const range = s.mode === "rest" ? s.viewRange * 0.72 : s.viewRange;

    ctx.save();
    ctx.globalAlpha = s.mode === "chase" ? 0.17 : s.mode === "rest" ? 0.07 : 0.10;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, range, s.facing - s.fov / 2, s.facing + s.fov / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  },

  drawStaminaBar(state, s, cam) {
    const ctx = state.ctx;
    const x = s.x - cam.x;
    const y = s.y - cam.y - 31;
    const w = 34;
    const h = 4;

    ctx.fillStyle = "rgba(0,0,0,.45)";
    ctx.fillRect(x - w / 2, y, w, h);
    ctx.fillStyle = s.mode === "rest" ? "#ffd166" : "#9be564";
    ctx.fillRect(x - w / 2, y, w * (s.stamina / s.staminaMax), h);

    if (s.mode === "rest") {
      ctx.font = "12px system-ui";
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.fillText("ハァ…", x, y - 5);
    }
  },

  draw(state) {
    const { ctx, W, H } = state;
    const { WORLD } = window.GameConfig;
    const { clamp } = window.GameUtils;

    if (!state.started) {
      this.drawWaitingBackground(state);
      return;
    }

    const cam = state.camera();

    ctx.clearRect(0, 0, W, H);

    ctx.save();
    ctx.translate(-cam.x, -cam.y);

    ctx.strokeStyle = "rgba(255,255,255,.05)";
    ctx.lineWidth = 1;

    for (let x = 0; x < WORLD.w; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD.h); ctx.stroke();
    }

    for (let y = 0; y < WORLD.h; y += 80) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD.w, y); ctx.stroke();
    }

    ctx.fillStyle = "#292929";
    ctx.strokeStyle = "#555";
    for (const w of state.walls) {
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeRect(w.x, w.y, w.w, w.h);
    }

    ctx.restore();

    for (const s of state.seekers) this.drawVisionCone(state, s, cam);

    for (const f of state.footprints) {
      ctx.globalAlpha = clamp(f.life / 4, 0, 1) * f.strength;
      ctx.fillStyle = "#b9d6ff";
      ctx.beginPath();
      ctx.ellipse(f.x - cam.x, f.y - cam.y, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    for (const p of state.props) this.drawProp(ctx, p, cam);

    for (const ping of state.pings) {
      ctx.globalAlpha = clamp(ping.life, 0, 1);
      ctx.strokeStyle = ping.kind === "sonar" ? "#f5f5f5" : ping.kind === "tired" ? "#ffd166" : "#ffdf7b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ping.x - cam.x, ping.y - cam.y, ping.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    if (state.player.disguise) {
      this.drawProp(ctx, state.player.disguise, cam, true);
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(state.player.x - cam.x, state.player.y - cam.y, state.player.r + 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = "#f2f2f2";
      ctx.beginPath();
      ctx.arc(state.player.x - cam.x, state.player.y - cam.y, state.player.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    for (const s of state.seekers) {
      ctx.fillStyle =
        s.mode === "chase" ? "#ff6b6b" :
        s.mode === "investigate" ? "#ffd166" :
        s.mode === "search" ? "#cdb4db" :
        s.mode === "rest" ? "#777" :
        "#8ecae6";

      ctx.beginPath();
      ctx.arc(s.x - cam.x, s.y - cam.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.strokeStyle = "#111";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(s.x - cam.x, s.y - cam.y);
      ctx.lineTo(s.x - cam.x + Math.cos(s.facing) * 23, s.y - cam.y + Math.sin(s.facing) * 23);
      ctx.stroke();

      this.drawStaminaBar(state, s, cam);
    }

    if (state.gameOver) {
      ctx.fillStyle = "rgba(0,0,0,.55)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.font = "700 42px system-ui";
      ctx.fillText("CAUGHT", W / 2, H / 2 - 70);
      ctx.font = "18px system-ui";
      ctx.fillText("欲張るほどバレる。止まるほど伸びない。", W / 2, H / 2 - 36);
    }
  }
};
