'use client';

import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowRight, File, User } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function QuickActions() {
	const { t } = useTranslation();

	const cardVariants = {
		initial: {
			opacity: 0,
			y: 20,
			scale: 0.95,
		},
		animate: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				duration: 0.5,
			},
		},
		hover: {
			y: -8,
			boxShadow:
				'0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
			transition: {
				type: 'spring',
				stiffness: 400,
				damping: 15,
			},
		},
	};

	const iconVariants = {
		initial: { scale: 1 },
		hover: {
			scale: 1.1,
			rotate: 5,
			transition: {
				type: 'spring',
				stiffness: 400,
				damping: 10,
			},
		},
	};

	const arrowVariants = {
		initial: { x: 0 },
		hover: {
			x: 5,
			transition: {
				type: 'spring',
				stiffness: 400,
				damping: 10,
			},
		},
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
			<motion.div
				variants={cardVariants}
				initial="initial"
				animate="animate"
				whileHover="hover"
				className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 rounded-2xl shadow-lg overflow-hidden group"
			>
				<div className="p-6 sm:p-8 flex flex-col h-full">
					<div className="flex items-start mb-4">
						<motion.div
							variants={iconVariants}
							className="bg-white/20 backdrop-blur-sm p-3 rounded-xl mr-4"
						>
							<File className="h-6 w-6 text-white" />
						</motion.div>
						<div>
							<h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
								{t('home.quickActions.abstracts.title')}
							</h3>
							<p className="text-white/80 text-sm sm:text-base">
								{t('home.quickActions.abstracts.description')}
							</p>
						</div>
					</div>
					<div className="mt-auto">
						<Button
							asChild
							className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20 w-full justify-between group"
						>
							<Link href="/abstracts">
								<span>{t('home.quickActions.abstracts.action')}</span>
								<motion.span variants={arrowVariants} className="inline-block">
									<ArrowRight className="h-4 w-4 ml-2" />
								</motion.span>
							</Link>
						</Button>
					</div>
				</div>
			</motion.div>

			<motion.div
				variants={cardVariants}
				initial="initial"
				animate="animate"
				whileHover="hover"
				transition={{ delay: 0.1 }}
				className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-800 rounded-2xl shadow-lg overflow-hidden group"
			>
				<div className="p-6 sm:p-8 flex flex-col h-full">
					<div className="flex items-start mb-4">
						<motion.div
							variants={iconVariants}
							className="bg-white/20 backdrop-blur-sm p-3 rounded-xl mr-4"
						>
							<User className="h-6 w-6 text-white" />
						</motion.div>
						<div>
							<h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
								{t('home.quickActions.profile.title')}
							</h3>
							<p className="text-white/80 text-sm sm:text-base">
								{t('home.quickActions.profile.description')}
							</p>
						</div>
					</div>
					<div className="mt-auto">
						<Button
							asChild
							className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20 w-full justify-between group"
						>
							<Link href="/profile">
								<span>{t('home.quickActions.profile.action')}</span>
								<motion.span variants={arrowVariants} className="inline-block">
									<ArrowRight className="h-4 w-4 ml-2" />
								</motion.span>
							</Link>
						</Button>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
