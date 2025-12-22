# Landing Page Generator - Design & Style Reference

## Visual Style System

The application supports 10 distinct visual styles, each with comprehensive theming:

### Available Visual Styles

| ID | Label | Description |
|---|---|---|
| `sana-dark-glass` | Sana Dark + Glass | Dark mode with neon lime glow and glassmorphism |
| `minimalist` | Minimalist | High whitespace, simple typography, clean aesthetic |
| `brutalist` | Brutalist | Bold colors, thick borders, harsh shadows |
| `aurora` | Aurora Gradient | Aurora-style gradients with dark UI cards |
| `enterprise-slate` | Enterprise Slate | Muted blue-gray B2B theme for serious SaaS and agencies |
| `playful-pastel` | Playful Pastel | Friendly pastel surfaces with rounded pills for approachable brands |
| `cyber-neon` | Cyber Neon | Futuristic cyberpunk look with neon edges and grid overlays |
| `editorial-serif` | Editorial Serif | Magazine-style layout with serif headlines for thoughtful content |
| `product-spotlight` | Product Spotlight | Image-forward product layout with strong hero cards for e-commerce |
| `retro-terminal` | Retro Terminal | Monospaced terminal-inspired dark theme with neon green highlights |

### Dark Mode Styles
- `sana-dark-glass`
- `aurora`
- `cyber-neon`
- `retro-terminal`

---

## Visual Style Configuration Structure

Each style defines the following properties:

### Page-Level Styles
- `pageBgClass` - Background and text color for the entire page

### Section & Card Styles
- `sectionClass` - Wrapper class for sections
- `cardClass` - Card container styling
- `cardHoverClass` - Hover state for cards

### Typography Styles
- `headingClass` - Main headlines (display)
- `subheadingClass` - Section titles
- `bodyTextClass` - Body text color
- `mutedTextClass` - Secondary/muted text

### Accent & Highlight Styles
- `accentClass` - Accent text color
- `accentBgClass` - Accent background
- `accentBorderClass` - Accent border color

### CTA Button Styles
- `primaryCtaClass` - Primary call-to-action buttons
- `secondaryCtaClass` - Secondary buttons

### Navigation Styles
- `navClass` - Navigation bar styling
- `navScrolledClass` - Scrolled state for nav

### Icon & Badge Styles
- `iconContainerClass` - Icon wrapper styling
- `badgeClass` - Badge/tag styling

### Border Styles
- `borderClass` - Standard borders
- `dividerClass` - Divider lines

### Typography Flags
- `typographyWeight` - `light` | `normal` | `bold`
- `typographyStyle` - `serif` | `sans` | `mono`

### Layout Flags
- `layoutDensity` - `compact` | `comfortable` | `spacious`
- `borderRadius` - `none` | `sm` | `md` | `lg` | `full`

---

## Style Tokens (Runtime)

```typescript
interface StyleTokens {
  colorPalette: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  iconSet: "solar" | "heroicons" | "phosphor" | "iconoir" | "materialSymbols";
  spacing: {
    sectionPaddingY: number;
    sectionPaddingX: number;
  };
}
```

---

## Use Case to Visual Style Mapping

Default visual styles assigned by use case:

| Use Case | Default Visual Style |
|---|---|
| `online-course` | `sana-dark-glass` (Premium education feel) |
| `saas` | `aurora` (Energetic gradient SaaS) |
| `service` | `minimalist` (Clean, credible) |
| `event` | `aurora` (Energetic, event vibe) |
| `community` | `sana-dark-glass` (Community/creator vibe) |
| `nonprofit` | `minimalist` (Trust and credibility) |
| `hiring` | `minimalist` (Professional, corporate) |
| `newsletter` | `brutalist` (Bold creator aesthetic) |
| `ecommerce` | `minimalist` (Product-focused) |
| `mobile-app` | `aurora` (Energetic app launch) |
| `local-business` | `minimalist` (Friendly and approachable) |
| `portfolio` | `brutalist` (Bold creative statement) |
| `link-in-bio` | `minimalist` (Clean and scannable) |
| `template-resource` | `minimalist` (Educational and clean) |

---

## Tailwind Configuration

