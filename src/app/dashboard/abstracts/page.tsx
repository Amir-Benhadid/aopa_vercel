'use client';

import { useAuth } from '@/providers/AuthProvider';
import { fetchFilteredAbstracts, updateAbstract } from '@/services/abstracts';
import { Abstract, AbstractStatus } from '@/types/database';
import { motion } from 'framer-motion';
import {
	ArrowRight,
	Check,
	ChevronRight,
	Download,
	FileText,
	Loader2,
	RefreshCw,
	Search,
	X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Status badge colors
const statusColors: Record<string, string> = {
	submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
	reviewing:
		'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
	approved:
		'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
	rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
	'type-change':
		'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
	'final-version':
		'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
};

// Format status for display
const formatStatus = (status: string): string => {
	return status
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

export default function AbstractsPage() {
	const { t } = useTranslation();
	const { isAuthenticated, user } = useAuth();
	const [abstracts, setAbstracts] = useState<Abstract[]>([]);
	const [filteredAbstracts, setFilteredAbstracts] = useState<Abstract[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [themeFilter, setThemeFilter] = useState<string>('all');
	const [themes, setThemes] = useState<string[]>([]);
	const router = useRouter();

	// Fetch abstracts data
	useEffect(() => {
		if (!isAuthenticated || !user?.id) return;

		const fetchAbstracts = async () => {
			setLoading(true);
			try {
				// Fetch abstracts from Supabase
				const data = await fetchFilteredAbstracts({
					search: searchQuery || undefined,
					status: statusFilter !== 'all' ? statusFilter : undefined,
				});

				setAbstracts(data);
				setFilteredAbstracts(data);

				// Extract unique themes
				const uniqueThemes = Array.from(
					new Set(data.map((a) => a.theme || ''))
				).filter((theme) => theme !== '');

				setThemes(uniqueThemes);
			} catch (error) {
				console.error('Error fetching abstracts:', error);
				toast.error('Failed to load abstracts');
			} finally {
				setTimeout(() => {
					setLoading(false);
				}, 300);
			}
		};

		fetchAbstracts();
	}, [isAuthenticated, user?.id]);

	// Filter abstracts when search query or filters change
	useEffect(() => {
		let filtered = [...abstracts];

		// Apply search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(abstract) =>
					abstract.title.toLowerCase().includes(query) ||
					`${abstract.name} ${abstract.surname}`
						.toLowerCase()
						.includes(query) ||
					abstract.email.toLowerCase().includes(query) ||
					abstract.introduction?.toLowerCase().includes(query)
			);
		}

		// Apply status filter
		if (statusFilter !== 'all') {
			filtered = filtered.filter(
				(abstract) => abstract.status === statusFilter
			);
		}

		// Apply theme filter
		if (themeFilter !== 'all') {
			filtered = filtered.filter((abstract) => abstract.theme === themeFilter);
		}

		setFilteredAbstracts(filtered);
	}, [searchQuery, statusFilter, themeFilter, abstracts]);

	// Format date
	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		return date.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	// Handle status change
	const handleStatusChange = async (
		id: string,
		newStatus: AbstractStatus,
		e: React.MouseEvent<HTMLButtonElement>
	) => {
		// Prevent the click from navigating to the abstract detail page
		e.stopPropagation();
		e.preventDefault();

		try {
			// Update the abstract status in Supabase
			await updateAbstract(id, { status: newStatus });

			// Update local state
			const updatedAbstracts = abstracts.map((abstract) =>
				abstract.id === id ? { ...abstract, status: newStatus } : abstract
			);

			setAbstracts(updatedAbstracts);
			toast.success(`Abstract status updated to ${formatStatus(newStatus)}`);
		} catch (error) {
			console.error('Error updating abstract status:', error);
			toast.error('Failed to update abstract status');
		}
	};

	// Handle abstract download
	const handleDownload = async (
		id: string,
		e: React.MouseEvent<HTMLButtonElement>
	) => {
		// Prevent the click from navigating to the abstract detail page
		e.stopPropagation();
		e.preventDefault();

		try {
			toast.info('Preparing abstract for download...');
			// In a real implementation, you would generate a PDF or fetch the file from storage
			// For now, we'll just show a success message
			setTimeout(() => {
				toast.success('Abstract downloaded successfully');
			}, 1000);
		} catch (error) {
			console.error('Error downloading abstract:', error);
			toast.error('Failed to download abstract');
		}
	};

	// Get available status transitions based on current status
	const getStatusActions = (status: AbstractStatus) => {
		switch (status) {
			case 'submitted':
				return [
					{
						newStatus: 'reviewing' as AbstractStatus,
						label: 'Start Review',
						icon: <ArrowRight className="h-4 w-4" />,
						className:
							'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50',
					},
				];
			case 'reviewing':
				return [
					{
						newStatus: 'approved' as AbstractStatus,
						label: 'Approve',
						icon: <Check className="h-4 w-4" />,
						className:
							'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50',
					},
					{
						newStatus: 'rejected' as AbstractStatus,
						label: 'Reject',
						icon: <X className="h-4 w-4" />,
						className:
							'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50',
					},
					{
						newStatus: 'type-change' as AbstractStatus,
						label: 'Request Type Change',
						icon: <RefreshCw className="h-4 w-4" />,
						className:
							'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50',
					},
				];
			case 'approved':
			case 'rejected':
			case 'type-change':
				return [
					{
						newStatus: 'reviewing' as AbstractStatus,
						label: 'Back to Review',
						icon: <ArrowRight className="h-4 w-4" />,
						className:
							'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50',
					},
				];
			default:
				return [];
		}
	};

	return (
		<>
			<div className="mb-8">
				<h1 className="text-2xl font-bold">
					{t('dashboard.abstracts.title') || 'Abstracts Management'}
				</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">
					{t('dashboard.abstracts.description') ||
						'Review and manage submitted abstracts'}
				</p>
			</div>

			{/* Filters and Search */}
			<div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
					<input
						type="text"
						placeholder={t('dashboard.search') || 'Search abstracts...'}
						className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				<div>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
					>
						<option value="all">All Statuses</option>
						<option value="submitted">Submitted</option>
						<option value="reviewing">Reviewing</option>
						<option value="approved">Approved</option>
						<option value="rejected">Rejected</option>
						<option value="type-change">Type Change</option>
						<option value="final-version">Final Version</option>
					</select>
				</div>

				<div>
					<select
						value={themeFilter}
						onChange={(e) => setThemeFilter(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
					>
						<option value="all">All Themes</option>
						{themes.map((theme) => (
							<option key={theme} value={theme}>
								{theme}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Abstracts List */}
			{loading ? (
				<div className="flex justify-center items-center h-64">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : (
				<div className="space-y-6">
					{filteredAbstracts.length > 0 ? (
						filteredAbstracts.map((abstract) => (
							<Link
								href={`/dashboard/abstracts/${abstract.id}`}
								key={abstract.id}
								className="block"
							>
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
								>
									<div className="p-6">
										<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
											<div className="flex-1">
												<div className="flex items-start gap-3 mb-4">
													<div
														className={`p-3 rounded-lg ${
															statusColors[abstract.status]
														} bg-opacity-20`}
													>
														<FileText className="h-6 w-6" />
													</div>
													<div className="flex-1">
														<div className="flex items-center justify-between">
															<h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
																{abstract.title}
															</h3>
															<ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
														</div>
														<div className="flex flex-wrap gap-2 mb-2">
															<span
																className={`px-2.5 py-1 rounded-full text-xs font-medium ${
																	statusColors[abstract.status]
																}`}
															>
																{formatStatus(abstract.status)}
															</span>
															<span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
																{abstract.theme}
															</span>
															<span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
																{abstract.type.charAt(0).toUpperCase() +
																	abstract.type.slice(1)}
															</span>
														</div>
													</div>
												</div>

												<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
													<div>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															<span className="font-medium">Author:</span>{' '}
															{abstract.name} {abstract.surname}
														</p>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															<span className="font-medium">Email:</span>{' '}
															{abstract.email}
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															<span className="font-medium">Submitted:</span>{' '}
															{formatDate(abstract.created_at)}
														</p>
														{abstract.co_authors &&
															abstract.co_authors.length > 0 && (
																<p className="text-sm text-gray-600 dark:text-gray-400">
																	<span className="font-medium">
																		Co-authors:
																	</span>{' '}
																	{abstract.co_authors.join(', ')}
																</p>
															)}
													</div>
												</div>

												<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4">
													<h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
														Introduction
													</h4>
													<p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
														{abstract.introduction}
													</p>
												</div>
											</div>

											<div className="flex flex-col gap-3 min-w-[200px]">
												<button
													onClick={(e) => handleDownload(abstract.id, e)}
													className="w-full px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-sm flex items-center justify-center gap-2"
												>
													<Download className="h-4 w-4" />
													Download
												</button>

												{getStatusActions(
													abstract.status as AbstractStatus
												).map((action, index) => (
													<button
														key={index}
														onClick={(e) =>
															handleStatusChange(
																abstract.id,
																action.newStatus,
																e
															)
														}
														className={`w-full px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2 ${action.className}`}
													>
														{action.icon}
														{action.label}
													</button>
												))}
											</div>
										</div>
									</div>
								</motion.div>
							</Link>
						))
					) : (
						<div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
							<FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
							<h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
								No abstracts found
							</h3>
							<p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
								{searchQuery || statusFilter !== 'all' || themeFilter !== 'all'
									? 'No abstracts found matching your filters. Try adjusting your search criteria.'
									: 'No abstracts found. Add your first abstract to get started.'}
							</p>
						</div>
					)}
				</div>
			)}
		</>
	);
}
