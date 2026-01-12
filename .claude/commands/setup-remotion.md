# Remotion動画プロジェクト初期セットアップ

新しいRemotion動画プロジェクトをセットアップしてください。

## プロジェクト名
$ARGUMENTS

---

## Step 1: Remotionプロジェクト作成

```bash
npx create-video@latest $ARGUMENTS
cd $ARGUMENTS
```

---

## Step 2: ディレクトリ構成作成

```bash
mkdir -p src/Subtitles src/SoundEffects src/Title src/InsertImage
mkdir -p public/se public/BGM public/挿入画像
mkdir -p prompts generated_images out
```

**完成構成:**
```
src/
├── Subtitles/
│   ├── index.ts
│   ├── Subtitle.tsx
│   ├── subtitleConfig.ts
│   └── subtitleData.ts
├── SoundEffects/
│   ├── index.ts
│   ├── SEPlayer.tsx
│   └── seData.ts
├── Title/
│   ├── index.ts
│   ├── Title.tsx
│   └── titleData.ts
├── InsertImage/
│   ├── index.ts
│   ├── InsertImage.tsx
│   └── insertImageData.ts
├── BGM.tsx
├── MainVideo.tsx
└── Root.tsx

public/
├── main-video.mp4
├── se/
├── BGM/
└── 挿入画像/
```

---

## Step 3: 定数設定

`src/Subtitles/index.ts` に以下を設定:
```typescript
export const FPS = 30;
export const TOTAL_FRAMES = [動画の総フレーム数];  // 例: 8分 = 14400
```

---

## Step 4: BGM.tsx 作成

```typescript
import React from 'react';
import { Audio, staticFile, Loop } from 'remotion';

interface BGMProps {
  volume?: number;
}

// BGMファイルの長さをフレーム数で指定（秒数 × 30）
const BGM_DURATION_FRAMES = 3660;  // 122秒の場合

export const BGM: React.FC<BGMProps> = ({ volume = 0.15 }) => {
  return (
    <Loop durationInFrames={BGM_DURATION_FRAMES}>
      <Audio
        src={staticFile('BGM/[BGMファイル名].mp3')}
        volume={volume}
      />
    </Loop>
  );
};
```

**重要:** Loopの`durationInFrames`はBGMファイルの長さ（秒×30）を指定すること。動画の長さではない。

---

## Step 5: InsertImage.tsx 作成

```typescript
import React from 'react';
import { useCurrentFrame, interpolate, Img, staticFile } from 'remotion';

export interface ImageSegment {
  id: number;
  startFrame: number;
  endFrame: number;
  file: string;
  type?: 'photo' | 'infographic';  // photo=ズームあり, infographic=ズームなし
}

interface InsertImageProps {
  segment: ImageSegment;
}

export const InsertImage: React.FC<InsertImageProps> = ({ segment }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - segment.startFrame;
  const duration = segment.endFrame - segment.startFrame;

  // フェードイン・アウト（短めに設定して隙間を防ぐ）
  const fadeIn = Math.min(3, duration / 4);
  const fadeOut = Math.min(3, duration / 4);

  const opacity = interpolate(
    localFrame,
    [0, fadeIn, duration - fadeOut, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  if (opacity < 0.01) return null;

  // 図解はズームなし、フォトはゆっくりズームイン
  const isInfographic = segment.type === 'infographic';
  const scale = isInfographic ? 1 : interpolate(
    localFrame, [0, duration], [1, 1.08],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0,
      width: '100%', height: '100%', opacity,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      overflow: 'hidden',
    }}>
      <Img
        src={staticFile(`挿入画像/${segment.file}`)}
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
    </div>
  );
};
```

---

## Step 6: MainVideo.tsx 作成

```typescript
import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from 'remotion';
import { SubtitleSequence } from './Subtitles';
import { Title, titleData } from './Title';
import { SEPlayer } from './SoundEffects';
import { InsertImage, insertImageData } from './InsertImage';
import { BGM } from './BGM';

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();

  const currentTitle = titleData.find(
    (s) => frame >= s.startFrame && frame < s.endFrame
  );

  const currentImages = insertImageData.filter(
    (s) => frame >= s.startFrame && frame < s.endFrame
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <OffthreadVideo
        src={staticFile('main-video.mp4')}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
      <SEPlayer />
      <BGM volume={0.15} />
      {currentImages.map((img) => (
        <InsertImage key={img.id} segment={img} />
      ))}
      {currentTitle && <Title key={currentTitle.id} segment={currentTitle} />}
      <SubtitleSequence />
    </AbsoluteFill>
  );
};
```

