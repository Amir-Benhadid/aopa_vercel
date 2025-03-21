# Fixing Vercel Serverless Function Size Limit

## Problem

Vercel serverless functions have a 300MB size limit. Our `api/fileExists` function was exceeding this limit (592.98MB) because it was bundling the large files from the `public/previous_congresses` directory.

## Solution Summary

We've implemented a **zero-file-access approach** in production to solve this problem:

1. **Modified `vercel.json`**

   - Completely excludes the entire `previous_congresses` directory from all API routes
   - Also excludes `.next` and `node_modules` directories

2. **Rewritten `fileExists` API**

   - In development: Uses filesystem access for testing
   - In production:
     - Images: Uses HTTP HEAD requests
     - PDFs and docs: Assumes they exist
     - No filesystem access at all

3. **Rewritten `getDirectoryContents` API**
   - In development: Uses filesystem access
   - In production: Relies entirely on pre-defined static maps
   - Returns empty arrays for unknown paths rather than errors

## How It Works

1. When a component needs to check if a file exists:

   - The API never tries to access the file system in production
   - For images, it makes an HTTP HEAD request to check
   - For PDFs and other large files, it simply assumes they exist

2. When a component needs to list files in a directory:
   - The API looks up the directory contents in a static map
   - If the directory isn't in the map, it returns an empty array

## Why This Works

This approach completely isolates API routes from the filesystem at runtime, preventing Vercel from bundling the large files with the serverless function.

## What To Do When Adding New Files

When adding new congress files:

1. Update the directory map in `src/app/api/getDirectoryContents/route.ts`
2. Prefer JPG images over PDFs
3. Optimize all images to be as small as possible

## Testing The Fix

After deploying, verify that:

1. The Vercel build succeeds without size errors
2. Images display correctly on the site
3. PDF files are accessible

For more detailed information, see the full documentation in `docs/LARGE_FILES.md`.
