'use client';

import { supabase } from '@/lib/supabase';
import { Edit, Image as ImageIcon, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ImageUploaderProps {
	currentImageUrl: string | null;
	onImageUploaded: (url: string) => void;
	tableName: string;
	itemId: string;
	className?: string;
	aspectRatio?: 'square' | 'video' | 'banner';
	onError?: () => void;
}

// Default fallback image from public directory
const FALLBACK_IMAGE = '/banners/default-banner.jpg';

export default function ImageUploader({
	currentImageUrl,
	onImageUploaded,
	tableName,
	itemId,
	className = '',
	aspectRatio = 'square',
	onError,
}: ImageUploaderProps) {
	const [uploading, setUploading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [imgError, setImgError] = useState(false);

	// Initialize previewUrl from currentImageUrl
	useEffect(() => {
		setPreviewUrl(currentImageUrl);
	}, [currentImageUrl]);

	// Calculate aspect ratio class
	const aspectRatioClass =
		aspectRatio === 'square'
			? 'aspect-square'
			: aspectRatio === 'video'
			? 'aspect-video'
			: 'aspect-[3/1]';

	// Format image URL to ensure it has a leading slash if it's a relative path
	const formatImageUrl = (url: string | null): string => {
		if (!url) return FALLBACK_IMAGE;

		// If it's already an absolute URL (starts with http:// or https://), return as is
		if (url.startsWith('http://') || url.startsWith('https://')) {
			return url;
		}

		// If it's a relative path without a leading slash, add one
		if (!url.startsWith('/')) {
			return `/${url}`;
		}

		return url;
	};

	const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		const fileType = file.type;
		if (!fileType.startsWith('image/')) {
			setError('Please upload an image file');
			return;
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			setError('Image size should be less than 5MB');
			return;
		}

		setError(null);
		setUploading(true);
		setImgError(false);

		try {
			// Create a preview URL
			const objectUrl = URL.createObjectURL(file);
			setPreviewUrl(objectUrl);

			// Create a unique file path
			const fileExt = file.name.split('.').pop();
			const fileName = `${tableName}/${itemId}/${Math.random()
				.toString(36)
				.substring(2)}.${fileExt}`;
			const filePath = `${fileName}`;

			// Upload the file to Supabase storage
			const { error: uploadError } = await supabase.storage
				.from('public')
				.upload(filePath, file, { upsert: true });

			if (uploadError) throw uploadError;

			// Get the public URL
			const { data: publicUrlData } = supabase.storage
				.from('public')
				.getPublicUrl(filePath);

			// Call the callback with the new URL
			onImageUploaded(publicUrlData.publicUrl);
		} catch (error: any) {
			console.error('Error uploading image:', error);
			setError(error.message || 'Error uploading image');
			// Revert to original image if there was an error
			setPreviewUrl(currentImageUrl);
		} finally {
			setUploading(false);
		}
	};

	const handleRemoveImage = () => {
		setPreviewUrl(null);
		setImgError(false);
		onImageUploaded('');
	};

	const handleImageError = () => {
		console.error('Image failed to load:', previewUrl);
		setImgError(true);
		if (onError) {
			onError();
		}
	};

	// Determine which image to display
	const displayImageUrl =
		imgError || !previewUrl ? FALLBACK_IMAGE : formatImageUrl(previewUrl);

	return (
		<div
			className={`relative group ${aspectRatioClass} bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden ${className}`}
		>
			{previewUrl || imgError ? (
				<>
					<Image
						src={displayImageUrl}
						alt="Uploaded image"
						className="object-cover w-full h-full"
						fill
						onError={handleImageError}
						priority
					/>
					<div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
						<label className="cursor-pointer p-2 bg-white dark:bg-gray-800 rounded-full">
							<input
								type="file"
								accept="image/*"
								className="hidden"
								onChange={handleUpload}
								disabled={uploading}
							/>
							{uploading ? (
								<Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
							) : (
								<Edit className="h-5 w-5 text-gray-700 dark:text-gray-300" />
							)}
						</label>
						<button
							onClick={handleRemoveImage}
							className="p-2 bg-white dark:bg-gray-800 rounded-full"
						>
							<X className="h-5 w-5 text-red-600 dark:text-red-400" />
						</button>
					</div>
				</>
			) : (
				<div className="flex flex-col items-center justify-center h-full p-4">
					<ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
					<p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-3">
						No image uploaded
					</p>
					<label className="cursor-pointer px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
						<input
							type="file"
							accept="image/*"
							className="hidden"
							onChange={handleUpload}
							disabled={uploading}
						/>
						{uploading ? 'Uploading...' : 'Upload Image'}
					</label>
				</div>
			)}

			{error && (
				<div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs p-1 text-center">
					{error}
				</div>
			)}
		</div>
	);
}
