/**
 * Utility functions for handling image paths and normalization
 */

/**
 * Normalizes a filename by removing special characters and accents
 * @param text The text to normalize
 * @returns Normalized string safe for use in filenames
 */
export const normalizeFilename = (text: string): string => {
	return text
		.toLowerCase()
		.replace(/\s+/g, '_')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
		.replace(/[^\w_-]/g, ''); // Remove any other special characters
};

/**
 * Gets the path for a report cover image based on report title
 * @param title The report title
 * @returns Path to the cover image SVG
 */
export const getCoverImagePath = (title: string): string => {
	const normalizedTitle = normalizeFilename(title);
	return `/reports/${normalizedTitle}.svg`;
};

/**
 * Gets the path for a report page image
 * @param title The report title
 * @param pageNum The page number
 * @returns Path to the page image JPG
 */
export const getPageImagePath = (title: string, pageNum: number): string => {
	const normalizedTitle = normalizeFilename(title);
	return `/reports/${normalizedTitle}_page_${pageNum}.jpg`;
};

/**
 * Default fallback image to use when specific images fail to load
 */
export const fallbackImage = '/reports/annual_report_default.jpg';
