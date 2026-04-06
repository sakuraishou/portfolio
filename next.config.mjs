import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  output: 'standalone',
  /* Payload / db-postgres が参照する fast-copy の dist が standalone に取りこぼされる場合の保険 */
  outputFileTracingIncludes: {
    '**/*': ['./node_modules/fast-copy/**/*'],
  },

  //全SCSS ファイルの先頭に自動で追加するコード
  sassOptions: {
    prependData: `@use "@/app/(frontend)/_styles/index" as *;`,
  },

  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
