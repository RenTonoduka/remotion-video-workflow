import React from 'react';
import { Composition } from 'remotion';
import { RoomTour } from './RoomTour';
import { FPS, TOTAL_FRAMES } from './data';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="WodaneRoomTour"
    component={RoomTour}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
