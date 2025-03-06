const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const nodeLibs = require('node-libs-react-native');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: [
      ...getDefaultConfig(__dirname).resolver.assetExts, // Include default extensions
      'tflite', // Add support for .tflite files
      'bin',    // Optional: Add support for .bin files if needed
      'json',   // Optional: Add support for .json files if needed
    ],
    extraNodeModules: {
      // Polyfill Node.js core modules
      ...nodeLibs,
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);   