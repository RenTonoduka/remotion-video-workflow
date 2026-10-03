import React from 'react';
import { Composition } from 'remotion';
import { GrandRule } from './GrandRule';
import timing from './timing.json';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="WodaneGrandRule"
    component={GrandRule}
    durationInFrames={timing.total}
    fps={timing.fps}
    width={1920}
    height={1080}
  />
);
