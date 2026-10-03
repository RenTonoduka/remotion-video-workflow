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
import {
  CalendarCheck,
  Check,
  Footprints,
  Headphones,
  KeyRound,
  LucideIcon,
  MessageCircle,
  Smartphone,
  Sprout,
  Wallet,
} from 'lucide-react';
import script from './script.json';
import timing from './timing.json';

// 利用者向け・関係機関向けの説明動画と同じスライドデザイン
// （クリーム地・深緑の見出し・緑の区分タグ・白カード＋淡緑のアイコン丸・黄色マーカー）
const C = {
  bg: '#fbf9f2',
  deep: '#1f3a2c',
  green: '#3e6b4e',
  pale: '#e6ece4',
  border: '#e9e8e3',
  ink: '#1f2a22',
  muted: '#706d68',
  mark: '#ffe066',
  white: '#ffffff',
  orange: '#e8833a',
};
const JP = 'Rounded, sans-serif';
const EN = 'Montserrat, Rounded, sans-serif';
// 日本語を文節で折り返し、行の長さをそろえる（lang="ja" が必要）
const WRAP = { wordBreak: 'auto-phrase', textWrap: 'balance' } as React.CSSProperties;

type ScriptScene = (typeof script.scenes)[number];
type TimedScene = (typeof timing.scenes)[number];

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

// 「**ここ**」を黄色マーカーにする
const Rich: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(/\*\*(.+?)\*\*/).map((part, i) =>
      i % 2 ? (
        <span key={i} style={{ background: `linear-gradient(transparent 45%, ${C.mark} 45%)`, padding: '0 4px' }}>
          {part}
        </span>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    )}
  </>
);

// ---------- 共通パーツ ----------
const Pill: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 26 }) => (
  <span
    style={{
      display: 'inline-block',
      background: C.green,
      color: C.white,
      fontFamily: JP,
      fontWeight: 800,
      fontSize: size,
      padding: `${size * 0.28}px ${size * 0.75}px`,
      borderRadius: 999,
    }}
  >
    {children}
  </span>
);

const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode; accent?: boolean }> = ({
  style,
  children,
  accent,
}) => (
  <div
    style={{
      background: accent ? C.green : C.white,
      color: accent ? C.white : C.ink,
      border: `2px solid ${accent ? C.green : C.border}`,
      borderRadius: 22,
      boxShadow: '0 4px 14px rgba(31,58,44,0.06)',
      ...style,
    }}
  >
    {children}
  </div>
);

