'use client';

import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { Congress } from '@/types/database';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface CongressHeroProps {
	congress: Congress;
}

export function CongressHero({ congress }: CongressHeroProps) {
	const { t } = useTranslation();

	// Format dates for display
	const formattedStartDate = formatDate(congress.start_date);
	const formattedEndDate = formatDate(congress.end_date);

	return (
		<section className="relative overflow-hidden">
			{/* Background gradient and pattern */}
			<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800" />
			<div className="absolute inset-0 bg-[url('/medical-pattern.svg')] opacity-[0.03]" />

			{/* Animated background elements */}
			<motion.div
				className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-3xl"
				animate={{
					scale: [1, 1.2, 1],
					opacity: [0.2, 0.3, 0.2],
				}}
				transition={{
					duration: 8,
					repeat: Infinity,
					repeatType: 'reverse',
				}}
			/>
			<motion.div
				className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-3xl"
				animate={{
					scale: [1, 1.3, 1],
					opacity: [0.2, 0.25, 0.2],
				}}
				transition={{
					duration: 10,
					repeat: Infinity,
					repeatType: 'reverse',
					delay: 1,
				}}
			/>

			{/* Content */}
			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
					{/* Left column - Text content */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
					>
						<div className="inline-block px-3 py-1 mb-4 text-sm font-medium text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-full">
							{t('congress.nextEvent')}
						</div>

						<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
							{congress.title}
						</h1>

						<p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6">
							{congress.description}
						</p>

						<div className="space-y-3 mb-8">
							<div className="flex items-center text-gray-600 dark:text-gray-300">
								<Calendar className="h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" />
								<span>
									{formattedStartDate} - {formattedEndDate}
								</span>
							</div>

							<div className="flex items-center text-gray-600 dark:text-gray-300">
								<MapPin className="h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" />
								<span>
									{typeof congress.location === 'string'
										? congress.location
										: congress.location.name}
								</span>
							</div>

							<div className="flex items-center text-gray-600 dark:text-gray-300">
								<Users className="h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" />
								<span>{t(`congressTypes.${congress.congress_type}`)}</span>
							</div>
						</div>

						<div className="flex flex-col sm:flex-row gap-4">
							{congress.registration && (
								<Button size="lg" asChild>
									<Link href={`/congress/${congress.id}/register`}>
										{t('congress.registerNow')}
									</Link>
								</Button>
							)}
							<Button
								variant="outline"
								size="lg"
								asChild
								className="whitespace-nowrap"
							>
								<Link href={`/upcoming-event`}>{t('congress.learnMore')}</Link>
							</Button>
						</div>
					</motion.div>

					{/* Right column - Stats and countdown */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8"
					>
						<h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
							{t('congress.keyInformation')}
						</h2>

						<div className="grid grid-cols-2 gap-4 mb-8">
							<div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
								<div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
									{(() => {
										// Calculate days until congress start date
										const startDate = new Date(congress.start_date);
										const now = new Date();
										const diffTime = startDate.getTime() - now.getTime();
										return diffTime > 0
											? Math.ceil(diffTime / (1000 * 60 * 60 * 24))
											: 0;
									})()}
								</div>
								<div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
									{t('congress.daysLeft')}
								</div>
							</div>

							<div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
								<div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
									{congress.registration_open
										? t('congress.open')
										: t('congress.closed')}
								</div>
								<div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
									{t('congress.registration')}
								</div>
							</div>

							<div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center col-span-2">
								<div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
									{(() => {
										// Calculate date 3 months before congress start
										const startDate = new Date(congress.start_date);
										const threeMonthsBefore = new Date(startDate);
										threeMonthsBefore.setMonth(startDate.getMonth() - 3);
										return formatDate(threeMonthsBefore.toISOString());
									})()}
								</div>
								<div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
									{t('congress.abstractDeadline')}
								</div>
							</div>
						</div>

						<div className="text-center">
							<Button variant="outline" className="w-full" asChild>
								<Link href={`/congress/${congress.id}/abstracts`}>
									{t('congress.submitAbstract')}
								</Link>
							</Button>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
