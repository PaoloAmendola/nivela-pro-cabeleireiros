import nextPWA from "next-pwa";

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add other Next.js configurations here if needed
};

// Configuration for PWA
const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Disable PWA in development for faster builds
  // Add other PWA options here
});

export default withPWA(nextConfig);

