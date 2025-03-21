'use client';

import AddContentForm from '@/components/dashboard/AddContentForm';
import ContentCard from '@/components/dashboard/ContentCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Database } from '@/types/supabase';
import { motion } from 'framer-motion';
import { Loader2, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Define types for our content
type Activity = Database['public']['Tables']['activities']['Row'];

export default function EventsPage() {
	const { t } = useTranslation();
	const { isAuthenticated } = useAuth();
	const [activities, setActivities] = useState<Activity[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const [showAddForm, setShowAddForm] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);

	// Fetch data from Supabase
	useEffect(() => {
		if (!isAuthenticated) return;

		const fetchData = async () => {
			setLoading(true);
			try {
				// Fetch activities
				const { data: activityData, error: activityError } = await supabase
					.from('activities')
					.select('*')
					.is('deleted_at', null)
					.order('start_date', { ascending: false });

				if (activityError) throw activityError;
				setActivities(activityData || []);
				setFilteredActivities(activityData || []);
			} catch (error) {
				console.error('Error fetching data:', error);
			} finally {
				setTimeout(() => {
					setLoading(false);
				}, 300); // Small delay to prevent flickering
			}
		};

		fetchData();
	}, [isAuthenticated, refreshTrigger]);

	// Filter activities when search query changes
	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredActivities(activities);
			return;
		}

		const query = searchQuery.toLowerCase();
		const filtered = activities.filter(
			(activity) =>
				activity.title.toLowerCase().includes(query) ||
				activity.description?.toLowerCase().includes(query) ||
				false
		);

		setFilteredActivities(filtered);
	}, [searchQuery, activities]);

	// Handle refresh data
	const handleRefreshData = () => {
		setRefreshTrigger((prev) => prev + 1);
	};

	// Create tag objects for activities
	const getActivityTags = (activity: Activity) => {
		return [
			{
				label: activity.type,
				color: 'green' as const,
			},
			{
				label: `$${activity.price}`,
				color: 'purple' as const,
			},
		];
	};

	// Handle add content success
	const handleAddContentSuccess = () => {
		setShowAddForm(false);
		handleRefreshData();
	};

	return (
		<>
			<div className="mb-8">
				<h1 className="text-2xl font-bold">
					{t('dashboard.events.title') || 'Manage Events'}
				</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">
					{t('dashboard.events.description') ||
						'Create and manage events, workshops, and activities'}
				</p>
			</div>

			{/* Search and Add Button */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
				<div className="relative w-full sm:w-64 md:w-96">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
					<input
						type="text"
						placeholder={t('dashboard.search') || 'Search events...'}
						className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<button
					onClick={() => setShowAddForm(true)}
					className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
				>
					<Plus className="h-4 w-4" />
					<span>Add New Event</span>
				</button>
			</div>

			{loading ? (
				<div className="flex justify-center items-center h-64">
					<Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
				</div>
			) : (
				<>
					{/* Add Content Form */}
					{showAddForm && (
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
							className="mb-8"
						>
							<AddContentForm
								tableName="activities"
								onSuccess={handleAddContentSuccess}
								onCancel={() => setShowAddForm(false)}
							/>
						</motion.div>
					)}

					{/* Activities Content */}
					{!showAddForm && (
						<div className="space-y-6">
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
								{filteredActivities.map((activity) => (
									<ContentCard
										key={activity.id}
										id={activity.id}
										title={activity.title}
										description={activity.description}
										startDate={activity.start_date}
										endDate={activity.end_date}
										imageUrl={null} // Activities don't have images in the schema
										tags={getActivityTags(activity)}
										tableName="activities"
										onDelete={handleRefreshData}
										onUpdate={handleRefreshData}
									/>
								))}

								{filteredActivities.length === 0 && (
									<div className="col-span-full flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
										{searchQuery ? (
											<>
												<p className="text-gray-500 dark:text-gray-400 mb-4 text-center">
													No events found matching "{searchQuery}"
												</p>
												<button
													onClick={() => setSearchQuery('')}
													className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
												>
													Clear Search
												</button>
											</>
										) : (
											<>
												<p className="text-gray-500 dark:text-gray-400 mb-4 text-center">
													No events found. Create your first event to get
													started.
												</p>
												<button
													onClick={() => setShowAddForm(true)}
													className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
												>
													<Plus className="h-4 w-4" />
													<span>Add Event</span>
												</button>
											</>
										)}
									</div>
								)}
							</div>
						</div>
					)}
				</>
			)}
		</>
	);
}
