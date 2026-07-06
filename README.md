# Remotion Video Workflow

Claude Code用のRemotion動画制作ワークフロー設定です。

## セットアップ

1. このリポジトリをRemotion動画プロジェクトにコピー:

```bash
# .claudeフォルダとscriptsフォルダをコピー
cp -r remotion-video-workflow/.claude your-project/
cp -r remotion-video-workflow/scripts your-project/
```

2. Python依存関係をインストール:

```bash
pip install openai
```

3. 環境変数を設定:

```bash
export OPENAI_API_KEY="your-api-key"
```

## 使い方

```bash
# 動画制作ワークフロー全体を実行
/video

# または個別に実行
/transcribe              # 音声→文字起こし
/convert-srt             # SRT→subtitleData
/add-title               # タイトル追加
/add-se                  # SE配置
```

## ワークフロー

```
Phase 0: 環境準備
  └─→ main-video.mp4, BGM/, se/ を確認

Phase 1: 文字起こし
  └─→ Whisper API → sentences.json → subtitles.srt

Phase 2: テロップ生成
  └─→ srt-converter → sync-adjuster → subtitle-adjuster

Phase 3: 装飾
  └─→ title-generator → se-placer → BGM設定

Phase 4: 画像
  └─→ prompt-generator → gemini-image-generator → image-inserter

Phase 5: サムネイル（オプション）
  └─→ thumbnail-inserter

Phase 6: 出力
  └─→ npm run dev → npx remotion render
```

## フォルダ構成

```
.claude/
├── agents/          # サブエージェント（10個）
├── commands/        # コマンド定義（14個）
├── skills/          # スキル（知識ベース）
└── settings.json    # プロジェクト設定

scripts/
├── transcribe.py           # Whisper文字起こし
├── combine_sentences.py    # ワード→文結合
└── format_subtitles.py     # SRT生成
```

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `/video` | 動画制作ワークフロー全体 |
| `/transcribe` | Whisper文字起こし |
| `/transcribe-workflow` | 音声→SRT完全ワークフロー |
| `/convert-srt` | SRT→subtitleData変換 |
| `/sync-subtitles` | 音声同期チェック |
| `/adjust-subtitles` | テロップ微調整 |
| `/edit-sentences` | 文編集 |
| `/add-title` | タイトル生成 |
| `/add-se` | SE配置 |
| `/add-thumbnail` | サムネイル挿入 |
| `/generate-illustration-prompts` | 画像プロンプト生成 |
| `/generate-and-insert-images` | 画像挿入 |
| `/setup-remotion` | プロジェクト初期セットアップ |

## エージェント一覧

| エージェント | 役割 |
|-------------|------|
| `video-producer` | ワークフロー全体管理 |
| `sentence-editor` | 文編集 |
| `srt-converter` | SRT変換 |
| `sync-adjuster` | 音声同期チェック |
| `subtitle-adjuster` | テロップ調整 |
| `title-generator` | タイトル生成 |
| `se-placer` | SE配置 |
| `prompt-generator` | プロンプト生成 |
| `image-inserter` | 画像挿入 |
| `thumbnail-inserter` | サムネイル挿入 |

## Fable品質モード（Opus 4.8 対応）

Opus 4.8 など Fable 以外のモデルでも、Fable 相当の品質（抜け漏れ検出・自己検証・
人間的な報告）で作業させるためのスキル群です。トークン消費を抑えるため、
常時読み込まれるのはルーティング用の CLAUDE.md（約20行）だけで、
詳細ルールは必要な時にだけスキルとして読み込まれます。

| スキル | 内容 | 読み込まれるタイミング |
|--------|------|----------------------|
| `fable-core` | 思考原則（結論ファースト、自己検証、影響範囲の列挙、スコープの節度） | コード変更の前 |
| `fable-check` | 抜け漏れ検査チェックリスト（リネーム漏れ、呼び出し元破壊、データ契約、ドキュメント矛盾） | コード変更の完了前 |
| `fable-refactor` | 挙動を変えないリファクタリング手順 | リファクタ依頼時 |

Fable と Opus 4.8 の差分分析は `.claude/skills/fable-core/references/fable-vs-opus.md` を参照。

### どのフォルダから開いても有効にする

このリポジトリ内では自動で有効です。**他のプロジェクトや任意のフォルダでも**
有効にするには、一度だけ以下を実行してください（`~/.claude/` に展開されます）:

```bash
bash scripts/install-fable-skills.sh
```

再実行すると最新版に更新されます（冪等）。

## 設定

`.claude/settings.json` でFPSやパスを設定:

```json
{
  "project": {
    "fps": 25,
    "resolution": "1920x1080",
    "paths": {
      "subtitleData": "src/Subtitles/subtitleData.ts",
      "insertImageData": "src/InsertImage/insertImageData.ts",
      "seData": "src/SoundEffects/seData.ts",
      "titleData": "src/Title/titleData.ts"
    }
  }
}
```

## License

MIT
