'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import {
	Bell,
	Briefcase,
	Calendar,
	FileCheck,
	FileImage,
	FileText,
	LayoutDashboard,
	MessageSquare,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DashboardLayoutProps {
	children: ReactNode;
}

// Define dashboard navigation items
const dashboardNavItems = [
	{
		icon: LayoutDashboard,
		text: 'dashboard.navigation.overview',
		path: '/dashboard',
		id: 'overview',
	},
	{
		icon: Calendar,
		text: 'dashboard.navigation.congresses',
		path: '/dashboard/congresses',
		id: 'congresses',
	},
	{
		icon: FileText,
		text: 'dashboard.navigation.events',
		path: '/dashboard/events',
		id: 'events',
	},
	{
		icon: FileCheck,
		text: 'dashboard.navigation.abstracts',
		path: '/dashboard/abstracts',
		id: 'abstracts',
	},
	{
		icon: Briefcase,
		text: 'dashboard.navigation.sponsors',
		path: '/dashboard/sponsors',
		id: 'sponsors',
	},
	{
		icon: FileImage,
		text: 'dashboard.navigation.media',
		path: '/dashboard/media',
		id: 'media',
	},
	{
		icon: MessageSquare,
		text: 'dashboard.navigation.contacts',
		path: '/dashboard/contacts',
		id: 'contacts',
	},
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const { t } = useTranslation();
	const { user, isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const [newMessageCount, setNewMessageCount] = useState(0);

	// Determine active tab based on current path
	const getActiveTabFromPath = (path: string) => {
		if (path === '/dashboard') return 'overview';
		const segments = path.split('/');
		return segments.length > 2 ? segments[2] : 'overview';
	};

	const [activeTab, setActiveTab] = useState(
		getActiveTabFromPath(pathname || '/dashboard')
	);

	// Update active tab when pathname changes
	useEffect(() => {
		setActiveTab(getActiveTabFromPath(pathname || '/dashboard'));
	}, [pathname]);

	// Fetch new message count
	useEffect(() => {
		if (!isAuthenticated) return;

		const fetchNewMessageCount = async () => {
			try {
				const { count, error } = await supabase
					.from('contacts')
					.select('*', { count: 'exact', head: true })
					.eq('status', 'new');

				if (error) {
					throw error;
				}

				setNewMessageCount(count || 0);
			} catch (error) {
				console.error('Error fetching new message count:', error);
			}
		};

		fetchNewMessageCount();

		// Subscribe to changes in the contacts table
		const contactsSubscription = supabase
			.channel('contacts-changes')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'contacts',
				},
				fetchNewMessageCount
			)
			.subscribe();

		return () => {
			contactsSubscription.unsubscribe();
		};
	}, [isAuthenticated]);

	// If loading, show loading spinner
	if (isLoading) {
		return (
			<LoadingSpinner
				message={t('dashboard.loading', 'Loading dashboard...')}
				background="white"
				size="large"
				fullScreen={true}
			/>
		);
	}

	// If not authenticated after loading is complete, don't render dashboard content
	// This shouldn't happen normally because middleware should redirect,
	// but this provides a fallback just in case
	if (!isAuthenticated && !isLoading) {
		console.log(
			t(
				'dashboard.auth.error',
				'User not authenticated in dashboard layout, should have been redirected by middleware'
			)
		);
		return null;
	}

	// Handle navigation item click
	const handleNavClick = (id: string, path: string) => {
		setActiveTab(id);
		router.push(path);
	};

	return (
		<div className="flex flex-col">
			{/* Dashboard Header */}
			<div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<h1 className="text-xl font-semibold">
							{activeTab === 'overview' &&
								(t('dashboard.title') || 'Dashboard')}
							{activeTab === 'congresses' &&
								(t('dashboard.congresses.title') || 'Congresses')}
							{activeTab === 'events' &&
								(t('dashboard.events.title') || 'Events')}
							{activeTab === 'abstracts' &&
								(t('dashboard.abstracts.title') || 'Abstracts')}
							{activeTab === 'sponsors' &&
								(t('dashboard.sponsors.title') || 'Sponsors')}
							{activeTab === 'media' &&
								(t('dashboard.media.title') || 'Media Library')}
							{activeTab === 'contacts' &&
								(t('dashboard.contacts.title') || 'Contact Messages')}
							{activeTab === 'profile' &&
								(t('dashboard.profile.title') || 'Profile')}
							{activeTab === 'settings' &&
								(t('dashboard.settings.title') || 'Settings')}
						</h1>

						<div className="flex items-center space-x-4">
							<button
								className="relative rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
								onClick={() => router.push('/dashboard/contacts')}
							>
								<Bell size={20} />
								{newMessageCount > 0 && (
									<span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-xs text-white font-bold">
										{newMessageCount > 9 ? '9+' : newMessageCount}
									</span>
								)}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Dashboard Navigation Tabs */}
			<div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<nav className="flex space-x-4 overflow-x-auto py-2 scrollbar-hide">
						{dashboardNavItems.map((item) => (
							<button
								key={item.id}
								onClick={() => handleNavClick(item.id, item.path)}
								className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
									activeTab === item.id
										? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
										: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700'
								}`}
							>
								<item.icon
									className={`mr-2 h-5 w-5 ${
										activeTab === item.id
											? 'text-blue-500 dark:text-blue-400'
											: 'text-gray-400 dark:text-gray-500'
									}`}
								/>
								{t(item.text) || item.text.split('.').pop()}
								{item.id === 'contacts' && newMessageCount > 0 && (
									<span className="ml-2 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-xs text-white font-bold">
										{newMessageCount > 9 ? '9+' : newMessageCount}
									</span>
								)}
							</button>
						))}
					</nav>
				</div>
			</div>

			{/* Dashboard Content */}
			<div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6">
				{children}
			</div>
		</div>
	);
}