---

## Step 7: Root.tsx 設定

```typescript
import { Composition } from 'remotion';
import { MainVideo } from './MainVideo';
import { FPS, TOTAL_FRAMES } from './Subtitles';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MainVideo"
      component={MainVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
```

---

## Step 8: 必要ファイルをコピー

既存プロジェクトから以下をコピー:

### コピー必須（テンプレート・コンポーネント）

```bash
# Subtitles/ - テロップシステム
src/Subtitles/subtitleConfig.ts   # スタイル設定
src/Subtitles/Subtitle.tsx        # 描画コンポーネント
src/Subtitles/SubtitleSequence.tsx # シーケンス管理
src/Subtitles/types.ts            # 型定義
src/Subtitles/index.tsx           # エクスポート

# SoundEffects/ - 効果音
src/SoundEffects/SEPlayer.tsx     # 再生コンポーネント
src/SoundEffects/index.ts         # エクスポート

# Title/ - 左上タイトル
src/Title/Title.tsx               # タイトルコンポーネント
src/Title/index.ts                # エクスポート

# InsertImage/ - 挿入画像
src/InsertImage/InsertImage.tsx   # 画像コンポーネント
src/InsertImage/index.ts          # エクスポート

# コマンド
.claude/commands/                 # 全コマンドファイル
```

### コピー後に編集が必要

```bash
src/BGM.tsx           # BGMファイル名、BGM_DURATION_FRAMESを変更
src/MainVideo.tsx     # 動画ファイル名を変更
src/Root.tsx          # TOTAL_FRAMESを変更
```

### コマンドで自動生成されるファイル（コピー不要）

```bash
src/Subtitles/subtitleData.ts     # /convert-srt で生成
src/SoundEffects/seData.ts        # /add-se で生成
src/Title/titleData.ts            # /add-title で生成
src/InsertImage/insertImageData.ts # /generate-and-insert-images で生成
```

### 一括コピーコマンド

```bash
# 既存プロジェクトのパスを設定
TEMPLATE_DIR="/path/to/existing-project"

# テンプレートファイルをコピー
cp $TEMPLATE_DIR/src/Subtitles/subtitleConfig.ts src/Subtitles/
cp $TEMPLATE_DIR/src/Subtitles/Subtitle.tsx src/Subtitles/
cp $TEMPLATE_DIR/src/Subtitles/SubtitleSequence.tsx src/Subtitles/
cp $TEMPLATE_DIR/src/Subtitles/types.ts src/Subtitles/
cp $TEMPLATE_DIR/src/Subtitles/index.tsx src/Subtitles/

cp $TEMPLATE_DIR/src/SoundEffects/SEPlayer.tsx src/SoundEffects/
cp $TEMPLATE_DIR/src/SoundEffects/index.ts src/SoundEffects/

cp $TEMPLATE_DIR/src/Title/Title.tsx src/Title/
cp $TEMPLATE_DIR/src/Title/index.ts src/Title/

cp $TEMPLATE_DIR/src/InsertImage/InsertImage.tsx src/InsertImage/
cp $TEMPLATE_DIR/src/InsertImage/index.ts src/InsertImage/

cp $TEMPLATE_DIR/src/BGM.tsx src/
cp $TEMPLATE_DIR/src/MainVideo.tsx src/

cp -r $TEMPLATE_DIR/.claude/commands .claude/
```

---

## セットアップ後の作業フロー

1. 動画ファイルを `public/main-video.mp4` に配置
2. BGMファイルを `public/BGM/` に配置
3. SEファイルを `public/se/` に配置
4. `/convert-srt [SRTパス]` で字幕データ作成
5. `/add-title` でタイトル追加
6. `/add-se` でSE配置
7. `/generate-illustration-prompts` で画像プロンプト生成
8. `/generate-and-insert-images` で画像生成・挿入
9. `npm run dev` で確認
10. 書き出し: `npx remotion render src/index.ts MainVideo out/final.mp4`

---

## よくある問題と解決

### BGMが途切れる
→ Loopの`durationInFrames`をBGMファイルの長さ（秒×30）に設定

### 画像切り替え時に隙間ができる
→ フェード時間を短く（3フレーム）、画像を4フレーム重ねる

### 図解画像がズームしてしまう
→ `type: 'infographic'` を設定

---

## 実行
上記手順でRemotionプロジェクトをセットアップしてください。
