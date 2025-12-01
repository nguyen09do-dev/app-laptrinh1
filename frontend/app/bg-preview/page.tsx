'use client';

import { useState } from 'react';

export default function BackgroundPreview() {
  const [selectedBg, setSelectedBg] = useState(0);

  const backgrounds = [
    {
      name: 'Gradient Mesh',
      description: 'Gradient orbs với grid pattern - clean và elegant',
      component: (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f23] via-[#1a1a4e] to-[#0f0f23]" />
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `linear-gradient(rgba(122,145,248,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(122,145,248,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>
      ),
    },
    {
      name: 'Neural Network',
      description: 'Mạng neural AI với các nodes kết nối',
      component: (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1f] via-[#1a1a3e] to-[#0a0a1f]" />
          {/* Nodes */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
          {/* Connecting lines - SVG */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            {[...Array(15)].map((_, i) => (
              <line
                key={i}
                x1={`${Math.random() * 100}%`}
                y1={`${Math.random() * 100}%`}
                x2={`${Math.random() * 100}%`}
                y2={`${Math.random() * 100}%`}
                stroke="url(#line-gradient)"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>
      ),
    },
    {
      name: 'Geometric Patterns',
      description: 'Các hình học hiện đại với gradient',
      component: (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f23] via-[#1a1a4e] to-[#0f0f23]" />
          {/* Hexagons */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="hexagons" x="0" y="0" width="100" height="87" patternUnits="userSpaceOnUse">
                  <polygon points="50,0 93,25 93,75 50,100 7,75 7,25" fill="none" stroke="#60a5fa" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hexagons)" />
            </svg>
          </div>
          {/* Gradient orbs */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
      ),
    },
    {
      name: 'Waves & Particles (Đang dùng)',
      description: 'Sóng gradient với particles floating - hiện tại',
      component: (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1f] via-[#151540] to-[#0a0a1f]" />
          {/* Waves */}
          <svg className="absolute bottom-0 w-full opacity-20" viewBox="0 0 1440 320">
            <path
              fill="url(#wave-gradient)"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          {/* Floating particles */}
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      ),
    },
    {
      name: 'Circuit Board',
      description: 'Mạch điện tử tech với lines và nodes',
      component: (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1f] via-[#1a1a3e] to-[#0a0a1f]" />
          {/* Circuit pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="circuit" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                  {/* Horizontal lines */}
                  <line x1="0" y1="50" x2="200" y2="50" stroke="#60a5fa" strokeWidth="2"/>
                  <line x1="0" y1="150" x2="200" y2="150" stroke="#a78bfa" strokeWidth="2"/>
                  {/* Vertical lines */}
                  <line x1="50" y1="0" x2="50" y2="200" stroke="#60a5fa" strokeWidth="2"/>
                  <line x1="150" y1="0" x2="150" y2="200" stroke="#a78bfa" strokeWidth="2"/>
                  {/* Nodes */}
                  <circle cx="50" cy="50" r="5" fill="#60a5fa"/>
                  <circle cx="150" cy="150" r="5" fill="#a78bfa"/>
                  <circle cx="50" cy="150" r="3" fill="#ec4899"/>
                  <circle cx="150" cy="50" r="3" fill="#ec4899"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#circuit)" />
            </svg>
          </div>
          {/* Glow effects */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
      ),
    },
    {
      name: 'Constellation',
      description: 'Chòm sao kết nối với nhau',
      component: (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1f] via-[#0f0f2e] to-[#0a0a1f]" />
          {/* Stars */}
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                width: `${Math.random() * 3}px`,
                height: `${Math.random() * 3}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3,
              }}
            />
          ))}
          {/* Constellation lines */}
          <svg className="absolute inset-0 w-full h-full opacity-30">
            {[...Array(20)].map((_, i) => {
              const x1 = Math.random() * 100;
              const y1 = Math.random() * 100;
              const x2 = x1 + (Math.random() - 0.5) * 20;
              const y2 = y1 + (Math.random() - 0.5) * 20;
              return (
                <line
                  key={i}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="#60a5fa"
                  strokeWidth="0.5"
                />
              );
            })}
          </svg>
          {/* Nebula effect */}
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
        </div>
      ),
    },
    {
      name: 'Abstract Flow',
      description: 'Dòng chảy abstract với curves',
      component: (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f23] via-[#1a1a4e] to-[#0f0f23]" />
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
              <linearGradient id="flow1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2"/>
              </linearGradient>
              <linearGradient id="flow2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2"/>
              </linearGradient>
            </defs>
            <path
              d="M0,200 Q400,100 800,200 T1600,200"
              stroke="url(#flow1)"
              strokeWidth="100"
              fill="none"
            />
            <path
              d="M0,400 Q400,500 800,400 T1600,400"
              stroke="url(#flow2)"
              strokeWidth="100"
              fill="none"
            />
          </svg>
          {/* Accent orbs */}
          <div className="absolute top-20 right-40 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-40 left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      ),
    },
    {
      name: 'Matrix Rain',
      description: 'Hiệu ứng Matrix với binary rain',
      component: (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#000a00] via-[#001a00] to-[#000a00]" />
          {/* Matrix columns */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 w-1 h-full opacity-20"
              style={{
                left: `${i * 5}%`,
                background: 'linear-gradient(to bottom, transparent, #00ff41, transparent)',
                animation: `matrix-fall ${3 + Math.random() * 3}s linear infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
          {/* Glow effect */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-green-500/5 rounded-full blur-3xl" />
          <style jsx>{`
            @keyframes matrix-fall {
              0% { transform: translateY(-100%); }
              100% { transform: translateY(100vh); }
            }
          `}</style>
        </div>
      ),
    },
    {
      name: 'Aurora Borealis',
      description: 'Ánh sáng cực quang đẹp mắt',
      component: (
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
      ),
    },
    {
      name: 'Neon City',
      description: 'Cyberpunk neon lights futuristic',
      component: (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0014] via-[#14001e] to-[#0a0014]" />
          {/* Neon grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255,0,255,0.15) 2px, transparent 2px),
              linear-gradient(90deg, rgba(0,255,255,0.15) 2px, transparent 2px)
            `,
            backgroundSize: '100px 100px',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'center bottom',
          }} />
          {/* Neon lights */}
          <div className="absolute top-1/4 left-1/4 w-60 h-60 bg-pink-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          {/* Scan lines */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
          }} />
        </div>
      ),
    },
    {
      name: 'Deep Ocean',
      description: 'Đại dương sâu thẳm với ánh sáng huyền bí',
      component: (
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
      ),
    },
    {
      name: 'Starfield Warp',
      description: 'Warp speed qua vũ trụ',
      component: (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-black" />
          {/* Warp lines */}
          {[...Array(50)].map((_, i) => {
            const angle = (Math.random() - 0.5) * 60;
            return (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 w-1 bg-white rounded-full"
                style={{
                  height: `${50 + Math.random() * 150}px`,
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  opacity: 0.3 + Math.random() * 0.5,
                  animation: `warp-speed ${1 + Math.random()}s linear infinite`,
                }}
              />
            );
          })}
          {/* Center glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
          <style jsx>{`
            @keyframes warp-speed {
              0% { transform: translate(-50%, -50%) scale(0) rotate(var(--angle)); opacity: 0; }
              50% { opacity: 1; }
              100% { transform: translate(-50%, -50%) scale(2) rotate(var(--angle)); opacity: 0; }
            }
          `}</style>
        </div>
      ),
    },
    {
      name: 'Sunset Gradient',
      description: 'Hoàng hôn ấm áp với gradient đẹp',
      component: (
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
      ),
    },
    {
      name: 'Plasma Wave',
      description: 'Sóng plasma năng lượng cao',
      component: (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1f] via-[#1a0a2e] to-[#0a0a1f]" />
          {/* Plasma waves */}
          <svg className="absolute inset-0 w-full h-full opacity-30">
            <defs>
              <linearGradient id="plasma1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff00ff" />
                <stop offset="50%" stopColor="#00ffff" />
                <stop offset="100%" stopColor="#ffff00" />
              </linearGradient>
            </defs>
            <path d="M0,150 Q200,100 400,150 T800,150 T1200,150 T1600,150" stroke="url(#plasma1)" strokeWidth="3" fill="none" opacity="0.6" />
            <path d="M0,250 Q200,200 400,250 T800,250 T1200,250 T1600,250" stroke="url(#plasma1)" strokeWidth="3" fill="none" opacity="0.4" />
            <path d="M0,350 Q200,300 400,350 T800,350 T1200,350 T1600,350" stroke="url(#plasma1)" strokeWidth="3" fill="none" opacity="0.3" />
          </svg>
          {/* Glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      ),
    },
    {
      name: 'Binary Space',
      description: 'Không gian nhị phân với code rain',
      component: (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a14] via-[#0f0f1e] to-[#0a0a14]" />
          {/* Binary numbers */}
          <div className="absolute inset-0 opacity-20 font-mono text-xs text-blue-400" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(96,165,250,0.1) 30px, rgba(96,165,250,0.1) 31px)',
          }}>
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}>
                {Math.random() > 0.5 ? '1' : '0'}
              </div>
            ))}
          </div>
          {/* Orbs */}
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl" />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Current selected background */}
      {backgrounds[selectedBg].component}

      {/* Control Panel */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Background Preview</h1>
          <p className="text-gray-300 mb-12">
            Chọn background bạn thích nhất cho AI Content Studio
          </p>

          {/* Background Options */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {backgrounds.map((bg, index) => (
              <button
                key={index}
                onClick={() => setSelectedBg(index)}
                className={`relative group text-left p-6 rounded-2xl border-2 transition-all ${
                  selectedBg === index
                    ? 'border-blue-500 bg-blue-500/10 scale-105'
                    : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                }`}
              >
                {/* Mini preview */}
                <div className="h-32 rounded-xl overflow-hidden mb-4 relative">
                  <div className="absolute inset-0 scale-50 origin-top-left">
                    {bg.component}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                {/* Name & Description */}
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  {bg.name}
                  {selectedBg === index && (
                    <span className="text-xs px-2 py-1 bg-blue-500 rounded-full">Đã chọn</span>
                  )}
                </h3>
                <p className="text-sm text-gray-400">{bg.description}</p>

                {/* Select indicator */}
                {selectedBg === index && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-bold text-white shadow-lg hover:scale-105 transition-all">
              Áp dụng Background #{selectedBg + 1}
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold text-white transition-all"
            >
              Quay lại Dashboard
            </button>
          </div>

          {/* Info */}
          <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-gray-300 text-center">
              <strong className="text-white">Lưu ý:</strong> Đây là trang preview để bạn xem trước các background.
              Sau khi chọn, tôi sẽ cập nhật vào layout chính của app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
