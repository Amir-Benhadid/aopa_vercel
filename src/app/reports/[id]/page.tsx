'use client';

import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import FlipbookPDFViewer from '@/components/ui/pdfViewer';
import { getAnnualReportById } from '@/lib/api';
import {
	fallbackImage,
	getCoverImagePath,
	getPageImagePath,
	normalizeFilename,
} from '@/lib/imageUtils';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Calendar, FileText, Users, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

function toTitleCase(str: string) {
	return str.replace(
		/\w\S*/g,
		(text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
	);
}

export default function ReportDetailPage({
	params,
}: {
	params: { id: string };
}) {
	const { t, i18n } = useTranslation();
	const [report, setReport] = useState<Report | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [previewPage, setPreviewPage] = useState(1);
	const [fileSize, setFileSize] = useState<string>('Calculating...');
	const maxPreviewPages = 20;
	const [isPreviewAvailable, setIsPreviewAvailable] = useState(true);

	useEffect(() => {
		async function fetchReport() {
			try {
				setIsLoading(true);
				const data = await getAnnualReportById(params.id);
				setReport(data);

				// Check PDF availability after the report data is loaded
				if (data?.title) {
					const available = await checkPdfAvailability(data.title);
					setIsPreviewAvailable(available);
				}
			} catch (err) {
				console.error('Error fetching report:', err);
				setError('Failed to load report');
			} finally {
				setIsLoading(false);
			}
		}

		fetchReport();
	}, [params.id]);

	// Helper function to normalize filenames by removing special characters and accents
	// Now imported from imageUtils

	// Function to get cover image based on report title
	const getCoverImage = (title: string) => {
		return getCoverImagePath(title);
	};

	// Fallback image if the specific year image doesn't exist
	// Now imported from imageUtils

	// Format date if available - using the utility function
	const formatReportDate = (dateString?: string) => {
		if (!dateString) return '';
		return formatDate(dateString, i18n.language || 'fr');
	};

	// Function to open the image modal
	const openImageModal = (imagePath: string) => {
		setSelectedImage(imagePath);
		// Prevent scrolling when modal is open
		document.body.style.overflow = 'hidden';
	};

	// Function to close the image modal
	const closeImageModal = () => {
		setSelectedImage(null);
		// Restore scrolling
		document.body.style.overflow = 'auto';
	};

	// Function to get the path for a report page image
	const getReportPageImage = (title: string, pageNum: number) => {
		return getPageImagePath(title, pageNum);
	};

	// Handle page navigation
	const goToNextPage = () => {
		if (report?.template && previewPage < report.template.length) {
			setPreviewPage((prev) => prev + 1);
		}
	};

	const goToPrevPage = () => {
		if (previewPage > 1) {
			setPreviewPage((prev) => prev - 1);
		}
	};

	// Function to check if the PDF exists
	const checkPdfAvailability = async (title: string) => {
		try {
			const normalizedTitle = normalizeFilename(title);
			const previewPdfUrl = `/reports/${normalizedTitle}_preview.pdf`;
			const fullPdfUrl = `/reports/${normalizedTitle}.pdf`;

			// Try preview PDF first
			let response = await fetch(previewPdfUrl, { method: 'HEAD' });
			if (response.ok) {
				return true;
			}

			// If preview isn't available, try the full PDF
			response = await fetch(fullPdfUrl, { method: 'HEAD' });
			return response.ok;
		} catch (error) {
			console.error('Error checking PDF availability:', error);
			return false;
		}
	};

	// Get accurate file size by formatting bytes
	const formatFileSize = (sizeInBytes: number): string => {
		const units = ['B', 'KB', 'MB', 'GB'];
		let size = sizeInBytes;
		let unitIndex = 0;

		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}

		return `${size.toFixed(1)} ${units[unitIndex]}`;
	};

	useEffect(() => {
		// Only attempt to get file size if we have a report
		if (!report) return;

		// Get download URL and PDF URL (just for reference)
		const normalizedTitle = normalizeFilename(report.title);
		const pdfUrl = `/reports/${normalizedTitle}.pdf`;

		const checkFileSize = async () => {
			try {
				const response = await fetch(pdfUrl, { method: 'HEAD' });
				if (response.ok) {
					const contentLength = response.headers.get('content-length');
					if (contentLength) {
						setFileSize(formatFileSize(parseInt(contentLength)));
					} else {
						setFileSize('Size unknown');
					}
				} else {
					setFileSize('File not available');
				}
			} catch (error) {
				console.error('Error checking file size:', error);
				setFileSize('Size unknown');
			}
		};

		checkFileSize();
	}, [report]);

	if (isLoading) {
		return (
			<LoadingSpinner
				message={t('common.loading')}
				background="transparent"
				fullScreen={true}
			/>
		);
	}

	if (error || !report) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen">
				<div className="text-2xl font-semibold mb-4 text-red-600">
					{t('common.error', 'Error')}
				</div>
				<div className="text-gray-600 mb-6">
					{error || t('reports.notFound', 'Report not found')}
				</div>
				<Link href="/reports" passHref>
					<Button>
						<ArrowLeft className="w-4 h-4 mr-2" />
						{t('reports.backToReports', 'Back to Reports')}
					</Button>
				</Link>
			</div>
		);
	}

	// Get year from published_at date
	const year =
		report.year ||
		(report.published_at
			? new Date(report.published_at).getFullYear()
			: undefined);

	// Get download URL and PDF URL
	const normalizedTitle = report ? normalizeFilename(report.title) : '';
	const downloadUrl = normalizedTitle ? `/reports/${normalizedTitle}.pdf` : '';
	const pdfUrl = normalizedTitle
		? `/reports/${normalizedTitle}_preview.pdf`
		: '';

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Back Link */}
			<div className="max-w-7xl mx-auto px-4 pt-8">
				<Link
					href="/reports"
					className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:underline"
				>
					<ArrowLeft className="w-4 h-4 mr-1" />
					{t('reports.backToReports', 'Back to Reports')}
				</Link>
			</div>

			{/* Book Cover with Overlapping Pages Header */}
			<div className="relative py-20 bg-gradient-to-b from-primary-900 to-primary-800 text-white overflow-hidden mt-4">
				{/* Blurred light effect background */}
				<div className="absolute inset-0 overflow-hidden backdrop-blur-sm">
					<div className="absolute -top-20 left-1/5 w-96 h-96 bg-primary-400 rounded-full mix-blend-overlay filter blur-[80px] opacity-40 animate-pulse"></div>
					<div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-primary-300 rounded-full mix-blend-overlay filter blur-[100px] opacity-30"></div>
					<div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-primary-600 rounded-full mix-blend-overlay filter blur-[90px] opacity-20"></div>
					<div className="absolute -bottom-40 right-1/3 w-[450px] h-[450px] bg-primary-500 rounded-full mix-blend-overlay filter blur-[120px] opacity-25"></div>
				</div>

				{/* Content container with max width */}
				<div className="max-w-full mx-auto px-4 relative z-10">
					{/* Overlapping Pages Display in a horizontal row */}
					<div className="flex justify-center items-start relative">
						{/* Pages container with cutoff overflow */}
						<div className="relative w-full h-[300px] sm:h-[382px] overflow-hidden">
							<div className="flex justify-center items-start absolute top-0 left-0 right-0 pt-4">
								{/* Books Container - Full width */}
								<div className="relative w-full flex justify-center">
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

											{/* Year Badge */}
											{year && false && (
												<div className="absolute -top-3 -right-3 bg-primary-500 text-white p-3 rounded-full text-sm font-medium shadow-lg">
													{year}
												</div>
											)}
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
											className="absolute right-[calc(45%-180px)] xs:right-[calc(50%-230px)] sm:right-[calc(50%-430px)] top-0 h-[300px] sm:h-[450px] w-[160px] sm:w-[250px] border-2 border-gray-200 bg-white transform translate-y-8 sm:translate-y-12"
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
							</div>

							{/* Horizontal line created by the cutoff */}
							<div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-900 z-10 shadow-[0_-5px_10px_rgba(0,0,0,0.3)]"></div>
						</div>
					</div>

					{/* Report Title - below everything */}
					<div className="pt-16 pb-4">
						<h1 className="text-3xl md:text-4xl font-bold text-center mb-3 text-white">
							{report.title}
						</h1>

						{/* Authors if available */}
						{report.authors && (
							<p className="text-center text-gray-300 max-w-3xl mx-auto mb-2">
								{t('reports.by', 'By')}:{' '}
								{report.authors
									.split(',')
									.map((author) => toTitleCase(author.trim()))
									.join(', ')}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Report Details */}
			<div className="max-w-7xl mx-auto px-4">
				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 -mt-10 relative z-20">
					{/* Metadata section with consistent look */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						{/* Publication Date */}
						{report.published_at && (
							<div className="flex items-start">
								<div className="flex-shrink-0 text-primary-500 mr-3">
									<Calendar className="w-5 h-5" />
								</div>
								<div>
									<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
										{t('home.annualReports.publishedOn', 'Publié le')}
									</h4>
									<p className="text-gray-900 dark:text-white font-medium">
										{formatReportDate(report.published_at)}
									</p>
								</div>
							</div>
						)}

						{/* Authors */}
						{report.authors && (
							<div className="flex items-start">
								<div className="flex-shrink-0 text-primary-500 mr-3">
									<Users className="w-5 h-5" />
								</div>
								<div>
									<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
										{t('home.annualReports.authors', 'Auteurs')}
									</h4>
									<p className="text-gray-900 dark:text-white font-medium text-justify">
										{report.authors
											.split(',')
											.map((author) => toTitleCase(author.trim()))
											.join(', ')}
									</p>
								</div>
							</div>
						)}

						{/* File Size */}
						<div className="flex items-start">
							<div className="flex-shrink-0 text-primary-500 mr-3">
								<FileText className="w-5 h-5" />
							</div>
							<div>
								<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
									{t('reports.fileSize', 'Taille du fichier')}
								</h4>
								<p className="text-gray-900 dark:text-white font-medium">
									{fileSize}
								</p>
							</div>
						</div>
					</div>

					{/* Description section */}
					{report.description && (
						<div className="mb-8">
							<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
								<span className="inline-block w-8 h-1 bg-primary-500 mr-3"></span>
								{t('reports.description', 'Description')}
							</h2>
							<div className="prose dark:prose-invert max-w-none">
								<p className="text-gray-700 dark:text-gray-300">
									{report.description}
								</p>
							</div>
						</div>
					)}

					{/* Introduction section */}
					{report.introduction && (
						<div>
							<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
								<span className="inline-block w-8 h-1 bg-primary-500 mr-3"></span>
								{t('reports.introduction', 'Introduction')}
							</h2>
							<div className="prose dark:prose-invert max-w-none">
								<p className="text-gray-700 dark:text-gray-300 text-justify">
									{report.introduction}
								</p>
							</div>
						</div>
					)}

					{/* No information available message */}
					{!report.introduction && !report.description && (
						<div className="text-center py-6">
							<p className="text-gray-500 dark:text-gray-400 italic">
								{t(
									'reports.noDescription',
									'No description available for this report.'
								)}
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Preview Section */}
			{report &&
				report.template &&
				report.template.length > 0 &&
				isPreviewAvailable &&
				pdfUrl && (
					<div className="max-w-7xl mx-auto px-4 mt-12 mb-20">
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
								{t('reports.preview', 'Report Preview')}
							</h2>

							{/* PDF Preview with FlipbookPDFViewer */}
							<div className="relative max-w-5xl mx-auto mb-8">
								<div className="rounded-xl overflow-hidden shadow-lg">
									<FlipbookPDFViewer pdfUrl={pdfUrl} />
								</div>
							</div>
						</div>
					</div>
				)}

			{/* Image Modal */}
			{selectedImage && (
				<div
					className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
					onClick={closeImageModal}
				>
					<div
						className="relative max-w-5xl max-h-[90vh] w-full"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 rounded-full p-2 text-white z-10"
							onClick={closeImageModal}
						>
							<X className="w-6 h-6" />
						</button>

						<div className="relative h-[80vh]">
							<Image
								src={selectedImage}
								alt="Report page"
								fill
								className="object-contain"
								onError={(e) => {
									e.currentTarget.src = fallbackImage;
									e.currentTarget.onerror = null;
								}}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