const IconCircle: React.FC<{ icon: LucideIcon; size?: number; delay?: number; accent?: boolean }> = ({
  icon: Icon,
  size = 120,
  delay = 0,
  accent,
}) => {
  const p = useIn(delay, 12);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        background: accent ? C.green : C.pale,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${p})`,
        flex: 'none',
      }}
    >
      <Icon size={size * 0.5} color={accent ? C.white : C.green} strokeWidth={1.8} />
    </div>
  );
};

// 縦長の店内写真をゆっくりズーム
const Photo: React.FC<{ src: string; frames: number; contain?: boolean }> = ({ src, frames, contain }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, frames], [1.02, 1.1]);
  return (
    <Img
      src={staticFile(`photos/${src}.jpg`)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: contain ? 'contain' : 'cover',
        background: C.white,
        transform: `scale(${contain ? s * 0.9 : s})`,
      }}
    />
  );
};

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

const ScreenFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ width: 620, background: C.white, borderRadius: 20, overflow: 'hidden', border: `3px solid ${C.green}`, boxShadow: '0 8px 24px rgba(31,58,44,0.12)' }}>
    <div style={{ background: C.green, color: C.white, fontFamily: EN, fontWeight: 800, fontSize: 24, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
      {['#f1a99b', '#f3d27a', '#a9d8b8'].map((c) => (
        <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />
      ))}
      <span style={{ marginLeft: 10 }}>Wodane</span>
    </div>
    <div style={{ padding: 28 }}>{children}</div>
  </div>
);

// ---------- 左側の図解（実写がない場面） ----------
const Visual: React.FC<{ kind: string; scene: TimedScene }> = ({ kind, scene }) => {
  const frame = useCurrentFrame();
  const lineAt = (i: number) => scene.lines[Math.min(i, scene.lines.length - 1)].from;
  const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 };
  const label = (t: string, size = 36, color = C.deep) => (
    <div style={{ fontFamily: JP, fontWeight: 800, fontSize: size, color, textAlign: 'center', ...WRAP }}>{t}</div>
  );

  if (kind === 'shoes') {
    return (
      <Card style={{ ...col, width: 560, padding: '60px 40px' }}>
        <IconCircle icon={Footprints} size={220} delay={5} />
        {label('入口で靴を脱いで、上がります', 38)}
      </Card>
    );
  }
  if (kind === 'member') {
    const tapAt = lineAt(1) + 50;
    return (
      <ScreenFrame>
        <div style={{ fontFamily: JP, fontWeight: 800, fontSize: 30, color: C.deep, marginBottom: 18 }}>会員番号をタップ</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {Array.from({ length: 12 }, (_, i) => {
            const me = i === 5;
            const on = me && frame >= tapAt;
            return (
              <div key={i} style={{ position: 'relative', borderRadius: 14, padding: '22px 0', textAlign: 'center', fontFamily: EN, fontWeight: 800, fontSize: 32, background: on ? C.green : C.pale, color: on ? C.white : C.green }}>
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
      <div style={col}>
        <ScreenFrame>
          {label('4桁の数字を設定', 30)}
          <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginTop: 22 }}>
            {[0, 1, 2, 3].map((i) => {
              const on = frame >= 25 + i * 12;
              return (
                <div key={i} style={{ width: 96, height: 120, borderRadius: 16, border: `4px solid ${on ? C.green : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, color: C.green }}>
                  {on ? '●' : ''}
                </div>
              );
            })}
          </div>
        </ScreenFrame>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: interpolate(frame, [lineAt(1), lineAt(1) + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          <IconCircle icon={KeyRound} size={90} delay={lineAt(1)} />
          <span style={{ fontFamily: JP, fontWeight: 800, fontSize: 38, color: C.deep }}>
            <Rich text="**必ずメモ**しておく" />
          </span>
        </div>
      </div>
    );
  }
  if (kind === 'tap') {
    const tapAt = lineAt(1) + 20;
    const done = frame >= tapAt;
    return (
      <ScreenFrame>
        <div style={{ ...col, padding: '24px 0' }}>
          <div style={{ fontFamily: JP, fontWeight: 500, fontSize: 28, color: C.muted }}>おはようございます</div>
          <div style={{ position: 'relative', borderRadius: 999, background: done ? C.green : C.orange, color: C.white, fontFamily: JP, fontWeight: 800, fontSize: 48, padding: '28px 70px', transform: `scale(${done ? 1 : 1 + 0.04 * Math.sin(frame / 5)})` }}>
            {done ? '記録しました ✓' : '来た時間を記録'}
            <Tap at={tapAt} />
          </div>
          <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 40, color: C.green, opacity: done ? 1 : 0 }}>10:00</div>
        </div>
      </ScreenFrame>
    );
  }
  if (kind === 'popup') {
    const show = useIn(lineAt(1), 13);
    const okAt = lineAt(2) + 70;
    const ok = frame >= okAt;
    const row = (k: string, v: string) => (
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `2px solid ${C.border}`, padding: '14px 4px', fontFamily: JP, fontSize: 28 }}>
        <span style={{ color: C.muted, fontWeight: 500 }}>{k}</span>
        <span style={{ color: C.ink, fontWeight: 800 }}>{v}</span>
      </div>
    );
    return (
      <div style={{ position: 'relative' }}>
        <ScreenFrame>
          <div style={{ height: 400, background: '#f3f2ec', borderRadius: 12 }} />
        </ScreenFrame>
        <div style={{ position: 'absolute', left: 44, right: 44, top: 74, transform: `scale(${show})` }}>
          <Card style={{ padding: 30, boxShadow: '0 20px 50px rgba(0,0,0,0.22)' }}>
            <div style={{ fontFamily: JP, fontWeight: 800, fontSize: 32, color: C.deep, marginBottom: 8 }}>サービス提供記録</div>
            {row('来た時間', '10:00')}
            {row('帰る時間', '16:00')}
            {row('作業内容', 'データ入力')}
            <div style={{ position: 'relative', marginTop: 22, borderRadius: 999, background: ok ? C.green : C.orange, color: C.white, textAlign: 'center', fontFamily: JP, fontWeight: 800, fontSize: 34, padding: '16px 0' }}>
              {ok ? '確認しました ✓' : '確認'}
              <Tap at={okAt} />
            </div>
          </Card>
        </div>
      </div>
    );
  }
  if (kind === 'calendar') {
    const p = useIn(40, 10);
    return (
      <Card style={{ padding: 36, width: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          <IconCircle icon={CalendarCheck} size={70} />
          {label('次の通所日', 34)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
          {['月', '火', '水', '木', '金', '土', '日'].map((d) => (
            <div key={d} style={{ textAlign: 'center', fontFamily: JP, fontWeight: 800, fontSize: 24, color: C.muted }}>{d}</div>
          ))}
          {Array.from({ length: 14 }, (_, i) => i + 6).map((d) => (
            <div key={d} style={{ position: 'relative', textAlign: 'center', fontFamily: EN, fontWeight: 800, fontSize: 32, padding: '14px 0', color: C.ink }}>
              {d}
              {d === 9 && <div style={{ position: 'absolute', inset: -2, borderRadius: 999, border: `6px solid ${C.orange}`, transform: `scale(${p})` }} />}
            </div>
          ))}
        </div>
      </Card>
    );
  }
  if (kind === 'check') {
    const items: [LucideIcon, string][] = [
      [Smartphone, 'スマホ'],
      [Wallet, '貴重品'],
      [Footprints, '自分の靴'],
    ];
    return (
      <Card style={{ padding: '30px 46px', width: 560 }}>
        {items.map(([icon, t], i) => {
          const on = frame >= 25 + i * 35;
          return (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '20px 0', borderBottom: i < 2 ? `2px solid ${C.border}` : undefined }}>
              <IconCircle icon={icon} size={86} />
              <span style={{ flex: 1, fontFamily: JP, fontWeight: 800, fontSize: 42, color: C.ink }}>{t}</span>
              <span style={{ width: 60, height: 60, borderRadius: 14, border: `4px solid ${C.green}`, background: on ? C.green : C.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {on && <Check size={44} color={C.white} strokeWidth={3} />}
              </span>
            </div>
          );
        })}
      </Card>
    );
  }
  if (kind === 'ribbon') {
    const p = useIn(6, 12);
    return (
      <Card style={{ ...col, width: 560, padding: '36px 30px' }}>
        <div style={{ width: 300, height: 300, transform: `scale(${p})` }}>
          <Img src={staticFile('photos/hachimaki.jpg')} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        {label('黄色いハチマキを腕に巻く', 36)}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <IconCircle icon={MessageCircle} size={64} delay={20} />
          <span style={{ fontFamily: JP, fontWeight: 800, fontSize: 30, color: C.green, whiteSpace: 'nowrap' }}>ハチマキ同士は、話しかけOK</span>
        </div>
      </Card>
    );
  }
  if (kind === 'nohachi') {
    return (
      <div style={{ display: 'flex', gap: 28 }}>
        <Card style={{ ...col, width: 320, padding: '40px 16px', gap: 18 }}>
          <Img src={staticFile('photos/hachimaki.jpg')} style={{ width: 170, height: 170, objectFit: 'contain' }} />
          {label('ハチマキあり', 32, C.green)}
          <div style={{ fontFamily: JP, fontWeight: 500, fontSize: 26, color: C.ink, whiteSpace: 'nowrap' }}>交流したい方</div>
        </Card>
        <Card accent style={{ ...col, width: 320, padding: '40px 16px', gap: 18 }}>
          <div style={{ height: 170, display: 'flex', alignItems: 'center' }}>
            <IconCircle icon={Headphones} size={150} delay={12} />
          </div>
          {label('ハチマキなし', 32, C.white)}
          <div style={{ fontFamily: JP, fontWeight: 500, fontSize: 26, whiteSpace: 'nowrap' }}>ひとりで集中したい方</div>
        </Card>
      </div>
    );
  }
  return null;
};

// ---------- 字幕 ----------
const Subtitle: React.FC<{ scene: TimedScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const line = [...scene.lines].reverse().find((l) => frame >= l.from - 4);
  if (!line) return null;
  const isLast = line === scene.lines[scene.lines.length - 1];
  if (isLast && frame > line.from + line.frames + 8) return null;
  const o = interpolate(frame, [line.from - 4, line.from + 2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center', opacity: o }}>
      <div
        style={{
          maxWidth: 1640,
          background: C.white,
          border: `2px solid ${C.border}`,
          borderRadius: 18,
          padding: '16px 44px',
          fontFamily: JP,
          fontWeight: 800,
          fontSize: 40,
          lineHeight: 1.45,
          color: C.ink,
          textAlign: 'center',
          boxShadow: '0 4px 14px rgba(31,58,44,0.08)',
          ...WRAP,
        }}
      >
        {line.text}
      </div>
    </div>
  );
};

// ---------- スライド ----------
const Header: React.FC<{ section: string; no: number }> = ({ section, no }) => (
  <>
    <div style={{ position: 'absolute', top: 44, left: 64 }}>
      <Pill>{section}</Pill>
    </div>
    <div style={{ position: 'absolute', top: 52, right: 70, fontFamily: EN, fontWeight: 800, fontSize: 22, color: C.muted, letterSpacing: 2 }}>
      Wodane&nbsp;&nbsp;{String(no).padStart(2, '0')} / {script.scenes.length}
    </div>
  </>
);

const Points: React.FC<{ s: ScriptScene; t: TimedScene }> = ({ s, t }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      {s.points.map((p, i) => {
        // 箇条書きはセリフの進行に合わせて順に出す
        const li = Math.floor((i * t.lines.length) / s.points.length);
        const prevLi = Math.floor(((i - 1) * t.lines.length) / s.points.length);
        const at = t.lines[li].from + (i > 0 && li === prevLi ? 20 : 0);
        const k = spring({ frame: frame - at, fps, config: { damping: 15 } });
        return (
          <div key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 18, opacity: k, transform: `translateX(${(1 - k) * 30}px)` }}>
            <Check size={44} color={C.green} strokeWidth={3} style={{ flex: 'none', marginTop: 6 }} />
            <span style={{ fontFamily: JP, fontWeight: 800, fontSize: 40, lineHeight: 1.45, color: C.ink, ...WRAP }}>
              <Rich text={p} />
            </span>
          </div>
        );
      })}
    </div>
  );
};

