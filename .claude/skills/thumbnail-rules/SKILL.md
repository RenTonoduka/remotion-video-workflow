---
name: thumbnail-rules
description: サムネイル挿入のルールと基準。扇状配置、スライドインSE、終了タイミング決定の知識を提供。
---

# サムネイル挿入ルール

特定のテロップ表示タイミングに合わせて、サムネイル画像・動画をスライドインで挿入するためのルールです。

## ⚠️ 重要: FPS設定

**FPSは必ず `.claude/settings.json` から取得すること。**

```json
{
  "project": {
    "fps": 25
  }
}
```

## ユースケース

- CTA（他の動画への誘導）
- 関連動画サムネイル表示
- ワークショップ・イベント告知
- LINE登録誘導（グリーンバック動画）

## サムネイルタイプ

| タイプ | 用途 | ファイル形式 |
|--------|------|-------------|
| thumbnail | 静止画サムネイル | .png, .jpg |
| video-thumbnail | 動画再生サムネイル | .mp4, .mov |
| video-greenscreen | グリーンバック動画 | .mp4 |

## 扇状配置（最大3枚）

```typescript
const configs = [
  { position: 0, top: 140, left: 20, rotate: -6, borderColor: '#00ff88', zIndex: 50 },
  { position: 1, top: 360, left: 80, rotate: -2, borderColor: '#00ddff', zIndex: 51 },
  { position: 2, top: 220, left: 420, rotate: 6, borderColor: '#ff6644', zIndex: 52 },
];
```

## 複数サムネイル表示

```typescript
// settings.json から fps を取得
const fps = 25;

// 0.5秒（約13フレーム @25fps）ずらして順番にスライドイン
{ startFrame: toFrame(149), ..., position: 0 },     // 1枚目
{ startFrame: toFrame(149.5), ..., position: 1 },   // 2枚目 (+0.5秒)
{ startFrame: toFrame(150), ..., position: 2 },     // 3枚目 (+1.0秒)
```

## スライドインSE

| タイプ | 推奨SE | volume |
|--------|--------|--------|
| thumbnail | カーソル移動8 (1).mp3 | 0.4 |
| video-thumbnail | カーソル移動1 (2).mp3 | 0.4 |
| video-greenscreen | カーソル移動1 (2).mp3 | 0.4 |

## 処理フロー

```
1. ユーザーから対象テロップのキーワードを受け取る
2. subtitleData.ts から該当テロップを検索
   → startFrame, endFrame を取得
3. 画像/動画ファイルを確認
4. insertImageData.ts にエントリ追加
5. seData.ts にスライドインSE追加
6. 完了報告
```

## 出力形式

### insertImageData.ts
```typescript
// サムネイル
{ id: 27, startFrame: 4022, endFrame: 4430, file: 'AI×動画編集WS体験会.png', type: 'thumbnail', position: 1 },

// 動画サムネイル
{ id: 28, startFrame: 4105, endFrame: 4430, file: 'ライブ配信.mov', type: 'video-thumbnail', position: 2 },

// グリーンバック動画
{ id: 31, startFrame: 20554, endFrame: 20700, file: 'LINE登録.mp4', type: 'video-greenscreen' },
```

### seData.ts
```typescript
{ id: 194, startFrame: 4022, file: 'カーソル移動1 (2).mp3', volume: 0.4 },
```

## 終了タイミングの決め方

1. **特定テロップまで表示**: そのテロップの endFrame を使用
2. **複数テロップにまたがる**: 最後のテロップの endFrame を使用
3. **固定時間表示**: startFrame + (秒数 × fps)

## z-index

- 字幕: 200（最前面）
- タイトル: 100
- グリーンバック動画: 60
- サムネイル: 50-52
