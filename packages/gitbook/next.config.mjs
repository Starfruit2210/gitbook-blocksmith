// next.config.mjs
// @ts-check

/** @type {import('next').NextConfig} */
const DOCS_ORIGIN = process.env.DOCS_ORIGIN ?? 'https://gitbook.com';

const nextConfig = {
  experimental: {
    authInterrupts: true,
    useCache: true,
    staleTimes: { dynamic: 3600, static: 3600 },
    optimisticClientCache: false,
  },

  env: {
    BUILD_VERSION: (process.env.GITHUB_SHA ?? '').slice(0, 7),
    GITBOOK_API_URL: process.env.GITBOOK_API_URL,
    GITBOOK_APP_URL: process.env.GITBOOK_APP_URL,
    GITBOOK_INTEGRATIONS_HOST: process.env.GITBOOK_INTEGRATIONS_HOST,
    GITBOOK_IMAGE_RESIZE_URL: process.env.GITBOOK_IMAGE_RESIZE_URL,
    GITBOOK_ICONS_URL: process.env.GITBOOK_ICONS_URL,
    GITBOOK_ICONS_TOKEN: process.env.GITBOOK_ICONS_TOKEN,
    GITBOOK_URL: process.env.GITBOOK_URL,
    GITBOOK_API_TOKEN: process.env.GITBOOK_API_TOKEN,
    GITBOOK_ASSETS_PREFIX: process.env.GITBOOK_ASSETS_PREFIX,
    GITBOOK_SECRET: process.env.GITBOOK_SECRET,
    GITBOOK_IMAGE_RESIZE_SIGNING_KEY: process.env.GITBOOK_IMAGE_RESIZE_SIGNING_KEY,
    GITBOOK_IMAGE_RESIZE_MODE: process.env.GITBOOK_IMAGE_RESIZE_MODE,
    GITBOOK_FONTS_URL: process.env.GITBOOK_FONTS_URL,
    GITBOOK_RUNTIME: process.env.GITBOOK_RUNTIME,
    NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY,
    GITBOOK_V2: 'true',
  },

  assetPrefix: process.env.GITBOOK_ASSETS_PREFIX,
  poweredByHeader: false,

  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.gitbook.io' }],
  },

  async headers() {
    return [
      {
        source: '/~gitbook/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      // 🔁 /docs → proxy ke GitBook (URL di browser tetap /docs)
      { source: '/docs', destination: `${DOCS_ORIGIN}/docs` },
      { source: '/docs/:path*', destination: `${DOCS_ORIGIN}/docs/:path*` },

      // 🔁 Proxy aset GitBook biar ikon/css/skrip nggak 404
      { source: '/~gitbook/:path*', destination: `${DOCS_ORIGIN}/~gitbook/:path*` },
    ];
  },
};

export default nextConfig;
