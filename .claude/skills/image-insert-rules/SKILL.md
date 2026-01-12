---
name: image-insert-rules
description: 画像挿入のルールと基準。タイミング計算、連続画像の処理、タイプ判定の知識を提供。
---

# 画像挿入ルール

生成された画像・動画を動画に挿入するためのルールです。

## ⚠️ 重要: FPS設定

**FPSは必ず `.claude/settings.json` から取得すること。**

```json
{
  "project": {
    "fps": 25
  }
}
```

## 画像タイプ（6種類）

| タイプ | 説明 | エフェクト | 用途 |
|--------|------|----------|------|
| photo | フォトリアル画像 | ズームイン (1.0→1.05) | 感情表現、雰囲気 |
| infographic | 図解・インフォグラフィック | 全画面表示（ズームなし） | データ、ステップ |
| overlay | 半透明背景付き | 暗いオーバーレイ + 中央配置 | 問題提起、強調 |
| thumbnail | 扇状配置サムネイル | 回転 + スライドイン | CTA、関連動画 |
| video-thumbnail | 動画サムネイル | 境界線あり + スライドイン | 動画再生 |
| video-greenscreen | グリーンバック動画 | クロマキー処理 | LINE登録等 |

## フレーム計算

```typescript
// settings.json から fps を取得
const fps = 25;
const toFrame = (seconds: number) => Math.floor(seconds * fps);

// startFrame = 開始秒 × fps
// endFrame = 終了秒 × fps + 4（4フレーム重ねて隙間防止）
```

## タイミング解析
ファイル名から秒数を抽出:
- `000s-007s_intro_hook.png` → 0秒〜7秒

## タイプ判定
- ファイル名に `infographic` → `type: 'infographic'`
- サムネイル指定 → `type: 'thumbnail'`
- 動画ファイル（.mp4, .mov） → `type: 'video-thumbnail'` or `video-greenscreen`
- その他 → `type: 'photo'`

## サムネイル配置

### 扇状配置（最大3枚）
```typescript
const configs = [
  { position: 0, top: 140, left: 20, rotate: -6, borderColor: '#00ff88', zIndex: 50 },
  { position: 1, top: 360, left: 80, rotate: -2, borderColor: '#00ddff', zIndex: 51 },
  { position: 2, top: 220, left: 420, rotate: 6, borderColor: '#ff6644', zIndex: 52 },
];
```

### スライドインアニメーション
- 4フレームで左からスライドイン
- 複数サムネイルは 0.5秒（約13フレーム @25fps）ずつずらして表示

### サムネイル追加時の必須作業
1. insertImageData.ts にエントリ追加（position: 0, 1, 2）
2. seData.ts にスライドイン効果音追加

## 連続画像の処理

4フレーム重ねて隙間を防ぐ:
```typescript
{ id: 1, startFrame: 0, endFrame: 244, file: '000s-007s_intro_hook.png' },
{ id: 2, startFrame: 240, endFrame: 484, file: '008s-016s_video_purpose.png' },
//                  ↑ 4フレーム重なり
```

## z-index管理

| レイヤー | z-index | 内容 |
|---------|---------|------|
| 0 | - | メイン動画 |
| 1 | 50-52 | サムネイル |
| 2 | 60 | グリーンバック動画 |
| 3 | 100 | タイトル |
| 4 | 200 | 字幕（最前面） |

## 出力形式

```typescript
import type { ImageSegment } from './types';

// FPS: 25 (settings.json)
const fps = 25;
const toFrame = (seconds: number) => Math.floor(seconds * fps);

export const insertImageData: ImageSegment[] = [
  { id: 1, startFrame: toFrame(7), endFrame: toFrame(12), file: '007s-011s_3tools.png', type: 'infographic' },
  { id: 24, startFrame: toFrame(149), endFrame: toFrame(156), file: 'AIでアプリ開発する方法.png', type: 'thumbnail', position: 0 },
];
```

## 出力先
- データ: `src/InsertImage/insertImageData.ts`
- 画像: `public/挿入画像/`
- 動画: `public/挿入動画/`
