window.GameMobile = {
  enabled: false,
  input: { x: 0, y: 0, dash: false },
  joystick: { active: false, pointerId: null, centerX: 0, centerY: 0, radius: 46 },

isTouchDevice() {
    const ua = navigator.userAgent.toLowerCase();
    const isRealMobile =
      /android|iphone|ipad|ipod/.test(ua);

    return isRealMobile;
},

install(state) {
    this.enabled = this.isTouchDevice();
    const controls = document.getElementById("mobileControls");
    if (!controls || !this.enabled) return;

    controls.classList.add("is-visible");
    controls.setAttribute("aria-hidden", "false");
    document.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
    document.addEventListener("contextmenu", e => e.preventDefault());
    this.state = state;
  },

  setMoveFromPointer(clientX, clientY) {
    const { clamp } = window.GameUtils;
    const joy = this.joystick;
    const dx = clientX - joy.centerX;
    const dy = clientY - joy.centerY;
    const len = Math.hypot(dx, dy);
    const limited = Math.min(len, joy.radius);

    if (len < 8) {
      this.input.x = 0;
      this.input.y = 0;
      window.GameMobileUI.setKnob(0, 0);
      return;
    }

    const nx = dx / len;
    const ny = dy / len;
    this.input.x = clamp(dx / joy.radius, -1, 1);
    this.input.y = clamp(dy / joy.radius, -1, 1);
    window.GameMobileUI.setKnob(nx * limited, ny * limited);
  },

  resetMove() {
    this.joystick.active = false;
    this.joystick.pointerId = null;
    this.input.x = 0;
    this.input.y = 0;
    if (window.GameMobileUI) window.GameMobileUI.setKnob(0, 0);
  },

  setDash(value) {
    this.input.dash = value;
    if (window.GameMobileUI) window.GameMobileUI.setDashPressed(value);
  }
};
