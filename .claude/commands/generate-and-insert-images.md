---
description: 画像生成 → 動画挿入
---

# 画像生成 → 動画挿入

画像を生成し、Remotion動画に挿入するまでを実行します。

## 実行手順

### Step 1: 画像生成

```
Skill tool:
- skill: "gemini-image-generator"
- args: "prompts/ フォルダ内のプロンプトで画像を生成"
```

### Step 2: 画像挿入

```
Task tool:
- subagent_type: "image-inserter"
- prompt: "generated_images/ の画像を動画に挿入してください"
```

## 使用するスキル
- `gemini-image-generator` - 画像生成
- `image-insert-rules` - 画像挿入のルールと基準

## 出力
- `public/挿入画像/` - 画像ファイル
- `src/InsertImage/insertImageData.ts` - 挿入データ
