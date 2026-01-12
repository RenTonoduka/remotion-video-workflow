---
description: SE（効果音）を配置
---

# SE配置

`se-placer` エージェントを起動して、効果音を適切な箇所に配置します。

## 実行

```
Task tool:
- subagent_type: "se-placer"
- prompt: "subtitleData.ts を分析して、SEを配置してください"
```

## エージェントが行うこと

1. public/se/ のSEファイル一覧を確認
2. subtitleData.tsを分析
3. style/highlightに基づいてSEを選択
4. 適切な箇所に配置

## 使用するスキル
- `se-rules` - SE配置のルールと基準

## 出力
`src/SoundEffects/seData.ts`
