// Sync Heath defaults
// Inspired by eslint-config-react-app
// Inspired by https://github.com/airbnb/javascript
// Adapted for TypeScript and Prettier

// FIX-DEPENDENCIES
require.resolve('eslint')
require.resolve('eslint-config-airbnb')
require.resolve('eslint-config-prettier')
require.resolve('eslint-plugin-prettier')
require.resolve('eslint-plugin-react')
require.resolve('eslint-plugin-react-hooks')
require.resolve('@typescript-eslint/parser')
require.resolve('@typescript-eslint/eslint-plugin')
require.resolve('eslint-plugin-import')
require.resolve('eslint-plugin-jsx-a11y')
require.resolve('prettier')

const fs = require('fs')
const path = require('path')

let prettierrc
try {
  prettierrc = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, './.prettierrc'))
  )
} catch (ex) {
  console.error(`Error parsing .prettierrc ${ex.message}`)
  process.exit(1)
}

// The ESLint browser environment defines all browser globals as valid,
// even though most people don't know some of them exist (e.g. `name` or `status`).
// This is dangerous as it hides accidentally undefined variables.
// We blacklist the globals that we deem potentially confusing.
// To use them, explicitly reference them, e.g. `window.name` or `window.status`.

const restrictedGlobals = require('confusing-browser-globals')

module.exports = {
  root: true,

  extends: [
    'plugin:react/recommended',
    'airbnb',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],

  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts']
      }
    }
  },

  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    warnOnUnsupportedTypeScriptVersion: true
  },

  plugins: [
    '@typescript-eslint',
    'jsx-a11y',
    'react',
    'react-hooks',
    'prettier'
  ],

  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },

  // NOTE: When adding rules here, you need to make sure they are compatible with
  // `typescript-eslint`, as some rules such as `no-array-constructor` aren't compatible.
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],
    'prettier/prettier': ['error', prettierrc],
    'no-restricted-globals': ['error'].concat(restrictedGlobals),
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'max-classes-per-file': 0,
    'import/extensions': 0,
    '@typescript-eslint/no-use-before-define': 0,
    'no-param-reassign': 0,
    '@typescript-eslint/no-explicit-any': 0,
    'import/no-extraneous-dependencies': 0,
    'no-underscore-dangle': 0,
    'no-console': 0,
    curly: ['error', 'all'],
    '@typescript-eslint/member-delimiter-style': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    radix: 0,
    'no-plusplus': 0,
    'import/no-unresolved': 0,
    'import/prefer-default-export': 0,
    'class-methods-use-this': 0,
    'no-shadow': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    'global-require': 0,
    'import/no-dynamic-require': 0,
    '@typescript-eslint/no-var-requires': 0,
    'no-nested-ternary': 0,
    'react/prop-types': 0,
    'react/jsx-props-no-spreading': 0,
    'react/jsx-indent-props': 0,
    'react/jsx-indent': 0,
    'react/destructuring-assignment': 0,
    'react/jsx-curly-newline': 0,
    'react/static-property-placement': 0,
    'react/no-children-prop': 0,
    'react/jsx-one-expression-per-line': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    'global-require': 0,
    'import/no-dynamic-require': 0,
    '@typescript-eslint/no-var-requires': 0,
    'react/style-prop-object': 0,
    'react/jsx-one-expression-per-line': 0,
    'react/jsx-wrap-multilines': 0,
    'no-nested-ternary': 0,
    'react/jsx-pascal-case': 0,
    'react/jsx-fragments': 0,
    'react/jsx-first-prop-new-line': 0,
    'react/jsx-max-props-per-line': 0,
    'react/require-default-props': 0
  }
}
