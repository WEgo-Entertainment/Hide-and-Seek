window.GameDebug = {
  install(state) {
    document.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();

      if (key === "r") {
        location.reload();
      }

      if (e.key === "Escape") {
        state.backToTitle();
      }
    });
  }
};
