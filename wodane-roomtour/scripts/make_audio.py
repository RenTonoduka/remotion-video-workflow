"""Wodane ルームツアー用 BGM / SE を合成する（完全オリジナル・著作権フリー）。

120BPM（1拍=0.5秒=15フレーム, 1小節=2秒=60フレーム）
- 0-4s   : イントロ（パッド+アルペジオ、ライザー）
- 4s     : ドロップ（クラッシュ+フルビート）
- 22-24s : フィル → 24s からBセクション
- 34-36s : ライザー → 36s アウトロ
- 42s    : 決めのヒット → 余韻で終了
"""
import os
import numpy as np
from scipy.signal import butter, sosfilt
import wave

SR = 44100
BPM = 120
BEAT = 60 / BPM
BAR = BEAT * 4
TOTAL = 45.0
N = int(SR * TOTAL)
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def env_adsr(n, a=0.005, d=0.1, s=0.6, r=0.1):
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    s_n = max(0, n - a_n - d_n - r_n)
    e = np.concatenate([
        np.linspace(0, 1, a_n, endpoint=False),
        np.linspace(1, s, d_n, endpoint=False),
        np.full(s_n, s),
        np.linspace(s, 0, r_n),
    ])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))


def saw(freq, n, detune=0.0):
    t = np.arange(n) / SR
    f = freq * (1 + detune)
    return 2 * ((t * f) % 1.0) - 1


def add(buf, sig, t0):
    i = int(t0 * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


# ---------- 構成 ----------
# 王道進行 IV-V-iii-vi（C major）
CHORDS = {
    "Fmaj7": [53, 57, 60, 64],
    "G6": [55, 59, 62, 64],
    "Em7": [52, 55, 59, 62],
    "Am7": [57, 60, 64, 67],
    "Fm6": [53, 56, 60, 62],
    "Cmaj9": [48, 55, 59, 62, 64],
}
ROOT = {"Fmaj7": 41, "G6": 43, "Em7": 40, "Am7": 45, "Fm6": 41, "Cmaj9": 36}
prog = ["Fmaj7", "G6", "Em7", "Am7"]
bars = [prog[i % 4] for i in range(18)] + ["Fmaj7", "G6", "Fm6"]  # 0..20 → 42s
N_BARS = len(bars)  # 21 bars = 42s
DROP1, BSEC, OUTRO, HIT = 4.0, 24.0, 36.0, 42.0

drums = np.zeros(N)
bass = np.zeros(N)
pad = np.zeros(N)
pluck = np.zeros(N)
fx = np.zeros(N)
side = np.ones(N)  # サイドチェイン用ゲイン

# ---------- 音色 ----------
def kick():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 45 + 75 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    click = rng.standard_normal(n) * np.exp(-t * 400) * 0.3
    return (np.sin(ph) * np.exp(-t * 7) + click) * 0.95


def clap():
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    noise = bp(rng.standard_normal(n), 900, 4000)
    e = np.exp(-t * 22)
    for k in (0.0, 0.012, 0.024):
        e += np.exp(-np.clip(t - k, 0, None) * 120) * (t >= k) * 0.6
    return noise * e * 0.5


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7000) * np.exp(-t * (18 if open_ else 90)) * (0.22 if open_ else 0.16)


def crash():
    n = int(2.5 * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 4000) * np.exp(-t * 1.6) * 0.3


def pluck_note(freq, dur=0.22):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = 0.6 * np.sign(np.sin(2 * np.pi * freq * t)) * 0.5 + 0.8 * np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(4 * np.pi * freq * t)
    return lp(s, 3500) * np.exp(-t * 14) * 0.18


K, C, H, HO, CR = kick(), clap(), hat(), hat(True), crash()

# ---------- ドラム ----------
for b in range(N_BARS):
    t0 = b * BAR
    intro = t0 < DROP1
    for beat in range(4):
        tb = t0 + beat * BEAT
        if not intro:
            add(drums, K, tb)
            # サイドチェイン
            i = int(tb * SR)
            n = int(0.3 * SR)
            curve = 1 - 0.75 * np.exp(-np.arange(n) / SR * 12)
            j = min(N, i + n)
            side[i:j] = np.minimum(side[i:j], curve[: j - i])
            if beat in (1, 3):
                add(drums, C, tb)
            add(drums, HO, tb + BEAT / 2)
            for s16 in (1, 3):
                add(drums, H, tb + s16 * BEAT / 4)
        else:
            add(drums, H * 0.6, tb + BEAT / 2)
# フィル（ドロップ前 / Bセクション前 / アウトロ前）のスネアロール
for t_end in (DROP1, BSEC, OUTRO):
    steps = 8
    for k in range(steps):
        tt = t_end - BEAT * 2 + k * (BEAT * 2 / steps)
        add(drums, C * (0.35 + 0.65 * k / steps), tt)
for t in (DROP1, BSEC, OUTRO, HIT):
    add(drums, CR, t)
# ラストヒット
add(drums, K * 1.2, HIT)
add(drums, C * 1.2, HIT)

