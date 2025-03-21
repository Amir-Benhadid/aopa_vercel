import { Layout } from '@/components/layout/Layout';
import { Providers } from '@/providers/Providers';
import { Inter } from 'next/font/google';
import './globals.css';

// Optimize font loading
const inter = Inter({
	subsets: ['latin'],
	display: 'swap', // Use font-display: swap
	preload: true,
	fallback: ['system-ui', 'sans-serif'],
});

// TODO: Implement dynamic metadata with i18n when server components support is available
export const metadata = {
	title: 'AOPA',
	description: 'Advancing eye care through research, education, and innovation',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<Providers>
					<Layout>{children}</Layout>
				</Providers>
			</body>
		</html>
	);
}
