'use client';

import { Button } from '@/components/ui/Button';
import { formatDate, getCongressFolderPath } from '@/lib/utils';
import { Building, Congress } from '@/types/database';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PreviousEventsProps {
	events: Congress[];
}

export function PreviousEvents({ events }: PreviousEventsProps) {
	const { t } = useTranslation();
	const sectionRef = useRef<HTMLElement>(null);
	const [eventImages, setEventImages] = useState<Record<string, string[]>>({});
	const [currentImageIndices, setCurrentImageIndices] = useState<
		Record<string, number>
	>({});
	const slideIntervals = useRef<Record<string, NodeJS.Timeout>>({});
	const [isLoading, setIsLoading] = useState(true);

	// Helper function to safely get location name
	const getLocationName = (location: string | Building): string => {
		if (typeof location === 'string') {
			return location;
		}
		return location.name || '';
	};

	// Load images for an event from its folder
	const loadEventImages = async (event: Congress) => {
		console.log('this is the event', event);
		if (!event.start_date || !event.title || !event.location) {
			return [event.image || '/images/congress-default.jpg'];
		}

		// If congress.images is a number, it indicates how many numbered images exist
		if (typeof event.images === 'number' && event.images > 0) {
			const folderPath = getCongressFolderPath(event);

			if (!folderPath) {
				return [event.image || '/images/congress-default.jpg'];
			}

			// Ensure folderPath starts with a '/'
			const validFolderPath = folderPath.startsWith('/')
				? folderPath
				: '/' + folderPath;
			console.log('valid folder path:', validFolderPath);

			// Generate paths for all numbered images
			const images = [];
			for (let i = 1; i <= event.images; i++) {
				images.push(`${validFolderPath}/photos/${i}.jpg`);
			}

			return images;
		}

		// For backward compatibility - if congress.images is an array
		if (Array.isArray(event.images) && event.images.length > 0) {
			return event.images;
		}

		// Try to get the folder path for older approach
		const folderPath = getCongressFolderPath(event);
		console.log('folderPath', folderPath);

		if (!folderPath) return [event.image || '/images/congress-default.jpg'];

		// Fallback to default image
		return [event.image || '/images/congress-default.jpg'];
	};

	// Initialize current image indices and load images
	useEffect(() => {
		const initialImageIndices: Record<string, number> = {};
		events.forEach((event) => {
			initialImageIndices[event.id] = 0;
		});
		setCurrentImageIndices(initialImageIndices);

		// Load images for each event
		async function loadAllEventImages() {
			const imagesMap: Record<string, string[]> = {};

			// Load images for each event in parallel
			const imagePromises = events.map(async (event) => {
				console.log('loading images for event', event.id);
				const images = await loadEventImages(event);
				return { id: event.id, images };
			});

			const results = await Promise.all(imagePromises);

			// Populate the images map
			results.forEach((result) => {
				imagesMap[result.id] = result.images;
			});

			setEventImages(imagesMap);
		}

		loadAllEventImages();

		// Cleanup on unmount
		return () => {
			Object.values(slideIntervals.current).forEach((interval) => {
				clearInterval(interval);
			});
		};
	}, [events]);

	// Setup image rotation for all events with multiple images
	useEffect(() => {
		// Clear all existing intervals first
		Object.values(slideIntervals.current).forEach((interval) => {
			clearInterval(interval);
		});

		// Setup new intervals for each event with multiple images
		Object.entries(eventImages).forEach(([eventId, images]) => {
			if (images.length > 1) {
				slideIntervals.current[eventId] = setInterval(() => {
					setCurrentImageIndices((prev) => ({
						...prev,
						[eventId]: (prev[eventId] + 1) % images.length,
					}));
				}, 10000);
			}
		});

		return () => {
			Object.values(slideIntervals.current).forEach((interval) => {
				clearInterval(interval);
			});
		};
	}, [eventImages]);

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.05,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				type: 'spring',
				stiffness: 100,
				damping: 15,
				duration: 0.3,
			},
		},
	};

	return (
		<section ref={sectionRef} className="relative overflow-hidden">
			<div className="container mx-auto px-0">
				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: '-100px' }}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					{events.map((event) => (
						<motion.div
							key={event.id}
							variants={itemVariants}
							className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 h-full flex flex-col border border-gray-100 dark:border-gray-700 hover:translate-y-[-4px]"
						>
							<div className="relative h-48 overflow-hidden">
								<AnimatePresence initial={false} mode="wait">
									<motion.div
										key={
											eventImages[event.id] ? currentImageIndices[event.id] : 0
										}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 1.5, ease: 'easeInOut' }}
										className="absolute inset-0"
									>
										<Image
											src={
												eventImages[event.id] &&
												eventImages[event.id].length > 0
													? eventImages[event.id][currentImageIndices[event.id]]
													: event.image || '/images/congress-default.jpg'
											}
											alt={event.title || ''}
											fill
											className="object-cover transition-transform duration-700 hover:scale-105"
										/>
									</motion.div>
								</AnimatePresence>
								<div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
								<div className="absolute bottom-0 left-0 right-0 p-4">
									<h3 className="text-xl font-bold text-white">
										{event.title || ''}
									</h3>
								</div>
							</div>
							<div className="p-5 flex-1 flex flex-col">
								<div className="flex items-center mb-2 text-gray-600 dark:text-gray-300">
									<MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-primary-600 dark:text-primary-400" />
									<span className="text-sm">
										{getLocationName(event.location)}
									</span>
								</div>
								<div className="flex items-center mb-4 text-gray-600 dark:text-gray-300">
									<Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-primary-600 dark:text-primary-400" />
									<span className="text-sm">
										{formatDate(event.start_date)}
									</span>
								</div>
								<p className="text-sm mb-6 text-gray-600 dark:text-gray-400 line-clamp-3 flex-1">
									{event.description || ''}
								</p>
								<Link href={`/archives/events/${event.id}`} passHref>
									<Button
										variant="outline"
										className="w-full border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20 transition-colors"
									>
										{t('home.previousEvents.viewDetails')}
										<ArrowRight className="w-4 h-4 ml-2" />
									</Button>
								</Link>
							</div>
						</motion.div>
					))}
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="mt-10 text-center"
				>
					<Link href="/archives/events" passHref>
						<Button
							variant="outline"
							className="border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20 transition-colors group"
						>
							{t('home.previousEvents.viewAllEvents')}
							<motion.span
								className="inline-block ml-2"
								animate={{ x: [0, 4, 0] }}
								transition={{
									duration: 1.5,
									repeat: Infinity,
									repeatType: 'loop',
									ease: 'easeInOut',
								}}
							>
								<ArrowRight className="w-4 h-4" />
							</motion.span>
						</Button>
					</Link>
				</motion.div>
			</div>
		</section>
	);
}
