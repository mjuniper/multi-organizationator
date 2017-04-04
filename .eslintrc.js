module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'eslint-config-semistandard'
  ],
  env: {
    browser: true
  },
  rules: {
    "comma-dangle": [2, "only-multiline"],
    "no-console": 0,
    "no-extra-boolean-cast": 0
  }
};
