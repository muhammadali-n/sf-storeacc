/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
    images: {
        domains: ['cdn.shopify.com',"localhost",'cdn.sanity.io'],
      },
};

export default nextConfig;
