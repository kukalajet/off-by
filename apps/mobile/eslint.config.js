// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // eslint-plugin-react's auto-detect can't resolve react under pnpm's strict
    // node_modules layout — pin it (keep in sync with the react dependency).
    settings: {
      react: { version: '19.2' },
    },
  },
  {
    ignores: ['dist/*', '.expo/*'],
  },
]);
