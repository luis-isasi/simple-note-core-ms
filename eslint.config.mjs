import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import jestPlugin from 'eslint-plugin-jest';

/** @type {import('eslint').Linter.Config[]} */
export default [
  globalIgnores(['node_modules/*', 'dist/*']),
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: { ...globals.browser, module: true } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'linebreak-style': ['error', 'unix'],
      'no-new': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.ts'],
    rules: { ...eslintConfigPrettier.rules },
  },
  {
    files: [
      '**/__tests__/**/*.{ts,js}',
      '**/*.test.{ts,js}',
      '**/*.spec.{ts,js}',
    ],
    plugins: { jest: jestPlugin },
    rules: { 'jest/expect-expect': 'warn' },
  },
];
