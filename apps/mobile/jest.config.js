/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  resolver: './jest.resolver.js',
  setupFiles: ['react-native-unistyles/mocks', './jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|react-native-unistyles|react-native-nitro-modules|react-native-edge-to-edge|react-native-mmkv|react-native-svg|@offby/.*))',
  ],
};
