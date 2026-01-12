---
name: srt-rules
description: SRT変換のルールと基準。タイムスタンプ変換、style自動判定、highlight抽出の知識を提供。
---

# SRT変換ルール

SRTファイルをRemotionのsubtitleData.ts形式に変換するためのルールです。

## ⚠️ 重要: FPS設定

**FPSは必ず `.claude/settings.json` から取得すること。**

```json
// .claude/settings.json
{
  "project": {
    "fps": 25  // ← この値を使用
  }
}
```

ハードコードしない（30fps固定などは禁止）。

## フレーム計算

```typescript
// settings.json から fps を取得
const fps = settings.project.fps; // 例: 25

const toFrame = (seconds: number) => Math.floor(seconds * fps);

// SRTタイムスタンプ → フレーム
// "00:01:23,456" → (1*60 + 23 + 0.456) * fps
```

## style自動判定

| キーワード | style |
|-----------|-------|
| 買うな、NG、ダメ、地獄、注意、失敗、もったいない | warning |
| 達成、成功、倍、自動、完成、無料、簡単 | success |
| 重要、ポイント、衝撃、必見、秘密 | emphasis |
| その他 | normal |

## highlight抽出

自動抽出するパターン:
- 「」で囲まれた部分
- 数字+単位（60万円、10倍、5分）
- 固有名詞（Claude Code、Gemini、NanoBanana、Remotion）
- 強調語（完全無料、〇〇だけ）

## animation判定

| style | animation |
|-------|-----------|
| emphasis | slideIn |
| warning | slideIn |
| success | slideIn |
| normal | fadeOnly |

## 出力形式

```typescript
import type { SubtitleSegment } from './types';

// FPS: 25 (settings.json)
export const subtitleData: SubtitleSegment[] = [
  {
    id: 1,
    startFrame: 0,
    endFrame: 90,
    text: "テキスト",
    style: "normal",
    highlight: "キーワード",
    animation: "fadeOnly"
  },
];
```

## 出力先

`src/Subtitles/subtitleData.ts`
