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
type Congress = Database['public']['Tables']['congresses']['Row'];

export default function CongressesPage() {
	const { t } = useTranslation();
	const { isAuthenticated } = useAuth();
	const [congresses, setCongresses] = useState<Congress[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const [showAddForm, setShowAddForm] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [filteredCongresses, setFilteredCongresses] = useState<Congress[]>([]);

	// Format image URLs helper
	const formatImageUrl = (url: string | null): string | null => {
		if (!url) return null;

		// If it's already an absolute URL (starts with http:// or https://), return as is
		if (url.startsWith('http://') || url.startsWith('https://')) {
			return url;
		}

		// If it's a relative path without a leading slash, add one
		if (!url.startsWith('/')) {
			return `/${url}`;
		}

		return url;
	};

	// Fetch data from Supabase
	useEffect(() => {
		if (!isAuthenticated) return;

		const fetchData = async () => {
			setLoading(true);
			try {
				// Fetch congresses
				const { data: congressData, error: congressError } = await supabase
					.from('congresses')
					.select('*')
					.is('deleted_at', null)
					.order('start_date', { ascending: false });

				if (congressError) throw congressError;

				// Format image URLs in congress data
				const formattedCongressData =
					congressData?.map((congress) => ({
						...congress,
						banner: formatImageUrl(congress.banner),
					})) || [];

				setCongresses(formattedCongressData);
				setFilteredCongresses(formattedCongressData);
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

	// Filter congresses when search query changes
	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredCongresses(congresses);
			return;
		}

		const query = searchQuery.toLowerCase();
		const filtered = congresses.filter(
			(congress) =>
				congress.title.toLowerCase().includes(query) ||
				congress.description?.toLowerCase().includes(query) ||
				false
		);

		setFilteredCongresses(filtered);
	}, [searchQuery, congresses]);

	// Handle refresh data
	const handleRefreshData = () => {
		setRefreshTrigger((prev) => prev + 1);
	};

	// Create tag objects for congresses
	const getCongressTags = (congress: Congress) => {
		return [
			{
				label: congress.congress_type,
				color: 'blue' as const,
			},
			{
				label: congress.state === 1 ? 'Active' : 'Inactive',
				color: congress.state === 1 ? ('green' as const) : ('gray' as const),
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
					{t('dashboard.congresses.title') || 'Manage Congresses'}
				</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">
					{t('dashboard.congresses.description') ||
						'Create and manage congresses and conferences'}
				</p>
			</div>

			{/* Search and Add Button */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
				<div className="relative w-full sm:w-64 md:w-96">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
					<input
						type="text"
						placeholder={t('dashboard.search') || 'Search congresses...'}
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
					<span>Add New Congress</span>
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
								tableName="congresses"
								onSuccess={handleAddContentSuccess}
								onCancel={() => setShowAddForm(false)}
							/>
						</motion.div>
					)}

					{/* Congresses Content */}
					{!showAddForm && (
						<div className="space-y-6">
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
								{filteredCongresses.map((congress) => (
									<ContentCard
										key={congress.id}
										id={congress.id}
										title={congress.title}
										description={congress.description}
										startDate={congress.start_date}
										endDate={congress.end_date}
										imageUrl={congress.banner}
										tags={getCongressTags(congress)}
										tableName="congresses"
										onDelete={handleRefreshData}
										onUpdate={handleRefreshData}
									/>
								))}

								{filteredCongresses.length === 0 && (
									<div className="col-span-full flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
										{searchQuery ? (
											<>
												<p className="text-gray-500 dark:text-gray-400 mb-4 text-center">
													No congresses found matching "{searchQuery}"
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
													No congresses found. Create your first congress to get
													started.
												</p>
												<button
													onClick={() => setShowAddForm(true)}
													className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
												>
													<Plus className="h-4 w-4" />
													<span>Add Congress</span>
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
