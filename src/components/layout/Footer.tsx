'use client';

import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function Footer() {
	const { t } = useTranslation();
	const currentYear = new Date().getFullYear();

	const footerSections = [
		{
			title: 'Association',
			links: [
				{ href: '/about', label: t('navigation.about') },
				{ href: '/team', label: 'Our Team' },
				{ href: '/history', label: 'History' },
				{ href: '/contact', label: t('navigation.contact') },
			],
		},
		{
			title: 'Resources',
			links: [
				{ href: '/congress', label: t('navigation.congress') },
				{ href: '/research', label: t('navigation.research') },
				{ href: '/education', label: t('navigation.education') },
				{ href: '/publications', label: 'Publications' },
			],
		},
		{
			title: 'Legal',
			links: [
				{ href: '/privacy', label: 'Privacy Policy' },
				{ href: '/terms', label: 'Terms of Use' },
				{ href: '/cookies', label: 'Cookie Policy' },
				{ href: '/accessibility', label: 'Accessibility' },
			],
		},
	];

	const socialLinks = [
		{
			name: 'Twitter',
			href: 'https://twitter.com',
			icon: (
				<svg
					className="h-6 w-6"
					fill="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
				</svg>
			),
		},
		{
			name: 'LinkedIn',
			href: 'https://linkedin.com',
			icon: (
				<svg
					className="h-6 w-6"
					fill="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
				</svg>
			),
		},
		{
			name: 'Facebook',
			href: 'https://facebook.com',
			icon: (
				<svg
					className="h-6 w-6"
					fill="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						fillRule="evenodd"
						d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
						clipRule="evenodd"
					/>
				</svg>
			),
		},
		{
			name: 'YouTube',
			href: 'https://youtube.com',
			icon: (
				<svg
					className="h-6 w-6"
					fill="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						fillRule="evenodd"
						d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
						clipRule="evenodd"
					/>
				</svg>
			),
		},
	];

	return (
		<footer className="bg-gray-50 border-t border-gray-200">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="xl:grid xl:grid-cols-3 xl:gap-8">
					<div className="space-y-8 xl:col-span-1">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
							className="flex items-center space-x-2"
						>
							<svg
								width="40"
								height="40"
								viewBox="0 0 40 40"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="text-primary"
							>
								<circle
									cx="20"
									cy="20"
									r="18"
									stroke="currentColor"
									strokeWidth="2"
								/>
								<circle
									cx="20"
									cy="20"
									r="10"
									stroke="currentColor"
									strokeWidth="2"
								/>
								<circle cx="20" cy="20" r="4" fill="currentColor" />
							</svg>
							<span className="text-xl font-bold">EAO</span>
						</motion.div>
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="text-base text-gray-500 max-w-xs"
						>
							Advancing eye care through research, education, and innovation
							since 1985.
						</motion.p>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="flex space-x-6"
						>
							{socialLinks.map((item) => (
								<a
									key={item.name}
									href={item.href}
									className="text-gray-400 hover:text-gray-500"
									target="_blank"
									rel="noopener noreferrer"
								>
									<span className="sr-only">{item.name}</span>
									{item.icon}
								</a>
							))}
						</motion.div>
					</div>
					<div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
						<div className="md:grid md:grid-cols-2 md:gap-8">
							{footerSections.slice(0, 2).map((section, index) => (
								<motion.div
									key={section.title}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
								>
									<h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
										{section.title}
									</h3>
									<ul className="mt-4 space-y-4">
										{section.links.map((link) => (
											<li key={link.label}>
												<Link
													href={link.href}
													className="text-base text-gray-500 hover:text-gray-900"
												>
													{link.label}
												</Link>
											</li>
										))}
									</ul>
								</motion.div>
							))}
						</div>
						<div className="md:grid md:grid-cols-2 md:gap-8">
							{footerSections.slice(2).map((section, index) => (
								<motion.div
									key={section.title}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
								>
									<h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
										{section.title}
									</h3>
									<ul className="mt-4 space-y-4">
										{section.links.map((link) => (
											<li key={link.label}>
												<Link
													href={link.href}
													className="text-base text-gray-500 hover:text-gray-900"
												>
													{link.label}
												</Link>
											</li>
										))}
									</ul>
								</motion.div>
							))}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: 0.6 }}
								className="mt-12 md:mt-0"
							>
								<h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
									Subscribe
								</h3>
								<p className="mt-4 text-base text-gray-500">
									Get the latest news and updates.
								</p>
								<form className="mt-4 sm:flex sm:max-w-md">
									<label htmlFor="email-address" className="sr-only">
										Email address
									</label>
									<input
										type="email"
										name="email-address"
										id="email-address"
										autoComplete="email"
										required
										className="w-full min-w-0 appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
										placeholder="Enter your email"
									/>
									<div className="mt-3 rounded-md sm:ml-3 sm:mt-0">
										<Button type="submit">Subscribe</Button>
									</div>
								</form>
							</motion.div>
						</div>
					</div>
				</div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.7 }}
					className="mt-12 border-t border-gray-200 pt-8"
				>
					<p className="text-base text-gray-400 xl:text-center">
						&copy; {currentYear} European Association of Ophthalmology. All
						rights reserved.
					</p>
				</motion.div>
			</div>
		</footer>
	);
}
