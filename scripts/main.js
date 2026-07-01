(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const state = {
    canvas,
    ctx,
    W: innerWidth,
    H: innerHeight,

    difficulty: null,
    started: false,
    gameOver: false,
    elapsed: 0,

    keys: new Set(),
    props: [],
    walls: [],
    seekers: [],
    footprints: [],
    pings: [],

    ui: {
      score: document.getElementById("score"),
      heat: document.getElementById("heat"),
      time: document.getElementById("time"),
      mode: document.getElementById("mode"),
      difficulty: document.getElementById("difficulty"),
      seekers: document.getElementById("seekers"),
      restart: document.getElementById("restart"),
      menu: document.getElementById("menu")
    },

    camera() {
      const { WORLD } = window.GameConfig;
      const { clamp } = window.GameUtils;

      return {
        x: clamp(this.player.x - this.W / 2, 0, WORLD.w - this.W),
        y: clamp(this.player.y - this.H / 2, 0, WORLD.h - this.H)
      };
    },

    endGame() {
      this.gameOver = true;
      this.ui.restart.style.display = "block";
      this.ui.restart.textContent = `捕まった！ Score ${Math.floor(this.player.score)} / 難易度選択へ`;
    },

    backToTitle() {
      this.gameOver = false;
      this.started = false;
      this.difficulty = null;
      this.ui.restart.style.display = "none";
      this.ui.menu.style.display = "grid";
      this.ui.score.textContent = "0";
      this.ui.heat.textContent = "0";
      this.ui.time.textContent = "0";
      this.ui.mode.textContent = "waiting";
      this.ui.difficulty.textContent = "-";
      this.ui.seekers.textContent = "0";

      if (window.GameMobile) {
        window.GameMobile.resetMove();
        window.GameMobile.setDash(false);
      }
    }
  };

  function resize() {
    state.W = canvas.width = innerWidth;
    state.H = canvas.height = innerHeight;
  }

  addEventListener("resize", resize);
  addEventListener("orientationchange", () => setTimeout(resize, 250));
  resize();

 addEventListener("keydown", e => {
  const key = e.key.toLowerCase();

  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
    e.preventDefault();
  }

  state.keys.add(key);

  if (e.code === "Space") {
    window.GamePlayer.tryDisguise(state);
  }
});


  addEventListener("keyup", e => {
    state.keys.delete(e.key.toLowerCase());
  });

  document.querySelectorAll(".difficulty").forEach(btn => {
    btn.addEventListener("click", () => {
      state.difficulty = btn.dataset.level;
      state.started = true;
      state.ui.menu.style.display = "none";
      resetWorld();
    });
  });

  state.ui.restart.onclick = () => {
    state.backToTitle();
  };

  function resetWorld() {
    state.props = [];
    state.walls = [];
    state.seekers = [];
    state.footprints = [];
    state.pings = [];
    state.elapsed = 0;
    state.gameOver = false;

    window.GameMap.generateWalls(state);
    window.GamePlayer.create(state);
    window.GameMap.generateProps(state);
    window.GameAI.createSeekers(state);

    const d = window.GameConfig.DIFFICULTIES[state.difficulty];
    state.ui.difficulty.textContent = d.label;
    state.ui.seekers.textContent = d.seekerCount;
    state.ui.restart.style.display = "none";

    if (window.GameMobile) {
      window.GameMobile.resetMove();
      window.GameMobile.setDash(false);
    }
  }

  function update(dt) {
    if (!state.started || state.gameOver) return;

    state.elapsed += dt;

    window.GamePlayer.update(state, dt);
    window.GameAI.update(state, dt);

    for (const f of state.footprints) f.life -= dt;
    while (state.footprints.length && state.footprints[0].life <= 0) {
      state.footprints.shift();
    }

    for (const p of state.pings) {
      p.life -= dt;
      p.r += (p.kind === "sonar" ? 270 : p.kind === "tired" ? 90 : 160) * dt;
    }

    for (let i = state.pings.length - 1; i >= 0; i--) {
      if (state.pings[i].life <= 0) state.pings.splice(i, 1);
    }

    for (const p of state.props) {
      p.suspicious = Math.max(0, p.suspicious - dt);
    }

    state.ui.score.textContent = Math.floor(state.player.score);
    state.ui.heat.textContent = Math.floor(state.player.heat);
    state.ui.time.textContent = Math.floor(state.elapsed);
    state.ui.mode.textContent = state.player.disguise ? "disguised" : "hiding";
  }

  window.GameMobile.install(state);
  window.GameMobileUI.install(state);
  window.GameDebug.install(state);

  let last = performance.now();

  function loop(now = performance.now()) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;

    update(dt);
    window.GameRender.draw(state);

    requestAnimationFrame(loop);
  }

  loop();

  window.BackstageHunt = {
    state,
    resetWorld,
    backToTitle: () => state.backToTitle()
  };
})();
