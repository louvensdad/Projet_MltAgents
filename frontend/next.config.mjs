/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        cpus: 1,
        workerThreads: true,
        webpackBuildWorker: false,
    },
};
export default nextConfig;
