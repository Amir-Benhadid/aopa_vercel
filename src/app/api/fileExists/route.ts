import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export const dynamic = 'force-dynamic';

// A map of files we know exist in production
// This avoids any filesystem operations in production
const knownFiles: Record<string, boolean> = {
	// Add common files here if needed
};

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

		// DEVELOPMENT MODE: Use filesystem directly
		if (process.env.NODE_ENV === 'development') {
			try {
				const fullPath = path.join(process.cwd(), 'public', normalizedPath);
				const exists = fs.existsSync(fullPath);
				return NextResponse.json({ exists });
			} catch (error) {
				console.error('Error checking file via filesystem:', error);
				return NextResponse.json({ exists: false });
			}
		}

		// PRODUCTION MODE: Never use filesystem

		// 1. Check for known files first
		if (knownFiles[normalizedPath] !== undefined) {
			return NextResponse.json({ exists: knownFiles[normalizedPath] });
		}

		// 2. For images, check via HTTP HEAD request
		const fileExtension = path.extname(normalizedPath).toLowerCase();
		if (
			['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'].includes(
				fileExtension
			)
		) {
			try {
				const fileUrl = `/${normalizedPath}`;
				const fullUrl = new URL(fileUrl, request.nextUrl.origin).toString();

				const response = await fetch(fullUrl, {
					method: 'HEAD',
				});

				return NextResponse.json({ exists: response.ok });
			} catch (error) {
				console.error('Error checking file via HTTP:', error);
				return NextResponse.json({ exists: false });
			}
		}

		// 3. For PDFs and other large files, assume they exist
		if (['.pdf', '.docx', '.pptx', '.ppt', '.doc'].includes(fileExtension)) {
			return NextResponse.json({ exists: true });
		}

		// If we reach here, we couldn't verify the file exists
		return NextResponse.json({ exists: false });
	} catch (error) {
		console.error('Error in fileExists API:', error);
		return NextResponse.json(
			{ error: 'Failed to check file existence' },
			{ status: 500 }
		);
	}
}
