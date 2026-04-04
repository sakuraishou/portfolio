import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const globalMedia = path.join(__dirname, 'src/app/(frontend)/_styles/custom-media.css')
const mixinsPath = path.join(__dirname, 'src/app/(frontend)/_styles/mixins.css')

const config = {
  plugins: {
    'postcss-import': {},
    '@csstools/postcss-global-data': {
      files: [globalMedia],
    },
    'postcss-mixins': {
      mixinsFiles: [mixinsPath],
    },
    /* ネストより先に custom-media を展開（@media (--md) 内の & を正しく処理する） */
    'postcss-custom-media': {},
    'postcss-nested': {},
  },
}

export default config
