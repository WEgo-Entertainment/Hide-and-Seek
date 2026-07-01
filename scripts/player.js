window.GamePlayer = {
  create(state) {
    const { WORLD } = window.GameConfig;

    state.player = {
      x: WORLD.w * 0.5,
      y: WORLD.h * 0.55,
      r: 14,
      speed: 3.4,
      heat: 0,
      disguise: null,
      score: 0,
      moving: false,
      dash: false
    };

    if (window.GameMap.blocked(state, state.player.x, state.player.y, state.player.r + 8)) {
      const p = window.GameMap.safePoint(state, state.player.r);
      state.player.x = p.x;
      state.player.y = p.y;
    }
  },

  tryDisguise(state) {
    if (!state.started || state.gameOver) return;

    let nearest = null;
    let best = 62;

    for (const p of state.props) {
      const d = window.GameUtils.dist(state.player, p);
      if (d < best) {
        best = d;
        nearest = p;
      }
    }

    if (nearest) {
      state.player.disguise = { ...nearest, x: state.player.x, y: state.player.y };
      state.player.heat = Math.min(100, state.player.heat + 18);
      state.pings.push({ x: state.player.x, y: state.player.y, r: 20, life: 1, kind: "noise" });
    }
  },

  update(state, dt) {
    const { clamp, rand } = window.GameUtils;
    const player = state.player;
    const keys = state.keys;
    const mobile = window.GameMobile;

    let dx = 0, dy = 0;
    let dash = false;

    if (mobile && mobile.enabled &&
        (Math.abs(mobile.input.x) > 0.01 ||
         Math.abs(mobile.input.y) > 0.01 ||
         mobile.input.dash)) {

      dx = mobile.input.x;
      dy = mobile.input.y;
      dash = mobile.input.dash;

    } else {
      if (keys.has("w") || keys.has("arrowup")) dy--;
      if (keys.has("s") || keys.has("arrowdown")) dy++;
      if (keys.has("a") || keys.has("arrowleft")) dx--;
      if (keys.has("d") || keys.has("arrowright")) dx++;
      dash = keys.has("shift");
    }

    player.moving = Math.hypot(dx, dy) > 0.08;
    player.dash = dash;

    const speed = player.speed * (player.dash ? 1.75 : 1);

    if (player.moving) {
      window.GameMap.moveEntity(state, player, dx, dy, speed);
      player.disguise = player.disguise ? { ...player.disguise, x: player.x, y: player.y } : null;

      const heatAdd = player.dash ? 32 : 12;
      player.heat = clamp(player.heat + heatAdd * dt, 0, 100);

      if (Math.random() < (player.dash ? 0.72 : 0.28)) {
        state.footprints.push({
          x: player.x + rand(-3, 3),
          y: player.y + rand(-3, 3),
          life: player.dash ? 4.2 : 2.4,
          strength: player.dash ? 1 : 0.55
        });
      }

      player.score += dt * (player.dash ? 22 : 13);
    } else {
      player.heat = clamp(player.heat - 15 * dt, 0, 100);
      player.score += dt * (player.heat > 55 ? 3 : 5);
    }

    if (player.disguise && !player.moving) {
      player.score += dt * 7;
    }
  }
};
