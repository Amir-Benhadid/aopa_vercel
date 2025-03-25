'use client';

import { Footer } from '@/components/layout/Footer';
import { ProfileSetupModal } from '@/components/profile/ProfileSetupModal';
import { Header } from '@/components/ui/Header';
import { Navigation } from '@/components/ui/Navigation';
import { getUpcomingCongress } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { Congress } from '@/types/database';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContactHero from '../contact/heroSection';
import { HeroSection } from '../home/HeroSection';

interface LayoutProps {
	children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
	const { user, logout } = useAuth();
	const { t } = useTranslation();
	const [isNavigationOpen, setIsNavigationOpen] = useState(false);
	const pathname = usePathname();
	const [upcomingCongress, setUpcomingCongress] = useState<Congress | null>(
		null
	);

	useEffect(() => {
		const fetchUpcomingCongress = async () => {
			const congress = await getUpcomingCongress();
			setUpcomingCongress(congress);
		};
		fetchUpcomingCongress();
	}, []);

	const toggleNavigation = () => {
		setIsNavigationOpen(!isNavigationOpen);
	};

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<Header />

			<div className="flex">
				{/* Mobile navigation toggle */}
				<button
					type="button"
					className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-primary-600 text-white shadow-lg lg:hidden"
					onClick={toggleNavigation}
					aria-label={
						isNavigationOpen
							? t('navigation.closeMenu')
							: t('navigation.openMenu')
					}
				>
					<Menu className="h-6 w-6" />
				</button>

				{/* Sidebar for desktop */}
				<div className="fixed top-24 sm:top-28 left-0 h-[calc(100vh-6rem)] z-40 hidden lg:block">
					<Navigation
						showProfileAlert={!user}
						user={user}
						displayName={user?.email?.split('@')[0] || t('common.user', 'User')}
						onSignOut={logout}
					/>
				</div>

				{/* Mobile navigation */}
				<div className="lg:hidden">
					<Navigation
						showProfileAlert={!user}
						user={user}
						displayName={user?.email?.split('@')[0] || t('common.user', 'User')}
						onSignOut={logout}
						isOpen={isNavigationOpen}
						onClose={() => setIsNavigationOpen(false)}
					/>
				</div>

				{/* Main content */}
				<main className="flex-1 w-full overflow-x-hidden transition-all duration-300">
					{pathname === '/' && upcomingCongress && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.8 }}
							className="w-full"
						>
							<HeroSection
								congressTitle={upcomingCongress.title}
								congressDate={upcomingCongress.start_date}
								congressLocation={
									upcomingCongress.location &&
									typeof upcomingCongress.location === 'object'
										? upcomingCongress.location.name || 'Location TBA'
										: upcomingCongress.location || 'Location TBA'
								}
								registrationProgress={75}
								congressRegistrationOpen={upcomingCongress.registration}
							/>
						</motion.div>
					)}
					{pathname === '/contact' && <ContactHero />}
					{/* Children now get all the spacing */}
					<div
						className={`${
							pathname === '/contact' ? '' : 'mt-20 sm:mt-24'
						}  lg:ml-[80px] pb-12 px-4 sm:px-6 lg:px-8`}
					>
						{children}
					</div>
				</main>
			</div>
			<Footer />
			{user && <ProfileSetupModal />}
		</div>
	);
}
