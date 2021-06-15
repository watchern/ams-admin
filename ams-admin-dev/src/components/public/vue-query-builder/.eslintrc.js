module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/recommended',
    'eslint:recommended'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'poc' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'poc' ? 'error' : 'off',
    "vue/html-self-closing": ["warn", {
      "html": {
        "void": "never",
        "normal": "any",
        "component": "always"
      },
      "svg": "always",
      "math": "always"
    }]
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
