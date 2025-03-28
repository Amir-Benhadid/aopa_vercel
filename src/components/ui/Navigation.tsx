'use client';

import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
	AlertCircle,
	Archive,
	FileText,
	Home,
	LayoutDashboard,
	LogOut,
	Mail,
	User,
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

	// Add console logs to debug
	useEffect(() => {
		console.log('Navigation isOpen state:', isOpen);
		console.log('Auth user role:', authUser?.role);
	}, [isOpen, authUser]);

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

	// Define navigation sections with translations
	const translatedNavigationSections = [
		{
			title: 'Main',
			items: [
				{
					href: '/',
					label: t('navigation.home'),
					icon: <Home className="w-5 h-5" />,
				},
				// Only show dashboard if authenticated and admin user
				...(isAuthenticated && authUser?.role === 'admin'
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
				{
					href: '/contact',
					label: t('navigation.contact') || 'Contact Us',
					icon: <Mail className="w-5 h-5" />,
				},
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
					{authUser && (
						<div className="border-t border-gray-200 dark:border-gray-700 py-3 px-3">
							<div className="flex items-center gap-3">
								<div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
									{showProfileAlert && (
										<div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 z-10">
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
										</div>
									)}
									<User className="w-8 h-8 p-1 text-gray-800/80 dark:text-gray-200/80" />
								</div>
								<motion.div
									variants={textVariants}
									transition={{ duration: 0.3 }}
									className="flex flex-col overflow-hidden"
								>
									<span className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">
										{displayName || authUser.email}
									</span>
									{showProfileAlert && (
										<div className="flex items-center text-red-500 text-xs gap-1">
											<AlertCircle className="w-3 h-3" />
											<span>{t('profile.incomplete')}</span>
										</div>
									)}
								</motion.div>
								<motion.button
									variants={textVariants}
									transition={{ duration: 0.3 }}
									onClick={onSignOut}
									className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
								>
									<LogOut className="w-5 h-5" />
								</motion.button>
							</div>
						</div>
					)}
				</motion.div>
			</motion.nav>
		</>
	);
}
