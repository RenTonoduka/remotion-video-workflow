import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
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
  BEAT,
  CHAPTERS,
  COLORS,
  Chapter,
  DROP,
  FPS,
  HIT,
  OUTRO,
  SCENES,
  Scene,
} from './data';

const JP = 'Rounded, sans-serif';
const EN = 'Montserrat, Rounded, sans-serif';

// ---------- フォント ----------
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

// 拍の頭で1→0に減衰するパルス（キックと同期）
const beatPulse = (frame: number) => {
  if (frame < DROP || frame >= HIT) return 0;
  return Math.exp(-(frame % BEAT) / 3);
};

const stroke = (w: number, color = COLORS.ink): React.CSSProperties => ({
  WebkitTextStroke: `${w}px ${color}`,
  paintOrder: 'stroke fill',
});

// ---------- 1文字ずつポップする文字列 ----------
const PopText: React.FC<{
  text: string;
  delay: number;
  step?: number;
  style: React.CSSProperties;
}> = ({ text, delay, step = 1.5, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: 'flex', justifyContent: 'center', whiteSpace: 'pre' }}>
      {Array.from(text).map((ch, i) => {
        const s = spring({
          frame: frame - delay - i * step,
          fps,
          config: { damping: 11, stiffness: 220, mass: 0.6 },
        });
        return (
          <span
            key={i}
            style={{
              ...style,
              display: 'inline-block',
              transform: `translateY(${(1 - s) * 60}px) scale(${s})`,
              opacity: Math.min(1, s * 2),
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

// ---------- 動画クリップ（カット頭でズームパンチ） ----------
const Clip: React.FC<{
  src: string;
  durFrames: number;
  clipFrom?: number;
  clipLen: number;
  index: number;
  punch?: boolean;
  rate?: number;
  style?: React.CSSProperties;
}> = ({ src, durFrames, clipFrom = 0, clipLen, index, punch = true, rate, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const available = clipLen - clipFrom - 0.05;
  const playbackRate = rate ?? Math.min(1, available / (durFrames / fps));
  const p = punch ? spring({ frame, fps, config: { damping: 14, stiffness: 180 } }) : 1;
  const zoomIn = 1.22 - 0.22 * p;
  const kenBurns = 1 + 0.06 * (frame / durFrames);
  const dir = index % 2 === 0 ? 1 : -1;
  const rot = punch ? (1 - p) * 3 * dir : 0;
  const slide = punch ? (1 - p) * 120 * dir : 0;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#000' }}>
      <AbsoluteFill
        style={{
          transform: `translateX(${slide}px) scale(${zoomIn * kenBurns}) rotate(${rot}deg)`,
          ...style,
        }}
      >
        <OffthreadVideo
          src={staticFile(`clips/${src}.mp4`)}
          startFrom={Math.round(clipFrom * fps)}
          playbackRate={playbackRate}
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// カット頭の白フラッシュ
const Flash: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 6], [strength, 0], { extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ backgroundColor: 'white', opacity: o }} />;
};

const BottomShade: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, rgba(0,0,0,${strength * 0.45}) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 48%, rgba(0,0,0,${strength}) 78%, rgba(0,0,0,${strength * 0.6}) 100%)`,
    }}
  />
);

// ---------- シーンのテロップ ----------
const Caption: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const abs = frame + scene.start * FPS;
  const pulse = 1 + 0.035 * beatPulse(abs);
  const line2Delay = Math.min(BEAT, scene.dur * FPS - 40);
  const base: React.CSSProperties = {
    fontFamily: JP,
    fontWeight: 800,
    color: COLORS.white,
    lineHeight: 1.15,
  };
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', top: 1080 }}>
      <div style={{ transform: `scale(${pulse})`, textAlign: 'center' }}>
        {scene.lines.map((line, i) => {
          const hl = scene.highlight === i;
          return (
            <PopText
              key={i}
              text={line}
              delay={i === 0 ? 1 : line2Delay}
              step={1.5}
              style={{
                ...base,
                fontSize: hl ? 108 : 76,
                color: hl ? COLORS.accent : COLORS.white,
                ...stroke(hl ? 22 : 16),
                textShadow: '0 10px 24px rgba(0,0,0,0.35)',
                marginTop: i === 1 ? 6 : 0,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 上部のチャプターバー ----------
const ChapterBar: React.FC<{ current: Chapter; changedAt: number }> = ({ current, changedAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - DROP, fps, config: { damping: 16 } });
  const exit = interpolate(frame, [OUTRO - 6, OUTRO], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bounce = spring({ frame: frame - changedAt, fps, config: { damping: 8, stiffness: 260 } });
  if (frame < DROP || frame >= OUTRO) return null;
  return (
    <AbsoluteFill
      style={{
        top: 150,
        alignItems: 'center',
        opacity: exit,
        transform: `translateY(${(1 - enter) * -200}px)`,
      }}
    >
      <div
        style={{
          fontFamily: EN,
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: 8,
          color: COLORS.white,
          marginBottom: 18,
          textShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}
      >
        Wodane ROOM TOUR
      </div>
      <div style={{ display: 'flex', gap: 14 }}>
        {CHAPTERS.map((c) => {
          const active = c.id === current;
          const s = active ? 0.85 + 0.15 * bounce : 1;
          return (
            <div
              key={c.id}
              style={{
                fontFamily: JP,
                fontWeight: 800,
                fontSize: 36,
                padding: '12px 30px',
                borderRadius: 999,
                color: active ? COLORS.white : 'rgba(255,255,255,0.85)',
                backgroundColor: active ? COLORS.green : 'rgba(0,0,0,0.35)',
                border: `3px solid ${active ? COLORS.white : 'rgba(255,255,255,0.4)'}`,
                transform: `scale(${active ? s * 1.08 : 1})`,
                boxShadow: active ? '0 8px 24px rgba(53,183,121,0.6)' : 'none',
              }}
            >
              {c.label}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- イントロ（0〜4秒） ----------
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hookOut = interpolate(frame, [56, 60], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleIn = frame >= 60;
  const ribbon = spring({ frame: frame - 60, fps, config: { damping: 14 } });
  const tour = spring({ frame: frame - 90, fps, config: { damping: 10, stiffness: 200 } });
  const hookStyle: React.CSSProperties = {
    fontFamily: JP,
    fontWeight: 800,
    fontSize: 104,
    color: COLORS.white,
    ...stroke(20),
  };
  return (
    <AbsoluteFill>
      <Clip src="c01" durFrames={DROP} clipLen={5.07} index={0} punch={false} />
      <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${titleIn ? 0.35 : 0.15})` }} />
      <BottomShade />
      {!titleIn && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: hookOut, top: -80 }}>
          {/* 1拍ごとに言葉が出る */}
          <PopText text="こんな" delay={0} step={1} style={hookStyle} />
          <PopText text="B型事業所" delay={BEAT} step={1} style={{ ...hookStyle, color: COLORS.accent, fontSize: 132, ...stroke(24) }} />
          <PopText text="見たことある？" delay={BEAT * 2} step={1.5} style={hookStyle} />
        </AbsoluteFill>
      )}
      {titleIn && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', top: -60 }}>
          <div
            style={{
              fontFamily: JP,
              fontWeight: 800,
              fontSize: 54,
              color: COLORS.ink,
              backgroundColor: COLORS.accent,
              padding: '10px 36px',
              borderRadius: 12,
              transform: `scaleX(${ribbon}) rotate(-2deg)`,
              marginBottom: 20,
            }}
          >
            就労継続支援B型
          </div>
          <PopText
            text="Wodane"
            delay={66}
            step={2}
            style={{
              fontFamily: EN,
              fontWeight: 800,
              fontSize: 210,
              color: COLORS.white,
              ...stroke(26),
              letterSpacing: 4,
              textShadow: '0 16px 40px rgba(0,0,0,0.45)',
            }}
          />
          <div
            style={{
              fontFamily: EN,
              fontWeight: 800,
              fontSize: 72,
              letterSpacing: 18,
              color: COLORS.white,
              backgroundColor: COLORS.green,
              padding: '8px 10px 8px 28px',
              borderRadius: 10,
              marginTop: 14,
              transform: `scale(${tour}) rotate(${(1 - tour) * -10}deg)`,
              opacity: tour,
            }}
          >
            ROOM TOUR
          </div>
        </AbsoluteFill>
      )}
      <Sequence from={60} layout="none">
        <Flash strength={0.4} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ---------- アウトロ（36〜45秒） ----------
