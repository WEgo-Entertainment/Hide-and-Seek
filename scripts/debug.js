window.GameDebug = {
  install(state) {
    document.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();

      // 緊急脱出。壁埋まりや操作不能になった時用。
      if (key === "r") {
        location.reload();
      }

      // タイトル画面へ戻る。
      if (e.key === "Escape") {
        state.backToTitle();
      }
    });
  }
};
