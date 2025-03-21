'use client';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Abstract } from '@/types/database';
import { Database } from '@/types/supabase';
import { motion } from 'framer-motion';
import {
	Calendar,
	FileImage,
	FileText,
	Loader2,
	Plus,
	User,
	Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Define types for our content
type Congress = Database['public']['Tables']['congresses']['Row'];
type Activity = Database['public']['Tables']['activities']['Row'];

export function DashboardPage() {
	const { t } = useTranslation();
	const { isAuthenticated, user } = useAuth();
	const [stats, setStats] = useState({
		congressCount: 0,
		activityCount: 0,
		mediaCount: 0,
		userCount: 0,
		abstractCount: 0,
	});
	const [recentCongresses, setRecentCongresses] = useState<Congress[]>([]);
	const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
	const [recentAbstracts, setRecentAbstracts] = useState<Abstract[]>([]);
	const [loading, setLoading] = useState(true);

	// Format date helper
	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		return date.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	// Fetch dashboard data
	useEffect(() => {
		if (!isAuthenticated) return;

		const fetchDashboardData = async () => {
			setLoading(true);
			try {
				// Fetch congress count
				const { count: congressCount, error: congressError } = await supabase
					.from('congresses')
					.select('*', { count: 'exact', head: true })
					.is('deleted_at', null);

				if (congressError) throw congressError;

				// Fetch activity count
				const { count: activityCount, error: activityError } = await supabase
					.from('activities')
					.select('*', { count: 'exact', head: true })
					.is('deleted_at', null);

				if (activityError) throw activityError;

				// Fetch user count
				const { count: userCount, error: userError } = await supabase
					.from('accounts')
					.select('*', { count: 'exact', head: true });

				if (userError) throw userError;

				// Fetch media count
				const { data: mediaData, error: mediaError } = await supabase.storage
					.from('public')
					.list();

				if (mediaError) throw mediaError;
				const mediaCount = mediaData.filter(
					(item) => !item.id.endsWith('/')
				).length;

				// Fetch abstract count
				const { count: abstractCount, error: abstractError } = await supabase
					.from('abstracts')
					.select('*', { count: 'exact', head: true });

				if (abstractError) throw abstractError;

				// Set stats
				setStats({
					congressCount: congressCount || 0,
					activityCount: activityCount || 0,
					mediaCount,
					userCount: userCount || 0,
					abstractCount: abstractCount || 0,
				});

				// Fetch recent congresses
				const { data: recentCongressData, error: recentCongressError } =
					await supabase
						.from('congresses')
						.select('*')
						.is('deleted_at', null)
						.order('created_at', { ascending: false })
						.limit(3);

				if (recentCongressError) throw recentCongressError;
				setRecentCongresses(recentCongressData || []);

				// Fetch recent activities
				const { data: recentActivityData, error: recentActivityError } =
					await supabase
						.from('activities')
						.select('*')
						.is('deleted_at', null)
						.order('created_at', { ascending: false })
						.limit(3);

				if (recentActivityError) throw recentActivityError;
				setRecentActivities(recentActivityData || []);

				// Fetch recent abstracts
				const { data: recentAbstractData, error: recentAbstractError } =
					await supabase
						.from('abstracts')
						.select('*')
						.is('deleted_at', null)
						.order('created_at', { ascending: false })
						.limit(3);

				if (recentAbstractError) throw recentAbstractError;
				setRecentAbstracts(recentAbstractData || []);
			} catch (error) {
				console.error('Error fetching dashboard data:', error);
			} finally {
				setTimeout(() => {
					setLoading(false);
				}, 300); // Small delay to prevent flickering
			}
		};

		fetchDashboardData();
	}, [isAuthenticated]);

	return (
		<div className="container mx-auto py-8">
			<div className="mb-8">
				<h1 className="text-2xl font-bold">
					{t('dashboard.welcome')}, {user?.name || t('common.user')}
				</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">
					{t('dashboard.overview')}
				</p>
			</div>

			{loading ? (
				<div className="flex justify-center items-center h-64">
					<Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
				</div>
			) : (
				<>
					{/* Stats Grid */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.1 }}
							className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700"
						>
							<div className="flex items-center">
								<div className="flex-1">
									<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
										{t('dashboard.stats.congresses')}
									</p>
									<p className="mt-1 text-2xl font-semibold">
										{stats.congressCount}
									</p>
								</div>
								<div className="rounded-full p-2 bg-blue-50 dark:bg-blue-900/20">
									<Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
								</div>
							</div>
							<div className="mt-4">
								<Link
									href="/dashboard/congresses"
									className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
								>
									{t('dashboard.viewAll.congresses')}
								</Link>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.3 }}
							className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700"
						>
							<div className="flex items-center">
								<div className="flex-1">
									<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
										{t('dashboard.stats.media')}
									</p>
									<p className="mt-1 text-2xl font-semibold">
										{stats.mediaCount}
									</p>
								</div>
								<div className="rounded-full p-2 bg-purple-50 dark:bg-purple-900/20">
									<FileImage className="h-5 w-5 text-purple-600 dark:text-purple-400" />
								</div>
							</div>
							<div className="mt-4">
								<Link
									href="/dashboard/media"
									className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
								>
									{t('dashboard.viewAll.media')}
								</Link>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.4 }}
							className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700"
						>
							<div className="flex items-center">
								<div className="flex-1">
									<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
										{t('dashboard.stats.members')}
									</p>
									<p className="mt-1 text-2xl font-semibold">
										{stats.userCount}
									</p>
								</div>
								<div className="rounded-full p-2 bg-amber-50 dark:bg-amber-900/20">
									<Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
								</div>
							</div>
							<div className="mt-4">
								<Link
									href="/dashboard/members"
									className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline"
								>
									{t('dashboard.viewAll.members')}
								</Link>
							</div>
						</motion.div>

						{/* Add Abstracts Stats Card */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.5 }}
							className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700"
						>
							<div className="flex items-center">
								<div className="flex-1">
									<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
										{t('dashboard.stats.abstracts')}
									</p>
									<p className="mt-1 text-2xl font-semibold">
										{stats.abstractCount}
									</p>
								</div>
								<div className="rounded-full p-2 bg-indigo-50 dark:bg-indigo-900/20">
									<FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
								</div>
							</div>
							<div className="mt-4">
								<Link
									href="/abstracts"
									className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
								>
									{t('dashboard.viewAll.abstracts')}
								</Link>
							</div>
						</motion.div>
					</div>

					{/* Quick Actions */}
					<div className="mb-8">
						<h2 className="text-lg font-semibold mb-4">
							{t('dashboard.quickActions')}
						</h2>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<Link
								href="/dashboard/congresses"
								className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
							>
								<div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/30 mr-3">
									<Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
								</div>
								<span>{t('dashboard.add.congress')}</span>
							</Link>

							<Link
								href="/dashboard/events"
								className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
							>
								<div className="rounded-full p-2 bg-green-100 dark:bg-green-900/30 mr-3">
									<Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
								</div>
								<span>{t('dashboard.add.event')}</span>
							</Link>

							<Link
								href="/dashboard/media"
								className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
							>
								<div className="rounded-full p-2 bg-purple-100 dark:bg-purple-900/30 mr-3">
									<FileImage className="h-5 w-5 text-purple-600 dark:text-purple-400" />
								</div>
								<span>{t('dashboard.add.media')}</span>
							</Link>
						</div>
					</div>

					{/* Recent Content */}
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
						{/* Recent Congresses */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4 }}
							className="rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
						>
							<div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
								<h2 className="font-semibold">
									{t('dashboard.recent.congresses')}
								</h2>
							</div>
							<div className="divide-y divide-gray-200 dark:divide-gray-700">
								{recentCongresses.length > 0 ? (
									recentCongresses.map((congress) => (
										<div key={congress.id} className="p-6">
											<h3 className="font-medium">{congress.title}</h3>
											<div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
												<Calendar className="mr-1.5 h-4 w-4 flex-shrink-0" />
												{formatDate(congress.start_date)} -{' '}
												{formatDate(congress.end_date)}
											</div>
											<div className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
												{congress.description || t('dashboard.noDescription')}
											</div>
										</div>
									))
								) : (
									<div className="p-6 text-center text-gray-500 dark:text-gray-400">
										{t('dashboard.empty.congresses')}
									</div>
								)}
							</div>
							<div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 text-center">
								<Link
									href="/dashboard/congresses"
									className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
								>
									{t('dashboard.viewAll.title')}
								</Link>
							</div>
						</motion.div>

						{/* Recent Abstracts */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.3 }}
							className="lg:col-span-2 mt-8 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
						>
							<div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
								<h2 className="font-semibold">
									{t('dashboard.recent.abstracts')}
								</h2>
							</div>
							<div className="divide-y divide-gray-200 dark:divide-gray-700">
								{recentAbstracts.length > 0 ? (
									recentAbstracts.map((abstract) => (
										<div key={abstract.id} className="p-6">
											<h3 className="font-medium">{abstract.title}</h3>
											<div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
												<User className="mr-1.5 h-4 w-4 flex-shrink-0" />
												{abstract.name} {abstract.surname}
												<span className="mx-2">•</span>
												<span
													className={`px-2 py-1 rounded-full text-xs ${
														abstract.status === 'submitted'
															? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
															: abstract.status === 'reviewing'
															? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
															: abstract.status === 'approved'
															? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
															: abstract.status === 'rejected'
															? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
															: abstract.status === 'type-change'
															? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
															: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
													}`}
												>
													{t(
														`abstracts.status.${abstract.status}`,
														abstract.status.charAt(0).toUpperCase() +
															abstract.status.slice(1)
													)}
												</span>
											</div>
											<div className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
												{abstract.title}
											</div>
										</div>
									))
								) : (
									<div className="p-6 text-center text-gray-500 dark:text-gray-400">
										{t('dashboard.empty.abstracts')}
									</div>
								)}
							</div>
							<div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 text-center">
								<Link
									href="/dashboard/abstracts"
									className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
								>
									{t('dashboard.viewAll.title')}
								</Link>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</div>
	);
}
