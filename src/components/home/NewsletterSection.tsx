'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import {
	AlertCircle,
	Calendar,
	CheckCircle,
	Loader2,
	Mail,
	Send,
	Shield,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function NewsletterSection() {
	const { t } = useTranslation();
	const [email, setEmail] = useState('');
	const [status, setStatus] = useState<
		'idle' | 'loading' | 'success' | 'error'
	>('idle');
	const [errorMessage, setErrorMessage] = useState('');

	// Animation variants
	const formVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				type: 'spring',
				stiffness: 300,
				damping: 20,
			},
		},
		hover: {
			boxShadow:
				'0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
			y: -5,
			transition: {
				type: 'spring',
				stiffness: 400,
				damping: 15,
			},
		},
	};

	const inputVariants = {
		focus: {
			boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
			transition: {
				duration: 0.2,
			},
		},
	};

	const buttonVariants = {
		hidden: { opacity: 0, y: 10 },
		visible: { opacity: 1, y: 0 },
		hover: {
			scale: 1.03,
			backgroundColor: '#2563eb',
			transition: {
				type: 'spring',
				stiffness: 400,
				damping: 10,
			},
		},
		tap: {
			scale: 0.97,
		},
	};

	const iconVariants = {
		hidden: { opacity: 0, scale: 0.8 },
		visible: { opacity: 1, scale: 1 },
		hover: {
			rotate: 15,
			scale: 1.1,
			transition: {
				type: 'spring',
				stiffness: 400,
				damping: 10,
			},
		},
	};

	const backgroundPatternVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 0.03,
			transition: {
				duration: 1.5,
			},
		},
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email) {
			setStatus('error');
			setErrorMessage(t('home.newsletter.emailRequired'));
			return;
		}

		setStatus('loading');

		// Simulate API call
		setTimeout(() => {
			// 90% chance of success
			if (Math.random() > 0.1) {
				setStatus('success');
			} else {
				setStatus('error');
				setErrorMessage(t('home.newsletter.error'));
			}
		}, 1000);
	};

	return (
		<section className="relative overflow-hidden py-12 sm:py-16 md:py-20 rounded-2xl shadow-sm">
			{/* Background pattern */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{
					opacity: 1,
					transition: { duration: 0.8 },
				}}
				className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800"
			/>
			<motion.div
				variants={backgroundPatternVariants}
				initial="hidden"
				animate="visible"
				className="absolute inset-0 bg-[url('/medical-pattern.svg')] opacity-0"
			/>

			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
					{/* Content */}
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{
							type: 'spring',
							stiffness: 300,
							damping: 20,
							duration: 0.5,
						}}
					>
						<motion.h2
							initial={{ opacity: 0, y: -10 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
						>
							{t('home.newsletter.title')}
						</motion.h2>
						<motion.p
							initial={{ opacity: 0, y: -5 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300"
						>
							{t('home.newsletter.description')}
						</motion.p>

						<motion.div
							initial={{ opacity: 0, y: -5 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.3 }}
							className="mt-6 flex flex-col sm:flex-row gap-4"
						>
							<motion.div className="flex items-center" whileHover={{ x: 3 }}>
								<motion.div whileHover="hover" variants={iconVariants}>
									<Shield className="h-5 w-5 text-blue-500 mr-2" />
								</motion.div>
								<span className="text-sm text-gray-600 dark:text-gray-300">
									{t('home.newsletter.privacy')}
								</span>
							</motion.div>
							<motion.div className="flex items-center" whileHover={{ x: 3 }}>
								<motion.div whileHover="hover" variants={iconVariants}>
									<Calendar className="h-5 w-5 text-blue-500 mr-2" />
								</motion.div>
								<span className="text-sm text-gray-600 dark:text-gray-300">
									{t('home.newsletter.frequency')}
								</span>
							</motion.div>
						</motion.div>
					</motion.div>

					{/* Form */}
					<motion.div
						variants={formVariants}
						initial="hidden"
						whileInView="visible"
						whileHover="hover"
						viewport={{ once: true }}
						className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8"
					>
						<form onSubmit={handleSubmit}>
							<div className="space-y-4">
								<div>
									<label
										htmlFor="email"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										{t('auth.email')}
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<motion.div whileHover="hover" variants={iconVariants}>
												<Mail className="h-5 w-5 text-gray-400" />
											</motion.div>
										</div>
										<motion.div whileFocus="focus" variants={inputVariants}>
											<Input
												id="email"
												type="email"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												placeholder={t('home.newsletter.emailPlaceholder')}
												className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
												disabled={status === 'loading' || status === 'success'}
											/>
										</motion.div>
									</div>
								</div>

								<motion.div
									variants={buttonVariants}
									whileHover="hover"
									whileTap="tap"
								>
									<Button
										type="submit"
										className="w-full group"
										disabled={status === 'loading' || status === 'success'}
									>
										{status === 'loading' ? (
											<span className="flex items-center">
												<Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
												{t('common.loading')}
											</span>
										) : status === 'success' ? (
											<span className="flex items-center">
												<CheckCircle className="h-4 w-4 mr-2" />
												{t('common.subscribed')}
											</span>
										) : (
											<span className="flex items-center justify-center">
												{t('home.newsletter.subscribe')}
												<motion.div
													className="ml-2"
													initial={{ x: 0 }}
													whileHover={{ x: 3 }}
												>
													<Send className="h-4 w-4" />
												</motion.div>
											</span>
										)}
									</Button>
								</motion.div>
							</div>
						</form>

						{status === 'success' && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{
									opacity: 1,
									y: 0,
									transition: {
										type: 'spring',
										stiffness: 300,
										damping: 20,
									},
								}}
								className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30"
							>
								<div className="flex">
									<CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
									<p className="text-sm text-green-700 dark:text-green-300">
										{t('home.newsletter.success')}
									</p>
								</div>
							</motion.div>
						)}

						{status === 'error' && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{
									opacity: 1,
									y: 0,
									transition: {
										type: 'spring',
										stiffness: 300,
										damping: 20,
									},
								}}
								className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30"
							>
								<div className="flex">
									<AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
									<p className="text-sm text-red-700 dark:text-red-300">
										{errorMessage || t('home.newsletter.error')}
									</p>
								</div>
							</motion.div>
						)}
					</motion.div>
				</div>
			</div>
		</section>
	);
}