const StandardScene: React.FC<{ s: ScriptScene; t: TimedScene; no: number }> = ({ s, t, no }) => {
  const enterL = useIn(0, 18);
  const enterR = useIn(6, 18);
  const contain = 'photoFit' in s && s.photoFit === 'contain';
  return (
    <AbsoluteFill>
      <Header section={s.chapter} no={no} />
      <div style={{ position: 'absolute', top: 108, left: 64, right: 64, fontFamily: JP, fontWeight: 800, fontSize: 64, color: C.deep, lineHeight: 1.25, ...WRAP }}>
        {s.title}
      </div>
      {/* 左：店内写真 or 図解 */}
      <div style={{ position: 'absolute', left: 64, top: 230, width: 680, height: 640, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: enterL, transform: `translateY(${(1 - enterL) * 30}px)` }}>
        {s.photo ? (
          <div style={{ width: contain ? 560 : 470, height: 640, borderRadius: 20, overflow: 'hidden', border: `2px solid ${C.border}`, background: C.white }}>
            <Photo src={s.photo} frames={t.frames} contain={contain} />
          </div>
        ) : (
          <Visual kind={s.visual ?? ''} scene={t} />
        )}
      </div>
      {/* 右：要点 */}
      <Card style={{ position: 'absolute', left: 800, right: 64, top: 250, padding: '44px 52px', opacity: enterR, transform: `translateX(${(1 - enterR) * 40}px)` }}>
        <div style={{ display: 'inline-block', fontFamily: s.tag.startsWith('STEP') ? EN : JP, fontWeight: 800, fontSize: 26, color: C.green, background: C.pale, borderRadius: 999, padding: '6px 20px', marginBottom: 28 }}>
          {s.tag}
        </div>
        <Points s={s} t={t} />
      </Card>
    </AbsoluteFill>
  );
};

