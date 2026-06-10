import { StyleSheet } from 'react-native-unistyles';

import { colors, fontFamily, radius, space, typography } from './tokens';

const dark = {
  colors,
  space,
  radius,
  fontFamily,
  typography,
} as const;

const breakpoints = {
  xs: 0,
  md: 768,
} as const;

type AppThemes = { dark: typeof dark };
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  themes: { dark },
  breakpoints,
  settings: {
    initialTheme: 'dark',
  },
});
