'use client';

import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getPastCongresses } from '@/lib/api';
import { getCongressFolderPath } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
	ArrowLeft,
	ExternalLink,
	FileText,
	Filter,
	Search,
	Tag,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import path from 'path';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface EPoster {
	id: string;
	title: string;
	congressId: string;
	congressTitle: string;
	path: string;
	year: number;
	authors?: string;
	category?: string;
}

export default function EPostersArchivePage() {
	const { t } = useTranslation();
	const router = useRouter();
	const [ePosters, setEPosters] = useState<EPoster[]>([]);
	const [filteredPosters, setFilteredPosters] = useState<EPoster[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [yearFilter, setYearFilter] = useState<string>('all');
	const [availableYears, setAvailableYears] = useState<string[]>([]);
	const [categoryFilter, setCategoryFilter] = useState<string>('all');
	const [availableCategories, setAvailableCategories] = useState<string[]>([]);
	const [currentImageIndices, setCurrentImageIndices] = useState<
		Record<string, number>
	>({});
	const slideIntervals = useRef<Record<string, NodeJS.Timeout>>({});
	const [posterImages, setPosterImages] = useState<Record<string, string[]>>(
		{}
	);

	useEffect(() => {
		async function fetchEPosters() {
			try {
				// Get all past congresses
				const pastCongresses = await getPastCongresses();
				if (!pastCongresses || pastCongresses.length === 0) {
					setIsLoading(false);
					return;
				}

				const allPosters: EPoster[] = [];
				const years = new Set<string>();
				const categories = new Set<string>();
				const initialImageIndices: Record<string, number> = {};
				const posterImagesMap: Record<string, string[]> = {};

				// Process each congress to get e-posters
				for (const congress of pastCongresses) {
					const congressYear = new Date(congress.start_date).getFullYear();
					years.add(congressYear.toString());

					try {
						// First try to get e-posters from the database field
						if (
							congress.eposters &&
							Array.isArray(congress.eposters) &&
							congress.eposters.length > 0
						) {
							console.log(
								`Congress ${congress.id} has e-posters in database field`
							);
							const ePosterPaths = await import('@/lib/utils').then((m) =>
								m.getCongressEPosters(congress)
							);
							console.log('Loaded e-posters paths:', ePosterPaths);

							if (ePosterPaths && ePosterPaths.length > 0) {
								ePosterPaths.forEach((posterPath: string, index: number) => {
									const fileName = posterPath.split('/').pop() || '';
									const posterName = fileName
										.replace(/_/g, ' ')
										.replace('.pdf', '');

									// Extract category from filename if possible (e.g., "Glaucoma - Study Title.pdf")
									let category = 'General';
									let title = posterName;
									if (posterName.includes(' - ')) {
										const parts = posterName.split(' - ');
										category = parts[0].trim();
										title = parts.slice(1).join(' - ').trim();
										categories.add(category);
									}

									const posterId = `${congress.id}-poster-${index}`;
									initialImageIndices[posterId] = 0;

									// Set a default thumbnail image based on category
									posterImagesMap[posterId] = [
										`/images/poster-thumbnails/${category
											.toLowerCase()
											.replace(/\s+/g, '-')}.jpg`,
									];

									allPosters.push({
										id: posterId,
										title: title,
										congressId: congress.id,
										congressTitle: congress.title,
										path: posterPath,
										year: congressYear,
										category: category,
										authors: '', // This would be populated from metadata if available
									});
								});
								continue; // Skip directory listing if we found e-posters in the database
							}
						}

						// Fallback to checking directory contents if no e-posters in database
						// Get the congress folder path
						const folderPath = getCongressFolderPath({
							start_date: congress.start_date,
							title: congress.title,
							location:
								typeof congress.location === 'string'
									? congress.location
									: congress.location?.name || '',
						});

						if (!folderPath) continue;

						// Get e-posters from the folder
						const ePostersPath = `${folderPath}/e-posters`;
						const response = await fetch(
							`/api/getDirectoryContents?path=${encodeURIComponent(
								ePostersPath.slice(1)
							)}`,
							{ cache: 'no-store' }
						);

						if (response.ok) {
							const posterFiles = await response.json();
							const filteredFiles = posterFiles.filter((file: string) =>
								file.toLowerCase().endsWith('.pdf')
							);

							// Create e-poster objects
							const posters = filteredFiles.map(
								(file: string, index: number) => {
									const posterPath = `${ePostersPath}/${file}`;
									const posterName = path
										.basename(file, '.pdf')
										.replace(/_/g, ' ');

									// Extract category from filename if possible (e.g., "Glaucoma - Study Title.pdf")
									let category = 'General';
									let title = posterName;
									if (posterName.includes(' - ')) {
										const parts = posterName.split(' - ');
										category = parts[0].trim();
										title = parts.slice(1).join(' - ').trim();
										categories.add(category);
									}

									const posterId = `${congress.id}-poster-${index}`;
									initialImageIndices[posterId] = 0;

									// Try to find related images for this poster
									const posterImagesPath = `${folderPath}/poster-images/${path.basename(
										file,
										'.pdf'
									)}`;
									posterImagesMap[posterId] = [
										`/images/poster-thumbnails/${category
											.toLowerCase()
											.replace(/\s+/g, '-')}.jpg`,
									];

									return {
										id: posterId,
										title: title,
										congressId: congress.id,
										congressTitle: congress.title,
										path: posterPath,
										year: congressYear,
										category: category,
										authors: '', // This would be populated from metadata if available
									};
								}
							);

							allPosters.push(...posters);
						}
					} catch (err) {
						console.error(
							`Error loading e-posters for congress ${congress.id}:`,
							err
						);
						console.log(`Attempting to continue with next congress...`);
					}
				}

				// Sort posters by year (newest first)
				allPosters.sort((a, b) => b.year - a.year);

				setEPosters(allPosters);
				setFilteredPosters(allPosters);
				setAvailableYears(Array.from(years).sort().reverse());
				setAvailableCategories(Array.from(categories).sort());
				setCurrentImageIndices(initialImageIndices);
				setPosterImages(posterImagesMap);
				setIsLoading(false);
			} catch (err) {
				console.error('Error fetching e-posters:', err);
				setError('Failed to load e-posters');
				setIsLoading(false);
			}
		}

		fetchEPosters();

		// Cleanup on unmount
		return () => {
			Object.values(slideIntervals.current).forEach((interval) => {
				clearInterval(interval);
			});
		};
	}, []);

	// Filter posters based on search term, year, and category
	useEffect(() => {
		let filtered = ePosters;

		// Apply year filter
		if (yearFilter !== 'all') {
			filtered = filtered.filter(
				(poster) => poster.year.toString() === yearFilter
			);
		}

		// Apply category filter
		if (categoryFilter !== 'all') {
			filtered = filtered.filter(
				(poster) => poster.category === categoryFilter
			);
		}

		// Apply search term filter
		if (searchTerm.trim() !== '') {
			filtered = filtered.filter(
				(poster) =>
					poster.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					poster.congressTitle
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					(poster.authors &&
						poster.authors.toLowerCase().includes(searchTerm.toLowerCase())) ||
					(poster.category &&
						poster.category.toLowerCase().includes(searchTerm.toLowerCase()))
			);
		}

		setFilteredPosters(filtered);
	}, [searchTerm, yearFilter, categoryFilter, ePosters]);

	if (isLoading) {
		return (
			<LoadingSpinner
				message={t('common.loading')}
				background="transparent"
				fullScreen={true}
			/>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
				<h1 className="text-4xl text-red-500">{t('common.error')}</h1>
				<p className="mt-4 text-lg text-gray-600">{error}</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Header */}
			<div className="relative py-16 bg-white dark:bg-gray-900 overflow-hidden">
				<div className="absolute inset-0 opacity-5">
					<div className="absolute inset-0 bg-grid-primary-700/[0.1] [mask-image:linear-gradient(0deg,transparent,black)]"></div>
				</div>
				<div className="max-w-7xl mx-auto px-4 relative z-10">
					<div className="max-w-3xl">
						<div className="flex items-center mb-6">
							<Button
								variant="ghost"
								className="text-gray-700 dark:text-gray-300 mr-4 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 -ml-2"
								onClick={() => router.back()}
							>
								<ArrowLeft className="w-5 h-5" />
							</Button>
							<div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-primary-100 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300">
								<FileText className="w-4 h-4 mr-2" />
								{t('archives.documents')}
							</div>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
							{t('archives.ePosters')}
						</h1>
						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
							{t('archives.ePostersDescription')}
						</p>
					</div>
				</div>
				<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
			</div>

			{/* Filters and Search */}
			<div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-4 py-4">
					<div className="flex flex-col md:flex-row gap-4">
						<div className="relative flex-grow">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Search className="h-5 w-5 text-gray-400" />
							</div>
							<input
								type="text"
								className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
								placeholder={t('archives.searchPosters')}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>

						<div className="relative md:w-40">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Filter className="h-5 w-5 text-gray-400" />
							</div>
							<select
								className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
								value={yearFilter}
								onChange={(e) => setYearFilter(e.target.value)}
							>
								<option value="all">
									{t('common.allYears') || 'All Years'}
								</option>
								{availableYears.map((year) => (
									<option key={year} value={year}>
										{year}
									</option>
								))}
							</select>
							<div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
								<svg
									className="h-5 w-5 text-gray-400"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
						</div>

						<div className="relative md:w-48">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Tag className="h-5 w-5 text-gray-400" />
							</div>
							<select
								className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
								value={categoryFilter}
								onChange={(e) => setCategoryFilter(e.target.value)}
							>
								<option value="all">
									{t('common.allCategories') || 'All Categories'}
								</option>
								{availableCategories.map((category) => (
									<option key={category} value={category}>
										{category}
									</option>
								))}
							</select>
							<div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
								<svg
									className="h-5 w-5 text-gray-400"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-7xl mx-auto px-4 py-8">
				{filteredPosters.length === 0 ? (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
						<FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
						<h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
							{t('archives.noPostersFound')}
						</h3>
						<p className="text-gray-500 dark:text-gray-400">
							{t('archives.tryDifferentSearch')}
						</p>
					</div>
				) : (
					<div className="space-y-12">
						{availableYears
							.filter((year) =>
								filteredPosters.some(
									(poster) => poster.year.toString() === year
								)
							)
							.map((year) => {
								const yearPosters = filteredPosters.filter(
									(poster) => poster.year.toString() === year
								);

								if (yearPosters.length === 0) return null;

								return (
									<div key={year} className="space-y-6">
										<h2 className="text-2xl font-bold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
											{year}
										</h2>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
											{yearPosters.map((poster, index) => (
												<motion.div
													key={poster.id}
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ duration: 0.3, delay: index * 0.05 }}
													className="group"
												>
													<a
														href={poster.path}
														target="_blank"
														rel="noopener noreferrer"
														className="block h-full"
													>
														<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col border border-gray-200 dark:border-gray-700">
															{/* Document header with file type */}
															<div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
																<div className="flex items-center">
																	{poster.path
																		.toLowerCase()
																		.endsWith('.pdf') ? (
																		<div className="w-10 h-10 flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
																			<FileText className="w-6 h-6" />
																		</div>
																	) : poster.path
																			.toLowerCase()
																			.endsWith('.ppt') ||
																	  poster.path
																			.toLowerCase()
																			.endsWith('.pptx') ? (
																		<div className="w-10 h-10 flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded">
																			<FileText className="w-6 h-6" />
																		</div>
																	) : (
																		<div className="w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
																			<FileText className="w-6 h-6" />
																		</div>
																	)}
																	<div className="ml-3">
																		<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
																			{poster.path
																				.toLowerCase()
																				.endsWith('.pdf')
																				? 'PDF Document'
																				: poster.path
																						.toLowerCase()
																						.endsWith('.ppt')
																				? 'PowerPoint'
																				: poster.path
																						.toLowerCase()
																						.endsWith('.pptx')
																				? 'PowerPoint'
																				: 'Document'}
																		</span>
																	</div>
																</div>
																<span className="bg-blue-600 text-white text-xs font-medium py-1 px-2 rounded">
																	{poster.year}
																</span>
															</div>

															{/* Document content */}
															<div className="p-5 flex-grow flex flex-col">
																<div className="mb-3 flex-grow">
																	<h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
																		{poster.title}
																	</h3>
																	<p className="text-gray-600 dark:text-gray-400 text-sm">
																		{poster.congressTitle}
																	</p>
																</div>

																{/* Categories and tags */}
																<div className="mt-2">
																	{poster.category && (
																		<span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded mr-2 mb-2">
																			{poster.category}
																		</span>
																	)}
																	{poster.authors && (
																		<p className="text-gray-500 dark:text-gray-500 text-xs italic mt-2">
																			{poster.authors}
																		</p>
																	)}
																</div>
															</div>

															{/* Action footer */}
															<div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
																<div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
																	{t('archives.viewDocument')}
																	<ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
																</div>
															</div>
														</div>
													</a>
												</motion.div>
											))}
										</div>
									</div>
								);
							})}
					</div>
				)}
			</div>
		</div>
	);
}
