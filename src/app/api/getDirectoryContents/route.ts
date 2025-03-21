import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export const dynamic = 'force-dynamic';

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

		// Remove leading slash and ensure we're only accessing the public directory
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

		// Construct the full path to the directory in the public folder
		const fullPath = path.join(process.cwd(), 'public', normalizedPath);

		// Check if the directory exists
		if (!fs.existsSync(fullPath)) {
			return NextResponse.json(
				{ error: 'Directory not found' },
				{ status: 404 }
			);
		}

		// Get the directory contents
		const files = fs.readdirSync(fullPath);

		return NextResponse.json(files);
	} catch (error) {
		console.error('Error reading directory:', error);
		return NextResponse.json(
			{ error: 'Failed to read directory' },
			{ status: 500 }
		);
	}
}
