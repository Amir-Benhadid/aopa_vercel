import { AnimatePresence, motion } from 'framer-motion';
import {
	ChevronLeft,
	ChevronRight,
	Download,
	Maximize2,
	Minimize2,
	ZoomIn,
	ZoomOut,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HTMLFlipBook from 'react-pageflip';
import { Button } from './Button';

// Add global styles for scrollbar hiding
const hideScrollbarStyles = `
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;     /* Firefox */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;             /* Chrome, Safari, Opera */
}
`;

// Add styles to document head
if (typeof document !== 'undefined') {
	const styleElement = document.createElement('style');
	styleElement.textContent = hideScrollbarStyles;
	document.head.appendChild(styleElement);
}

pdfjsLib.GlobalWorkerOptions.workerSrc = `/js/pdf.worker.mjs`;

interface FlipbookPDFViewerProps {
	pdfUrl: string | string[];
	bookMode?: boolean;
}

const FlipbookPDFViewer: React.FC<FlipbookPDFViewerProps> = ({
	pdfUrl,
	bookMode = true,
}) => {
	const { t } = useTranslation();
	const [pages, setPages] = useState<string[]>([]);
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [loadingError, setLoadingError] = useState<string | null>(null);
	const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
		'landscape'
	);
	const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
	const [zoom, setZoom] = useState(1);
	const [isBookReady, setIsBookReady] = useState(false);
	const [activeDoc, setActiveDoc] = useState<string>(
		Array.isArray(pdfUrl) && pdfUrl.length > 0 ? pdfUrl[0] : (pdfUrl as string)
	);

	const bookRef = useRef<any>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Update orientation and mobile state on window resize
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
			setOrientation(
				window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
			);
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// When pdfUrl changes, update the active document
	useEffect(() => {
		const newActiveDoc =
			Array.isArray(pdfUrl) && pdfUrl.length > 0
				? pdfUrl[0]
				: (pdfUrl as string);

		if (newActiveDoc !== activeDoc) {
			setActiveDoc(newActiveDoc);
		}
	}, [pdfUrl]);

	// Reset state when active document changes
	useEffect(() => {
		setPages([]);
		setCurrentPage(0);
		setTotalPages(0);
		setIsLoading(true);
		setLoadingError(null);
		setIsBookReady(false);
	}, [activeDoc]);

	// Load PDF and render pages
	useEffect(() => {
		if (!activeDoc) return;

		const loadPDF = async () => {
			try {
				setIsLoading(true);
				setLoadingError(null);

				// Validate PDF URL first
				const response = await fetch(activeDoc, { method: 'HEAD' });
				if (!response.ok) {
					throw new Error(`PDF not found at ${activeDoc}`);
				}

				// Load PDF document
				const loadingTask = pdfjsLib.getDocument(activeDoc);

				// Add loading task error handler
				loadingTask.onPassword = (
					callback: (password: string) => void,
					reason: number
				) => {
					callback(''); // Pass empty password
					setLoadingError('PDF is password protected');
				};

				const pdf = await loadingTask.promise;
				const numPages = pdf.numPages;
				if (numPages === 0) {
					throw new Error('PDF has no pages');
				}

				setTotalPages(numPages);
				const renderedPages: string[] = [];

				// Render each page to a canvas
				for (let i = 1; i <= numPages; i++) {
					const page = await pdf.getPage(i);
					const viewport = page.getViewport({ scale: 2.5 });
					const canvas = document.createElement('canvas');
					const context = canvas.getContext('2d');
					if (!context) {
						console.warn(`Could not get canvas context for page ${i}`);
						continue;
					}
					canvas.height = viewport.height;
					canvas.width = viewport.width;

					try {
						await page.render({ canvasContext: context, viewport }).promise;
						renderedPages.push(canvas.toDataURL());
					} catch (renderErr) {
						console.error(`Error rendering page ${i}:`, renderErr);
						// Add a placeholder for failed page
						renderedPages.push('error');
					}
				}

				// Only add a blank page for desktop non-mobile view to ensure an even number of pages
				if (bookMode && !isMobile && renderedPages.length % 2 !== 0) {
					renderedPages.push('blank');
				}

				setPages(renderedPages);

				// Give the DOM time to update before marking the book as ready
				setTimeout(() => {
					setIsBookReady(true);
					setIsLoading(false);
				}, 300);
			} catch (err) {
				console.error('Error loading PDF:', err);
				setLoadingError(
					err instanceof Error ? err.message : 'Failed to load PDF'
				);
				setIsLoading(false);
			}
		};

		loadPDF();
	}, [activeDoc, isMobile, bookMode]);

	const handleNext = () => {
		if (bookRef.current && isBookReady) {
			bookRef.current.pageFlip().flipNext();
			setCurrentPage((prev) =>
				Math.min(prev + (isMobile ? 1 : 2), totalPages - 1)
			);
		}
	};

	const handlePrev = () => {
		if (bookRef.current && isBookReady) {
			bookRef.current.pageFlip().flipPrev();
			setCurrentPage((prev) => Math.max(prev - (isMobile ? 1 : 2), 0));
		}
	};

	const toggleFullscreen = async () => {
		try {
			if (!document.fullscreenElement) {
				await containerRef.current?.requestFullscreen();
				setIsFullscreen(true);
			} else {
				await document.exitFullscreen();
				setTimeout(() => {
					setIsFullscreen(false);
				}, 100);
			}
		} catch (err) {
			console.error('Error toggling fullscreen:', err);
		}
	};

	const handleZoomIn = () => {
		setZoom((prev) => Math.min(prev + 0.1, 2));
	};

	const handleZoomOut = () => {
		setZoom((prev) => Math.max(prev - 0.1, 0.5));
	};

	const onPageFlip = (e: any) => {
		setCurrentPage(e.data);
	};

	// Handle switching between multiple PDFs
	const switchDocument = (docUrl: string) => {
		if (docUrl !== activeDoc) {
			setActiveDoc(docUrl);
		}
	};

	// Handle switching between document types (poster/program)
	const switchDocumentType = (type: string) => {
		if (Array.isArray(pdfUrl)) {
			// Find the first URL matching the requested type
			const matchingUrl = pdfUrl.find((url) => {
				const fileName = url.split('/').pop()?.split('.')[0] || '';
				const fileType =
					fileName === 'affiche'
						? 'poster'
						: fileName === 'programme'
						? 'program'
						: fileName;
				return fileType === type;
			});

			if (matchingUrl && matchingUrl !== activeDoc) {
				setActiveDoc(matchingUrl);
			}
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-xl">
				<div className="flex flex-col items-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
					<p className="text-gray-600 dark:text-gray-300">
						{t('pdf.loading', 'Loading PDF...')}
					</p>
				</div>
			</div>
		);
	}

	if (loadingError) {
		return (
			<div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-xl">
				<div className="flex flex-col items-center text-center max-w-md px-4">
					<div className="text-red-500 mb-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-12 w-12"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<p className="text-gray-800 dark:text-gray-200 font-medium mb-2">
						{t('pdf.errorTitle', 'Error Loading PDF')}
					</p>
					<p className="text-gray-600 dark:text-gray-300 text-sm">
						{loadingError}
					</p>
					<Button
						variant="outline"
						size="sm"
						className="mt-4"
						onClick={() => window.open(activeDoc, '_blank')}
					>
						<Download className="w-4 h-4 mr-2" />
						{t('pdf.downloadInstead', 'Download Instead')}
					</Button>
				</div>
			</div>
		);
	}

	if (pages.length === 0) {
		return (
			<div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-xl">
				<div className="flex flex-col items-center">
					<p className="text-gray-600 dark:text-gray-300">
						{t('pdf.noPages', 'No pages found in PDF')}
					</p>
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

	// Define mobile dimensions – adjust as needed.
	const mobileDimensions = {
		width: Math.min(window.innerWidth * 0.9, 350),
		height: Math.min(window.innerHeight * 0.8, 500),
	};

	// Calculate base dimensions and then apply the zoom factor.
	const baseDimensions = isMobile
		? mobileDimensions
		: bookDimensions[orientation];
	const flipbookDimensions = {
		width: baseDimensions.width * zoom,
		height: baseDimensions.height * zoom,
	};

	// Check if we have multiple PDFs to display
	const hasMultipleDocs = Array.isArray(pdfUrl) && pdfUrl.length > 1;

	return (
		<div
			ref={containerRef}
			className={`relative ${
				isFullscreen
					? 'fixed inset-0 bg-white dark:bg-gray-900 z-[9999]'
					: 'bg-gray-100 dark:bg-gray-800 rounded-xl'
			}`}
			style={{ isolation: 'isolate' }}
		>
			{/* Top bar with page counter, document selector, and controls */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
				<div className="flex items-center flex-wrap gap-2 w-full md:w-auto mb-2 md:mb-0">
					{/* Document selector tabs for multiple PDFs */}
					{hasMultipleDocs && (
						<div className="flex space-x-1 w-full md:w-auto overflow-x-auto hide-scrollbar md:mr-4">
							{/* Deduplicate the files by getting unique display names */}
							{Array.from(
								new Set(
									(pdfUrl as string[]).map((url) => {
										const fileName = url.split('/').pop()?.split('.')[0] || '';
										return fileName === 'affiche'
											? 'poster'
											: fileName === 'programme'
											? 'program'
											: fileName;
									})
								)
							).map((displayType) => {
								// Find the first URL that matches this type
								const url =
									(pdfUrl as string[]).find((u) => {
										const fileName = u.split('/').pop()?.split('.')[0] || '';
										const fileType =
											fileName === 'affiche'
												? 'poster'
												: fileName === 'programme'
												? 'program'
												: fileName;
										return fileType === displayType;
									}) || '';

								const displayName =
									displayType === 'poster'
										? t('pdf.poster', 'Poster')
										: displayType === 'program'
										? t('pdf.program', 'Program')
										: displayType;

								// Check if any URL matching this type is active
								const isActive = (pdfUrl as string[]).some((u) => {
									const fileName = u.split('/').pop()?.split('.')[0] || '';
									const fileType =
										fileName === 'affiche'
											? 'poster'
											: fileName === 'programme'
											? 'program'
											: fileName;
									return fileType === displayType && u === activeDoc;
								});

								return (
									<button
										key={displayType}
										onClick={() => switchDocumentType(displayType)}
										className={`px-4 py-1.5 md:py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
											!isMobile ? '' : 'flex-1'
										} ${
											isActive
												? 'bg-primary-500 text-white shadow-md'
												: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
										}`}
									>
										{displayName}
									</button>
								);
							})}
						</div>
					)}

					<div className="text-sm text-gray-600 dark:text-gray-300">
						{t('pdf.pageCounter', 'Page {{current}} of {{total}}', {
							current: currentPage + 1,
							total: totalPages,
						})}
					</div>
				</div>

				<div className="flex gap-1 md:gap-2 justify-end w-full md:w-auto">
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 md:h-auto md:w-auto md:p-2"
						onClick={() => window.open(activeDoc, '_blank')}
						title={t('pdf.download', 'Download')}
					>
						<Download className="w-4 h-4 md:mr-2" />
						<span className="hidden md:inline">
							{t('pdf.download', 'Download')}
						</span>
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 md:h-auto md:w-auto md:p-2"
						onClick={toggleFullscreen}
						title={
							isFullscreen
								? t('pdf.exitFullscreen', 'Exit fullscreen')
								: t('pdf.fullscreen', 'Fullscreen')
						}
					>
						{isFullscreen ? (
							<>
								<Minimize2 className="w-4 h-4 md:mr-2" />
								<span className="hidden md:inline">
									{t('pdf.exitFullscreen', 'Exit fullscreen')}
								</span>
							</>
						) : (
							<>
								<Maximize2 className="w-4 h-4 md:mr-2" />
								<span className="hidden md:inline">
									{t('pdf.fullscreen', 'Fullscreen')}
								</span>
							</>
						)}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 md:h-auto md:w-auto md:p-2"
						onClick={handleZoomOut}
						title={t('pdf.zoomOut', 'Zoom out')}
					>
						<ZoomOut className="w-4 h-4 md:mr-2" />
						<span className="hidden md:inline">
							{t('pdf.zoomOut', 'Zoom out')}
						</span>
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 md:h-auto md:w-auto md:p-2"
						onClick={handleZoomIn}
						title={t('pdf.zoomIn', 'Zoom in')}
					>
						<ZoomIn className="w-4 h-4 md:mr-2" />
						<span className="hidden md:inline">
							{t('pdf.zoomIn', 'Zoom in')}
						</span>
					</Button>
				</div>
			</div>

			<div
				className={`flex items-center justify-center p-2 ${
					isFullscreen ? 'h-[calc(100vh-8rem)]' : ''
				}`}
			>
				{isBookReady && (
					<AnimatePresence>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className={`relative ${isFullscreen ? 'w-[60%]' : 'w-full'}`}
							style={{ zIndex: 1 }}
						>
							<HTMLFlipBook
								width={flipbookDimensions.width}
								height={flipbookDimensions.height}
								size="stretch"
								minWidth={300}
								maxWidth={1200}
								minHeight={400}
								maxHeight={1400}
								showCover={false}
								drawShadow={true}
								flippingTime={800}
								usePortrait={isMobile || orientation === 'portrait'}
								startPage={0}
								startZIndex={10}
								autoSize={true}
								maxShadowOpacity={0.7}
								mobileScrollSupport={true}
								clickEventForward={true}
								useMouseEvents={!isMobile}
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
										) : pageSrc === 'error' ? (
											<div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
												<p className="text-gray-500 dark:text-gray-400 text-sm">
													{t('pdf.pageError', 'Error loading page')}
												</p>
											</div>
										) : (
											<>
												<motion.img
													src={pageSrc}
													alt={t('pdf.pageAlt', 'Page {{number}}', {
														number: index + 1,
													})}
													className="w-full h-full object-contain"
													draggable={false}
													initial={{ scale: 1.1, opacity: 0 }}
													animate={{ scale: 1, opacity: 1 }}
													transition={{ duration: 0.3, ease: 'easeOut' }}
													loading="eager"
												/>
												<div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_0_30px_rgba(0,0,0,0.3)]" />
											</>
										)}
									</motion.div>
								))}
							</HTMLFlipBook>
						</motion.div>
					</AnimatePresence>
				)}

				{!isBookReady && pages.length > 0 && (
					<div className="flex items-center justify-center h-96 w-full">
						<div className="flex flex-col items-center">
							<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
							<p className="text-gray-600 dark:text-gray-300">
								{t('pdf.preparing', 'Preparing flipbook...')}
							</p>
						</div>
					</div>
				)}
			</div>

			{/* Bottom navigation with Next and Previous buttons */}
			<div className="flex justify-center items-center p-2 md:p-4 border-t border-gray-200 dark:border-gray-700">
				<div className="flex items-center gap-2 md:gap-4">
					<Button
						variant="outline"
						size="sm"
						className="h-8 px-2 text-xs md:h-auto md:px-3 md:py-2 md:text-sm"
						onClick={handlePrev}
						disabled={currentPage === 0 || !isBookReady}
					>
						<ChevronLeft className="w-4 h-4 mr-1 md:mr-2" />
						<span className="hidden xs:inline md:inline">
							{t('pdf.previous', 'Previous')}
						</span>
					</Button>
					<span className="text-xs md:text-sm text-gray-600 dark:text-gray-300 min-w-[60px] md:min-w-[80px] text-center">
						{t('pdf.bookPageCounter', '{{current}} of {{total}}', {
							current: isMobile
								? currentPage + 1
								: Math.ceil((currentPage + 1) / 2),
							total: isMobile ? totalPages : Math.ceil(totalPages / 2),
						})}
					</span>
					<Button
						variant="outline"
						size="sm"
						className="h-8 px-2 text-xs md:h-auto md:px-3 md:py-2 md:text-sm"
						onClick={handleNext}
						disabled={currentPage >= totalPages - 1 || !isBookReady}
					>
						<span className="hidden xs:inline md:inline">
							{t('pdf.next', 'Next')}
						</span>
						<ChevronRight className="w-4 h-4 ml-1 md:ml-2" />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default FlipbookPDFViewer;
