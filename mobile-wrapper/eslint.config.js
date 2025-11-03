// https://docs.expo.dev/guides/using-eslint/
import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat';

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);
