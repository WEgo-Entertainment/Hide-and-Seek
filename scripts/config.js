window.GameConfig = {
  WORLD: { w: 2200, h: 1400 },

  DIFFICULTIES: {
    easy:      { label: "Easy",      seekerCount: 3,  speedMul: 0.92, senseMul: 0.82, sonarMul: 1.25, staminaMul: 1.15 },
    normal:    { label: "Normal",    seekerCount: 5,  speedMul: 1.00, senseMul: 1.00, sonarMul: 1.00, staminaMul: 1.00 },
    hard:      { label: "Hard",      seekerCount: 8,  speedMul: 1.08, senseMul: 1.15, sonarMul: 0.82, staminaMul: 0.92 },
    nightmare: { label: "Nightmare", seekerCount: 12, speedMul: 1.16, senseMul: 1.35, sonarMul: 0.62, staminaMul: 0.82 }
  },

  PROP_TYPES: [
    { name: "crate", w: 34, h: 34 },
    { name: "barrel", w: 28, h: 38 },
    { name: "plant", w: 30, h: 44 },
    { name: "box", w: 46, h: 28 }
  ]
};
