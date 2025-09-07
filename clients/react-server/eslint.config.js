// @ts-check
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-plugin-prettier';
import jsdoc from 'eslint-plugin-jsdoc';

/** @type {import('eslint').Linter.Config[]} */
// @ts-ignore
export default [
  // Ignore build artifacts and config
  { ignores: ['dist/**', 'node_modules/**', 'eslint.config.js'] },

  // Base JS config
  js.configs.recommended,

  // TypeScript + React config
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.eslint.json'],
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react: reactPlugin,
      'react-hooks': reactHooks,
      prettier,
      jsdoc,
    },
    settings: {
      react: { version: 'detect' },
      jsdoc: { mode: 'typescript' },
    },
    rules: {
      // Prettier
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
      // Rely on TS for undefined names in TS files
      'no-undef': 'off',

      // React 19
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Hooks
      ...reactHooks.configs.recommended.rules,

      // JSDoc strictness on declared functions (not inline callbacks)
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: false,
          contexts: [
            'FunctionDeclaration',
            'ClassDeclaration',
            'MethodDefinition',
            'VariableDeclaration > VariableDeclarator > ArrowFunctionExpression',
            'VariableDeclaration > VariableDeclarator > FunctionExpression',
          ],
        },
      ],
      'jsdoc/check-param-names': 'error',
      'jsdoc/require-param': ['error', { checkDestructured: false }],
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns': ['error', { checkConstructors: false }],
      'jsdoc/require-returns-description': 'error',
      'jsdoc/require-returns-type': 'off',
      'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],

      // TS strictness (light; can tighten later)
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],

      // Enforce const arrow functions instead of function declarations
      'prefer-arrow-callback': 'error',
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],

      // Enforce maximum of one parameter per function
      'max-params': ['error', 1],
    },
  },

  // Plain JS files (server, config files)
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
      },
    },
    plugins: { prettier, jsdoc },
    rules: {
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
      // JSDoc strictness on declared functions in JS
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: false,
          contexts: [
            'FunctionDeclaration',
            'ClassDeclaration',
            'MethodDefinition',
            'VariableDeclaration > VariableDeclarator > ArrowFunctionExpression',
            'VariableDeclaration > VariableDeclarator > FunctionExpression',
          ],
        },
      ],
      'jsdoc/check-param-names': 'error',
      'jsdoc/require-param': ['error', { checkDestructured: false }],
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-returns': ['error', { checkConstructors: false }],
      'jsdoc/require-returns-description': 'error',
      'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],
    },
  },

  // Definition files: relax unused-vars and docs
  {
    files: ['**/*.d.ts'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'jsdoc/require-jsdoc': 'off',
    },
  },
];
