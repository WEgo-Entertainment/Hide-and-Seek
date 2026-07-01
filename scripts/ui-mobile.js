window.GameMobileUI = {
  install(state) {
    const mobile = window.GameMobile;
    if (!mobile.enabled) return;

    const joystick = document.getElementById("joystick");
    const dashButton = document.getElementById("dashButton");
    const disguiseButton = document.getElementById("disguiseButton");

    if (!joystick || !dashButton || !disguiseButton) return;

    this.joystick = joystick;
    this.knob = document.getElementById("joystickKnob");
    this.dashButton = dashButton;
    this.disguiseButton = disguiseButton;

    joystick.addEventListener("pointerdown", e => {
      e.preventDefault();
      joystick.setPointerCapture(e.pointerId);

      const rect = joystick.getBoundingClientRect();
      mobile.joystick.active = true;
      mobile.joystick.pointerId = e.pointerId;
      mobile.joystick.centerX = rect.left + rect.width / 2;
      mobile.joystick.centerY = rect.top + rect.height / 2;
      mobile.joystick.radius = rect.width * 0.39;

      mobile.setMoveFromPointer(e.clientX, e.clientY);
    });

    joystick.addEventListener("pointermove", e => {
      if (!mobile.joystick.active || mobile.joystick.pointerId !== e.pointerId) return;
      e.preventDefault();
      mobile.setMoveFromPointer(e.clientX, e.clientY);
    });

    joystick.addEventListener("pointerup", e => {
      if (mobile.joystick.pointerId !== e.pointerId) return;
      e.preventDefault();
      mobile.resetMove();
    });

    joystick.addEventListener("pointercancel", e => {
      if (mobile.joystick.pointerId !== e.pointerId) return;
      e.preventDefault();
      mobile.resetMove();
    });

    const dashOn = e => {
      e.preventDefault();
      mobile.setDash(true);
    };

    const dashOff = e => {
      e.preventDefault();
      mobile.setDash(false);
    };

    dashButton.addEventListener("pointerdown", dashOn);
    dashButton.addEventListener("pointerup", dashOff);
    dashButton.addEventListener("pointercancel", dashOff);
    dashButton.addEventListener("pointerleave", dashOff);

    disguiseButton.addEventListener("pointerdown", e => {
      e.preventDefault();
      window.GamePlayer.tryDisguise(state);
      disguiseButton.classList.add("is-pressed");
      setTimeout(() => disguiseButton.classList.remove("is-pressed"), 120);
    });
  },

  setKnob(x, y) {
    if (!this.knob) return;
    this.knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  },

  setDashPressed(value) {
    if (!this.dashButton) return;
    this.dashButton.classList.toggle("is-pressed", value);
  }
};
