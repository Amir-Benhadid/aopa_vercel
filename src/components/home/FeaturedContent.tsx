'use client';

import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, FileText, Newspaper } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface ContentItem {
	id: string;
	title: string;
	description: string;
	image?: string;
	link: string;
	type: 'article' | 'resource' | 'news';
}

interface FeaturedContentProps {
	items?: ContentItem[];
}

// Default content items if none are provided
const defaultItems: ContentItem[] = [
	{
		id: '1',
		title: 'Latest Research in Glaucoma Treatment',
		description:
			'Discover the newest approaches to managing glaucoma and improving patient outcomes.',
		image: '/images/hero-background.jpg',
		link: '/resources/glaucoma-research',
		type: 'article',
	},
	{
		id: '2',
		title: 'Educational Resources for Ophthalmologists',
		description:
			'Access our comprehensive library of educational materials for continuing professional development.',
		image: '/images/reports-background.jpg',
		link: '/resources',
		type: 'resource',
	},
	{
		id: '3',
		title: 'Upcoming Webinar: Advances in Cataract Surgery',
		description:
			'Join leading experts to learn about the latest techniques and technologies in cataract surgery.',
		link: '/archives/events',
		type: 'news',
	},
];

export function FeaturedContent({
	items = defaultItems,
}: FeaturedContentProps) {
	const { t } = useTranslation();

	// Get icon based on content type
	const getContentIcon = (type: string) => {
		switch (type) {
			case 'article':
				return <FileText className="w-5 h-5" />;
			case 'resource':
				return <BookOpen className="w-5 h-5" />;
			case 'news':
				return <Newspaper className="w-5 h-5" />;
			default:
				return <FileText className="w-5 h-5" />;
		}
	};

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
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
				damping: 25,
			},
		},
	};

	return (
		<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 sm:p-8">
			<div className="text-center mb-8">
				<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
					{t('home.featuredContent.title', 'Featured Content')}
				</h2>
				<p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
					{t(
						'home.featuredContent.subtitle',
						'Explore the latest resources, articles, and news in ophthalmology'
					)}
				</p>
			</div>

			<motion.div
				variants={containerVariants}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: '-50px' }}
				className="grid grid-cols-1 md:grid-cols-3 gap-6"
			>
				{items.map((item) => (
					<motion.div
						key={item.id}
						variants={itemVariants}
						className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
					>
						{item.image ? (
							<div className="relative h-48 overflow-hidden">
								<Image
									src={item.image}
									alt={item.title}
									fill
									className="object-cover transition-transform duration-500 group-hover:scale-105"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
								<div className="absolute bottom-0 left-0 right-0 p-4">
									<div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
										{getContentIcon(item.type)}
										<span className="ml-1.5">
											{t(`home.featuredContent.types.${item.type}`, item.type)}
										</span>
									</div>
								</div>
							</div>
						) : (
							<div className="h-32 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
								<div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-3">
									{getContentIcon(item.type)}
								</div>
							</div>
						)}

						<div className="p-5">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
								{item.title}
							</h3>
							<p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
								{item.description}
							</p>
							<Button
								asChild
								variant="outline"
								className="w-full justify-between group"
							>
								<Link href={item.link}>
									<span>{t('home.featuredContent.readMore', 'Read More')}</span>
									<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
								</Link>
							</Button>
						</div>
					</motion.div>
				))}
			</motion.div>

			<div className="mt-8 text-center">
				<Button asChild variant="outline" className="group">
					<Link href="/resources">
						<span>
							{t('home.featuredContent.viewAll', 'View All Resources')}
						</span>
						<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
					</Link>
				</Button>
			</div>
		</div>
	);
}
