// BGM: 120BPM → 1拍 = 15フレーム, 1小節 = 60フレーム（scripts/make_audio.py と同期）
export const FPS = 30;
export const BEAT = 15;
export const TOTAL_FRAMES = 45 * FPS;

export const DROP = 4 * FPS; // イントロ→本編のドロップ
export const OUTRO = 36 * FPS; // アウトロ開始
export const HIT = 42 * FPS; // 決めのヒット

export type Chapter = 'WORK' | 'REST' | 'MEETING' | 'RESTROOM';

export const CHAPTERS: { id: Chapter; label: string }[] = [
  { id: 'WORK', label: '作業' },
  { id: 'REST', label: '休憩' },
  { id: 'MEETING', label: '面談' },
  { id: 'RESTROOM', label: 'トイレ' },
];

export type Scene = {
  src: string;
  start: number; // 秒（動画上の開始）
  dur: number; // 秒
  clipFrom?: number; // 素材の何秒目から使うか
  clipLen: number; // 素材の長さ（秒）
  chapter: Chapter;
  lines: [string, string];
  highlight: 0 | 1; // 黄色で強調する行
};

// カットはすべて拍（0.5秒）単位
export const SCENES: Scene[] = [
  { src: 'c07', start: 4, dur: 4, clipLen: 3.96, chapter: 'WORK', lines: ['明るく開放的な', '作業スペース'], highlight: 1 },
  { src: 'c05', start: 8, dur: 3.5, clipLen: 3.56, chapter: 'WORK', lines: ['大型モニターで', 'PC作業も快適'], highlight: 1 },
  { src: 'c08', start: 11.5, dur: 3.5, clipLen: 3.67, chapter: 'WORK', lines: ['窓際には', '昇降デスクも'], highlight: 1 },
  { src: 'c04', start: 15, dur: 3, clipLen: 3.32, chapter: 'REST', lines: ['ほっと一息つける', '休憩スペース'], highlight: 1 },
  { src: 'c06', start: 18, dur: 3, clipLen: 3.7, chapter: 'REST', lines: ['グリーンに', '癒やされる空間'], highlight: 1 },
  { src: 'c02', start: 21, dur: 3, clipFrom: 1.5, clipLen: 4.7, chapter: 'MEETING', lines: ['個別の面談室も', '完備'], highlight: 1 },
  { src: 'c03', start: 24, dur: 3, clipLen: 2.57, chapter: 'MEETING', lines: ['相談中も', 'プライバシー安心'], highlight: 1 },
  { src: 'c09', start: 27, dur: 2.5, clipLen: 2.57, chapter: 'RESTROOM', lines: ['清潔な', '洗面スペース'], highlight: 1 },
  { src: 'c10', start: 29.5, dur: 3.5, clipLen: 3.72, chapter: 'RESTROOM', lines: ['トイレは', '男女別'], highlight: 1 },
  { src: 'c11', start: 33, dur: 3, clipLen: 3.07, chapter: 'RESTROOM', lines: ['いつでも', '清潔・快適'], highlight: 1 },
];

export const COLORS = {
  ink: '#1d2a44',
  accent: '#ffd43b',
  green: '#35b779',
  white: '#ffffff',
};
