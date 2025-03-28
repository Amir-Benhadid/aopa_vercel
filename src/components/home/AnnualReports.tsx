'use client';

import { Button } from '@/components/ui/Button';
import { fallbackImage, getCoverImagePath } from '@/lib/imageUtils';
import { Report } from '@/types/database';
import { motion } from 'framer-motion';
import { Calendar, Download, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface AnnualReportsProps {
	reports: Report[];
}

export function AnnualReports({ reports }: AnnualReportsProps) {
	const { t } = useTranslation();
	const sectionRef = useRef<HTMLElement>(null);

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

	// Function to get cover image based on report title
	const getCoverImage = (title: string) => {
		return getCoverImagePath(title);
	};

	// Format date if available
	const formatDate = (dateString?: Date | string): string => {
		if (!dateString) return '';

		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			});
		} catch (e) {
			return String(dateString);
		}
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
					{reports.map((report, index) => (
						<motion.div
							key={report.id}
							variants={itemVariants}
							className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 h-full flex flex-col border border-gray-100 dark:border-gray-700 hover:translate-y-[-4px]"
						>
							<div className="relative h-56 overflow-hidden">
								<Image
									src={getCoverImage(report.title)}
									alt={report.title}
									fill
									className="object-cover transition-transform duration-700 hover:scale-105"
									onError={(e) => {
										// Fallback to default image if the specific year image fails to load
										e.currentTarget.src = fallbackImage;
									}}
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
								<div className="absolute bottom-0 left-0 right-0 p-4">
									<div className="inline-block px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 rounded-full text-sm font-medium mb-2">
										{new Date(report.published_at).getFullYear()}
									</div>
									<h3 className="text-xl font-bold text-white">
										{report.title}
									</h3>
								</div>
							</div>
							<div className="p-5 flex-1 flex flex-col">
								{/* Publication Date */}
								{report.published_at && (
									<div className="flex items-center mb-4">
										<div className="flex-shrink-0 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-full mr-3">
											<Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
										</div>
										<div>
											<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
												{t('home.annualReports.publishedOn')}
											</h4>
											<p className="text-gray-900 dark:text-white text-sm">
												{formatDate(report.published_at)}
											</p>
										</div>
									</div>
								)}

								{/* Authors */}
								{report.authors && (
									<div className="flex items-center mb-4">
										<div className="flex-shrink-0 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-full mr-3">
											<Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
										</div>
										<div>
											<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
												{t('home.annualReports.authors')}
											</h4>
											<p className="text-gray-900 dark:text-white text-sm line-clamp-1">
												{report.authors}
											</p>
										</div>
									</div>
								)}

								{/* Description */}
								{report.description && (
									<div className="mb-6">
										<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
											{t('home.annualReports.description')}
										</h4>
										<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
											{report.description}
										</p>
									</div>
								)}

								{/* Action Buttons */}
								<div className="mt-auto flex flex-col space-y-2">
									<Link href={`/reports/${report.id}`} passHref>
										<Button variant="default" className="w-full">
											{t('home.annualReports.learnMore')}
										</Button>
									</Link>
								</div>
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
					<Link href="/reports" passHref>
						<Button
							variant="outline"
							className="border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20 transition-colors group"
						>
							{t('home.annualReports.viewAllReports')}
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
								<Download className="w-4 h-4" />
							</motion.span>
						</Button>
					</Link>
				</motion.div>
			</div>
		</section>
	);
}
