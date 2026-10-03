import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import script from './script.json';
import timing from './timing.json';

// Wodane スライドと同じ配色（ピーチ→ミントの背景、白カード、青見出し、オレンジのタグ）
const C = {
  peach: '#fde8d3',
  mint: '#d6f0e6',
  card: '#ffffff',
  blue: '#1f5f8b',
  ink: '#2b3440',
  sub: '#5b6573',
  orange: '#f5873a',
  green: '#2f9e74',
  pale: '#eaf3f8',
  shadow: 'rgba(31, 95, 139, 0.16)',
};
const JP = 'Rounded, sans-serif';
const EN = 'Montserrat, Rounded, sans-serif';

type ScriptScene = (typeof script.scenes)[number];
type TimedScene = (typeof timing.scenes)[number];

const CHAPTERS = ['来たとき', '作業のはじめ', '作業中', '帰るとき', 'その他'];

// 字幕では「Wodane」を英字のまま、他はそのまま表示
const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const fonts = [
      new FontFace('Rounded', `url(${staticFile('fonts/Rounded800.ttf')})`, { weight: '800' }),
      new FontFace('Rounded', `url(${staticFile('fonts/Rounded500.ttf')})`, { weight: '500' }),
      new FontFace('Montserrat', `url(${staticFile('fonts/Montserrat800.ttf')})`, { weight: '800' }),
    ];
    Promise.all(fonts.map((f) => f.load()))
      .then((loaded) => {
        loaded.forEach((f) => document.fonts.add(f));
        continueRender(handle);
      })
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
  }, [handle]);
};

const useIn = (delay = 0, damping = 16) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

// ---------- 共通パーツ ----------
const Pill: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({
  children,
  color = C.orange,
  size = 30,
}) => (
  <span
    style={{
      display: 'inline-block',
      background: color,
      color: '#fff',
      fontFamily: JP,
      fontWeight: 800,
      fontSize: size,
      padding: `${size * 0.25}px ${size * 0.8}px`,
      borderRadius: 999,
      letterSpacing: 1,
    }}
  >
    {children}
  </span>
);

const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div
    style={{
      background: C.card,
      borderRadius: 36,
      boxShadow: `0 14px 0 ${C.shadow}, 0 24px 60px rgba(0,0,0,0.06)`,
      ...style,
    }}
  >
    {children}
  </div>
);

const Background: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(135deg, ${C.peach} 0%, #eef0e2 50%, ${C.mint} 100%)` }} />
);

// 縦長の店内写真をゆっくりズーム
const Photo: React.FC<{ src: string; frames: number; full?: boolean }> = ({ src, frames, full }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, frames], [1.04, 1.14]);
  const y = interpolate(frame, [0, frames], [0, -2.5]);
  return (
    <Img
      src={staticFile(`photos/${src}.jpg`)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `scale(${s}) translateY(${y}%)`,
        filter: full ? 'blur(2px) brightness(0.92)' : undefined,
      }}
    />
  );
};

// ---------- 左パネルの図解（写真がないシーン） ----------
const Emoji: React.FC<{ e: string; size: number; delay?: number }> = ({ e, size, delay = 0 }) => {
  const p = useIn(delay, 11);
  return (
    <div style={{ fontSize: size, lineHeight: 1, transform: `scale(${p})`, fontFamily: 'Noto Color Emoji' }}>{e}</div>
  );
};

const ScreenFrame: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div
    style={{
      width: 600,
      background: '#fff',
      borderRadius: 24,
      overflow: 'hidden',
      boxShadow: '0 18px 50px rgba(31,95,139,0.25)',
      border: `4px solid ${C.blue}`,
    }}
  >
    <div style={{ background: C.blue, color: '#fff', fontFamily: EN, fontWeight: 800, fontSize: 26, padding: '12px 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 14, height: 14, borderRadius: 7, background: '#ff8a7a' }} />
      <span style={{ width: 14, height: 14, borderRadius: 7, background: '#ffd36a' }} />
      <span style={{ width: 14, height: 14, borderRadius: 7, background: '#7fd9a8' }} />
      <span style={{ marginLeft: 12 }}>{title}</span>
    </div>
    <div style={{ padding: 28 }}>{children}</div>
  </div>
);

const Tap: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 24) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        border: `6px solid ${C.orange}`,
        transform: `scale(${1 + t / 30})`,
        opacity: 1 - t / 24,
      }}
    />
  );
};

