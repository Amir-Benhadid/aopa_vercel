#!/usr/bin/env node

/**
 * This script finds large files in your project that might cause issues with Vercel deployments.
 *
 * Usage:
 *   node scripts/find-large-files.js [size-in-mb] [directory]
 *
 * Example:
 *   node scripts/find-large-files.js 10 public
 *   (Finds files larger than 10MB in the public directory)
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

// Default values
const DEFAULT_SIZE_LIMIT_MB = 5; // 5MB
const DEFAULT_DIRECTORY = '.';

// Get command line arguments
const sizeLimit =
	(process.argv[2] ? parseInt(process.argv[2]) : DEFAULT_SIZE_LIMIT_MB) *
	1024 *
	1024; // Convert to bytes
const rootDir = process.argv[3] || DEFAULT_DIRECTORY;

// Format bytes to human-readable format
function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Find large files recursively
async function findLargeFiles(directory, sizeLimit) {
	const largeFiles = [];

	async function scanDirectory(currentDir) {
		const files = await readdir(currentDir, { withFileTypes: true });

		for (const file of files) {
			const filePath = path.join(currentDir, file.name);

			// Skip node_modules and .git directories
			if (file.name === 'node_modules' || file.name === '.git') {
				continue;
			}

			if (file.isDirectory()) {
				await scanDirectory(filePath);
			} else {
				try {
					const stats = await stat(filePath);

					if (stats.size > sizeLimit) {
						largeFiles.push({
							path: filePath,
							size: stats.size,
							formattedSize: formatBytes(stats.size),
						});
					}
				} catch (error) {
					console.error(`Error checking file ${filePath}:`, error.message);
				}
			}
		}
	}

	await scanDirectory(directory);
	return largeFiles;
}

// Main function
async function main() {
	console.log(
		`\nFinding files larger than ${formatBytes(sizeLimit)} in '${rootDir}'...\n`
	);

	try {
		const largeFiles = await findLargeFiles(rootDir, sizeLimit);

		// Sort by size (largest first)
		largeFiles.sort((a, b) => b.size - a.size);

		if (largeFiles.length === 0) {
			console.log(`No files larger than ${formatBytes(sizeLimit)} found.`);
		} else {
			console.log(
				`Found ${largeFiles.length} files larger than ${formatBytes(
					sizeLimit
				)}:\n`
			);

			// Calculate total size
			const totalSize = largeFiles.reduce((sum, file) => sum + file.size, 0);

			// Display each file
			largeFiles.forEach((file, index) => {
				console.log(`${index + 1}. ${file.path} (${file.formattedSize})`);
			});

			console.log(`\nTotal size of large files: ${formatBytes(totalSize)}`);

			if (rootDir === 'public' || rootDir.includes('public')) {
				console.log(
					`\nTip: Consider moving large files to a CDN or storage service to avoid Vercel deployment issues.`
				);
			}
		}
	} catch (error) {
		console.error('Error:', error.message);
		process.exit(1);
	}
}

main();
