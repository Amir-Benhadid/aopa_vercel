'use client';

import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getPastCongresses } from '@/lib/api';
import { getCongressEPosters, getCongressFolderPath } from '@/lib/utils';
import { Congress } from '@/types/database';
import { motion } from 'framer-motion';
import {
	ArrowLeft,
	ArrowRight,
	Calendar,
	Filter,
	MapPin,
	Search,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Define the EPoster interface
interface EPoster {
	id: string;
	title: string;
	path: string;
	congress: Congress;
	category: string;
	authors: string;
}

// Helper function to safely get location name
const getLocationName = (location: any): string => {
	if (!location) return '';

	if (typeof location === 'string') {
		return location;
	}
	return location.name || '';
};

export default function EventsArchivePage() {
	const { t } = useTranslation();
	const router = useRouter();
	const [pastEvents, setPastEvents] = useState<Congress[]>([]);
	const [filteredEvents, setFilteredEvents] = useState<Congress[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [congressImages, setCongressImages] = useState<
		Record<string, string[]>
	>({});
	const [yearFilter, setYearFilter] = useState<string>('all');
	const [availableYears, setAvailableYears] = useState<string[]>([]);

	useEffect(() => {
		async function fetchPastEvents() {
			try {
				const pastCongresses = await getPastCongresses();
				setPastEvents(pastCongresses);
				setFilteredEvents(pastCongresses);

				// Extract available years for filtering
				const years = [
					...new Set(
						pastCongresses.map((congress) =>
							new Date(congress.start_date).getFullYear().toString()
						)
					),
				];
				setAvailableYears(years.sort().reverse());

				// Load images for all congresses
				const imagesPromises = pastCongresses.map(async (congress) => {
					const { images } = await loadCongressImages(congress);
					return { id: congress.id, images };
				});

				const imagesResults = await Promise.all(imagesPromises);
				const imagesMap: Record<string, string[]> = {};
				imagesResults.forEach((result) => {
					imagesMap[result.id] = result.images;
				});

				setCongressImages(imagesMap);
				setIsLoading(false);
			} catch (err) {
				console.error('Error fetching past events:', err);
				setError('Failed to load past events');
				setIsLoading(false);
			}
		}

		fetchPastEvents();
	}, []);

	// Helper function to load images for a congress
	async function loadCongressImages(congress: any) {
		try {
			if (!congress) {
				return { images: ['/images/congress-default.jpg'], current: 0 };
			}

			// If congress.images is a number, generate paths for 1.jpg, 2.jpg, etc.
			if (typeof congress.images === 'number' && congress.images > 0) {
				// Get folder path
				let locationName = '';
				if (congress.location) {
					if (typeof congress.location === 'object') {
						locationName = congress.location.name || '';
					} else if (typeof congress.location === 'string') {
						locationName = congress.location;
					}
				}

				const folderPath = getCongressFolderPath({
					start_date: congress.start_date,
					title: congress.title,
					location: locationName,
				});

				if (!folderPath) {
					// Fallback if we can't determine the folder path
					return {
						images: [
							congress.image ||
								congress.banner ||
								'/images/congress-default.jpg',
						],
						current: 0,
					};
				}

				// Ensure folder path has leading slash
				const validFolderPath = folderPath.startsWith('/')
					? folderPath
					: '/' + folderPath;

				// Generate paths for all numbered images
				const images = [];
				for (let i = 1; i <= congress.images; i++) {
					images.push(`${validFolderPath}/photos/${i}.jpg`);
				}

				return { images, current: 0 };
			}

			// For backward compatibility, if congress.images is an array
			if (Array.isArray(congress.images) && congress.images.length > 0) {
				return { images: congress.images, current: 0 };
			}

			// Fallback to a single image
			return {
				images: [
					congress.image || congress.banner || '/images/congress-default.jpg',
				],
				current: 0,
			};
		} catch (error) {
			console.error('Error loading congress images:', error);
			return { images: ['/images/congress-default.jpg'], current: 0 };
		}
	}

	// Format date range
	const formatDateRange = (start: string, end: string) => {
		const s = new Date(start);
		const e = new Date(end);
		return `${s.toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
		})} - ${e.toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		})}`;
	};

	// Filter events based on search term and year filter
	useEffect(() => {
		let filtered = pastEvents;

		// Apply year filter
		if (yearFilter !== 'all') {
			filtered = filtered.filter(
				(event) =>
					new Date(event.start_date).getFullYear().toString() === yearFilter
			);
		}

		// Apply search term filter
		if (searchTerm.trim() !== '') {
			filtered = filtered.filter((event) => {
				// Check title
				const titleMatch = event.title
					.toLowerCase()
					.includes(searchTerm.toLowerCase());

				// Check location
				let locationMatch = false;
				if (event.location) {
					if (typeof event.location === 'object' && event.location.name) {
						locationMatch = event.location.name
							.toLowerCase()
							.includes(searchTerm.toLowerCase());
					}
					// The Building type in the database schema doesn't support location as a string,
					// so we don't need to check this case
				}

				// Check description
				const descriptionMatch = event.description
					? event.description.toLowerCase().includes(searchTerm.toLowerCase())
					: false;

				return titleMatch || locationMatch || descriptionMatch;
			});
		}

		setFilteredEvents(filtered);
	}, [searchTerm, yearFilter, pastEvents]);

	// Load e-posters for all congresses
	const loadEPosters = async () => {
		try {
			const allEPosters: EPoster[] = [];

			// Loop through each past congress
			for (const congress of pastEvents) {
				try {
					const eposterPaths = await getCongressEPosters(congress);

					if (eposterPaths.length > 0) {
						// Process each e-poster path into a structured object
						const congressEPosters = eposterPaths.map((path) => {
							// Extract the filename from the path
							const filename = path.split('/').pop() || 'E-Poster';
							const title = filename
								.replace(/\.[^/.]+$/, '')
								.replace(/_/g, ' ');

							return {
								id: `${congress.id}-${filename}`,
								title: title,
								path: path,
								congress: congress,
								category: 'General',
								authors: 'Various Authors',
							};
						});

						allEPosters.push(...congressEPosters);
					} else {
						console.log(`No e-posters found for congress ${congress.title}`);
					}
				} catch (err) {
					console.error(
						`Error loading e-posters for congress ${congress.id}:`,
						err
					);
				}
			}

			return allEPosters;
		} catch (err) {
			console.error('Error loading e-posters:', err);
			return [];
		}
	};

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
								<Calendar className="w-4 h-4 mr-2" />
								{t('archives.events')}
							</div>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
							{t('archives.pastEvents')}
						</h1>
						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
							{t('archives.pastEventsDescription')}
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
								className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white"
								placeholder={t('archives.searchEvents')}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>

						<div className="relative md:w-40">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Filter className="h-5 w-5 text-gray-400" />
							</div>
							<select
								className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
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
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-7xl mx-auto px-4 py-8">
				{filteredEvents.length === 0 ? (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
						<Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
						<h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
							{t('archives.noEventsFound')}
						</h3>
						<p className="text-gray-500 dark:text-gray-400">
							{t('archives.tryDifferentSearch')}
						</p>
					</div>
				) : (
					<div className="space-y-12">
						{availableYears.map((year) => {
							const yearEvents = filteredEvents.filter(
								(event) =>
									new Date(event.start_date).getFullYear().toString() === year
							);

							if (yearEvents.length === 0) return null;

							return (
								<div key={year} className="space-y-6">
									<h2 className="text-2xl font-bold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
										{year}
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{yearEvents.map((event) => (
											<motion.div
												key={event.id}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.3 }}
												className="group"
											>
												<Link href={`/archives/events/${event.id}`}>
													<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden h-full flex flex-col">
														<div className="h-48 relative overflow-hidden">
															{congressImages[event.id]?.length > 0 ? (
																<img
																	src={congressImages[event.id][0]}
																	alt={event.title}
																	className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
																/>
															) : (
																<div className="w-full h-full bg-gradient-to-br from-blue-500 to-primary-600 flex items-center justify-center">
																	<Calendar className="w-12 h-12 text-white/70" />
																</div>
															)}
															<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
																<p className="text-white text-sm">
																	{formatDateRange(
																		event.start_date,
																		event.end_date
																	)}
																</p>
															</div>
														</div>
														<div className="p-5 flex-grow">
															<h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
																{event.title}
															</h3>
															<p className="text-gray-600 dark:text-gray-300 text-sm mb-2 flex items-center">
																<MapPin className="w-4 h-4 mr-1 text-primary-500" />
																{getLocationName(event.location)}
															</p>
															{event.description && (
																<p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
																	{event.description}
																</p>
															)}
														</div>
														<div className="px-5 pb-5 pt-0">
															<div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium">
																{t('archives.viewDetails')}
																<ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
															</div>
														</div>
													</div>
												</Link>
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