const Visual: React.FC<{ kind: string; scene: TimedScene }> = ({ kind, scene }) => {
  const frame = useCurrentFrame();
  const lineAt = (i: number) => scene.lines[Math.min(i, scene.lines.length - 1)].from;
  const center: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 };

  if (kind === 'shoes') {
    return (
      <div style={center}>
        <div style={{ display: 'flex', gap: 30 }}>
          <Emoji e="👟" size={190} delay={5} />
          <Emoji e="➡️" size={110} delay={14} />
          <Emoji e="🧦" size={190} delay={22} />
        </div>
        <Pill color={C.blue} size={40}>入口で靴を脱ぐ</Pill>
      </div>
    );
  }
  if (kind === 'member') {
    const tapAt = lineAt(1) + 50;
    return (
      <ScreenFrame title="Wodane">
        <div style={{ fontFamily: JP, fontWeight: 800, fontSize: 30, color: C.ink, marginBottom: 18 }}>会員番号をタップ</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {Array.from({ length: 12 }, (_, i) => {
            const me = i === 5;
            const on = me && frame >= tapAt;
            return (
              <div
                key={i}
                style={{
                  position: 'relative',
                  borderRadius: 16,
                  padding: '22px 0',
                  textAlign: 'center',
                  fontFamily: EN,
                  fontWeight: 800,
                  fontSize: 32,
                  background: on ? C.orange : C.pale,
                  color: on ? '#fff' : C.blue,
                }}
              >
                {String(i + 1).padStart(3, '0')}
                {me && <Tap at={tapAt} />}
              </div>
            );
          })}
        </div>
      </ScreenFrame>
    );
  }
  if (kind === 'pin') {
    return (
      <div style={center}>
        <ScreenFrame title="Wodane">
          <div style={{ fontFamily: JP, fontWeight: 800, fontSize: 30, color: C.ink, textAlign: 'center', marginBottom: 22 }}>
            4桁の数字を設定
          </div>
          <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
            {[0, 1, 2, 3].map((i) => {
              const on = frame >= 25 + i * 12;
              return (
                <div key={i} style={{ width: 96, height: 120, borderRadius: 18, border: `4px solid ${on ? C.blue : '#cfd8e0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, color: C.blue }}>
                  {on ? '●' : ''}
                </div>
              );
            })}
          </div>
        </ScreenFrame>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: interpolate(frame, [lineAt(1), lineAt(1) + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          <Emoji e="📝" size={90} delay={lineAt(1)} />
          <Pill size={36}>必ずメモ！</Pill>
        </div>
      </div>
    );
  }
  if (kind === 'tap') {
    const tapAt = lineAt(1) + 20;
    const done = frame >= tapAt;
    return (
      <ScreenFrame title="Wodane">
        <div style={{ ...center, padding: '20px 0' }}>
          <div style={{ fontFamily: JP, fontWeight: 500, fontSize: 28, color: C.sub }}>おはようございます</div>
          <div style={{ position: 'relative', borderRadius: 999, background: done ? C.green : C.orange, color: '#fff', fontFamily: JP, fontWeight: 800, fontSize: 52, padding: '30px 80px', transform: `scale(${done ? 1 : 1 + 0.04 * Math.sin(frame / 5)})` }}>
            {done ? '記録しました ✓' : '来た時間を記録'}
            <Tap at={tapAt} />
          </div>
          <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 40, color: C.blue, opacity: done ? 1 : 0 }}>10:00</div>
        </div>
      </ScreenFrame>
    );
  }
  if (kind === 'popup') {
    const show = useIn(lineAt(1), 13);
    const okAt = lineAt(2) + 70;
    const ok = frame >= okAt;
    const row = (k: string, v: string) => (
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e6edf2', padding: '14px 4px', fontFamily: JP, fontSize: 28 }}>
        <span style={{ color: C.sub, fontWeight: 500 }}>{k}</span>
        <span style={{ color: C.ink, fontWeight: 800 }}>{v}</span>
      </div>
    );
    return (
      <div style={{ position: 'relative' }}>
        <ScreenFrame title="Wodane">
          <div style={{ height: 380, background: '#f3f6f8', borderRadius: 14 }} />
        </ScreenFrame>
        <div style={{ position: 'absolute', left: 40, right: 40, top: 70, transform: `scale(${show})` }}>
          <Card style={{ padding: 30, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ fontFamily: JP, fontWeight: 800, fontSize: 32, color: C.blue, marginBottom: 8 }}>サービス提供記録</div>
            {row('来た時間', '10:00')}
            {row('帰る時間', '16:00')}
            {row('作業内容', 'データ入力')}
            <div style={{ position: 'relative', marginTop: 22, borderRadius: 999, background: ok ? C.green : C.orange, color: '#fff', textAlign: 'center', fontFamily: JP, fontWeight: 800, fontSize: 36, padding: '16px 0' }}>
              {ok ? '確認しました ✓' : '確認'}
              <Tap at={okAt} />
            </div>
          </Card>
        </div>
      </div>
    );
  }
  if (kind === 'calendar') {
    const days = Array.from({ length: 14 }, (_, i) => i + 6);
    const mark = 9;
    const p = useIn(40, 10);
    return (
      <Card style={{ padding: 34, width: 600 }}>
        <div style={{ fontFamily: JP, fontWeight: 800, fontSize: 34, color: C.blue, marginBottom: 18 }}>次の通所日</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
          {['月', '火', '水', '木', '金', '土', '日'].map((d) => (
            <div key={d} style={{ textAlign: 'center', fontFamily: JP, fontWeight: 800, fontSize: 24, color: C.sub }}>{d}</div>
          ))}
          {days.map((d) => (
            <div key={d} style={{ position: 'relative', textAlign: 'center', fontFamily: EN, fontWeight: 800, fontSize: 32, padding: '14px 0', color: C.ink }}>
              {d}
              {d === mark && (
                <div style={{ position: 'absolute', inset: -2, borderRadius: 999, border: `6px solid ${C.orange}`, transform: `scale(${p})` }} />
              )}
            </div>
          ))}
        </div>
      </Card>
    );
  }
  if (kind === 'check') {
    const items: [string, string][] = [
      ['📱', 'スマホ'],
      ['👛', '貴重品'],
      ['👟', '自分の靴'],
    ];
    return (
      <Card style={{ padding: '40px 50px', width: 560 }}>
        {items.map(([e, t], i) => {
          const on = frame >= 25 + i * 35;
          return (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '18px 0', borderBottom: i < 2 ? '2px solid #e6edf2' : undefined }}>
              <span style={{ fontSize: 70, fontFamily: 'Noto Color Emoji' }}>{e}</span>
              <span style={{ flex: 1, fontFamily: JP, fontWeight: 800, fontSize: 44, color: C.ink }}>{t}</span>
              <span style={{ width: 64, height: 64, borderRadius: 14, border: `4px solid ${C.green}`, background: on ? C.green : '#fff', color: '#fff', fontSize: 46, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {on ? '✓' : ''}
              </span>
            </div>
          );
        })}
      </Card>
    );
  }
  if (kind === 'ribbon') {
    return (
      <div style={{ display: 'flex', gap: 34 }}>
        <Card style={{ padding: 34, width: 300, ...center }}>
          <Emoji e="🎀" size={150} delay={8} />
          <div style={{ fontFamily: JP, fontWeight: 800, fontSize: 34, color: C.green, textAlign: 'center' }}>リボンあり</div>
          <div style={{ fontFamily: JP, fontWeight: 500, fontSize: 26, color: C.ink, textAlign: 'center' }}>おしゃべりOK</div>
        </Card>
        <Card style={{ padding: 34, width: 300, ...center }}>
          <Emoji e="🎧" size={150} delay={20} />
          <div style={{ fontFamily: JP, fontWeight: 800, fontSize: 34, color: C.blue, textAlign: 'center' }}>リボンなし</div>
          <div style={{ fontFamily: JP, fontWeight: 500, fontSize: 26, color: C.ink, textAlign: 'center' }}>ひとりで集中</div>
        </Card>
      </div>
    );
  }
  return null;
};

// ---------- 上部の章インジケーター ----------
const ChapterBar: React.FC<{ chapter: string }> = ({ chapter }) => (
  <div style={{ position: 'absolute', top: 40, left: 80, display: 'flex', alignItems: 'center', gap: 14 }}>
    <span style={{ fontFamily: EN, fontWeight: 800, fontSize: 30, color: C.blue, marginRight: 16 }}>Wodane</span>
    {CHAPTERS.map((c) => {
      const on = c === chapter;
      return (
        <span
          key={c}
          style={{
            fontFamily: JP,
            fontWeight: 800,
            fontSize: 24,
            padding: '8px 22px',
            borderRadius: 999,
            background: on ? C.blue : 'rgba(255,255,255,0.7)',
            color: on ? '#fff' : C.sub,
          }}
        >
          {c}
        </span>
      );
    })}
  </div>
);

// ---------- 字幕 ----------
const Subtitle: React.FC<{ scene: TimedScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const line = [...scene.lines].reverse().find((l) => frame >= l.from - 4);
  if (!line) return null;
  const end = line.from + line.frames + 8;
  const nextLine = scene.lines.find((l) => l.from > line.from);
  // 次のセリフまでの間は表示を残し、シーン末尾の余韻では消す
  if (!nextLine && frame > end) return null;
  const o = interpolate(frame, [line.from - 4, line.from + 2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 44, display: 'flex', justifyContent: 'center', opacity: o }}>
      <div
        style={{
          maxWidth: 1640,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 24,
          padding: '18px 44px',
          fontFamily: JP,
          fontWeight: 800,
          fontSize: 42,
          lineHeight: 1.45,
          color: C.ink,
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(31,95,139,0.18)',
          borderBottom: `6px solid ${C.mint}`,
          // 2行になるときは行の長さをそろえ、文節で折り返す（「い。」だけが残らないように）
          ...({ textWrap: 'balance', wordBreak: 'auto-phrase' } as React.CSSProperties),
        }}
      >
        {line.text}
      </div>
    </div>
  );
};

// ---------- シーン ----------
const Points: React.FC<{ s: ScriptScene; t: TimedScene; size?: number }> = ({ s, t, size = 40 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 36 }}>
      {s.points.map((p, i) => {
        // 箇条書きはセリフの進行に合わせて順に出す
        const li = Math.floor((i * t.lines.length) / s.points.length);
        const at = t.lines[li].from + (i > 0 && li === Math.floor(((i - 1) * t.lines.length) / s.points.length) ? 20 : 0);
        const k = spring({ frame: frame - at, fps, config: { damping: 15 } });
        return (
          <div key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 20, opacity: k, transform: `translateX(${(1 - k) * 40}px)` }}>
            <span style={{ flex: 'none', marginTop: size * 0.18, width: size * 0.8, height: size * 0.8, borderRadius: 999, background: C.green, color: '#fff', fontSize: size * 0.55, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✓
            </span>
            <span style={{ fontFamily: JP, fontWeight: 800, fontSize: size, lineHeight: 1.4, color: C.ink }}>{p}</span>
          </div>
        );
      })}
    </div>
  );
};

const StandardScene: React.FC<{ s: ScriptScene; t: TimedScene }> = ({ s, t }) => {
  const enterL = useIn(0, 18);
  const enterR = useIn(6, 18);
  // カード幅に1行で収まる大きさ（端の1文字だけ折り返さないように）
  const titleSize = Math.min(68, Math.floor(840 / s.title.length));
  return (
    <AbsoluteFill>
      <ChapterBar chapter={s.chapter} />
      {/* 左：店内写真 or 図解 */}
      <div
        style={{
          position: 'absolute',
          left: 110,
          top: 140,
          width: 660,
          height: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: enterL,
          transform: `translateY(${(1 - enterL) * 40}px)`,
        }}
      >
        {s.photo ? (
          <div style={{ width: 520, height: 700, borderRadius: 36, overflow: 'hidden', border: '10px solid #fff', boxShadow: `0 14px 0 ${C.shadow}` }}>
            <Photo src={s.photo} frames={t.frames} />
          </div>
        ) : (
          <Visual kind={s.visual ?? ''} scene={t} />
        )}
      </div>
      {/* 右：要点カード */}
      <Card
        style={{
          position: 'absolute',
          left: 830,
          right: 110,
          top: 170,
          minHeight: 520,
          padding: '56px 64px',
          opacity: enterR,
          transform: `translateX(${(1 - enterR) * 60}px)`,
        }}
      >
        <Pill>{s.tag}</Pill>
        <div style={{ fontFamily: JP, fontWeight: 800, fontSize: titleSize, color: C.blue, marginTop: 24, lineHeight: 1.3 }}>{s.title}</div>
        <Points s={s} t={t} />
      </Card>
    </AbsoluteFill>
  );
};

const FullScene: React.FC<{ s: ScriptScene; t: TimedScene }> = ({ s, t }) => {
  const frame = useCurrentFrame();
  const k = useIn(4, 15);
  const isTitle = s.visual === 'title';
  return (
    <AbsoluteFill>
      {s.photo && (
        <AbsoluteFill style={{ opacity: 0.55 }}>
          <Photo src={s.photo} frames={t.frames} full />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: `linear-gradient(135deg, ${C.peach}cc, ${C.mint}cc)` }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 90 }}>
        <Card style={{ padding: '64px 110px', textAlign: 'center', transform: `scale(${0.9 + 0.1 * k})`, opacity: k, maxWidth: 1760 }}>
          <Pill>{s.tag}</Pill>
          <div style={{ fontFamily: JP, fontWeight: 800, fontSize: isTitle ? 110 : 72, color: C.blue, marginTop: 28, lineHeight: 1.3 }}>{s.title}</div>
          {s.points.map((p, i) => {
            const at = isTitle ? 18 : t.lines[Math.min(i + 1, t.lines.length - 1)].from;
            const o = interpolate(frame, [at, at + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div
                key={p}
                style={{
                  fontFamily: isTitle ? EN : JP,
                  fontWeight: 800,
                  fontSize: isTitle ? 48 : 40,
                  color: isTitle ? C.orange : C.ink,
                  marginTop: 22,
                  opacity: o,
                  letterSpacing: isTitle ? 2 : 0,
                }}
              >
                {p}
              </div>
            );
          })}
        </Card>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SceneView: React.FC<{ s: ScriptScene; t: TimedScene }> = ({ s, t }) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 10, t.frames - 8, t.frames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const full = s.visual === 'title' || s.visual === 'vision' || s.visual === 'section';
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      {full ? <FullScene s={s} t={t} /> : <StandardScene s={s} t={t} />}
      <Subtitle scene={t} />
      {t.lines.map((l) => (
        <Sequence key={l.file} from={l.from} durationInFrames={l.frames + 2}>
          <Audio src={staticFile(l.file)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const GrandRule: React.FC = () => {
  useFonts();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.peach }}>
      <Background />
      {script.scenes.map((s, i) => {
        const t = timing.scenes[i];
        return (
          <Sequence key={s.id} from={t.start} durationInFrames={t.frames}>
            <SceneView s={s} t={t} />
          </Sequence>
        );
      })}
      <Audio
        src={staticFile('audio/bgm.wav')}
        loop
        volume={(f) => interpolate(f, [0, 30, durationInFrames - 60, durationInFrames], [0, 0.1, 0.1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
    </AbsoluteFill>
  );
};
