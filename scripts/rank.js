window.GameRank = {
  tiers: [
    { min: 0,     emoji: "🌱", name: "Invisible", color: "#b7f7c0" },
    { min: 1000,  emoji: "🌿", name: "Silent", color: "#9df0a5" },
    { min: 3000,  emoji: "🍃", name: "Shadow", color: "#b6f7e4" },
    { min: 6000,  emoji: "🌙", name: "Ghost", color: "#d8d0ff" },
    { min: 10000, emoji: "👤", name: "Phantom", color: "#f0f0f0" },
    { min: 15000, emoji: "👑", name: "Invisible Legend", color: "#ffe48a" }
  ],

  get(score) {
    let current = this.tiers[0];

    for (const tier of this.tiers) {
      if (score >= tier.min) current = tier;
    }

    return current;
  },

  next(score) {
    return this.tiers.find(tier => score < tier.min) ?? null;
  },

  label(score) {
    const rank = this.get(score);
    return `${rank.emoji} ${rank.name}`;
  }
};