### Custom Fonts
```typescript
fontFamily: {
  sans: ["var(--font-inter)", "sans-serif"],
  serif: ["var(--font-playfair)", "serif"],
}
```

### Fluid Typography Scale
```typescript
fontSize: {
  hero: ["clamp(2.5rem, 4vw, 3.75rem)", { lineHeight: "1.1" }],
  display: ["clamp(3rem, 5vw, 4.5rem)", { lineHeight: "1.05" }],
  "section-title": ["clamp(1.875rem, 3vw, 2.5rem)", { lineHeight: "1.2" }],
}
```

### Brand Colors
```typescript
colors: {
  brand: {
    lime: "#D1F80E",
    dark: "#080808",
    gray: "#1A1A1A",
  },
  bg: {
    primary: "#050505",
    secondary: "#0b0b0b",
  },
  aurora: {
    teal: "#13FFAA",
    purple: "#7C3AED",
    pink: "#FF0080",
  },
  brutalist: {
    yellow: "#FFE500",
    black: "#000000",
  },
}
```

### Background Gradients
```typescript
backgroundImage: {
  "hero-glow": "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15) 0%, rgba(0, 0, 0, 0) 50%)",
  "aurora-gradient": "radial-gradient(at 40% 20%, #13FFAA 0px, transparent 50%), radial-gradient(at 80% 0%, #7C3AED 0px, transparent 50%), radial-gradient(at 0% 50%, #FF0080 0px, transparent 50%)",
}
```

### Custom Shadows
```typescript
boxShadow: {
  "glow-lime": "0 0 80px rgba(209, 248, 14, 0.35)",
  "glow-aurora": "0 0 80px rgba(124, 58, 237, 0.35)",
  brutalist: "10px 16px 0px 0px #000000",
}
```

### Custom Border Radius
```typescript
borderRadius: {
  "4xl": "2rem",
}
```

---

## CSS Component Classes

### Section Layout
```css
.minimalist-section {
  padding: clamp(40px, 8vw, 120px) clamp(16px, 4vw, 48px);
  max-width: 1200px;
  margin: 0 auto;
}
```

### Glassmorphism Card (Dark Mode)
```css
.glass-card {
  background: rgba(15, 15, 15, 0.65);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
}
```

### Brutalist Card
```css
.brutalist-card {
  background: #FFE500;
  border: 6px solid #000000;
  box-shadow: 10px 16px 0px 0px #000000;
  border-radius: 0;
}
```

### Minimalist Card
```css
.minimalist-card {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
```

### Aurora Background
```css
.aurora-bg {
  background-color: #020617;
  background-image:
    radial-gradient(at 40% 20%, #13FFAA 0px, transparent 50%),
    radial-gradient(at 80% 0%, #7C3AED 0px, transparent 50%),
    radial-gradient(at 0% 50%, #FF0080 0px, transparent 50%);
}
```

### Hero Layouts
```css
.hero-full {
  min-height: 100vh;
  display: grid;
  place-items: center;
}

.hero-split {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: clamp(32px, 5vw, 64px);
  align-items: center;
}
```

### CTA Buttons
```css
.cta-primary {
  /* Base: rounded-full, px-6, py-3, font-semibold */
  min-height: 44px;
}

.cta-primary--lime {
  /* Lime glow button with box-shadow: 0 0 80px rgba(209, 248, 14, 0.35) */
}

.cta-primary--dark {
  /* Dark neutral button */
}

.cta-primary--aurora {
  /* Gradient button: from-[#13FFAA] via-[#7C3AED] to-[#FF0080] */
}

.cta-secondary {
  /* Ghost/outline button with border border-white/20 */
}
```

### Navigation
```css
.nav-sticky {
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(16px);
  background: rgba(5, 5, 5, 0.75);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.nav-light {
  background: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.nav-scrolled {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7);
}
```

### Section Backgrounds
```css
.section-dark     { background: #050505; color: white; }
.section-light    { background: #ffffff; color: #171717; }
.section-brutalist { background: #f5f5f5; color: #000000; }
.section-aurora   { /* Aurora gradient with 15% opacity colors */ }
```

---

