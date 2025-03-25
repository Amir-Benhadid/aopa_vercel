'use client';

import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface HeroSectionProps {
	congressTitle: string;
	congressDate: string;
	congressLocation: string;
	registrationProgress: number;
	congressRegistrationOpen: boolean | undefined;
}

export function HeroSection({
	congressTitle,
	congressDate,
	congressLocation,
	registrationProgress,
	congressRegistrationOpen,
}: HeroSectionProps) {
	const { t } = useTranslation();
	const { scrollY } = useScroll();

	// Parallax effect values
	const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
	const contentOpacity = useTransform(scrollY, [0, 300], [1, 0.5]);
	const contentY = useTransform(scrollY, [0, 300], [0, 50]);

	return (
		<section className="relative top-0 left-0 w-full h-screen min-h-[600px] sm:min-h-[700px] flex items-center overflow-hidden">
			{/* Parallax Background Image */}
			<motion.div className="absolute inset-0 z-0" style={{ y: backgroundY }}>
				<Image
					src="/images/hero-background.png"
					alt={t('home.hero.backgroundAlt')}
					fill
					className="object-fill"
					priority
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/80 mix-blend-multiply" />
			</motion.div>

			{/* Background Elements */}
			<div className="absolute inset-0 z-0">
				<motion.div
					className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-600/20 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						repeatType: 'reverse',
					}}
				/>
				<motion.div
					className="absolute bottom-1/3 left-1/4 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl"
					animate={{
						scale: [1, 1.1, 1],
						opacity: [0.2, 0.4, 0.2],
					}}
					transition={{
						duration: 10,
						repeat: Infinity,
						repeatType: 'reverse',
						delay: 1,
					}}
				/>
			</div>

			{/* Content */}
			<div className="w-full px-8 sm:px-12 lg:px-32 relative z-10">
				<motion.div
					className="max-w-3xl"
					style={{
						opacity: contentOpacity,
						y: contentY,
					}}
				>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="inline-block px-4 py-1.5 mb-4 sm:mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
					>
						<span className="text-sm sm:text-base font-medium text-white">
							{t('home.hero.upcomingEvent')}
						</span>
					</motion.div>

					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6"
					>
						{congressTitle} {t('home.hero.titleCompletion')}
					</motion.h1>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-4 sm:mb-6 text-white/90"
					>
						<div className="flex items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5 mr-2"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							<span>{formatDate(congressDate)}</span>
						</div>
						<div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/50" />
						<div className="flex items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5 mr-2"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
							<span>{congressLocation}</span>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
						className="flex flex-col sm:flex-row gap-3 sm:gap-4"
					>
						{congressRegistrationOpen && (
							<Button size="lg" asChild>
								<Link href="/congress/register">
									{t('home.hero.registerNow')}
								</Link>
							</Button>
						)}
						<Button
							variant="outline"
							size="lg"
							asChild
							className="bg-white/10 hover:bg-white/20 text-white border-white/20"
						>
							<Link href="/upcoming-event">{t('home.hero.learnMore')}</Link>
						</Button>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
