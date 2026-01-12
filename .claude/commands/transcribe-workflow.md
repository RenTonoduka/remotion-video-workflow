---
description: 音声→字幕の完全ワークフロー
---

# 音声→字幕 完全ワークフロー

音声ファイルから正確なsubtitleData.tsを生成する完全ワークフローです。

## ワークフロー概要

```
音声/動画ファイル
    ↓ Step 1: transcribe.py
ワードタイムスタンプJSON (transcripts/*.json)
    ↓ Step 2: combine_sentences.py
文JSON (transcripts/*.sentences.json)
    ↓ Step 3: /edit-sentences ★人間が編集
文JSON（編集済み）
    ↓ Step 4: format_subtitles.py
SRT (transcripts/*.srt)
    ↓ Step 5: /convert-srt
subtitleData.ts
```

## 実行手順

### Step 1: 音声からワードタイムスタンプ取得

```bash
# OpenAI APIキーが必要
export OPENAI_API_KEY="sk-..."

# 動画から直接文字起こし（mp4対応）
python scripts/transcribe.py public/main-video.mp4

# または音声ファイルから
python scripts/transcribe.py public/audio.mp3
```

出力: `transcripts/[ファイル名].json`

### Step 2: ワードを文に結合

```bash
python scripts/combine_sentences.py transcripts/main-video.json
```

出力: `transcripts/main-video.sentences.json`

### Step 3: 文を編集 ★重要

```
/edit-sentences
```

または手動で sentences.json を編集:
- 誤字修正（クロードコード → Claude Code）
- 文の区切り調整
- 不要な文の削除

### Step 4: SRT生成

```bash
python scripts/format_subtitles.py transcripts/main-video.sentences.json
```

出力: `transcripts/main-video.srt`

### Step 5: subtitleData.ts に変換

```
/convert-srt transcripts/main-video.srt
```

出力: `src/Subtitles/subtitleData.ts`

## 一括実行（Step 1-2, 4）

```bash
# 文字起こし → 文結合
python scripts/transcribe.py public/main-video.mp4 && \
python scripts/combine_sentences.py transcripts/main-video.json && \
echo "✅ sentences.json 生成完了。/edit-sentences で編集してください"
```

編集後:
```bash
# SRT生成 → subtitleData変換
python scripts/format_subtitles.py transcripts/main-video.sentences.json
# その後 /convert-srt を実行
```

## 料金目安

- Whisper API: $0.006/分
- 10分動画: 約$0.06（約9円）
- 60分動画: 約$0.36（約54円）

## トラブルシューティング

### OpenAI APIキーエラー
```bash
export OPENAI_API_KEY="sk-..."
```

### 文字起こし精度が低い
- 音声品質を確認（ノイズ除去推奨）
- 言語を明示的に指定: `-l ja`

### 文の区切りがおかしい
- `sentences.json` を手動編集
- `/edit-sentences` で診断・修正
