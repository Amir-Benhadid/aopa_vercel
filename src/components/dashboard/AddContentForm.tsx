'use client';

import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Calendar, Clock, Info, Loader2, MapPin, Tag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ImageUploader from './ImageUploader';

// Define Tag type
type Tag = {
	label: string;
	color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'gray';
};

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
	const [startTime, setStartTime] = useState('09:00');
	const [endDate, setEndDate] = useState('');
	const [endTime, setEndTime] = useState('17:00');
	const [location, setLocation] = useState('');
	const [type, setType] = useState(
		tableName === 'congresses' ? 'in-person' : 'atelier'
	);
	const [price, setPrice] = useState('0');
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});
	const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'preview'>(
		'basic'
	);

	// Set end date to match start date initially
	useEffect(() => {
		if (startDate && !endDate) {
			setEndDate(startDate);
		}
	}, [startDate, endDate]);

	// Validate dates
	useEffect(() => {
		if (startDate && endDate) {
			const start = new Date(`${startDate}T${startTime}`);
			const end = new Date(`${endDate}T${endTime}`);

			if (end < start) {
				setValidationErrors((prev) => ({
					...prev,
					endDate: 'End date/time must be after start date/time',
				}));
			} else {
				setValidationErrors((prev) => {
					const newErrors = { ...prev };
					delete newErrors.endDate;
					return newErrors;
				});
			}
		}
	}, [startDate, endDate, startTime, endTime]);

	// Format ISO datetime from date and time inputs
	const formatISODateTime = (date: string, time: string): string => {
		return `${date}T${time}:00`;
	};

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

	// Validate form
	const validateForm = (): boolean => {
		const errors: Record<string, string> = {};

		if (!title.trim()) {
			errors.title = 'Title is required';
		}

		if (!startDate) {
			errors.startDate = 'Start date is required';
		}

		if (!endDate) {
			errors.endDate = 'End date is required';
		}

		if (startDate && endDate) {
			const start = new Date(`${startDate}T${startTime}`);
			const end = new Date(`${endDate}T${endTime}`);

			if (end < start) {
				errors.endDate = 'End date/time must be after start date/time';
			}
		}

		if (
			tableName === 'activities' &&
			(isNaN(parseFloat(price)) || parseFloat(price) < 0)
		) {
			errors.price = 'Price must be a valid positive number';
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			setError('Please correct the errors before submitting');
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			// Create base data object
			const baseData = {
				title,
				description: description || null,
				start_date: formatISODateTime(startDate, startTime),
				end_date: formatISODateTime(endDate, endTime),
				location: location || null,
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

			// Show success message
			toast.success(
				`${
					tableName === 'congresses' ? 'Congress' : 'Event'
				} created successfully`
			);

			// Call success callback
			onSuccess();
		} catch (error: any) {
			console.error(`Error adding ${tableName.slice(0, -1)}:`, error);
			setError(error.message || `Error adding ${tableName.slice(0, -1)}`);
			toast.error(
				`Failed to create ${tableName === 'congresses' ? 'congress' : 'event'}`
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Get preview data for the event/congress
	const getPreviewData = () => {
		const baseTags: Tag[] = [];

		// Add type tag
		baseTags.push({
			label: type,
			color: 'green',
		});

		// Add price tag for activities
		if (tableName === 'activities' && parseFloat(price) > 0) {
			baseTags.push({
				label: `$${price}`,
				color: 'purple',
			});
		}

		// Add location tag
		if (location) {
			baseTags.push({
				label: location,
				color: 'blue',
			});
		}

		return {
			title: title || 'Untitled',
			description: description || 'No description provided',
			startDate: startDate
				? formatISODateTime(startDate, startTime)
				: new Date().toISOString(),
			endDate: endDate
				? formatISODateTime(endDate, endTime)
				: new Date().toISOString(),
			tags: baseTags,
		};
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
					aria-label="Close"
				>
					<X className="h-5 w-5" />
				</button>
			</div>

			{/* Form Tabs */}
			<div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
				<button
					onClick={() => setActiveTab('basic')}
					className={`px-4 py-2 font-medium text-sm border-b-2 ${
						activeTab === 'basic'
							? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
							: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
					}`}
				>
					Basic Info
				</button>
				<button
					onClick={() => setActiveTab('details')}
					className={`px-4 py-2 font-medium text-sm border-b-2 ${
						activeTab === 'details'
							? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
							: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
					}`}
				>
					Additional Details
				</button>
				<button
					onClick={() => setActiveTab('preview')}
					className={`px-4 py-2 font-medium text-sm border-b-2 ${
						activeTab === 'preview'
							? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
							: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
					}`}
				>
					Preview
				</button>
			</div>

			<form onSubmit={handleSubmit}>
				{/* Basic Info Tab */}
				{activeTab === 'basic' && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3 }}
						className="space-y-6"
					>
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
								className={`w-full px-3 py-2 border ${
									validationErrors.title
										? 'border-red-500 focus:ring-red-500'
										: 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
								} rounded-md shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white`}
								placeholder="Enter title"
							/>
							{validationErrors.title && (
								<p className="mt-1 text-sm text-red-500">
									{validationErrors.title}
								</p>
							)}
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

						{/* Type */}
						<div>
							<label
								htmlFor="type"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
							>
								Type <span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<select
									id="type"
									value={type}
									onChange={(e) => setType(e.target.value)}
									className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
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
								<Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
								<div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
									<svg
										className="h-5 w-5 text-gray-400"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
							</div>
						</div>

						{/* Location */}
						<div>
							<label
								htmlFor="location"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
							>
								Location
							</label>
							<div className="relative">
								<input
									type="text"
									id="location"
									value={location}
									onChange={(e) => setLocation(e.target.value)}
									className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
									placeholder="Enter location"
								/>
								<MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
							</div>
						</div>

						<div className="flex justify-end pt-3">
							<button
								type="button"
								onClick={() => setActiveTab('details')}
								className="px-4 py-2 font-medium text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
							>
								Continue to Additional Details
							</button>
						</div>
					</motion.div>
				)}

				{/* Details Tab */}
				{activeTab === 'details' && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3 }}
						className="space-y-6"
					>
						{/* Date and Time */}
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
									Start Date & Time <span className="text-red-500">*</span>
								</label>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="relative">
										<input
											type="date"
											id="startDate"
											value={startDate}
											onChange={(e) => setStartDate(e.target.value)}
											className={`w-full pl-9 pr-3 py-2 border ${
												validationErrors.startDate
													? 'border-red-500 focus:ring-red-500'
													: 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
											} rounded-md shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white`}
										/>
										<Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
									</div>
									<div className="relative">
										<input
											type="time"
											id="startTime"
											value={startTime}
											onChange={(e) => setStartTime(e.target.value)}
											className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
										/>
										<Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
									</div>
								</div>
								{validationErrors.startDate && (
									<p className="mt-1 text-sm text-red-500">
										{validationErrors.startDate}
									</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
									End Date & Time <span className="text-red-500">*</span>
								</label>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="relative">
										<input
											type="date"
											id="endDate"
											value={endDate}
											onChange={(e) => setEndDate(e.target.value)}
											className={`w-full pl-9 pr-3 py-2 border ${
												validationErrors.endDate
													? 'border-red-500 focus:ring-red-500'
													: 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
											} rounded-md shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white`}
										/>
										<Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
									</div>
									<div className="relative">
										<input
											type="time"
											id="endTime"
											value={endTime}
											onChange={(e) => setEndTime(e.target.value)}
											className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
										/>
										<Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
									</div>
								</div>
								{validationErrors.endDate && (
									<p className="mt-1 text-sm text-red-500">
										{validationErrors.endDate}
									</p>
								)}
							</div>
						</div>

						{/* Price (only for activities) */}
						{tableName === 'activities' && (
							<div>
								<label
									htmlFor="price"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Price ($) <span className="text-red-500">*</span>
								</label>
								<input
									type="number"
									id="price"
									value={price}
									onChange={(e) => setPrice(e.target.value)}
									className={`w-full px-3 py-2 border ${
										validationErrors.price
											? 'border-red-500 focus:ring-red-500'
											: 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
									} rounded-md shadow-sm focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white`}
									min="0"
									step="0.01"
								/>
								{validationErrors.price && (
									<p className="mt-1 text-sm text-red-500">
										{validationErrors.price}
									</p>
								)}
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
									onImageUploaded={(url) => setImageUrl(url)}
									tableName={tableName}
									itemId="new-item"
									aspectRatio="banner"
								/>
							</div>
						)}

						<div className="flex justify-between pt-3">
							<button
								type="button"
								onClick={() => setActiveTab('basic')}
								className="px-4 py-2 font-medium text-sm bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
							>
								Back to Basic Info
							</button>
							<button
								type="button"
								onClick={() => setActiveTab('preview')}
								className="px-4 py-2 font-medium text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
							>
								Preview
							</button>
						</div>
					</motion.div>
				)}

				{/* Preview Tab */}
				{activeTab === 'preview' && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3 }}
						className="space-y-6"
					>
						<div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
							{/* Preview Card */}
							<div className="mb-4">
								<h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-1">
									{getPreviewData().title}
								</h3>
								<p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
									{getPreviewData().description}
								</p>

								<div className="flex flex-col space-y-2 text-sm">
									<div className="flex items-center text-gray-600 dark:text-gray-300">
										<Calendar className="mr-2 h-4 w-4 text-blue-500" />
										<span>
											{new Date(
												getPreviewData().startDate
											).toLocaleDateString()}{' '}
											-{' '}
											{new Date(getPreviewData().endDate).toLocaleDateString()}
										</span>
									</div>
									<div className="flex items-center text-gray-600 dark:text-gray-300">
										<Clock className="mr-2 h-4 w-4 text-blue-500" />
										<span>
											{new Date(getPreviewData().startDate).toLocaleTimeString(
												[],
												{ hour: '2-digit', minute: '2-digit' }
											)}{' '}
											-{' '}
											{new Date(getPreviewData().endDate).toLocaleTimeString(
												[],
												{ hour: '2-digit', minute: '2-digit' }
											)}
										</span>
									</div>
									{location && (
										<div className="flex items-center text-gray-600 dark:text-gray-300">
											<MapPin className="mr-2 h-4 w-4 text-blue-500" />
											<span>{location}</span>
										</div>
									)}
								</div>

								<div className="flex flex-wrap gap-2 mt-4">
									{getPreviewData().tags.map((tag, index) => (
										<span
											key={index}
											className={`text-xs px-2.5 py-1 rounded-full ${
												tag.color === 'blue'
													? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
													: tag.color === 'green'
													? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
													: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
											}`}
										>
											{tag.label}
										</span>
									))}
								</div>
							</div>

							{/* Info Note */}
							<div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-md text-sm flex items-start mt-4">
								<Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
								<div>
									This is a preview of how your{' '}
									{tableName === 'congresses' ? 'congress' : 'event'} will
									appear. You can go back to previous tabs to make changes.
								</div>
							</div>
						</div>

						{/* Form Error */}
						{error && (
							<div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-md text-sm">
								{error}
							</div>
						)}

						<div className="flex justify-between pt-3">
							<button
								type="button"
								onClick={() => setActiveTab('details')}
								className="px-4 py-2 font-medium text-sm bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
							>
								Back to Details
							</button>
							<button
								type="submit"
								disabled={isSubmitting}
								className="px-4 py-2 font-medium text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
							>
								{isSubmitting ? (
									<>
										<Loader2 className="animate-spin mr-2 h-4 w-4" />
										Creating...
									</>
								) : (
									<>
										Create {tableName === 'congresses' ? 'Congress' : 'Event'}
									</>
								)}
							</button>
						</div>
					</motion.div>
				)}
			</form>
		</div>
	);
}
