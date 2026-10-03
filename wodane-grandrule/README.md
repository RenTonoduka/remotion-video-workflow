# Wodaneの通い方（Wodane's Grand Rule）

利用契約後、**通所初日に見ていただく**説明動画。約5分・1920x1080・30fps。
ナレーションは VOICEVOX:四国めたん（ノーマル）、配色は Wodane スライド（ピーチ→ミント背景・白カード・青見出し・オレンジのタグ）に合わせています。
店内写真は `wodane-roomtour` の撮影素材（c01〜c11）から切り出しています。

```bash
npm install
# 1. 音声（VOICEVOX ENGINE を起動しておく）
docker run -d --rm -p 50021:50021 voicevox/voicevox_engine:cpu-latest
python3 scripts/make_voice.py   # public/voice/*.wav と src/timing.json を生成
python3 scripts/make_bgm.py     # public/audio/bgm.wav（80BPMのやさしいループ）
# 2. プレビュー / 書き出し
npx remotion studio src/index.ts
npx remotion render src/index.ts WodaneGrandRule out/wodane_grandrule.mp4 --crf=20
```

## 直し方

- **セリフ・見出し・箇条書き・写真**: `src/script.json`
  - `lines` を変えたら `make_voice.py` を再実行（尺も自動で合わせ直されます）
  - 読み間違いは `scripts/make_voice.py` の `READINGS` に「表記 → 読み」を追加
  - `photo` は `public/photos/c01〜c11.jpg`、写真がないシーンは `visual` の図解（shoes / member / pin / tap / popup / calendar / check / ribbon）
- **デザイン**: `src/GrandRule.tsx`

## 写真の対応

| 写真 | 内容 | 使っているシーン |
|---|---|---|
| c01 | 窓からの街並み（雨） | 雨の日 |
| c02 / c03 | 面談室の表示 | いつでも相談 / リボンのない方 |
| c04 | 休憩スペース | お昼休み |
| c05 | PCデスク | PC受け取り・返却・イヤホン |
| c06 | 観葉植物 | 飲み物とごみ |
| c07 | 作業スペース全景 | タイトル・挨拶・締め |
| c08 | 窓際の昇降デスク | 案件選び・席と光 |
| c09 | 洗面台 | 消毒・手洗い |
| c10 / c11 | トイレ | お手洗い |

入口（靴・消毒液）、PC画面、リボンの実写はまだないため図解にしています。撮影したら `public/photos/` に置いて `photo` を差し替えてください。
