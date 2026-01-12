---
description: SRTファイルをsubtitleDataに変換
---

# SRT変換

`srt-converter` エージェントを起動して、SRTファイルをRemotionのsubtitleData形式に変換します。

## 入力
- SRTファイルのパス: $ARGUMENTS

## 実行

```
Task tool:
- subagent_type: "srt-converter"
- prompt: "$ARGUMENTS を読み込んで subtitleData.ts に変換してください"
```

## エージェントが行うこと

1. SRTファイルを読み込む
2. タイムスタンプをフレーム番号に変換（30fps）
3. テキスト内容からstyleを自動判定
4. highlightを自動抽出
5. TypeScript形式で出力

## 使用するスキル
- `srt-rules` - SRT変換のルールと基準

## 出力
`src/Subtitles/subtitleData.ts`
