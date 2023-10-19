module.exports = {
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: [
    'no-relative-import-paths',
    '@kalimahapps/eslint-plugin-tailwind',
    'unused-imports',
  ],
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    'plugin:tailwindcss/recommended',
  ],
  rules: {
    // override/add rules settings here, such as:
    // 'vue/no-unused-vars': 'error'
    'comma-dangle': ['error', {
      'arrays': 'always',
      'objects': 'always',
      'imports': 'always',
      'exports': 'always',
      'functions': 'never',
    },],
    'no-relative-import-paths/no-relative-import-paths': [
      'error',
      {
        prefix: '@',
      },
    ],
    'tailwindcss/no-custom-classname': ['error', {
      'whitelist': [
        'bi(-.*)?',
        'vws(-.*)?',
      ],
    },],
    'indent': ['error', 4,],
    'semi': ['error', 'never',],
    'space-before-function-paren': ['error', 'always',],
    'array-bracket-spacing': ['error', 'always',],
    'space-infix-ops': ['error', {int32Hint: false, },],
    'arrow-parens': 'error',
    'quotes': ['error', 'single',],
    'vue/html-indent': [
      'error',
      4,
      {
        ignores: ['noscript',],
      },
    ],
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
    'sort-imports': [
      'error',
      {
        ignoreDeclarationSort: true,
      },
    ],
    '@kalimahapps/tailwind/multiline': [
      'error',
      {
        maxLen: 120,
        quotesOnNewLine: true,
      },
    ],
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
}
