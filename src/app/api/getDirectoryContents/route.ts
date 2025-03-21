import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export const dynamic = 'force-dynamic';

// Define a static map of known directories
// This avoids the need to use the file system directly for large files
const directoryMap: Record<string, string[]> = {
	previous_congresses: [
		'20230316-10èmes_rencontres-biskra',
		'20221117-16èmes_congrès-alger',
		'20250209-12èmes_rencontres-oran',
		'20241003-18èmes_congrès-alger',
		'20240216-11èmes_rencontres-constantine',
		'20231116-17èmes_congrès-alger',
		'20210115-14eme_congrès',
		'20220624-9èmes_rencontres-setif',
	],
	'previous_congresses/20230316-10èmes_rencontres-biskra': [
		'photos',
		'programme.pdf',
		'affiche.pdf',
		'affiche.jpg',
	],
	'previous_congresses/20230316-10èmes_rencontres-biskra/photos': [
		'289156056_2256332847859243_8248477881967731616_n.jpg',
	],
	'previous_congresses/20231116-17èmes_congrès-alger': [
		'photos',
		'affiche.pdf',
		'programme.pdf',
	],
	// Add more mappings as needed for other directories
};

export async function GET(request: NextRequest) {
	try {
		// Get the directory path from the query parameters
		const searchParams = request.nextUrl.searchParams;
		const dirPath = searchParams.get('path');

		if (!dirPath) {
			return NextResponse.json(
				{ error: 'Path parameter is required' },
				{ status: 400 }
			);
		}

		// Remove leading slash and ensure we're only accessing the previous_congresses directory
		const normalizedPath = dirPath.startsWith('/') ? dirPath.slice(1) : dirPath;

		// Ensure we're only accessing the public directory for security
		if (!normalizedPath.startsWith('previous_congresses/')) {
			return NextResponse.json(
				{
					error:
						'Access denied. Can only access public/previous_congresses directory',
				},
				{ status: 403 }
			);
		}

		// Try to get directory contents from the filesystem first (for development or when looking for images)
		// In development, we can use the filesystem directly
		if (process.env.NODE_ENV === 'development') {
			try {
				const fullPath = path.join(process.cwd(), 'public', normalizedPath);

				// Check if the directory exists
				if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
					const files = fs.readdirSync(fullPath);
					return NextResponse.json(files);
				}
			} catch (error) {
				console.error('Error reading directory from filesystem:', error);
				// Fall through to use the directory map
			}
		}

		// Check if we have the directory contents in our static map
		if (directoryMap[normalizedPath]) {
			return NextResponse.json(directoryMap[normalizedPath]);
		}

		// If we're in production and don't have the directory in our map,
		// check if it contains 'photos' in the path, which might indicate an image directory
		if (
			process.env.NODE_ENV === 'production' &&
			normalizedPath.includes('photos')
		) {
			// For photos directories, we can safely return an empty array
			// The front-end can handle this case appropriately
			return NextResponse.json([]);
		}

		// If we don't have the directory in our map, return a 404
		return NextResponse.json({ error: 'Directory not found' }, { status: 404 });
	} catch (error) {
		console.error('Error reading directory:', error);
		return NextResponse.json(
			{ error: 'Failed to read directory' },
			{ status: 500 }
		);
	}
}
