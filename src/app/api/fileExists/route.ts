import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export const dynamic = 'force-dynamic';

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

		// Remove leading slash and ensure we're only accessing the public directory
		const normalizedPath = filePath.startsWith('/')
			? filePath.slice(1)
			: filePath;

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

		// Construct the full path to the file in the public folder
		const fullPath = path.join(process.cwd(), 'public', normalizedPath);

		// Check if the file exists
		const exists = fs.existsSync(fullPath);

		return NextResponse.json({ exists });
	} catch (error) {
		console.error('Error checking file existence:', error);
		return NextResponse.json(
			{ error: 'Failed to check file existence' },
			{ status: 500 }
		);
	}
}
