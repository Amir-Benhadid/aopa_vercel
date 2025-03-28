'use client';

import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getAnnualReportById } from '@/lib/api';
import { ArrowLeft, Calendar, Download, FileText, Users } from 'lucide-react';
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
	authors?: string;
	template?: number[];
}

export default function ReportDetailPage({
	params,
}: {
	params: { id: string };
}) {
	const { t } = useTranslation();
	const [report, setReport] = useState<Report | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchReport() {
			try {
				setIsLoading(true);
				const data = await getAnnualReportById(params.id);
				setReport(data);
			} catch (err) {
				console.error('Error fetching report:', err);
				setError('Failed to load report');
			} finally {
				setIsLoading(false);
			}
		}

		fetchReport();
	}, [params.id]);

	// Function to get cover image based on report title
	const getCoverImage = (title: string) => {
		return `/reports/${title.toLowerCase().replace(' ', '_')}.svg`;
	};

	// Fallback image if the specific year image doesn't exist
	const fallbackImage = '/reports/annual_report_default.jpg';

	// Format date if available
	const formatDate = (dateString?: string) => {
		if (!dateString) return '';

		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			});
		} catch (e) {
			return dateString;
		}
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

	// Get file size
	const fileSize = report.fileSize || report.file_size || '4.2 MB';

	// Get download URL
	const downloadUrl = report.downloadUrl || report.file_url;

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Back Link */}
			<div className="max-w-5xl mx-auto px-4 pt-8">
				<Link
					href="/reports"
					className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:underline"
				>
					<ArrowLeft className="w-4 h-4 mr-1" />
					{t('reports.backToReports', 'Back to Reports')}
				</Link>
			</div>

			<div className="max-w-5xl mx-auto px-4 py-8">
				<div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
					{/* Report Header */}
					<div className="relative h-72 sm:h-96">
						<Image
							src={getCoverImage(report.title)}
							alt={report.title}
							fill
							className="object-cover"
							onError={(e) => {
								// Fallback to default image if the specific year image fails to load
								e.currentTarget.src = fallbackImage;
							}}
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
						<div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
							{year && (
								<div className="inline-block px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 rounded-full text-sm font-medium mb-2">
									{year}
								</div>
							)}
							<h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
								{report.title}
							</h1>
						</div>
					</div>

					{/* Report Content */}
					<div className="p-6 sm:p-8">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{/* Left Column - Metadata */}
							<div className="space-y-6">
								{/* Publication Date */}
								{report.published_at && (
									<div className="flex items-start">
										<div className="flex-shrink-0 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-full mr-3 mt-1">
											<Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
										</div>
										<div>
											<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
												{t('home.annualReports.publishedOn', 'Published On')}
											</h4>
											<p className="text-gray-900 dark:text-white">
												{formatDate(report.published_at)}
											</p>
										</div>
									</div>
								)}

								{/* Authors */}
								{report.authors && (
									<div className="flex items-start">
										<div className="flex-shrink-0 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-full mr-3 mt-1">
											<Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
										</div>
										<div>
											<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
												{t('home.annualReports.authors', 'Authors')}
											</h4>
											<p className="text-gray-900 dark:text-white">
												{report.authors}
											</p>
										</div>
									</div>
								)}

								{/* File Size */}
								<div className="flex items-start">
									<div className="flex-shrink-0 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-full mr-3 mt-1">
										<FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
									</div>
									<div>
										<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
											{t('reports.fileSize', 'File Size')}
										</h4>
										<p className="text-gray-900 dark:text-white">{fileSize}</p>
									</div>
								</div>

								{/* Download Button */}
								{downloadUrl ? (
									<Link href={downloadUrl} passHref>
										<Button className="w-full mt-4">
											{t('reports.download', 'Download Report')}
											<Download className="w-4 h-4 ml-2" />
										</Button>
									</Link>
								) : (
									<Button className="w-full mt-4" disabled>
										{t('reports.notAvailable', 'Download Not Available')}
									</Button>
								)}
							</div>

							{/* Right Column - Description */}
							<div className="md:col-span-2">
								<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
									{t('reports.about', 'About This Report')}
								</h2>

								{report.description ? (
									<div className="prose dark:prose-invert max-w-none">
										<p className="text-gray-700 dark:text-gray-300">
											{report.description}
										</p>
									</div>
								) : (
									<p className="text-gray-500 dark:text-gray-400 italic">
										{t(
											'reports.noDescription',
											'No description available for this report.'
										)}
									</p>
								)}

								{/* Preview Section - can be expanded later with actual PDF preview */}
								<div className="mt-8">
									<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
										{t('reports.preview', 'Preview')}
									</h2>

									<div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
										<div className="text-center">
											<FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
											<p className="text-gray-600 dark:text-gray-400">
												{t(
													'reports.previewUnavailable',
													'Preview not available. Please download the report to view it.'
												)}
											</p>
											{downloadUrl && (
												<Link href={downloadUrl} passHref>
													<Button variant="outline" size="sm" className="mt-4">
														{t('reports.download', 'Download Report')}
													</Button>
												</Link>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
