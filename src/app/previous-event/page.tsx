'use client';

import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import FlipbookPDFViewer from '@/components/ui/pdfViewer';
import { getPreviousCongress } from '@/lib/api';
import { getCongressFolderPath } from '@/lib/utils';
import { Congress } from '@/types/database';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Calendar, Globe, MapPin, Youtube } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import path from 'path';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function PreviousEventPage() {
	const { t } = useTranslation();
	const router = useRouter();

	// State declarations
	const [event, setEvent] = useState<Congress | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [eventImages, setEventImages] = useState<string[]>([]);
	const [eventVideos, setEventVideos] = useState<string[]>([]);
	const [pdfFiles, setPdfFiles] = useState<string[]>([]);
	const [activities, setActivities] = useState<any[]>([]);
	const [hasAccess, setHasAccess] = useState(false);

	// Hero slideshow state
	const [currentHeroImage, setCurrentHeroImage] = useState(0);
	const heroSlideInterval = useRef<NodeJS.Timeout | null>(null);

	// Helper: Format date range
	const formatDateRange = (start: string, end: string) => {
		const s = new Date(start);
		const e = new Date(end);
		const { i18n } = useTranslation();
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

	// Fetch event and media data
	useEffect(() => {
		async function fetchData() {
			try {
				const data = await getPreviousCongress();
				if (!data) {
					console.warn('No previous event found');
					setError(t('congress.eventNotFound', 'Event not found'));
					setIsLoading(false);
					return;
				} else {
					setEvent(data);
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

						// Fetch videos
						try {
							const videosPath = `${folderPath}/videos`;
							const res = await fetch(
								`/api/getDirectoryContents?path=${encodeURIComponent(
									videosPath.slice(1)
								)}`,
								{ cache: 'no-store' }
							);
							if (res.ok) {
								const vids: string[] = await res.json();
								const filtered = vids.filter((file) =>
									['.mp4', '.webm', '.mov'].some((ext) =>
										file.toLowerCase().endsWith(ext)
									)
								);
								setEventVideos(filtered.map((file) => `${videosPath}/${file}`));
							} else {
								setEventVideos(data.webinars || []);
							}
						} catch (err) {
							console.error(err);
							setEventVideos(data.webinars || []);
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

	// Check user access
	useEffect(() => {
		async function checkAccess() {
			if (!event) return;
			try {
				const res = await fetch(`/api/checkUserAccess?eventId=${event.id}`, {
					cache: 'no-store',
				});
				if (res.ok) {
					const data = await res.json();
					setHasAccess(data.hasAccess);
				}
			} catch (err) {
				console.error(err);
			}
		}
		checkAccess();
	}, [event]);

	// Fetch activities if user has access
	useEffect(() => {
		async function fetchActivities() {
			if (!event) return;
			try {
				const res = await fetch(`/api/getEventActivities?eventId=${event.id}`, {
					cache: 'no-store',
				});
				if (res.ok) {
					const data = await res.json();
					setActivities(data);
				}
			} catch (err) {
				console.error(err);
			}
		}
		if (event && hasAccess) {
			fetchActivities();
		}
	}, [event, hasAccess]);

	// Hero image slideshow
	useEffect(() => {
		if (eventImages.length > 0) {
			heroSlideInterval.current = setInterval(() => {
				setCurrentHeroImage((prev) => (prev + 1) % eventImages.length);
			}, 10000);
		}
		return () => {
			if (heroSlideInterval.current) clearInterval(heroSlideInterval.current);
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
			<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
				<h1 className="text-4xl text-red-500">{t('common.error')}</h1>
				<p className="mt-4 text-lg text-gray-600">
					{error || t('congress.eventNotFound', 'Event not found')}
				</p>
				<Button
					variant="outline"
					onClick={() => router.back()}
					className="mt-6"
				>
					<ArrowLeft className="h-5 w-5 mr-2" /> {t('common.goBack')}
				</Button>
			</div>
		);
	}

	const formattedDate = formatDateRange(event.start_date, event.end_date);

	return (
		<div className="bg-white dark:bg-gray-800 pb-12">
			{/* Hero Section */}
			<section className="relative w-full min-h-[70vh] flex items-center justify-center">
				<AnimatePresence initial={false}>
					{eventImages.length > 0 ? (
						<motion.div
							key={currentHeroImage}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 1 }}
							className="absolute inset-0"
						>
							<Image
								src={eventImages[currentHeroImage]}
								alt={event.title}
								fill
								className="object-cover brightness-50"
							/>
						</motion.div>
					) : (
						<div className="absolute inset-0 bg-gray-900" />
					)}
				</AnimatePresence>
				<div className="relative z-10 text-center px-4">
					<h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg">
						{event.title}
					</h1>
					<p className="mt-4 text-xl md:text-2xl text-gray-200">
						{formattedDate}
					</p>
					<div className="mt-6 inline-flex items-center space-x-4">
						<div className="flex items-center text-gray-100">
							<Calendar className="w-6 h-6 mr-2" />
							<span>{formattedDate}</span>
						</div>
						<div className="flex items-center text-gray-100">
							<MapPin className="w-6 h-6 mr-2" />
							<span>
								{typeof event.location === 'string'
									? event.location
									: event.location?.name}
							</span>
						</div>
					</div>
					<div className="absolute top-6 left-6">
						<Button
							variant="outline"
							onClick={() => router.back()}
							className="text-white border-white"
						>
							<ArrowLeft className="h-5 w-5 mr-2" /> {t('common.goBack')}
						</Button>
					</div>
				</div>
			</section>

			{/* Event Details Section */}
			<section className="max-w-5xl mx-auto px-4 mt-[-40px]">
				<div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg p-8 grid md:grid-cols-2 gap-8">
					<div>
						<h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
							{t('congress.aboutEvent', 'About the Event')}
						</h2>
						<p className="text-gray-700 dark:text-gray-300">
							{event.description}
						</p>
						<div className="mt-4 space-y-3">
							<div className="flex items-center text-gray-600 dark:text-gray-300">
								<Calendar className="w-6 h-6 mr-3" />
								<span>{formattedDate}</span>
							</div>
							<div className="flex items-center text-gray-600 dark:text-gray-300">
								<MapPin className="w-6 h-6 mr-3" />
								<span>
									{typeof event.location === 'string'
										? event.location
										: event.location?.name}
								</span>
							</div>
							<div className="flex items-center text-gray-600 dark:text-gray-300">
								<Globe className="w-6 h-6 mr-3" />
								<span>{t(`eventTypes.${event.congress_type}`)}</span>
							</div>
						</div>
					</div>
					<div className="flex items-center justify-center">
						{eventImages.length > 0 && (
							<Image
								src={eventImages[currentHeroImage]}
								alt={event.title}
								width={500}
								height={500}
								className="rounded-xl object-cover"
							/>
						)}
					</div>
				</div>
			</section>

			{/* Videos Section */}
			{eventVideos.length > 0 && (
				<section className="max-w-5xl mx-auto px-4 mt-12">
					<h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
						{t('congress.eventVideos', 'Event Videos')}
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{eventVideos.map((video, index) => (
							<div
								key={index}
								className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 flex flex-col"
							>
								<p className="text-gray-800 dark:text-gray-200 mb-4">
									{path.basename(video)}
								</p>
								<Button
									variant="outline"
									onClick={() => window.open(video, '_blank')}
								>
									<Youtube className="w-5 h-5 mr-2" />{' '}
									{t('archives.watchWebinar', 'Watch Video')}
								</Button>
							</div>
						))}
					</div>
				</section>
			)}

			{/* Program Section */}
			{(pdfFiles.length > 0 || event.program_file) && (
				<section className="max-w-5xl mx-auto px-4 mt-12">
					<h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
						{t('congress.programme', 'Event Program')}
					</h2>
					<div className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden">
						<FlipbookPDFViewer
							pdfUrl={
								pdfFiles.length > 0
									? pdfFiles
									: event.program_file
									? [event.program_file]
									: ['/programs/programme.pdf']
							}
							bookMode={pdfFiles.length > 1}
						/>
					</div>
				</section>
			)}

			{/* Activities Section */}
			{hasAccess && activities.length > 0 && (
				<section className="max-w-5xl mx-auto px-4 mt-12">
					<h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
						{t('navigation.activities', 'Activities')}
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{activities.map((activity, index) => (
							<div
								key={index}
								className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow"
							>
								<h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
									{activity.title}
								</h3>
								<p className="text-gray-700 dark:text-gray-300 mb-4">
									{activity.description}
								</p>
								<Button
									variant="outline"
									size="sm"
									onClick={() => router.push(`/activities/${activity.id}`)}
								>
									{t('common.activities.viewDetails', 'View Activity')}
								</Button>
							</div>
						))}
					</div>
				</section>
			)}

			{/* Footer */}
			<footer className="mt-12 py-6 text-center text-gray-600 dark:text-gray-300">
				<p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
			</footer>
		</div>
	);
}
