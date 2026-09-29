# Wodane ルームツアー Shorts（就労継続支援B型）

45秒・1080x1920・30fps。BGMはオリジナル合成（120BPM）で、カット／テロップ／ズームパンチはすべて拍（15フレーム）単位で同期。

```bash
npm install
python3 scripts/make_audio.py        # BGM・SE を public/audio に生成
npx remotion studio src/index.ts     # プレビュー
npx remotion render src/index.ts WodaneRoomTour out/wodane_roomtour.mp4 --crf=18
```

- テロップ・カット位置: `src/data.ts`
- 演出: `src/RoomTour.tsx`
- 素材: `public/clips/c01〜c11.mp4`（Pixel HLG-HDR → SDR トーンマップ済み）
