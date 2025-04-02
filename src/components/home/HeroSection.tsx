'use client';

import { Button } from '@/components/ui/Button';
import { FallbackImage } from '@/components/ui/FallbackImage';
import { getAnnualReports } from '@/lib/api';
import {
	fallbackImage,
	getCoverImagePath,
	getPageImagePath,
} from '@/lib/imageUtils';
import { formatDate, toTitleCase } from '@/lib/utils';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

interface Report {
	id: string;
	title: string;
	year?: number;
	fileSize?: string;
	file_size?: string;
	downloadUrl?: string;
	file_url?: string;
	published_at?: string;
	description?: string;
	introduction?: string;
	authors?: string;
	template?: number[];
}

interface HeroSectionProps {
	congressTitle: string;
	congressDate: string;
	congressEndDate: string;
	congressLocation: string;
	registrationProgress: number;
	congressRegistrationOpen: boolean | undefined;
}

export function HeroSection({
	congressTitle,
	congressDate,
	congressEndDate,
	congressLocation,
	registrationProgress,
	congressRegistrationOpen,
}: HeroSectionProps) {
	const { t, i18n } = useTranslation();
	const { scrollY } = useScroll();
	const sliderRef = useRef<Slider | null>(null);
	const [reports, setReports] = useState<Report[]>([]);
	const [activeSlide, setActiveSlide] = useState(0);

	// Fetch annual reports
	useEffect(() => {
		async function fetchReports() {
			try {
				const data = await getAnnualReports();
				console.log('Fetched reports:', data);
				setReports(data && data.length > 0 ? [data[0]] : []);
			} catch (err) {
				console.error('Error fetching reports:', err);
			}
		}

		fetchReports();
	}, []);

	// Parallax effect values
	const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
	const contentOpacity = useTransform(scrollY, [0, 300], [1, 0.5]);
	const contentY = useTransform(scrollY, [0, 300], [0, 50]);

	const settings = {
		dots: true,
		infinite: true,
		speed: 800,
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplay: true,
		autoplaySpeed: 4000,
		pauseOnHover: true,
		fade: false,
		cssEase: 'cubic-bezier(0.65, 0, 0.35, 1)',
		useTransform: true,
		useCSS: true,
		swipe: true,
		swipeToSlide: true,
		lazyLoad: 'ondemand' as const,
		touchThreshold: 10, // Improved swipe sensitivity
		adaptiveHeight: false, // Enable if slide heights vary
		dotsClass: 'slick-dots custom-dots',
		responsive: [
			{
				breakpoint: 768,
				settings: {
					arrows: false,
					swipe: true,
				},
			},
		],
		beforeChange: (current: number, next: number) => {
			setActiveSlide(next);
			// You might consider refactoring this DOM manipulation:
			const slide1Bg = document.querySelector('.slide1-bg');
			const slide2Bg = document.querySelector('.slide2-bg');
			const gradientOverlay = document.querySelector('.gradient-overlay');

			if (slide1Bg && slide2Bg && gradientOverlay) {
				// Hide all slide backgrounds
				slide1Bg.classList.add('opacity-0');
				slide2Bg.classList.add('opacity-0');

				// Show only the active slide background
				if (next === 0) {
					slide1Bg.classList.remove('opacity-0');
					gradientOverlay.classList.remove(
						'from-indigo-900/80',
						'to-blue-800/80'
					);
					gradientOverlay.classList.add('from-blue-900/80', 'to-indigo-900/80');
				} else if (next === 1) {
					slide2Bg.classList.remove('opacity-0');
					gradientOverlay.classList.remove(
						'from-blue-900/80',
						'to-indigo-900/80'
					);
					gradientOverlay.classList.add('from-indigo-900/80', 'to-blue-800/80');
				}
			}
		},
		customPaging: () => (
			<div className="w-3 h-3 mx-2 rounded-full bg-white/30 hover:bg-white/50 transition-all duration-300"></div>
		),
	};

	// Content slide component for first slide
	const CongressSlide = () => (
		<div className="w-full px-8 sm:px-12 lg:px-32 relative z-10 h-full flex items-center">
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
					className="inline-block px-4 py-1.5 mb-4 sm:mb-6 rounded-full bg-blue-600/20 backdrop-blur-sm border border-blue-400/20"
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
						<span>
							{formatDate(congressDate)} - {formatDate(congressEndDate)}
						</span>
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
	);

	// Redesigned AnnualReportSlide component
	const AnnualReportSlide = () => {
		const report = reports[0];

		if (!report) return <div className="w-full h-full"></div>;

		// Function to get the path for a report page image
		const getReportPageImage = (title: string, pageNum: number) => {
			return getPageImagePath(title, pageNum);
		};

		// Function to get cover image based on report title
		const getCoverImage = (title: string) => {
			return getCoverImagePath(title);
		};

		console.log('Current report:', report);
		console.log('Cover image path:', getCoverImage(report.title));
		console.log(
			'Page image paths:',
			report.template?.map((pageNum) =>
				getReportPageImage(report.title, pageNum)
			)
		);

		return (
			<div className="w-full px-8 sm:px-12 lg:px-32 relative z-10 h-full flex items-center">
				<motion.div
					className="w-full mx-auto"
					style={{
						opacity: contentOpacity,
						y: contentY,
					}}
				>
					{/* Change layout from vertical (flex-col) to horizontal (flex-row) on md+ screens */}
					<div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-8">
						{/* Text Info Section - made slightly narrower */}
						<div className="w-full md:w-2/5 flex flex-col items-center md:items-start text-center md:text-left space-y-3 md:space-y-4">
							<div className="mb-3 sm:mb-4">
								<div className="inline-block px-4 py-1.5 mb-2 rounded-full bg-blue-600/20 backdrop-blur-sm border border-blue-400/20">
									<span className="text-sm font-medium text-white">
										{t('home.annualReports.title', 'Annual Report')}
									</span>
								</div>
								<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
									{report.title}
								</h2>
								{report.authors && (
									<p className="text-white/80 mt-1 px-2 max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-justify">
										{t('home.annualReports.by', 'By')}:{' '}
										{report.authors
											.split(',')
											.map((author) => toTitleCase(author.trim()))
											.join(', ')}
									</p>
								)}
							</div>
							<div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2 sm:mt-3">
								<Button
									size="lg"
									asChild
									className="px-4 py-2 sm:px-6 h-auto text-sm sm:text-base"
								>
									<Link href={`/reports/${report.id}`}>
										{t('home.annualReports.viewDetails', 'View Details')}
									</Link>
								</Button>
								<Button
									variant="outline"
									size="lg"
									asChild
									className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-4 py-2 sm:px-6 h-auto text-sm sm:text-base"
								>
									<Link href="/reports">
										{t('home.annualReports.viewAll', 'View All Reports')}
									</Link>
								</Button>
							</div>
						</div>

						{/* Pages Display Section - made larger and wider */}
						<div className="w-full md:w-3/5 mt-8 md:mt-0">
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.7, delay: 0.2 }}
								className="w-full overflow-hidden px-4 sm:px-0"
							>
								<div className="relative w-full h-[300px] sm:h-[450px] flex justify-center items-center">
									{/* First Page (Far Left) */}
									{report.template && report.template.length > 0 && (
										<div
											className="absolute left-[calc(50%-180px)] xs:left-[calc(50%-230px)] sm:left-[calc(50%-430px)] top-0 h-[300px] sm:h-[450px] w-[160px] sm:w-[250px] border-2 border-gray-200 bg-white transform translate-y-8 sm:translate-y-12"
											style={{
												zIndex: 1,
												boxShadow:
													'-5px 5px 15px rgba(0,0,0,0.2), 15px 15px 35px rgba(0,0,0,0.15)',
											}}
										>
											<div className="relative w-full h-full overflow-hidden">
												<Image
													src={getReportPageImage(
														report.title,
														report.template[0]
													)}
													alt={`${report.title} - Page 1`}
													fill
													className="object-cover"
													onError={(e) => {
														e.currentTarget.src = fallbackImage;
														e.currentTarget.onerror = null;
													}}
												/>
												<div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent pointer-events-none"></div>
											</div>
										</div>
									)}

									{/* Second Page (Left) */}
									{report.template && report.template.length > 1 && (
										<div
											className="absolute left-[calc(45%-120px)] xs:left-[calc(50%-160px)] sm:left-[calc(50%-300px)] top-0 h-[300px] sm:h-[450px] w-[180px] sm:w-[280px] border-2 border-gray-200 bg-white transform translate-y-4 sm:translate-y-6"
											style={{
												zIndex: 2,
												boxShadow:
													'-5px 5px 15px rgba(0,0,0,0.25), 15px 15px 30px rgba(0,0,0,0.2)',
											}}
										>
											<div className="relative w-full h-full overflow-hidden">
												<Image
													src={getReportPageImage(
														report.title,
														report.template[1]
													)}
													alt={`${report.title} - Page 2`}
													fill
													className="object-cover"
													onError={(e) => {
														e.currentTarget.src = fallbackImage;
														e.currentTarget.onerror = null;
													}}
												/>
												<div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent pointer-events-none"></div>
											</div>
										</div>
									)}

									{/* Main Cover (Center) */}
									<div
										className="absolute left-1/2 top-0 h-[300px] sm:h-[450px] w-[200px] sm:w-[320px] border-2 border-gray-200 bg-white transform -translate-x-1/2"
										style={{
											zIndex: 5,
											boxShadow:
												'0 10px 30px rgba(0,0,0,0.4), 0 15px 45px rgba(0,0,0,0.3)',
										}}
									>
										<div className="relative w-full h-full overflow-hidden">
											<Image
												src={getCoverImage(report.title)}
												alt={report.title}
												fill
												className="object-cover"
												onError={(e) => {
													e.currentTarget.src = fallbackImage;
													e.currentTarget.onerror = null;
												}}
											/>
											<div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none"></div>
										</div>
									</div>

									{/* Third Page (Right) */}
									{report.template && report.template.length > 2 && (
										<div
											className="absolute right-[calc(45%-120px)] xs:right-[calc(50%-160px)] sm:right-[calc(50%-300px)] top-0 h-[300px] sm:h-[450px] w-[180px] sm:w-[280px] border-2 border-gray-200 bg-white transform translate-y-4 sm:translate-y-6"
											style={{
												zIndex: 2,
												boxShadow:
													'5px 5px 15px rgba(0,0,0,0.25), -15px 15px 30px rgba(0,0,0,0.2)',
											}}
										>
											<div className="relative w-full h-full overflow-hidden">
												<Image
													src={getReportPageImage(
														report.title,
														report.template[2]
													)}
													alt={`${report.title} - Page 3`}
													fill
													className="object-cover"
													onError={(e) => {
														e.currentTarget.src = fallbackImage;
														e.currentTarget.onerror = null;
													}}
												/>
												<div className="absolute inset-0 bg-gradient-to-tl from-black/10 to-transparent pointer-events-none"></div>
											</div>
										</div>
									)}

									{/* Fourth Page (Far Right) */}
									{report.template && report.template.length > 3 && (
										<div
											className="absolute right-[calc(50%-180px)] xs:right-[calc(50%-230px)] sm:right-[calc(50%-430px)] top-0 h-[300px] sm:h-[450px] w-[160px] sm:w-[250px] border-2 border-gray-200 bg-white transform translate-y-8 sm:translate-y-12"
											style={{
												zIndex: 1,
												boxShadow:
													'5px 5px 15px rgba(0,0,0,0.2), -15px 15px 35px rgba(0,0,0,0.15)',
											}}
										>
											<div className="relative w-full h-full overflow-hidden">
												<Image
													src={getReportPageImage(
														report.title,
														report.template[3]
													)}
													alt={`${report.title} - Page 4`}
													fill
													className="object-cover"
													onError={(e) => {
														e.currentTarget.src = fallbackImage;
														e.currentTarget.onerror = null;
													}}
												/>
												<div className="absolute inset-0 bg-gradient-to-tl from-black/10 to-transparent pointer-events-none"></div>
											</div>
										</div>
									)}
								</div>
							</motion.div>
						</div>
					</div>
				</motion.div>
			</div>
		);
	};

	// Helper function to render book page with proper responsiveness
	const renderBookPage = (
		index: number,
		report: Report,
		extraClass: string = ''
	) => {
		const isMain = index === 2;
		const distanceFromCenter = Math.abs(index - 2);
		const zIndex = 10 - distanceFromCenter;
		const opacity = 1 - distanceFromCenter * 0.1;
		const templatePage = index === 2 ? null : index < 2 ? index : index - 3;

		// Width gets smaller on tiny screens but maintains proportions
		const width = isMain
			? 'w-[100px] xs:w-[120px] sm:w-[150px] md:w-[180px] lg:w-[200px]'
			: 'w-[80px] xs:w-[100px] sm:w-[130px] md:w-[160px] lg:w-[180px]';

		const height = isMain
			? 'h-[150px] xs:h-[180px] sm:h-[220px] md:h-[270px] lg:h-[300px]'
			: 'h-[130px] xs:h-[160px] sm:h-[200px] md:h-[250px] lg:h-[280px]';

		// Closer positioning on small screens
		const offsetX =
			distanceFromCenter === 0
				? 0
				: distanceFromCenter === 1
				? index < 2
					? -25
					: 25
				: index < 2
				? -50
				: 50;

		const rotateY =
			distanceFromCenter === 0
				? 0
				: distanceFromCenter === 1
				? index < 2
					? 15
					: -15
				: index < 2
				? 25
				: -25;

		return (
			<div
				key={index}
				className={`absolute ${width} ${height} ${extraClass} rounded-sm overflow-hidden border-2 border-gray-200 bg-white shadow-lg transition-transform duration-500`}
				style={{
					zIndex,
					opacity,
					transform: `translateX(${offsetX}%) rotateY(${rotateY}deg) scale(${
						1 - distanceFromCenter * 0.1
					})`,
					boxShadow: isMain
						? '0 10px 25px rgba(0,0,0,0.4), 0 15px 45px rgba(0,0,0,0.3)'
						: `0 5px 15px rgba(0,0,0,0.25), 0 10px 25px rgba(0,0,0,0.2)`,
				}}
			>
				<div className="relative w-full h-full overflow-hidden">
					{isMain ? (
						<FallbackImage
							src={getCoverImagePath(report.title)}
							alt={report.title}
							fallbackSrc={fallbackImage}
							fill
							className="object-cover"
						/>
					) : (
						<FallbackImage
							src={getPageImagePath(
								report.title,
								report.template &&
									templatePage !== null &&
									report.template.length > Math.abs(templatePage)
									? report.template[Math.abs(templatePage)]
									: 0
							)}
							alt={`${report.title} - Page ${index + 1}`}
							fallbackSrc={fallbackImage}
							fill
							className="object-cover"
						/>
					)}
					<div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent pointer-events-none"></div>
					{isMain && report.year && (
						<div className="absolute top-2 right-2 bg-blue-600 text-white p-1 xs:p-1.5 rounded-full text-xs font-medium shadow-lg">
							{report.year}
						</div>
					)}
				</div>
			</div>
		);
	};

	// Effect to optimize the background animations
	useEffect(() => {
		// Use requestAnimationFrame for smoother animations
		const optimizeAnimations = () => {
			const slide1Bg = document.querySelector('.slide1-bg') as HTMLElement;
			const slide2Bg = document.querySelector('.slide2-bg') as HTMLElement;

			if (slide1Bg && slide2Bg) {
				// Apply hardware acceleration
				slide1Bg.style.transform = 'translateZ(0)';
				slide2Bg.style.transform = 'translateZ(0)';

				// Pre-paint elements to avoid layout thrashing
				slide1Bg.style.willChange = 'opacity, transform';
				slide2Bg.style.willChange = 'opacity, transform';

				// Force browser to acknowledge these properties
				window.getComputedStyle(slide1Bg).opacity;
				window.getComputedStyle(slide2Bg).opacity;
			}
		};

		// Run optimization once after component mounts
		optimizeAnimations();

		// Clean up
		return () => {
			const slide1Bg = document.querySelector('.slide1-bg') as HTMLElement;
			const slide2Bg = document.querySelector('.slide2-bg') as HTMLElement;

			if (slide1Bg && slide2Bg) {
				slide1Bg.style.willChange = 'auto';
				slide2Bg.style.willChange = 'auto';
			}
		};
	}, []);

	// Effect to handle slider navigation with keyboard
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') {
				sliderRef.current?.slickPrev();
			} else if (e.key === 'ArrowRight') {
				sliderRef.current?.slickNext();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	return (
		<section className="relative top-0 left-0 w-full h-screen min-h-[600px] sm:min-h-[700px] flex items-center overflow-hidden">
			{/* Parallax Background Image with 3D effect and blur */}
			<motion.div className="absolute inset-0 z-0" style={{ y: backgroundY }}>
				<div className="absolute inset-0 backdrop-blur-md bg-black/30 z-10"></div>
				<Image
					src="/images/hero-background.png"
					alt={t('home.hero.backgroundAlt')}
					fill
					className="object-fill brightness-75"
					priority
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/80 mix-blend-multiply gradient-overlay transition-colors duration-1000" />
			</motion.div>

			{/* Background light elements for slides */}
			<div className="absolute inset-0 z-0 slide1-bg transition-opacity duration-1000">
				{/* Light elements for slide 1 */}
				<motion.div
					className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-white/20 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.2, 0.4, 0.2],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						repeatType: 'reverse',
					}}
				/>
				<motion.div
					className="absolute bottom-1/3 left-1/4 w-96 h-96 rounded-full bg-white/15 blur-3xl"
					animate={{
						scale: [1, 1.1, 1],
						opacity: [0.1, 0.3, 0.1],
					}}
					transition={{
						duration: 10,
						repeat: Infinity,
						repeatType: 'reverse',
						delay: 1,
					}}
				/>
				<motion.div
					className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full bg-white/10 blur-3xl"
					animate={{
						scale: [1, 1.15, 1],
						opacity: [0.1, 0.25, 0.1],
					}}
					transition={{
						duration: 9,
						repeat: Infinity,
						repeatType: 'reverse',
						delay: 0.5,
					}}
				/>
			</div>

			<div className="absolute inset-0 z-0 slide2-bg opacity-0 transition-opacity duration-1000">
				{/* Light elements for slide 2 */}
				<motion.div
					className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-white/20 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.15, 0.35, 0.15],
					}}
					transition={{
						duration: 10,
						repeat: Infinity,
						repeatType: 'reverse',
					}}
				/>
				<motion.div
					className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-white/15 blur-3xl"
					animate={{
						scale: [1, 1.3, 1],
						opacity: [0.1, 0.3, 0.1],
					}}
					transition={{
						duration: 12,
						repeat: Infinity,
						repeatType: 'reverse',
						delay: 0.7,
					}}
				/>
				<motion.div
					className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-white/10 blur-3xl"
					animate={{
						scale: [1, 1.25, 1],
						opacity: [0.05, 0.2, 0.05],
					}}
					transition={{
						duration: 14,
						repeat: Infinity,
						repeatType: 'reverse',
						delay: 1.2,
					}}
				/>
			</div>

			{/* Carousel */}
			<div className="w-full h-full relative z-10">
				<Slider ref={sliderRef} {...settings} className="h-full hero-carousel">
					{/* Slide 1 - Congress Information */}
					<CongressSlide />

					{/* Slide 2 - Annual Report */}
					<AnnualReportSlide />
				</Slider>
			</div>

			{/* Unified bottom control bar */}
			<div className="absolute bottom-6 left-0 right-0 z-30 flex flex-col items-center">
				{/* Slide name indicator */}
				<div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm text-white text-sm font-medium mb-4">
					{activeSlide === 0 && t('home.hero.slide1', 'Congress Information')}
					{activeSlide === 1 && t('home.hero.slide3', 'Annual Report')}
				</div>

				{/* Controls row */}
				<div className="flex items-center gap-4 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm">
					{/* Prev button */}
					<button
						onClick={() => sliderRef.current?.slickPrev()}
						className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-all duration-300"
						aria-label="Previous slide"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M15 18l-6-6 6-6" />
						</svg>
					</button>

					{/* Slide counter */}
					<div className="text-white text-xs font-medium mx-1">
						{activeSlide + 1} / 2
					</div>

					{/* Next button */}
					<button
						onClick={() => sliderRef.current?.slickNext()}
						className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-all duration-300"
						aria-label="Next slide"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M9 18l6-6-6-6" />
						</svg>
					</button>
				</div>
			</div>

			{/* Carousel styling */}
			<style jsx global>{`
				.slick-slider,
				.slick-list,
				.slick-track {
					height: 100%;
				}
				.slick-slide > div {
					height: 100%;
				}
				.slick-slide {
					perspective: 1000px;
					transform-style: preserve-3d;
				}
				.slick-slide[aria-hidden='true'] {
					transform: scale(0.9) rotateY(10deg);
					opacity: 0;
					transition: all 0.5s cubic-bezier(0.7, 0, 0.3, 1);
				}
				.custom-dots {
					display: none !important;
				}
				.perspective-1000 {
					perspective: 1000px;
					transform-style: preserve-3d;
				}

				/* True infinite loop styles */
				.hero-carousel .slick-track {
					display: flex;
					flex-direction: row;
				}

				.hero-carousel .slick-slide {
					transition: transform 800ms cubic-bezier(0.65, 0, 0.35, 1),
						opacity 800ms cubic-bezier(0.65, 0, 0.35, 1);
					will-change: transform, opacity;
				}

				/* Make both directions consistent */
				.hero-carousel .slick-slide:not(.slick-active) {
					opacity: 0;
					pointer-events: none;
				}

				/* Ensure all slides come from the same direction when looping */
				.hero-carousel .slick-current + .slick-slide[aria-hidden='true'],
				.hero-carousel .slick-cloned[aria-hidden='true'] {
					transform: scale(0.9) translateX(10%) rotateY(10deg) !important;
				}

				.hero-carousel .slick-current ~ .slick-slide[aria-hidden='true'] {
					transform: scale(0.9) translateX(10%) rotateY(10deg) !important;
				}

				.hero-carousel
					.slick-slide[aria-hidden='true']:not(.slick-cloned)
					+ .slick-active {
					animation: slideFromRight 800ms cubic-bezier(0.65, 0, 0.35, 1)
						forwards;
				}

				@keyframes slideFromRight {
					from {
						transform: scale(0.9) translateX(10%) rotateY(10deg);
						opacity: 0;
					}
					to {
						transform: scale(1) translateX(0) rotateY(0deg);
						opacity: 1;
					}
				}

				/* Add extra small breakpoint */
				@media (min-width: 480px) {
					.xs\:block {
						display: block;
					}
					.xs\:w-\[100px\] {
						width: 100px;
					}
					.xs\:w-\[120px\] {
						width: 120px;
					}
					.xs\:h-\[160px\] {
						height: 160px;
					}
					.xs\:h-\[180px\] {
						height: 180px;
					}
					.xs\:h-\[220px\] {
						height: 220px;
					}
					.xs\:p-1\.5 {
						padding: 0.375rem;
					}
					.xs\:px-4 {
						padding-left: 1rem;
						padding-right: 1rem;
					}
					.xs\:px-6 {
						padding-left: 1.5rem;
						padding-right: 1.5rem;
					}
					.xs\:text-sm {
						font-size: 0.875rem;
					}
					.xs\:text-2xl {
						font-size: 1.5rem;
					}
				}

				/* Small screen offset adjustment */
				@media (max-width: 479px) {
					.book-page {
						transform: translateX(var(--smaller-offset-x))
							rotateY(var(--rotate-y)) scale(var(--scale)) !important;
					}
				}
			`}</style>
		</section>
	);
}
