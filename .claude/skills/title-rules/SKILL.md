---
name: title-rules
description: タイトル生成のルールと基準。キャッチコピー抽出、表示タイミングの知識を提供。
---

# タイトル生成ルール

動画の左上に表示するキャッチコピーを生成するためのルールです。

## ⚠️ 重要: FPS設定

**FPSは必ず `.claude/settings.json` から取得すること。**

```json
{
  "project": {
    "fps": 25
  }
}
```

## 抽出ルール

### 優先するセグメント
- style: emphasis のセグメント
- style: warning のセグメント
- インパクトのあるフレーズ

### キャッチコピーの条件
- **長さ**: 10文字程度（短くインパクト重視）
- **形式**: 「〇〇するな」「〇〇しろ」「〇〇の秘密」
- **頻度**: 5-10個程度（くどくならないように）

### よいキャッチコピーの例
- 「プロンプト集は買うな」
- 「本質を理解しろ」
- 「完全無料で使える」
- 「衝撃の結果」

## 表示時間
- 3-8秒程度
- 対応する字幕の表示時間に合わせる

## 出力形式

```typescript
import type { TitleSegment } from './Title';

// FPS: 25 (settings.json)
export const titleData: TitleSegment[] = [
  { id: 1, startFrame: 0, endFrame: 180, text: 'プロンプト集は買うな' },
  { id: 2, startFrame: 300, endFrame: 450, text: '本質を理解しろ' },
];
```

## 出力先
`src/Title/titleData.ts`

## 配置ルール

- タイトルの z-index は 100
- サムネイル（50-52）より前面
- 字幕（200）より背面
