# W:E:go Backstage Hunt Prototype

スマホ操作対応版のHide & Seek系ブラウザゲーム試作です。

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
  mobile.js
  ui-mobile.js
  debug.js
  main.js
README.md
```

## 操作

### PC

- WASD / 矢印キー: 移動
- Space: 近くのオブジェクトに変身
- Shift: ダッシュ
- R: 緊急リロード
- Esc: タイトル画面へ戻る

### スマホ

- 左下スティック: 移動
- 右上ボタン: ダッシュ
- 右下ボタン: 変身

## 今回の追加

- `scripts/mobile.js` を追加
- `scripts/ui-mobile.js` を追加
- スマホ用バーチャルスティック追加
- ダッシュボタン追加
- 変身ボタン追加
- スマホでスクロールやズームが起きにくいように調整
