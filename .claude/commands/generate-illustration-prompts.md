---
description: 字幕から画像プロンプトを生成
---

# 画像プロンプト生成

`prompt-generator` エージェントを起動して、字幕データから画像プロンプトを生成します。

## 実行

```
Task tool:
- subagent_type: "prompt-generator"
- prompt: "subtitleData.ts を分析して、画像プロンプトを生成してください"
```

## エージェントが行うこと

1. subtitleData.tsを分析
2. 画像が必要なシーンを特定
3. 図解/フォトリアルを判定
4. プロンプトを生成

## 使用するスキル
- `prompt-rules` - 画像プロンプト生成のルールと基準

## 出力
`prompts/` フォルダ
