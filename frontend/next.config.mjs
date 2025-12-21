import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",       // Service worker public folder me jayega
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development", // Dev mode me PWA band rakhenge
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aapka existing config yahan rahega (agar koi hai)
  // images: { domains: [...] }, 
};

export default nextConfig; // withPWA(nextConfig);