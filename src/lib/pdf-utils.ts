/**
 * Generates URLs for PDF pages based on a template
 * @param reportFile The path to the PDF file
 * @param template Array of page numbers to extract
 * @returns Array of image URLs for the specified pages
 */
export function generatePdfPageUrls(
	reportFile: string,
	template: number[] = [1, 2, 3, 4]
): string[] {
	if (!reportFile) return [];

	// Ensure template is valid
	if (!Array.isArray(template) || template.length === 0) {
		template = [1, 2, 3, 4]; // Default template
	}

	// Clean up the report file path
	// 1. Decode URL if it's encoded
	let baseUrl = decodeURIComponent(reportFile);

	// 2. Remove .pdf extension if present
	baseUrl = baseUrl.replace(/\.pdf$/i, '');

	// 3. Handle full URLs vs relative paths
	if (baseUrl.startsWith('http')) {
		// Extract filename from URL
		const urlParts = baseUrl.split('/');
		const filename = urlParts[urlParts.length - 1];
		baseUrl = `/reports/${filename}`;
	}

	// Generate URLs for each page in the template
	return template.map((pageNum) => `${baseUrl}_page_${pageNum}.jpg`);
}

/**
 * Gets a fallback image URL for PDF pages
 * @param index The index of the page (0-based)
 * @returns URL to the appropriate fallback image
 */
export function getPdfPageFallbackUrl(index: number): string {
	// First page (cover) gets a special fallback
	if (index === 0) {
		return '/reports/annual_report_default.jpg';
	}

	// Other pages get numbered fallbacks
	return `/reports/annual_report_default_page${index}.jpg`;
}

/**
 * Ensures a report object has valid file_url and template properties
 * @param report The report object to process
 * @returns The processed report with valid properties
 */
export function processReportData(report: any): any {
	if (!report) return null;

	// Create file URL if not present
	let fileUrl = report.file_url;
	if (!fileUrl) {
		// Try to generate file URL from title or other properties
		const title = report.title || 'annual_report';
		const year = report.year ? `_${report.year}` : '';
		fileUrl = `/reports/${title.replace(/\s+/g, '_')}${year}.pdf`;
	}

	// Convert template to numbers array if it's stored as a string
	let template = report.template;
	if (typeof template === 'string') {
		try {
			template = JSON.parse(template);
		} catch (e) {
			template = [1, 2, 3, 4]; // Default if parsing fails
		}
	}

	// Ensure template is an array, even if it's not already
	if (!Array.isArray(template)) {
		template = [1, 2, 3, 4]; // Default if not an array
	}

	// Return the processed report
	return {
		...report,
		file_url: fileUrl,
		template,
	};
}
