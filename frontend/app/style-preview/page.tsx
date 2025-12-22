'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Palette,
  X,
  ChevronRight,
  Monitor,
  Smartphone,
  MousePointer2,
  Box,
  Terminal,
  Newspaper,
  ShoppingBag,
  Rocket
} from 'lucide-react';

const STYLES = [
  {
    id: 'sana-dark-glass',
    label: 'Sana Dark + Glass',
    description: 'Dark mode with neon lime glow and glassmorphism',
    bg: '#050505',
    accent: '#D1F80E',
    card: 'rgba(15,15,15,0.65)',
    cardBorder: 'rgba(255,255,255,0.1)',
    text: 'white',
    muted: '#9ca3af',
    button: '#D1F80E',
    buttonText: 'black',
    font: 'serif',
    borderRadius: '24px'
  },
  {
    id: 'minimalist',
    label: 'Minimalist',
    description: 'High whitespace, simple typography, clean aesthetic',
    bg: '#ffffff',
    accent: '#000000',
    card: '#ffffff',
    cardBorder: '#f3f4f6',
    text: '#111827',
    muted: '#6b7280',
    button: '#000000',
    buttonText: 'white',
    font: 'sans-serif',
    borderRadius: '12px'
  },
  {
    id: 'brutalist',
    label: 'Brutalist',
    description: 'Bold colors, thick borders, harsh shadows',
    bg: '#f3f4f6',
    accent: '#FFE500',
    card: '#FFE500',
    cardBorder: 'black',
    text: 'black',
    muted: 'rgba(0,0,0,0.7)',
    button: 'white',
    buttonText: 'black',
    font: 'sans-serif',
    borderRadius: '0px',
    shadow: '8px 8px 0px black'
  },
  {
    id: 'aurora',
    label: 'Aurora Gradient',
    description: 'Aurora-style gradients with dark UI cards',
    bg: '#020617',
    accent: '#7C3AED',
    card: 'rgba(255,255,255,0.05)',
    cardBorder: 'rgba(255,255,255,0.1)',
    text: 'white',
    muted: 'rgba(233,213,255,0.6)',
    button: 'linear-gradient(to right, #13FFAA, #7C3AED, #FF0080)',
    buttonText: 'white',
    font: 'sans-serif',
    borderRadius: '24px'
  },
  {
    id: 'enterprise-slate',
    label: 'Enterprise Slate',
    description: 'Muted blue-gray B2B theme for serious SaaS and agencies',
    bg: '#0f172a',
    accent: '#3b82f6',
    card: '#1e293b',
    cardBorder: '#334155',
    text: '#f8fafc',
    muted: '#94a3b8',
    button: '#3b82f6',
    buttonText: 'white',
    font: 'sans-serif',
    borderRadius: '8px'
  },
  {
    id: 'playful-pastel',
    label: 'Playful Pastel',
    description: 'Friendly pastel surfaces with rounded pills',
    bg: '#fdf2f8',
    accent: '#f472b6',
    card: '#ffffff',
    cardBorder: '#fce7f3',
    text: '#831843',
    muted: '#db2777',
    button: '#f472b6',
    buttonText: 'white',
    font: 'sans-serif',
    borderRadius: '9999px'
  },
  {
    id: 'cyber-neon',
    label: 'Cyber Neon',
    description: 'Futuristic cyberpunk look with neon edges',
    bg: '#0a0a0f',
    accent: '#00ffff',
    card: 'rgba(0,255,255,0.02)',
    cardBorder: '#00ffff',
    text: '#00ffff',
    muted: 'rgba(0,255,255,0.5)',
    button: '#00ffff',
    buttonText: 'black',
    font: 'monospace',
    borderRadius: '4px',
    glow: '0 0 15px rgba(0,255,255,0.3)'
  },
  {
    id: 'editorial-serif',
    label: 'Editorial Serif',
    description: 'Magazine-style layout with serif headlines',
    bg: '#faf9f6',
    accent: '#1a1a1a',
    card: '#ffffff',
    cardBorder: '#e5e5e1',
    text: '#1a1a1a',
    muted: '#666666',
    button: '#1a1a1a',
    buttonText: 'white',
    font: 'serif',
    borderRadius: '0px'
  },
  {
    id: 'product-spotlight',
    label: 'Product Spotlight',
    description: 'Image-forward product layout with strong cards',
    bg: '#f8fafc',
    accent: '#ea580c',
    card: '#ffffff',
    cardBorder: '#e2e8f0',
    text: '#0f172a',
    muted: '#64748b',
    button: '#ea580c',
    buttonText: 'white',
    font: 'sans-serif',
    borderRadius: '32px'
  },
  {
    id: 'retro-terminal',
    label: 'Retro Terminal',
    description: 'Monospaced terminal-inspired dark theme',
    bg: '#0c0c0c',
    accent: '#33ff33',
    card: 'rgba(51,255,51,0.05)',
    cardBorder: '#33ff33',
    text: '#33ff33',
    muted: 'rgba(51,255,51,0.6)',
    button: '#33ff33',
    buttonText: 'black',
    font: 'monospace',
    borderRadius: '0px'
  }
];

function StylePreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const styleId = searchParams.get('style') || 'sana-dark-glass';
  const [activeStyle, setActiveStyle] = useState(STYLES.find(s => s.id === styleId) || STYLES[0]);

  useEffect(() => {
    const newStyle = STYLES.find(s => s.id === styleId);
    if (newStyle) setActiveStyle(newStyle);
  }, [styleId]);

  const handleStyleChange = (id: string) => {
    router.push(`/style-preview?style=${id}`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: activeStyle.bg,
        color: activeStyle.text,
        overflowY: 'auto',
        fontFamily: activeStyle.font,
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Navigation Override - High Z Index */}
      <div style={{ position: 'sticky', top: 0, zIndex: 11000, pointerEvents: 'none' }}>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            position: 'absolute',
            top: '20px',
            right: '25px',
            pointerEvents: 'auto',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'rgba(128,128,128,0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: activeStyle.text,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <X size={20} />
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 24px' }}>
        <header style={{ marginBottom: '80px', position: 'relative' }}>
          {/* Cyber/Retro Background lines */}
          {activeStyle.id === 'cyber-neon' && (
            <div style={{ position: 'absolute', top: -50, left: -50, right: -50, bottom: -50, background: 'linear-gradient(rgba(0,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px', zIndex: -1 }} />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(128,128,128,0.1)', border: '1px solid rgba(128,128,128,0.1)' }}>
              {activeStyle.id === 'retro-terminal' ? <Terminal size={24} /> :
                activeStyle.id === 'cyber-neon' ? <Cpu size={24} /> :
                  activeStyle.id === 'editorial-serif' ? <Newspaper size={24} /> :
                    <Palette size={24} />}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.2em', textTransform: 'uppercase', color: activeStyle.muted }}>
              Visual Excellence {STYLES.indexOf(activeStyle) + 1}/10
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(3rem, 10vw, 6rem)',
            fontWeight: 800,
            marginBottom: '32px',
            lineHeight: 0.9,
            letterSpacing: activeStyle.id === 'brutalist' ? '-0.05em' : 'normal',
            textTransform: activeStyle.id === 'retro-terminal' ? 'uppercase' : 'none'
          }}>
            {activeStyle.label}
          </h1>

          <p style={{
            fontSize: '1.4rem',
            maxWidth: '800px',
            color: activeStyle.muted,
            lineHeight: 1.5,
            fontWeight: activeStyle.id === 'minimalist' ? 300 : 400
          }}>
            {activeStyle.description}. Một hệ thống thiết kế hoàn chỉnh mang lại trải nghiệm thương hiệu độc bản.
          </p>
        </header>

        {/* Style Selector - Grid for better accessibility */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '20px', opacity: 0.6 }}>Chọn phong cách trải nghiệm:</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px',
            padding: '12px',
            backgroundColor: 'rgba(128,128,128,0.05)',
            borderRadius: '20px',
            border: '1px solid rgba(128,128,128,0.1)'
          }}>
            {STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => handleStyleChange(style.id)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  border: '1px solid transparent',
                  backgroundColor: activeStyle.id === style.id ? (activeStyle.id === 'minimalist' ? '#000' : '#fff') : 'rgba(128,128,128,0.05)',
                  color: activeStyle.id === style.id ? (activeStyle.id === 'minimalist' ? '#fff' : '#000') : activeStyle.text,
                  boxShadow: activeStyle.id === style.id ? '0 10px 30px rgba(0,0,0,0.15)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                {style.label}
                {activeStyle.id === style.id && <ChevronRight size={16} />}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Showcase Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '40px' }}>
          {/* Card 1: The Vision */}
          <div style={{
            padding: '48px',
            borderRadius: activeStyle.borderRadius,
            backgroundColor: activeStyle.card,
            border: activeStyle.id === 'brutalist' ? '5px solid black' :
              activeStyle.id === 'retro-terminal' || activeStyle.id === 'cyber-neon' ? `2px solid ${activeStyle.accent}` :
                `1px solid ${activeStyle.cardBorder}`,
            boxShadow: activeStyle.shadow || activeStyle.glow || '0 30px 60px rgba(0,0,0,0.05)',
            backdropFilter: activeStyle.id.includes('glass') || activeStyle.id === 'aurora' ? 'blur(30px)' : 'none',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {activeStyle.id === 'aurora' && (
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(19, 255, 170, 0.1), rgba(124, 58, 237, 0.1), rgba(255, 0, 128, 0.1))', pointerEvents: 'none' }} />
            )}

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: activeStyle.id === 'playful-pastel' ? '999px' : '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '40px',
                backgroundColor: activeStyle.id === 'brutalist' ? 'white' : 'rgba(128,128,128,0.1)',
                border: activeStyle.id === 'brutalist' ? '4px solid black' : 'none',
                color: activeStyle.accent
              }}>
                <Sparkles size={32} />
              </div>
              <h3 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '20px', letterSpacing: '-0.02em' }}>AI Generation</h3>
              <p style={{ marginBottom: '40px', color: activeStyle.muted, lineHeight: 1.7, fontSize: '1.1rem' }}>
                Tối ưu hóa quy trình sáng tạo với trí tuệ nhân tạo đỉnh cao. Giao diện này mang lại cảm hứng khác biệt cho từng sản phẩm.
              </p>
              <button style={{
                width: '100%',
                padding: '18px',
                borderRadius: activeStyle.id === 'playful-pastel' ? '999px' : '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                border: activeStyle.id === 'brutalist' ? '4px solid black' : 'none',
                backgroundColor: activeStyle.button.includes('gradient') ? 'transparent' : activeStyle.button,
                backgroundImage: activeStyle.button.includes('gradient') ? activeStyle.button : 'none',
                color: activeStyle.buttonText,
                boxShadow: activeStyle.id === 'brutalist' ? '6px 6px 0px black' : activeStyle.glow,
                fontSize: '1rem',
                textTransform: 'uppercase',
                transition: 'all 0.2s'
              }}
                onMouseEnter={(e) => {
                  if (activeStyle.id === 'brutalist') e.currentTarget.style.transform = 'translate(-2px, -2px)';
                  else e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  if (activeStyle.id === 'brutalist') e.currentTarget.style.transform = 'none';
                  else e.currentTarget.style.opacity = '1';
                }}
              >
                Trải nghiệm ngay <ArrowRight size={22} />
              </button>
            </div>
          </div>

          {/* Card 2: The Logic */}
          <div style={{
            padding: '48px',
            borderRadius: activeStyle.borderRadius,
            backgroundColor: activeStyle.card,
            border: activeStyle.id === 'brutalist' ? '5px solid black' :
              activeStyle.id === 'retro-terminal' || activeStyle.id === 'cyber-neon' ? `2px solid ${activeStyle.accent}` :
                `1px solid ${activeStyle.cardBorder}`,
            boxShadow: activeStyle.shadow || activeStyle.glow || '0 30px 60px rgba(0,0,0,0.05)',
            backdropFilter: activeStyle.id.includes('glass') || activeStyle.id === 'aurora' ? 'blur(30px)' : 'none'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: activeStyle.id === 'playful-pastel' ? '999px' : '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
              backgroundColor: activeStyle.id === 'brutalist' ? 'white' : 'rgba(128,128,128,0.1)',
              border: activeStyle.id === 'brutalist' ? '4px solid black' : 'none',
              color: activeStyle.accent
            }}>
              <Zap size={32} />
            </div>
            <div style={{ fontSize: '4.5rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.06em', color: activeStyle.accent }}>99.9%</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '48px', color: activeStyle.muted }}>Hiệu suất hệ thống</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { icon: <Monitor size={20} />, text: 'Responsive hoàn hảo' },
                { icon: <MousePointer2 size={20} />, text: 'Tương tác mượt mà' },
                { icon: <Rocket size={20} />, text: 'Tối ưu chuyển động' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ color: activeStyle.accent }}>{item.icon}</div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: The Assets */}
          <div style={{
            padding: '48px',
            borderRadius: activeStyle.borderRadius,
            backgroundColor: activeStyle.card,
            border: activeStyle.id === 'brutalist' ? '5px solid black' :
              activeStyle.id === 'retro-terminal' || activeStyle.id === 'cyber-neon' ? `2px solid ${activeStyle.accent}` :
                `1px solid ${activeStyle.cardBorder}`,
            boxShadow: activeStyle.shadow || activeStyle.glow || '0 30px 60px rgba(0,0,0,0.05)',
            backdropFilter: activeStyle.id.includes('glass') || activeStyle.id === 'aurora' ? 'blur(30px)' : 'none'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: activeStyle.id === 'playful-pastel' ? '999px' : '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
              backgroundColor: activeStyle.id === 'brutalist' ? 'white' : 'rgba(128,128,128,0.1)',
              border: activeStyle.id === 'brutalist' ? '4px solid black' : 'none',
              color: activeStyle.accent
            }}>
              <Box size={32} />
            </div>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '24px' }}>Asset Library</h3>
            <div style={{
              aspectRatio: '16/9',
              borderRadius: activeStyle.id === 'playful-pastel' ? '32px' : '16px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(128,128,128,0.1)',
              border: activeStyle.id === 'retro-terminal' || activeStyle.id === 'cyber-neon' ? `1px solid ${activeStyle.accent}` : 'none',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {activeStyle.id === 'retro-terminal' && (
                <div style={{ position: 'absolute', inset: 0, padding: '20px', fontSize: '10px', opacity: 0.4 }}>
                  {`> LOADING ASSETS...\n> SYSTEM_READY: TRUE\n> ENCRYPTING_DATA...\n> DONE`}
                </div>
              )}
              {activeStyle.id === 'product-spotlight' ? <ShoppingBag size={80} style={{ opacity: 0.3 }} /> :
                activeStyle.id === 'cyber-neon' ? <Smartphone size={80} style={{ opacity: 0.3 }} /> :
                  <Cpu size={80} style={{ opacity: 0.1 }} />}
            </div>
            <p style={{ color: activeStyle.muted, lineHeight: 1.7, fontSize: '1.1rem' }}>
              Thư viện thành phần được xây dựng tỉ mỉ cho từng mục đích sử dụng cụ thể.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ marginTop: '120px', paddingTop: '48px', borderTop: '1px solid rgba(128,128,128,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: activeStyle.muted, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: activeStyle.accent }} />
            © 2025 AI Content Studio. Built for Visual Impact.
          </div>
          <div style={{ display: 'flex', gap: '24px', opacity: 0.5 }}>
            <MousePointer2 size={24} />
            <Monitor size={24} />
            <Smartphone size={24} />
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function StylePreviewPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Đang tải trải nghiệm...</div>}>
      <StylePreviewContent />
    </Suspense>
  );
}
