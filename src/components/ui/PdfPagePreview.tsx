'use client';

import { generatePdfPageUrls, getPdfPageFallbackUrl } from '@/lib/pdf-utils';
import { useEffect, useState } from 'react';
import { FallbackImage } from './FallbackImage';

interface PdfPagePreviewProps {
	pdfUrl: string;
	template?: number[];
	className?: string;
}

/**
 * A component to preview pages extracted from a PDF
 */
export function PdfPagePreview({
	pdfUrl,
	template = [1, 2, 3, 4],
	className = '',
}: PdfPagePreviewProps) {
	const [pages, setPages] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		try {
			if (!pdfUrl) {
				setError('No PDF URL provided');
				setIsLoading(false);
				return;
			}

			// Generate the URLs for the PDF pages
			const pageUrls = generatePdfPageUrls(pdfUrl, template);
			setPages(pageUrls);
			setIsLoading(false);
		} catch (err) {
			console.error('Error generating PDF page URLs:', err);
			setError('Failed to generate page URLs');
			setIsLoading(false);
		}
	}, [pdfUrl, template]);

	if (isLoading) {
		return <div className="p-4 text-center">Loading PDF pages...</div>;
	}

	if (error) {
		return <div className="p-4 text-center text-red-500">{error}</div>;
	}

	return (
		<div
			className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
		>
			{pages.map((pageUrl, index) => (
				<div
					key={index}
					className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md"
				>
					<FallbackImage
						src={pageUrl}
						alt={`PDF page ${template[index]}`}
						fallbackSrc={getPdfPageFallbackUrl(index)}
						fill
						className="object-contain"
					/>
					<div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1">
						Page {template[index]} ({pageUrl.split('/').pop()})
					</div>
				</div>
			))}
		</div>
	);
}
