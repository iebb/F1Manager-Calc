import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
};

// Lets `next dev` access Cloudflare bindings (KV, etc.) locally.
initOpenNextCloudflareForDev();

export default nextConfig;
