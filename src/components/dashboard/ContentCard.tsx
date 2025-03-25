'use client';

import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import {
	Award,
	Beaker,
	BookOpen,
	Calendar,
	Clock,
	Edit,
	ExternalLink,
	Globe,
	Loader2,
	MapPin,
	Microscope,
	MoreHorizontal,
	Pencil,
	Tag,
	Trash,
	Users,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import ContentEditor from './ContentEditor';

interface ContentCardProps {
	id: string;
	title: string;
	description: string | null;
	startDate: string;
	endDate: string;
	imageUrl: string | null; // Kept for backward compatibility
	tags: Array<{
		label: string;
		color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'gray';
	}>;
	tableName: 'congresses' | 'activities';
	onDelete?: () => void;
	onUpdate?: () => void;
}

export default function ContentCard({
	id,
	title,
	description,
	startDate,
	endDate,
	imageUrl, // Not used anymore
	tags,
	tableName,
	onDelete,
	onUpdate,
}: ContentCardProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const { t } = useTranslation();

	// Format date with time
	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString);
		const formattedDate = date.toLocaleDateString();
		const formattedTime = date.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		});
		return `${formattedDate} • ${formattedTime}`;
	};

	// Handle content update
	const handleContentUpdate = (field: string, value: string) => {
		if (onUpdate) {
			onUpdate();
		}
		toast.success('Updated successfully');
		setIsEditing(false);
	};

	// Handle delete
	const handleDelete = async () => {
		try {
			setIsDeleting(true);
			setError(null);

			// Soft delete by updating the deleted_at field
			const { error } = await supabase
				.from(tableName)
				.update({ deleted_at: new Date().toISOString() })
				.eq('id', id);

			if (error) throw error;

			toast.success(
				`${
					tableName === 'activities' ? 'Event' : 'Congress'
				} deleted successfully`
			);

			if (onDelete) {
				onDelete();
			}
		} catch (error: any) {
			console.error('Error deleting content:', error);
			setError(error.message || 'Failed to delete content');
			toast.error('Failed to delete item');
		} finally {
			setIsDeleting(false);
			setShowMenu(false);
		}
	};

	// Get tag color class
	const getTagColorClass = (color: string) => {
		switch (color) {
			case 'blue':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
			case 'green':
				return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
			case 'purple':
				return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
			case 'red':
				return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
			case 'yellow':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
			case 'gray':
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
		}
	};

	// Get content icon based on content type
	const getContentIcon = () => {
		if (tableName === 'activities') {
			// Check for activity type in tags
			const activityType =
				tags
					.find((tag) =>
						['atelier', 'wetlab', 'cour', 'lunch-symposium'].includes(
							tag.label.toLowerCase()
						)
					)
					?.label.toLowerCase() || '';

			switch (activityType) {
				case 'atelier':
					return <Users className="h-6 w-6 text-white" />;
				case 'wetlab':
					return <Microscope className="h-6 w-6 text-white" />;
				case 'cour':
					return <BookOpen className="h-6 w-6 text-white" />;
				case 'lunch-symposium':
					return <Beaker className="h-6 w-6 text-white" />;
				default:
					return <Calendar className="h-6 w-6 text-white" />;
			}
		} else if (tableName === 'congresses') {
			// Check for congress type in tags
			const congressType =
				tags
					.find((tag) =>
						['in-person', 'virtual', 'hybrid'].includes(tag.label.toLowerCase())
					)
					?.label.toLowerCase() || '';

			switch (congressType) {
				case 'in-person':
					return <Users className="h-6 w-6 text-white" />;
				case 'virtual':
					return <Globe className="h-6 w-6 text-white" />;
				case 'hybrid':
					return <Award className="h-6 w-6 text-white" />;
				default:
					return <Globe className="h-6 w-6 text-white" />;
			}
		}
		return <Globe className="h-6 w-6 text-white" />;
	};

	// Get content gradient based on content type
	const getContentGradient = () => {
		if (tableName === 'activities') {
			// Check for activity type in tags
			const activityType =
				tags
					.find((tag) =>
						['atelier', 'wetlab', 'cour', 'lunch-symposium'].includes(
							tag.label.toLowerCase()
						)
					)
					?.label.toLowerCase() || '';

			switch (activityType) {
				case 'atelier':
					return 'from-blue-500 to-indigo-600';
				case 'wetlab':
					return 'from-orange-500 to-red-600';
				case 'cour':
					return 'from-green-500 to-teal-600';
				case 'lunch-symposium':
					return 'from-purple-500 to-pink-600';
				default:
					return 'from-blue-500 to-indigo-600';
			}
		} else if (tableName === 'congresses') {
			// Check for congress type in tags
			const congressType =
				tags
					.find((tag) =>
						['in-person', 'virtual', 'hybrid'].includes(tag.label.toLowerCase())
					)
					?.label.toLowerCase() || '';

			switch (congressType) {
				case 'in-person':
					return 'from-purple-500 to-pink-600';
				case 'virtual':
					return 'from-blue-500 to-cyan-600';
				case 'hybrid':
					return 'from-amber-500 to-orange-600';
				default:
					return 'from-purple-500 to-pink-600';
			}
		}
		return 'from-gray-500 to-gray-700';
	};

	// Get location from tags if available
	const getLocation = () => {
		const locationTag = tags.find((tag) => tag.color === 'blue');
		return locationTag?.label || null;
	};

	// Get time until event starts
	const getTimeUntilEvent = () => {
		const now = new Date();
		const start = new Date(startDate);

		// If event has passed
		if (now > start) return null;

		const diffTime = Math.abs(start.getTime() - now.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays > 30) {
			const diffMonths = Math.floor(diffDays / 30);
			return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
		}

		return diffDays > 1
			? `${diffDays} days`
			: diffDays === 1
			? 'Tomorrow'
			: 'Today';
	};

	// Get event status (upcoming, ongoing, past)
	const getEventStatus = () => {
		const now = new Date();
		const start = new Date(startDate);
		const end = new Date(endDate);

		if (now < start) return 'upcoming';
		if (now >= start && now <= end) return 'ongoing';
		return 'past';
	};

	const eventStatus = getEventStatus();
	const timeUntil = getTimeUntilEvent();

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{ y: -5 }}
			transition={{ duration: 0.3 }}
			className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 group"
		>
			{/* Colorful header with icon */}
			<div
				className={`bg-gradient-to-r ${getContentGradient()} p-5 flex items-center justify-between transition-all duration-300 relative`}
			>
				<div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-lg transform transition-transform duration-300 group-hover:scale-110">
					{getContentIcon()}
				</div>

				{/* Menu button at top right */}
				<div className="absolute top-2 right-2">
					<button
						onClick={(e) => {
							e.stopPropagation();
							setShowMenu(!showMenu);
						}}
						className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
					>
						<MoreHorizontal className="h-4 w-4 text-white" />
					</button>

					{showMenu && (
						<div className="absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20">
							<div className="py-1" role="menu">
								<button
									className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
									onClick={() => {
										setIsEditing(true);
										setShowMenu(false);
									}}
								>
									<Pencil className="h-4 w-4 mr-2 text-blue-500" />
									{t('common.edit', 'Edit')}
								</button>
								<button
									className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
									onClick={handleDelete}
									disabled={isDeleting}
								>
									{isDeleting ? (
										<Loader2 className="h-4 w-4 mr-2 animate-spin text-red-500" />
									) : (
										<Trash className="h-4 w-4 mr-2 text-red-500" />
									)}
									{t('common.delete', 'Delete')}
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Status indicator */}
				{eventStatus && (
					<div
						className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
							eventStatus === 'upcoming'
								? 'bg-blue-400/20 text-white'
								: eventStatus === 'ongoing'
								? 'bg-green-400/20 text-white'
								: 'bg-gray-400/20 text-white'
						}`}
					>
						{eventStatus === 'upcoming'
							? timeUntil
								? `In ${timeUntil}`
								: 'Upcoming'
							: eventStatus === 'ongoing'
							? 'Ongoing'
							: 'Past'}
					</div>
				)}

				{/* Tags */}
				{tags.length > 0 && (
					<div className="flex gap-2 mt-1">
						{tags.slice(0, 2).map((tag, index) => (
							<div
								key={index}
								className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full"
							>
								{tag.label}
							</div>
						))}
					</div>
				)}
			</div>

			<div className="p-5 relative">
				{/* Edit mode indicator */}
				{isEditing && (
					<div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full z-10">
						Editing Mode
					</div>
				)}

				<div className="mb-3">
					<ContentEditor
						initialValue={title}
						onSave={(value) => handleContentUpdate('title', value)}
						tableName={tableName}
						itemId={id}
						field="title"
						className={`font-semibold text-lg ${
							isEditing
								? 'bg-blue-50 dark:bg-blue-900/10 rounded-md border border-blue-200 dark:border-blue-800'
								: ''
						}`}
						placeholder="Enter title..."
					/>

					<div className="flex flex-col space-y-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
						<div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
							<Calendar className="mr-1.5 h-4 w-4 flex-shrink-0" />
							<span>{formatDateTime(startDate)}</span>
						</div>
						{endDate && (
							<div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
								<Clock className="mr-1.5 h-4 w-4 flex-shrink-0" />
								<span>{formatDateTime(endDate)}</span>
							</div>
						)}
						{getLocation() && (
							<div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
								<MapPin className="mr-1.5 h-4 w-4 flex-shrink-0" />
								<span>{getLocation()}</span>
							</div>
						)}
					</div>
				</div>

				<ContentEditor
					initialValue={description || ''}
					onSave={(value) => handleContentUpdate('description', value)}
					tableName={tableName}
					itemId={id}
					field="description"
					type="textarea"
					className={`mb-4 text-sm text-gray-600 dark:text-gray-300 ${
						isEditing
							? 'bg-blue-50 dark:bg-blue-900/10 rounded-md border border-blue-200 dark:border-blue-800'
							: ''
					}`}
					placeholder="Enter description..."
				/>

				{tags.length > 2 && (
					<div className="flex flex-wrap gap-2 mt-3">
						{tags.slice(2).map((tag, index) => (
							<div
								key={index}
								className={`text-xs px-2.5 py-1 rounded-full ${getTagColorClass(
									tag.color
								)}`}
							>
								{tag.label}
							</div>
						))}
					</div>
				)}

				<div className="mt-4 flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
					<div className="flex items-center">
						<Tag className="h-4 w-4 mr-1.5 text-blue-500" />
						<span className="text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full">
							{tableName === 'activities'
								? t('common.activities.type', 'Activity')
								: t('navigation.congress', 'Congress')}
						</span>
					</div>

					{/* Quick action buttons */}
					<div className="flex gap-2">
						{!isEditing && (
							<button
								onClick={() => setIsEditing(true)}
								className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
								title="Edit"
							>
								<Edit className="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" />
							</button>
						)}
						<button
							className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
							title="View details"
						>
							<ExternalLink className="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" />
						</button>
					</div>
				</div>

				{error && (
					<div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-sm rounded">
						{error}
					</div>
				)}

				{/* Edit mode actions */}
				{isEditing && (
					<div className="mt-3 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
						<button
							onClick={() => setIsEditing(false)}
							className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={() => setIsEditing(false)}
							className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
						>
							Done Editing
						</button>
					</div>
				)}
			</div>
		</motion.div>
	);
}
