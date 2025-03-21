import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Formats a date string into a human-readable format
 * @param dateString - The date string to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(dateString: string, locale = 'en-US'): string {
	try {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat(locale, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		}).format(date);
	} catch (error) {
		console.error('Error formatting date:', error);
		return dateString;
	}
}

/**
 * Formats a date range into a human-readable format
 * @param startDate - The start date string
 * @param endDate - The end date string
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted date range string
 */
export function formatDateRange(
	startDate: string,
	endDate: string,
	locale = 'en-US'
): string {
	try {
		const start = new Date(startDate);
		const end = new Date(endDate);

		// Same year
		if (start.getFullYear() === end.getFullYear()) {
			// Same month
			if (start.getMonth() === end.getMonth()) {
				return `${start.getDate()} - ${end.getDate()} ${new Intl.DateTimeFormat(
					locale,
					{ month: 'long', year: 'numeric' }
				).format(end)}`;
			}
			// Different month, same year
			return `${new Intl.DateTimeFormat(locale, {
				month: 'long',
				day: 'numeric',
			}).format(start)} - ${new Intl.DateTimeFormat(locale, {
				month: 'long',
				day: 'numeric',
				year: 'numeric',
			}).format(end)}`;
		}

		// Different years
		return `${new Intl.DateTimeFormat(locale, {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		}).format(start)} - ${new Intl.DateTimeFormat(locale, {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		}).format(end)}`;
	} catch (error) {
		console.error('Error formatting date range:', error);
		return `${startDate} - ${endDate}`;
	}
}

/**
 * Truncates a string to a specified length and adds an ellipsis
 * @param str - The string to truncate
 * @param length - The maximum length (default: 100)
 * @returns Truncated string
 */
export function truncateString(str: string, length = 100): string {
	if (!str) return '';
	if (str.length <= length) return str;
	return str.slice(0, length) + '...';
}

/**
 * Generates a random ID
 * @param length - The length of the ID (default: 8)
 * @returns Random ID string
 */
export function generateId(length = 8): string {
	return Math.random()
		.toString(36)
		.substring(2, 2 + length);
}

/**
 * Debounces a function
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds (default: 300)
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
	fn: T,
	delay = 300
): (...args: Parameters<T>) => void {
	let timeoutId: NodeJS.Timeout;

	return function (...args: Parameters<T>) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
}

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns Capitalized string
 */
