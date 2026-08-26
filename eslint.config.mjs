// eslint-config-next 16 から flat config が直接エクスポートされるようになったため、
// FlatCompat（next lint 時代の互換レイヤー）を廃止して直接 import する。
// 実行は `pnpm lint`（= eslint .）。Next 16 で `next lint` は廃止された。
import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // Next 16 で追加された新ルール。effect 内での状態リセット（タイプライター演出等の
      // 実績あるパターン）まで一律エラーにするため、既存方針に合わせて警告へ緩和
      'react-hooks/set-state-in-effect': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    ignores: ['.next/'],
  },
]

export default eslintConfig
