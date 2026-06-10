/**
 * Composes two resolvers jest can only take one of:
 * - react-native-worklets' jest resolver behavior (strip `.native` extensions
 *   for worklets imports so its JS — not native-runtime — build loads in
 *   tests; without it even reanimated's official mock throws WorkletsError)
 * - the @react-native resolver that jest-expo's preset normally installs.
 */
const rnResolver = require('@react-native/jest-preset/jest/resolver.js');

module.exports = (request, options) => {
  if (
    options.basedir.includes('react-native-worklets') ||
    request.includes('react-native-worklets')
  ) {
    options = {
      ...options,
      extensions: options.extensions?.filter((ext) => !ext.includes('native')),
    };
  }
  return rnResolver(request, options);
};
