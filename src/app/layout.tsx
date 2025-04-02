import { Layout } from '@/components/layout/Layout';
import { Providers } from '@/providers/Providers';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	preload: true,
	fallback: ['system-ui', 'sans-serif'],
});

export const metadata = {
	title: 'AOPA',
	description: 'Advancing eye care through research, education, and innovation',
	keywords: 'eye care, ophthalmology, research, education, innovation',
	icons: {
		icon: '/logo/logo-sm.svg',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script src="https://unpkg.com/react-scan/dist/auto.global.js" />
			</head>
			<body className={inter.className}>
				<Providers>
					<Layout>{children}</Layout>
				</Providers>
			</body>
		</html>
	);
}