export function capitalizeFirstLetter(str: string): string {
	if (!str) return '';
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Gets the folder path for a congress based on its data
 * Format: /previous_congresses/YYYYMMDD-title_with_underscores-city
 */
export function getCongressFolderPath(congress: {
	start_date: string;
	title: string;
	location: string | { name: string; address?: { city: string } };
}): string | null {
	if (!congress) return null;
	if (!congress.start_date || !congress.title) return null;
	if (!congress.location) return null;

	try {
		// Extract date from start_date (format: YYYY-MM-DD)
		const startDate = new Date(congress.start_date);
		const dateStr = startDate.toISOString().slice(0, 10).replace(/-/g, '');

		// Format title by replacing spaces with underscores
		const titleFormatted = congress.title.replace(/\s+/g, '_').toLowerCase();

		// Extract just the city from the location
		let city = '';

		if (typeof congress.location === 'string') {
			// If location is a string, extract just the city part
			city = extractCityFromLocation(congress.location);
		} else {
			// If it has address.city directly, use that
			if ('address' in congress.location && congress.location.address?.city) {
				city = extractCityFromLocation(congress.location.address.city);
			}
			// Otherwise fallback to location name
			else if ('name' in congress.location) {
				city = extractCityFromLocation(congress.location.name || 'unknown');
			}
			// Last resort fallback
			else {
				city = 'unknown';
			}
		}

		// Format city by replacing spaces with underscores
		const cityFormatted = city.replace(/\s+/g, '_').toLowerCase();

		// Combine all parts to form the folder path
		return `/previous_congresses/${dateStr}-${titleFormatted}-${cityFormatted}`;
	} catch (error) {
		console.error('Error generating congress folder path:', error);
		return null;
	}
}

/**
 * Extracts just the city name from a location string
 * Handles cases like "Conference Center, City, Country"
 */
function extractCityFromLocation(location: string): string {
	if (!location) return 'unknown';

	// Split by common delimiters that might separate city from other info
	const parts = location.split(/,|_|-|\s+\|\s+/);

	// If there's only one part, return it
	if (parts.length === 1) return parts[0].trim();

	// If we have multiple parts, the city is often the second part
	// E.g., "Centre International de Conférences, Alger, Algérie" -> "Alger"
	if (parts.length >= 3) {
		// The city is likely the second item after splitting by comma
		return parts[1].trim();
	}

	// If we have two parts, return the first or second based on length
	// Usually the shorter part is the city name (not always but a good guess)
	if (parts.length === 2) {
		const cleaned = parts.map((p) => p.trim());
		return cleaned[0].length < cleaned[1].length ? cleaned[0] : cleaned[1];
	}

	// Fallback to just the first part
	return parts[0].trim();
}

/**
 * Helper function to check if an image or file exists in the congress directory
 * This is designed to work with our optimized fileExists API
 */
export async function checkFileExists(path: string): Promise<boolean> {
	try {
		// Remove leading slash if present for the API call
		const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

		// Use our API endpoint to check if the file exists
		const response = await fetch(
			`/api/fileExists?path=${encodeURIComponent(normalizedPath)}`
		);
		const data = await response.json();

		return data.exists;
	} catch (error) {
		console.error('Error checking file existence:', error);
		return false;
	}
}

/**
 * Gets the best available image for a congress
 * Tries multiple options in order of preference:
 * 1. JPG poster (affiche.jpg)
 * 2. PDF poster (affiche.pdf)
 * 3. Banner from congress object
 * 4. Image from congress object
 * 5. Default fallback image
 */
export async function getCongressImage(congress: any): Promise<string> {
	// First get the folder path
	let locationName = '';
	if (congress.location) {
		if (typeof congress.location === 'object') {
			locationName = congress.location.name || '';
		} else if (typeof congress.location === 'string') {
			locationName = congress.location;
		}
	}

	const folderPath = getCongressFolderPath({
		start_date: congress.start_date,
		title: congress.title,
		location: locationName,
	});

	if (!folderPath) {
		// If we can't determine the folder path, use fallbacks
		return congress.image || congress.banner || '/images/congress-default.jpg';
	}

	// Try JPG poster first (preferred for web)
	const jpgPath = `${folderPath}/affiche.jpg`;
	const jpgExists = await checkFileExists(jpgPath);
	if (jpgExists) {
		return jpgPath;
	}

	// Then try PDF poster
	const pdfPath = `${folderPath}/affiche.pdf`;
	const pdfExists = await checkFileExists(pdfPath);
	if (pdfExists) {
		return `${pdfPath}#page=1`;
	}

	// Fall back to congress.banner or congress.image or default
	return congress.banner || congress.image || '/images/congress-default.jpg';
}

/**
 * Load images from a congress photos directory
 * Returns an array of image paths that exist
 */
export async function getCongressPhotos(congress: any): Promise<string[]> {
	// First get the folder path
	let locationName = '';
	if (congress.location) {
		if (typeof congress.location === 'object') {
			locationName = congress.location.name || '';
		} else if (typeof congress.location === 'string') {
			locationName = congress.location;
		}
	}

	const folderPath = getCongressFolderPath({
		start_date: congress.start_date,
		title: congress.title,
		location: locationName,
	});

	if (!folderPath) {
		// If we can't determine the folder path, use fallbacks
		return (
			congress.images || [congress.image || '/images/congress-default.jpg']
		);
	}

	// Use our API endpoint to get directory contents
	const photosPath = `${folderPath}/photos`;
	try {
		const response = await fetch(
			`/api/getDirectoryContents?path=${encodeURIComponent(
				photosPath.slice(1)
			)}`
		);

		if (response.ok) {
			const files = await response.json();

			// Filter for image files
			const imageFiles = files.filter((file: string) =>
				file.match(/\.(jpg|jpeg|png|gif|webp)$/i)
			);

			if (imageFiles.length > 0) {
				// Return full paths to the images
				return imageFiles.map((file: string) => `${photosPath}/${file}`);
			}
		}
	} catch (error) {
		console.error('Error fetching congress photos:', error);
	}

	// Fallbacks
	if (congress.images && congress.images.length > 0) {
		return congress.images;
	}

	return [await getCongressImage(congress)];
}
