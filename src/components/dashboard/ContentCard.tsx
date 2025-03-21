'use client';

import {
	Award,
	Beaker,
	BookOpen,
	Calendar,
	Clock,
	Globe,
	Loader2,
	MapPin,
	Microscope,
	MoreHorizontal,
	Tag,
	Trash,
	Users,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
	};

	// Handle delete
	const handleDelete = async () => {
		try {
			setIsDeleting(true);
			if (onDelete) {
				onDelete();
			}
		} catch (error) {
			setError('Failed to delete content');
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

	return (
		<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all duration-300 ease-out hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600 hover:-translate-y-1 group">
			{/* Colorful header with icon instead of image */}
			<div
				className={`bg-gradient-to-r ${getContentGradient()} p-5 flex items-center justify-between transition-all duration-300`}
			>
				<div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-lg transform transition-transform duration-300 group-hover:scale-110">
					{getContentIcon()}
				</div>
				{tags.length > 0 && (
					<div className="flex gap-2">
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

			<div className="p-5">
				<div className="mb-3">
					<ContentEditor
						initialValue={title}
						onSave={(value) => handleContentUpdate('title', value)}
						tableName={tableName}
						itemId={id}
						field="title"
						className="font-semibold text-lg transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400"
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
					className="mb-4 text-sm text-gray-600 dark:text-gray-300"
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

					<div className="relative">
						<button
							onClick={() => setShowMenu(!showMenu)}
							className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
						>
							<MoreHorizontal className="h-5 w-5" />
						</button>

						{showMenu && (
							<div className="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
								<div className="py-1" role="menu" aria-orientation="vertical">
									<button
										className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
										onClick={handleDelete}
										disabled={isDeleting}
									>
										{isDeleting ? (
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										) : (
											<Trash className="h-4 w-4 mr-2 text-red-500" />
										)}
										{t('common.delete', 'Delete')}
									</button>
								</div>
							</div>
						)}
					</div>
				</div>

				{error && (
					<div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-sm rounded">
						{error}
					</div>
				)}
			</div>
		</div>
	);
}
