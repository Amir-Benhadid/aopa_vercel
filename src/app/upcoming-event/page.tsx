'use client';

import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import FlipbookPDFViewer from '@/components/ui/pdfViewer';
import { getUpcomingCongress } from '@/lib/api';
import { formatDate, getCongressFolderPath } from '@/lib/utils';
import { Congress } from '@/types/database';
import { AnimatePresence, motion } from 'framer-motion';
import {
	ArrowLeft,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Clock,
	FileText,
	Globe,
	MapPin,
	Share2,
	Ticket,
	Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function UpcomingEventPage() {
	const { t } = useTranslation();
	const router = useRouter();
	const [congress, setCongress] = useState<Congress | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [congressImages, setCongressImages] = useState<string[]>([]);
	const [hasAffiche, setHasAffiche] = useState(false);
	const [hasProgramme, setHasProgramme] = useState(false);
	const [pdfFiles, setPdfFiles] = useState<string[]>([]);
	const [heroImages, setHeroImages] = useState<string[]>([]);
	const [currentHeroImage, setCurrentHeroImage] = useState(0);
	const [activeSection, setActiveSection] = useState('overview');
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
			try {
				const congressData = await getUpcomingCongress();

				if (!congressData) {
					setError('No upcoming congress found');
				} else {
					setCongress(congressData);

					// Try to find the congress folder and load images
					const folderPath = getCongressFolderPath(congressData);
					if (folderPath) {
						// Check if photos folder exists and load images
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
						} catch (err) {
							console.error('Error loading congress images:', err);
							// Fallback to default images if needed
							setCongressImages(congressData.images || []);
						}

						// Check for PDF files (affiche, programme)
						try {
							const pdfFilesResponse = await fetch(
								`/api/getDirectoryContents?path=${encodeURIComponent(
									folderPath.slice(1)
								)}`,
								{
									cache: 'no-store',
								}
							);

							if (pdfFilesResponse.ok) {
								const files = await pdfFilesResponse.json();
								const pdfs = files.filter((file: string) =>
									file.toLowerCase().endsWith('.pdf')
								);

								// Check for specific files
								const hasAffiche = pdfs.some((file: string) =>
									file.toLowerCase().includes('affiche')
								);
								const hasProgramme = pdfs.some((file: string) =>
									file.toLowerCase().includes('programme')
								);

								setHasAffiche(hasAffiche);
								setHasProgramme(hasProgramme);

								// Create full paths for PDFs
								const pdfPaths = pdfs.map(
									(file: string) => `${folderPath}/${file}`
								);
								setPdfFiles(pdfPaths);
							}
						} catch (err) {
							console.error('Error loading PDF files:', err);
						}
					}
				}
			} catch (err) {
				console.error('Error fetching upcoming congress:', err);
				setError('Failed to load congress data');
			} finally {
				setIsLoading(false);
			}
		}

		fetchCongress();

		// Cleanup on unmount
		return () => {
			if (slideInterval.current) {
				clearInterval(slideInterval.current);
			}
		};
	}, []);

	const nextImage = () => {
		if (congressImages.length > 1) {
			setCurrentImageIndex((prev) => (prev + 1) % congressImages.length);
		}
	};

	const previousImage = () => {
		if (congressImages.length > 1) {
			setCurrentImageIndex(
				(prev) => (prev - 1 + congressImages.length) % congressImages.length
			);
		}
	};

	const startAutoAdvance = () => {
		if (slideInterval.current) {
			clearInterval(slideInterval.current);
		}

		slideInterval.current = setInterval(() => {
			nextImage();
		}, 5000);
	};

	useEffect(() => {
		if (congressImages.length > 1) {
			startAutoAdvance();
		}

		return () => {
			if (slideInterval.current) {
				clearInterval(slideInterval.current);
			}
		};
	}, [congressImages]);

	if (isLoading) {
		return (
			<LoadingSpinner
				message={t('congress.loading', 'Loading event details...')}
				background="gradient"
				fullScreen={true}
			/>
		);
	}

	if (error || !congress) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen pt-20 bg-gradient-to-br from-indigo-50 to-blue-50">
				<div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
					<div className="text-2xl font-semibold mb-4 text-red-600 text-center">
						{t('common.error')}
					</div>
					<div className="text-gray-600 mb-6 text-center">
						{error || 'Congress not found'}
					</div>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							onClick={() => router.back()}
							variant="outline"
							className="flex items-center justify-center"
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							{t('common.goBack')}
						</Button>
						<Link href="/" passHref>
							<Button className="w-full sm:w-auto">
								{t('common.returnHome')}
							</Button>
						</Link>
					</div>
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

	// Calculate days until the actual congress start date
	const daysUntil = Math.ceil(
		(startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
	);
	const isUpcoming = daysUntil > 0;
	const isPast = today > endDate;
	const isActive = congress.state === 2;

	// Find affiche and programme files
	const afficheFile = pdfFiles.find((file) =>
		file.toLowerCase().includes('affiche')
	);
	const programmeFile = pdfFiles.find((file) =>
		file.toLowerCase().includes('programme')
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
			{/* Hero Banner */}
			<div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
				<AnimatePresence initial={false}>
					<motion.div
						key={currentHeroImage}
						className="absolute inset-0 z-0"
						initial={{ opacity: 0, scale: 1.05 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 1.2 }}
					>
						{heroImages.length > 0 ? (
							<Image
								src={heroImages[currentHeroImage]}
								alt={`${congress.title} - Image ${currentHeroImage + 1}`}
								fill
								className="object-cover"
								priority
							/>
						) : (
							<div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-indigo-900" />
						)}
						<div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
					</motion.div>
				</AnimatePresence>

				{/* Hero Content */}
				<div className="absolute inset-0 flex flex-col justify-end z-10">
					<div className="container mx-auto px-4 pb-16 md:pb-24">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2, duration: 0.8 }}
							className="max-w-4xl"
						>
							<div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
								<span className="text-sm sm:text-base font-medium text-white">
									{isUpcoming
										? t('congress.upcomingEvent')
										: isActive
										? t('congress.ongoingEvent')
										: t('congress.pastEvent')}
								</span>
							</div>

							<h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-sm">
								{congress.title}
							</h1>

							<div className="flex flex-wrap items-center gap-6 text-white/90 mb-8">
								<div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
									<Calendar className="w-5 h-5 mr-2 text-primary-300" />
									<span>{formattedDateRange}</span>
								</div>
								<div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
									<MapPin className="w-5 h-5 mr-2 text-primary-300" />
									<span>
										{typeof congress.location === 'string'
											? congress.location
											: congress.location.name}
									</span>
								</div>
								<div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
									<Globe className="w-5 h-5 mr-2 text-primary-300" />
									<span>{t(`congressTypes.${congress.congress_type}`)}</span>
								</div>
							</div>

							{isUpcoming && congress.registration && (
								<div className="flex flex-wrap gap-4">
									<Button
										size="lg"
										asChild
										className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
									>
										<Link href="/congress/register">
											<Ticket className="w-5 h-5 mr-2" />
											{t('congress.registerNow')}
										</Link>
									</Button>
									{programmeFile && (
										<Button
											variant="outline"
											size="lg"
											asChild
											className="bg-white/10 hover:bg-white/20 text-white border-white/30 px-8 py-3 rounded-full backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
										>
											<a
												href={programmeFile}
												target="_blank"
												rel="noopener noreferrer"
											>
												<FileText className="w-5 h-5 mr-2" />
												{t('congress.viewProgram')}
											</a>
										</Button>
									)}
								</div>
							)}

							{isUpcoming && !congress.registration && (
								<div className="flex flex-wrap gap-4">
									<Button
										size="lg"
										variant="outline"
										className="bg-white/10 hover:bg-white/20 text-white border-white/30 px-8 py-3 rounded-full backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
									>
										<Users className="w-5 h-5 mr-2" />
										{t('congress.registrationClosed')}
									</Button>
									{programmeFile && (
										<Button
											variant="outline"
											size="lg"
											asChild
											className="bg-white/10 hover:bg-white/20 text-white border-white/30 px-8 py-3 rounded-full backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
										>
											<a
												href={programmeFile}
												target="_blank"
												rel="noopener noreferrer"
											>
												<FileText className="w-5 h-5 mr-2" />
												{t('congress.viewProgram')}
											</a>
										</Button>
									)}
								</div>
							)}
						</motion.div>
					</div>
				</div>
			</div>

			{/* Countdown Bar */}
			{isUpcoming && (
				<div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4">
					<div className="container mx-auto px-4">
						<div className="flex flex-col md:flex-row items-center justify-between">
							<div className="flex items-center mb-4 md:mb-0">
								<Clock className="w-6 h-6 mr-3 animate-pulse" />
								<div>
									<span className="text-primary-100">
										{t('congress.startsIn')}
									</span>
									<span className="ml-2 text-2xl font-bold">
										{daysUntil} {t('congress.days')}
									</span>
								</div>
							</div>
							{congress.registration ? (
								<Button
									asChild
									className="bg-white text-primary-700 hover:bg-primary-50 px-6 shadow-md"
								>
									<Link href="/congress/register">
										{t('congress.registerNow')}
									</Link>
								</Button>
							) : (
								<div className="text-primary-100 text-sm md:text-base">
									{t('congress.registrationClosedInfo')}
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Quick Navigation Tabs */}
			<div className="sticky top-0 z-30 bg-white shadow-md">
				<div className="container mx-auto px-4">
					<div className="flex overflow-x-auto no-scrollbar">
						<button
							onClick={() => setActiveSection('overview')}
							className={`px-6 py-4 font-medium transition-colors ${
								activeSection === 'overview'
									? 'text-primary-600 border-b-2 border-primary-600'
									: 'text-gray-600 hover:text-primary-600'
							}`}
						>
							{t('congress.overview')}
						</button>
						<button
							onClick={() => setActiveSection('schedule')}
							className={`px-6 py-4 font-medium transition-colors ${
								activeSection === 'schedule'
									? 'text-primary-600 border-b-2 border-primary-600'
									: 'text-gray-600 hover:text-primary-600'
							}`}
						>
							{t('congress.schedule')}
						</button>
						<button
							onClick={() => setActiveSection('speakers')}
							className={`px-6 py-4 font-medium transition-colors ${
								activeSection === 'speakers'
									? 'text-primary-600 border-b-2 border-primary-600'
									: 'text-gray-600 hover:text-primary-600'
							}`}
						>
							{t('congress.speakers')}
						</button>
						<button
							onClick={() => setActiveSection('venue')}
							className={`px-6 py-4 font-medium transition-colors ${
								activeSection === 'venue'
									? 'text-primary-600 border-b-2 border-primary-600'
									: 'text-gray-600 hover:text-primary-600'
							}`}
						>
							{t('congress.venue')}
						</button>
						{programmeFile && (
							<button
								onClick={() => setActiveSection('programme')}
								className={`px-6 py-4 font-medium transition-colors ${
									activeSection === 'programme'
										? 'text-primary-600 border-b-2 border-primary-600'
										: 'text-gray-600 hover:text-primary-600'
								}`}
							>
								{t('congress.programme')}
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-12">
				{/* Dynamic Section Content */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Main Content Column */}
					<div className="lg:col-span-8">
						{activeSection === 'overview' && (
							<div className="space-y-8">
								{/* About Section */}
								<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
									<div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
										<h2 className="text-2xl font-bold text-white">
											{t('congress.aboutEvent')}
										</h2>
									</div>
									<div className="p-6">
										<div className="prose max-w-none">
											<p className="text-gray-700 whitespace-pre-line text-lg leading-relaxed">
												{congress?.description}
											</p>
										</div>
									</div>
								</div>

								{/* Key Highlights */}
								<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
									<div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
										<h2 className="text-2xl font-bold text-white">
											{t('congress.keyHighlights')}
										</h2>
									</div>
									<div className="p-6">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											{/* Add your key highlights here */}
											<div className="flex items-start space-x-4">
												<div className="bg-primary-100 p-3 rounded-lg">
													<Users className="w-6 h-6 text-primary-600" />
												</div>
												<div>
													<h3 className="font-semibold text-gray-900">
														{t('congress.networkingOpportunities')}
													</h3>
													<p className="text-gray-600 mt-1">
														{t('congress.networkingDescription')}
													</p>
												</div>
											</div>
											{/* Add more highlights */}
										</div>
									</div>
								</div>

								{/* Photo Gallery */}
								{congressImages.length > 0 && (
									<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
										<div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
											<h2 className="text-2xl font-bold text-white">
												{t('congress.gallery')}
											</h2>
										</div>
										<div className="p-6">
											<div className="relative overflow-hidden rounded-xl aspect-video">
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
															src={congressImages[currentImageIndex]}
															alt={`${congress.title} - Image ${
																currentImageIndex + 1
															}`}
															fill
															className="object-cover"
														/>
													</motion.div>
												</AnimatePresence>

												{congressImages.length > 1 && (
													<>
														<button
															onClick={previousImage}
															className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors z-10 backdrop-blur-sm"
															aria-label="Previous image"
														>
															<ChevronLeft className="w-6 h-6" />
														</button>
														<button
															onClick={nextImage}
															className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors z-10 backdrop-blur-sm"
															aria-label="Next image"
														>
															<ChevronRight className="w-6 h-6" />
														</button>
													</>
												)}
											</div>
											<div className="flex justify-center mt-6">
												<div className="flex space-x-3">
													{congressImages.map((_, index) => (
														<button
															key={index}
															onClick={() => setCurrentImageIndex(index)}
															className={`w-3 h-3 rounded-full transition-all duration-300 ${
																index === currentImageIndex
																	? 'bg-primary-600 scale-125'
																	: 'bg-gray-300 hover:bg-gray-400'
															}`}
															aria-label={`Go to image ${index + 1}`}
														/>
													))}
												</div>
											</div>
										</div>
									</div>
								)}
							</div>
						)}

						{activeSection === 'schedule' && (
							<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
								<div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
									<h2 className="text-2xl font-bold text-white">
										{t('congress.schedule')}
									</h2>
								</div>
								<div className="p-6">
									{/* Add your schedule content here */}
									<div className="space-y-6">
										{/* Example schedule item */}
										<div className="border-l-4 border-primary-600 pl-4">
											<div className="flex items-center text-sm text-primary-600 mb-1">
												<Clock className="w-4 h-4 mr-2" />
												<span>09:00 - 10:30</span>
											</div>
											<h3 className="font-semibold text-gray-900">
												{t('congress.scheduleItem1Title')}
											</h3>
											<p className="text-gray-600 mt-1">
												{t('congress.scheduleItem1Description')}
											</p>
										</div>
										{/* Add more schedule items */}
									</div>
								</div>
							</div>
						)}

						{activeSection === 'speakers' && (
							<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
								<div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
									<h2 className="text-2xl font-bold text-white">
										{t('congress.speakers')}
									</h2>
								</div>
								<div className="p-6">
									{/* Add your speakers content here */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{/* Example speaker card */}
										<div className="flex items-start space-x-4">
											<div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
												{/* Add speaker image */}
											</div>
											<div>
												<h3 className="font-semibold text-gray-900">
													{t('congress.speakerName')}
												</h3>
												<p className="text-primary-600">
													{t('congress.speakerTitle')}
												</p>
												<p className="text-gray-600 mt-2">
													{t('congress.speakerBio')}
												</p>
											</div>
										</div>
										{/* Add more speaker cards */}
									</div>
								</div>
							</div>
						)}

						{activeSection === 'venue' && (
							<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
								<div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
									<h2 className="text-2xl font-bold text-white">
										{t('congress.venue')}
									</h2>
								</div>
								<div className="p-6">
									{/* Add your venue content here */}
									<div className="space-y-6">
										<div className="aspect-video rounded-xl overflow-hidden">
											{/* Add venue map or image */}
										</div>
										<div>
											<h3 className="font-semibold text-gray-900 mb-2">
												{t('congress.venueLocation')}
											</h3>
											<p className="text-gray-600">
												{typeof congress?.location === 'string'
													? congress.location
													: congress.location.name}
											</p>
										</div>
										<div>
											<h3 className="font-semibold text-gray-900 mb-2">
												{t('congress.venueAccessibility')}
											</h3>
											<ul className="space-y-2 text-gray-600">
												{/* Add accessibility information */}
											</ul>
										</div>
									</div>
								</div>
							</div>
						)}

						{activeSection === 'programme' && programmeFile && (
							<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
								<div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
									<h2 className="text-2xl font-bold text-white">
										{t('congress.programme')}
									</h2>
								</div>
								<div className="p-6">
									<div className="aspect-[3/4] relative mb-4 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
										<FlipbookPDFViewer pdfUrl={programmeFile} />
									</div>
									<Button
										variant="outline"
										className="w-full flex items-center justify-center mt-4 border-primary-200 text-primary-700 hover:bg-primary-50"
										asChild
									>
										<a
											href={programmeFile}
											target="_blank"
											rel="noopener noreferrer"
											download
										>
											<FileText className="w-5 h-5 mr-2" />
											{t('common.download')}
										</a>
									</Button>
								</div>
							</div>
						)}
					</div>

					{/* Sidebar - Important information and CTAs */}
					<div className="lg:col-span-4 space-y-8">
						{/* Event Details Card */}
						<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
							<div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
								<h2 className="text-2xl font-bold text-white">
									{t('congress.eventDetails')}
								</h2>
							</div>
							<div className="p-6">
								<ul className="space-y-6">
									<li className="flex items-start">
										<div className="bg-primary-50 p-3 rounded-full mr-4">
											<Calendar className="w-6 h-6 text-primary-600" />
										</div>
										<div>
											<div className="font-medium text-gray-900">
												{t('congress.date')}
											</div>
											<div className="text-gray-600 mt-1">
												{formattedDateRange}
											</div>
										</div>
									</li>
									<li className="flex items-start">
										<div className="bg-primary-50 p-3 rounded-full mr-4">
											<MapPin className="w-6 h-6 text-primary-600" />
										</div>
										<div>
											<div className="font-medium text-gray-900">
												{t('congress.location')}
											</div>
											<div className="text-gray-600 mt-1">
												{typeof congress.location === 'string'
													? congress.location
													: congress.location.name}
											</div>
										</div>
									</li>
									<li className="flex items-start">
										<div className="bg-primary-50 p-3 rounded-full mr-4">
											<Globe className="w-6 h-6 text-primary-600" />
										</div>
										<div>
											<div className="font-medium text-gray-900">
												{t('congress.type')}
											</div>
											<div className="text-gray-600 mt-1">
												{t(`congressTypes.${congress.congress_type}`)}
												{congress.congress_type === 'hybrid' && (
													<span className="text-sm block text-gray-500 mt-1">
														{t('congress.hybridNote')}
													</span>
												)}
											</div>
										</div>
									</li>
									{congress.abstract_submission_deadline && (
										<li className="flex items-start">
											<div className="bg-primary-50 p-3 rounded-full mr-4">
												<FileText className="w-6 h-6 text-primary-600" />
											</div>
											<div>
												<div className="font-medium text-gray-900">
													{t('congress.abstractDeadline')}
												</div>
												<div className="text-gray-600 mt-1">
													{formatDate(congress.abstract_submission_deadline)}
												</div>
											</div>
										</li>
									)}
								</ul>
							</div>
						</div>

						{/* Registration or Alternative Options */}
						{isUpcoming && (
							<>
								{congress?.registration ? (
									<div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-xl overflow-hidden">
										<div className="p-6 text-white">
											<h3 className="text-2xl font-bold mb-3">
												{t('congress.joinUs')}
											</h3>
											<p className="text-primary-100 mb-6 leading-relaxed">
												{t('congress.registrationCTA')}
											</p>
											<Button
												className="w-full bg-white text-primary-700 hover:bg-primary-50 shadow-lg"
												size="lg"
												asChild
											>
												<Link href="/congress/register">
													<Ticket className="w-5 h-5 mr-2" />
													{t('congress.registerNow')}
												</Link>
											</Button>
										</div>
									</div>
								) : (
									<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
										<div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
											<h2 className="text-2xl font-bold text-white">
												{t('congress.alternativeOptions')}
											</h2>
										</div>
										<div className="p-6">
											<div className="space-y-4">
												{/* Virtual Attendance Option */}
												<div className="border border-primary-100 rounded-lg p-4 hover:bg-primary-50 transition-colors">
													<h3 className="font-semibold text-primary-700 mb-2">
														{t('congress.virtualAttendance')}
													</h3>
													<p className="text-gray-600 mb-3">
														{t('congress.virtualAttendanceInfo')}
													</p>
													<Button
														variant="outline"
														size="sm"
														className="w-full"
														asChild
													>
														<Link href="/congress/virtual-attendance">
															{t('congress.learnMore')}
														</Link>
													</Button>
												</div>

												{/* Waitlist Option */}
												<div className="border border-amber-100 rounded-lg p-4 hover:bg-amber-50 transition-colors">
													<h3 className="font-semibold text-amber-700 mb-2">
														{t('congress.joinWaitlist')}
													</h3>
													<p className="text-gray-600 mb-3">
														{t('congress.waitlistInfo')}
													</p>
													<Button
														variant="outline"
														size="sm"
														className="w-full border-amber-200 text-amber-700"
														asChild
													>
														<Link href="/congress/waitlist">
															{t('congress.joinWaitlistButton')}
														</Link>
													</Button>
												</div>

												{/* Future Events */}
												<div className="border border-indigo-100 rounded-lg p-4 hover:bg-indigo-50 transition-colors">
													<h3 className="font-semibold text-indigo-700 mb-2">
														{t('congress.upcomingEvents')}
													</h3>
													<p className="text-gray-600 mb-3">
														{t('congress.upcomingEventsInfo')}
													</p>
													<Button
														variant="outline"
														size="sm"
														className="w-full border-indigo-200 text-indigo-700"
														asChild
													>
														<Link href="/archives/events">
															{t('congress.viewEvents')}
														</Link>
													</Button>
												</div>
											</div>
										</div>
									</div>
								)}
							</>
						)}

						{/* Quick Links */}
						<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
							<div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
								<h2 className="text-2xl font-bold text-white">
									{t('congress.quickLinks')}
								</h2>
							</div>
							<div className="p-6">
								<div className="space-y-3">
									{programmeFile && (
										<Button
											variant="outline"
											className="w-full justify-start"
											asChild
										>
											<a
												href={programmeFile}
												target="_blank"
												rel="noopener noreferrer"
											>
												<FileText className="w-5 h-5 mr-2" />
												{t('congress.downloadProgramme')}
											</a>
										</Button>
									)}
									{afficheFile && (
										<Button
											variant="outline"
											className="w-full justify-start"
											asChild
										>
											<a
												href={afficheFile}
												target="_blank"
												rel="noopener noreferrer"
											>
												<FileText className="w-5 h-5 mr-2" />
												{t('congress.downloadAffiche')}
											</a>
										</Button>
									)}
									<Button
										variant="outline"
										className="w-full justify-start"
										onClick={() => {
											if (navigator.share) {
												navigator.share({
													title: congress?.title,
													text: congress?.description,
													url: window.location.href,
												});
											} else {
												navigator.clipboard.writeText(window.location.href);
												alert('Link copied to clipboard!');
											}
										}}
									>
										<Share2 className="w-5 h-5 mr-2" />
										{t('congress.shareEvent')}
									</Button>
								</div>
							</div>
						</div>

						{/* Contact Support */}
						<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
							<div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
								<h2 className="text-2xl font-bold text-white">
									{t('congress.needHelp')}
								</h2>
							</div>
							<div className="p-6">
								<p className="text-gray-600 mb-4">
									{t('congress.contactSupport')}
								</p>
								<Button variant="outline" className="w-full" asChild>
									<Link href="/contact">{t('congress.contactUs')}</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
