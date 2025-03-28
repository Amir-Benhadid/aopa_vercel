'use client';

import { FileText, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FlipbookPDFViewer from './pdfViewer';

interface LimitedPdfViewerProps {
	pdfUrl: string;
	pageLimit?: number;
	height?: string;
}

export default function LimitedPdfViewer({
	pdfUrl,
	pageLimit = 20,
	height = '800px',
}: LimitedPdfViewerProps) {
	const { t } = useTranslation();
	const [currentPage, setCurrentPage] = useState(0);
	const [showRestricted, setShowRestricted] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loadingProgress, setLoadingProgress] = useState<number>(0);
	const [isLoading, setIsLoading] = useState(true);

	// Monitor for page changes to show restriction message
	useEffect(() => {
		if (currentPage >= pageLimit - 1) {
			setShowRestricted(true);
		}
	}, [currentPage, pageLimit]);

	// Handle page change from PDF viewer
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	// Track loading progress
	const handleLoadingProgress = (progress: number) => {
		setLoadingProgress(progress);
	};

	// Handle loading state change
	const handleLoadingState = (loading: boolean) => {
		setIsLoading(loading);
	};

	// Handle PDF load error
	const handleError = (err: string) => {
		console.error('PDF Viewer Error:', err);
		setError(err);
	};

	// For loading state
	if (isLoading && loadingProgress < 100) {
		return (
			<div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex flex-col items-center justify-center p-8 text-center">
				<div className="w-16 h-16 border-4 border-gray-300 border-t-primary-500 rounded-full animate-spin mb-6"></div>
				<h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
					{t('reports.loadingPreview', 'Loading Preview')}
				</h3>
				<p className="text-gray-600 dark:text-gray-400 mb-4">
					{t('reports.loadingPages', 'Loading first {{pageLimit}} pages...', {
						pageLimit,
					})}
				</p>
				{loadingProgress > 0 && (
					<div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
						<div
							className="h-full bg-primary-500 transition-all duration-300 ease-out"
							style={{ width: `${Math.min(loadingProgress, 100)}%` }}
						></div>
					</div>
				)}
				<p className="text-sm text-gray-500 mt-2">
					{loadingProgress > 0
						? `${Math.min(Math.round(loadingProgress), 100)}%`
						: t('reports.preparingDocument', 'Preparing document...')}
				</p>
			</div>
		);
	}

	// If error
	if (error) {
		return (
			<div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex flex-col items-center justify-center p-8 text-center">
				<FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-6" />
				<h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
					{t('reports.previewNotAvailable', 'Preview Not Available')}
				</h3>
				<p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
					{t(
						'reports.previewNotAvailableMessage',
						'The preview for this report is not available.'
					)}
				</p>
			</div>
		);
	}

	return (
		<div className="relative">
			<FlipbookPDFViewer
				pdfUrl={pdfUrl}
				bookMode={true}
				height={height}
				maxPages={pageLimit} // Only load up to pageLimit pages
				onPageChange={handlePageChange}
				onError={handleError}
				onLoadingProgress={handleLoadingProgress}
				onLoadingState={handleLoadingState}
			/>

			{/* Restricted Access Overlay that appears on page limit */}
			{showRestricted && (
				<div
					className="absolute inset-0 pointer-events-none"
					style={{ zIndex: 20 }}
				>
					<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/90"></div>
					<div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center p-8 text-center pointer-events-auto">
						<div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl max-w-lg">
							<Lock className="w-16 h-16 text-primary-500 mx-auto mb-6" />
							<h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
								{t('reports.previewLimit', 'Preview Limit Reached')}
							</h3>
							<p className="text-gray-600 dark:text-gray-400 mb-8">
								{t(
									'reports.previewLimitMessage',
									'Only the first 20 pages are available in preview mode.'
								)}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
