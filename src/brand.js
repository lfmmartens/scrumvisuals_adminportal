// ScrumVisuals Design System
export const BRAND = {
  // Backgrounds
  canvas: '#FAF8F5',
  sidebar: '#F5F2EE',
  card: '#FAF8F5',
  hover: '#F5F2EE',

  // Text
  ink: '#1A1A1A',
  muted: '#4A4A4A',
  faint: '#B8B0A8',

  // Accents
  terracotta: '#C4634F',
  teal: '#2A6B6B',
  sage: '#A8B8A0',
  amber: '#D4853B',
  green: '#5B8C5A',
  red: '#C44F4F',

  // Border
  border: '1px solid rgba(184,176,168,0.3)',
  borderLight: '1px solid rgba(184,176,168,0.15)',
  borderColor: 'rgba(184,176,168,0.3)',

  // Typography
  sans: "'DM Sans', -apple-system, sans-serif",
  serif: "'Playfair Display', Georgia, serif",
  mono: "'JetBrains Mono', monospace",

  // Radius
  radius: 12,
  radiusSm: 8,
  radiusXs: 4,
}

// Status colors
export const STATUS_COLORS = {
  active: '#5B8C5A',
  draft: '#D4853B',
  archived: '#C44F4F',
}

// Reusable style fragments
export const S = {
  btn: {
    fontFamily: BRAND.sans,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '7px 14px',
    borderRadius: BRAND.radiusSm,
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity 0.15s',
  },
  btnPrimary: {
    background: BRAND.terracotta,
    color: BRAND.canvas,
  },
  btnOutline: {
    background: 'transparent',
    color: BRAND.ink,
    border: `1.5px solid ${BRAND.ink}`,
  },
  btnGhost: (color) => ({
    background: color + '15',
    color: color,
    border: `1px solid ${color}33`,
  }),
  input: {
    fontFamily: BRAND.sans,
    background: BRAND.canvas,
    color: BRAND.ink,
    border: BRAND.border,
    borderRadius: BRAND.radiusSm,
    padding: '8px 12px',
    fontSize: 13,
    outline: 'none',
    width: '100%',
  },
  label: {
    fontFamily: BRAND.mono,
    fontSize: 10,
    color: BRAND.faint,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 4,
    display: 'block',
  },
  h1: {
    fontFamily: BRAND.serif,
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
  },
  h2: {
    fontFamily: BRAND.serif,
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    color: BRAND.muted,
    margin: '6px 0 0',
  },
}
