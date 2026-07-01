# W:E:go Backstage Hunt Prototype

ファイル分割版のHide & Seek系ブラウザゲーム試作です。

## 構成

```text
index.html
styles/
  style.css
scripts/
  config.js
  utils.js
  map.js
  player.js
  ai.js
  render.js
  debug.js
  main.js
README.md
```

## 操作

- WASD / 矢印キー: 移動
- Space: 近くのオブジェクトに変身
- Shift: ダッシュ
- R: 緊急リロード
- Esc: タイトル画面へ戻る

## 今回の修正

- `index.html` からCSSとJavaScriptを分離
- 壁に埋まりにくい安全スポーン処理を追加
- Rキーで緊急脱出できるように追加
- Escキーでタイトルへ戻れるように追加
- 今後、AI・マップ・描画・デバッグを別々に更新しやすい構成に変更
