import mantine from 'eslint-config-mantine';
import tseslint from 'typescript-eslint';
import pluginNext from '@next/eslint-plugin-next'

export default tseslint.config(
  ...mantine,
  { ignores: ['**/*.{mjs,cjs,js,d.ts,d.mts}', './.storybook/main.ts', '.next/*'] },
  {
    files: [['**/*.ts', '**/*.tsx']],
    rules: {  ...pluginNext.configs.recommended.rules },
    plugins: {
      '@next/next': pluginNext
    }
  }
);


