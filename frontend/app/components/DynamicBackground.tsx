'use client';

import { useBackground } from '@/app/contexts/BackgroundContext';
import React, { lazy, Suspense, Component, ReactNode } from 'react';

// Lazy load background components for better performance
const BackgroundAurora = lazy(() => import('./BackgroundAurora'));
const BackgroundOcean = lazy(() => import('./BackgroundOcean'));
const BackgroundSunset = lazy(() => import('./BackgroundSunset'));

// Simple loading fallback
const BackgroundLoader = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-midnight-950 via-midnight-900 to-midnight-950 -z-10" />
);

// Error fallback component
const BackgroundErrorFallback = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-midnight-950 via-midnight-900 to-midnight-950 -z-10" />
);

// Error Boundary class component
class BackgroundErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Background component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <BackgroundErrorFallback />;
    }

    return this.props.children;
  }
}

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
    <BackgroundErrorBoundary>
      <Suspense fallback={<BackgroundLoader />}>
        <BackgroundComponent />
      </Suspense>
    </BackgroundErrorBoundary>
  );
}
