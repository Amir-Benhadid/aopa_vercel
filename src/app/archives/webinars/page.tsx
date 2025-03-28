'use client';

import { ProtectedContent } from '@/components/common/ProtectedContent';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AnimatePresence, motion } from 'framer-motion';
import {
	ArrowLeft,
	Calendar,
	ExternalLink,
	Filter,
	Search,
	Video,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Webinar {
	id: string;
	title: string;
	description?: string;
	date: string;
	duration: string;
	presenter: string;
	thumbnailUrl?: string;
	videoUrl?: string;
	tags?: string[];
}

export default function WebinarsArchivePage() {
	const { t } = useTranslation();
	const router = useRouter();
	const [webinars, setWebinars] = useState<Webinar[]>([]);
	const [filteredWebinars, setFilteredWebinars] = useState<Webinar[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [yearFilter, setYearFilter] = useState<string>('all');
	const [availableYears, setAvailableYears] = useState<string[]>([]);
	const [currentImageIndices, setCurrentImageIndices] = useState<
		Record<string, number>
	>({});
	const slideIntervals = useRef<Record<string, NodeJS.Timeout>>({});

	useEffect(() => {
		// This is a placeholder for future API integration
		// In a real implementation, you would fetch webinars from an API
		const mockWebinars: Webinar[] = [
			{
				id: 'webinar-1',
				title: 'Modern Approaches to Glaucoma Treatment',
				description:
					'This webinar covers the latest advances in glaucoma treatment, including new medications and surgical techniques.',
				date: '2023-11-15',
				duration: '1h 30m',
				presenter: 'Dr. Sarah Johnson',
				thumbnailUrl: '/images/webinars/glaucoma-treatment.jpg',
				videoUrl: 'https://example.com/webinars/glaucoma-treatment',
				tags: ['Glaucoma', 'Treatment', 'Surgery'],
			},
			{
				id: 'webinar-2',
				title: 'Diabetic Retinopathy: Early Detection and Management',
				description:
					'Learn about the latest screening methods and treatment options for diabetic retinopathy.',
				date: '2023-09-22',
				duration: '1h 15m',
				presenter: 'Dr. Michael Chen',
				thumbnailUrl: '/images/webinars/diabetic-retinopathy.jpg',
				videoUrl: 'https://example.com/webinars/diabetic-retinopathy',
				tags: ['Retina', 'Diabetes', 'Screening'],
			},
			{
				id: 'webinar-3',
				title: 'Advances in Cataract Surgery Techniques',
				description:
					'This webinar explores innovative approaches to cataract surgery, including femtosecond laser-assisted techniques.',
				date: '2022-12-08',
				duration: '2h 00m',
				presenter: 'Dr. Emily Rodriguez',
				thumbnailUrl: '/images/webinars/cataract-surgery.jpg',
				videoUrl: 'https://example.com/webinars/cataract-surgery',
				tags: ['Cataract', 'Surgery', 'Technology'],
			},
			{
				id: 'webinar-4',
				title: 'Pediatric Ophthalmology: Common Conditions and Treatments',
				description:
					'An overview of common pediatric eye conditions and the latest treatment approaches.',
				date: '2023-08-05',
				duration: '1h 45m',
				presenter: 'Dr. Robert Williams',
				thumbnailUrl: '/images/webinars/pediatric-ophthalmology.jpg',
				videoUrl: 'https://example.com/webinars/pediatric-ophthalmology',
				tags: ['Pediatric', 'Strabismus', 'Amblyopia'],
			},
			{
				id: 'webinar-5',
				title: 'Corneal Transplantation: New Techniques and Outcomes',
				description:
					'This webinar discusses the latest advancements in corneal transplantation procedures.',
				date: '2022-10-18',
				duration: '1h 30m',
				presenter: 'Dr. Lisa Thompson',
				thumbnailUrl: '/images/webinars/corneal-transplantation.jpg',
				videoUrl: 'https://example.com/webinars/corneal-transplantation',
				tags: ['Cornea', 'Transplantation', 'DMEK'],
			},
		];

		setWebinars(mockWebinars);
		setFilteredWebinars(mockWebinars);

		// Extract available years for filtering
		const years = [
			...new Set(
				mockWebinars.map((webinar) =>
					new Date(webinar.date).getFullYear().toString()
				)
			),
		];
		setAvailableYears(years.sort().reverse());

		// Initialize current image indices for all webinars
		const initialImageIndices: Record<string, number> = {};
		mockWebinars.forEach((webinar) => {
			initialImageIndices[webinar.id] = 0;
		});
		setCurrentImageIndices(initialImageIndices);

		setIsLoading(false);

		// Cleanup on unmount
		return () => {
			Object.values(slideIntervals.current).forEach((interval) => {
				clearInterval(interval);
			});
		};
	}, []);

	// Filter webinars based on search term and year filter
	useEffect(() => {
		let filtered = webinars;

		// Apply year filter
		if (yearFilter !== 'all') {
			filtered = filtered.filter(
				(webinar) =>
					new Date(webinar.date).getFullYear().toString() === yearFilter
			);
		}

		// Apply search term filter
		if (searchTerm.trim() !== '') {
			filtered = filtered.filter(
				(webinar) =>
					webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(webinar.description &&
						webinar.description
							.toLowerCase()
							.includes(searchTerm.toLowerCase())) ||
					webinar.presenter.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(webinar.tags &&
						webinar.tags.some((tag) =>
							tag.toLowerCase().includes(searchTerm.toLowerCase())
						))
			);
		}

		setFilteredWebinars(filtered);
	}, [searchTerm, yearFilter, webinars]);

	// Format date
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	if (isLoading) {
		return (
			<LoadingSpinner
				message={t('common.loading')}
				background="transparent"
				fullScreen={true}
			/>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
				<h1 className="text-4xl text-red-500">{t('common.error')}</h1>
				<p className="mt-4 text-lg text-gray-600">{error}</p>
			</div>
		);
	}

	return (
		<ProtectedContent>
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
				{/* Header */}
				<div className="relative py-16 bg-white dark:bg-gray-900 overflow-hidden">
					<div className="absolute inset-0 opacity-5">
						<div className="absolute inset-0 bg-grid-primary-700/[0.1] [mask-image:linear-gradient(0deg,transparent,black)]"></div>
					</div>
					<div className="max-w-7xl mx-auto px-4 relative z-10">
						<div className="max-w-3xl">
							<div className="flex items-center mb-6">
								<Button
									variant="ghost"
									className="text-gray-700 dark:text-gray-300 mr-4 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 -ml-2"
									onClick={() => router.back()}
								>
									<ArrowLeft className="w-5 h-5" />
								</Button>
								<div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-primary-100 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300">
									<Video className="w-4 h-4 mr-2" />
									{t('archives.videoContent')}
								</div>
							</div>
							<h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
								{t('archives.webinars')}
							</h1>
							<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
								{t('archives.webinarsDescription') ||
									'Access our library of educational webinars on various ophthalmology topics.'}
							</p>
						</div>
					</div>
					<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
				</div>

				{/* Filters and Search */}
				<div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
					<div className="max-w-7xl mx-auto px-4 py-4">
						<div className="flex flex-col md:flex-row gap-4">
							<div className="relative flex-grow">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Search className="h-5 w-5 text-gray-400" />
								</div>
								<input
									type="text"
									className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:text-white"
									placeholder={t('archives.searchWebinars')}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>

							<div className="relative md:w-40">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Filter className="h-5 w-5 text-gray-400" />
								</div>
								<select
									className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none"
									value={yearFilter}
									onChange={(e) => setYearFilter(e.target.value)}
								>
									<option value="all">
										{t('common.allYears') || 'All Years'}
									</option>
									{availableYears.map((year) => (
										<option key={year} value={year}>
											{year}
										</option>
									))}
								</select>
								<div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
									<svg
										className="h-5 w-5 text-gray-400"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fillRule="evenodd"
											d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="max-w-7xl mx-auto px-4 py-8">
					{filteredWebinars.length === 0 ? (
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
							<Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
							<h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
								{t('archives.noWebinarsFound')}
							</h3>
							<p className="text-gray-500 dark:text-gray-400">
								{t('archives.tryDifferentSearch')}
							</p>
							{searchTerm && (
								<Button
									onClick={() => setSearchTerm('')}
									variant="outline"
									className="mt-4"
								>
									{t('common.clearSearch')}
								</Button>
							)}
						</div>
					) : (
						<div className="space-y-12">
							{availableYears.map((year) => {
								const yearWebinars = filteredWebinars.filter(
									(webinar) =>
										new Date(webinar.date).getFullYear().toString() === year
								);

								if (yearWebinars.length === 0) return null;

								return (
									<div key={year} className="space-y-6">
										<h2 className="text-2xl font-bold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
											{year}
										</h2>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
											{yearWebinars.map((webinar, index) => (
												<motion.div
													key={webinar.id}
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ duration: 0.3, delay: index * 0.05 }}
													className="group"
												>
													<a
														href={webinar.videoUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="block h-full"
													>
														<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
															<div className="h-48 relative overflow-hidden">
																<AnimatePresence initial={false} mode="wait">
																	<motion.div
																		key={currentImageIndices[webinar.id] || 0}
																		initial={{ opacity: 0 }}
																		animate={{ opacity: 1 }}
																		exit={{ opacity: 0 }}
																		transition={{ duration: 0.5 }}
																		className="absolute inset-0"
																	>
																		{webinar.thumbnailUrl ? (
																			<div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-primary-600/20">
																				<img
																					src={webinar.thumbnailUrl}
																					alt={webinar.title}
																					className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
																				/>
																			</div>
																		) : (
																			<div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-primary-600 flex items-center justify-center">
																				<Video className="w-16 h-16 text-white/70" />
																			</div>
																		)}
																	</motion.div>
																</AnimatePresence>
																<div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-medium py-1 px-2 rounded-full">
																	{webinar.duration}
																</div>
																<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
																<div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
																	<div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
																		<div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-t-transparent border-b-transparent border-l-white ml-1"></div>
																	</div>
																</div>
															</div>
															<div className="p-5 flex-grow">
																<div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-2">
																	<Calendar className="w-4 h-4 mr-1" />
																	<span>{formatDate(webinar.date)}</span>
																</div>
																<h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
																	{webinar.title}
																</h3>
																<p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
																	{webinar.presenter}
																</p>
																{webinar.description && (
																	<p className="text-gray-500 dark:text-gray-500 text-sm line-clamp-2">
																		{webinar.description}
																	</p>
																)}
																{webinar.tags && webinar.tags.length > 0 && (
																	<div className="flex flex-wrap gap-1 mt-3">
																		{webinar.tags.map((tag, index) => (
																			<span
																				key={index}
																				className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-xs px-2 py-1 rounded"
																			>
																				{tag}
																			</span>
																		))}
																	</div>
																)}
															</div>
															<div className="px-5 pb-5 pt-0">
																<div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium">
																	{t('archives.watchWebinar')}
																	<ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
																</div>
															</div>
														</div>
													</a>
												</motion.div>
											))}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</ProtectedContent>
	);
}
