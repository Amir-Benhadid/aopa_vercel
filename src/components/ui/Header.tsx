'use client';

import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Navigation } from '@/components/ui/Navigation';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Menu, Transition } from '@headlessui/react';
import {
	AnimatePresence,
	motion,
	useScroll,
	useTransform,
} from 'framer-motion';
import {
	AlertCircle,
	ChevronDown,
	LogOut,
	Menu as MenuIcon,
	User,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Array of logo files for the carousel
const logoFiles = [
	'/logo/LogoText-EN.svg',
	'/logo/LogoText-FR.svg',
	'/logo/LogoText-AR.svg',
	'/logo/LogoText-TM.svg',
];

// Memoized logo carousel using a fade-only animation
const LogoCarousel = React.memo(function LogoCarousel({
	currentLogoIndex,
	t,
}: {
	currentLogoIndex: number;
	t: any;
}) {
	return (
		<div className="relative h-16 sm:h-20 w-48 sm:w-64 md:w-80 lg:w-96 overflow-hidden">
			<AnimatePresence mode="wait">
				<motion.div
					key={logoFiles[currentLogoIndex]}
					className="absolute inset-0"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.8, ease: 'easeInOut' }}
				>
					<Image
						src={logoFiles[currentLogoIndex]}
						alt={t(
							'app.logoAltWithNumber',
							'Ophthalmology Association Logo {{number}}',
							{ number: currentLogoIndex + 1 }
						)}
						fill
						className="object-contain object-center"
						priority
					/>
				</motion.div>
			</AnimatePresence>
		</div>
	);
});

