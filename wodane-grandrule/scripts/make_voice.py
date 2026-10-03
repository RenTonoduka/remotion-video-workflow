"""script.json の各セリフを VOICEVOX（四国めたん）で音声化し、src/timing.json を生成する。

前提: VOICEVOX ENGINE が localhost:50021 で起動していること。
  docker run -d --rm -p 50021:50021 voicevox/voicevox_engine:cpu-latest
"""
import json
import pathlib
import urllib.parse
import urllib.request
import wave

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCRIPT = ROOT / 'src' / 'script.json'
OUT = ROOT / 'public' / 'voice'
TIMING = ROOT / 'src' / 'timing.json'
HOST = 'http://localhost:50021'
FPS = 30

SPEED = 1.05
LINE_GAP = 0.35  # セリフ間の間（秒）
SCENE_HEAD = 0.5  # シーン頭の間
SCENE_TAIL = 0.7  # シーン終わりの余韻

# 字幕表記 → 読み上げ用の表記
READINGS = [
    ('Wodane', 'ウォダネ'),
    ('PC', 'ピーシー'),
    ('1日の始まり', 'いちにちの始まり'),
    ('4桁', 'よんけた'),
    ('週4日', 'しゅうよっか'),
    ('週5日', 'しゅういつか'),
    ('3.5ミリ', 'さんてんごミリ'),
    ('12時から13時', 'じゅうにじから、じゅうさんじ'),
]


def to_reading(text: str) -> str:
    for a, b in READINGS:
        text = text.replace(a, b)
    return text


def post(path: str, params: dict, body: bytes | None = None) -> bytes:
    url = f'{HOST}{path}?{urllib.parse.urlencode(params)}'
    req = urllib.request.Request(url, data=body or b'', method='POST',
                                 headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return r.read()


def synth(text: str, speaker: int, dest: pathlib.Path) -> float:
    q = json.loads(post('/audio_query', {'text': to_reading(text), 'speaker': speaker}))
    q['speedScale'] = SPEED
    q['prePhonemeLength'] = 0.05
    q['postPhonemeLength'] = 0.1
    q['outputSamplingRate'] = 48000
    dest.write_bytes(post('/synthesis', {'speaker': speaker}, json.dumps(q).encode()))
    with wave.open(str(dest)) as w:
        return w.getnframes() / w.getframerate()


def main() -> None:
    data = json.loads(SCRIPT.read_text(encoding='utf-8'))
    OUT.mkdir(parents=True, exist_ok=True)
    scenes = []
    cursor = 0
    for s in data['scenes']:
        t = SCENE_HEAD
        lines = []
        for i, text in enumerate(s['lines']):
            name = f"{s['id']}_{i:02d}.wav"
            dur = synth(text, data['speaker'], OUT / name)
            lines.append({'file': f'voice/{name}', 'text': text,
                          'from': round(t * FPS), 'frames': round(dur * FPS)})
            t += dur + LINE_GAP
        total = round((t - LINE_GAP + SCENE_TAIL) * FPS)
        scenes.append({'id': s['id'], 'start': cursor, 'frames': total, 'lines': lines})
        cursor += total
        print(f"{s['id']:<12} {total / FPS:6.1f}s")
    TIMING.write_text(json.dumps({'fps': FPS, 'total': cursor, 'scenes': scenes},
                                 ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'TOTAL {cursor / FPS / 60:.0f}m{cursor / FPS % 60:04.1f}s')


if __name__ == '__main__':
    main()