// 表紙・区切り・締め（中央寄せ）
const CenterScene: React.FC<{ s: ScriptScene; t: TimedScene; no: number }> = ({ s, t, no }) => {
  const frame = useCurrentFrame();
  const k = useIn(4, 15);
  const isTitle = s.visual === 'title';
  const isVision = s.visual === 'vision';
  const fadeAt = (at: number) => interpolate(frame, [at, at + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <Header section={s.chapter || (isTitle ? 'はじめての通所日に' : 'Wodane')} no={no} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 100, gap: 34, textAlign: 'center', opacity: k }}>
        <IconCircle icon={Sprout} size={200} delay={2} />
        {isTitle && <div style={{ fontFamily: JP, fontWeight: 800, fontSize: 44, color: C.muted }}>{s.tag}</div>}
        {isVision && (
          // セリフごとに一文ずつ切り替え、最後の一文で締めの見出しを出す
          <div style={{ position: 'relative', width: 1700, height: 90 }}>
            {s.points.map((p, i) => {
              const end = i < 2 ? t.lines[i + 1].from : t.frames;
              const o = Math.min(fadeAt(t.lines[i].from - 6), interpolate(frame, [end - 8, end], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
              return (
                <div key={p} style={{ position: 'absolute', inset: 0, fontFamily: JP, fontWeight: 800, fontSize: i < 2 ? 60 : 52, color: C.deep, lineHeight: 1.5, opacity: o, ...WRAP }}>
                  {p}
                </div>
              );
            })}
          </div>
        )}
        <div style={{ fontFamily: JP, fontWeight: 800, fontSize: isTitle ? 120 : 68, color: C.deep, lineHeight: 1.2, maxWidth: 1700, opacity: isVision ? fadeAt(t.lines[2].from + 60) : 1, ...WRAP }}>
          {isVision ? <Rich text={`**${s.title}**`} /> : s.title}
        </div>
        {isTitle && <div style={{ fontFamily: EN, fontWeight: 800, fontSize: 44, color: C.green, letterSpacing: 2, opacity: fadeAt(18) }}>{s.points[0]}</div>}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SceneView: React.FC<{ s: ScriptScene; t: TimedScene; no: number }> = ({ s, t, no }) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 10, t.frames - 8, t.frames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const center = s.visual === 'title' || s.visual === 'vision' || s.visual === 'section';
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      {center ? <CenterScene s={s} t={t} no={no} /> : <StandardScene s={s} t={t} no={no} />}
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
  return (
    <AbsoluteFill lang="ja" style={{ background: C.bg }}>
      {script.scenes.map((s, i) => {
        const t = timing.scenes[i];
        return (
          <Sequence key={s.id} from={t.start} durationInFrames={t.frames}>
            <SceneView s={s} t={t} no={i + 1} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
