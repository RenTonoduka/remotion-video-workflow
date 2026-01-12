---
description: テロップ微調整
---

# テロップ微調整

`subtitle-adjuster` エージェントを起動して、テロップの診断・修正を行います。

## 実行

```
Task tool:
- subagent_type: "subtitle-adjuster"
- prompt: "subtitleData.ts を診断して、問題があれば報告してください"
```

## エージェントが行うこと

1. **自動診断**
   - フレーム矛盾
   - 順序矛盾
   - highlight不一致
   - 不適切な改行（「、」や助詞で終わる）
   - 3行以上のテロップ
   - 音声認識誤変換・固有名詞
   - 文章の区切り

2. **診断結果報告**

3. **ユーザー指示に従って修正**

## ⚠️ 自動修正の制限

### 自動修正OK
- 音声認識誤変換・固有名詞（クロードコード→Claude Code等）
- 改行位置調整
- highlight不一致
- 3行→2行分割
- フレーム矛盾・順序矛盾

### 自動修正NG
- タイミング（startFrame/endFrame）← `/sync-subtitles` で対応

## 使用するスキル
- `subtitle-rules` - テロップ調整のルールと診断基準
