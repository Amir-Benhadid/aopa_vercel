'use client';

import { Button } from '@/components/ui/Button';
import { getUpcomingEvents } from '@/lib/api';
import { Activity, Building, Congress } from '@/types/database';
import { motion } from 'framer-motion';
import {
	BookOpen,
	Calendar,
	Mail,
	MapPin,
	Presentation,
	Star,
	Users,
	Video,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Define a type for our combined event
type CombinedEvent = (Activity | Congress) & {
	eventType: 'activity' | 'congress';
	date: string;
};

export function NoActivitiesPlaceholder() {
	const { t } = useTranslation();
	const [upcomingEvents, setUpcomingEvents] = useState<CombinedEvent[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchUpcomingEvents() {
			try {
				setIsLoading(true);
				const events = await getUpcomingEvents();
				// Cast the events to our CombinedEvent type since we know the API adds the necessary fields
				setUpcomingEvents(events as unknown as CombinedEvent[]);
			} catch (err) {
				console.error('Error fetching upcoming events:', err);
				setError(t('home.errors.dataLoadFailed'));
			} finally {
				setIsLoading(false);
			}
		}

		fetchUpcomingEvents();
	}, [t]);

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.15,
				delayChildren: 0.1,
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
				stiffness: 300,
				damping: 20,
				duration: 0.6,
			},
		},
	};

	// Format date
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	// Get icon and color based on event type
	const getEventIcon = (event: CombinedEvent) => {
		if (event.eventType === 'congress') {
			return <Star className="w-5 h-5 text-white" />;
		}

		const activity = event as Activity;
		switch (activity.type) {
			case 'wetlab':
				return <Users className="w-5 h-5 text-white" />;
			case 'lunch-symposium':
				return <Presentation className="w-5 h-5 text-white" />;
			case 'cour':
				return <BookOpen className="w-5 h-5 text-white" />;
			case 'atelier':
				return <Video className="w-5 h-5 text-white" />;
			default:
				return <Calendar className="w-5 h-5 text-white" />;
		}
	};

	const getEventColor = (event: CombinedEvent) => {
		if (event.eventType === 'congress') {
			return 'bg-purple-500';
		}

		const activity = event as Activity;
		switch (activity.type) {
			case 'wetlab':
				return 'bg-blue-500';
			case 'lunch-symposium':
				return 'bg-purple-500';
			case 'cour':
				return 'bg-green-500';
			case 'atelier':
				return 'bg-amber-500';
			default:
				return 'bg-gray-500';
		}
	};

	const getEventType = (event: CombinedEvent) => {
		if (event.eventType === 'congress') {
			return 'congress';
		}
		const activity = event as Activity;
		return activity.type;
	};

	const getEventLink = (event: CombinedEvent) => {
		if (event.eventType === 'congress') {
			return `/congresses/${event.id}`;
		}
		return `/activities/${event.id}`;
	};

	// Helper function to safely get location name
	const getLocationName = (location: string | Building): string => {
		if (typeof location === 'string') {
			return location;
		}
		return location.name || '';
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<div className="animate-pulse space-y-8 w-full">
					<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
					<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="rounded-xl bg-gray-200 dark:bg-gray-700 h-64"
							></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="text-center py-12">
				<div className="text-red-500 mb-4">{error}</div>
				<Button onClick={() => window.location.reload()}>
					{t('common.retry')}
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="text-center">
				<motion.h2
					initial={{ opacity: 0, y: -20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white"
				>
					{t('home.upcomingEvents.title')}
				</motion.h2>
				<motion.p
					initial={{ opacity: 0, y: -10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="mt-3 text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
				>
					{t('home.upcomingEvents.subtitle')}
				</motion.p>
			</div>

			{upcomingEvents.length > 0 ? (
				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="grid grid-cols-1 md:grid-cols-3 gap-6"
				>
					{upcomingEvents.map((event) => (
						<motion.div
							key={event.id}
							variants={itemVariants}
							className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600"
						>
							<div
								className={`${getEventColor(
									event
								)} p-4 flex items-center justify-between`}
							>
								<div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
									{getEventIcon(event)}
								</div>
								<div className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
									{t(`activityTypes.${getEventType(event)}`)}
								</div>
							</div>
							<div className="p-5">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
									{event.title}
								</h3>
								<div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
									<Calendar className="w-4 h-4 mr-1.5 flex-shrink-0" />
									{formatDate(event.date)}
								</div>
								{event.eventType === 'congress' &&
									(event as Congress).location && (
										<div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
											<MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
											{getLocationName((event as Congress).location)}
										</div>
									)}
								<div className="flex items-center justify-between">
									<div className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1 rounded-full">
										{t('home.upcomingEvents.comingSoon')}
									</div>
									<Button variant="outline" size="sm" asChild>
										<Link
											href={getEventLink(event)}
											className="flex items-center"
										>
											{t('common.learnMore')}
										</Link>
									</Button>
								</div>
							</div>
						</motion.div>
					))}
				</motion.div>
			) : (
				<div className="text-center py-8">
					<p className="text-gray-500 dark:text-gray-400 mb-2">
						{t('home.upcomingEvents.noEvents')}
					</p>
					<p className="text-sm text-gray-400 dark:text-gray-500">
						{t('home.upcomingEvents.checkBack')}
					</p>
				</div>
			)}

			<div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 sm:p-8 mt-8">
				<div className="flex flex-col md:flex-row items-center gap-6">
					<div className="md:w-2/3">
						<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
							{t('home.upcomingEvents.stayUpdated')}
						</h3>
						<p className="text-gray-600 dark:text-gray-300">
							{t('home.upcomingEvents.notifyMe')}
						</p>
					</div>
					<div className="md:w-1/3 flex justify-center md:justify-end">
						<Button asChild>
							<Link href="/newsletter" className="flex items-center">
								<Mail className="mr-2 h-4 w-4" />
								{t('home.upcomingEvents.subscribe')}
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
