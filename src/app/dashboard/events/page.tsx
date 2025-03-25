'use client';

import AddContentForm from '@/components/dashboard/AddContentForm';
import ContentCard from '@/components/dashboard/ContentCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Database } from '@/types/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import {
	Calendar,
	ChevronDown,
	Loader2,
	Plus,
	Search,
	SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Define types for our content
type Activity = Database['public']['Tables']['activities']['Row'] & {
	location?: string | null;
};

// Define type for tags
type Tag = {
	label: string;
	color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'gray';
};

// Filter options
type FilterTab = 'all' | 'upcoming' | 'ongoing' | 'past';
type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high';

export default function EventsPage() {
	const { t } = useTranslation();
	const { isAuthenticated } = useAuth();
	const [activities, setActivities] = useState<Activity[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const [showAddForm, setShowAddForm] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);

	// New state for filtering and sorting
	const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
	const [sortOption, setSortOption] = useState<SortOption>('newest');
	const [showFilterMenu, setShowFilterMenu] = useState(false);

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

	// Filter and sort activities when filters change
	useEffect(() => {
		let filtered = [...activities];

		// Apply search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(activity) =>
					activity.title.toLowerCase().includes(query) ||
					activity.description?.toLowerCase().includes(query) ||
					false
			);
		}

		// Apply tab filter
		const now = new Date();
		if (activeFilter !== 'all') {
			filtered = filtered.filter((activity) => {
				const startDate = new Date(activity.start_date);
				const endDate = new Date(activity.end_date);

				switch (activeFilter) {
					case 'upcoming':
						return startDate > now;
					case 'ongoing':
						return startDate <= now && endDate >= now;
					case 'past':
						return endDate < now;
					default:
						return true;
				}
			});
		}

		// Apply sorting
		filtered.sort((a, b) => {
			switch (sortOption) {
				case 'newest':
					return (
						new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
					);
				case 'oldest':
					return (
						new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
					);
				case 'price-low':
					return (a.price || 0) - (b.price || 0);
				case 'price-high':
					return (b.price || 0) - (a.price || 0);
				default:
					return 0;
			}
		});

		setFilteredActivities(filtered);
	}, [searchQuery, activities, activeFilter, sortOption]);

	// Handle refresh data
	const handleRefreshData = () => {
		setRefreshTrigger((prev) => prev + 1);
	};

	// Create tag objects for activities
	const getActivityTags = (activity: Activity): Tag[] => {
		const tags: Tag[] = [
			{
				label: activity.type,
				color: 'green',
			},
		];

		// Add price tag if price exists and is greater than 0
		if (activity.price && activity.price > 0) {
			tags.push({
				label: `$${activity.price}`,
				color: 'purple',
			});
		}

		// Add location tag if it exists
		if (activity.location) {
			tags.push({
				label: activity.location,
				color: 'blue',
			});
		}

		return tags;
	};

	// Handle add content success
	const handleAddContentSuccess = () => {
		setShowAddForm(false);
		handleRefreshData();
	};

	// Get counts for filter tabs
	const getFilterCounts = () => {
		const now = new Date();
		const counts = {
			all: activities.length,
			upcoming: 0,
			ongoing: 0,
			past: 0,
		};

		activities.forEach((activity) => {
			const startDate = new Date(activity.start_date);
			const endDate = new Date(activity.end_date);

			if (startDate > now) {
				counts.upcoming++;
			} else if (startDate <= now && endDate >= now) {
				counts.ongoing++;
			} else {
				counts.past++;
			}
		});

		return counts;
	};

	const filterCounts = getFilterCounts();

	return (
		<>
			<div className="mb-6">
				<motion.h1
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="text-2xl font-bold"
				>
					{t('dashboard.events.title') || 'Manage Events'}
				</motion.h1>
				<motion.p
					initial={{ opacity: 0, y: -5 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.1 }}
					className="text-gray-600 dark:text-gray-400 mt-1"
				>
					{t('dashboard.events.description') ||
						'Create and manage events, workshops, and activities'}
				</motion.p>
			</div>

			{/* Filter Tabs */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.2 }}
				className="flex overflow-x-auto scrollbar-hide mb-6 border-b border-gray-200 dark:border-gray-700"
			>
				<button
					onClick={() => setActiveFilter('all')}
					className={`flex items-center px-4 py-2 whitespace-nowrap border-b-2 ${
						activeFilter === 'all'
							? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-medium'
							: 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
					}`}
				>
					All Events
					<span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full px-2 py-0.5">
						{filterCounts.all}
					</span>
				</button>
				<button
					onClick={() => setActiveFilter('upcoming')}
					className={`flex items-center px-4 py-2 whitespace-nowrap border-b-2 ${
						activeFilter === 'upcoming'
							? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-medium'
							: 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
					}`}
				>
					Upcoming
					<span className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full px-2 py-0.5">
						{filterCounts.upcoming}
					</span>
				</button>
				<button
					onClick={() => setActiveFilter('ongoing')}
					className={`flex items-center px-4 py-2 whitespace-nowrap border-b-2 ${
						activeFilter === 'ongoing'
							? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400 font-medium'
							: 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
					}`}
				>
					Ongoing
					<span className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full px-2 py-0.5">
						{filterCounts.ongoing}
					</span>
				</button>
				<button
					onClick={() => setActiveFilter('past')}
					className={`flex items-center px-4 py-2 whitespace-nowrap border-b-2 ${
						activeFilter === 'past'
							? 'border-gray-600 text-gray-600 dark:border-gray-400 dark:text-gray-400 font-medium'
							: 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
					}`}
				>
					Past Events
					<span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full px-2 py-0.5">
						{filterCounts.past}
					</span>
				</button>
			</motion.div>

			{/* Search and Add Button */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.3 }}
				className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
			>
				<div className="flex w-full sm:w-auto gap-2">
					<div className="relative w-full sm:w-64 md:w-80">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
						<input
							type="text"
							placeholder={t('dashboard.search') || 'Search events...'}
							className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					<div className="relative">
						<button
							onClick={() => setShowFilterMenu(!showFilterMenu)}
							className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
						>
							<SlidersHorizontal className="h-4 w-4" />
							<span className="hidden sm:inline">Sort</span>
							<ChevronDown className="h-4 w-4" />
						</button>

						{showFilterMenu && (
							<div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
								<div className="py-1">
									<button
										onClick={() => {
											setSortOption('newest');
											setShowFilterMenu(false);
										}}
										className={`flex items-center w-full px-4 py-2 text-sm ${
											sortOption === 'newest'
												? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
												: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
										}`}
									>
										Newest First
									</button>
									<button
										onClick={() => {
											setSortOption('oldest');
											setShowFilterMenu(false);
										}}
										className={`flex items-center w-full px-4 py-2 text-sm ${
											sortOption === 'oldest'
												? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
												: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
										}`}
									>
										Oldest First
									</button>
									<button
										onClick={() => {
											setSortOption('price-low');
											setShowFilterMenu(false);
										}}
										className={`flex items-center w-full px-4 py-2 text-sm ${
											sortOption === 'price-low'
												? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
												: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
										}`}
									>
										Price: Low to High
									</button>
									<button
										onClick={() => {
											setSortOption('price-high');
											setShowFilterMenu(false);
										}}
										className={`flex items-center w-full px-4 py-2 text-sm ${
											sortOption === 'price-high'
												? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
												: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
										}`}
									>
										Price: High to Low
									</button>
								</div>
							</div>
						)}
					</div>
				</div>

				<button
					onClick={() => setShowAddForm(true)}
					className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
				>
					<Plus className="h-4 w-4" />
					<span>Add New Event</span>
				</button>
			</motion.div>

			{loading ? (
				<div className="flex justify-center items-center h-64">
					<Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
				</div>
			) : (
				<>
					{/* Add Content Form */}
					<AnimatePresence mode="wait">
						{showAddForm && (
							<motion.div
								key="add-form"
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.3 }}
								className="mb-8 overflow-hidden"
							>
								<AddContentForm
									tableName="activities"
									onSuccess={handleAddContentSuccess}
									onCancel={() => setShowAddForm(false)}
								/>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Activities Content */}
					{!showAddForm && (
						<>
							{filteredActivities.length > 0 && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.3, delay: 0.2 }}
									className="mb-4 flex items-center text-sm text-gray-500 dark:text-gray-400"
								>
									<Calendar className="mr-2 h-4 w-4" />
									<span>
										Showing {filteredActivities.length} event
										{filteredActivities.length !== 1 ? 's' : ''}
									</span>
									{activeFilter !== 'all' && (
										<span className="ml-1">• {activeFilter} events</span>
									)}
									{searchQuery && (
										<span className="ml-1">
											• matching "{searchQuery}"
											<button
												onClick={() => setSearchQuery('')}
												className="ml-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
											>
												Clear
											</button>
										</span>
									)}
								</motion.div>
							)}

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: 0.4 }}
								className="space-y-6"
							>
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
									{filteredActivities.map((activity, index) => (
										<motion.div
											key={activity.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.3, delay: 0.1 * index }}
										>
											<ContentCard
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
										</motion.div>
									))}

									{filteredActivities.length === 0 && (
										<div className="col-span-full flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
											{activeFilter !== 'all' || searchQuery ? (
												<>
													<p className="text-gray-500 dark:text-gray-400 mb-4 text-center">
														No events found{' '}
														{searchQuery ? (
															<>matching "{searchQuery}"</>
														) : (
															<>in the "{activeFilter}" category</>
														)}
													</p>
													<div className="flex gap-2">
														{searchQuery && (
															<button
																onClick={() => setSearchQuery('')}
																className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
															>
																Clear Search
															</button>
														)}
														{activeFilter !== 'all' && (
															<button
																onClick={() => setActiveFilter('all')}
																className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
															>
																Show All Events
															</button>
														)}
													</div>
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
							</motion.div>
						</>
					)}
				</>
			)}
		</>
	);
}
