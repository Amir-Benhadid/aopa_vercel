'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface FooterProps {
	className?: string;
}

export function Footer({ className }: FooterProps = {}) {
	const { t } = useTranslation();

	return (
		<footer className={cn('bg-gray-900 text-white py-12', className)}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div>
						<h3 className="text-lg font-semibold mb-4">
							{t('footer.aboutUs')}
						</h3>
						<p className="text-sm text-gray-400">
							{t('footer.aboutDescription')}
						</p>
					</div>
					<div>
						<h3 className="text-lg font-semibold mb-4">
							{t('footer.quickLinks')}
						</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href="/"
									className="text-sm text-gray-400 hover:text-white transition-colors"
								>
									{t('navigation.home')}
								</Link>
							</li>
							<li>
								<Link
									href="/archives/events"
									className="text-sm text-gray-400 hover:text-white transition-colors"
								>
									{t('navigation.events')}
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="text-lg font-semibold mb-4">
							{t('footer.followUs')}
						</h3>
						<div className="flex space-x-4">
							<a
								href="#"
								className="text-gray-400 hover:text-white transition-colors"
								aria-label={t('footer.twitter')}
							>
								<svg
									className="w-5 h-5"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 001.88-2.37 8.59 8.59 0 01-2.72 1.04 4.28 4.28 0 00-7.29 3.9A12.14 12.14 0 013 4.89a4.28 4.28 0 001.32 5.71 4.27 4.27 0 01-1.94-.54v.05a4.28 4.28 0 003.43 4.19 4.3 4.3 0 01-1.93.07 4.28 4.28 0 004 2.97A8.6 8.6 0 012 19.54a12.14 12.14 0 006.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.38-.01-.57A8.72 8.72 0 0024 4.56a8.59 8.59 0 01-2.54.7z" />
								</svg>
							</a>
							<a
								href="#"
								className="text-gray-400 hover:text-white transition-colors"
								aria-label={t('footer.github')}
							>
								<svg
									className="w-5 h-5"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 4.41 2.87 8.15 6.84 9.49.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.56 9.56 0 012.5-.34c.85 0 1.7.11 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0022 12c0-5.5-4.46-9.96-9.96-9.96z" />
								</svg>
							</a>
						</div>
					</div>
				</div>
				<div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
					{t('footer.copyright', { year: new Date().getFullYear() })}
				</div>
			</div>
		</footer>
	);
}
