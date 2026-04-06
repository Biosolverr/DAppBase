/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
        'pino-pretty': false,
        fs: false,
        net: false,
        tls: false,
        encoding: false,
      }
    }
    return config
  },
  // Отключаем строгую типизацию при сборке (временное решение)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Отключаем линтинг при сборке
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
