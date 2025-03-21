'use client';

import { Button } from '@/components/ui/Button';
import { Activity } from '@/types/database';
import { motion } from 'framer-motion';
import {
	ArrowRight,
	Beaker,
	BookOpen,
	Calendar,
	Microscope,
	Users,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface FeaturedActivitiesProps {
	activities: Activity[];
}

export function FeaturedActivities({ activities }: FeaturedActivitiesProps) {
	const { t } = useTranslation();

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
		hidden: { opacity: 0, y: 30 },
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

	const tagVariants = {
		hidden: { opacity: 0, scale: 0.8 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				type: 'spring',
				stiffness: 500,
				damping: 25,
				delay: 0.2,
			},
		},
	};

	const buttonVariants = {
		hidden: { opacity: 0, y: 10 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				type: 'spring',
				stiffness: 500,
				damping: 25,
				delay: 0.3,
			},
		},
	};

	const arrowVariants = {
		rest: { x: 0 },
		hover: {
			x: 3,
			transition: {
				duration: 0.2,
				ease: 'easeInOut',
			},
		},
	};

	// Function to get icon based on activity type
	const getActivityIcon = (type: string) => {
		switch (type) {
			case 'workshop':
			case 'atelier':
				return <Users className="w-8 h-8 text-white" />;
			case 'symposium':
			case 'lunch-symposium':
				return <BookOpen className="w-8 h-8 text-white" />;
			case 'course':
			case 'cour':
				return <Beaker className="w-8 h-8 text-white" />;
			case 'webinar':
			case 'wetlab':
				return <Microscope className="w-8 h-8 text-white" />;
			default:
				return <Calendar className="w-8 h-8 text-white" />;
		}
	};

	// Function to get gradient based on activity type
	const getActivityGradient = (type: string) => {
		switch (type) {
			case 'workshop':
			case 'atelier':
				return 'from-blue-500 to-indigo-600';
			case 'symposium':
			case 'lunch-symposium':
				return 'from-purple-500 to-pink-600';
			case 'course':
			case 'cour':
				return 'from-green-500 to-teal-600';
			case 'webinar':
			case 'wetlab':
				return 'from-orange-500 to-red-600';
			default:
				return 'from-gray-500 to-gray-700';
		}
	};

	// Format date with time
	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString);
		const formattedDate = date.toLocaleDateString();
		const formattedTime = date.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		});
		return `${formattedDate} • ${formattedTime}`;
	};

	// Get activity type label
	const getActivityTypeLabel = (type: string) => {
		switch (type) {
			case 'workshop':
			case 'atelier':
				return t('activityTypes.workshop');
			case 'symposium':
			case 'lunch-symposium':
				return t('activityTypes.symposium');
			case 'course':
			case 'cour':
				return t('activityTypes.course');
			case 'webinar':
			case 'wetlab':
				return t('activityTypes.webinar');
			default:
				return type;
		}
	};

	return (
		<section className="py-12 sm:py-16 md:py-20 rounded-3xl overflow-hidden">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-10 sm:mb-14">
					<motion.h2
						initial={{ opacity: 0, y: -20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
						className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
					>
						{t('home.featuredActivities.title')}
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: -10 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
					>
						{t('home.featuredActivities.subtitle')}
					</motion.p>
				</div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
				>
					{activities.map((activity) => (
						<motion.div
							key={activity.id}
							variants={itemVariants}
							className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 h-full flex flex-col group transform transition-all duration-300 ease-out hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600 hover:-translate-y-1"
						>
							{/* Colorful header with icon instead of image */}
							<div
								className={`bg-gradient-to-r ${getActivityGradient(
									activity.type
								)} p-5 flex items-center justify-between transition-all duration-300`}
							>
								<div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-lg transform transition-transform duration-300 group-hover:scale-110">
									{getActivityIcon(activity.type)}
								</div>
								<motion.div
									variants={tagVariants}
									className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full"
								>
									{getActivityTypeLabel(activity.type)}
								</motion.div>
							</div>

							<div className="p-5 flex-1 flex flex-col">
								<div className="flex-1">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
										{activity.title}
									</h3>
									<p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
										{activity.description}
									</p>
								</div>
								<div className="flex flex-col space-y-2 mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
									<div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
										<Calendar className="w-4 h-4 mr-1.5 flex-shrink-0" />
										{formatDateTime(activity.start_date)}
									</div>
									<div className="flex justify-between items-center mt-3">
										<div className="flex items-center">
											<div className="text-sm font-medium text-gray-900 dark:text-white">
												{t('activity.price', { price: activity.price })}
											</div>
										</div>
										<Link
											href={`/activities/${activity.id}`}
											className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium flex items-center"
										>
											{t('common.viewDetails')}
											<ArrowRight className="w-3.5 h-3.5 ml-1" />
										</Link>
									</div>
								</div>
							</div>
						</motion.div>
					))}
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{
						type: 'spring',
						stiffness: 300,
						damping: 20,
						delay: 0.3,
					}}
					className="mt-10 sm:mt-14 text-center"
				>
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						transition={{
							type: 'spring',
							stiffness: 400,
							damping: 10,
						}}
					>
						<Button asChild className="relative overflow-hidden group">
							<Link href="/activities" className="flex items-center">
								{t('home.featuredActivities.viewAll')}
								<motion.span
									className="ml-2"
									animate={{ x: [0, 5, 0] }}
									transition={{
										duration: 1.5,
										repeat: Infinity,
										repeatType: 'loop',
										ease: 'easeInOut',
									}}
								>
									<ArrowRight className="w-4 h-4" />
								</motion.span>
								<motion.div
									className="absolute inset-0 bg-blue-600/0"
									initial={false}
									whileHover={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
									transition={{ duration: 0.3 }}
								/>
							</Link>
						</Button>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
