module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    'browser': true
  },
  rules: {
    '@typescript-eslint/no-parameter-properties': 'off',
    'semi': ["error", "always"],
    'comma-dangle': ['error', 'always-multiline'],
  }
};
