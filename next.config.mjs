/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	transpilePackages: ['framer-motion'],
	output: 'export',
	exportTrailingSlash: true,
	images: {
		unoptimized: true,
	},
};

export default nextConfig;
