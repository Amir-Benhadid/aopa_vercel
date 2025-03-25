'use client';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Database } from '@/types/supabase';
import { motion } from 'framer-motion';
import {
	Calendar,
	ChevronLeft,
	Copy,
	Download,
	FileImage,
	Folder,
	FolderPlus,
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
	isFolder?: boolean;
};

type Congress = Database['public']['Tables']['congresses']['Row'];

export default function MediaPage() {
	const { t } = useTranslation();
	const { isAuthenticated } = useAuth();
	const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
	const [directories, setDirectories] = useState<string[]>([]);
	const [congresses, setCongresses] = useState<Congress[]>([]);
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
	const [selectedItems, setSelectedItems] = useState<string[]>([]);
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const [currentPath, setCurrentPath] = useState('');
	const [newFolderName, setNewFolderName] = useState('');
	const [showNewFolderInput, setShowNewFolderInput] = useState(false);
	const [isCreatingFolder, setIsCreatingFolder] = useState(false);

	// Fetch media items from Supabase storage
	useEffect(() => {
		if (!isAuthenticated) return;

		const fetchMediaItems = async () => {
			setLoading(true);
			try {
				// List all files in the current directory
				const { data, error } = await supabase.storage
					.from('public')
					.list(currentPath);

				if (error) throw error;

				// Create array for folders/directories
				const folders = data
					.filter((item) => item.id.endsWith('/'))
					.map((folder) => ({
						id: folder.id,
						name: folder.name,
						url: '',
						size: 0,
						created_at: folder.created_at || new Date().toISOString(),
						content_type: 'folder',
						bucket: 'public',
						path: `${currentPath}${folder.name}`,
						isFolder: true,
					}));

				// Get URLs and metadata for each file
				const filesPromises = data
					.filter((item) => !item.id.endsWith('/'))
					.map(async (item) => {
						const { data: urlData } = supabase.storage
							.from('public')
							.getPublicUrl(`${currentPath}${item.name}`);

						return {
							id: item.id,
							name: item.name,
							url: urlData.publicUrl,
							size: item.metadata?.size || 0,
							created_at: item.created_at || new Date().toISOString(),
							content_type: item.metadata?.mimetype || 'image/jpeg',
							bucket: 'public',
							path: `${currentPath}${item.name}`,
							isFolder: false,
						};
					});

				const files = await Promise.all(filesPromises);
				const allItems = [...folders, ...files];

				setMediaItems(allItems);
				setFilteredItems(allItems);
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
	}, [isAuthenticated, refreshTrigger, currentPath]);

	// Scan for existing congress libraries
	useEffect(() => {
		if (!isAuthenticated || currentPath !== '' || !congresses.length) return;

		const scanForExistingLibraries = async () => {
			try {
				// First, list all directories at the root level
				const { data, error } = await supabase.storage.from('public').list();

				if (error) throw error;

				// Extract folder names
				const existingFolders = data
					.filter((item) => item.id.endsWith('/'))
					.map((folder) => folder.name);

				// Check for congress folders that might not follow the naming convention
				for (const folder of existingFolders) {
					if (folder.startsWith('congress_')) {
						// Add to directories state if it's not already there
						setDirectories((prev) =>
							prev.includes(folder) ? prev : [...prev, folder]
						);
					}
				}
			} catch (error) {
				console.error('Error scanning for libraries:', error);
			}
		};

		scanForExistingLibraries();
	}, [isAuthenticated, congresses, currentPath]);

	// Fetch congresses for folder creation
	useEffect(() => {
		if (!isAuthenticated) return;

		const fetchCongresses = async () => {
			try {
				const { data, error } = await supabase
					.from('congresses')
					.select('*')
					.is('deleted_at', null)
					.order('start_date', { ascending: false });

				if (error) throw error;
				setCongresses(data || []);
			} catch (error) {
				console.error('Error fetching congresses:', error);
			}
		};

		fetchCongresses();
	}, [isAuthenticated]);

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

	// Navigate to folder
	const navigateToFolder = (folderPath: string) => {
		setCurrentPath(folderPath);
		setSelectedItems([]);
		setSearchQuery('');
	};

	// Navigate up one level
	const navigateUp = () => {
		if (!currentPath) return;

		const pathParts = currentPath.split('/').filter(Boolean);
		pathParts.pop(); // Remove the last folder
		const newPath = pathParts.length > 0 ? `${pathParts.join('/')}/` : '';

		setCurrentPath(newPath);
		setSelectedItems([]);
	};

	// Create new folder
	const createNewFolder = async () => {
		if (!newFolderName.trim()) {
			toast.error('Folder name cannot be empty');
			return;
		}

		setIsCreatingFolder(true);

		try {
			// Create a placeholder file since Supabase storage doesn't support empty folders
			const folderPath = `${currentPath}${newFolderName}/placeholder`;
			const { error } = await supabase.storage
				.from('public')
				.upload(folderPath, new Blob([''], { type: 'text/plain' }), {
					upsert: true,
				});

			if (error) throw error;

			toast.success(`Folder "${newFolderName}" created successfully`);
			setNewFolderName('');
			setShowNewFolderInput(false);
			setRefreshTrigger((prev) => prev + 1);
		} catch (error) {
			console.error('Error creating folder:', error);
			toast.error('Failed to create folder');
		} finally {
			setIsCreatingFolder(false);
		}
	};

	// Create congress folder with more structure
	const createCongressFolder = async (congress: Congress) => {
		const folderName = `congress_${congress.id}/`;
		setIsCreatingFolder(true);

		try {
			// Create a placeholder file
			const folderPath = `${folderName}placeholder`;
			const { error } = await supabase.storage
				.from('public')
				.upload(folderPath, new Blob([''], { type: 'text/plain' }), {
					upsert: true,
				});

			if (error) throw error;

			// Create subfolders with better organization
			const subfolders = [
				'photos/event',
				'photos/speakers',
				'photos/participants',
				'videos/presentations',
				'videos/highlights',
				'posters',
				'abstracts',
				'documents',
			];

			for (const subfolder of subfolders) {
				const subfolderPath = `${folderName}${subfolder}/placeholder`;
				await supabase.storage
					.from('public')
					.upload(subfolderPath, new Blob([''], { type: 'text/plain' }), {
						upsert: true,
					});
			}

			// Add this folder to directories state
			setDirectories((prev) => [...prev, folderName]);

			toast.success(`Folders for "${congress.title}" created successfully`);
			setRefreshTrigger((prev) => prev + 1);
		} catch (error) {
			console.error('Error creating congress folders:', error);
			toast.error('Failed to create folders');
		} finally {
			setIsCreatingFolder(false);
		}
	};

	// Handle file upload
	const handleFileUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const files = event.target.files;
		if (!files || files.length === 0) return;

		setUploading(true);

		try {
			const uploadPromises = Array.from(files).map(async (file) => {
				// Create a file path that includes the current directory
				const fileName = `${currentPath}${file.name}`;

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

	// Handle folder deletion
	const handleDeleteFolder = async (folderPath: string) => {
		if (
			!confirm(
				`Are you sure you want to delete the folder "${folderPath
					.split('/')
					.filter(Boolean)
					.pop()}" and all its contents?`
			)
		)
			return;

		try {
			// List all files in the folder
			const { data, error: listError } = await supabase.storage
				.from('public')
				.list(folderPath);

			if (listError) throw listError;

			// Delete all files in the folder
			const filesToDelete = data.map((item) => `${folderPath}${item.name}`);

			if (filesToDelete.length > 0) {
				const { error: deleteError } = await supabase.storage
					.from('public')
					.remove(filesToDelete);

				if (deleteError) throw deleteError;
			}

			toast.success('Folder deleted successfully');
			setRefreshTrigger((prev) => prev + 1);
		} catch (error) {
			console.error('Error deleting folder:', error);
			toast.error('Failed to delete folder');
		}
	};

	// Handle bulk deletion
	const handleBulkDelete = async () => {
		if (selectedItems.length === 0) return;

		if (
			!confirm(`Are you sure you want to delete ${selectedItems.length} items?`)
		)
			return;

		try {
			const { error } = await supabase.storage
				.from('public')
				.remove(selectedItems);

			if (error) throw error;

			toast.success(`${selectedItems.length} items deleted successfully`);

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

	// Build breadcrumbs from current path
	const getBreadcrumbs = () => {
		if (!currentPath) return [{ name: 'Root', path: '' }];

		const parts = currentPath.split('/').filter(Boolean);
		let path = '';

		const crumbs = [{ name: 'Root', path: '' }];

		parts.forEach((part) => {
			path += `${part}/`;
			crumbs.push({ name: part, path });
		});

		return crumbs;
	};

	const breadcrumbs = getBreadcrumbs();

	return (
		<>
			<div className="mb-8">
				<h1 className="text-2xl font-bold">
					{t('dashboard.media.title') || 'Media Library'}
				</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">
					{t('dashboard.media.description') ||
						'Upload and manage images and files for events'}
				</p>
			</div>

			{/* Breadcrumbs */}
			<div className="flex items-center mb-4 overflow-x-auto whitespace-nowrap bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
				{breadcrumbs.map((crumb, index) => (
					<div key={index} className="flex items-center">
						{index > 0 && <span className="mx-2 text-gray-500">/</span>}
						<button
							onClick={() => navigateToFolder(crumb.path)}
							className={`px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
								index === breadcrumbs.length - 1
									? 'font-semibold text-blue-600 dark:text-blue-400'
									: 'text-gray-700 dark:text-gray-300'
							}`}
						>
							{crumb.name}
						</button>
					</div>
				))}
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

				<div className="flex flex-wrap gap-2 w-full sm:w-auto">
					{currentPath !== '' && (
						<button
							onClick={navigateUp}
							className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
						>
							<ChevronLeft className="h-4 w-4" />
							<span>Back</span>
						</button>
					)}

					{selectedItems.length > 0 && (
						<button
							onClick={handleBulkDelete}
							className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
						>
							<Trash className="h-4 w-4" />
							<span>Delete Selected ({selectedItems.length})</span>
						</button>
					)}

					<button
						onClick={() => setShowNewFolderInput(!showNewFolderInput)}
						className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
					>
						<FolderPlus className="h-4 w-4" />
						<span>New Folder</span>
					</button>

					<label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
						<input
							type="file"
							multiple
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

			{/* New Folder Input */}
			{showNewFolderInput && (
				<div className="flex items-center gap-2 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
					<input
						type="text"
						placeholder="Enter folder name"
						className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
						value={newFolderName}
						onChange={(e) => setNewFolderName(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && createNewFolder()}
					/>
					<button
						onClick={createNewFolder}
						disabled={isCreatingFolder}
						className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
					>
						{isCreatingFolder ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<FolderPlus className="h-4 w-4" />
						)}
						<span>Create</span>
					</button>
					<button
						onClick={() => {
							setShowNewFolderInput(false);
							setNewFolderName('');
						}}
						className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
					>
						Cancel
					</button>
				</div>
			)}

			{/* Congress Folders Section (show only in root directory) */}
			{currentPath === '' && (
				<div className="mb-8">
					<h2 className="text-lg font-semibold mb-4 flex items-center">
						<Folder className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
						Congress Libraries
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{congresses.map((congress) => {
							const folderPath = `congress_${congress.id}/`;
							const folderExists =
								mediaItems.some((item) => item.path === folderPath) ||
								directories.includes(folderPath);

							return (
								<div
									key={congress.id}
									className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
								>
									<h3 className="font-medium mb-2 truncate">
										{congress.title}
									</h3>
									<p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
										{new Date(congress.start_date).toLocaleDateString()} -{' '}
										{new Date(congress.end_date).toLocaleDateString()}
									</p>
									{folderExists ? (
										<button
											onClick={() => navigateToFolder(folderPath)}
											className="flex items-center space-x-2 w-full px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
										>
											<Folder className="h-4 w-4" />
											<span>Open Library</span>
										</button>
									) : (
										<button
											onClick={() => createCongressFolder(congress)}
											disabled={isCreatingFolder}
											className="flex items-center justify-center w-full px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
										>
											{isCreatingFolder ? (
												<>
													<Loader2 className="h-4 w-4 animate-spin mr-2" />
													<span>Creating...</span>
												</>
											) : (
												<>
													<FolderPlus className="h-4 w-4 mr-2" />
													<span>Create Library</span>
												</>
											)}
										</button>
									)}
								</div>
							);
						})}

						{congresses.length === 0 && (
							<div className="col-span-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
								<Calendar className="h-12 w-12 text-gray-400 mb-3" />
								<p className="text-gray-500 dark:text-gray-400 text-center">
									No congresses found. Create a congress first to organize your
									media.
								</p>
							</div>
						)}
					</div>
				</div>
			)}

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
							{item.isFolder ? (
								// Render folder
								<div
									className="relative aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center cursor-pointer"
									onClick={() => navigateToFolder(item.path)}
								>
									<Folder className="h-24 w-24 text-blue-400" />

									{/* Folder actions */}
									<div className="absolute top-2 right-2 flex gap-1">
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteFolder(item.path);
											}}
											className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
											title="Delete Folder"
										>
											<Trash className="h-4 w-4 text-red-600" />
										</button>
									</div>
								</div>
							) : (
								// Render file
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

									{/* File actions overlay */}
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
							)}

							<div className="p-3">
								<p className="text-sm font-medium truncate" title={item.name}>
									{item.name.split('/').pop()}
								</p>
								{!item.isFolder && (
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
										{formatFileSize(item.size)} •{' '}
										{new Date(item.created_at).toLocaleDateString()}
									</p>
								)}
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
										No files found in this directory. Upload files or create
										folders to get started.
									</p>
									<div className="flex gap-2">
										<button
											onClick={() => setShowNewFolderInput(true)}
											className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
										>
											<FolderPlus className="h-4 w-4" />
											<span>New Folder</span>
										</button>
										<label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
											<input
												type="file"
												multiple
												className="hidden"
												onChange={handleFileUpload}
												disabled={uploading}
											/>
											<Upload className="h-4 w-4" />
											<span>Upload Files</span>
										</label>
									</div>
								</>
							)}
						</div>
					)}
				</div>
			)}
		</>
	);
}
