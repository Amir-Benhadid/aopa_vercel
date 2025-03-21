'use client';

import { Button } from '@/components/ui/Button';
import { getActivityById } from '@/lib/api';
import { Activity } from '@/types/database';
import { motion } from 'framer-motion';
import {
	ArrowLeft,
	Calendar,
	Clock,
	Download,
	MapPin,
	Share2,
	Tag,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Map activity types to icons and colors
const activityTypeConfig = {
	workshop: {
		color: 'bg-blue-500',
		textColor: 'text-blue-500',
		lightBg: 'bg-blue-50 dark:bg-blue-900/20',
		iconColor: 'text-blue-500 dark:text-blue-400',
	},
	symposium: {
		color: 'bg-purple-500',
		textColor: 'text-purple-500',
		lightBg: 'bg-purple-50 dark:bg-purple-900/20',
		iconColor: 'text-purple-500 dark:text-purple-400',
	},
	course: {
		color: 'bg-green-500',
		textColor: 'text-green-500',
		lightBg: 'bg-green-50 dark:bg-green-900/20',
		iconColor: 'text-green-500 dark:text-green-400',
	},
	webinar: {
		color: 'bg-amber-500',
		textColor: 'text-amber-500',
		lightBg: 'bg-amber-50 dark:bg-amber-900/20',
		iconColor: 'text-amber-500 dark:text-amber-400',
	},
};

// Extended Activity type with additional properties
type ActivityWithExtras = Activity & {
	image?: string;
	location?: string;
};

export default function ActivityDetailPage() {
	const { t } = useTranslation();
	const params = useParams();
	const router = useRouter();
	const [activity, setActivity] = useState<ActivityWithExtras | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchActivity() {
			if (!params.id) {
				setError('Activity ID is missing');
				setIsLoading(false);
				return;
			}

			try {
				const activityData = await getActivityById(params.id as string);
				if (!activityData) {
					setError('Activity not found');
				} else {
					setActivity(activityData);
				}
			} catch (err) {
				console.error('Error fetching activity:', err);
				setError('Failed to load activity data');
			} finally {
				setIsLoading(false);
			}
		}

		fetchActivity();
	}, [params.id]);

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen pt-20">
				<div className="text-2xl font-semibold mb-4">{t('common.loading')}</div>
				<div className="animate-pulse flex space-x-4">
					<div className="rounded-full bg-gray-200 h-12 w-12"></div>
					<div className="rounded-full bg-gray-200 h-12 w-12"></div>
					<div className="rounded-full bg-gray-200 h-12 w-12"></div>
				</div>
			</div>
		);
	}

	if (error || !activity) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen pt-20">
				<div className="text-2xl font-semibold mb-4 text-red-600">
					{t('common.error')}
				</div>
				<div className="text-gray-600 mb-6">
					{error || 'Activity not found'}
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
						<Button>{t('common.returnHome')}</Button>
					</Link>
				</div>
			</div>
		);
	}

	// Get activity type configuration
	const typeConfig =
		activityTypeConfig[
			activity.type as 'workshop' | 'symposium' | 'course' | 'webinar'
		] || activityTypeConfig.workshop;

	// Format date
	const activityDate = new Date(activity.start_date);
	const formattedDate = activityDate.toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});

	// Calculate if the activity is upcoming or past
	const today = new Date();
	const isUpcoming = activityDate > today;
	const isPast = activityDate < today;

	return (
		<div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
			{/* Breadcrumb Navigation */}
			<div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
				<div className="max-w-7xl mx-auto px-4 py-4 flex items-center text-sm">
					<Link
						href="/"
						className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
					>
						{t('common.home')}
					</Link>
					<span className="mx-2 text-gray-400">/</span>
					<Link
						href="/activities"
						className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
					>
						{t('common.activities')}
					</Link>
					<span className="mx-2 text-gray-400">/</span>
					<span className="text-gray-900 dark:text-white font-medium truncate">
						{activity.title}
					</span>
				</div>
			</div>

			{/* Hero Section */}
			<div className="relative w-full h-[40vh] min-h-[300px]">
				<Image
					src={activity.image || `/activities/default-${activity.type}.jpg`}
					alt={activity.title}
					fill
					className="object-cover"
					priority
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />

				<div className="absolute inset-0 flex flex-col justify-end p-4 md:p-8 max-w-7xl mx-auto w-full">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="max-w-4xl"
					>
						<div
							className={`inline-flex items-center px-3 py-1 rounded-full ${typeConfig.lightBg} ${typeConfig.textColor} text-sm font-medium mb-3`}
						>
							<Tag className="w-3.5 h-3.5 mr-1.5" />
							{t(`activity.types.${activity.type}`)}
						</div>

						<h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
							{activity.title}
						</h1>

						<div className="flex flex-wrap gap-4 mb-6">
							<div className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
								<Calendar className="w-4 h-4 mr-2" />
								<span>{formattedDate}</span>
							</div>
							<div className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
								<MapPin className="w-4 h-4 mr-2" />
								<span>{activity.location}</span>
							</div>
							<div className="flex items-center text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
								<Clock className="w-4 h-4 mr-2" />
								<span>2 hours</span>
							</div>
						</div>

						<div className="flex flex-wrap gap-3 mt-6">
							{isUpcoming && (
								<Button
									size="lg"
									className="bg-blue-600 hover:bg-blue-700 text-white"
								>
									{t('activity.registerNow')}
								</Button>
							)}
							<Button
								size="lg"
								variant="outline"
								className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
							>
								<Share2 className="w-4 h-4 mr-2" />
								{t('activity.share')}
							</Button>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Content Section */}
			<div className="max-w-7xl mx-auto w-full px-4 py-12">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8"
						>
							<h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
								{t('activity.aboutEvent')}
							</h2>
							<div className="prose dark:prose-invert max-w-none">
								<p className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-lg leading-relaxed">
									{activity.description}
								</p>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.3 }}
							className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
						>
							<h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
								{t('activity.speakers')}
							</h2>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="flex items-start">
									<div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
										<Image
											src="/images/speakers/speaker-1.jpg"
											alt="Dr. Jane Smith"
											width={64}
											height={64}
											className="object-cover w-full h-full"
										/>
									</div>
									<div>
										<h3 className="font-bold text-gray-900 dark:text-white">
											Dr. Jane Smith
										</h3>
										<p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
											Chief Ophthalmologist, University Hospital
										</p>
										<p className="text-gray-700 dark:text-gray-300">
											Specialist in retinal diseases with over 15 years of
											experience.
										</p>
									</div>
								</div>

								<div className="flex items-start">
									<div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
										<Image
											src="/images/speakers/speaker-2.jpg"
											alt="Prof. Michael Johnson"
											width={64}
											height={64}
											className="object-cover w-full h-full"
										/>
									</div>
									<div>
										<h3 className="font-bold text-gray-900 dark:text-white">
											Prof. Michael Johnson
										</h3>
										<p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
											Research Director, Eye Institute
										</p>
										<p className="text-gray-700 dark:text-gray-300">
											Leading researcher in glaucoma treatment innovations.
										</p>
									</div>
								</div>
							</div>
						</motion.div>
					</div>

					{/* Sidebar */}
					<div className="lg:col-span-1">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.3 }}
							className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 sticky top-24"
						>
							<h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
								{t('activity.registration')}
							</h3>

							<div className="mb-6">
								<div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
									{t('activity.price')}
								</div>
								<div className="text-2xl font-bold text-gray-900 dark:text-white">
									{activity.price ? `$${activity.price}` : t('activity.free')}
								</div>
							</div>

							<div className="space-y-4 mb-6">
								<div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
									<span className="text-gray-600 dark:text-gray-400">
										{t('activity.date')}
									</span>
									<span className="font-medium text-gray-900 dark:text-white">
										{formattedDate}
									</span>
								</div>

								<div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
									<span className="text-gray-600 dark:text-gray-400">
										{t('activity.duration')}
									</span>
									<span className="font-medium text-gray-900 dark:text-white">
										2 hours
									</span>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-gray-600 dark:text-gray-400">
										{t('activity.availableSpots')}
									</span>
									<span className="font-medium text-gray-900 dark:text-white">
										24
									</span>
								</div>
							</div>

							{isUpcoming ? (
								<Button className="w-full mb-3">
									{t('activity.registerNow')}
								</Button>
							) : (
								<div className="flex items-center mb-3 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
									<div className="w-3 h-3 bg-amber-500 rounded-full mr-3"></div>
									<p className="text-amber-700 dark:text-amber-400 font-medium">
										{t('activity.eventPassed')}
									</p>
								</div>
							)}

							<Button
								variant="outline"
								className="w-full flex items-center justify-center"
							>
								<Download className="w-4 h-4 mr-2" />
								{t('activity.downloadDetails')}
							</Button>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.4 }}
							className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
						>
							<h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
								{t('activity.location')}
							</h3>

							<div className="aspect-video relative rounded-xl overflow-hidden mb-6">
								<Image
									src="/images/map-placeholder.jpg"
									alt="Location Map"
									fill
									className="object-cover"
								/>
								<div className="absolute inset-0 flex items-center justify-center">
									<Button
										variant="outline"
										className="bg-white/80 backdrop-blur-sm hover:bg-white"
									>
										{t('activity.getDirections')}
									</Button>
								</div>
							</div>

							<div className="flex items-start mb-4">
								<MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1 mr-3 flex-shrink-0" />
								<div>
									<h3 className="font-medium text-gray-900 dark:text-white">
										{activity.location}
									</h3>
									<p className="text-gray-600 dark:text-gray-400 mt-1">
										{t('activity.venueDetails')}
									</p>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
}
