---
name: se-rules
description: SE配置のルールと基準。効果音の選択、配置タイミング、音量調整の知識を提供。
---

# SE配置ルール

効果音（SE）を動画の適切な箇所に配置するためのルールです。

## ⚠️ 重要: FPS設定

**FPSは必ず `.claude/settings.json` から取得すること。**

```json
{
  "project": {
    "fps": 25
  }
}
```

## SE用途ガイド

| SE種類 | ファイル例 | 用途 |
|--------|----------|------|
| 決定ボタン系 | 決定ボタンを押す2.mp3 | 重要ポイント、成功、達成 |
| パッ系 | パッ (1).mp3 | 軽いポイント、登場 |
| ニュッ系 | ニュッ1.mp3 | 軽い表示、切り替え |
| カーソル移動系 | カーソル移動8 (1).mp3 | ステップ、遷移、スライドイン |
| 涙/悲しい系 | 涙.mp3 | 残念、もったいない、ネガティブ |
| 間抜け/NG系 | 間抜け3.mp3 | 失敗、ダメ、皮肉 |
| 水滴系 | 水滴3.mp3 | 軽いアクセント |

## 配置ルール

### A. 字幕スタイル別SE選択

| style | 推奨SE | volume |
|-------|--------|--------|
| warning | 間抜け系、涙系 | 0.25-0.3 |
| success | 決定ボタン系 | 0.3 |
| emphasis | パッ系、決定ボタン系 | 0.3 |
| highlight有り | 軽いSE（ニュッ、水滴） | 0.25-0.3 |
| normal | 基本は配置しない | - |

### B. スライドイン効果音（重要）

サムネイル・動画がスライドインする際に必ず配置:

| 画像タイプ | 推奨SE | volume |
|-----------|--------|--------|
| thumbnail | カーソル移動8 (1).mp3 | 0.4 |
| video-thumbnail | カーソル移動1 (2).mp3 | 0.4 |
| video-greenscreen | カーソル移動1 (2).mp3 | 0.4 |

**配置タイミング**: insertImageData.ts の startFrame と同じフレーム

### C. 配置バランス

- **字幕SE**: 全セグメントの20-30%に配置
- **スライドインSE**: thumbnail/video-thumbnail/video-greenscreen に必ず配置
- 同じSEが連続しないようバリエーションを持たせる

### D. 音量調整

| SE種類 | volume |
|--------|--------|
| 通常SE | 0.3 |
| 涙・水滴など長いSE | 0.25 |
| スライドイン効果音 | 0.4 |

## 処理フロー

```
1. subtitleData.ts を読み込み
   ↓
2. style: emphasis/warning/success のセグメントを抽出
   ↓
3. 各セグメントにSEを割り当て
   ↓
4. insertImageData.ts を読み込み
   ↓
5. thumbnail/video-thumbnail/video-greenscreen を抽出
   ↓
6. 各エントリにスライドインSEを割り当て
   ↓
7. seData.ts を生成
```

## 出力形式

```typescript
import type { SoundEffect } from './SEPlayer';

export const seData: SoundEffect[] = [
  // 字幕連動SE
  { id: 1, startFrame: 91, file: '決定ボタンを押す2.mp3', volume: 0.3 },

  // サムネイルスライドインSE（0.5秒=13フレームずらし @25fps）
  { id: 191, startFrame: 3725, file: 'カーソル移動8 (1).mp3', volume: 0.4 },
  { id: 192, startFrame: 3738, file: 'カーソル移動8 (1).mp3', volume: 0.4 },
];
```

## 出力先
`src/SoundEffects/seData.ts`

## 注意事項

- 複数サムネイルは 0.5秒（約13フレーム @25fps）ずらして配置
- スライドインSEは画像の startFrame と完全に一致
- 同じSEが3回以上連続する場合は別のSEに変更
