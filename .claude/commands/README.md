# Remotion動画制作コマンド一覧

このプロジェクトで使用できるClaudeコマンドの一覧です。

## アーキテクチャ

```
コマンド(/xxx) → サブエージェント起動 → スキル発動
     ↓                  ↓                ↓
   薄い             Task tool          実ロジック
  トリガー          で呼び出し          を持つ
```

---

## コマンド一覧

### ワークフロー

| コマンド | 説明 | エージェント |
|---------|------|-------------|
| `/video` | 動画制作ワークフロー全体（文字起こし〜出力） | video-producer |
| `/transcribe-workflow` | 音声→字幕の完全ワークフロー | - |
| `/setup-remotion` | プロジェクト初期セットアップ | - |

### 文字起こし・変換

| コマンド | 説明 | エージェント |
|---------|------|-------------|
| `/transcribe` | 音声→ワードタイムスタンプJSON（Whisper） | - |
| `/convert-srt` | SRT→subtitleData変換 | srt-converter |

### テロップ調整

| コマンド | 説明 | エージェント |
|---------|------|-------------|
| `/sync-subtitles` | 音声同期チェック | sync-adjuster |
| `/adjust-subtitles` | テロップ微調整 | subtitle-adjuster |
| `/edit-sentences` | 文単位の誤字修正 | sentence-editor |
| `/apply-subtitle-template` | テロップテンプレート適用 | - |

### 装飾

| コマンド | 説明 | エージェント |
|---------|------|-------------|
| `/add-title` | キャッチコピー生成 | title-generator |
| `/add-se` | 効果音配置 | se-placer |
| `/add-thumbnail` | サムネイル挿入 | thumbnail-inserter |

### 画像

| コマンド | 説明 | エージェント |
|---------|------|-------------|
| `/generate-illustration-prompts` | 画像プロンプト生成 | prompt-generator |
| `/generate-and-insert-images` | 画像生成→挿入 | image-inserter + gemini-image-generator |

---

## スクリプト一覧 (`scripts/`)

| スクリプト | 役割 |
|-----------|------|
| `transcribe.py` | Whisper API文字起こし（ワードタイムスタンプ） |
| `combine_sentences.py` | ワード→文単位に結合 |
| `format_subtitles.py` | 文→SRT形式に変換 |

---

## エージェント一覧 (`.claude/agents/`)

| エージェント | 役割 | 使用スキル |
|-------------|------|-----------|
| `video-producer` | ワークフロー全体管理（マスター） | - |
| `sentence-editor` | 文編集（誤字修正・固有名詞） | sentence-rules |
| `srt-converter` | SRT変換 | srt-rules |
| `sync-adjuster` | 音声同期チェック | sync-rules |
| `subtitle-adjuster` | テロップ調整 | subtitle-rules |
| `title-generator` | タイトル生成 | title-rules |
| `se-placer` | SE配置 | se-rules |
| `prompt-generator` | プロンプト生成 | prompt-rules |
| `image-inserter` | 画像挿入 | image-insert-rules |
| `thumbnail-inserter` | サムネイル挿入 | thumbnail-rules |

---

## スキル一覧 (`.claude/skills/`)

### ルール系（エージェントに知識を提供）

| スキル | 役割 |
|--------|------|
| `srt-rules` | SRT変換ルール |
| `sync-rules` | 音声同期ルール |
| `subtitle-rules` | テロップ調整ルール |
| `sentence-rules` | 文編集ルール |
| `title-rules` | タイトル生成ルール |
| `se-rules` | SE配置ルール |
| `prompt-rules` | プロンプト生成ルール |
| `image-insert-rules` | 画像挿入ルール |
| `thumbnail-rules` | サムネイル挿入ルール |

### ツール系（外部連携）

| スキル | 役割 |
|--------|------|
| `gemini-image-generator` | 画像生成（Gemini NanoBanana） |

---

## 使い方

### 基本的な流れ（推奨）

```bash
# 動画制作ワークフロー全体を実行（文字起こし〜出力まで自動）
/video
```

### 個別に実行する場合

```bash
# Phase 1: 文字起こし
/transcribe              # 音声→ワードタイムスタンプJSON
/edit-sentences          # 誤字修正・固有名詞変換

# Phase 2: テロップ
/convert-srt input.srt   # SRT→subtitleData
/sync-subtitles          # 音声同期チェック
/adjust-subtitles        # テロップ微調整

# Phase 3: 装飾
/add-title               # タイトル追加
/add-se                  # SE配置

# Phase 4: 画像
/generate-illustration-prompts  # プロンプト生成
/generate-and-insert-images     # 画像生成・挿入
/add-thumbnail           # サムネイル挿入
```

### 新規プロジェクト作成

```bash
/setup-remotion [プロジェクト名]
```

### 文字起こしのみ

```bash
/transcribe-workflow     # 音声→SRT完全ワークフロー
```
