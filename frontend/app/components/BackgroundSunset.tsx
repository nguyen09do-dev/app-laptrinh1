'use client';

export default function BackgroundSunset() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0f2e] via-[#2e1a4e] via-[#4e2a3e] to-[#2e1a1e]" />
      {/* Sun glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-pink-500/20 rounded-full blur-3xl" />
      {/* Cloud layers */}
      <div className="absolute bottom-1/3 inset-x-0 h-32 bg-gradient-to-b from-purple-900/20 to-transparent" />
      <div className="absolute bottom-1/4 inset-x-0 h-24 bg-gradient-to-b from-pink-900/15 to-transparent" />
      {/* Particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-orange-300 rounded-full opacity-40 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
}
