'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
	ChevronLeft,
	ChevronRight,
	Download,
	Maximize2,
	Minimize2,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { useEffect, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Button } from './Button';

pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.mjs`;

interface FlipbookPDFViewerProps {
	pdfUrl: string | string[];
	bookMode?: boolean;
	height?: string;
}

const FlipbookPDFViewer: React.FC<FlipbookPDFViewerProps> = ({
	pdfUrl,
	bookMode = true,
	height,
}) => {
	const [pages, setPages] = useState<string[]>([]);
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
		'landscape'
	);
	const bookRef = useRef<any>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const pdfUrls = Array.isArray(pdfUrl) ? pdfUrl : [pdfUrl];

	useEffect(() => {
		const loadPDF = async () => {
			try {
				setIsLoading(true);
				let allPages: string[] = [];
				let totalPagesCount = 0;

				// Load all PDFs in sequence
				for (const url of pdfUrls) {
					const loadingTask = pdfjsLib.getDocument(url);
					const pdf = await loadingTask.promise;
					const numPages = pdf.numPages;
					totalPagesCount += numPages;

					// Render each page of the current PDF
					for (let i = 1; i <= numPages; i++) {
						const page = await pdf.getPage(i);
						const viewport = page.getViewport({ scale: 2.5 });
						const canvas = document.createElement('canvas');
						const context = canvas.getContext('2d');
						if (!context) continue;
						canvas.height = viewport.height;
						canvas.width = viewport.width;

						await page.render({ canvasContext: context, viewport }).promise;
						allPages.push(canvas.toDataURL());
					}
				}

				setTotalPages(totalPagesCount);

				// If in book mode and we have an odd number of pages, add a blank page
				if (bookMode && allPages.length % 2 !== 0) {
					allPages.push('blank');
				}

				setPages(allPages);
				setIsLoading(false);
			} catch (err) {
				console.error('Error loading PDF:', err);
				setIsLoading(false);
			}
		};

		loadPDF();
	}, [pdfUrl, pdfUrls, bookMode]);

	useEffect(() => {
		const updateOrientation = () => {
			setOrientation(
				window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
			);
		};

		updateOrientation();
		window.addEventListener('resize', updateOrientation);
		return () => window.removeEventListener('resize', updateOrientation);
	}, []);

	const handleNext = () => {
		if (bookMode && bookRef.current) {
			bookRef.current.pageFlip().flipNext();
			setCurrentPage((prev) => Math.min(prev + 2, totalPages - 1));
		} else {
			setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
		}
	};

	const handlePrev = () => {
		if (bookMode && bookRef.current) {
			bookRef.current.pageFlip().flipPrev();
			setCurrentPage((prev) => Math.max(prev - 2, 0));
		} else {
			setCurrentPage((prev) => Math.max(prev - 1, 0));
		}
	};

	const toggleFullscreen = async () => {
		try {
			if (!document.fullscreenElement) {
				await containerRef.current?.requestFullscreen();
				setIsFullscreen(true);
			} else {
				await document.exitFullscreen();
				// Small delay to ensure proper z-index reset
				setTimeout(() => {
					setIsFullscreen(false);
				}, 100);
			}
		} catch (err) {
			console.error('Error toggling fullscreen:', err);
		}
	};

	const onPageFlip = (e: any) => {
		setCurrentPage(e.data);
	};

	if (isLoading) {
		return (
			<div
				className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-xl"
				style={height ? { height } : undefined}
			>
				<div className="flex flex-col items-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
					<p className="text-gray-600 dark:text-gray-300">Loading PDF...</p>
				</div>
			</div>
		);
	}

	const bookDimensions = {
		landscape: {
			width: 600,
			height: 800,
		},
		portrait: {
			width: 500,
			height: 650,
		},
	};

	// For single page mode (non-book mode)
	const renderSinglePage = () => {
		if (pages.length === 0) return null;

		return (
			<div className="relative max-w-full max-h-full flex justify-center items-center">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					key={currentPage}
					className="relative max-w-full max-h-full"
				>
					<img
						src={pages[currentPage]}
						alt={`Page ${currentPage + 1}`}
						className="max-w-full max-h-[calc(100vh-10rem)] object-contain mx-auto shadow-lg"
					/>
				</motion.div>

				<div className="absolute left-4 top-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-110">
					<Button
						variant="ghost"
						size="icon"
						onClick={handlePrev}
						disabled={currentPage === 0}
						className="rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
					>
						<ChevronLeft className="h-6 w-6" />
					</Button>
				</div>

				<div className="absolute right-4 top-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-110">
					<Button
						variant="ghost"
						size="icon"
						onClick={handleNext}
						disabled={currentPage === pages.length - 1}
						className="rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
					>
						<ChevronRight className="h-6 w-6" />
					</Button>
				</div>
			</div>
		);
	};

	// For book mode
	const renderBookMode = () => {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="relative"
				style={{ zIndex: 1 }}
			>
				<HTMLFlipBook
					width={bookDimensions[orientation].width}
					height={bookDimensions[orientation].height}
					size="stretch"
					minWidth={400}
					maxWidth={1200}
					minHeight={500}
					maxHeight={1400}
					showCover={false}
					drawShadow={true}
					flippingTime={800}
					usePortrait={orientation === 'portrait'}
					startPage={0}
					startZIndex={10}
					autoSize={true}
					maxShadowOpacity={0.7}
					mobileScrollSupport={true}
					clickEventForward={true}
					useMouseEvents={true}
					swipeDistance={0}
					showPageCorners={true}
					disableFlipByClick={false}
					style={{ margin: '0 auto' }}
					ref={bookRef}
					onFlip={onPageFlip}
					className="mx-auto shadow-2xl [perspective:1000px]"
				>
					{pages.map((pageSrc, index) => (
						<motion.div
							key={index}
							className="page bg-white dark:bg-gray-800 relative overflow-hidden"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.3 }}
						>
							{pageSrc === 'blank' ? (
								<div className="w-full h-full bg-gray-100 dark:bg-gray-700" />
							) : (
								<>
									<motion.img
										src={pageSrc}
										alt={`Page ${index + 1}`}
										className="w-full h-full object-contain"
										draggable={false}
										initial={{ scale: 1.1, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										transition={{ duration: 0.3, ease: 'easeOut' }}
									/>
									<div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_0_30px_rgba(0,0,0,0.3)]" />
								</>
							)}
						</motion.div>
					))}
				</HTMLFlipBook>

				<div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 transition-transform duration-200 hover:scale-110">
					<Button
						variant="ghost"
						size="icon"
						onClick={handlePrev}
						disabled={currentPage === 0}
						className="rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
					>
						<ChevronLeft className="h-6 w-6" />
					</Button>
				</div>

				<div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 transition-transform duration-200 hover:scale-110">
					<Button
						variant="ghost"
						size="icon"
						onClick={handleNext}
						disabled={currentPage >= totalPages - 1}
						className="rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
					>
						<ChevronRight className="h-6 w-6" />
					</Button>
				</div>
			</motion.div>
		);
	};

	return (
		<div
			ref={containerRef}
			className={`relative ${
				isFullscreen
					? 'fixed inset-0 bg-white dark:bg-gray-900 z-[9999]'
					: 'bg-gray-100 dark:bg-gray-800 rounded-xl'
			}`}
			style={{
				isolation: 'isolate',
				...(height && !isFullscreen ? { height } : {}),
			}}
		>
			<div className="absolute top-4 right-4 z-10 flex space-x-2">
				<Button
					variant="ghost"
					size="icon"
					onClick={toggleFullscreen}
					className="rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
				>
					{isFullscreen ? (
						<Minimize2 className="h-5 w-5" />
					) : (
						<Maximize2 className="h-5 w-5" />
					)}
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => window.open(pdfUrls[0], '_blank')}
					className="rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
				>
					<Download className="h-5 w-5" />
				</Button>
			</div>

			<div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
				<div className="text-sm text-gray-600 dark:text-gray-300">
					Page {currentPage + 1} of {totalPages}
				</div>
			</div>

			<div
				className={`flex items-center justify-center p-4 ${
					isFullscreen ? 'h-[calc(100vh-8rem)]' : 'h-[800px]'
				}`}
			>
				<AnimatePresence mode="wait">
					{bookMode ? renderBookMode() : renderSinglePage()}
				</AnimatePresence>
			</div>
		</div>
	);
};

export default FlipbookPDFViewer;
