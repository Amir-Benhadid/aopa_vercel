'use client';

import { supabase } from '@/lib/supabase';
import { Loader2, X } from 'lucide-react';
import { useState } from 'react';
import ImageUploader from './ImageUploader';

interface AddContentFormProps {
	tableName: 'congresses' | 'activities';
	onSuccess: () => void;
	onCancel: () => void;
}

export default function AddContentForm({
	tableName,
	onSuccess,
	onCancel,
}: AddContentFormProps) {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [type, setType] = useState(
		tableName === 'congresses' ? 'in-person' : 'atelier'
	);
	const [price, setPrice] = useState('0');
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Add a helper function to format image URLs
	const formatImageUrl = (url: string | null): string | null => {
		if (!url) return null;

		// If it's already an absolute URL (starts with http:// or https://), return as is
		if (url.startsWith('http://') || url.startsWith('https://')) {
			return url;
		}

		// If it's a relative path without a leading slash, we keep it as is
		// because Supabase will store it as a relative path

		return url;
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title || !startDate || !endDate) {
			setError('Please fill in all required fields');
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			// Create base data object
			const baseData = {
				title,
				description: description || null,
				start_date: startDate,
				end_date: endDate,
			};

			// Add table-specific fields
			let data;
			if (tableName === 'congresses') {
				data = {
					...baseData,
					congress_type: type as 'in-person' | 'virtual' | 'hybrid',
					banner: formatImageUrl(imageUrl),
					state: 1, // Active by default
				};
			} else {
				data = {
					...baseData,
					type: type as 'atelier' | 'wetlab' | 'cour' | 'lunch-symposium',
					price: parseFloat(price),
				};
			}

			// Insert data into Supabase
			const { error: insertError } = await supabase
				.from(tableName)
				.insert(data);

			if (insertError) throw insertError;

			// Call success callback
			onSuccess();
		} catch (error: any) {
			console.error(`Error adding ${tableName.slice(0, -1)}:`, error);
			setError(error.message || `Error adding ${tableName.slice(0, -1)}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-xl font-semibold">
					Add New {tableName === 'congresses' ? 'Congress' : 'Activity'}
				</h2>
				<button
					onClick={onCancel}
					className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
				>
					<X className="h-5 w-5" />
				</button>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Title */}
				<div>
					<label
						htmlFor="title"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
					>
						Title <span className="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
						placeholder="Enter title"
						required
					/>
				</div>

				{/* Description */}
				<div>
					<label
						htmlFor="description"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
					>
						Description
					</label>
					<textarea
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
						placeholder="Enter description"
						rows={4}
					/>
				</div>

				{/* Dates */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label
							htmlFor="startDate"
							className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>
							Start Date <span className="text-red-500">*</span>
						</label>
						<input
							type="date"
							id="startDate"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
							required
						/>
					</div>
					<div>
						<label
							htmlFor="endDate"
							className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>
							End Date <span className="text-red-500">*</span>
						</label>
						<input
							type="date"
							id="endDate"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
							required
						/>
					</div>
				</div>

				{/* Type */}
				<div>
					<label
						htmlFor="type"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
					>
						Type <span className="text-red-500">*</span>
					</label>
					<select
						id="type"
						value={type}
						onChange={(e) => setType(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
						required
					>
						{tableName === 'congresses' ? (
							<>
								<option value="in-person">In Person</option>
								<option value="virtual">Virtual</option>
								<option value="hybrid">Hybrid</option>
							</>
						) : (
							<>
								<option value="atelier">Atelier</option>
								<option value="wetlab">Wetlab</option>
								<option value="cour">Cour</option>
								<option value="lunch-symposium">Lunch Symposium</option>
							</>
						)}
					</select>
				</div>

				{/* Price (only for activities) */}
				{tableName === 'activities' && (
					<div>
						<label
							htmlFor="price"
							className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
						>
							Price <span className="text-red-500">*</span>
						</label>
						<input
							type="number"
							id="price"
							value={price}
							onChange={(e) => setPrice(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
							min="0"
							step="0.01"
							required
						/>
					</div>
				)}

				{/* Image Upload (only for congresses) */}
				{tableName === 'congresses' && (
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Banner Image
						</label>
						<ImageUploader
							currentImageUrl={imageUrl}
							onImageUploaded={setImageUrl}
							tableName="temp"
							itemId="new"
							aspectRatio="banner"
							className="h-40"
						/>
					</div>
				)}

				{/* Error message */}
				{error && (
					<div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-sm rounded">
						{error}
					</div>
				)}

				{/* Form actions */}
				<div className="flex justify-end space-x-3">
					<button
						type="button"
						onClick={onCancel}
						className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
						disabled={isSubmitting}
					>
						Cancel
					</button>
					<button
						type="submit"
						className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
								Saving...
							</>
						) : (
							'Save'
						)}
					</button>
				</div>
			</form>
		</div>
	);
}
