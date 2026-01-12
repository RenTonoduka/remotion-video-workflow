# Remotion テロップテンプレート適用コマンド

このプロジェクトのRemotionテロップシステムを新しい動画に適用してください。

## 適用するテンプレート構成

### 1. スタイルテンプレート (`src/Subtitles/subtitleConfig.ts`)
以下の3つのスタイルテンプレートをコピー：
- **Template 1**: グラデーション背景 (#CE4BFF → #4C82E5) - 強調・警告用
- **Template 2**: 紫グラデーションストローク - デフォルト（基本）
- **Template 3**: グラデーション文字 + 白ストローク - ポイント・成功用

### 2. アニメーションテンプレート
以下のアニメーションをコピー：
- `animation_none` - アニメーションなし
- `animation_slideIn` - 下からスライドイン
- `animation_fadeOnly` - フェードのみ
- `animation_slideFromLeft` - 左からスライドイン
- `animation_fadeBlurFromBottom` - 不透明度+ブラー_下から
- `animation_slideLeftFadeBlur` - 左スライド+フェード+ブラー（デフォルト）

### 3. コピーするファイル
1. `src/Subtitles/subtitleConfig.ts` - スタイル＆アニメーション設定
2. `src/Subtitles/Subtitle.tsx` - 描画コンポーネント
3. `src/Subtitles/index.ts` - エクスポート
4. `src/SoundEffects/seData.ts` - SE配置テンプレート（内容は新規作成）
5. `src/SoundEffects/index.ts` - エクスポート

### 4. 新しいプロジェクトでの設定手順
1. 上記ファイルをコピー
2. `subtitleData.ts`を新規作成（SRTから変換）
3. `VideoWithSubtitles.tsx`にインポートを追加
4. SEファイルを`public/se/`に配置
5. `seData.ts`の内容を動画に合わせて調整

### 5. テロップデータ形式
```typescript
export interface SubtitleSegment {
  id: number;
  startFrame: number;
  endFrame: number;
  text: string;
  highlight?: string;
  style?: 'normal' | 'emphasis' | 'warning' | 'success';
  template?: 1 | 2 | 3;
  animation?: 'none' | 'slideIn' | 'fadeOnly' | 'slideFromLeft' | 'fadeBlurFromBottom' | 'slideLeftFadeBlur';
}
```

## 実行
新しいRemotionプロジェクトにこのテンプレートを適用してください。
