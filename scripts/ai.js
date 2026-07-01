window.GameAI = {
  createSeekers(state) {
    const { DIFFICULTIES } = window.GameConfig;
    const { rand } = window.GameUtils;

    const d = DIFFICULTIES[state.difficulty];
    state.seekers = [];

    for (let i = 0; i < d.seekerCount; i++) {
      const p = window.GameMap.safePoint(state, 17, { minDistFromPlayer: 260 });

      state.seekers.push({
        x: p.x,
        y: p.y,
        r: 17,
        speed: rand(2.0, 2.35) * d.speedMul,

        staminaMax: rand(85, 115) * d.staminaMul,
        stamina: rand(75, 105) * d.staminaMul,
        restTimer: 0,
        facing: rand(-Math.PI, Math.PI),
        lookWobble: rand(-0.6, 0.6),
        fov: rand(0.95, 1.18),
        viewRange: rand(230, 310) * d.senseMul,

        target: null,
        lastSeen: null,
        mode: "patrol",
        lookTimer: rand(0, 2),
        sonarTimer: rand(2, 8) * d.sonarMul,
        wanderTimer: 0
      });

      this.chooseWanderTarget(state, state.seekers[state.seekers.length - 1]);
    }
  },

  canSeePlayer(state, s) {
    const { dist, angleTo, normAngle } = window.GameUtils;
    const player = state.player;

    const d = dist(s, player);
    const hiddenBonus = player.disguise && !player.moving ? 0.55 : 1;
    const range = s.viewRange * (1 + player.heat / 135) * hiddenBonus;
    if (d > range) return false;

    const a = angleTo(s, player);
    const diff = Math.abs(normAngle(a - s.facing));
    if (diff > s.fov / 2) return false;

    return window.GameMap.hasLineOfSight(state, s, player);
  },

  chooseWanderTarget(state, s) {
    const { WORLD } = window.GameConfig;
    const { rand, clamp } = window.GameUtils;

    s.wanderTimer = rand(1.2, 3.2);
    const angle = s.facing + rand(-1.5, 1.5);
    const distance = rand(120, 320);

    s.target = {
      x: clamp(s.x + Math.cos(angle) * distance, 60, WORLD.w - 60),
      y: clamp(s.y + Math.sin(angle) * distance, 60, WORLD.h - 60)
    };
  },

  updateStamina(state, s, dt) {
    const { clamp, rand } = window.GameUtils;

    if (s.mode === "rest") {
      s.restTimer -= dt;
      s.stamina = clamp(s.stamina + 28 * dt, 0, s.staminaMax);
      s.facing += Math.sin(state.elapsed * 4 + s.lookWobble) * 0.035;

      if (s.restTimer <= 0 && s.stamina > s.staminaMax * 0.45) {
        s.mode = "patrol";
        this.chooseWanderTarget(state, s);
      }
      return;
    }

    if (s.mode === "chase") s.stamina -= 22 * dt;
    else if (s.mode === "investigate" || s.mode === "search") s.stamina -= 8 * dt;
    else if (s.mode === "patrol") s.stamina -= 3.2 * dt;

    if (s.stamina <= 0) {
      s.stamina = 0;
      s.mode = "rest";
      s.restTimer = rand(3, 6);
      s.target = null;
      state.pings.push({ x: s.x, y: s.y, r: 16, life: 1.1, kind: "tired" });
    }
  },

  update(state, dt) {
    const { DIFFICULTIES } = window.GameConfig;
    const { rand, clamp, dist } = window.GameUtils;

    const d = DIFFICULTIES[state.difficulty];

    for (const s of state.seekers) {
      s.sonarTimer -= dt;
      s.lookTimer -= dt;
      s.wanderTimer -= dt;

      this.updateStamina(state, s, dt);
      if (s.mode === "rest") continue;

      const saw = this.canSeePlayer(state, s);
      const heardRange = (state.player.moving ? (state.player.dash ? 380 : 210) : 0) * d.senseMul;

      if (saw) {
        s.mode = "chase";
        s.lastSeen = { x: state.player.x, y: state.player.y, timer: 2.0 };
        s.target = { x: state.player.x, y: state.player.y };
      } else if (s.lastSeen) {
        s.lastSeen.timer -= dt;
        if (s.lastSeen.timer > 0) {
          s.mode = "search";
          s.target = {
            x: s.lastSeen.x + rand(-30, 30),
            y: s.lastSeen.y + rand(-30, 30)
          };
        } else {
          s.lastSeen = null;
          if (s.mode === "chase") s.mode = "search";
        }
      }

      if (!saw && dist(s, state.player) < heardRange && s.mode !== "chase") {
        s.mode = "investigate";
        s.target = {
          x: state.player.x + rand(-90, 90),
          y: state.player.y + rand(-90, 90)
        };
      }

      if (s.sonarTimer <= 0) {
        s.sonarTimer = rand(5, 9) * d.sonarMul;
        state.pings.push({ x: s.x, y: s.y, r: 25, life: 1.1, kind: "sonar" });

        if (dist(s, state.player) < (330 + state.player.heat * 1.8) * d.senseMul && s.mode !== "chase") {
          s.mode = "investigate";
          s.target = {
            x: state.player.x + rand(-90, 90),
            y: state.player.y + rand(-90, 90)
          };
        }
      }

      let freshest = null;
      for (const f of state.footprints) {
        if (f.life > 0.7 && dist(s, f) < 300 * f.strength * d.senseMul) {
          if (!freshest || f.life > freshest.life) freshest = f;
        }
      }

      if (freshest && s.mode !== "chase") {
        s.mode = "investigate";
        s.target = { x: freshest.x, y: freshest.y };
      }

      if (!s.target || dist(s, s.target) < 25 || s.wanderTimer <= 0) {
        if (s.mode === "investigate") s.mode = "search";

        if (s.mode === "search" && Math.random() < 0.55) {
          s.target = {
            x: clamp(s.x + rand(-220, 220), 60, window.GameConfig.WORLD.w - 60),
            y: clamp(s.y + rand(-220, 220), 60, window.GameConfig.WORLD.h - 60)
          };
          s.wanderTimer = rand(0.8, 1.8);
        } else {
          s.mode = "patrol";
          this.chooseWanderTarget(state, s);
        }
      }

      const tiredMul = s.stamina < s.staminaMax * 0.25 ? 0.78 : 1;
      const speed = s.speed * tiredMul * (
        s.mode === "chase" ? 1.52 :
        s.mode === "investigate" ? 1.10 :
        s.mode === "search" ? 0.96 :
        0.82
      );

      window.GameMap.moveEntity(state, s, s.target.x - s.x, s.target.y - s.y, speed);

      if (dist(s, state.player) < s.r + state.player.r + 2) {
        state.endGame();
      }

      if (s.lookTimer <= 0) {
        s.lookTimer = rand(0.8, 1.5);

        for (const p of state.props) {
          if (dist(s, p) < 85 && Math.random() < 0.14) p.suspicious = 1;
        }
      }
    }
  }
};
