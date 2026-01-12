---
description: Remotion動画制作ワークフロー
---

# Remotion動画制作ワークフロー

`video-producer` エージェントを起動して、動画制作の全工程を自動実行します。

## 入力
- SRTファイルパス: $ARGUMENTS

## 実行

```
Task tool:
- subagent_type: "video-producer"
- prompt: "$ARGUMENTS を使って動画制作ワークフローを実行してください"
```

## ワークフロー（順番に実行）

### Phase 0: 環境準備
1. **準備確認** - main-video.mp4, BGM/, se/ を確認

### Phase 1: 文字起こし
2. **Whisper文字起こし** - scripts/transcribe.py（ワードタイムスタンプ）
3. **文結合** - scripts/combine_sentences.py（ワード→文単位）
4. **SRT生成** - scripts/format_subtitles.py（文→SRT）
5. **文編集** - sentence-editor エージェント（誤字修正・固有名詞変換）

### Phase 2: テロップ
6. **SRT変換** - srt-converter エージェント
7. **音声同期チェック** - sync-adjuster エージェント（SRTとタイミング比較）
8. **テロップ調整** - subtitle-adjuster エージェント（誤変換、改行、3行チェック）

### Phase 3: 装飾
9. **タイトル生成** - title-generator エージェント
10. **SE配置** - se-placer エージェント
11. **BGM設定** - BGM_DURATION_FRAMES設定

### Phase 4: 画像
12. **プロンプト生成** - prompt-generator エージェント
13. **画像生成** - gemini-image-generator スキル使用
14. **画像挿入** - image-inserter エージェント

### Phase 5: 出力
15. **プレビュー** - npm run dev
16. **書き出し** - npx remotion render

## 使用するエージェント
- `sentence-editor` - 文編集（誤字修正・固有名詞変換）
- `srt-converter` - SRT→subtitleData変換
- `sync-adjuster` - 音声同期チェック（慎重に修正）
- `subtitle-adjuster` - テロップ品質チェック
- `title-generator` - 左上タイトル生成
- `se-placer` - 効果音配置
- `prompt-generator` - 画像プロンプト生成
- `image-inserter` - 画像挿入

## 使用するスクリプト
- `scripts/transcribe.py` - Whisper API文字起こし（ワードタイムスタンプ）
- `scripts/combine_sentences.py` - ワード→文単位に結合
- `scripts/format_subtitles.py` - 文→SRT形式に変換

## 使用するスキル
- `srt-rules` - SRT変換ルール
- `sync-rules` - 音声同期ルール
- `subtitle-rules` - テロップ調整ルール
- `title-rules` - タイトル生成ルール
- `se-rules` - SE配置ルール
- `prompt-rules` - プロンプト生成ルール
- `image-insert-rules` - 画像挿入ルール
- `gemini-image-generator` - 画像生成
