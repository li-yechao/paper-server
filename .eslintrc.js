module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: {
      tsconfigRootDir: __dirname,
      project: ['./packages/*/tsconfig.json'],
    },
  },
  plugins: ['@typescript-eslint'],
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  env: {
    node: true,
    jest: true,
    browser: true,
    es2021: true,
  },
  ignorePatterns: ['**/dist/**', '**/coverage/**'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
}
