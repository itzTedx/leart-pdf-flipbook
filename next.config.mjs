/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // You may not need this, it's just to support moduleResolution: 'node16'
    extensionAlias: {
      '.js': ['.tsx', '.ts', '.jsx', '.js'],
    },
    esmExternals: 'loose', // required for the canvas to work
    turbo: {
      resolveAlias: {
        // Turbopack does not support standard ESM import paths yet
        './Sample.js': './src/app/FlipBook.tsx',
        /**
         * Critical: prevents " ⨯ ./node_modules/canvas/build/Release/canvas.node
         * Module parse failed: Unexpected character '�' (1:0)" error
         */
        canvas: './empty-module.ts',
      },
    },
  },
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: 'canvas' }] // required for the canvas to work
    return config
  },
  /**
   * Critical: prevents ''import', and 'export' cannot be used outside of module code" error
   * See https://github.com/vercel/next.js/pull/66817
   */
  // swcMinify: false,

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