# ---------- ベース（オフビート8分 + ルート） ----------
for b, ch in enumerate(bars):
    t0 = b * BAR
    if t0 < DROP1:
        continue
    f = midi(ROOT[ch])
    for e in range(8):
        tt = t0 + e * BEAT / 2
        dur = BEAT / 2 * 0.9
        n = int(dur * SR)
        s = saw(f, n) + 0.5 * np.sin(2 * np.pi * f * np.arange(n) / SR)
        s = lp(s, 380) * env_adsr(n, 0.004, 0.08, 0.7, 0.03) * (0.34 if e % 2 else 0.24)
        add(bass, s, tt)
f = midi(ROOT["Cmaj9"])
n = int(2.8 * SR)
add(bass, lp(saw(f, n), 300) * env_adsr(n, 0.004, 0.4, 0.5, 2.0) * 0.4, HIT)

# ---------- パッド ----------
for b, ch in enumerate(bars):
    n = int(BAR * SR)
    s = np.zeros(n)
    for note in CHORDS[ch]:
        for dt in (-0.004, 0.004):
            s += saw(midi(note + 12), n, dt)
    cutoff = 1200 if b * BAR < DROP1 else 2600
    s = lp(s, cutoff) * env_adsr(n, 0.05, 0.3, 0.8, 0.12) * 0.035
    add(pad, s, b * BAR)
n = int(3.0 * SR)
s = np.zeros(n)
for note in CHORDS["Cmaj9"]:
    for dt in (-0.004, 0.004):
        s += saw(midi(note + 12), n, dt)
add(pad, lp(s, 2600) * env_adsr(n, 0.01, 0.5, 0.6, 2.4) * 0.05, HIT)

# ---------- プラック・アルペジオ（16分） ----------
patternA = [0, 1, 2, 3, 2, 1, 3, 2]
patternB = [0, 2, 3, 4, 3, 2, 4, 3]  # Bセクションは+1オクターブ寄り
for b, ch in enumerate(bars):
    t0 = b * BAR
    notes = CHORDS[ch] + [CHORDS[ch][0] + 12]
    pat = patternB if t0 >= BSEC else patternA
    for k in range(16):
        tt = t0 + k * BEAT / 4
        note = notes[pat[k % 8] % len(notes)] + 12
        vel = 1.0 if k % 4 == 0 else 0.7
        add(pluck, pluck_note(midi(note)) * vel, tt)
# ディレイ
d = int(BEAT * 0.75 * SR)
delayed = np.zeros(N)
delayed[d:] = pluck[:-d] * 0.35
delayed[2 * d:] += pluck[: -2 * d] * 0.15
pluck = pluck + lp(delayed, 2500)
# ヒットのキラキラ
for k, note in enumerate([72, 76, 79, 83, 86]):
    add(pluck, pluck_note(midi(note), 1.2) * 1.2, HIT + k * 0.06)

# ---------- FX: ライザー ----------
def riser(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    seg = 2048
    for i in range(0, n, seg):
        p = i / n
        lo = 300 + 5000 * p ** 2
        out[i:i + seg] = bp(noise[i:i + seg], lo, min(lo * 2.2, SR / 2 - 100), 1)
    return out * (t / dur) ** 2 * 0.25


for t_end, dur in ((DROP1, 3.5), (OUTRO, 2.0)):
    add(fx, riser(dur), t_end - dur)

# ---------- ミックス ----------
music = (bass + pad + pluck) * side + drums + fx
# イントロはハイカットでこもらせ、ドロップで開く
i4 = int(DROP1 * SR)
music[:i4] = lp(music[:i4], 1800) * 1.1
# 最後はフェード
fade_start = int((TOTAL - 1.5) * SR)
music[fade_start:] *= np.linspace(1, 0, N - fade_start)
music = np.tanh(music * 1.4) / np.tanh(1.4)
music /= np.max(np.abs(music)) + 1e-9
music *= 0.89

# 少しだけステレオ感（ディレイ用のハース効果をプラックに）
hs = int(0.012 * SR)
left = music.copy()
right = music.copy()
right[hs:] = 0.85 * music[hs:] + 0.15 * music[:-hs]


def write(path, l, r=None):
    r = l if r is None else r
    st = np.stack([l, r], axis=1)
    data = (np.clip(st, -1, 1) * 32767).astype("<i2").tobytes()
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data)


write(os.path.join(OUT, "bgm.wav"), left, right)

# ---------- SE ----------
# whoosh（カット用）
n = int(0.45 * SR)
t = np.arange(n) / SR
noise = rng.standard_normal(n)
w = np.zeros(n)
seg = 1024
for i in range(0, n, seg):
    p = i / n
    c = 600 + 4500 * np.sin(np.pi * p)
    w[i:i + seg] = bp(noise[i:i + seg], c * 0.6, min(c * 1.6, SR / 2 - 100), 1)
w *= np.sin(np.pi * t / t[-1]) ** 2
write(os.path.join(OUT, "whoosh.wav"), w / np.max(np.abs(w)) * 0.6)

# pop（テロップ用）
n = int(0.12 * SR)
t = np.arange(n) / SR
f = 500 + 900 * (1 - np.exp(-t * 60))
p = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 35)
write(os.path.join(OUT, "pop.wav"), p * 0.6)

# chime（ロゴ用）
n = int(1.5 * SR)
t = np.arange(n) / SR
ch = sum(np.sin(2 * np.pi * midi(m) * t) * np.exp(-t * (3 + k)) for k, m in enumerate([84, 88, 91]))
write(os.path.join(OUT, "chime.wav"), ch / np.max(np.abs(ch)) * 0.5)
print("ok")
