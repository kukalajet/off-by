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
  icon: './assets/images/icon.png',
  ios: {
    icon: './assets/expo.icon',
    bundleIdentifier: 'com.kukalajet.offby',
    supportsTablet: false,
  },
  android: {
    package: 'com.kukalajet.offby',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  owner: 'jetonatssg',
  runtimeVersion: {
    policy: 'fingerprint',
  },
  updates: {
    url: 'https://u.expo.dev/98a1be95-0fa9-486a-9cc6-63073eae7ecd',
  },
  extra: {
    eas: {
      projectId: '98a1be95-0fa9-486a-9cc6-63073eae7ecd',
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
        android: {
          image: './assets/images/splash-icon.png',
          imageWidth: 76,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
