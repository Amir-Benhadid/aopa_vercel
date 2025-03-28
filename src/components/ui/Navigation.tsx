'use client';

import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import {
	AnimatePresence,
	motion,
	useScroll,
	useTransform,
} from 'framer-motion';
import {
	AlertCircle,
	Archive,
	FileText,
	Home,
	LayoutDashboard,
	LogOut,
	User,
	X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface NavigationProps {
	showProfileAlert?: boolean;
	user?: any;
	displayName?: string;
	onSignOut?: () => void;
	isOpen?: boolean;
	onClose?: () => void;
}

// Define navigation sections
const navigationSections = [
	{
		title: 'Main',
		items: [
			{ href: '/', label: 'Home', icon: <Home className="w-5 h-5" /> },
			{
				href: '/dashboard',
				label: 'Dashboard',
				icon: <LayoutDashboard className="w-5 h-5" />,
			},
			{
				href: '/abstracts',
				label: 'Abstracts',
				icon: <FileText className="w-5 h-5" />,
			},
		],
	},
	{
		title: 'Information',
		items: [
			{
				href: '/archives',
				label: 'Archives',
				icon: <Archive className="w-5 h-5" />,
			},
		],
	},
	{
		title: 'Account',
		items: [
			{
				href: '/profile',
				label: 'Profile',
				icon: <User className="w-5 h-5" />,
			},
		],
	},
];

// Animation variants for the sidebar container
const sidebarVariants = {
	collapsed: { width: 100 }, // about 100px when closed
	expanded: { width: 256 }, // 256px when open
};

// Animation variants for text elements
const textVariants = {
	collapsed: { opacity: 0, x: 0 },
	expanded: { opacity: 1, x: 0 },
};

export function Navigation({
	showProfileAlert = false,
	user,
	displayName = '',
	onSignOut,
	isOpen = false,
	onClose = () => {},
}: NavigationProps) {
	const pathname = usePathname();
	const [isExpanded, setIsExpanded] = useState(false);
	const { t } = useTranslation();
	const { theme } = useTheme();
	const { scrollY } = useScroll();
	const { isAuthenticated, user: authUser } = useAuth();

	// Check if user has admin role
	const isAdmin = authUser?.role === 'admin';

	// Add console logs to debug
	useEffect(() => {
		console.log('Navigation isOpen state:', isOpen);
	}, [isOpen]);

	// Original background animation
	const headerBackground = useTransform(
		scrollY,
		[0, 100],
		['rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.9)']
	);
	const headerShadow = useTransform(
		scrollY,
		[0, 100],
		['0 0 0 transparent', '0 4px 6px -1px rgba(0, 0, 0, 0.1)']
	);

	// Only close mobile navigation when route changes, not when the component mounts
	useEffect(() => {
		const handleRouteChange = () => {
			if (isOpen) {
				onClose();
			}
		};

		// Listen for route changes
		window.addEventListener('popstate', handleRouteChange);

		return () => {
			window.removeEventListener('popstate', handleRouteChange);
		};
	}, [isOpen, onClose]);

	// Define navigation sections with translations and role-based conditions
	const translatedNavigationSections = [
		{
			title: 'Main',
			items: [
				{
					href: '/',
					label: t('navigation.home'),
					icon: <Home className="w-5 h-5" />,
				},
				// Only show dashboard if authenticated AND user is an admin
				...(isAuthenticated && isAdmin
					? [
							{
								href: '/dashboard',
								label: t('navigation.dashboard'),
								icon: <LayoutDashboard className="w-5 h-5" />,
							},
					  ]
					: []),
				// Show abstracts for all authenticated users
				...(isAuthenticated
					? [
							{
								href: '/abstracts',
								label: t('navigation.abstracts'),
								icon: <FileText className="w-5 h-5" />,
							},
					  ]
					: []),
			],
		},
		{
			title: 'Information',
			items: [
				...(isAuthenticated
					? [
							{
								href: '/archives',
								label: t('navigation.archives'),
								icon: <Archive className="w-5 h-5" />,
							},
					  ]
					: []),
			],
		},
	];

	// Only add account section if authenticated
	if (isAuthenticated) {
		translatedNavigationSections.push({
			title: 'Account',
			items: [
				{
					href: '/profile',
					label: t('navigation.profile'),
					icon: <User className="w-5 h-5" />,
				},
			],
		});
	}

	return (
		<>
			{/* Desktop Navigation - Hidden on mobile */}
			<motion.nav
				initial="collapsed"
				animate={isExpanded ? 'expanded' : 'collapsed'}
				variants={sidebarVariants}
				transition={{ type: 'spring', stiffness: 300, damping: 30 }}
				className={cn(
					'fixed left-0 top-24 mt-4 bottom-4 z-40 overflow-hidden hidden lg:block'
				)}
				onMouseEnter={() => setIsExpanded(true)}
				onMouseLeave={() => setIsExpanded(false)}
			>
				<motion.div
					className="relative h-full mx-4 rounded-xl dark:bg-gray-900/90 shadow-md border border-gray-200 dark:border-gray-800 backdrop-blur-md flex flex-col"
					style={{
						background: headerBackground,
						boxShadow: headerShadow,
					}}
				>
					{/* Header with Logo */}
					<div className="flex items-center h-14 border-b border-gray-200 dark:border-gray-700 px-3 gap-2">
						<div className="relative w-10 h-10 flex-shrink-0">
							<Image
								src="/logo/logo-sm.svg"
								alt="Logo"
								fill
								className="object-contain"
							/>
						</div>
						<motion.span
							variants={textVariants}
							transition={{ duration: 0.3 }}
							className="text-lg font-semibold text-gray-800 dark:text-gray-100 overflow-hidden whitespace-nowrap"
						>
							{t('navigation.title')}
						</motion.span>
					</div>

					{/* Navigation Sections */}
					<div className="flex-1 overflow-y-auto ios-like-hide-scrollbar-until-hover overflow-x-hidden py-4 px-3 flex flex-col gap-4">
						{translatedNavigationSections.map(
							(section, idx) =>
								section.items.length > 0 && (
									<div key={idx} className="flex flex-col gap-2">
										<motion.h3
											variants={textVariants}
											transition={{ duration: 0.3, delay: 0.1 }}
											className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
										>
											{section.title}
										</motion.h3>
										<ul className="flex flex-col gap-1">
											{section.items.map((item) => (
												<li key={item.href}>
													<Link
														href={item.href}
														className={cn(
															'flex items-center gap-3 rounded-md transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 overflow-hidden',
															pathname === item.href
																? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
																: 'text-gray-800 dark:text-gray-200',
															'px-3 py-2'
														)}
														title={!isExpanded ? item.label : undefined}
													>
														{/* Icon: always visible */}
														<span
															className={
																pathname === item.href
																	? 'text-primary-600 dark:text-primary-400'
																	: 'text-gray-600 dark:text-gray-400'
															}
														>
															{item.icon}
														</span>
														<motion.span
															variants={textVariants}
															transition={{ duration: 0.3, delay: 0.15 }}
															className="whitespace-nowrap"
														>
															{item.label}
														</motion.span>
														{item.href === '/profile' && showProfileAlert && (
															<AlertCircle
																className={cn(
																	'text-red-500',
																	isExpanded
																		? 'ml-auto w-4 h-4'
																		: 'absolute -top-1 -right-1 w-3 h-3'
																)}
															/>
														)}
													</Link>
												</li>
											))}
										</ul>
									</div>
								)
						)}
					</div>

					{/* Profile Section */}
					{user && (
						<div className="border-t border-gray-200 dark:border-gray-700 py-3 px-3">
							<div className="flex items-center gap-3">
								<div className="flex-shrink-0">
									<div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 ml-1">
										{displayName.charAt(0).toUpperCase()}
									</div>
								</div>
								<motion.div
									variants={textVariants}
									transition={{ duration: 0.3, delay: 0.2 }}
									className="flex-1 overflow-hidden"
								>
									<p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
										{displayName}
										{showProfileAlert && (
											<AlertCircle className="ml-1 inline-block w-3 h-3 text-red-500" />
										)}
									</p>
									{onSignOut && (
										<button
											onClick={onSignOut}
											className="text-xs text-nowrap text-red-600 dark:text-red-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1 mt-0.5"
										>
											<LogOut className="w-3 h-3" />
											{t('navigation.signOut')}
										</button>
									)}
								</motion.div>
							</div>
						</div>
					)}
				</motion.div>
			</motion.nav>

			{/* Mobile Navigation - Modern implementation */}
			<AnimatePresence>
				{isOpen && (
					<>
						{/* Backdrop with blur effect */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.3 }}
							className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-40 lg:hidden"
							onClick={onClose}
						/>

						{/* Sidebar Container */}
						<motion.div
							initial={{ x: '-100%' }}
							animate={{ x: 0 }}
							exit={{ x: '-100%' }}
							transition={{
								type: 'spring',
								damping: 30,
								stiffness: 300,
								mass: 1.2,
							}}
							className="fixed inset-y-0 left-0 z-50 w-full max-w-[280px] lg:hidden flex flex-col"
						>
							{/* Modern glass-morphism container */}
							<div className="relative h-full w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden border-r border-gray-200/50 dark:border-gray-700/30">
								{/* Decorative elements */}
								<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
								<div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl"></div>
								<div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl"></div>

								{/* Header with close button */}
								<div className="flex items-center justify-between h-16 px-6 border-b border-gray-200/70 dark:border-gray-700/30 relative z-10">
									<div className="flex items-center gap-3">
										<div className="relative w-8 h-8">
											<Image
												src="/logo/logo-sm.svg"
												alt="Logo"
												fill
												className="object-contain"
											/>
										</div>
										<span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
											{t('navigation.title')}
										</span>
									</div>
									<button
										type="button"
										className="p-2 rounded-full text-gray-500 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 focus:outline-none transition-colors"
										onClick={onClose}
									>
										<X className="h-5 w-5" />
									</button>
								</div>

								{/* Navigation content with improved styling */}
								<div className="flex-1 overflow-y-auto px-6 py-4 relative z-10">
									<nav className="flex flex-1 flex-col">
										<ul className="flex flex-1 flex-col gap-y-6">
											{translatedNavigationSections.map((section, index) => (
												<li key={index}>
													<h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
														{section.title}
													</h3>
													<ul className="space-y-1">
														{section.items.map((item) => (
															<motion.li
																key={item.href}
																whileHover={{ x: 4 }}
																transition={{
																	type: 'spring',
																	stiffness: 400,
																	damping: 10,
																}}
															>
																<Link
																	href={item.href}
																	className={cn(
																		'group flex items-center gap-x-3 rounded-lg p-2 text-sm font-medium transition-all',
																		pathname === item.href
																			? 'bg-blue-50/80 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
																			: 'text-gray-700 hover:bg-gray-50/80 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-blue-400'
																	)}
																>
																	<span
																		className={cn(
																			'p-1 rounded-md',
																			pathname === item.href
																				? 'bg-blue-100/80 text-blue-600 dark:bg-blue-800/30 dark:text-blue-400'
																				: 'bg-gray-100/80 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 group-hover:bg-blue-100/50 group-hover:text-blue-600 dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-400'
																		)}
																	>
																		{item.icon}
																	</span>
																	{item.label}
																	{item.href === '/profile' &&
																		showProfileAlert &&
																		isExpanded && (
																			<span className="relative flex h-2 w-2 ml-auto">
																				<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
																				<span
																					className={`relative inline-flex rounded-full h-2 w-2 bg-red-500`}
																				></span>
																				)
																			</span>
																		)}
																</Link>
															</motion.li>
														))}
													</ul>
												</li>
											))}

											{user && (
												<li className="mt-auto pt-4">
													<div className="flex items-center gap-x-4 p-3 text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 border-t border-gray-200/70 dark:border-gray-700/30 rounded-lg bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm">
														<div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-md">
															{displayName.charAt(0).toUpperCase()}
														</div>
														<div className="flex flex-col">
															<span className="font-semibold">
																{displayName}
															</span>
															{onSignOut && (
																<button
																	onClick={onSignOut}
																	className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 mt-0.5 opacity-80 hover:opacity-100 transition-opacity"
																>
																	<LogOut className="w-3 h-3" />
																	{t('navigation.signOut')}
																</button>
															)}
														</div>
													</div>
												</li>
											)}
										</ul>
									</nav>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
}
