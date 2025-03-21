# Congress Image Handling System

This document explains how images are handled in the Ophthalmology Association Web application, particularly for congress events.

## Overview

The application now uses a numeric-based approach to load congress images. Instead of checking for specific files or using complex directory listing, we use a numeric count stored in the `congress.images` field to determine how many images are available.

## How It Works

### Image Storage Structure

For each congress, images should be stored in the following structure:

```
/public/previous_congresses/[YEAR]_[LOCATION]_[TITLE]/
├── 1.pdf             # Main poster file (PDF or PPT)
├── 1.ppt             # Alternative poster format
├── e-posters/        # Directory for e-posters
│   ├── poster1.pdf   # First e-poster
│   ├── poster2.pdf   # Second e-poster
│   └── ...           # Additional e-posters
└── photos/           # Directory for congress photos
    ├── 1.jpg         # First photo
    ├── 2.jpg         # Second photo
    ├── 3.jpg         # Third photo
    └── ...           # Additional photos
```

### Database Fields

In Supabase, the congress record should include:

- `images`: A number indicating how many sequentially numbered images (1.jpg, 2.jpg, etc.) exist in the photos directory
- `eposters`: An array of filenames to be loaded from the e-posters directory
- `image`: (Optional) A fallback image URL if no photos are found
- `banner`: (Optional) Another fallback image option

### Loading Process

1. The application constructs the folder path based on the congress metadata (date, location, title)
2. If `congress.images` is a number > 0, it generates paths for each numbered image (1.jpg, 2.jpg, etc.)
3. For poster display, it tries to load `1.pdf` or `1.ppt` from the congress folder
4. For e-posters, it constructs paths for each filename in the `congress.eposters` array
5. If no images are found, it falls back to the `congress.image` or `congress.banner` fields
6. As a last resort, it uses a default image

## Implementation Details

### Key Components

1. **EventCard Component**: Displays a single congress with its poster
2. **Home Page Carousel**: Shows a rotating selection of congress photos
3. **Archives Page**: Displays all past congresses with their images
4. **PreviousEvents Component**: Shows recent past events with their images
5. **E-Posters**: Displays e-posters associated with a congress

### API Approach

The application uses a simplified API approach:

- `fileExists` API: Always returns `true` to avoid filesystem access on the server
- No directory listing API is needed anymore
- Client-side components handle missing images gracefully with fallbacks
- Browser naturally handles any 404 errors for missing files

## Adding New Congress Materials

When adding a new congress:

1. Create the appropriate folder structure in `/public/previous_congresses/`
2. Name the main poster as `1.pdf` or `1.ppt`
3. Add numbered photos to the `photos` subdirectory (1.jpg, 2.jpg, etc.)
4. Add e-posters to the `e-posters` subdirectory with descriptive filenames
5. Update the database record with:
   - The correct `images` count (number of photos)
   - The array of e-poster filenames in `eposters` field

## Troubleshooting

If images don't display correctly:

1. Verify the folder structure matches the expected format
2. Check that image filenames follow the numeric pattern (1.jpg, 2.jpg, etc.)
3. Ensure the `congress.images` field contains the correct number of images
4. Look at browser console logs for any image loading errors

## Benefits

This approach offers several advantages:

- Simplified code that doesn't rely on complex directory listing
- Smaller serverless functions that don't bundle large assets
- Faster loading through predictable image paths
- Better error handling with multiple fallback mechanisms
