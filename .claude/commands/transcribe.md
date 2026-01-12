---
description: 音声からワードタイムスタンプ付きJSONを生成
---

# 音声文字起こし（Whisper）

Whisper APIを使用して、音声/動画ファイルからワードタイムスタンプ付きJSONを生成します。

## 前提条件

```bash
# 1. OpenAI APIキーを設定
export OPENAI_API_KEY="sk-..."

# 2. パッケージをインストール
pip install openai
```

## 使い方

```bash
# 基本（transcripts/にJSON出力）
python scripts/transcribe.py public/main-video.mp4

# 出力ファイル指定
python scripts/transcribe.py public/main-video.mp4 -o transcripts/output.json

# 英語の場合
python scripts/transcribe.py audio.mp3 -l en
```

## 出力形式

```json
{
  "text": "全文テキスト",
  "language": "ja",
  "duration": 325.28,
  "segments": [
    {
      "id": 0,
      "start": 0.0,
      "end": 1.74,
      "text": "実はこの動画AIで作りました",
      "words": [
        {"word": "実", "start": 0.0, "end": 0.28},
        {"word": "は", "start": 0.28, "end": 0.42},
        {"word": "この", "start": 0.42, "end": 0.6}
      ]
    }
  ],
  "words": [
    {"word": "実", "start": 0.0, "end": 0.28},
    {"word": "は", "start": 0.28, "end": 0.42}
  ]
}
```

## 料金

- Whisper API: $0.006/分
- 10分の動画: 約$0.06（約9円）

## 次のステップ

```bash
# 1. ワードを文に結合
python scripts/combine_sentences.py transcripts/output.json

# 2. 文を編集（誤変換修正）
/edit-sentences

# 3. SRTに変換
python scripts/format_subtitles.py transcripts/output.sentences.json

# 4. subtitleDataに変換
/convert-srt transcripts/output.srt
```

または一括実行:
```bash
/transcribe-workflow
```
