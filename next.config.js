/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	images: {
		unoptimized: true, // ✅ Important: skip optimization since you're on cPanel
	},
};

module.exports = nextConfig;
