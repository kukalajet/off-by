import Svg, { Circle, Path, Rect } from 'react-native-svg';

/**
 * The icon set (PLAN §2 — chevrons land with Stats/Settings in Phase 2).
 * The Figma masters are baked vectors, so these are redrawn to match the
 * file's line-icon language: round caps, ~1.6px strokes at 23px for the
 * launcher, filled glyphs for buttons.
 */
interface IconProps {
  size?: number;
  color: string;
}

/** Figma `icon/chevron-left` — back affordance chevron, 20px. */
export function ChevronLeftIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Path
        d="M12.5 4.5 L7 10 L12.5 15.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/** Figma `icon/chevron-right` — forward/disclosure chevron, 18px. */
export function ChevronRightIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path
        d="M7 4.5 L11.5 9 L7 13.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/** Figma `icon/play` — start glyph for primary buttons, 15px. */
export function PlayIcon({ size = 15, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 15 15">
      <Path d="M4.5 2.6 L12.4 7.5 L4.5 12.4 Z" fill={color} />
    </Svg>
  );
}

/** Figma `icon/retry` — retry glyph for primary buttons, drawn at 18px. */
export function RetryIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path
        d="M15.5 9 A6.5 6.5 0 1 1 13.6 4.4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M13.9 1.4 L13.9 4.9 L10.4 4.9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

/** Figma share glyph (Reveal's light-stroke variant) — tray + up arrow, 18px. */
export function ShareIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path
        d="M4.5 8 H3.5 V15.5 H14.5 V8 H13.5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path d="M9 11 V2.2 M5.8 5.2 L9 2 L12.2 5.2" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

/** Figma `icon/flame` — streak flame, gold fill, 15px. */
export function FlameIcon({ size = 15, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 15 15">
      <Path
        d="M7.8 1.2 C8.3 3.2 10.9 4.3 11.4 7 C11.9 9.8 10 12.4 7.5 12.4 C5 12.4 3.2 10.4 3.6 7.9 C3.9 6.2 5 5.3 5.4 3.9 C6 4.6 6.4 5.2 6.5 6.1 C7.4 5 7.8 3 7.8 1.2 Z"
        fill={color}
      />
    </Svg>
  );
}

/** Home launcher — Modes: 2×2 grid of rounded tiles. */
export function ModesIcon({ size = 23, color }: IconProps) {
  const tile = (x: number, y: number) => (
    <Rect x={x} y={y} width={7} height={7} rx={2} stroke={color} strokeWidth={1.6} fill="none" />
  );
  return (
    <Svg width={size} height={size} viewBox="0 0 23 23">
      {tile(3.5, 3.5)}
      {tile(12.5, 3.5)}
      {tile(3.5, 12.5)}
      {tile(12.5, 12.5)}
    </Svg>
  );
}

/** Home launcher — Stats: ascending bars. */
export function StatsIcon({ size = 23, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 23 23">
      <Path d="M5.5 18.5 V13" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M11.5 18.5 V8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M17.5 18.5 V4.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

/** Home launcher — Shop: bag with handle. */
export function ShopIcon({ size = 23, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 23 23">
      <Path
        d="M5.5 7.5 H17.5 L16.6 18.2 A1.5 1.5 0 0 1 15.1 19.5 H7.9 A1.5 1.5 0 0 1 6.4 18.2 Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
        fill="none"
      />
      <Path d="M8.5 9.5 V6.5 A3 3 0 0 1 14.5 6.5 V9.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** Home launcher — Settings: slider rails with offset knobs. */
export function SettingsIcon({ size = 23, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 23 23">
      <Path d="M3.5 7.5 H11.1 M17.9 7.5 H19.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx={14.5} cy={7.5} r={2.6} stroke={color} strokeWidth={1.6} fill="none" />
      <Path d="M3.5 15.5 H5.1 M11.9 15.5 H19.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx={8.5} cy={15.5} r={2.6} stroke={color} strokeWidth={1.6} fill="none" />
    </Svg>
  );
}
