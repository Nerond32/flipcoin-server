module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    jest: true,
    jasmine: true
  },
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'airbnb-base', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 2019
  },
  rules: {
    quotes: ['error', 'single'],
    'no-unused-vars': 'warn',
    'prettier/prettier': ['error', { singleQuote: true, endOfLine: 'auto' }]
  }
};
