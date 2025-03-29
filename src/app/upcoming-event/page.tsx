'use client';

import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import FlipbookPDFViewer from '@/components/ui/pdfViewer';
import { getUpcomingCongress } from '@/lib/api';
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
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function UpcomingEventPage() {
	const { t, i18n } = useTranslation();
	const router = useRouter();

	// State declarations
	const [event, setEvent] = useState<Congress | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [eventImages, setEventImages] = useState<string[]>([]);
	const [pdfFiles, setPdfFiles] = useState<string[]>([]);
	const [registrationOpen, setRegistrationOpen] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [heroImages, setHeroImages] = useState<string[]>([]);
	const [currentHeroImage, setCurrentHeroImage] = useState(0);
	const [activeTab, setActiveTab] = useState('info');

	const heroSlideInterval = useRef<NodeJS.Timeout | null>(null);
	const slideInterval = useRef<NodeJS.Timeout | null>(null);

	// Function to shuffle array (Fisher-Yates algorithm)
	const shuffleArray = (array: any[]) => {
		const newArray = [...array];
		for (let i = newArray.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
		}
		return newArray;
	};

	// Helper: Format date range
	const formatDateRange = (start: string, end: string) => {
		const s = new Date(start);
		const e = new Date(end);
		const currentLanguage = i18n.language || 'en';

		return `${s.toLocaleDateString(currentLanguage, {
			month: 'long',
			day: 'numeric',
		})} - ${e.toLocaleDateString(currentLanguage, {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		})}`;
	};

	// Setup hero image slideshow
	useEffect(() => {
		if (eventImages.length > 0) {
			// Get up to 5 random images for the hero slideshow
			const shuffled = shuffleArray(eventImages);
			setHeroImages(shuffled.slice(0, Math.min(5, shuffled.length)));
			setCurrentHeroImage(0);
		}
	}, [eventImages]);

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

	// Fetch event and media data
	useEffect(() => {
		async function fetchData() {
			try {
				const data = await getUpcomingCongress();
				if (!data) {
					console.warn('No upcoming event found');
					setError(t('congress.eventNotFound', 'Event not found'));
					setIsLoading(false);
					return;
				} else {
					setEvent(data);
					setRegistrationOpen(!!data.registration_open);

					const folderPath = getCongressFolderPath({
						start_date: data.start_date,
						title: data.title,
						location:
							typeof data.location === 'string'
								? data.location
								: data.location?.name ?? '',
					});

					if (folderPath) {
						// Fetch images
						try {
							const photosPath = `${folderPath}/photos`;
							const res = await fetch(
								`/api/getDirectoryContents?path=${encodeURIComponent(
									photosPath.slice(1)
								)}`,
								{ cache: 'no-store' }
							);
							if (res.ok) {
								const imgs: string[] = await res.json();
								const filtered = imgs.filter((file) =>
									['.jpg', '.jpeg', '.png'].some((ext) =>
										file.toLowerCase().endsWith(ext)
									)
								);
								setEventImages(filtered.map((file) => `${photosPath}/${file}`));
							} else {
								setEventImages(data.images || []);
							}
						} catch (err) {
							console.error(err);
							setEventImages(data.images || []);
						}

						// Fetch PDFs
						try {
							const affichePath = `${folderPath}/affiche.pdf`;
							const res = await fetch(
								`/api/fileExists?path=${encodeURIComponent(
									affichePath.slice(1)
								)}`,
								{ cache: 'no-store' }
							);
							if (res.ok) {
								const { exists } = await res.json();
								if (exists) {
									setPdfFiles((prev) => [...prev, `${folderPath}/affiche.pdf`]);
								}
							}
						} catch (err) {
							console.error(err);
						}
						try {
							const programmePath = `${folderPath}/programme.pdf`;
							const res = await fetch(
								`/api/fileExists?path=${encodeURIComponent(
									programmePath.slice(1)
								)}`,
								{ cache: 'no-store' }
							);
							if (res.ok) {
								const { exists } = await res.json();
								if (exists) {
									setPdfFiles((prev) => [
										...prev,
										`${folderPath}/programme.pdf`,
									]);
								}
							}
						} catch (err) {
							console.error(err);
						}
					}
				}
			} catch (err) {
				console.error(err);
				setError('Failed to load event data');
			} finally {
				setIsLoading(false);
			}
		}
		fetchData();
	}, []);

	const nextImage = () => {
		if (eventImages && eventImages.length > 0) {
			setCurrentImageIndex((prev) =>
				prev === eventImages.length - 1 ? 0 : prev + 1
			);
		}
		startAutoAdvance();
	};

	const previousImage = () => {
		if (eventImages && eventImages.length > 0) {
			setCurrentImageIndex((prev) =>
				prev === 0 ? eventImages.length - 1 : prev - 1
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
				prev === eventImages.length - 1 ? 0 : prev + 1
			);
		}, 5000);
	};

	useEffect(() => {
		if (eventImages.length > 1) {
			startAutoAdvance();
		}
		return () => {
			if (slideInterval.current) clearInterval(slideInterval.current);
		};
	}, [eventImages]);

	if (isLoading) {
		return (
			<LoadingSpinner
				message={t('common.loading')}
				background="transparent"
				fullScreen={true}
			/>
		);
	}

	if (error || !event) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen pt-20">
				<div className="text-2xl font-semibold mb-4 text-red-600">
					{t('common.error')}
				</div>
				<div className="text-gray-600 mb-6">
					{error || t('congress.eventNotFound', 'Event not found')}
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
					<Link href="/" passHref>
						<Button>{t('common.backToHome', 'Back to Home')}</Button>
					</Link>
				</div>
			</div>
		);
	}

	// Format dates
	const startDate = new Date(event.start_date);
	const endDate = new Date(event.end_date);
	const formattedDateRange = formatDateRange(event.start_date, event.end_date);

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
					<span className="text-gray-900 dark:text-white font-medium truncate">
						{event.title}
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
									{t('congress.upcomingEvent', 'Upcoming Event')}
								</span>
							</div>
							<div className="flex flex-col md:flex-row md:items-start md:space-x-8">
								<div className="flex-1 mb-6 md:mb-0">
									<div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-primary-100 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 mb-4">
										{new Date(event.start_date).getFullYear()}
									</div>
									<h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
										{event.title}
									</h1>
									<div className="flex items-center mb-4 text-gray-600 dark:text-gray-300">
										<Calendar className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" />
										<span>{formattedDateRange}</span>
									</div>
									{event.location && (
										<div className="flex items-center mb-6 text-gray-600 dark:text-gray-300">
											<MapPin className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" />
											<span>
												{typeof event.location === 'object'
													? event.location.name
													: event.location}
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
														alt={event.title}
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
													onClick={() =>
														setCurrentHeroImage((prev) =>
															prev === 0 ? heroImages.length - 1 : prev - 1
														)
													}
												>
													<ChevronLeft className="w-4 h-4" />
												</Button>
												<Button
													size="icon"
													variant="secondary"
													className="w-8 h-8 bg-black/30 text-white hover:bg-black/50 dark:bg-black/50 dark:hover:bg-black/70 rounded-full"
													onClick={() =>
														setCurrentHeroImage(
															(prev) => (prev + 1) % heroImages.length
														)
													}
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

								{eventImages.length > 0 && (
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

								{(pdfFiles.filter((file) => file.includes('affiche')).length >
									0 ||
									(event.registration_open &&
										(event.program_file || pdfFiles.length > 0))) && (
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

								<button
									onClick={() => setActiveTab('abstracts')}
									className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
										activeTab === 'abstracts'
											? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
											: 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
									}`}
								>
									{t('congress.abstracts')}
								</button>

								<button
									onClick={() => setActiveTab('registration')}
									className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
										activeTab === 'registration'
											? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
											: 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
									}`}
								>
									{t('congress.registration')}
								</button>
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
										<div
											className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed"
											dangerouslySetInnerHTML={{
												__html:
													event.description ||
													t(
														'congress.noDescription',
														'No description available.'
													),
											}}
										/>
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
												{typeof event.location === 'string'
													? event.location
													: event.location?.name || ''}
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
												{t(
													`congressTypes.${event.congress_type}`,
													event.congress_type
												)}
											</p>
										</div>
									</div>

									{/* Action Buttons */}
									<div className="flex flex-wrap gap-4">
										{registrationOpen && (
											<Button
												size="lg"
												className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-transform hover:scale-105"
												asChild
											>
												<Link href="/dashboard/registration">
													<Ticket className="w-5 h-5 mr-2" />
													{t('congress.registerNow')}
												</Link>
											</Button>
										)}
										<Button
											size="lg"
											className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg transition-transform hover:scale-105"
											asChild
										>
											<Link href="/abstracts/new">
												<FileText className="w-5 h-5 mr-2" />
												{t('abstracts.submission.cta')}
											</Link>
										</Button>
										{event.registration_open && event.program_file && (
											<Button
												size="lg"
												variant="outline"
												className="border-blue-600 text-blue-600 hover:bg-blue-50 transition-transform hover:scale-105"
												onClick={() =>
													window.open(event.program_file, '_blank')
												}
											>
												<FileText className="w-5 h-5 mr-2" />
												{t('congress.viewProgram')}
											</Button>
										)}
										{pdfFiles.filter((file) => file.includes('affiche'))
											.length > 0 && (
											<Button
												size="lg"
												variant="outline"
												className="border-blue-600 text-blue-600 hover:bg-blue-50 transition-transform hover:scale-105"
												onClick={() => setActiveTab('program')}
											>
												<FileText className="w-5 h-5 mr-2" />
												{t('congress.viewPoster', 'View Poster')}
											</Button>
										)}
										{event.registration_open &&
											pdfFiles.filter((file) => !file.includes('affiche'))
												.length > 0 && (
												<Button
													size="lg"
													variant="outline"
													className="border-blue-600 text-blue-600 hover:bg-blue-50 transition-transform hover:scale-105"
													onClick={() => setActiveTab('program')}
												>
													<FileText className="w-5 h-5 mr-2" />
													{t('congress.viewProgram')}
												</Button>
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
							{activeTab === 'photos' && eventImages.length > 0 && (
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
													src={eventImages[currentImageIndex]}
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
											{eventImages.map((_, index) => (
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
											{currentImageIndex + 1} / {eventImages.length}
										</div>
									</div>
								</div>
							)}

							{/* Program Tab */}
							{activeTab === 'program' &&
								(pdfFiles.filter((file) => file.includes('affiche')).length >
									0 ||
									(event.registration_open &&
										(event.program_file || pdfFiles.length > 0))) && (
									<div>
										<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
											<div className="bg-primary-100 dark:bg-primary-800/30 p-2 rounded-lg mr-3">
												<FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
											</div>
											{t('congress.programDetails')}
										</h2>

										{/* Program documents cards */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
											{/* Show affiche */}
											{pdfFiles.filter((file) => file.includes('affiche'))
												.length > 0 && (
												<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
													<div className="bg-blue-50 dark:bg-blue-900/20 p-4">
														<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
															{t('congress.poster', 'Congress Poster')}
														</h3>
													</div>
													<div className="p-4">
														<div className="relative aspect-[3/4] w-full bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
															<iframe
																src={pdfFiles.find((file) =>
																	file.includes('affiche')
																)}
																className="absolute inset-0 w-full h-full"
																title="Congress Poster"
															/>
														</div>
														<div className="mt-4 flex justify-end">
															<Button
																variant="outline"
																size="sm"
																onClick={() =>
																	window.open(
																		pdfFiles.find((file) =>
																			file.includes('affiche')
																		),
																		'_blank'
																	)
																}
															>
																{t('common.openInNewTab', 'Open in new tab')}
															</Button>
														</div>
													</div>
												</div>
											)}

											{/* Show program */}
											{event.registration_open &&
												(pdfFiles.filter((file) => file.includes('programme'))
													.length > 0 ||
													event.program_file) && (
													<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
														<div className="bg-red-50 dark:bg-red-900/20 p-4">
															<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
																{t('congress.program', 'Congress Program')}
															</h3>
														</div>
														<div className="p-4">
															<div className="relative aspect-[3/4] w-full bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
																<iframe
																	src={
																		pdfFiles.find((file) =>
																			file.includes('programme')
																		) || event.program_file
																	}
																	className="absolute inset-0 w-full h-full"
																	title="Congress Program"
																/>
															</div>
															<div className="mt-4 flex justify-end">
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() =>
																		window.open(
																			pdfFiles.find((file) =>
																				file.includes('programme')
																			) || event.program_file,
																			'_blank'
																		)
																	}
																>
																	{t('common.openInNewTab', 'Open in new tab')}
																</Button>
															</div>
														</div>
													</div>
												)}
										</div>

										{/* PDF Viewer for all documents */}
										<div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-inner">
											<FlipbookPDFViewer
												pdfUrl={
													pdfFiles.length > 0
														? pdfFiles
														: event.program_file
														? [event.program_file]
														: ['/programs/programme.pdf']
												}
												bookMode={true}
											/>
										</div>
									</div>
								)}

							{/* Abstracts Tab */}
							{activeTab === 'abstracts' && (
								<div>
									<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
										<div className="bg-yellow-100 dark:bg-yellow-800/30 p-2 rounded-lg mr-3">
											<FileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
										</div>
										{t('abstracts.submission.title')}
									</h2>

									<div className="prose dark:prose-invert max-w-none mb-8">
										<p className="text-lg text-gray-700 dark:text-gray-300">
											{t('abstracts.submission.subtitle')}
										</p>

										<div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6">
											<h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
												{t('abstracts.submission.guidelines.title')}
											</h3>
											<ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
												<li>
													{t('abstracts.submission.guidelines.maxLength')}
												</li>
												<li>
													{t(
														'abstracts.submission.guidelines.presentingAuthor'
													)}
												</li>
												<li>
													{t('abstracts.submission.guidelines.maxCoAuthors')}
												</li>
												<li>
													{t('abstracts.submission.guidelines.requiredFields')}
												</li>
												<li>{t('abstracts.submission.guidelines.review')}</li>
											</ul>

											<div className="mt-6 flex items-center bg-white dark:bg-gray-800 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900">
												<Calendar className="h-6 w-6 mr-3 text-yellow-600 dark:text-yellow-400" />
												<div>
													<div className="font-medium text-gray-900 dark:text-white">
														{t('abstracts.submission.guidelines.deadlineTitle')}
													</div>
													<div className="text-gray-600 dark:text-gray-400">
														{t('abstracts.submission.guidelines.deadline', {
															date: event.abstract_submission_deadline
																? new Date(
																		event.abstract_submission_deadline
																  ).toLocaleDateString(undefined, {
																		year: 'numeric',
																		month: 'long',
																		day: 'numeric',
																  })
																: threeMonthsBefore.toLocaleDateString(
																		undefined,
																		{
																			year: 'numeric',
																			month: 'long',
																			day: 'numeric',
																		}
																  ),
														})}
													</div>
												</div>
											</div>
										</div>
									</div>

									<div className="flex justify-center mt-8">
										<Button
											size="lg"
											className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg transition-transform hover:scale-105"
											asChild
										>
											<Link href="/abstracts/new">
												<FileText className="w-5 h-5 mr-2" />
												{t('abstracts.submission.cta')}
											</Link>
										</Button>
									</div>
								</div>
							)}

							{/* Registration Tab */}
							{activeTab === 'registration' && (
								<div>
									<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
										<div className="bg-emerald-100 dark:bg-emerald-800/30 p-2 rounded-lg mr-3">
											<Ticket className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
										</div>
										{t('congress.registration')}
									</h2>

									<div className="prose dark:prose-invert max-w-none mb-8">
										{event.registration_open ? (
											<>
												<p className="text-lg text-gray-700 dark:text-gray-300">
													{t(
														'congress.registrationWelcome',
														'Registration is now open for this prestigious event. Secure your place today to join ophthalmologists from around the world.'
													)}
												</p>

												<div className="mt-6 space-y-6">
													{/* Registration Packages */}
													<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
														<div className="bg-emerald-50 dark:bg-emerald-900/20 p-4">
															<h3 className="text-xl font-semibold text-gray-900 dark:text-white">
																{t('congress.registrationPackages')}
															</h3>
														</div>
														<div className="p-4">
															<div className="overflow-x-auto">
																<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
																	<thead>
																		<tr>
																			<th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
																				{t('congress.package')}
																			</th>
																			<th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
																				{t('congress.earlyBird')}
																			</th>
																			<th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
																				{t('congress.regular')}
																			</th>
																		</tr>
																	</thead>
																	<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
																		<tr>
																			<td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
																				{t('congress.fullRegistration')}
																			</td>
																			<td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
																				€500
																			</td>
																			<td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
																				€650
																			</td>
																		</tr>
																		<tr>
																			<td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
																				{t('congress.memberRegistration')}
																			</td>
																			<td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
																				€350
																			</td>
																			<td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
																				€500
																			</td>
																		</tr>
																		<tr>
																			<td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
																				{t('congress.residentRegistration')}
																			</td>
																			<td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
																				€200
																			</td>
																			<td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
																				€300
																			</td>
																		</tr>
																	</tbody>
																</table>
															</div>
														</div>
													</div>

													{/* Deadlines */}
													<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
														<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
															<div className="bg-blue-50 dark:bg-blue-900/20 p-4">
																<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
																	{t('congress.earlyBirdDeadline')}
																</h3>
															</div>
															<div className="p-4 text-center">
																<div className="text-xl font-medium text-gray-900 dark:text-white mb-1">
																	{event.registration_deadline
																		? new Date(
																				new Date(
																					event.registration_deadline
																				).getTime() -
																					30 * 24 * 60 * 60 * 1000
																		  ).toLocaleDateString(undefined, {
																				year: 'numeric',
																				month: 'long',
																				day: 'numeric',
																		  })
																		: new Date(
																				startDate.getTime() -
																					60 * 24 * 60 * 60 * 1000
																		  ).toLocaleDateString(undefined, {
																				year: 'numeric',
																				month: 'long',
																				day: 'numeric',
																		  })}
																</div>
															</div>
														</div>
														<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
															<div className="bg-red-50 dark:bg-red-900/20 p-4">
																<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
																	{t('congress.registrationDeadline')}
																</h3>
															</div>
															<div className="p-4 text-center">
																<div className="text-xl font-medium text-gray-900 dark:text-white mb-1">
																	{event.registration_deadline
																		? new Date(
																				event.registration_deadline
																		  ).toLocaleDateString(undefined, {
																				year: 'numeric',
																				month: 'long',
																				day: 'numeric',
																		  })
																		: new Date(
																				startDate.getTime() -
																					7 * 24 * 60 * 60 * 1000
																		  ).toLocaleDateString(undefined, {
																				year: 'numeric',
																				month: 'long',
																				day: 'numeric',
																		  })}
																</div>
															</div>
														</div>
													</div>
												</div>
											</>
										) : (
											<p className="text-lg text-gray-700 dark:text-gray-300">
												{t(
													'congress.registrationSoon',
													'Registration will open soon. Stay tuned for updates on when you can secure your place.'
												)}
											</p>
										)}
									</div>

									<div className="flex justify-center mt-8">
										{event.registration_open ? (
											<Button
												size="lg"
												className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-transform hover:scale-105"
												asChild
											>
												<Link href="/dashboard/registration">
													<Ticket className="w-5 h-5 mr-2" />
													{t('congress.registerNow')}
												</Link>
											</Button>
										) : (
											<Button
												size="lg"
												variant="outline"
												className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-transform hover:scale-105"
												asChild
											>
												<Link href="/contact">{t('congress.contactUs')}</Link>
											</Button>
										)}
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
