---
description: 左上タイトル機能を追加
---

# タイトル生成

`title-generator` エージェントを起動して、動画の左上に表示するキャッチコピーを生成します。

## 実行

```
Task tool:
- subagent_type: "title-generator"
- prompt: "subtitleData.ts を分析して、キャッチコピーを生成してください"
```

## エージェントが行うこと

1. subtitleData.tsを分析
2. 印象的なフレーズを抽出
3. キャッチコピーを生成
4. 表示タイミングを設定

## 使用するスキル
- `title-rules` - タイトル生成のルールと基準

## 出力
`src/Title/titleData.ts`
