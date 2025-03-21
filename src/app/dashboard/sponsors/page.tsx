'use client';

import { useAuth } from '@/providers/AuthProvider';
import { deleteSponsor, fetchSponsors } from '@/services/sponsors';
import { Sponsor } from '@/types/database';
import { motion } from 'framer-motion';
import {
	ArrowUpDown,
	Briefcase,
	Edit,
	Globe,
	Loader2,
	Plus,
	Search,
	Trash,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Tier badge colors
const tierColors: Record<string, string> = {
	platinum: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
	gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
	silver: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300',
	bronze:
		'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function SponsorsPage() {
	const { t } = useTranslation();
	const { isAuthenticated, user } = useAuth();
	const [sponsors, setSponsors] = useState<Sponsor[]>([]);
	const [filteredSponsors, setFilteredSponsors] = useState<Sponsor[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [tierFilter, setTierFilter] = useState<string>('all');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [sortField, setSortField] = useState<string>('name');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

	// Fetch sponsors data
	useEffect(() => {
		if (!isAuthenticated) return;

		const loadSponsors = async () => {
			setLoading(true);
			try {
				// Fetch sponsors from Supabase
				const data = await fetchSponsors({
					search: searchQuery || undefined,
					tier: tierFilter !== 'all' ? tierFilter : undefined,
					active:
						statusFilter !== 'all' ? statusFilter === 'active' : undefined,
				});

				setSponsors(data);
				setFilteredSponsors(data);
			} catch (error) {
				console.error('Error fetching sponsors:', error);
				toast.error('Failed to load sponsors');
			} finally {
				setTimeout(() => {
					setLoading(false);
				}, 300);
			}
		};

		loadSponsors();
	}, [isAuthenticated]);

	// Filter and sort sponsors when filters or sort options change
	useEffect(() => {
		let filtered = [...sponsors];

		// Apply search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(sponsor) =>
					sponsor.name.toLowerCase().includes(query) ||
					sponsor.website.toLowerCase().includes(query)
			);
		}

		// Apply tier filter
		if (tierFilter !== 'all') {
			filtered = filtered.filter(
				(sponsor) => sponsor.sponsorship_level === tierFilter
			);
		}

		// Apply sorting
		filtered.sort((a, b) => {
			let valueA, valueB;

			// Determine which field to sort by
			switch (sortField) {
				case 'name':
					valueA = a.name.toLowerCase();
					valueB = b.name.toLowerCase();
					break;
				case 'tier':
					// Custom tier order: platinum > gold > silver > bronze
					const tierOrder = { platinum: 4, gold: 3, silver: 2, bronze: 1 };
					valueA =
						tierOrder[a.sponsorship_level as keyof typeof tierOrder] || 0;
					valueB =
						tierOrder[b.sponsorship_level as keyof typeof tierOrder] || 0;
					break;
				default:
					valueA = a.name.toLowerCase();
					valueB = b.name.toLowerCase();
			}

			// Apply sort direction
			if (sortDirection === 'asc') {
				return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
			} else {
				return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
			}
		});

		setFilteredSponsors(filtered);
	}, [
		searchQuery,
		tierFilter,
		statusFilter,
		sortField,
		sortDirection,
		sponsors,
	]);

	// Handle sort change
	const handleSortChange = (field: string) => {
		if (field === sortField) {
			// Toggle direction if clicking the same field
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			// Set new field and default to ascending
			setSortField(field);
			setSortDirection('asc');
		}
	};

	// Handle sponsor deletion
	const handleDelete = async (id: string) => {
		if (!confirm('Are you sure you want to delete this sponsor?')) return;

		try {
			await deleteSponsor(id);

			// Update local state
			const updatedSponsors = sponsors.filter((sponsor) => sponsor.id !== id);
			setSponsors(updatedSponsors);

			toast.success('Sponsor deleted successfully');
		} catch (error) {
			console.error('Error deleting sponsor:', error);
			toast.error('Failed to delete sponsor');
		}
	};

	return (
		<>
			<div className="mb-8">
				<h1 className="text-2xl font-bold">
					{t('dashboard.sponsors.title') || 'Sponsors Management'}
				</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">
					{t('dashboard.sponsors.description') ||
						'Manage sponsors and partnerships'}
				</p>
			</div>

			{/* Filters and Search */}
			<div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
					<input
						type="text"
						placeholder={t('dashboard.search') || 'Search sponsors...'}
						className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				<div>
					<select
						value={tierFilter}
						onChange={(e) => setTierFilter(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
					>
						<option value="all">All Tiers</option>
						<option value="platinum">Platinum</option>
						<option value="gold">Gold</option>
						<option value="silver">Silver</option>
						<option value="bronze">Bronze</option>
					</select>
				</div>

				<div>
					<button
						onClick={() => {
							// In a real app, this would open a modal to add a new sponsor
							toast.info('Add sponsor functionality would open a form here');
						}}
						className="flex items-center justify-center w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
					>
						<Plus className="h-4 w-4 mr-2" />
						<span>Add New Sponsor</span>
					</button>
				</div>
			</div>

			{/* Sponsors Table */}
			{loading ? (
				<div className="flex justify-center items-center h-64">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : (
				<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										<button
											onClick={() => handleSortChange('name')}
											className="flex items-center focus:outline-none"
										>
											Sponsor
											{sortField === 'name' && (
												<ArrowUpDown
													className={`ml-1 h-4 w-4 ${
														sortDirection === 'asc'
															? 'transform rotate-180'
															: ''
													}`}
												/>
											)}
										</button>
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										<button
											onClick={() => handleSortChange('tier')}
											className="flex items-center focus:outline-none"
										>
											Tier
											{sortField === 'tier' && (
												<ArrowUpDown
													className={`ml-1 h-4 w-4 ${
														sortDirection === 'asc'
															? 'transform rotate-180'
															: ''
													}`}
												/>
											)}
										</button>
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Website
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
								{filteredSponsors.length > 0 ? (
									filteredSponsors.map((sponsor) => (
										<motion.tr
											key={sponsor.id}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
										>
											<td className="px-4 py-4 whitespace-nowrap">
												<div className="flex items-center">
													<div className="h-10 w-10 flex-shrink-0 mr-3 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
														{sponsor.logo ? (
															<Image
																src={sponsor.logo}
																alt={sponsor.name}
																width={40}
																height={40}
																className="h-10 w-10 object-contain"
															/>
														) : (
															<Briefcase className="h-6 w-6 m-2 text-gray-400" />
														)}
													</div>
													<div>
														<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
															{sponsor.name}
														</div>
													</div>
												</div>
											</td>
											<td className="px-4 py-4 whitespace-nowrap">
												<span
													className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
														tierColors[sponsor.sponsorship_level] ||
														'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
													}`}
												>
													{sponsor.sponsorship_level.charAt(0).toUpperCase() +
														sponsor.sponsorship_level.slice(1)}
												</span>
											</td>
											<td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
												{sponsor.website ? (
													<a
														href={sponsor.website}
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center hover:text-primary"
													>
														<Globe className="h-4 w-4 mr-1" />
														{sponsor.website.replace(/(^\w+:|^)\/\//, '')}
													</a>
												) : (
													<span className="text-gray-400">No website</span>
												)}
											</td>
											<td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
												<button
													onClick={() => {
														// In a real app, this would open an edit modal
														toast.info(
															'Edit sponsor functionality would open a form here'
														);
													}}
													className="text-primary hover:text-primary/80 mr-3"
												>
													<Edit className="h-4 w-4" />
												</button>
												<button
													onClick={() => handleDelete(sponsor.id)}
													className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
												>
													<Trash className="h-4 w-4" />
												</button>
											</td>
										</motion.tr>
									))
								) : (
									<tr>
										<td
											colSpan={4}
											className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
										>
											{searchQuery || tierFilter !== 'all'
												? 'No sponsors found matching your filters'
												: 'No sponsors found. Add your first sponsor to get started.'}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</>
	);
}
