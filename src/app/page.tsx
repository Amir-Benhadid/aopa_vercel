'use client';

import { AnnualReports } from '@/components/home/AnnualReports';
import { FeaturedActivities } from '@/components/home/FeaturedActivities';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { NoActivitiesPlaceholder } from '@/components/home/NoActivitiesPlaceholder';
import { PartnersCarousel } from '@/components/home/PartnersCarousel';
import { PreviousEvents } from '@/components/home/PreviousEvents';
import { QuickActions } from '@/components/home/QuickActions';
import { TeamAssociationSection } from '@/components/home/TeamAssociationSection';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
	getAnnualReports,
	getFeaturedActivities,
	getPastCongresses,
	getPreviousCongress,
	getUpcomingCongress,
} from '@/lib/api';
import { getCongressEPosters, getCongressFolderPath } from '@/lib/utils';
import { Activity, Congress, Report } from '@/types/database';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Home() {
	const { t, i18n } = useTranslation();
	const [upcomingCongress, setUpcomingCongress] = useState<Congress | null>(
		null
	);
	const [featuredActivities, setFeaturedActivities] = useState<Activity[]>([]);
	const [pastCongresses, setPastCongresses] = useState<Congress[]>([]);
	const [annualReports, setAnnualReports] = useState<Report[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [allCongressImages, setAllCongressImages] = useState<string[]>([]);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const carouselInterval = useRef<NodeJS.Timeout | null>(null);
	const [pastCongress, setPastCongress] = useState<Congress | null>(null);
	const [previousCongressImages, setPreviousCongressImages] = useState<
		string[]
	>([]);

	// Function to shuffle array (Fisher-Yates algorithm)
	const shuffleArray = (array: any[]) => {
		const newArray = [...array];
		for (let i = newArray.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
		}
		return newArray;
	};

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

	// Handle carousel navigation
	const nextImage = () => {
		if (allCongressImages.length > 1) {
			setCurrentImageIndex((prev) => (prev + 1) % allCongressImages.length);
		}
	};

	const previousImage = () => {
		if (allCongressImages.length > 1) {
			setCurrentImageIndex(
				(prev) =>
					(prev - 1 + allCongressImages.length) % allCongressImages.length
			);
		}
	};

	// Load e-posters for a congress
	const loadEPosters = async (congress: Congress) => {
		try {
			// Use the utility function to get e-poster paths
			const eposterPaths = await getCongressEPosters(congress);

			if (eposterPaths.length === 0) {
				return [];
			}

			// Process each e-poster path into a structured object
			return eposterPaths.map((path) => {
				// Extract the filename from the path
				const filename = path.split('/').pop() || 'E-Poster';
				const title = filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');

				return {
					id: `${congress.id}-${filename}`,
					title: title,
					path: path,
					congress: congress,
					category: 'General',
					authors: 'Various Authors',
				};
			});
		} catch (err) {
			console.error(
				`Error loading e-posters for congress ${congress?.id}:`,
				err
			);
			return [];
		}
	};

	// Setup auto-advance for carousel
	useEffect(() => {
		if (allCongressImages.length > 1) {
			if (carouselInterval.current) {
				clearInterval(carouselInterval.current);
			}

			carouselInterval.current = setInterval(() => {
				nextImage();
			}, 5000);
		}

		return () => {
			if (carouselInterval.current) {
				clearInterval(carouselInterval.current);
			}
		};
	}, [allCongressImages]);

	useEffect(() => {
		async function fetchData() {
			setIsLoading(true);
			setError(null);

			try {
				const congress = await getUpcomingCongress();

				const activities = await getFeaturedActivities();

				const pastCongressesData = await getPastCongresses();

				const annualReportsData = await getAnnualReports();

				setUpcomingCongress(congress);
				setFeaturedActivities(activities);
				setPastCongresses(pastCongressesData.slice(0, 3)); // Get the 3 most recent past congresses

				// Format annual reports data
				const formattedReports = annualReportsData.map((report) => ({
					id: report.id,
					title: `${report.title}`,
					published_at: report.published_at,
					description: report.description,
					authors: report.authors,
				}));

				setAnnualReports(formattedReports.slice(0, 3)); // Get the 3 most recent annual reports

				// Find previous congress
				try {
					const pastCongressData = await getPreviousCongress();

					if (pastCongressData) {
						setPastCongress(pastCongressData);
						const images = await loadCongressImages(pastCongressData);
						setPreviousCongressImages(images.images);
					}
				} catch (err) {
					console.error('Error fetching previous congress:', err);
				}

				// Load images from all congresses for the carousel
				const allCongresses = [
					...(congress ? [congress] : []),
					...pastCongressesData,
				].filter(Boolean);

				const imagesPromises = allCongresses.map(loadCongressImages);
				const imagesArrays = await Promise.all(imagesPromises);

				// Flatten the array of arrays and shuffle the images
				const allImages = shuffleArray(
					imagesArrays.map((data) => data.images).flat()
				);
				setAllCongressImages(allImages);

				// Also load e-posters in background if needed
				if (allCongresses.length > 0) {
					// This can run in background
					allCongresses.forEach(async (c) => {
						try {
							await loadEPosters(c);
						} catch (err) {
							console.error(
								`Failed to load e-posters for congress ${c.id}:`,
								err
							);
						}
					});
				}
			} catch (err) {
				console.error('Error fetching home page data:', err);
				setError(t('home.errors.dataLoadFailed'));
			} finally {
				setIsLoading(false);
			}
		}

		fetchData();

		// Cleanup on unmount
		return () => {
			if (carouselInterval.current) {
				clearInterval(carouselInterval.current);
			}
		};
	}, [t, i18n.language]);

	if (isLoading) {
		return (
			<LoadingSpinner
				message={t('congress.loading', 'Loading event details...')}
				background="transparent"
				fullScreen={true}
			/>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen">
				<div className="text-2xl font-semibold mb-4 text-red-600">
					{t('common.error')}
				</div>
				<div className="text-gray-600 mb-6">{error}</div>
				<button
					onClick={() => window.location.reload()}
					className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
				>
					{t('common.tryAgain')}
				</button>
			</div>
		);
	}

	return (
		<>
			<div className="flex flex-col relative">
				{/* Primary Action Section - High priority CTAs */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-100px' }}
					transition={{ duration: 0.6 }}
					className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-16 relative z-10"
				>
					<QuickActions />
				</motion.div>

				{/* Featured Congress Section - Next upcoming event */}
				{pastCongress && (
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: '-50px' }}
						transition={{ duration: 0.6 }}
						className="mt-16 w-full"
					>
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
							<div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl shadow-sm p-6 sm:p-8">
								<div className="flex flex-col md:flex-row gap-8">
									<div className="md:w-1/2">
										<div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
											{t('home.previousCongress.label')}
										</div>
										<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
											{pastCongress.title}
										</h2>
										<p className="text-gray-600 dark:text-gray-300 mb-6">
											{pastCongress.description}
										</p>

										<div className="flex flex-col space-y-4 mb-6">
											<div className="flex items-center">
												<Calendar className="w-5 h-5 text-blue-600 mr-3" />
												<span className="text-gray-700 dark:text-gray-300">
													{new Date(pastCongress.start_date).toLocaleDateString(
														i18n.language || 'en',
														{
															month: 'long',
															day: 'numeric',
														}
													)}{' '}
													-{' '}
													{new Date(pastCongress.end_date).toLocaleDateString(
														i18n.language || 'en',
														{
															month: 'long',
															day: 'numeric',
															year: 'numeric',
														}
													)}
												</span>
											</div>
										</div>

										<div className="flex flex-wrap gap-4">
											<Link
												href={`/archives/events/${pastCongress.id}`}
												passHref
											>
												<button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
													{t('home.upcomingCongress.learnMore')}
													<ArrowRight className="w-4 h-4 ml-2" />
												</button>
											</Link>
										</div>
									</div>

									<div className="md:w-1/2 relative min-h-[300px] rounded-xl overflow-hidden">
										<Image
											src={
												previousCongressImages[0] ||
												'/images/congress-default-banner.jpg'
											}
											alt={pastCongress.title}
											fill
											className="object-cover rounded-xl"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
										<div className="absolute bottom-0 left-0 right-0 p-6">
											<div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-2">
												{t(`congressTypes.${pastCongress.congress_type}`)}
											</div>
											<h3 className="text-xl font-bold text-white">
												{pastCongress.location &&
												typeof pastCongress.location === 'object'
													? pastCongress.location.name || 'Location TBA'
													: pastCongress.location || 'Location TBA'}
											</h3>
										</div>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				)}

				{/* Featured Activities Section - Current engagement opportunities */}
				{upcomingCongress?.registration && (
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: '-50px' }}
						transition={{ duration: 0.6 }}
						className="mt-16 w-full"
					>
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
							<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 sm:p-8">
								{featuredActivities.length > 0 ? (
									<FeaturedActivities activities={featuredActivities} />
								) : (
									<NoActivitiesPlaceholder />
								)}
							</div>
						</div>
					</motion.div>
				)}

				{/* Visual Gallery Section - Engaging visual content */}
				{allCongressImages.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: '-50px' }}
						transition={{ duration: 0.6 }}
						className="mt-16 w-full bg-gray-50 dark:bg-gray-900 py-16"
					>
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
							<div className="text-center mb-10">
								<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
									{t('home.congressGallery.title')}
								</h2>
								<p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
									{t('home.congressGallery.subtitle')}
								</p>
							</div>
							<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
								<div className="relative overflow-hidden aspect-video">
									<AnimatePresence initial={false}>
										<motion.div
											key={currentImageIndex}
											className="absolute inset-0"
											initial={{ opacity: 0, scale: 1.05 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0 }}
											transition={{ duration: 0.7 }}
										>
											<Image
												src={allCongressImages[currentImageIndex]}
												alt={`${t('home.congressGallery.imageAlt')} ${
													currentImageIndex + 1
												}`}
												fill
												className="object-cover"
											/>
										</motion.div>
									</AnimatePresence>

									{allCongressImages.length > 1 && (
										<>
											<button
												onClick={previousImage}
												className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors z-10 backdrop-blur-sm"
												aria-label={t('common.previousImage')}
											>
												<ChevronLeft className="w-6 h-6" />
											</button>
											<button
												onClick={nextImage}
												className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors z-10 backdrop-blur-sm"
												aria-label={t('common.nextImage')}
											>
												<ChevronRight className="w-6 h-6" />
											</button>
										</>
									)}
								</div>
								<div className="flex justify-center py-4 bg-white dark:bg-gray-800">
									<div className="flex space-x-3">
										{allCongressImages.slice(0, 5).map((_, index) => (
											<button
												key={index}
												onClick={() => setCurrentImageIndex(index)}
												className={`w-3 h-3 rounded-full transition-all duration-300 ${
													index === currentImageIndex
														? 'bg-primary-600 scale-125'
														: 'bg-gray-300 hover:bg-gray-400'
												}`}
												aria-label={`${t('common.goToImage')} ${index + 1}`}
											/>
										))}
										{allCongressImages.length > 5 && (
											<span className="text-gray-500 text-sm ml-2">
												+{allCongressImages.length - 5} {t('common.more')}
											</span>
										)}
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				)}

				{/* Previous Events Section - Social proof */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-50px' }}
					transition={{ duration: 0.6 }}
					className="mt-16 w-full"
				>
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
							<div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
								<h2 className="text-2xl font-bold text-white">
									{t('home.previousEvents.title')}
								</h2>
							</div>
							<div className="p-6 sm:p-8">
								{pastCongresses.length > 0 ? (
									<>
										<p className="text-gray-600 dark:text-gray-300 max-w-2xl mb-8">
											{t('home.previousEvents.subtitle')}
										</p>
										<PreviousEvents events={pastCongresses} />
									</>
								) : (
									<div className="text-center py-12 bg-gray-50 dark:bg-gray-700/20 rounded-xl">
										<h3 className="text-xl font-semibold mb-2">
											{t('home.previousEvents.noPastEvents')}
										</h3>
										<p className="text-gray-500 dark:text-gray-400">
											{t('home.previousEvents.checkBackLater')}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</motion.div>

				{/* Partners Showcase Section */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-50px' }}
					transition={{ duration: 0.6 }}
					className="mt-16 w-full bg-white dark:bg-gray-800 py-16"
				>
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<PartnersCarousel />
					</div>
				</motion.div>

				{/* Annual Reports - Important documents */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-50px' }}
					transition={{ duration: 0.6 }}
					className="mt-16 w-full"
				>
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
							<div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
								<h2 className="text-2xl font-bold text-white">
									{t('home.annualReports.title')}
								</h2>
							</div>
							<div className="p-6 sm:p-8">
								<p className="text-gray-600 dark:text-gray-300 max-w-2xl mb-8">
									{t('home.annualReports.subtitle')}
								</p>
								<AnnualReports reports={annualReports} />
							</div>
						</div>
					</div>
				</motion.div>

				{/* Team and Association Section - Build trust */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-50px' }}
					transition={{ duration: 0.6 }}
					className="mt-16 w-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16"
				>
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
							<div className="p-6 sm:p-8">
								<TeamAssociationSection />
							</div>
						</div>
					</div>
				</motion.div>

				{/* Newsletter Section - Final CTA */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-50px' }}
					transition={{ duration: 0.6 }}
					className="mt-16 mb-16 w-full"
				>
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
							<div className="p-8 sm:p-10">
								<NewsletterSection />
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</>
	);
}

function LinkedInIcon({ className }: { className?: string }) {
	const { t } = useTranslation();
	return (
		<svg
			className={className}
			fill="currentColor"
			viewBox="0 0 24 24"
			aria-label={t('footer.socialMedia.linkedin')}
		>
			<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
		</svg>
	);
}

function TwitterIcon({ className }: { className?: string }) {
	const { t } = useTranslation();
	return (
		<svg
			className={className}
			fill="currentColor"
			viewBox="0 0 24 24"
			aria-label={t('footer.socialMedia.twitter')}
		>
			<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
		</svg>
	);
}
