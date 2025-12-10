'use client';

import { useBackground } from '@/app/contexts/BackgroundContext';
import { lazy, Suspense } from 'react';

// Lazy load background components for better performance
const BackgroundAurora = lazy(() => import('./BackgroundAurora'));
const BackgroundOcean = lazy(() => import('./BackgroundOcean'));
const BackgroundSunset = lazy(() => import('./BackgroundSunset'));

// Simple loading fallback
const BackgroundLoader = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-midnight-950 via-midnight-900 to-midnight-950 -z-10" />
);

export default function DynamicBackground() {
  const { theme } = useBackground();

  let BackgroundComponent;
  switch (theme) {
    case 'aurora':
      BackgroundComponent = BackgroundAurora;
      break;
    case 'ocean':
      BackgroundComponent = BackgroundOcean;
      break;
    case 'sunset':
      BackgroundComponent = BackgroundSunset;
      break;
    default:
      BackgroundComponent = BackgroundAurora;
  }

  return (
    <Suspense fallback={<BackgroundLoader />}>
      <BackgroundComponent />
    </Suspense>
  );
}
