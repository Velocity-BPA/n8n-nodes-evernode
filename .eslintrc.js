module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'n8n-nodes-base'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    node: true,
    es2021: true,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'n8n-nodes-base/node-class-description-credentials-name-unsuffixed': 'off',
    'n8n-nodes-base/node-class-description-display-name-unsuffixed-trigger-node': 'off',
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js'],
};
