import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Off By',
  slug: 'off-by',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'offby',
  userInterfaceStyle: 'dark',
  backgroundColor: '#0a0b0f',
  // App identity (Phase 2): exported from the Figma App Icon masters —
  // 296:224 (full-bleed) and 303:224 (Android adaptive foreground).
  icon: './assets/images/icon.png',
  ios: {
    bundleIdentifier: 'com.kukalajet.offby',
    supportsTablet: false,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.kukalajet.offby',
    adaptiveIcon: {
      backgroundColor: '#0a0b0f',
      foregroundImage: './assets/images/android-icon-foreground.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  owner: 'kukalajet',
  runtimeVersion: {
    policy: 'fingerprint',
  },
  updates: {
    url: 'https://u.expo.dev/0e5404dc-8909-4a45-8c48-dc16386ffd78',
  },
  extra: {
    eas: {
      projectId: '0e5404dc-8909-4a45-8c48-dc16386ffd78',
    },
  },
  plugins: [
    'expo-router',
    'react-native-edge-to-edge',
    'expo-audio',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#0a0b0f',
        image: './assets/images/splash-icon.png',
        imageWidth: 120,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
