window.GameMap = {
  blocked(state, x, y, r) {
    const { WORLD } = window.GameConfig;
    if (x < r || y < r || x > WORLD.w - r || y > WORLD.h - r) return true;

    return state.walls.some(w =>
      x + r > w.x &&
      x - r < w.x + w.w &&
      y + r > w.y &&
      y - r < w.y + w.h
    );
  },

  safePoint(state, r, options = {}) {
    const { WORLD } = window.GameConfig;
    const { rand } = window.GameUtils;

    const minDistFromPlayer = options.minDistFromPlayer ?? 0;
    const maxTries = options.maxTries ?? 300;

    for (let i = 0; i < maxTries; i++) {
      const p = {
        x: rand(80, WORLD.w - 80),
        y: rand(80, WORLD.h - 80)
      };

      if (this.blocked(state, p.x, p.y, r + 8)) continue;

      if (
        state.player &&
        minDistFromPlayer > 0 &&
        window.GameUtils.dist(p, state.player) < minDistFromPlayer
      ) {
        continue;
      }

      return p;
    }

    return { x: WORLD.w * 0.5, y: WORLD.h * 0.5 };
  },

  generateWalls(state) {
    const { WORLD } = window.GameConfig;
    const { rand } = window.GameUtils;

    state.walls = [];
    for (let i = 0; i < 26; i++) {
      state.walls.push({
        x: rand(120, WORLD.w - 240),
        y: rand(120, WORLD.h - 200),
        w: rand(70, 210),
        h: rand(40, 120)
      });
    }
  },

  generateProps(state) {
    const { PROP_TYPES } = window.GameConfig;
    const { rand } = window.GameUtils;

    state.props = [];
    for (let i = 0; i < 130; i++) {
      const t = PROP_TYPES[Math.floor(Math.random() * PROP_TYPES.length)];
      const p = this.safePoint(state, Math.max(t.w, t.h) / 2);
      state.props.push({
        ...t,
        x: p.x,
        y: p.y,
        rot: rand(-0.15, 0.15),
        suspicious: 0
      });
    }
  },

  moveEntity(state, e, dx, dy, speed) {
    const { rand } = window.GameUtils;
    const len = Math.hypot(dx, dy) || 1;
    dx = dx / len * speed;
    dy = dy / len * speed;

    if (!this.blocked(state, e.x + dx, e.y, e.r)) e.x += dx;
    else if ("facing" in e) e.facing += rand(-1.0, 1.0);

    if (!this.blocked(state, e.x, e.y + dy, e.r)) e.y += dy;
    else if ("facing" in e) e.facing += rand(-1.0, 1.0);

    if ("facing" in e && Math.hypot(dx, dy) > 0.01) {
      e.facing = Math.atan2(dy, dx);
    }
  },

  hasLineOfSight(state, a, b) {
    const steps = Math.ceil(window.GameUtils.dist(a, b) / 24);

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;

      if (state.walls.some(w => x > w.x && x < w.x + w.w && y > w.y && y < w.y + w.h)) {
        return false;
      }
    }

    return true;
  }
};
