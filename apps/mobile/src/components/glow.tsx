import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

interface GlowProps {
  /** Diameter of the solid disc in Figma (before blur), in px. */
  size: number;
  /** Figma layer-blur radius — sets how far the falloff extends. */
  blur: number;
  color: string;
  opacity: number;
  /** Optional ellipse height (Figma's floor glows are wider than tall). */
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * The glow primitive (PLAN §2): a blurred disc, approximated as a radial
 * gradient — RN has no layer blur, and a gradient renders identically at a
 * fraction of the cost. Used by Run's 3-layer ambient field, Reveal's tier
 * bloom, and the START floor glow.
 */
export function Glow({ size, blur, color, opacity, height, style }: GlowProps) {
  const w = size + blur * 2;
  const h = (height ?? size) + blur * 2;
  // Inside this offset the disc is solid; past it the blur falls off.
  const solidStop = Math.max(0, (size / 2 - blur) / (size / 2 + blur));
  const midStop = solidStop + (1 - solidStop) * 0.5;
  const id = `glow-${color.replace(/[^a-zA-Z0-9]/g, '')}-${size}-${blur}`;

  return (
    <Svg width={w} height={h} style={[{ pointerEvents: 'none' }, style]}>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset={String(solidStop)} stopColor={color} stopOpacity={opacity * 0.92} />
          <Stop offset={String(midStop)} stopColor={color} stopOpacity={opacity * 0.4} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill={`url(#${id})`} />
    </Svg>
  );
}