const Outro: React.FC = () => {
  const frame = useCurrentFrame(); // 0 = 36秒
  const { fps } = useVideoConfig();
  const hitLocal = HIT - OUTRO;
  const msgOut = interpolate(frame, [hitLocal - 5, hitLocal], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pill = spring({ frame: frame - 60, fps, config: { damping: 10, stiffness: 200 } });
  const logo = spring({ frame: frame - hitLocal, fps, config: { damping: 7, stiffness: 180 } });
  const sub = spring({ frame: frame - hitLocal - 12, fps, config: { damping: 14 } });
  const cta = spring({ frame: frame - hitLocal - 30, fps, config: { damping: 12 } });
  const arrowBob = Math.sin((frame / BEAT) * Math.PI) * 10;
  const blur = interpolate(frame, [0, 20], [0, 10], { extrapolateRight: 'clamp' });
  const msg: React.CSSProperties = {
    fontFamily: JP,
    fontWeight: 800,
    fontSize: 96,
    color: COLORS.white,
    ...stroke(20),
  };
  return (
    <AbsoluteFill>
      <Clip src="c01" durFrames={270} clipLen={5.07} index={1} punch={false} rate={0.55} style={{ filter: `blur(${blur}px)` }} />
      <AbsoluteFill style={{ backgroundColor: 'rgba(15,25,45,0.45)' }} />
      <Flash />
      {frame < hitLocal && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: msgOut, top: -60 }}>
          <PopText text="自分のペースで、" delay={2} step={1.5} style={msg} />
          <PopText text="はたらく一歩を。" delay={30} step={1.5} style={{ ...msg, color: COLORS.accent, fontSize: 112, ...stroke(22) }} />
          <div
            style={{
              marginTop: 50,
              fontFamily: JP,
              fontWeight: 800,
              fontSize: 60,
              color: COLORS.ink,
              backgroundColor: COLORS.white,
              padding: '18px 48px',
              borderRadius: 999,
              transform: `scale(${pill * (1 + 0.04 * beatPulse(frame + OUTRO))})`,
              boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
            }}
          >
            見学・ご相談は<span style={{ color: COLORS.green }}>お気軽に</span>
          </div>
        </AbsoluteFill>
      )}
      {frame >= hitLocal && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', top: -80 }}>
          <div
            style={{
              fontFamily: JP,
              fontWeight: 800,
              fontSize: 56,
              color: COLORS.ink,
              backgroundColor: COLORS.accent,
              padding: '10px 36px',
              borderRadius: 12,
              transform: `translateY(${(1 - sub) * 40}px)`,
              opacity: sub,
              marginBottom: 16,
            }}
          >
            就労継続支援B型
          </div>
          <div
            style={{
              fontFamily: EN,
              fontWeight: 800,
              fontSize: 230,
              color: COLORS.white,
              ...stroke(26),
              transform: `scale(${logo})`,
              textShadow: '0 16px 40px rgba(0,0,0,0.5)',
            }}
          >
            Wodane
          </div>
          <div
            style={{
              marginTop: 40,
              fontFamily: JP,
              fontWeight: 800,
              fontSize: 54,
              color: COLORS.white,
              backgroundColor: COLORS.green,
              padding: '16px 44px',
              borderRadius: 999,
              opacity: cta,
              transform: `translateY(${(1 - cta) * 60}px)`,
            }}
          >
            詳しくはプロフィールから
          </div>
          <div
            style={{
              fontSize: 70,
              color: COLORS.white,
              opacity: cta,
              transform: `translateY(${arrowBob}px)`,
              marginTop: 6,
              fontFamily: JP,
              fontWeight: 800,
              ...stroke(12),
            }}
          >
            ▼
          </div>
        </AbsoluteFill>
      )}
      <Sequence from={hitLocal} layout="none">
        <Flash strength={0.85} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ---------- 効果音 ----------
