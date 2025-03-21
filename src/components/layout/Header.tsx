'use client';

import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const navItems = [
	{ href: '/', key: 'navigation.home' },
	{ href: '/about', key: 'navigation.about' },
	{ href: '/congress', key: 'navigation.congress' },
	{ href: '/research', key: 'navigation.research' },
	{ href: '/education', key: 'navigation.education' },
	{ href: '/contact', key: 'navigation.contact' },
];

export function Header() {
	const { t, i18n } = useTranslation();
	const { theme, setTheme } = useTheme();
	const pathname = usePathname();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);

	// Handle scroll event to change header appearance
	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 10) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}
		};

		window.addEventListener('scroll', handleScroll);

		// Initial check
		handleScroll();

		// Clean up
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	// Toggle language between English and Spanish
	const toggleLanguage = () => {
		const newLang = i18n.language === 'en' ? 'es' : 'en';
		i18n.changeLanguage(newLang);
	};

	return (
		<header
			className={cn(
				'sticky top-0 z-50 w-full transition-all duration-300',
				isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
			)}
		>
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				{/* Logo */}
				<Link href="/" className="flex items-center space-x-2">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{
							duration: 0.5,
							type: 'spring',
							stiffness: 100,
							damping: 15,
						}}
					>
						<svg
							width="32"
							height="32"
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
					</motion.div>
					<motion.span
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{
							duration: 0.5,
							delay: 0.1,
							type: 'spring',
							stiffness: 100,
							damping: 15,
						}}
						className="hidden text-xl font-bold sm:inline-block"
					>
						{t('app.name', 'EAO')}
					</motion.span>
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex md:items-center md:space-x-6">
					{navItems.map((item, index) => (
						<motion.div
							key={item.key}
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.3,
								delay: index * 0.05,
								type: 'spring',
								stiffness: 100,
								damping: 15,
							}}
						>
							<Link
								href={item.href}
								className={cn(
									'text-sm font-medium transition-colors hover:text-primary',
									pathname === item.href
										? 'text-primary'
										: 'text-muted-foreground'
								)}
							>
								{t(item.key)}
							</Link>
						</motion.div>
					))}
				</nav>

				{/* Actions */}
				<div className="flex items-center space-x-4">
					{/* Theme Toggle Button */}
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3, delay: 0.2 }}
					>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
							className="hidden sm:flex"
							aria-label={t('common.toggleTheme')}
						>
							{theme === 'dark' ? (
								<SunIcon className="h-5 w-5" />
							) : (
								<MoonIcon className="h-5 w-5" />
							)}
						</Button>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3, delay: 0.3 }}
					>
						<Button
							variant="ghost"
							size="sm"
							onClick={toggleLanguage}
							className="hidden sm:flex"
						>
							{i18n.language === 'en' ? 'ES' : 'EN'}
						</Button>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3, delay: 0.4 }}
					>
						<Button
							asChild
							variant="ghost"
							size="sm"
							className="hidden sm:flex"
						>
							<Link href="/login">{t('navigation.login')}</Link>
						</Button>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3, delay: 0.5 }}
					>
						<Button asChild size="sm" className="hidden sm:flex">
							<Link href="/register">{t('navigation.register')}</Link>
						</Button>
					</motion.div>

					{/* Mobile Menu Button */}
					<motion.button
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3 }}
						className="flex md:hidden"
						onClick={() => setIsMenuOpen(!isMenuOpen)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							{isMenuOpen ? (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							) : (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							)}
						</svg>
					</motion.button>
				</div>
			</div>

			{/* Mobile Menu */}
			<AnimatePresence>
				{isMenuOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						transition={{
							duration: 0.3,
							type: 'spring',
							stiffness: 100,
							damping: 15,
						}}
						className="md:hidden"
					>
						<div className="container mx-auto space-y-4 px-4 pb-6 pt-2">
							{navItems.map((item) => (
								<Link
									key={item.key}
									href={item.href}
									className={cn(
										'block py-2 text-sm font-medium transition-colors hover:text-primary',
										pathname === item.href
											? 'text-primary'
											: 'text-muted-foreground'
									)}
									onClick={() => setIsMenuOpen(false)}
								>
									{t(item.key)}
								</Link>
							))}
							<div className="flex items-center space-x-4 pt-4">
								{/* Mobile Theme Toggle */}
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
									aria-label={t('common.toggleTheme')}
								>
									{theme === 'dark'
										? t('common.lightMode')
										: t('common.darkMode')}
								</Button>
								<Button variant="ghost" size="sm" onClick={toggleLanguage}>
									{i18n.language === 'en' ? 'ES' : 'EN'}
								</Button>
								<Button asChild variant="ghost" size="sm">
									<Link href="/login">{t('navigation.login')}</Link>
								</Button>
								<Button asChild size="sm">
									<Link href="/register">{t('navigation.register')}</Link>
								</Button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	);
}

// Sun icon for theme toggle
function SunIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<circle cx="12" cy="12" r="5" />
			<line x1="12" y1="1" x2="12" y2="3" />
			<line x1="12" y1="21" x2="12" y2="23" />
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
			<line x1="1" y1="12" x2="3" y2="12" />
			<line x1="21" y1="12" x2="23" y2="12" />
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
		</svg>
	);
}

// Moon icon for theme toggle
function MoonIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
		</svg>
	);
}