## Tone Types (Content Generation)

Available tones for content generation:
- `professional`
- `educational`
- `inspiring`
- `mission-driven`
- `energetic`
- `friendly`
- `corporate`
- `persuasive`
- `welcoming`
- `personal`
- `casual`

---

## Hero Layout Types

| Layout | Description |
|---|---|
| `split` | Two-column layout with visual/mockup on the right |
| `full` | Full-width centered content, focus on messaging |

### Use Case Hero Layout Defaults

| Use Case | Hero Layout |
|---|---|
| `online-course` | `split` (Show course preview/mockup) |
| `saas` | `split` (Show product screenshot) |
| `service` | `full` (Focus on messaging) |
| `event` | `full` (Focus on event details) |
| `community` | `full` (Focus on community value prop) |
| `nonprofit` | `full` (Focus on mission) |
| `hiring` | `full` (Focus on role description) |
| `newsletter` | `full` (Simple lead capture focus) |
| `ecommerce` | `split` (Show product imagery) |
| `mobile-app` | `split` (Show app mockup) |
| `local-business` | `full` (Focus on welcome message) |
| `portfolio` | `split` (Show work samples) |
| `link-in-bio` | `full` (Minimal, link-focused) |
| `template-resource` | `split` (Show resource preview) |

---

## Visual Styles Detail

### 1. Sana Dark + Glass
- **Theme**: Dark mode with neon lime accent
- **Typography**: Serif, normal weight, spacious layout
- **Border Radius**: Large (lg)
- **Key Colors**: `#050505` background, `#D1F80E` lime accent
- **Effect**: Glassmorphism with `backdrop-filter: blur(12px)`

### 2. Minimalist
- **Theme**: Light, high whitespace, clean aesthetic
- **Typography**: Sans-serif, light weight, spacious layout
- **Border Radius**: Medium (md)
- **Key Colors**: White background, neutral grays

### 3. Brutalist
- **Theme**: Bold, harsh, high contrast
- **Typography**: Sans-serif uppercase, bold weight, compact layout
- **Border Radius**: None
- **Key Colors**: `#FFE500` yellow, pure black
- **Effect**: Thick borders, hard shadows `10px 16px 0px 0px #000000`

### 4. Aurora Gradient
- **Theme**: Colorful gradients on dark background
- **Typography**: Serif, normal weight, comfortable layout
- **Border Radius**: Large (lg)
- **Key Colors**: `#13FFAA` teal, `#7C3AED` purple, `#FF0080` pink

### 5. Enterprise Slate
- **Theme**: Professional B2B blue-gray
- **Typography**: Sans-serif, normal weight, comfortable layout
- **Border Radius**: Large (lg)
- **Key Colors**: Slate tones, blue-600 accent

### 6. Playful Pastel
- **Theme**: Soft, friendly pastels
- **Typography**: Sans-serif, bold weight, comfortable layout
- **Border Radius**: Full (pill shapes)
- **Key Colors**: Pink/purple/cyan gradient backgrounds

### 7. Cyber Neon
- **Theme**: Futuristic cyberpunk
- **Typography**: Sans-serif, bold weight, compact layout
- **Border Radius**: Small (sm)
- **Key Colors**: `#0a0a0f` dark, `#00ffff` cyan neon
- **Effect**: Neon glow shadows, grid overlay

### 8. Editorial Serif
- **Theme**: Magazine-style editorial
- **Typography**: Serif, light weight, spacious layout
- **Border Radius**: None
- **Key Colors**: Warm off-white `#faf9f7`, charcoal `#1a1a1a`

### 9. Product Spotlight
- **Theme**: E-commerce product focus
- **Typography**: Sans-serif, bold weight, comfortable layout
- **Border Radius**: Large (lg)
- **Key Colors**: Neutral-100 background, orange-600 accent
- **Effect**: Large shadows, card hover lift

### 10. Retro Terminal
- **Theme**: Terminal/hacker aesthetic
- **Typography**: Monospace, bold weight, compact layout
- **Border Radius**: None
- **Key Colors**: `#0c0c0c` black, `#33ff33` matrix green
- **Effect**: Neon green glow, uppercase text
