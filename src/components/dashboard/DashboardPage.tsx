'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Abstract } from '@/types/database';
import { Database } from '@/types/supabase';
import { motion } from 'framer-motion';
import {
	BarChart3,
	Calendar,
	CircleUser,
	Clock,
	FileImage,
	FileText,
	Globe,
	Plus,
	TrendingUp,
	User,
	Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

// Extend Abstract type with author_name property
type EnhancedAbstract = Abstract & {
	author_name?: string;
	theme?: string;
};

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
	const [recentAbstracts, setRecentAbstracts] = useState<EnhancedAbstract[]>(
		[]
	);
	const [abstractsByTheme, setAbstractsByTheme] = useState<
		{ name: string; value: number }[]
	>([]);
	const [activityTypes, setActivityTypes] = useState<
		{ name: string; count: number }[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [upcomingCongress, setUpcomingCongress] = useState<Congress | null>(
		null
	);

	// Colors for pie chart
	const COLORS = [
		'#4F46E5',
		'#10B981',
		'#F59E0B',
		'#EF4444',
		'#8B5CF6',
		'#EC4899',
	];

	// Format date helper
	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		return date.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	// Format time remaining
	const formatTimeRemaining = (targetDate: string): string => {
		const now = new Date();
		const target = new Date(targetDate);
		const diffTime = Math.abs(target.getTime() - now.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		return diffDays > 1
			? `${diffDays} days`
			: diffDays === 1
			? '1 day'
			: 'Today';
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

				// Fetch upcoming congress
				const today = new Date().toISOString().split('T')[0];
				const { data: upcomingCongressData, error: upcomingCongressError } =
					await supabase
						.from('congresses')
						.select('*')
						.is('deleted_at', null)
						.gte('start_date', today)
						.order('start_date', { ascending: true })
						.limit(1);

				if (upcomingCongressError) throw upcomingCongressError;
				if (upcomingCongressData && upcomingCongressData.length > 0) {
					setUpcomingCongress(upcomingCongressData[0]);
				}

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

				// Fetch abstracts by theme data for chart
				const { data: abstractsThemeData, error: abstractsThemeError } =
					await supabase
						.from('abstracts')
						.select('theme')
						.is('deleted_at', null);

				if (abstractsThemeError) throw abstractsThemeError;

				if (abstractsThemeData) {
					// Count themes
					const themeCounts: Record<string, number> = {};
					abstractsThemeData.forEach((item: { theme: string }) => {
						if (item.theme) {
							themeCounts[item.theme] = (themeCounts[item.theme] || 0) + 1;
						}
					});

					// Transform to chart data format
					const themeData = Object.entries(themeCounts).map(
						([name, value]) => ({
							name,
							value,
						})
					);

					// If no data, provide sample data
					if (themeData.length === 0) {
						setAbstractsByTheme([
							{ name: 'Science', value: 0 },
							{ name: 'Technology', value: 0 },
							{ name: 'Engineering', value: 0 },
							{ name: 'Medicine', value: 0 },
						]);
					} else {
						setAbstractsByTheme(themeData);
					}
				}

				// Fetch activity types for chart
				const { data: activitiesData, error: activitiesError } = await supabase
					.from('activities')
					.select('type')
					.is('deleted_at', null);

				if (activitiesError) throw activitiesError;

				if (activitiesData) {
					// Count activity types
					const typeCounts: Record<string, number> = {};
					activitiesData.forEach((item: { type: string }) => {
						if (item.type) {
							typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
						}
					});

					// Transform to chart data format
					const typeData = Object.entries(typeCounts).map(([type, count]) => ({
						name:
							type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' '),
						count,
					}));

					setActivityTypes(typeData);
				}
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
			{loading ? (
				<LoadingSpinner
					message={t('dashboard.loading', 'Loading dashboard data...')}
					background="transparent"
					size="small"
					fullScreen={false}
				/>
			) : (
				<>
					{/* Welcome and Summary */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
						{/* Welcome Card */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
							className="col-span-1 lg:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white p-8 shadow-lg relative overflow-hidden"
						>
							<div className="absolute right-0 top-0 w-64 h-64 opacity-10">
								<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
									<path
										fill="#FFFFFF"
										d="M47.1,-67.7C62.2,-57.4,76.8,-45.7,83.2,-30.2C89.7,-14.7,88.2,4.7,81.4,21.4C74.5,38.1,62.3,52.1,47.4,62.9C32.6,73.7,15.3,81.3,-2.3,84.2C-19.9,87.1,-39.8,85.3,-51.7,74.4C-63.6,63.5,-67.5,43.4,-70.8,25.1C-74.1,6.8,-76.9,-9.7,-72.3,-24C-67.7,-38.3,-55.7,-50.5,-42.1,-61.3C-28.4,-72,-14.2,-81.3,0.8,-82.5C15.9,-83.7,31.9,-77.9,47.1,-67.7Z"
										transform="translate(100 100)"
									/>
								</svg>
							</div>
							<div className="relative z-10">
								<h1 className="text-3xl font-bold mb-2">
									{t('dashboard.welcome')}, {user?.name || t('common.user')}
								</h1>
								<p className="text-blue-100 mb-6">{t('dashboard.overview')}</p>

								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
									<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
										<div className="flex items-center mb-2">
											<Calendar className="h-5 w-5 mr-2" />
											<span className="text-sm font-medium">Congresses</span>
										</div>
										<p className="text-2xl font-bold">{stats.congressCount}</p>
									</div>

									<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
										<div className="flex items-center mb-2">
											<FileImage className="h-5 w-5 mr-2" />
											<span className="text-sm font-medium">Media</span>
										</div>
										<p className="text-2xl font-bold">{stats.mediaCount}</p>
									</div>

									<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
										<div className="flex items-center mb-2">
											<Users className="h-5 w-5 mr-2" />
											<span className="text-sm font-medium">Members</span>
										</div>
										<p className="text-2xl font-bold">{stats.userCount}</p>
									</div>

									<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
										<div className="flex items-center mb-2">
											<FileText className="h-5 w-5 mr-2" />
											<span className="text-sm font-medium">Abstracts</span>
										</div>
										<p className="text-2xl font-bold">{stats.abstractCount}</p>
									</div>
								</div>
							</div>
						</motion.div>

						{/* Upcoming Congress */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.2 }}
							className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col"
						>
							<h2 className="font-semibold text-lg mb-4 flex items-center">
								<Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
								{t('dashboard.upcomingEvent') || 'Upcoming Event'}
							</h2>

							{upcomingCongress ? (
								<div className="flex-1 flex flex-col">
									<h3 className="font-medium text-lg mb-2">
										{upcomingCongress.title}
									</h3>

									<div className="flex items-center mb-4 text-sm text-gray-500 dark:text-gray-400">
										<Calendar className="mr-1.5 h-4 w-4 flex-shrink-0" />
										<span>
											{formatDate(upcomingCongress.start_date)} -{' '}
											{formatDate(upcomingCongress.end_date)}
										</span>
									</div>

									<div className="mb-4 flex-1">
										<p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
											{upcomingCongress.description ||
												t('dashboard.noDescription')}
										</p>
									</div>

									<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-center justify-between mt-auto">
										<div>
											<p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
												TIME UNTIL EVENT
											</p>
											<p className="text-lg font-bold text-blue-700 dark:text-blue-300">
												{formatTimeRemaining(upcomingCongress.start_date)}
											</p>
										</div>
										<Clock className="h-8 w-8 text-blue-500 dark:text-blue-400" />
									</div>
								</div>
							) : (
								<div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
									<Calendar className="h-12 w-12 text-gray-400 mb-3" />
									<p className="text-gray-500 dark:text-gray-400 mb-4">
										No upcoming events scheduled
									</p>
									<Link
										href="/dashboard/congresses"
										className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
									>
										<Plus className="h-4 w-4 mr-2" />
										<span>Add New Event</span>
									</Link>
								</div>
							)}
						</motion.div>
					</div>

					{/* Charts Section */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
						{/* Abstracts by Theme Chart */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4 }}
							className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
						>
							<h2 className="font-semibold mb-4 flex items-center">
								<BarChart3 className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
								{t('dashboard.charts.abstractsByTheme') || 'Abstracts by Theme'}
							</h2>
							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={abstractsByTheme}
											cx="50%"
											cy="50%"
											labelLine={true}
											outerRadius={80}
											fill="#8884d8"
											dataKey="value"
											label={({ name, percent }) =>
												`${name} ${(percent * 100).toFixed(0)}%`
											}
										>
											{abstractsByTheme.map((entry, index) => (
												<Cell
													key={`cell-${index}`}
													fill={COLORS[index % COLORS.length]}
												/>
											))}
										</Pie>
										<Tooltip formatter={(value) => [`${value}`, 'Count']} />
										<Legend />
									</PieChart>
								</ResponsiveContainer>
							</div>
						</motion.div>

						{/* Activity Types Chart */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.2 }}
							className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
						>
							<h2 className="font-semibold mb-4 flex items-center">
								<TrendingUp className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
								{t('dashboard.charts.activityTypes') || 'Activity Types'}
							</h2>
							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={activityTypes}
										margin={{
											top: 5,
											right: 30,
											left: 20,
											bottom: 25,
										}}
									>
										<CartesianGrid strokeDasharray="3 3" opacity={0.1} />
										<XAxis dataKey="name" angle={-45} textAnchor="end" />
										<YAxis />
										<Tooltip
											contentStyle={{
												backgroundColor: 'rgba(255, 255, 255, 0.9)',
												borderRadius: '8px',
												boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
												border: 'none',
											}}
										/>
										<Legend />
										<Bar
											dataKey="count"
											name="Count"
											radius={[4, 4, 0, 0]}
											fill="#10B981"
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</motion.div>
					</div>

					{/* Quick Actions */}
					<div className="mb-8">
						<h2 className="text-lg font-semibold mb-4 flex items-center">
							<Plus className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
							{t('dashboard.quickActions')}
						</h2>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<Link
								href="/dashboard/congresses"
								className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm hover:shadow-md"
							>
								<div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/30 mr-3">
									<Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
								</div>
								<span>{t('dashboard.add.congress')}</span>
							</Link>

							<Link
								href="/dashboard/events"
								className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm hover:shadow-md"
							>
								<div className="rounded-full p-2 bg-green-100 dark:bg-green-900/30 mr-3">
									<Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
								</div>
								<span>{t('dashboard.add.event')}</span>
							</Link>

							<Link
								href="/dashboard/media"
								className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm hover:shadow-md"
							>
								<div className="rounded-full p-2 bg-purple-100 dark:bg-purple-900/30 mr-3">
									<FileImage className="h-5 w-5 text-purple-600 dark:text-purple-400" />
								</div>
								<span>{t('dashboard.add.media')}</span>
							</Link>

							<Link
								href="/dashboard/profile"
								className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm hover:shadow-md"
							>
								<div className="rounded-full p-2 bg-amber-100 dark:bg-amber-900/30 mr-3">
									<CircleUser className="h-5 w-5 text-amber-600 dark:text-amber-400" />
								</div>
								<span>{t('dashboard.update.profile')}</span>
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
							<div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-between items-center">
								<h2 className="font-semibold flex items-center">
									<Calendar className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
									{t('dashboard.recent.congresses')}
								</h2>
								<Link
									href="/dashboard/congresses"
									className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
								>
									{t('dashboard.viewAll.text')}
								</Link>
							</div>
							<div className="divide-y divide-gray-200 dark:divide-gray-700">
								{recentCongresses.length > 0 ? (
									recentCongresses.map((congress) => (
										<div
											key={congress.id}
											className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
										>
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
										{t('dashboard.no.congresses')}
									</div>
								)}
							</div>
						</motion.div>

						{/* Recent Abstracts */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.2 }}
							className="rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
						>
							<div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-between items-center">
								<h2 className="font-semibold flex items-center">
									<FileText className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
									{t('dashboard.recent.abstracts')}
								</h2>
								<Link
									href="/abstracts"
									className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
								>
									{t('dashboard.viewAll.text')}
								</Link>
							</div>
							<div className="divide-y divide-gray-200 dark:divide-gray-700">
								{recentAbstracts.length > 0 ? (
									recentAbstracts.map((abstract) => (
										<div
											key={abstract.id}
											className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
										>
											<h3 className="font-medium">{abstract.title}</h3>
											<div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
												<User className="mr-1.5 h-4 w-4 flex-shrink-0" />
												{abstract.author_name || t('dashboard.anonymousAuthor')}
											</div>
											<div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
												<div className="mr-1.5 h-4 w-4 flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
													<span className="text-[8px] font-bold text-blue-800 dark:text-blue-300">
														T
													</span>
												</div>
												{abstract.theme || 'General'}
											</div>
										</div>
									))
								) : (
									<div className="p-6 text-center text-gray-500 dark:text-gray-400">
										{t('dashboard.no.abstracts')}
									</div>
								)}
							</div>
						</motion.div>
					</div>
				</>
			)}
		</div>
	);
}
