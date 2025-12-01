'use client';

import { useBackground } from '@/app/contexts/BackgroundContext';
import BackgroundAurora from './BackgroundAurora';
import BackgroundOcean from './BackgroundOcean';
import BackgroundSunset from './BackgroundSunset';

export default function DynamicBackground() {
  const { theme } = useBackground();

  switch (theme) {
    case 'aurora':
      return <BackgroundAurora />;
    case 'ocean':
      return <BackgroundOcean />;
    case 'sunset':
      return <BackgroundSunset />;
    default:
      return <BackgroundAurora />;
  }
}
