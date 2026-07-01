window.GameUtils = {
  rand(a, b) {
    return Math.random() * (b - a) + a;
  },

  clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  },

  dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  },

  angleTo(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
  },

  normAngle(a) {
    return Math.atan2(Math.sin(a), Math.cos(a));
  }
};
