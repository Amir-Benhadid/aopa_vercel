'use client';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ExternalLink, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Partner {
	id: string;
	name: string;
	logo: string;
	adImage?: string;
	adUrl?: string;
	description?: string;
}

interface PartnersCarouselProps {
	partners?: Partner[];
}

export function PartnersCarousel({ partners = [] }: PartnersCarouselProps) {
	const { t } = useTranslation();
	const [currentPartnerIndex, setCurrentPartnerIndex] = useState(0);
	const slideInterval = useRef<NodeJS.Timeout | null>(null);
	const hasPartners = partners.length > 0;

	// Animation variants
	const slideVariants = {
		enter: (direction: number) => ({
			x: direction > 0 ? '100%' : '-100%',
			opacity: 0,
		}),
		center: {
			x: 0,
			opacity: 1,
		},
		exit: (direction: number) => ({
			x: direction < 0 ? '100%' : '-100%',
			opacity: 0,
		}),
	};

	// Auto-advance slides
	useEffect(() => {
		if (hasPartners) {
			if (slideInterval.current) {
				clearInterval(slideInterval.current);
			}

			slideInterval.current = setInterval(() => {
				setCurrentPartnerIndex((prev) => (prev + 1) % partners.length);
			}, 5000); // Change slide every 5 seconds
		}

		return () => {
			if (slideInterval.current) {
				clearInterval(slideInterval.current);
			}
		};
	}, [partners, hasPartners]);

	// Handle manual navigation
	const nextSlide = () => {
		if (hasPartners) {
			setCurrentPartnerIndex((prev) => (prev + 1) % partners.length);
		}
	};

	const prevSlide = () => {
		if (hasPartners) {
			setCurrentPartnerIndex(
				(prev) => (prev - 1 + partners.length) % partners.length
			);
		}
	};

	return (
		<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 sm:p-8">
			<div className="text-center mb-8">
				<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
					{t('home.partners.title')}
				</h2>
				<p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
					{t('home.partners.subtitle')}
				</p>
			</div>

			<div className="relative overflow-hidden rounded-xl">
				{hasPartners ? (
					<>
						<AnimatePresence initial={false} custom={1}>
							<motion.div
								key={currentPartnerIndex}
								custom={1}
								variants={slideVariants}
								initial="enter"
								animate="center"
								exit="exit"
								transition={{ type: 'tween', duration: 0.5 }}
								className="w-full"
							>
								<div className="flex flex-col md:flex-row gap-6 items-center">
									{/* Partner Logo */}
									<div className="md:w-1/3 flex justify-center">
										<div className="relative w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-xl p-4 flex items-center justify-center">
											<Image
												src={partners[currentPartnerIndex].logo}
												alt={partners[currentPartnerIndex].name}
												width={160}
												height={160}
												className="object-contain"
											/>
										</div>
									</div>

									{/* Partner Ad/Content */}
									<div className="md:w-2/3">
										<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 relative overflow-hidden">
											{partners[currentPartnerIndex].adImage && (
												<div className="absolute inset-0 opacity-10">
													<Image
														src={partners[currentPartnerIndex].adImage}
														alt="Background"
														fill
														className="object-cover"
													/>
												</div>
											)}
											<div className="relative z-10">
												<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
													{partners[currentPartnerIndex].name}
												</h3>
												<p className="text-gray-600 dark:text-gray-300 mb-4">
													{partners[currentPartnerIndex].description ||
														t('home.partners.defaultDescription')}
												</p>
												{partners[currentPartnerIndex].adUrl && (
													<Button asChild variant="outline" className="group">
														<Link
															href={partners[currentPartnerIndex].adUrl}
															target="_blank"
															rel="noopener noreferrer"
														>
															{t('home.partners.learnMore')}
															<ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
														</Link>
													</Button>
												)}
											</div>
										</div>
									</div>
								</div>
							</motion.div>
						</AnimatePresence>

						{/* Navigation Dots */}
						<div className="flex justify-center mt-6">
							<div className="flex space-x-3">
								{partners.map((_, index) => (
									<button
										key={index}
										onClick={() => setCurrentPartnerIndex(index)}
										className={cn(
											'w-3 h-3 rounded-full transition-all duration-300',
											index === currentPartnerIndex
												? 'bg-primary-600 scale-125'
												: 'bg-gray-300 hover:bg-gray-400'
										)}
										aria-label={`Go to partner ${index + 1}`}
									/>
								))}
							</div>
						</div>
					</>
				) : (
					<div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-8 text-center">
						<div className="max-w-md mx-auto">
							<div className="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
								<Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
							</div>
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
								{t('home.partners.advertiseTitle')}
							</h3>
							<p className="text-gray-600 dark:text-gray-300 mb-6">
								{t('home.partners.advertiseDescription')}
							</p>
							<Button asChild className="group">
								<Link href="/sponsors">
									{t('home.partners.becomePartner')}
									<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
								</Link>
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
