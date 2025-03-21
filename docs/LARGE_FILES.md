# Handling Large Files in the Ophthalmology Association Web

This document provides guidance on handling large files in the project, particularly when deploying to Vercel.

## The Problem

Vercel has a 300MB size limit for serverless functions. If your API routes reference files from the `public` directory, Vercel might include those files in the serverless function bundle, leading to the error:

```
Error: The Serverless Function "api/fileExists" is X MB which exceeds the maximum size limit of 300MB.
```

## Solution Implementation - STRICT APPROACH

We've implemented the following aggressive solutions to work around this limitation:

1. **Modified API Routes:**

   - **Complete isolation of APIs from large files**:
     - `fileExists` API: No filesystem access in production
     - `getDirectoryContents` API: Relies entirely on a static directory map
   - **Environment-specific behavior**:
     - Development: Uses filesystem access for convenience
     - Production: Uses HTTP HEAD requests and known file maps

2. **Enhanced `vercel.json` configuration:**

   - Completely excludes the entire `previous_congresses` directory from serverless functions
   - Additionally excludes `.next` and `node_modules` directories for safety

3. **Static Content Maps:**
   - Expanded predefined maps of directories and files
   - Returns empty arrays for unknown paths rather than 404 errors

## File Access Strategy

Our approach differs by environment:

### Development Environment

- Direct filesystem access for convenience and accurate local development
- Shows exact errors and file statuses

### Production Environment

- **No direct filesystem access** for any files
- Images checked via HTTP HEAD requests
- Large documents (PDFs) assumed to exist
- Directory contents pulled from static maps

## Best Practices for Large Files

1. **Prefer image files over PDFs for visuals:**

   - Use JPG files instead of PDFs whenever possible for banners, posters, etc.
   - Convert PDF posters to JPG format (max 1MB size) for better performance

2. **Optimize all files:**

   - Compress images before adding to the project
   - Aim for < 100KB for thumbnail images
   - Keep main images under 500KB when possible

3. **For very large files (>50MB), consider external storage:**
   - Supabase Storage
   - AWS S3
   - Cloudinary
   - Vercel Blob Storage

## Directory Structure

The expected directory structure for congress files is:

```
public/
  previous_congresses/
    YYYYMMDD-title_with_underscores-city/
      affiche.jpg       # Preferred poster format (< 500KB)
      affiche.pdf       # Alternative poster format
      programme.pdf     # Congress program
      photos/           # Directory containing congress photos
        image1.jpg
        image2.jpg
        ...
```

## When Adding New Congress Files

When adding new congress content:

1. **Update the Static Maps**:

   - Add the new congress directory to `directoryMap` in `src/app/api/getDirectoryContents/route.ts`
   - Include all major files and subfolders

2. **Optimize Images**:

   - Convert PDFs to JPGs where possible
   - Compress all images to reduce size

3. **Test in Development**:
   - Verify that all files load correctly
   - Check both image and non-image content

## Troubleshooting Deployment Issues

If you're still seeing the serverless function size limit error:

1. **Deploy with Debug Info**:

   ```
   vercel --debug
   ```

2. **Check for Large Files**:

   ```
   npm run find-large-files
   ```

3. **Further Restrict API Functions**:

   - Consider adding more specific exclusions in `vercel.json`
   - Move large files to external storage

4. **Contact Vercel Support**:
   - If issues persist, Vercel support can help diagnose
   - Consider upgrading to a Vercel plan with larger function limits

## Additional Resources

- [Vercel Serverless Functions Size Limits](https://vercel.com/docs/functions/serverless-functions/runtimes#size-limits)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Vercel Function Configuration](https://vercel.com/docs/functions/serverless-functions/runtimes#including-additional-files)
