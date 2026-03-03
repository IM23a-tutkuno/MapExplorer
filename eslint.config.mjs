export default (async () => {
  const tsParser = await import('@typescript-eslint/parser');
  const react = await import('eslint-plugin-react');
  const tsPlugin = await import('@typescript-eslint/eslint-plugin');
  const reactHooks = await import('eslint-plugin-react-hooks');
  const prettierConfig = await import('eslint-config-prettier');

  return [
    {
      ignores: ['node_modules/**', 'dist/**', '.next/**', 'out/**'],
    },
    {
      files: ['**/*.{ts,tsx,js,jsx,cjs,mjs}'],
      languageOptions: {
        parser: tsParser.default,
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: { jsx: true },
        },
      },
      plugins: {
        react: react.default,
        '@typescript-eslint': tsPlugin.default,
        'react-hooks': reactHooks.default,
      },
      rules: {
        'react/react-in-jsx-scope': 'off',
        semi: ['error', 'always'],
        quotes: ['error', 'single'],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
    prettierConfig.default,
  ];
})();