export function Header() {
	const { user, logout } = useAuth();
	const { theme, setTheme } = useTheme();
	const pathname = usePathname();
	const router = useRouter();
	const { scrollY } = useScroll();
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
	const [displayName, setDisplayName] = useState<string>('');
	const [profileComplete, setProfileComplete] = useState(true);
	const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
	const [isNavigationOpen, setIsNavigationOpen] = useState(false);
	const { t } = useTranslation();

	// Add console logs to debug
	useEffect(() => {
		console.log('Header isNavigationOpen state:', isNavigationOpen);
	}, [isNavigationOpen]);

	// Use a single interval to update the logo index every 5 seconds.
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentLogoIndex((prevIndex) => (prevIndex + 1) % logoFiles.length);
		}, 5000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		// Get user profile data when user is available
		if (user) {
			const fetchUserProfile = async () => {
				try {
					const { data: accountData, error: accountError } = await supabase
						.from('accounts')
						.select('name, surname')
						.eq('user_id', user.id)
						.single();

					if (accountError) {
						console.error('Error fetching profile:', accountError);
						setProfileComplete(false);
					} else if (!accountData.name || !accountData.surname) {
						setProfileComplete(false);
					} else {
						setProfileComplete(true);
					}

					if (accountData?.name && accountData?.surname) {
						setDisplayName(`${accountData.name} ${accountData.surname}`);
					} else if (user.email) {
						setDisplayName(user.email.split('@')[0]);
					} else {
						setDisplayName(t('common.user'));
					}
				} catch (error) {
					console.error('Error in profile fetch:', error);
					setProfileComplete(false);
					if (user.email) {
						setDisplayName(user.email.split('@')[0]);
					}
				}
			};

			fetchUserProfile();
		}
	}, [user, t]);

	const handleSignOut = async () => {
		try {
			await logout();
			toast.success(t('auth.signOutSuccess'));
			router.push('/');
		} catch (error) {
			toast.error(t('auth.signOutError'));
			console.error(error);
		}
	};

	const toggleNavigation = () => {
		console.log('Toggling navigation, current state:', isNavigationOpen);
		setIsNavigationOpen(!isNavigationOpen);
	};

	return (
		<>
			<motion.header
				style={{
					background: headerBackground,
					boxShadow: headerShadow,
				}}
				className="fixed top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-50 rounded-xl backdrop-blur-md dark:bg-gray-900/90 border border-gray-200/50 dark:border-gray-800/50"
			>
				<div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
					<div className="flex h-16 sm:h-20 items-center justify-between">
						{/* Left side - Menu button and small logo */}
						<div className="flex items-center">
							<button
								type="button"
								className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
								onClick={toggleNavigation}
								aria-label={t('navigation.openMenu')}
							>
								<MenuIcon
									className="h-5 w-5 sm:h-6 sm:w-6"
									aria-hidden="true"
								/>
							</button>
							<Link href="/" className="ml-2 sm:ml-3">
								<div className="relative w-16 sm:w-24 h-10 sm:h-14 text-primary-600 dark:text-primary-400">
									<Image
										src="/logo/logo-sm.svg"
										alt={t('app.logoAlt')}
										fill
										className="object-contain transition-transform hover:scale-110"
										priority
									/>
								</div>
							</Link>
						</div>

						{/* Center - Logo carousel */}
						<div className="flex flex-1 items-center justify-center">
							<LogoCarousel currentLogoIndex={currentLogoIndex} t={t} />
						</div>

						{/* Right side - Theme toggle and user menu */}
						<div className="flex items-center gap-1 sm:gap-3">
							{false && (
								<button
									onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
									className="p-1 sm:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
									aria-label={t('common.toggleTheme')}
								>
									{theme === 'dark' ? (
										<SunIcon className="w-4 h-4 sm:w-5 sm:h-5" />
									) : (
										<MoonIcon className="w-4 h-4 sm:w-5 sm:h-5" />
									)}
								</button>
							)}

							<LanguageSwitcher />

							{user ? (
								<Menu as="div" className="relative inline-block text-left">
									<div>
										<Menu.Button className="inline-flex items-center justify-center w-full px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
											<span className="mr-1 sm:mr-2 flex items-center">
												<span className="hidden sm:inline">{displayName}</span>
												<span className="sm:hidden">
													{displayName.charAt(0)}
												</span>
												{!profileComplete && (
													<AlertCircle className="ml-1 h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
												)}
											</span>
											<ChevronDown
												className="w-3 h-3 sm:w-4 sm:h-4"
												aria-hidden="true"
											/>
										</Menu.Button>
									</div>
									<Transition
										as={Fragment}
										enter="transition ease-out duration-100"
										enterFrom="transform opacity-0 scale-95"
										enterTo="transform opacity-100 scale-100"
										leave="transition ease-in duration-75"
										leaveFrom="transform opacity-100 scale-100"
										leaveTo="transform opacity-0 scale-95"
									>
										<Menu.Items className="absolute right-0 mt-2 w-48 sm:w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
											<div className="px-1 py-1">
												<Menu.Item>
													{({ active }) => (
														<Link
															href="/profile"
															className={`${
																active
																	? 'bg-primary-50 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
																	: 'text-gray-700 dark:text-gray-200'
															} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
														>
															<User
																className="mr-2 h-4 sm:h-5 w-4 sm:w-5"
																aria-hidden="true"
															/>
															<span className="flex items-center">
																{t('navigation.profile')}
																{!profileComplete && (
																	<AlertCircle className="ml-1.5 h-3 sm:h-4 w-3 sm:w-4 text-red-500" />
																)}
															</span>
														</Link>
													)}
												</Menu.Item>
											</div>
											<div className="px-1 py-1">
												<Menu.Item>
													{({ active }) => (
														<button
															onClick={handleSignOut}
															className={`${
																active
																	? 'bg-red-50 dark:bg-red-900/20 text-red-600'
																	: 'text-gray-700 dark:text-gray-200'
															} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
														>
															<LogOut
																className="mr-2 h-4 sm:h-5 w-4 sm:w-5"
																aria-hidden="true"
															/>
															{t('navigation.signOut')}
														</button>
													)}
												</Menu.Item>
											</div>
										</Menu.Items>
									</Transition>
								</Menu>
							) : (
								<div className="flex items-center space-x-1 sm:space-x-2">
									<Link href="/auth">
										<Button
											className="text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors bg-transparent"
											translationKey="auth.signIn"
										/>
									</Link>
									<Link href="/auth?mode=signup" className="hidden sm:block">
										<Button
											className="text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3"
											translationKey="auth.signUp"
										/>
									</Link>
								</div>
							)}
						</div>
					</div>
				</div>
			</motion.header>

			{/* Navigation Component */}
			<Navigation
				user={user}
				displayName={displayName}
				showProfileAlert={!profileComplete}
				onSignOut={handleSignOut}
				isOpen={isNavigationOpen}
				onClose={() => setIsNavigationOpen(false)}
			/>
		</>
	);
}

function SunIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			className={className}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
			/>
		</svg>
	);
}

function MoonIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			className={className}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
			/>
		</svg>
	);
}
