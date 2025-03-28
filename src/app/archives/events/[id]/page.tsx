'use client';

import { ProtectedContent } from '@/components/common/ProtectedContent';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import FlipbookPDFViewer from '@/components/ui/pdfViewer';
import { getCongressById } from '@/lib/api';
import { getCongressFolderPath } from '@/lib/utils';
import { Congress } from '@/types/database';
import { AnimatePresence, motion } from 'framer-motion';
import {
	ArrowLeft,
	Calendar,
	ChevronLeft,
	ChevronRight,
	FileText,
	Globe,
	Image as ImageIcon,
	MapPin,
	Share2,
	Ticket,
	Youtube,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import path from 'path';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const mapContainerStyle = {
	width: '100%',
	height: '400px',
	borderRadius: '1rem',
};

const defaultCenter = {
	lat: 40.416775,
	lng: -3.70379,
};

export default function CongressDetailPage() {
	const { t } = useTranslation();
	const params = useParams();
	const router = useRouter();
	const [congress, setCongress] = useState<Congress | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [mapCenter, setMapCenter] = useState(defaultCenter);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [congressImages, setCongressImages] = useState<string[]>([]);
	const [congressVideos, setCongressVideos] = useState<string[]>([]);
	const [ePosters, setEPosters] = useState<string[]>([]);
	const [hasAffiche, setHasAffiche] = useState(false);
	const [hasProgramme, setHasProgramme] = useState(false);
	const [pdfFiles, setPdfFiles] = useState<string[]>([]);
	const [heroImages, setHeroImages] = useState<string[]>([]);
	const [currentHeroImage, setCurrentHeroImage] = useState(0);
	const heroSlideInterval = useRef<NodeJS.Timeout | null>(null);
	const slideInterval = useRef<NodeJS.Timeout | null>(null);
	const [activeTab, setActiveTab] = useState('info');

	// Function to shuffle array (Fisher-Yates algorithm)
	const shuffleArray = (array: any[]) => {
		const newArray = [...array];
		for (let i = newArray.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
		}
		return newArray;
	};

	// Setup hero image slideshow
	useEffect(() => {
		if (congressImages.length > 0) {
			// Get up to 5 random images for the hero slideshow
			const shuffled = shuffleArray(congressImages);
			setHeroImages(shuffled.slice(0, Math.min(5, shuffled.length)));
			setCurrentHeroImage(0);
		}
	}, [congressImages]);

	// Handle hero image rotation
	useEffect(() => {
		if (heroImages.length > 1) {
			// Clear any existing interval
			if (heroSlideInterval.current) {
				clearInterval(heroSlideInterval.current);
			}

			// Set up new interval to change hero image every 10 seconds
			heroSlideInterval.current = setInterval(() => {
				setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
			}, 10000);
		}

		// Cleanup interval on unmount
		return () => {
			if (heroSlideInterval.current) {
				clearInterval(heroSlideInterval.current);
			}
		};
	}, [heroImages]);

	useEffect(() => {
		async function fetchCongress() {
			if (!params.id) {
				setError('Congress ID is missing');
				setIsLoading(false);
				return;
			}

			try {
				const congressData = await getCongressById(params.id as string);
				if (!congressData) {
					setError('Congress not found');
				} else {
					setCongress(congressData);

					// Try to find the congress folder and load images
					const folderPath = getCongressFolderPath({
						start_date: congressData.start_date,
						title: congressData.title,
						location:
							typeof congressData.location === 'string'
								? congressData.location
								: congressData.location?.name || '',
					});
					if (folderPath) {
						// Check if photos folder exists and load images
						try {
							// Use getCongressPhotos function to get images based on the numeric count
							if (
								typeof congressData.images === 'number' &&
								congressData.images > 0
							) {
								console.log(
									`Congress has ${congressData.images} numbered images from database`
								);
								const photosFromDb = await import('@/lib/utils').then((m) =>
									m.getCongressPhotos(congressData)
								);
								console.log(
									'Loaded photos using getCongressPhotos:',
									photosFromDb
								);
								setCongressImages(photosFromDb);
							} else {
								// Fallback to directory listing if no images count in DB
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

									// Filter for JPG images only (not NEF or other formats)
									const filteredFiles = imageFiles.filter(
										(file: string) =>
											file.toLowerCase().endsWith('.jpg') ||
											file.toLowerCase().endsWith('.jpeg') ||
											file.toLowerCase().endsWith('.png')
									);

									// Create full paths for images
									const images = filteredFiles.map(
										(file: string) => `${photosPath}/${file}`
									);
									setCongressImages(images);
								} else {
									// Fallback to default images if needed
									setCongressImages(congressData.images || []);
								}
							}
						} catch (err) {
							console.error('Error loading congress images:', err);
							// Fallback to default images if needed
							setCongressImages(congressData.images || []);
						}

						// Check if videos folder exists and load videos
						try {
							const videosPath = `${folderPath}/videos`;

							// Use our API endpoint to get directory contents
							const videoFilesResponse = await fetch(
								`/api/getDirectoryContents?path=${encodeURIComponent(
									videosPath.slice(1)
								)}`,
								{
									cache: 'no-store', // Ensure we don't cache the results
								}
							);

							if (videoFilesResponse.ok) {
								const videoFiles = await videoFilesResponse.json();

								// Filter for video files
								const filteredFiles = videoFiles.filter(
									(file: string) =>
										file.toLowerCase().endsWith('.mp4') ||
										file.toLowerCase().endsWith('.webm') ||
										file.toLowerCase().endsWith('.mov')
								);

								// Create full paths for videos
								const videos = filteredFiles.map(
									(file: string) => `${videosPath}/${file}`
								);
								setCongressVideos(videos);
							} else {
								// Fallback to webinars from congress data
								setCongressVideos(congressData.webinars || []);
							}
						} catch (err) {
							console.error('Error loading congress videos:', err);
							// Fallback to webinars from congress data
							setCongressVideos(congressData.webinars || []);
						}

						// Check if e-posters folder exists and load e-posters
						try {
							const ePostersPath = `${folderPath}/e-posters`;

							// Use getCongressEPosters function to get e-posters
							if (
								congressData['eposters'] &&
								Array.isArray(congressData['eposters']) &&
								congressData['eposters'].length > 0
							) {
								console.log(
									'E-posters from database:',
									congressData['eposters']
								);
								const ePostersFromDb = await import('@/lib/utils').then((m) =>
									m.getCongressEPosters(congressData)
								);
								console.log('Loaded e-posters:', ePostersFromDb);
								setEPosters(ePostersFromDb);
							} else {
								// Fallback to directory listing if no e-posters in DB
								const ePostersResponse = await fetch(
									`/api/getDirectoryContents?path=${encodeURIComponent(
										ePostersPath.slice(1)
									)}`,
									{
										cache: 'no-store', // Ensure we don't cache the results
									}
								);

								if (ePostersResponse.ok) {
									const posterFiles = await ePostersResponse.json();

									// Filter for PDF files
									const filteredFiles = posterFiles.filter((file: string) =>
										file.toLowerCase().endsWith('.pdf')
									);

									// Create full paths for e-posters
									const posters = filteredFiles.map(
										(file: string) => `${ePostersPath}/${file}`
									);
									setEPosters(posters);
								} else {
									setEPosters([]);
								}
							}
						} catch (err) {
							console.error('Error loading e-posters:', err);
							setEPosters([]);
						}

						// Check if affiche.pdf exists
						try {
							const affichePath = `${folderPath}/affiche.pdf`;

							// Use our API endpoint to check if file exists
							const afficheResponse = await fetch(
								`/api/fileExists?path=${encodeURIComponent(
									affichePath.slice(1)
								)}`,
								{
									cache: 'no-store', // Ensure we don't cache the results
								}
							);

							if (afficheResponse.ok) {
								const data = await afficheResponse.json();
								setHasAffiche(data.exists);
								if (data.exists) {
									setPdfFiles((prev) => [...prev, `${folderPath}/affiche.pdf`]);
								}
							} else {
								setHasAffiche(false);
							}
						} catch (err) {
							console.error('Error checking for affiche.pdf:', err);
							setHasAffiche(false);
						}

						// Check if programme.pdf exists
						try {
							const programmePath = `${folderPath}/programme.pdf`;

							// Use our API endpoint to check if file exists
							const programmeResponse = await fetch(
								`/api/fileExists?path=${encodeURIComponent(
									programmePath.slice(1)
								)}`,
								{
									cache: 'no-store', // Ensure we don't cache the results
								}
							);

							if (programmeResponse.ok) {
								const data = await programmeResponse.json();
								setHasProgramme(data.exists);
								if (data.exists) {
									setPdfFiles((prev) => [
										...prev,
										`${folderPath}/programme.pdf`,
									]);
								}
							} else {
								setHasProgramme(false);
							}
						} catch (err) {
							console.error('Error checking for programme.pdf:', err);
							setHasProgramme(false);
						}
					}
				}
			} catch (err) {
				console.error('Error fetching congress:', err);
				setError('Failed to load congress data');
			} finally {
				setIsLoading(false);
			}
		}

		fetchCongress();
	}, [params.id]);

	const nextImage = () => {
		if (congressImages && congressImages.length > 0) {
			setCurrentImageIndex((prev) =>
				prev === congressImages.length - 1 ? 0 : prev + 1
			);
		}
		startAutoAdvance();
	};

	const previousImage = () => {
		if (congressImages && congressImages.length > 0) {
			setCurrentImageIndex((prev) =>
				prev === 0 ? congressImages.length - 1 : prev - 1
			);
		}
		startAutoAdvance();
	};

	const startAutoAdvance = () => {
		if (slideInterval.current) {
			clearInterval(slideInterval.current);
		}
		slideInterval.current = setInterval(() => {
			setCurrentImageIndex((prev) =>
				prev === congressImages.length - 1 ? 0 : prev + 1
			);
		}, 5000);
	};

	useEffect(() => {
		if (congressImages.length > 1) {
			startAutoAdvance();
		}
		return () => {
			if (slideInterval.current) clearInterval(slideInterval.current);
		};
	}, [congressImages]);

	if (isLoading) {
		return (
			<LoadingSpinner
				message={t('common.loading')}
				background="transparent"
				fullScreen={true}
			/>
		);
	}

	if (error || !congress) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen pt-20">
				<div className="text-2xl font-semibold mb-4 text-red-600">
					{t('common.error')}
				</div>
				<div className="text-gray-600 mb-6">
					{error || 'Congress not found'}
				</div>
				<div className="flex space-x-4">
					<Button
						onClick={() => router.back()}
						variant="outline"
						className="flex items-center"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						{t('common.goBack')}
					</Button>
					<Link href="/archives/events" passHref>
						<Button>{t('archives.backToEvents')}</Button>
					</Link>
				</div>
			</div>
		);
	}

	// Format dates
	const startDate = new Date(congress.start_date);
	const endDate = new Date(congress.end_date);
	const formattedDateRange = `${startDate.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
	})} - ${endDate.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	})}`;

	// Calculate days until congress
	const today = new Date();

	// Calculate date 3 months before congress start (for abstract submission)
	const threeMonthsBefore = new Date(startDate);
	threeMonthsBefore.setMonth(startDate.getMonth() - 3);
	const abstractDeadline = threeMonthsBefore.toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});

	// Calculate days until the actual congress start date
	const daysUntil = Math.ceil(
		(startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
	);
	const isUpcoming = daysUntil > 0;
	const isPast = today > endDate;
	const isActive = congress.state === 2;

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
			{/* Breadcrumb Navigation */}
			<nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-4 py-4 flex items-center text-sm">
					<Link
						href="/"
						className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
					>
						{t('common.home')}
					</Link>
					<span className="mx-2 text-gray-400">/</span>
					<Link
						href="/archives/events"
						className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
					>
						{t('archives.events')}
					</Link>
					<span className="mx-2 text-gray-400">/</span>
					<span className="text-gray-900 dark:text-white font-medium truncate">
						{congress.title}
					</span>
				</div>
			</nav>

			<div className="max-w-7xl mx-auto px-4 py-12">
				{/* Congress Details Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8"
				>
					{/* Hero Banner */}
					<div className="relative bg-white dark:bg-gray-800">
						<div className="max-w-7xl mx-auto px-6 pt-8 pb-6">
							<div className="flex items-center space-x-2 mb-3">
								<Button
									variant="ghost"
									size="sm"
									className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 -ml-3"
									onClick={() => router.back()}
								>
									<ArrowLeft className="w-4 h-4 mr-1" />
									{t('common.back')}
								</Button>
								<span className="text-gray-300 dark:text-gray-600">/</span>
								<span className="text-sm text-gray-500 dark:text-gray-400">
									{t('archives.pastEvents')}
								</span>
							</div>
							<div className="flex flex-col md:flex-row md:items-start md:space-x-8">
								<div className="flex-1 mb-6 md:mb-0">
									<div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-primary-100 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 mb-4">
										{new Date(congress.start_date).getFullYear()}
									</div>
									<h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
										{congress.title}
									</h1>
									<div className="flex items-center mb-4 text-gray-600 dark:text-gray-300">
										<Calendar className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" />
										<span>{formattedDateRange}</span>
									</div>
									{congress.location && (
										<div className="flex items-center mb-6 text-gray-600 dark:text-gray-300">
											<MapPin className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" />
											<span>
												{typeof congress.location === 'object'
													? congress.location.name
													: congress.location}
											</span>
										</div>
									)}
								</div>
								<div className="md:w-1/3 lg:w-2/5">
									<div className="relative rounded-lg overflow-hidden shadow-lg h-56 md:h-72 bg-gray-100 dark:bg-gray-700">
										{heroImages.length > 0 ? (
											<AnimatePresence initial={false} mode="wait">
												<motion.div
													key={currentHeroImage}
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													exit={{ opacity: 0 }}
													transition={{
														duration: 1.2,
														ease: [0.25, 0.1, 0.25, 1.0],
														opacity: { duration: 0.8 },
													}}
													className="absolute inset-0 z-0"
												>
													<Image
														src={heroImages[currentHeroImage]}
														alt={congress.title}
														fill
														className="object-cover"
														sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
														priority={currentHeroImage === 0}
													/>
												</motion.div>
											</AnimatePresence>
										) : (
											<div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
												<Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500" />
											</div>
										)}
										{heroImages.length > 1 && (
											<div className="absolute bottom-3 right-3 flex space-x-1">
												<Button
													size="icon"
													variant="secondary"
													className="w-8 h-8 bg-black/30 text-white hover:bg-black/50 dark:bg-black/50 dark:hover:bg-black/70 rounded-full"
													onClick={previousImage}
												>
													<ChevronLeft className="w-4 h-4" />
												</Button>
												<Button
													size="icon"
													variant="secondary"
													className="w-8 h-8 bg-black/30 text-white hover:bg-black/50 dark:bg-black/50 dark:hover:bg-black/70 rounded-full"
													onClick={nextImage}
												>
													<ChevronRight className="w-4 h-4" />
												</Button>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Tabbed Content Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8"
					>
						{/* Tabs Navigation */}
						<div className="border-b border-gray-200 dark:border-gray-700">
							<nav className="flex overflow-x-auto">
								<button
									onClick={() => setActiveTab('info')}
									className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
										activeTab === 'info'
											? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
											: 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
									}`}
								>
									{t('congress.information')}
								</button>

								{congressImages.length > 0 && (
									<button
										onClick={() => setActiveTab('photos')}
										className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
											activeTab === 'photos'
												? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
												: 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
										}`}
									>
										{t('congress.photos')}
									</button>
								)}

								{congressVideos.length > 0 && (
									<button
										onClick={() => setActiveTab('videos')}
										className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
											activeTab === 'videos'
												? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
												: 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
										}`}
									>
										{t('congress.videos')}
									</button>
								)}

								{ePosters.length > 0 && (
									<button
										onClick={() => setActiveTab('eposters')}
										className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
											activeTab === 'eposters'
												? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
												: 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
										}`}
									>
										{t('congress.eposters') || 'E-Posters'}
									</button>
								)}

								{(congress.program_file || hasAffiche || hasProgramme) && (
									<button
										onClick={() => setActiveTab('program')}
										className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
											activeTab === 'program'
												? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
												: 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
										}`}
									>
										{t('congress.program')}
									</button>
								)}
							</nav>
						</div>

						{/* Tab Content */}
						<div className="p-8">
							{/* Info Tab */}
							{activeTab === 'info' && (
								<div>
									{/* Description */}
									<div className="prose dark:prose-invert max-w-none mb-8">
										<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
											{t('congress.about')}
										</h2>
										<p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
											{congress.description}
										</p>
									</div>

									{/* Key Information */}
									<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
										<div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
											<div className="flex items-center mb-4">
												<div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full mr-4">
													<Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
												</div>
												<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
													{t('congress.dates')}
												</h3>
											</div>
											<p className="text-gray-700 dark:text-gray-300">
												{formattedDateRange}
											</p>
											{isUpcoming && (
												<p className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
													{daysUntil === 0
														? t('congress.startsToday')
														: daysUntil === 1
														? t('congress.startsTomorrow')
														: t('congress.startsIn', { days: daysUntil })}
												</p>
											)}
										</div>

										<div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
											<div className="flex items-center mb-4">
												<div className="bg-purple-100 dark:bg-purple-800 p-3 rounded-full mr-4">
													<MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
												</div>
												<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
													{t('congress.location')}
												</h3>
											</div>
											<p className="text-gray-700 dark:text-gray-300">
												{typeof congress.location === 'string'
													? congress.location
													: congress.location?.name}
											</p>
										</div>

										<div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
											<div className="flex items-center mb-4">
												<div className="bg-green-100 dark:bg-green-800 p-3 rounded-full mr-4">
													<Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
												</div>
												<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
													{t('congress.type')}
												</h3>
											</div>
											<p className="text-gray-700 dark:text-gray-300">
												{t(`congressTypes.${congress.congress_type}`)}
											</p>
										</div>
									</div>

									{/* Action Buttons */}
									<div className="flex flex-wrap gap-4">
										{isActive && (
											<>
												<Button
													size="lg"
													className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-transform hover:scale-105"
												>
													<Ticket className="w-5 h-5 mr-2" />
													{t('congress.registerNow')}
												</Button>
												{congress.program_file && (
													<Button
														size="lg"
														variant="outline"
														className="border-blue-600 text-blue-600 hover:bg-blue-50 transition-transform hover:scale-105"
														onClick={() =>
															window.open(congress.program_file, '_blank')
														}
													>
														<FileText className="w-5 h-5 mr-2" />
														{t('congress.viewProgram')}
													</Button>
												)}
											</>
										)}
										<Button
											size="lg"
											variant="outline"
											className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-transform hover:scale-105"
										>
											<Share2 className="w-5 h-5 mr-2" />
											{t('congress.share')}
										</Button>
									</div>
								</div>
							)}

							{/* Photos Tab */}
							{activeTab === 'photos' && congressImages.length > 0 && (
								<div>
									<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
										<div className="bg-amber-100 dark:bg-amber-800/30 p-2 rounded-lg mr-3">
											<ImageIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
										</div>
										{t('congress.photos')}
									</h2>

									<div className="relative aspect-[21/9] w-full">
										<AnimatePresence initial={false} mode="wait">
											<motion.div
												key={currentImageIndex}
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												transition={{
													duration: 1.2,
													ease: [0.25, 0.1, 0.25, 1.0],
													opacity: { duration: 0.8 },
												}}
												className="absolute inset-0"
											>
												<Image
													src={congressImages[currentImageIndex]}
													alt={`Congress Image ${currentImageIndex + 1}`}
													fill
													className="object-cover rounded-xl"
													priority={currentImageIndex === 0}
													sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
													quality={90}
												/>
												<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl" />
											</motion.div>
										</AnimatePresence>

										{/* Carousel Controls */}
										<div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
											<motion.div
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.95 }}
												transition={{ duration: 0.2 }}
											>
												<Button
													variant="ghost"
													size="icon"
													onClick={previousImage}
													className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all duration-300"
												>
													<ChevronLeft className="h-8 w-8" />
												</Button>
											</motion.div>
											<motion.div
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.95 }}
												transition={{ duration: 0.2 }}
											>
												<Button
													variant="ghost"
													size="icon"
													onClick={nextImage}
													className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all duration-300"
												>
													<ChevronRight className="h-8 w-8" />
												</Button>
											</motion.div>
										</div>

										{/* Carousel Indicators */}
										<div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
											{congressImages.map((_, index) => (
												<motion.button
													key={index}
													onClick={() => setCurrentImageIndex(index)}
													className={`h-2.5 rounded-full transition-all duration-500 ${
														currentImageIndex === index
															? 'bg-white w-8'
															: 'bg-white/50 w-2.5 hover:bg-white/80'
													}`}
													whileHover={{ scale: 1.2 }}
													whileTap={{ scale: 0.9 }}
													aria-label={`Go to slide ${index + 1}`}
												/>
											))}
										</div>

										{/* Image Counter */}
										<div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium">
											{currentImageIndex + 1} / {congressImages.length}
										</div>
									</div>
								</div>
							)}

							{/* Videos Tab - Only shown if user has access */}
							{activeTab === 'videos' && congressVideos.length > 0 && (
								<ProtectedContent
									congressId={params.id as string}
									contentType="webinar"
								>
									<div>
										<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
											<div className="bg-red-100 dark:bg-red-800/30 p-2 rounded-lg mr-3">
												<Youtube className="w-6 h-6 text-red-600 dark:text-red-400" />
											</div>
											{t('congress.videos')}
										</h2>
										<div className="overflow-x-auto">
											<table className="w-full">
												<thead>
													<tr className="border-b border-gray-200 dark:border-gray-700">
														<th className="text-left py-4 px-4 font-medium text-gray-600 dark:text-gray-300">
															{t('congress.videoTitle')}
														</th>
														<th className="text-right py-4 px-4 font-medium text-gray-600 dark:text-gray-300">
															{t('congress.actions')}
														</th>
													</tr>
												</thead>
												<tbody>
													{congressVideos.map((video, index) => (
														<tr
															key={index}
															className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
														>
															<td className="py-4 px-4 text-gray-900 dark:text-white">
																{path
																	.basename(video)
																	.split('.')[0]
																	.replace(/_/g, ' ')
																	.toUpperCase()}
															</td>
															<td className="py-4 px-4 text-right">
																<Button
																	variant="ghost"
																	className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
																	onClick={() => window.open(video, '_blank')}
																>
																	<Youtube className="w-5 h-5 mr-2" />
																	{t('congress.watchVideo')}
																</Button>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								</ProtectedContent>
							)}

							{/* E-Posters Tab */}
							{activeTab === 'eposters' && ePosters.length > 0 && (
								<ProtectedContent
									congressId={params.id as string}
									contentType="eposter"
								>
									<div>
										<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
											<div className="bg-purple-100 dark:bg-purple-800/30 p-2 rounded-lg mr-3">
												<FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
											</div>
											{t('congress.eposters') || 'E-Posters'}
										</h2>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
											{ePosters.map((poster, index) => {
												const posterName = path
													.basename(poster, '.pdf')
													.replace(/_/g, ' ');
												return (
													<div
														key={index}
														className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
													>
														<div className="p-6">
															<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
																{posterName}
															</h3>

															<Link
																href={`/archives/events/${
																	params.id
																}/eposters/${encodeURIComponent(
																	path.basename(poster)
																)}`}
																passHref
															>
																<Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
																	<FileText className="w-4 h-4 mr-2" />
																	{t('congress.viewPoster') || 'View Poster'}
																</Button>
															</Link>
														</div>
													</div>
												);
											})}
										</div>
									</div>
								</ProtectedContent>
							)}

							{/* Program Tab */}
							{activeTab === 'program' &&
								(congress.program_file || hasAffiche || hasProgramme) && (
									<div>
										<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
											<div className="bg-primary-100 dark:bg-primary-800/30 p-2 rounded-lg mr-3">
												<FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
											</div>
											{t('congress.programDetails')}
										</h2>
										<div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-inner">
											<FlipbookPDFViewer
												pdfUrl={
													pdfFiles.length > 0
														? pdfFiles
														: congress.program_file
														? [congress.program_file]
														: ['/programs/programme.pdf']
												}
												bookMode={
													pdfFiles.length > 1 || (!hasAffiche && hasProgramme)
												}
											/>
										</div>
									</div>
								)}
						</div>
					</motion.div>
				</motion.div>
			</div>
		</div>
	);
}
