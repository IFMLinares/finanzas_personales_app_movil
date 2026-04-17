const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Habilitar soporte para exports en package.json (Vital para TanStack Query v5+)
config.resolver.unstable_enablePackageExports = true;

// Asegurar soporte para extensiones mjs
config.resolver.sourceExts.push('mjs');

module.exports = withNativeWind(config, { 
  input: path.resolve(__dirname, "./global.css") 
});
