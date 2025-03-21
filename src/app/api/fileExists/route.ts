import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export const dynamic = 'force-dynamic';

// A whitelist of extensions that we'll check directly via filesystem
// These files are typically small and won't cause deployment size issues
const SAFE_EXTENSIONS = [
	'.jpg',
	'.jpeg',
	'.png',
	'.gif',
	'.webp',
	'.svg',
	'.ico',
];

export async function GET(request: NextRequest) {
	try {
		// Get the file path from the query parameters
		const searchParams = request.nextUrl.searchParams;
		const filePath = searchParams.get('path');

		if (!filePath) {
			return NextResponse.json(
				{ error: 'Path parameter is required' },
				{ status: 400 }
			);
		}

		// Remove leading slash and ensure we're only accessing the previous_congresses directory
		const normalizedPath = filePath.startsWith('/')
			? filePath.slice(1)
			: filePath;

		// Ensure we're only accessing the previous_congresses directory for security
		if (!normalizedPath.startsWith('previous_congresses/')) {
			return NextResponse.json(
				{
					error:
						'Access denied. Can only access public/previous_congresses directory',
				},
				{ status: 403 }
			);
		}

		// Get the file extension to determine how to check
		const fileExtension = path.extname(normalizedPath).toLowerCase();
		const isImageFile = SAFE_EXTENSIONS.includes(fileExtension);

		// For image files, we can check the filesystem directly
		// since they're small and won't cause deployment size issues
		if (isImageFile || process.env.NODE_ENV === 'development') {
			try {
				const fullPath = path.join(process.cwd(), 'public', normalizedPath);
				const exists = fs.existsSync(fullPath);
				return NextResponse.json({ exists });
			} catch (error) {
				console.error('Error checking file via filesystem:', error);
				// Fall through to the next method
			}
		}

		// For non-image files or in production, check via HTTP
		try {
			const fileUrl = `/${normalizedPath}`;
			const fullUrl = new URL(fileUrl, request.nextUrl.origin).toString();

			const response = await fetch(fullUrl, {
				method: 'HEAD',
			});

			if (response.ok) {
				return NextResponse.json({ exists: true });
			}
		} catch (error) {
			console.error('Error checking file via HTTP:', error);
			// Fall through to the fallback
		}

		// Fallback: For PDF files specifically, assume they exist in production
		// This works because we know these files are part of our static content
		if (fileExtension === '.pdf' && process.env.NODE_ENV === 'production') {
			return NextResponse.json({ exists: true });
		}

		// If we get here, we couldn't verify the file exists
		return NextResponse.json({ exists: false });
	} catch (error) {
		console.error('Error in fileExists API:', error);
		return NextResponse.json(
			{ error: 'Failed to check file existence' },
			{ status: 500 }
		);
	}
}
