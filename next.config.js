/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	output: 'standalone',
	transpilePackages: [
		'@mui/material',
		'@mui/system',
		'@mui/icons-material',
		'@emotion/react',
		'@emotion/styled',
	],
	modularizeImports: {
		'@mui/icons-material': {
			transform: '@mui/icons-material/{{member}}',
		},
		'@mui/material': {
			transform: '@mui/material/{{member}}',
		},
	},
	images: {
		domains: ['images.unsplash.com', 'picsum.photos'],
		remotePatterns: [
			{
				protocol: 'http',
				hostname: 'localhost',
			},
			{
				protocol: 'https',
				hostname: process.env.VERCEL_URL || 'localhost',
			},
		],
		unoptimized: true,
	},
	experimental: {
		// serverActions option removed since they are enabled by default.
	},
	serverRuntimeConfig: {
		cookieOptions: {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
		},
	},
	headers: async () => {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'Access-Control-Allow-Credentials',
						value: 'true',
					},
					{
						key: 'Access-Control-Allow-Origin',
						value: '*',
					},
					{
						key: 'Access-Control-Allow-Methods',
						value: 'GET,DELETE,PATCH,POST,PUT',
					},
					{
						key: 'Access-Control-Allow-Headers',
						value:
							'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
					},
				],
			},
		];
	},
};

module.exports = nextConfig;