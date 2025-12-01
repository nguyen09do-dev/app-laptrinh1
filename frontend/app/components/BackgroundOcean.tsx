'use client';

export default function BackgroundOcean() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#001a2e] via-[#002642] to-[#001a2e]" />
      {/* Light rays */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute top-0 w-32 h-full opacity-10"
          style={{
            left: `${i * 20}%`,
            background: 'linear-gradient(to bottom, rgba(100,200,255,0.3), transparent 70%)',
            transform: `skewX(${-10 + i * 5}deg)`,
          }}
        />
      ))}
      {/* Bubbles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white/20 rounded-full animate-pulse"
          style={{
            width: `${5 + Math.random() * 15}px`,
            height: `${5 + Math.random() * 15}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
      {/* Glow spots */}
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
    </div>
  );
}
