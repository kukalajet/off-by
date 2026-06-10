/**
 * Design tokens — ported 1:1 from the Figma file's local variables and text
 * styles (file IF3p3StFTA7FJniCWh7jaL, pulled 2026-06-10). Don't invent values
 * here: change them in Figma first, then mirror. The tokens gallery screen
 * (/tokens) is the side-by-side contract.
 */

export const colors = {
  bg: {
    base: '#0a0b0f',
    surface: '#15171f',
  },
  text: {
    primary: '#f4f6fa',
    secondary: '#9aa2b0',
    muted: '#5b6170',
    onAccent: '#04231a',
  },
  stroke: {
    subtle: '#262b38',
  },
  tier: {
    bullseye: '#ffd24a',
    insane: '#ff5c8a',
    great: '#34e0a0',
    good: '#4da3ff',
    close: '#ff9f45',
    miss: '#8a8f98',
  },
  coin: '#ffc95c',
  /** Figma `color/danger` — alias of tier/insane. */
  danger: '#ff5c8a',
} as const;

export const space = {
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  48: 48,
  64: 64,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
  card: 20,
} as const;

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
} as const;

/**
 * Figma text styles. Letter-spacing/line-height are percent in Figma —
 * converted to points here (RN units).
 */
export const typography = {
  /** Figma `Overline` — Semi Bold 13, ls +10%, lh 120% */
  overline: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    letterSpacing: 1.3,
    lineHeight: 15.6,
  },
  /** Figma `Body` — Regular 15, lh 140% */
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    letterSpacing: 0,
    lineHeight: 21,
  },
  /** Figma `Tier/Label` — Bold 14, ls +8%, lh 100% */
  tierLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    letterSpacing: 1.12,
    lineHeight: 14,
  },
  /** Figma `Hero/Delta` — Extra Bold 92, ls −3%, lh 100% */
  heroDelta: {
    fontFamily: fontFamily.extraBold,
    fontSize: 92,
    letterSpacing: -2.76,
    lineHeight: 92,
  },
  /** Figma `Time/Label` — Medium 12, ls +8%, lh 100% */
  timeLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    letterSpacing: 0.96,
    lineHeight: 12,
  },
  /** Figma `Time/Value` — Semi Bold 24, ls −1%, lh 120% */
  timeValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: 24,
    letterSpacing: -0.24,
    lineHeight: 28.8,
  },
  /** Figma `Coin/Value` — Bold 20, lh 120% */
  coinValue: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    letterSpacing: 0,
    lineHeight: 24,
  },
  /** Figma `Button/Primary` — Bold 18, lh 120% */
  buttonPrimary: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    letterSpacing: 0,
    lineHeight: 21.6,
  },
  /** Figma `Button/Secondary` — Semi Bold 16, lh 120% */
  buttonSecondary: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 19.2,
  },
  /** Figma `Title/Screen` — Extra Bold 34, ls −2%, lh 100% */
  titleScreen: {
    fontFamily: fontFamily.extraBold,
    fontSize: 34,
    letterSpacing: -0.68,
    lineHeight: 34,
  },
  /** Figma `Run/Tap Cue` — Extra Bold 30, ls +2%, lh 100% */
  runTapCue: {
    fontFamily: fontFamily.extraBold,
    fontSize: 30,
    letterSpacing: 0.6,
    lineHeight: 30,
  },
  /** Figma `Display/Value` — Extra Bold 56, ls −2%, lh 100% */
  displayValue: {
    fontFamily: fontFamily.extraBold,
    fontSize: 56,
    letterSpacing: -1.12,
    lineHeight: 56,
  },
  /** Figma `Display/Hero` — Extra Bold 64, ls −2%, lh 100% */
  displayHero: {
    fontFamily: fontFamily.extraBold,
    fontSize: 64,
    letterSpacing: -1.28,
    lineHeight: 64,
  },
  /** Figma `Display/Score` — Extra Bold 72, ls −2%, lh 100% */
  displayScore: {
    fontFamily: fontFamily.extraBold,
    fontSize: 72,
    letterSpacing: -1.44,
    lineHeight: 72,
  },
} as const;
