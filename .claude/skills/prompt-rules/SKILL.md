---
name: prompt-rules
description: 画像プロンプト生成のルールと基準。図解/フォトリアル判定、プロンプトテンプレートの知識を提供。
---

# 画像プロンプト生成ルール

字幕データから動画挿入用の画像プロンプトを生成するためのルールです。

## ⚠️ 重要: FPS設定

**FPSは必ず `.claude/settings.json` から取得すること。**

```json
{
  "project": {
    "fps": 25
  }
}
```

## 画像タイプ判定

| シーン内容 | タイプ |
|-----------|--------|
| ステップ説明、データ、比較、まとめ | 図解 (infographic) |
| 感情表現、抽象概念、雰囲気演出 | フォトリアル (photo) |

## プロンプトテンプレート

### 図解 (infographic)
```
Japanese YouTube tutorial slide.

STYLE:
- Background: [グラデーション]
- Text color: White with [アクセント色] accents
- Design: Infographic/Flow diagram
- Aspect ratio: 16:9 landscape

CONTENT:
Title: "[タイトル]"
[コンテンツ]
```

### フォトリアル (photo)
```json
{
  "image_prompt": "A photograph showing [被写体]. [ホログラフィック要素]. [照明].",
  "width": "1024",
  "height": "600"
}
```

## タイミング計算

```typescript
// settings.json から fps を取得
const fps = 25;

// フレーム→秒
const toSeconds = (frame: number) => frame / fps;

// 開始秒 = Math.floor(startFrame / fps)
// 終了秒 = Math.floor(endFrame / fps)
```

## ファイル名規則

### プロンプトファイル
- `[番号]_infographic_[名前].md` - 図解
- `[番号]_image_[名前].md` - フォトリアル

### 生成画像ファイル
- `[開始秒]s-[終了秒]s_[名前].png`
- 例: `000s-007s_intro_hook.png`

## 出力先
`prompts/` フォルダ

## 画像が必要なシーンの判定基準

1. **強調シーン** - style: emphasis / warning / success
2. **説明シーン** - ステップ説明、リスト、比較
3. **数値シーン** - 統計、金額、時間
4. **概念シーン** - 抽象的な概念の可視化
