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
    'import/order': 0,
    'no-unused-vars': 1,
    'prettier/prettier': ['error', { singleQuote: true, endOfLine: 'auto' }]
  }
};
