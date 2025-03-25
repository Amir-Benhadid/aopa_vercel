'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AnimatePresence, motion } from 'framer-motion';
import {
	Archive,
	ArrowRight,
	Calendar,
	ExternalLink,
	FileText,
	MapPin,
	Video,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getPastCongresses } from '@/lib/api';
import { getCongressFolderPath } from '@/lib/utils';
import { Congress as DBCongress } from '@/types/database';
import { Search } from 'lucide-react';

// Use the imported Congress type
export type Congress = DBCongress;

// Define EPoster interface (from archives e-posters page)
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

function ArchivesContent() {
	const { t } = useTranslation();
	const [selectedTab, setSelectedTab] = useState<
		'events' | 'eposters' | 'webinars'
	>('events');
	const [searchTerm, setSearchTerm] = useState('');

	const [events, setEvents] = useState<Congress[]>([]);
	const [filteredEvents, setFilteredEvents] = useState<Congress[]>([]);
	const [ePosters, setEPosters] = useState<EPoster[]>([]);
	const [filteredEPosters, setFilteredEPosters] = useState<EPoster[]>([]);
	const [webinars, setWebinars] = useState<any[]>([]); // Placeholder for webinar data
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [featuredEvent, setFeaturedEvent] = useState<Congress | null>(null);
	const [congressImages, setCongressImages] = useState<
		Record<string, string[]>
	>({});
	const [currentImageIndices, setCurrentImageIndices] = useState<
		Record<string, number>
	>({});
	const slideIntervals = useRef<Record<string, NodeJS.Timeout>>({});

	useEffect(() => {
		async function fetchData() {
			try {
				// Fetch events
				const pastCongresses = await getPastCongresses();
				setEvents(pastCongresses);
				setFilteredEvents(pastCongresses);

				if (pastCongresses.length > 0) {
					const sorted = [...pastCongresses].sort(
						(a, b) =>
							new Date(b.start_date).getTime() -
							new Date(a.start_date).getTime()
					);
					setFeaturedEvent(sorted[0]);
				}

				// Initialize current image indices for all congresses
				const initialImageIndices: Record<string, number> = {};
				pastCongresses.forEach((congress) => {
					initialImageIndices[congress.id] = 0;
				});
				setCurrentImageIndices(initialImageIndices);

				// Load images for all congresses
				const imagesPromises = pastCongresses.map(async (congress) => {
					const images = await loadCongressImages(congress);
					return { id: congress.id, images };
				});

				const imagesResults = await Promise.all(imagesPromises);
				const imagesMap: Record<string, string[]> = {};
				imagesResults.forEach((result) => {
					imagesMap[result.id] = result.images;
				});

				setCongressImages(imagesMap);

				// Fetch E-Posters from each congress
				const allEPosters: EPoster[] = [];
				for (const congress of pastCongresses) {
					try {
						// Check if e-posters field exists
						if (
							// Use the correct property name from the Congress interface
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
									let category = 'General';
									let title = posterName;
									if (posterName.includes(' - ')) {
										const parts = posterName.split(' - ');
										category = parts[0].trim();
										title = parts.slice(1).join(' - ').trim();
									}

									allEPosters.push({
										id: `${congress.id}-poster-${index}`,
										title,
										congressId: congress.id,
										congressTitle: congress.title,
										path: posterPath,
										year: new Date(congress.start_date).getFullYear(),
										category,
									});
								});
							}
							continue; // Skip directory listing if we've found e-posters in the database
						}

						// Fallback to directory listing
						const folderPath = getCongressFolderPath({
							start_date: congress.start_date,
							title: congress.title,
							location:
								typeof congress.location === 'string'
									? congress.location
									: congress.location?.name || '',
						});
						if (!folderPath) continue;
						const ePostersPath = `${folderPath}/e-posters`;

						const response = await fetch(
							`/api/getDirectoryContents?path=${encodeURIComponent(
								ePostersPath.slice(1)
							)}`,
							{ cache: 'no-store' }
						);
						if (response.ok) {
							const files = await response.json();
							const filteredFiles = files.filter((file: string) =>
								file.toLowerCase().endsWith('.pdf')
							);
							filteredFiles.forEach((file: string, index: number) => {
								const posterPath = `${ePostersPath}/${file}`;
								const posterName = file.replace(/_/g, ' ').replace('.pdf', '');
								let category = 'General';
								let title = posterName;
								if (posterName.includes(' - ')) {
									const parts = posterName.split(' - ');
									category = parts[0].trim();
									title = parts.slice(1).join(' - ').trim();
								}
								allEPosters.push({
									id: `${congress.id}-poster-${index}`,
									title,
									congressId: congress.id,
									congressTitle: congress.title,
									path: posterPath,
									year: new Date(congress.start_date).getFullYear(),
									category,
								});
							});
						}
					} catch (err) {
						console.error(
							'Error fetching e-posters for congress',
							congress.id,
							err
						);
					}
				}
				setEPosters(allEPosters);
				setFilteredEPosters(allEPosters);

				// For webinars, no data is fetched so far
				setWebinars([]);

				setIsLoading(false);
			} catch (err) {
				console.error(err);
				setError('Failed to load archives data');
				setIsLoading(false);
			}
		}
		fetchData();

		// Cleanup on unmount
		return () => {
			Object.values(slideIntervals.current).forEach((interval) => {
				clearInterval(interval);
			});
		};
	}, []);

	// Load images for a congress from its folder
	const loadCongressImages = async (congress: Congress) => {
		try {
			if (!congress) {
				return ['/images/congress-default-banner.jpg'];
			}

			// If congress.images is a number, use getCongressPhotos utility function
			if (typeof congress.images === 'number' && congress.images > 0) {
				console.log(
					`Congress ${congress.id} has ${congress.images} numbered images`
				);
				const photosFromDb = await import('@/lib/utils').then((m) =>
					m.getCongressPhotos(congress)
				);
				console.log('Loaded photos using getCongressPhotos:', photosFromDb);
				return photosFromDb;
			}

			// For backward compatibility, if congress.images is an array
			if (Array.isArray(congress.images) && congress.images.length > 0) {
				return congress.images;
			}

			const folderPath = getCongressFolderPath({
				start_date: congress.start_date,
				title: congress.title,
				location:
					typeof congress.location === 'string'
						? congress.location
						: congress.location?.name || '',
			});

			if (!folderPath)
				return [congress.image || '/images/congress-default-banner.jpg'];

			try {
				const photosPath = `${folderPath}/photos`;

				// Use our API endpoint to get directory contents
				const imageFilesResponse = await fetch(
					`/api/getDirectoryContents?path=${encodeURIComponent(
						photosPath.slice(1)
					)}`,
					{
						cache: 'no-store', // Ensure we don't cache the results
					}
				);

				if (imageFilesResponse.ok) {
					const imageFiles = await imageFilesResponse.json();

					// Filter for image files only
					const filteredFiles = imageFiles.filter(
						(file: string) =>
							file.toLowerCase().endsWith('.jpg') ||
							file.toLowerCase().endsWith('.jpeg') ||
							file.toLowerCase().endsWith('.png')
					);

					// Create full paths for images
					return filteredFiles.map((file: string) => `${photosPath}/${file}`);
				}
			} catch (err) {
				console.error(`Error loading images for congress ${congress.id}:`, err);
			}

			// Fallback to default image if needed
			return congress.image
				? [congress.image]
				: ['/images/congress-default-banner.jpg'];
		} catch (error) {
			console.error(
				`Error in loadCongressImages for congress ${congress.id}:`,
				error
			);
			return ['/images/congress-default-banner.jpg'];
		}
	};

	// Setup image rotation for all congresses
	useEffect(() => {
		// Clear all existing intervals first
		Object.values(slideIntervals.current).forEach((interval) => {
			clearInterval(interval);
		});

		// Setup new intervals for each congress with multiple images
		Object.entries(congressImages).forEach(([congressId, images]) => {
			if (images.length > 1) {
				slideIntervals.current[congressId] = setInterval(() => {
					setCurrentImageIndices((prev) => ({
						...prev,
						[congressId]: (prev[congressId] + 1) % images.length,
					}));
				}, 10000);
			}
		});

		return () => {
			Object.values(slideIntervals.current).forEach((interval) => {
				clearInterval(interval);
			});
		};
	}, [congressImages]);

	// Filtering logic based on search term
	useEffect(() => {
		if (selectedTab === 'events') {
			if (searchTerm.trim() === '') {
				setFilteredEvents(events);
			} else {
				const filtered = events.filter(
					(event) =>
						event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
						(event.description &&
							event.description
								.toLowerCase()
								.includes(searchTerm.toLowerCase()))
				);
				setFilteredEvents(filtered);
			}
		} else if (selectedTab === 'eposters') {
			if (searchTerm.trim() === '') {
				setFilteredEPosters(ePosters);
			} else {
				const filtered = ePosters.filter(
					(eposter) =>
						eposter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
						eposter.congressTitle
							.toLowerCase()
							.includes(searchTerm.toLowerCase()) ||
						(eposter.category &&
							eposter.category.toLowerCase().includes(searchTerm.toLowerCase()))
				);
				setFilteredEPosters(filtered);
			}
		}
		// Webinars filtering can be added when data is available
	}, [searchTerm, events, ePosters, selectedTab]);

	function formatDateRange(startDate: string, endDate: string) {
		const start = new Date(startDate);
		const end = new Date(endDate);
		const options: Intl.DateTimeFormatOptions = {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		};
		return `${start.toLocaleDateString(
			'en-US',
			options
		)} - ${end.toLocaleDateString('en-US', options)}`;
	}

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
				<div className="container mx-auto px-4 relative z-10">
					<div className="max-w-3xl">
						<div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-primary-100 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 mb-6">
							<Archive className="w-4 h-4 mr-2" />
							{t('archives.explore')}
						</div>
						<h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
							{t('archives.title')}
						</h1>
						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
							{t('archives.description') ||
								'Explore our past events, e-posters, and webinars.'}
						</p>
					</div>
				</div>
				<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
			</div>

			{/* Featured event */}
			{featuredEvent && (
				<div className="container mx-auto px-4 -mt-8 relative z-20">
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
						<div className="flex flex-col md:flex-row">
							<div className="md:w-1/2 relative h-64 md:h-auto">
								<AnimatePresence initial={false} mode="wait">
									<motion.div
										key={
											congressImages[featuredEvent.id]
												? currentImageIndices[featuredEvent.id]
												: 0
										}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 1.5, ease: 'easeInOut' }}
										className="absolute inset-0"
									>
										<img
											src={
												congressImages[featuredEvent.id] &&
												congressImages[featuredEvent.id].length > 0
													? congressImages[featuredEvent.id][
															currentImageIndices[featuredEvent.id]
													  ]
													: featuredEvent.image ||
													  '/images/congress-default-banner.jpg'
											}
											alt={featuredEvent.title}
											className="w-full h-full object-cover"
										/>
									</motion.div>
								</AnimatePresence>
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
									<div className="p-6">
										<span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
											{t('archives.featuredEvent')}
										</span>
									</div>
								</div>
							</div>
							<div className="md:w-1/2 p-6 md:p-8">
								<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
									{featuredEvent.title}
								</h2>
								<p className="text-gray-600 dark:text-gray-300 mb-4">
									{formatDateRange(
										featuredEvent.start_date,
										featuredEvent.end_date
									)}
								</p>
								<p className="text-gray-700 dark:text-gray-300 mb-6 line-clamp-3">
									{featuredEvent.description || t('archives.noDescription')}
								</p>
								<Link href={`/archives/events/${featuredEvent.id}`}>
									<Button className="w-full md:w-auto">
										{t('archives.viewDetails')}
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Tabs and content */}
			<div className="container mx-auto px-4 py-8 mt-8">
				{/* Search bar */}
				<div className="mb-8 relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Search className="h-5 w-5 text-gray-400" />
					</div>
					<input
						type="text"
						className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:text-white shadow-sm"
						placeholder={t('archives.searchArchives')}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>

				{/* Tab navigation */}
				<div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
					<button
						onClick={() => setSelectedTab('events')}
						className={`px-6 py-3 text-base font-medium rounded-t-lg transition-colors ${
							selectedTab === 'events'
								? 'bg-primary-600 text-white'
								: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
						}`}
					>
						{t('archives.events')}
					</button>
					<button
						onClick={() => setSelectedTab('eposters')}
						className={`px-6 py-3 text-base font-medium rounded-t-lg transition-colors ${
							selectedTab === 'eposters'
								? 'bg-primary-600 text-white'
								: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
						}`}
					>
						{t('archives.ePosters')}
					</button>
					<button
						onClick={() => setSelectedTab('webinars')}
						className={`px-6 py-3 text-base font-medium rounded-t-lg transition-colors ${
							selectedTab === 'webinars'
								? 'bg-primary-600 text-white'
								: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
						}`}
					>
						{t('archives.webinars')}
					</button>
				</div>

				{/* Tab content */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					{selectedTab === 'events' && (
						<div>
							{filteredEvents.length === 0 ? (
								<div className="text-center py-12">
									<Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
									<h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
										{t('archives.noEventsFound')}
									</h3>
									<p className="text-gray-500 dark:text-gray-400">
										{t('archives.tryDifferentSearch')}
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{filteredEvents.map((event, index) => (
										<motion.div
											key={event.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.3, delay: index * 0.05 }}
											className="group"
										>
											<Link
												href={`/archives/events/${event.id}`}
												className="block h-full"
											>
												<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
													<div className="h-48 relative overflow-hidden">
														<AnimatePresence initial={false} mode="wait">
															<motion.div
																key={
																	congressImages[event.id]
																		? currentImageIndices[event.id]
																		: 0
																}
																initial={{ opacity: 0 }}
																animate={{ opacity: 1 }}
																exit={{ opacity: 0 }}
																transition={{
																	duration: 1.5,
																	ease: 'easeInOut',
																}}
																className="absolute inset-0"
															>
																{congressImages[event.id] &&
																congressImages[event.id].length > 0 ? (
																	<img
																		src={
																			congressImages[event.id][
																				currentImageIndices[event.id]
																			]
																		}
																		alt={event.title}
																		className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
																	/>
																) : (
																	<div className="w-full h-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
																		<Calendar className="w-12 h-12 text-white/70" />
																	</div>
																)}
															</motion.div>
														</AnimatePresence>
														<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
														<div className="absolute bottom-0 left-0 p-4">
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
															{typeof event.location === 'string'
																? event.location
																: event.location?.name || t('common.unknown')}
														</p>
														{event.description && (
															<p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
																{event.description}
															</p>
														)}
													</div>
													<div className="px-5 pb-5 pt-0">
														<span className="text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center">
															{t('archives.viewDetails')}
															<ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
														</span>
													</div>
												</div>
											</Link>
										</motion.div>
									))}
								</div>
							)}
							{filteredEvents.length > 0 && (
								<div className="mt-8 text-center">
									<Link href="/archives/events">
										<Button variant="outline" className="mx-auto">
											{t('archives.viewAllEvents')}
											<ArrowRight className="w-4 h-4 ml-2" />
										</Button>
									</Link>
								</div>
							)}
						</div>
					)}
					{selectedTab === 'eposters' && (
						<div>
							{filteredEPosters.length === 0 ? (
								<div className="text-center py-12">
									<FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
									<h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
										{t('archives.noPostersFound')}
									</h3>
									<p className="text-gray-500 dark:text-gray-400">
										{t('archives.tryDifferentSearch')}
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{filteredEPosters.map((eposter) => (
										<motion.div
											key={eposter.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.3 }}
											className="group"
										>
											<a
												href={eposter.path}
												target="_blank"
												rel="noopener noreferrer"
												className="block h-full"
											>
												<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden h-full flex flex-col">
													<div className="h-40 bg-gradient-to-br from-blue-500 to-primary-600 relative">
														<div className="absolute inset-0 flex items-center justify-center">
															<FileText className="w-16 h-16 text-white/70" />
														</div>
														<div className="absolute top-3 right-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 text-xs font-medium py-1 px-2 rounded-full">
															PDF
														</div>
														<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
															<div className="flex items-center">
																<span className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-xs px-2 py-1 rounded">
																	{eposter.year}
																</span>
																{eposter.category && (
																	<span className="ml-2 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-2 py-1 rounded">
																		{eposter.category}
																	</span>
																)}
															</div>
														</div>
													</div>
													<div className="p-5 flex-grow">
														<h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
															{eposter.title}
														</h3>
														<p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
															{eposter.congressTitle}
														</p>
														{eposter.authors && (
															<p className="text-gray-500 dark:text-gray-500 text-xs italic">
																{eposter.authors}
															</p>
														)}
													</div>
													<div className="px-5 pb-5 pt-0">
														<div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
															{t('archives.viewPoster')}
															<ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
														</div>
													</div>
												</div>
											</a>
										</motion.div>
									))}
								</div>
							)}
							{filteredEPosters.length > 0 && (
								<div className="mt-8 text-center">
									<Link href="/archives/eposters">
										<Button variant="outline" className="mx-auto">
											{t('archives.viewAllPosters')}
											<ArrowRight className="w-4 h-4 ml-2" />
										</Button>
									</Link>
								</div>
							)}
						</div>
					)}
					{selectedTab === 'webinars' && (
						<div>
							{webinars.length === 0 ? (
								<div className="text-center py-12">
									<Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
									<h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
										{t('archives.noWebinarsFound')}
									</h3>
									<p className="text-gray-500 dark:text-gray-400">
										{t('archives.comingSoon')}
									</p>
									<p className="text-gray-500 dark:text-gray-400 mt-2">
										{t('archives.checkBackLater')}
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{webinars.map((webinar: any) => (
										<motion.div
											key={webinar.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.3 }}
											className="group"
										>
											<a
												href={webinar.videoUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="block h-full"
											>
												<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden h-full flex flex-col">
													<div className="h-40 bg-gradient-to-br from-blue-500 to-primary-600 relative">
														{webinar.thumbnailUrl ? (
															<img
																src={webinar.thumbnailUrl}
																alt={webinar.title}
																className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
															/>
														) : (
															<div className="absolute inset-0 flex items-center justify-center">
																<Video className="w-16 h-16 text-white/70" />
															</div>
														)}
														<div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-medium py-1 px-2 rounded-full">
															{webinar.duration}
														</div>
														<div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
															<div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
																<div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-t-transparent border-b-transparent border-l-white ml-1"></div>
															</div>
														</div>
													</div>
													<div className="p-5 flex-grow">
														<div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-2">
															<Calendar className="w-4 h-4 mr-1" />
															<span>
																{new Date(webinar.date).toLocaleDateString(
																	'en-US',
																	{
																		year: 'numeric',
																		month: 'long',
																		day: 'numeric',
																	}
																)}
															</span>
														</div>
														<h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
															{webinar.title}
														</h3>
														<p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
															{webinar.presenter}
														</p>
														{webinar.description && (
															<p className="text-gray-500 dark:text-gray-500 text-sm line-clamp-2">
																{webinar.description}
															</p>
														)}
													</div>
													<div className="px-5 pb-5 pt-0">
														<div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium">
															{t('archives.watchWebinar')}
															<ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
														</div>
													</div>
												</div>
											</a>
										</motion.div>
									))}
								</div>
							)}
							{webinars.length > 0 && (
								<div className="mt-8 text-center">
									<Link href="/archives/webinars">
										<Button variant="outline" className="mx-auto">
											{t('archives.viewAllWebinars')}
											<ArrowRight className="w-4 h-4 ml-2" />
										</Button>
									</Link>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default function Page() {
	return (
		<ProtectedRoute>
			<ArchivesContent />
		</ProtectedRoute>
	);
}
