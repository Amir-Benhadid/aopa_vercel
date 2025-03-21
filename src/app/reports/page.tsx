'use client';

import { Button } from '@/components/ui/Button';
import { getAnnualReports } from '@/lib/api';
import { motion } from 'framer-motion';
import {
	Calendar,
	ChevronDown,
	Download,
	FileText,
	Search,
	Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Report {
	id: string;
	title: string;
	year: number;
	fileSize: string;
	downloadUrl?: string;
	published_at?: string;
	description?: string;
	authors?: string;
}

export default function ReportsPage() {
	const { t } = useTranslation();
	const [reports, setReports] = useState<Report[]>([]);
	const [filteredReports, setFilteredReports] = useState<Report[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortBy, setSortBy] = useState<'year' | 'title'>('year');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		async function fetchReports() {
			try {
				setIsLoading(true);
				const data = await getAnnualReports();
				setReports(data);
				setFilteredReports(data);
			} catch (err) {
				console.error('Error fetching reports:', err);
				setError('Failed to load reports');
			} finally {
				setIsLoading(false);
			}
		}

		fetchReports();
	}, []);

	useEffect(() => {
		// Filter and sort reports whenever search term or sort options change
		let result = [...reports];

		// Apply search filter
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			result = result.filter(
				(report) =>
					report.title.toLowerCase().includes(term) ||
					(report.description &&
						report.description.toLowerCase().includes(term)) ||
					(report.authors && report.authors.toLowerCase().includes(term)) ||
					report.year.toString().includes(term)
			);
		}

		// Apply sorting
		result.sort((a, b) => {
			if (sortBy === 'year') {
				return sortOrder === 'asc' ? a.year - b.year : b.year - a.year;
			} else {
				return sortOrder === 'asc'
					? a.title.localeCompare(b.title)
					: b.title.localeCompare(a.title);
			}
		});

		setFilteredReports(result);
	}, [reports, searchTerm, sortBy, sortOrder]);

	// Function to get cover image based on report title
	const getCoverImage = (title: string) => {
		return `/reports/${title.toLowerCase().replace(' ', '_')}.svg`;
	};

	// Fallback image if the specific year image doesn't exist
	const fallbackImage = '/reports/annual_report_default.jpg';

	// Format date if available
	const formatDate = (dateString?: string) => {
		if (!dateString) return '';

		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			});
		} catch (e) {
			return dateString;
		}
	};

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen">
				<div className="text-2xl font-semibold mb-4">
					{t('common.loading', 'Loading...')}
				</div>
				<div className="animate-pulse flex space-x-4">
					<div className="rounded-full bg-gray-200 h-12 w-12"></div>
					<div className="rounded-full bg-gray-200 h-12 w-12"></div>
					<div className="rounded-full bg-gray-200 h-12 w-12"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen">
				<div className="text-2xl font-semibold mb-4 text-red-600">
					{t('common.error', 'Error')}
				</div>
				<div className="text-gray-600 mb-6">{error}</div>
				<Link href="/" passHref>
					<Button>{t('common.returnHome', 'Return Home')}</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Header */}
			<div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
				<div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
					<div className="text-center">
						<h1 className="text-3xl md:text-4xl font-bold mb-4">
							{t('reports.allReports', 'Annual Reports Archive')}
						</h1>
						<p className="text-xl text-blue-100 max-w-3xl mx-auto">
							{t(
								'reports.archiveDescription',
								'Browse our collection of annual reports documenting our progress, achievements, and future directions.'
							)}
						</p>
					</div>
				</div>
			</div>

			{/* Search and Filters */}
			<div className="max-w-7xl mx-auto px-4 py-8">
				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-8">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						{/* Search */}
						<div className="relative flex-1">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Search className="h-5 w-5 text-gray-400" />
							</div>
							<input
								type="text"
								className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder={t('reports.searchReports', 'Search reports...')}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>

						{/* Sort Controls */}
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								className="flex items-center"
								onClick={() => setShowFilters(!showFilters)}
							>
								{t('reports.filters', 'Filters')}
								<ChevronDown
									className={`ml-2 h-4 w-4 transition-transform ${
										showFilters ? 'rotate-180' : ''
									}`}
								/>
							</Button>
						</div>
					</div>

					{/* Expanded Filters */}
					{showFilters && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.3 }}
							className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
						>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										{t('reports.sortBy', 'Sort by')}
									</label>
									<select
										className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100"
										value={sortBy}
										onChange={(e) =>
											setSortBy(e.target.value as 'year' | 'title')
										}
									>
										<option value="year">{t('reports.year', 'Year')}</option>
										<option value="title">{t('reports.title', 'Title')}</option>
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										{t('reports.order', 'Order')}
									</label>
									<select
										className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100"
										value={sortOrder}
										onChange={(e) =>
											setSortOrder(e.target.value as 'asc' | 'desc')
										}
									>
										<option value="desc">
											{t('reports.newest', 'Newest first')}
										</option>
										<option value="asc">
											{t('reports.oldest', 'Oldest first')}
										</option>
									</select>
								</div>
							</div>
						</motion.div>
					)}
				</div>

				{/* Results Count */}
				<div className="mb-6">
					<p className="text-gray-600 dark:text-gray-400">
						{t('reports.showing', 'Showing')}{' '}
						<span className="font-medium">{filteredReports.length}</span>{' '}
						{t('reports.ofTotal', 'of')}{' '}
						<span className="font-medium">{reports.length}</span>{' '}
						{t('reports.reports', 'reports')}
					</p>
				</div>

				{/* Reports Grid */}
				{filteredReports.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredReports.map((report) => (
							<motion.div
								key={report.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}
								className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 h-full flex flex-col border border-gray-100 dark:border-gray-700 hover:translate-y-[-4px]"
							>
								<div className="relative h-56 overflow-hidden">
									<Image
										src={getCoverImage(report.title)}
										alt={report.title}
										fill
										className="object-cover transition-transform duration-700 hover:scale-105"
										onError={(e) => {
											// Fallback to default image if the specific year image fails to load
											e.currentTarget.src = fallbackImage;
										}}
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
									<div className="absolute bottom-0 left-0 right-0 p-4">
										<div className="inline-block px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 rounded-full text-sm font-medium mb-2">
											{report.year}
										</div>
										<h3 className="text-xl font-bold text-white">
											{report.title}
										</h3>
									</div>
								</div>
								<div className="p-5 flex-1 flex flex-col">
									{/* File Size */}
									<div className="flex items-center mb-4">
										<div className="flex-shrink-0 bg-primary-50 dark:bg-primary-900/20 p-2 rounded-full mr-3">
											<FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
										</div>
										<div>
											<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
												{t('home.annualReports.fileSize', 'File Size')}
											</h4>
											<p className="text-gray-900 dark:text-white text-sm">
												{report.fileSize}
											</p>
										</div>
									</div>

									{/* Publication Date */}
									{report.published_at && (
										<div className="flex items-center mb-4">
											<div className="flex-shrink-0 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-full mr-3">
												<Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
											</div>
											<div>
												<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
													{t('home.annualReports.publishedOn', 'Published On')}
												</h4>
												<p className="text-gray-900 dark:text-white text-sm">
													{formatDate(report.published_at)}
												</p>
											</div>
										</div>
									)}

									{/* Authors */}
									{report.authors && (
										<div className="flex items-center mb-4">
											<div className="flex-shrink-0 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-full mr-3">
												<Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
											</div>
											<div>
												<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
													{t('home.annualReports.authors', 'Authors')}
												</h4>
												<p className="text-gray-900 dark:text-white text-sm line-clamp-1">
													{report.authors}
												</p>
											</div>
										</div>
									)}

									{/* Description */}
									{report.description && (
										<div className="mb-6">
											<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
												{t('home.annualReports.description', 'Description')}
											</h4>
											<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
												{report.description}
											</p>
										</div>
									)}

									{/* Action Buttons */}
									<div className="mt-auto flex flex-col space-y-2">
										<Link href={`/reports/${report.id}`} passHref>
											<Button variant="default" className="w-full">
												{t('home.annualReports.learnMore', 'Learn More')}
											</Button>
										</Link>

										{report.downloadUrl ? (
											<Link href={report.downloadUrl} passHref>
												<Button
													variant="outline"
													className="w-full border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20 transition-colors"
												>
													{t('home.annualReports.download', 'Download')}
													<Download className="w-4 h-4 ml-2" />
												</Button>
											</Link>
										) : (
											<Button
												variant="outline"
												className="w-full border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20 transition-colors"
												disabled
											>
												{t('home.annualReports.notAvailable', 'Not Available')}
											</Button>
										)}
									</div>
								</div>
							</motion.div>
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
							<FileText className="h-8 w-8 text-gray-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
							{t('reports.noReportsFound', 'No reports found')}
						</h3>
						<p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
							{t(
								'reports.tryAdjustingFilters',
								"Try adjusting your search or filters to find what you're looking for."
							)}
						</p>
						<Button
							variant="outline"
							className="mt-4"
							onClick={() => {
								setSearchTerm('');
								setSortBy('year');
								setSortOrder('desc');
							}}
						>
							{t('reports.clearFilters', 'Clear filters')}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
