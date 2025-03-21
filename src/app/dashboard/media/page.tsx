'use client';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { motion } from 'framer-motion';
import {
	Copy,
	Download,
	FileImage,
	Loader2,
	Search,
	Trash,
	Upload,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Define types for our media items
type MediaItem = {
	id: string;
	name: string;
	url: string;
	size: number;
	created_at: string;
	content_type: string;
	bucket: string;
	path: string;
};

export default function MediaPage() {
	const { t } = useTranslation();
	const { isAuthenticated } = useAuth();
	const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
	const [selectedItems, setSelectedItems] = useState<string[]>([]);
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	// Fetch media items from Supabase storage
	useEffect(() => {
		if (!isAuthenticated) return;

		const fetchMediaItems = async () => {
			setLoading(true);
			try {
				// List all files in the public bucket
				const { data, error } = await supabase.storage.from('public').list();

				if (error) throw error;

				// Get URLs and metadata for each file
				const mediaItemsWithUrls = await Promise.all(
					data
						.filter((item) => !item.id.endsWith('/'))
						.map(async (item) => {
							const { data: urlData } = supabase.storage
								.from('public')
								.getPublicUrl(item.name);

							return {
								id: item.id,
								name: item.name,
								url: urlData.publicUrl,
								size: item.metadata?.size || 0,
								created_at: item.created_at || new Date().toISOString(),
								content_type: item.metadata?.mimetype || 'image/jpeg',
								bucket: 'public',
								path: item.name,
							};
						})
				);

				setMediaItems(mediaItemsWithUrls);
				setFilteredItems(mediaItemsWithUrls);
			} catch (error) {
				console.error('Error fetching media items:', error);
				toast.error('Failed to load media items');
			} finally {
				setTimeout(() => {
					setLoading(false);
				}, 300); // Small delay to prevent flickering
			}
		};

		fetchMediaItems();
	}, [isAuthenticated, refreshTrigger]);

	// Filter media items when search query changes
	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredItems(mediaItems);
			return;
		}

		const query = searchQuery.toLowerCase();
		const filtered = mediaItems.filter((item) =>
			item.name.toLowerCase().includes(query)
		);

		setFilteredItems(filtered);
	}, [searchQuery, mediaItems]);

	// Handle file upload
	const handleFileUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const files = event.target.files;
		if (!files || files.length === 0) return;

		setUploading(true);

		try {
			const uploadPromises = Array.from(files).map(async (file) => {
				// Create a unique file path
				const fileExt = file.name.split('.').pop();
				const fileName = `uploads/${Math.random().toString(36).substring(2)}_${
					file.name
				}`;

				// Upload the file to Supabase storage
				const { error: uploadError } = await supabase.storage
					.from('public')
					.upload(fileName, file, { upsert: true });

				if (uploadError) throw uploadError;

				return fileName;
			});

			await Promise.all(uploadPromises);
			toast.success('Files uploaded successfully');

			// Refresh the media items list
			setRefreshTrigger((prev) => prev + 1);
		} catch (error) {
			console.error('Error uploading files:', error);
			toast.error('Failed to upload files');
		} finally {
			setUploading(false);
			// Clear the file input
			event.target.value = '';
		}
	};

	// Handle file deletion
	const handleDelete = async (path: string) => {
		if (!confirm('Are you sure you want to delete this file?')) return;

		try {
			const { error } = await supabase.storage.from('public').remove([path]);

			if (error) throw error;

			toast.success('File deleted successfully');

			// Remove the deleted item from the state
			setMediaItems((prev) => prev.filter((item) => item.path !== path));
			setFilteredItems((prev) => prev.filter((item) => item.path !== path));
			setSelectedItems((prev) => prev.filter((id) => id !== path));
		} catch (error) {
			console.error('Error deleting file:', error);
			toast.error('Failed to delete file');
		}
	};

	// Handle bulk deletion
	const handleBulkDelete = async () => {
		if (selectedItems.length === 0) return;

		if (
			!confirm(`Are you sure you want to delete ${selectedItems.length} files?`)
		)
			return;

		try {
			const { error } = await supabase.storage
				.from('public')
				.remove(selectedItems);

			if (error) throw error;

			toast.success(`${selectedItems.length} files deleted successfully`);

			// Remove the deleted items from the state
			setMediaItems((prev) =>
				prev.filter((item) => !selectedItems.includes(item.path))
			);
			setFilteredItems((prev) =>
				prev.filter((item) => !selectedItems.includes(item.path))
			);
			setSelectedItems([]);
		} catch (error) {
			console.error('Error deleting files:', error);
			toast.error('Failed to delete files');
		}
	};

	// Handle copy URL to clipboard
	const handleCopyUrl = (url: string) => {
		navigator.clipboard
			.writeText(url)
			.then(() => toast.success('URL copied to clipboard'))
			.catch(() => toast.error('Failed to copy URL'));
	};

	// Format file size
	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';

		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	// Toggle item selection
	const toggleItemSelection = (path: string) => {
		setSelectedItems((prev) =>
			prev.includes(path) ? prev.filter((id) => id !== path) : [...prev, path]
		);
	};

	// Check if an item is an image
	const isImage = (contentType: string): boolean => {
		return contentType.startsWith('image/');
	};

	return (
		<>
			<div className="mb-8">
				<h1 className="text-2xl font-bold">
					{t('dashboard.media.title') || 'Media Library'}
				</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">
					{t('dashboard.media.description') ||
						'Upload and manage images and files'}
				</p>
			</div>

			{/* Actions Bar */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
				<div className="relative w-full sm:w-64 md:w-96">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
					<input
						type="text"
						placeholder={t('dashboard.search') || 'Search files...'}
						className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				<div className="flex gap-2 w-full sm:w-auto">
					{selectedItems.length > 0 && (
						<button
							onClick={handleBulkDelete}
							className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
						>
							<Trash className="h-4 w-4" />
							<span>Delete Selected ({selectedItems.length})</span>
						</button>
					)}

					<label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
						<input
							type="file"
							multiple
							accept="image/*"
							className="hidden"
							onChange={handleFileUpload}
							disabled={uploading}
						/>
						{uploading ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>Uploading...</span>
							</>
						) : (
							<>
								<Upload className="h-4 w-4" />
								<span>Upload Files</span>
							</>
						)}
					</label>
				</div>
			</div>

			{/* Media Grid */}
			{loading ? (
				<div className="flex justify-center items-center h-64">
					<Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{filteredItems.map((item) => (
						<motion.div
							key={item.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
							className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group"
						>
							<div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
								{isImage(item.content_type) ? (
									<Image
										src={item.url}
										alt={item.name}
										fill
										className="object-cover"
										sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
										priority
									/>
								) : (
									<div className="flex items-center justify-center h-full">
										<FileImage className="h-16 w-16 text-gray-400" />
									</div>
								)}

								{/* Overlay with actions */}
								<div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
									<button
										onClick={() => handleCopyUrl(item.url)}
										className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
										title="Copy URL"
									>
										<Copy className="h-5 w-5 text-gray-700" />
									</button>
									<a
										href={item.url}
										download
										target="_blank"
										rel="noopener noreferrer"
										className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
										title="Download"
									>
										<Download className="h-5 w-5 text-gray-700" />
									</a>
									<button
										onClick={() => handleDelete(item.path)}
										className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
										title="Delete"
									>
										<Trash className="h-5 w-5 text-red-600" />
									</button>
								</div>

								{/* Selection checkbox */}
								<div className="absolute top-2 left-2">
									<input
										type="checkbox"
										checked={selectedItems.includes(item.path)}
										onChange={() => toggleItemSelection(item.path)}
										className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
								</div>
							</div>

							<div className="p-3">
								<p className="text-sm font-medium truncate" title={item.name}>
									{item.name.split('/').pop()}
								</p>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									{formatFileSize(item.size)} •{' '}
									{new Date(item.created_at).toLocaleDateString()}
								</p>
							</div>
						</motion.div>
					))}

					{filteredItems.length === 0 && (
						<div className="col-span-full flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
							{searchQuery ? (
								<>
									<p className="text-gray-500 dark:text-gray-400 mb-4 text-center">
										No files found matching "{searchQuery}"
									</p>
									<button
										onClick={() => setSearchQuery('')}
										className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
									>
										Clear Search
									</button>
								</>
							) : (
								<>
									<FileImage className="h-16 w-16 text-gray-400 mb-4" />
									<p className="text-gray-500 dark:text-gray-400 mb-4 text-center">
										No media files found. Upload your first file to get started.
									</p>
									<label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
										<input
											type="file"
											multiple
											accept="image/*"
											className="hidden"
											onChange={handleFileUpload}
											disabled={uploading}
										/>
										<Upload className="h-4 w-4" />
										<span>Upload Files</span>
									</label>
								</>
							)}
						</div>
					)}
				</div>
			)}
		</>
	);
}
