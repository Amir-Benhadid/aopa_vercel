'use client';

import { Button } from '@/components/ui/Button';
import { getAnnualReports } from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ReportViewerPage() {
	const { t } = useTranslation();
	const params = useParams();
	const router = useRouter();
	const [report, setReport] = useState<any | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchReport() {
			if (!params.id) {
				setError('Report ID is missing');
				setIsLoading(false);
				return;
			}

			try {
				const reports = await getAnnualReports();
				const foundReport = reports.find((r) => r.id === params.id);

				if (!foundReport) {
					setError('Report not found');
				} else {
					setReport(foundReport);
				}
			} catch (err) {
				console.error('Error fetching report:', err);
				setError('Failed to load report data');
			} finally {
				setIsLoading(false);
			}
		}

		fetchReport();
	}, [params.id]);

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen">
				<div className="text-2xl font-semibold mb-4">{t('common.loading')}</div>
				<div className="animate-pulse flex space-x-4">
					<div className="rounded-full bg-gray-200 h-12 w-12"></div>
					<div className="rounded-full bg-gray-200 h-12 w-12"></div>
					<div className="rounded-full bg-gray-200 h-12 w-12"></div>
				</div>
			</div>
		);
	}

	if (error || !report) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen">
				<div className="text-2xl font-semibold mb-4 text-red-600">
					{t('common.error')}
				</div>
				<div className="text-gray-600 mb-6">{error || 'Report not found'}</div>
				<div className="flex space-x-4">
					<Button
						onClick={() => router.back()}
						variant="outline"
						className="flex items-center"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						{t('common.goBack')}
					</Button>
					<Link href="/" passHref>
						<Button>{t('common.returnHome')}</Button>
					</Link>
				</div>
			</div>
		);
	}

	const reportTitle = `Annual Report ${report.year}`;
	const reportUrl = report.file_url || `/reports/${report.year}.pdf`;

	return (
		<div className="flex flex-col min-h-screen">
			{/* Header */}
			<div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
				<div className="max-w-7xl mx-auto px-4 py-8">
					<div className="flex flex-col md:flex-row md:items-center justify-between">
						<div>
							<Link
								href="/"
								className="text-white/80 hover:text-white flex items-center mb-4 w-fit"
							>
								<ArrowLeft className="w-4 h-4 mr-2" />
								{t('common.backToHome')}
							</Link>
							<h1 className="text-3xl font-bold mb-2">{reportTitle}</h1>
							<p className="text-blue-100">
								{t('reports.publishedYear', { year: report.year })}
							</p>
						</div>

						<div className="mt-4 md:mt-0">
							<Button
								variant="outline"
								className="bg-white/10 border-white/20 text-white hover:bg-white/20"
								onClick={() => window.open(reportUrl, '_blank', 'download')}
							>
								<Download className="w-4 h-4 mr-2" />
								{t('reports.download')}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* PDF Viewer */}
			<div className="flex-1 bg-gray-100 dark:bg-gray-900 p-4">
				<div className="max-w-7xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
					>
						{/* PDF Embed */}
						<div className="aspect-[3/4] md:aspect-[1/1.4] w-full h-full min-h-[70vh]">
							<iframe
								src={`${reportUrl}#toolbar=0&navpanes=0`}
								className="w-full h-full"
								title={reportTitle}
							/>
						</div>

						{/* Fallback for browsers that don't support PDF embedding */}
						<div className="p-6 border-t border-gray-200 dark:border-gray-700">
							<div className="flex items-start">
								<div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 mr-4">
									<FileText className="w-6 h-6 text-blue-500 dark:text-blue-400" />
								</div>
								<div>
									<h3 className="text-lg font-semibold mb-1">{reportTitle}</h3>
									<p className="text-gray-600 dark:text-gray-400 mb-4">
										{t('reports.fileSize')}: {report.file_size || '3.5 MB'}
									</p>
									<Button
										onClick={() => window.open(reportUrl, '_blank')}
										className="mr-3"
									>
										{t('reports.openInNewTab')}
									</Button>
									<Button
										variant="outline"
										onClick={() => window.open(reportUrl, '_blank', 'download')}
									>
										<Download className="w-4 h-4 mr-2" />
										{t('reports.download')}
									</Button>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
