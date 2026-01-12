---
name: subtitle-rules
description: テロップ調整のルールと診断基準。字幕の品質チェック、改行ルール、タイミング調整の知識を提供。
---

# テロップ調整ルール

テロップの品質を診断・修正するためのルールと基準です。

## ⚠️ 重要: FPS設定

**FPSは必ず `.claude/settings.json` から取得すること。**

```json
{
  "project": {
    "fps": 25
  }
}
```

## 対象ファイル
`src/Subtitles/subtitleData.ts`

---

## 🔍 自動診断項目

### A. フレーム矛盾検出
startFrame > endFrame のセグメントを検出。

```typescript
// NG
{ startFrame: 3987, endFrame: 3976 }

// OK
{ startFrame: 3976, endFrame: 3987 }
```

### B. 順序矛盾検出
前のセグメントより前に始まるセグメントを検出。

### C. highlight不一致検出
textに存在しない単語がhighlightに指定されていないか。

```typescript
// NG: textとhighlightが不一致
text: "クロードコードのビデオコマンド",
highlight: "Claude Code"

// OK: 固有名詞を正しい表記に修正し、highlightも一致させる
text: "Claude Codeのビデオコマンド",
highlight: "Claude Code"
```

### D. 不適切な改行位置検出

**NGパターン（1行目の末尾）:**
- 「、」「。」で終わる
- 助詞（は、が、を、に、で、と、も、の）で終わる
- 接続詞（実は、つまり、しかも、だから、でも、そして）で終わる
- 単語の途中で切れている
- 全角スペース（　）を含む

**修正の原則:**
1. 全角スペースは削除または改行に置換
2. 意味のまとまりを優先

### E. 3行以上のテロップ検出
テロップは最大2行まで。3行以上はNG。

### F. 音声認識誤変換検出

#### 固有名詞の正しい表記（必ず修正）
```
"クロードコード" → "Claude Code"
"クロード" → "Claude"
"リモーション" → "Remotion"
"エーアイ" → "AI"
```

---

## 改行ルール

### 基本ルール
- **1行は最大20文字程度**
- **最大2行まで**（3行はNG）
- 意味の切れ目で改行
- 読みやすさを優先

### 良い改行位置
- 句読点の直後
- 接続詞の前（「しかし」「でも」「そして」）
- 文節の切れ目

### 悪い改行位置
- 「、」「。」で終わる
- 助詞で終わる
- 動詞の途中
- 意味の途中

---

## スタイル一覧

| style | 用途 | 例 |
|-------|------|-----|
| normal | 通常テロップ | 説明、ナレーション |
| emphasis | 強調 | 重要なポイント |
| warning | 警告 | 注意喚起、ネガティブ |
| success | 成功 | ポジティブ、達成 |

---

## ⚠️ 絶対に行ってはいけない修正

### タイミング（フレーム）の変更禁止

以下の操作は**絶対に行わないでください**：

- ❌ startFrame / endFrame を変更する
- ❌ タイミングを調整する

**タイミングの修正は `/sync-subtitles` コマンドで行う。**

### 修正可能な項目

- ✅ 音声認識誤変換の修正（テキスト内容の修正）
- ✅ 固有名詞の正しい表記への修正
- ✅ 不適切な改行位置の調整
- ✅ highlight不一致の修正
- ✅ 3行以上のテロップを2行に分割

---

## 計算式

```typescript
// settings.json から fps を取得
const fps = 25;

const toSeconds = (frame: number) => frame / fps;
const toFrame = (seconds: number) => Math.floor(seconds * fps);
```
