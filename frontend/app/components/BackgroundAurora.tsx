'use client';

export default function BackgroundAurora() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1f] via-[#1a1a3e] to-[#0a0a1f]" />
      {/* Aurora waves */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-emerald-500/30 via-blue-500/20 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-20 left-0 right-0 h-[500px] bg-gradient-to-b from-purple-500/30 via-pink-500/20 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute top-40 left-0 right-0 h-[400px] bg-gradient-to-b from-cyan-500/30 via-blue-500/20 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>
      {/* Stars */}
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 50}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
}
