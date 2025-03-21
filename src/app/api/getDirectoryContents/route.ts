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
	'previous_congresses/20231116-17èmes_congrès-alger/photos': [
		'image1.jpg',
		'image2.jpg',
	],
	'previous_congresses/20221117-16èmes_congrès-alger': [
		'photos',
		'affiche.jpg',
		'programme.pdf',
	],
	'previous_congresses/20221117-16èmes_congrès-alger/photos': [
		'image1.jpg',
		'image2.jpg',
	],
	'previous_congresses/20240216-11èmes_rencontres-constantine': [
		'photos',
		'affiche.jpg',
		'programme.pdf',
	],
	'previous_congresses/20240216-11èmes_rencontres-constantine/photos': [
		'image1.jpg',
		'image2.jpg',
	],
	'previous_congresses/20250209-12èmes_rencontres-oran': [
		'photos',
		'affiche.jpg',
		'programme.pdf',
	],
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

		// In development mode, use the filesystem
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

		// Production mode - only use the directory map
		// Check if we have the directory contents in our static map
		if (directoryMap[normalizedPath]) {
			return NextResponse.json(directoryMap[normalizedPath]);
		}

		// If it's a photos directory not in our map, return an empty array
		// This is safe since many components expect an array even if empty
		if (normalizedPath.includes('/photos')) {
			return NextResponse.json([]);
		}

		// For any unknown directory, return an empty array rather than a 404
		// This makes the API more resilient to unknown paths
		return NextResponse.json([]);
	} catch (error) {
		console.error('Error reading directory:', error);
		return NextResponse.json(
			{ error: 'Failed to read directory' },
			{ status: 500 }
		);
	}
}