const SE: React.FC<{ at: number; file: string; volume: number }> = ({ at, file, volume }) => (
  <Sequence from={Math.max(0, at)} durationInFrames={60} layout="none">
    <Audio src={staticFile(`audio/${file}.wav`)} volume={volume} />
  </Sequence>
);

// ---------- メイン ----------
export const RoomTour: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const current = SCENES.find((s) => frame >= s.start * FPS && frame < (s.start + s.dur) * FPS);
  const chapter = current?.chapter ?? 'WORK';
  const firstOfChapter = SCENES.find((s) => s.chapter === chapter)!;
  const whooshes = [60, DROP, ...SCENES.slice(1).map((s) => s.start * FPS), OUTRO];

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/bgm.wav')} volume={0.72} />

      <Sequence durationInFrames={DROP}>
        <Intro />
      </Sequence>

      {SCENES.map((s, i) => (
        <Sequence key={s.src} from={s.start * FPS} durationInFrames={s.dur * FPS}>
          <Clip src={s.src} durFrames={s.dur * FPS} clipFrom={s.clipFrom} clipLen={s.clipLen} index={i} />
          <BottomShade />
          <Flash strength={i === 0 ? 0.8 : 0.5} />
          <Caption scene={s} />
        </Sequence>
      ))}

      <ChapterBar current={chapter} changedAt={firstOfChapter.start * FPS} />

      <Sequence from={OUTRO}>
        <Outro />
      </Sequence>

      {/* SE：ビートの頭にwhooshのピークが来るよう少し前から鳴らす */}
      {whooshes.map((f) => (
        <SE key={`w${f}`} at={f - 6} file="whoosh" volume={0.35} />
      ))}
      {SCENES.map((s) => (
        <SE key={`p${s.src}`} at={s.start * FPS + Math.min(BEAT, s.dur * FPS - 40)} file="pop" volume={0.25} />
      ))}
      <SE at={HIT} file="chime" volume={0.45} />
    </AbsoluteFill>
  );
};

