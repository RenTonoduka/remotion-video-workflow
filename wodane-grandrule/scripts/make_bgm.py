"""ナレーションの邪魔をしない、やわらかいBGMループ（public/audio/bgm.wav）を合成する。

80BPM・4小節（12秒）でループ。エレピ風の和音＋ベル風のアルペジオ。
"""
import pathlib
import wave

import numpy as np

SR = 48000
BPM = 80
BEAT = 60 / BPM
BAR = BEAT * 4
OUT = pathlib.Path(__file__).resolve().parent.parent / 'public' / 'audio' / 'bgm.wav'


def hz(n: int) -> float:
    return 440 * 2 ** ((n - 69) / 12)


# Fmaj7 - Em7 - Dm7 - Cmaj7（MIDIノート）
CHORDS = [
    [53, 57, 60, 64],
    [52, 55, 59, 62],
    [50, 53, 57, 60],
    [48, 52, 55, 59],
]


def tone(freq: float, dur: float, decay: float, bright: float) -> np.ndarray:
    t = np.arange(int(SR * dur)) / SR
    env = np.minimum(t / 0.02, 1) * np.exp(-t / decay)
    w = np.sin(2 * np.pi * freq * t) + bright * np.sin(4 * np.pi * freq * t) * np.exp(-t / 0.3)
    return w * env


def main() -> None:
    total = int(SR * BAR * len(CHORDS))
    mix = np.zeros(total + SR * 4)
    for i, chord in enumerate(CHORDS):
        bar0 = int(SR * BAR * i)
        for beat in (0, 2.5):  # 1拍目と3拍目裏に和音
            s = bar0 + int(SR * BEAT * beat)
            for n in chord:
                x = tone(hz(n), BAR, 1.6, 0.25) * 0.09
                mix[s:s + len(x)] += x
        b = tone(hz(chord[0] - 12), BAR, 2.0, 0.1) * 0.16  # ベース
        mix[bar0:bar0 + len(b)] += b
        for k in range(8):  # 8分のアルペジオ（1オクターブ上）
            n = chord[[0, 2, 1, 3, 2, 1, 3, 2][k]] + 12
            s = bar0 + int(SR * BEAT / 2 * k)
            x = tone(hz(n), 1.2, 0.35, 0.4) * (0.05 if k % 2 else 0.065)
            mix[s:s + len(x)] += x
    # はみ出した余韻を先頭に折り返して、継ぎ目のないループにする
    mix[:len(mix) - total] += mix[total:]
    mix = mix[:total]
    # 簡易リバーブ
    for d, g in ((0.11, 0.3), (0.23, 0.2), (0.37, 0.12)):
        mix += np.roll(mix, int(SR * d)) * g
    mix = mix / np.max(np.abs(mix)) * 0.7
    stereo = np.stack([mix, np.roll(mix, int(SR * 0.012))], axis=1)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((stereo * 32767).astype(np.int16).tobytes())
    print(OUT, f'{total / SR:.1f}s')


if __name__ == '__main__':
    main()
