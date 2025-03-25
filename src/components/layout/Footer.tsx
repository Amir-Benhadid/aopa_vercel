'use client';

import { Button } from '@/components/ui/Button';
import {
	AnimatePresence,
	motion,
	useScroll,
	useTransform,
} from 'framer-motion';
import { ArrowUpRight, Facebook, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Footer() {
	const { t } = useTranslation();
	const currentYear = new Date().getFullYear();
	const [email, setEmail] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [subscribeStatus, setSubscribeStatus] = useState<
		'idle' | 'success' | 'error'
	>('idle');
	const footerRef = useRef(null);
	const [inView, setInView] = useState(false);
	const router = useRouter();

	// Scroll position tracking
	useEffect(() => {
		const handleScroll = () => {
			if (footerRef.current) {
				const rect = (footerRef.current as HTMLElement).getBoundingClientRect();
				const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
				setInView(isVisible);
			}
		};

		window.addEventListener('scroll', handleScroll);
		handleScroll(); // Check initially

		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Parallax effect
	const { scrollYProgress } = useScroll({
		target: footerRef,
		offset: ['start end', 'end end'],
	});

	const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 30]);
	const backgroundOpacity = useTransform(
		scrollYProgress,
		[0, 0.5, 1],
		[0.6, 0.7, 0.8]
	);
	const patternScale = useTransform(scrollYProgress, [0, 1], [1.05, 1]);
	const patternOpacity = useTransform(
		scrollYProgress,
		[0, 0.5, 1],
		[0, 0.04, 0.08]
	);
	const patternRotate = useTransform(scrollYProgress, [0, 1], [0, 3]);

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.1,
			},
		},
		exit: {
			opacity: 0,
			transition: {
				staggerChildren: 0.05,
				staggerDirection: -1,
				when: 'afterChildren',
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { type: 'spring', stiffness: 100, damping: 20 },
		},
		exit: {
			y: -10,
			opacity: 0,
			transition: { type: 'spring', stiffness: 100, damping: 20 },
		},
	};

	const handleSubscribe = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email || !email.includes('@')) return;

		setIsSubmitting(true);

		// Simulate API call
		setTimeout(() => {
			setIsSubmitting(false);
			setSubscribeStatus('success');
			setEmail('');

			// Reset status after 3 seconds
			setTimeout(() => {
				setSubscribeStatus('idle');
			}, 3000);
		}, 1500);
	};

	// Only include links to pages that actually exist
	const mainLinks = [
		{ href: '/', label: t('navigation.home') },
		{ href: '/dashboard', label: t('navigation.dashboard') },
		{ href: '/profile', label: t('navigation.profile') },
		{ href: '/activities', label: t('navigation.activities') },
	];

	const resourceLinks = [
		{ href: '/archives', label: t('navigation.archives') },
		{ href: '/reports', label: t('navigation.reports') },
		{ href: '/sponsors', label: t('navigation.sponsors') },
		{ href: '/abstracts', label: t('navigation.abstracts') },
	];

	const contactInfo = [
		{
			icon: <Mail className="h-3 w-3" />,
			text: 'contact@aopa.dz',
		},
	];

	const socialLinks = [
		{
			icon: <Facebook className="h-4 w-4" />,
			href: 'https://www.facebook.com/people/Association-des-Ophtalmologistes-Priv%C3%A9s-Alg%C3%A9riens-AOPA/61571157902241/',
			label: 'Facebook',
		},
	];

	return (
		<footer
			ref={footerRef}
			className="relative overflow-hidden border-t border-gray-100 dark:border-gray-800 pt-12 pb-8 lg:pl-24"
		>
			{/* Parallax background */}
			<motion.div
				className="absolute inset-0 z-0"
				style={{ y: backgroundY, opacity: backgroundOpacity }}
			>
				<Image
					src="/images/hero-background.jpg"
					alt="Footer background"
					fill
					className="object-cover object-center opacity-[0.02] dark:opacity-[0.01]"
					priority={false}
				/>
			</motion.div>

			{/* Background pattern */}
			<motion.div
				className="absolute inset-0 z-0 opacity-5 dark:opacity-[0.025]"
				style={{
					scale: patternScale,
					rotate: patternRotate,
					opacity: patternOpacity,
				}}
			>
				<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<pattern
							id="footer-grid"
							width="40"
							height="40"
							patternUnits="userSpaceOnUse"
							patternTransform="rotate(5)"
						>
							<path
								d="M 0,20 L 40,20 M 20,0 L 20,40"
								stroke="currentColor"
								strokeWidth="0.5"
								className="text-primary-400 dark:text-primary-600"
							/>
						</pattern>
						<pattern
							id="footer-dots"
							width="20"
							height="20"
							patternUnits="userSpaceOnUse"
							patternTransform="rotate(10)"
						>
							<circle
								cx="2"
								cy="2"
								r="1"
								fill="currentColor"
								className="text-primary-300 dark:text-primary-700"
							/>
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill="url(#footer-grid)" />
					<rect width="100%" height="100%" fill="url(#footer-dots)" />
				</svg>
			</motion.div>

			<motion.div
				className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
				initial="hidden"
				animate={inView ? 'visible' : 'hidden'}
				exit="exit"
				variants={containerVariants}
				viewport={{ once: false, margin: '-100px' }}
			>
				{/* Top Section */}
				<motion.div
					className="flex flex-col items-center text-center mb-12"
					variants={itemVariants}
				>
					<motion.div
						className="w-28 h-28 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm bg-opacity-80 hover:cursor-pointer"
						whileHover={{ scale: 1.1 }}
						transition={{ type: 'spring', stiffness: 300, damping: 10 }}
						onClick={() => router.push('/')}
					>
						<Image
							src={`/logo/logo-sm.svg`}
							alt={t('app.logoAltWithNumber')}
							className="object-contain"
							priority
							fill
						/>
					</motion.div>
					<p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
						{t('app.footerDescription')}
					</p>
				</motion.div>

				{/* Middle Section - Grid Layout */}
				<div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-12 mb-16">
					{/* Navigation */}
					<motion.div
						className="sm:col-span-1 lg:col-span-3"
						variants={itemVariants}
					>
						<h3 className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
							{t('navigation.title')}
						</h3>
						<ul className="space-y-2">
							{mainLinks.map((link, index) => (
								<motion.li
									key={link.label}
									whileHover={{ x: 3 }}
									transition={{ type: 'spring', stiffness: 300 }}
									variants={{
										hidden: {
											x: -10,
											opacity: 0,
											transition: { delay: index * 0.05 },
										},
										visible: {
											x: 0,
											opacity: 1,
											transition: {
												delay: index * 0.1,
												type: 'spring',
												stiffness: 100,
											},
										},
										exit: {
											x: -10,
											opacity: 0,
											transition: { delay: index * 0.05 },
										},
									}}
								>
									<Link
										href={link.href}
										className="text-sm text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors duration-300 flex items-center group"
									>
										<span>{link.label}</span>
										<motion.span
											initial={{ x: -4, opacity: 0 }}
											whileHover={{ x: 0, opacity: 1 }}
											className="inline-block ml-1"
										>
											<ArrowUpRight className="h-3 w-3" />
										</motion.span>
									</Link>
								</motion.li>
							))}
						</ul>
					</motion.div>

					{/* Resources */}
					<motion.div
						className="sm:col-span-1 lg:col-span-3"
						variants={itemVariants}
					>
						<h3 className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
							{t('navigation.sections.resources')}
						</h3>
						<ul className="space-y-2">
							{resourceLinks.map((link, index) => (
								<motion.li
									key={link.label}
									whileHover={{ x: 3 }}
									transition={{ type: 'spring', stiffness: 300 }}
									variants={{
										hidden: {
											x: -10,
											opacity: 0,
											transition: { delay: index * 0.05 },
										},
										visible: {
											x: 0,
											opacity: 1,
											transition: {
												delay: index * 0.1 + 0.2,
												type: 'spring',
												stiffness: 100,
											},
										},
										exit: {
											x: -10,
											opacity: 0,
											transition: { delay: index * 0.05 },
										},
									}}
								>
									<Link
										href={link.href}
										className="text-sm text-gray-600 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors duration-300 flex items-center group"
									>
										<span>{link.label}</span>
										<motion.span
											initial={{ x: -4, opacity: 0 }}
											whileHover={{ x: 0, opacity: 1 }}
											className="inline-block ml-1"
										>
											<ArrowUpRight className="h-3 w-3" />
										</motion.span>
									</Link>
								</motion.li>
							))}
						</ul>
					</motion.div>

					{/* Contact Info */}
					<motion.div
						className="sm:col-span-1 lg:col-span-3"
						variants={itemVariants}
					>
						<h3 className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
							{t('navigation.sections.contact')}
						</h3>
						<ul className="space-y-2">
							{contactInfo.map((item, index) => (
								<motion.li
									key={index}
									className="text-sm text-gray-600 dark:text-gray-400 flex items-center"
									variants={{
										hidden: {
											x: -5,
											opacity: 0,
											transition: { delay: index * 0.05 },
										},
										visible: {
											x: 0,
											opacity: 1,
											transition: {
												delay: index * 0.1 + 0.3,
												type: 'spring',
												stiffness: 100,
											},
										},
										exit: {
											x: -5,
											opacity: 0,
											transition: { delay: index * 0.05 },
										},
									}}
								>
									<span className="text-gray-400 dark:text-gray-500 mr-2">
										{item.icon}
									</span>
									<span>{item.text}</span>
								</motion.li>
							))}
						</ul>

						<motion.div
							className="mt-4 flex space-x-3"
							variants={{
								hidden: { opacity: 0 },
								visible: { opacity: 1, transition: { delay: 0.5 } },
								exit: { opacity: 0 },
							}}
						>
							{socialLinks.map((link) => (
								<motion.a
									key={link.label}
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									className="text-gray-400 hover:text-primary-500 dark:text-gray-500 dark:hover:text-primary-400 transition-colors"
									whileHover={{ y: -3, scale: 1.15 }}
									transition={{ type: 'spring', stiffness: 300, damping: 10 }}
									aria-label={link.label}
								>
									{link.icon}
								</motion.a>
							))}
						</motion.div>
					</motion.div>

					{/* Newsletter */}
					<motion.div
						className="sm:col-span-2 lg:col-span-3"
						variants={itemVariants}
					>
						<h3 className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
							{t('navigation.sections.newsletter')}
						</h3>
						<p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
							{t('home.newsletter.description')}
						</p>
						<form onSubmit={handleSubscribe} className="flex gap-2">
							<motion.div
								className="relative flex-grow"
								whileHover={{ scale: 1.02 }}
								transition={{ type: 'spring', stiffness: 300 }}
							>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder={t('home.newsletter.emailPlaceholder')}
									className="w-full py-2 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
									disabled={isSubmitting || subscribeStatus === 'success'}
								/>
							</motion.div>
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								transition={{ type: 'spring', stiffness: 300 }}
							>
								<Button
									type="submit"
									variant="outline"
									size="sm"
									className="border-primary-500 text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 text-xs"
									disabled={isSubmitting || subscribeStatus === 'success'}
								>
									{isSubmitting ? (
										<svg
											className="animate-spin h-3 w-3"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											></circle>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
									) : subscribeStatus === 'success' ? (
										<span>{t('home.newsletter.subscribed')}</span>
									) : (
										<span>{t('home.newsletter.subscribe')}</span>
									)}
								</Button>
							</motion.div>
						</form>

						<AnimatePresence mode="wait">
							{subscribeStatus === 'success' && (
								<motion.p
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -5 }}
									transition={{ type: 'spring', stiffness: 500, damping: 15 }}
									className="text-xs text-primary-500 mt-2"
								>
									{t('home.newsletter.success')}
								</motion.p>
							)}
						</AnimatePresence>
					</motion.div>
				</div>

				{/* Bottom copyright bar */}
				<motion.div
					className="border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center"
					variants={{
						hidden: { opacity: 0, y: 20 },
						visible: {
							opacity: 1,
							y: 0,
							transition: {
								delay: 0.5,
								type: 'spring',
								stiffness: 100,
								damping: 20,
							},
						},
						exit: {
							opacity: 0,
							y: 10,
							transition: {
								type: 'spring',
								stiffness: 100,
								damping: 20,
							},
						},
					}}
				>
					<p className="text-xs text-gray-400 dark:text-gray-500">
						&copy; {currentYear} AOPA
					</p>

					<div className="flex items-center mt-4 sm:mt-0 space-x-6">
						<Link
							href="/contact"
							className="text-xs text-gray-400 hover:text-primary-500 dark:text-gray-500 dark:hover:text-primary-400 transition-colors duration-300 flex items-center"
						>
							{t('navigation.sections.contact')}
						</Link>
						<a
							href="/privacy"
							className="text-xs text-gray-400 hover:text-primary-500 dark:text-gray-500 dark:hover:text-primary-400 transition-colors duration-300 flex items-center"
						>
							{t('navigation.sections.privacy')}
						</a>
						<a
							href="/terms"
							className="text-xs text-gray-400 hover:text-primary-500 dark:text-gray-500 dark:hover:text-primary-400 transition-colors duration-300 flex items-center"
						>
							{t('navigation.sections.terms')}
						</a>
					</div>
				</motion.div>
			</motion.div>
		</footer>
	);
}
