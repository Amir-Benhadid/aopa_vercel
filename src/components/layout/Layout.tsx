'use client';

import { ProfileSetupModal } from '@/components/profile/ProfileSetupModal';
import { Footer } from '@/components/ui/Footer';
import { Header } from '@/components/ui/Header';
import { Navigation } from '@/components/ui/Navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Menu } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
	children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
	const { user, logout } = useAuth();
	const { t } = useTranslation();
	const [isNavigationOpen, setIsNavigationOpen] = useState(false);

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
				<main className="flex-1 pb-12 w-full overflow-x-hidden mt-20 sm:mt-24 lg:ml-[100px] transition-all duration-300">
					{/* Content wrapper with responsive padding */}
					<div className="w-full px-4 sm:px-6 lg:px-8">{children}</div>
				</main>
			</div>
			<Footer className="relative z-10" />
			{user && <ProfileSetupModal />}
		</div>
	);
}
