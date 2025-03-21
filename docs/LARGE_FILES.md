# Handling Large Files in the Ophthalmology Association Web

This document provides guidance on handling large files in the project, particularly when deploying to Vercel.

## The Problem

Vercel has a 300MB size limit for serverless functions. If your API routes reference files from the `public` directory, Vercel might include those files in the serverless function bundle, leading to the error:

```
Error: The Serverless Function "api/fileExists" is X MB which exceeds the maximum size limit of 300MB.
```

## Solution

We've implemented the following solutions to work around this limitation:

1. **Modified API Routes:**

   - Optimized `fileExists` API to handle different file types appropriately:
     - Small files (images): Uses direct filesystem access
     - Large files (PDFs): Uses HTTP requests or assumed presence
   - Updated `getDirectoryContents` API to use a static map of known directories

2. **Added `vercel.json` configuration:**

   - We've explicitly told Vercel to exclude large files (PDFs, etc.) from API routes while keeping images available.

3. **Improved front-end components:**

   - Added better error handling and fallbacks for images
   - Added support for multiple image formats and progressive enhancement

4. **Created utility functions:**
   - `checkFileExists`: Checks if a file exists at a given path
   - `getCongressImage`: Gets the best available image for a congress
   - `getCongressPhotos`: Gets photos from a congress photos directory

## File Type Strategy

We use different strategies for different file types:

### Images (JPG, PNG, etc.)

- Accessed directly, as they're small enough not to cause size issues
- Can be directly referenced in the filesystem

### Large Documents (PDF, DOCX, etc.)

- Excluded from serverless function bundling
- Accessed via HTTP requests or assumed presence
- Displayed using appropriate viewers (iframes for PDFs)

## Best Practices for Large Files

1. **Prefer image files over PDFs for visuals:**

   - Use JPG files instead of PDFs whenever possible for banners, posters, etc.
   - Convert PDF posters to JPG format for better performance

2. **Optimize large files:**

   - Compress PDFs before adding them to the project
   - Convert large images to more efficient formats (WebP)

3. **For very large files (>50MB), consider alternative storage:**
   - Supabase Storage
   - AWS S3
   - Cloudinary
   - Vercel Blob Storage

## Known Folders

For the directory listing feature, we maintain a static map of known directories in the codebase. When you add new congress folders or images, make sure to:

1. Add the new congress folder to the `directoryMap` in `src/app/api/getDirectoryContents/route.ts`
2. Include all major files and subfolders in the mapping
3. Prefer JPG images over PDFs for poster images

## Directory Structure

The expected directory structure for congress files is:

```
public/
  previous_congresses/
    YYYYMMDD-title_with_underscores-city/
      affiche.jpg       # Preferred poster format
      affiche.pdf       # Alternative poster format
      programme.pdf     # Congress program
      photos/           # Directory containing congress photos
        image1.jpg
        image2.jpg
        ...
```

## Troubleshooting Image Display Issues

If images stop displaying after deployment:

1. **Check API Responses:**

   - Open your browser's network tab and check responses from `/api/fileExists` and `/api/getDirectoryContents`
   - Ensure they're returning the expected data

2. **Verify File Paths:**

   - Double-check that image paths are correctly formed
   - Ensure files exist in the expected locations

3. **Update Directory Map:**

   - If you've added new congress directories or files, make sure to update the static map in `getDirectoryContents/route.ts`

4. **Check for 404 Errors:**

   - If you see 404 errors for images, verify the file paths and ensure they're accessible

5. **Utility Functions:**
   - Use our utility functions in `src/lib/utils.ts` to consistently handle image loading:
     - `getCongressImage(congress)`: Gets the best available image for a congress
     - `getCongressPhotos(congress)`: Gets all photos for a congress

## Monitoring File Sizes

Use our built-in script to identify large files before deployment:

```bash
npm run find-large-files
```

This will show files larger than 5MB in the public directory.

## Additional Resources

- [Vercel Serverless Functions Size Limits](https://vercel.com/docs/functions/serverless-functions/runtimes#size-limits)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
