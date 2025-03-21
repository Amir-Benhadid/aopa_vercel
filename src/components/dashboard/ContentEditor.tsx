'use client';

import { supabase } from '@/lib/supabase';
import { Check, Edit2, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ContentEditorProps {
	initialValue: string;
	onSave: (value: string) => void;
	tableName: string;
	itemId: string;
	field: string;
	type?: 'text' | 'textarea' | 'number';
	label?: string;
	className?: string;
	placeholder?: string;
}

export default function ContentEditor({
	initialValue,
	onSave,
	tableName,
	itemId,
	field,
	type = 'text',
	label,
	className = '',
	placeholder = 'Enter content...',
}: ContentEditorProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [value, setValue] = useState(initialValue);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { t } = useTranslation();

	const handleSave = async () => {
		if (value === initialValue) {
			setIsEditing(false);
			return;
		}

		setIsSaving(true);
		setError(null);

		try {
			const updateData = { [field]: value };
			const { error } = await supabase
				.from(tableName)
				.update(updateData)
				.eq('id', itemId);

			if (error) throw error;

			onSave(value);
			setIsEditing(false);
		} catch (error: any) {
			console.error('Error updating content:', error);
			setError(error.message || t('common.error', 'Error updating content'));
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		setValue(initialValue);
		setIsEditing(false);
		setError(null);
	};

	return (
		<div className={`relative ${className}`}>
			{label && (
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					{label}
				</label>
			)}

			{isEditing ? (
				<div className="space-y-2">
					{type === 'textarea' ? (
						<textarea
							value={value}
							onChange={(e) => setValue(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
							placeholder={placeholder}
							rows={4}
							disabled={isSaving}
						/>
					) : type === 'number' ? (
						<input
							type="number"
							value={value}
							onChange={(e) => setValue(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
							placeholder={placeholder}
							disabled={isSaving}
						/>
					) : (
						<input
							type="text"
							value={value}
							onChange={(e) => setValue(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
							placeholder={placeholder}
							disabled={isSaving}
						/>
					)}

					<div className="flex space-x-2">
						<button
							onClick={handleSave}
							disabled={isSaving}
							className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
						>
							{isSaving ? (
								<Loader2 className="h-4 w-4 animate-spin mr-1" />
							) : (
								<Check className="h-4 w-4 mr-1" />
							)}
							{t('common.save')}
						</button>
						<button
							onClick={handleCancel}
							disabled={isSaving}
							className="inline-flex items-center px-3 py-1.5 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
						>
							<X className="h-4 w-4 mr-1" />
							{t('common.cancel')}
						</button>
					</div>

					{error && (
						<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
					)}
				</div>
			) : (
				<div className="group relative" onClick={() => setIsEditing(true)}>
					<div className="min-h-[1.5rem] p-2 rounded-md border border-transparent hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer">
						{value ? (
							type === 'textarea' ? (
								<p className="whitespace-pre-wrap">{value}</p>
							) : (
								<p>{value}</p>
							)
						) : (
							<p className="text-gray-400 dark:text-gray-500 italic">
								{placeholder}
							</p>
						)}
					</div>
					<button
						className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={(e) => {
							e.stopPropagation();
							setIsEditing(true);
						}}
					>
						<Edit2 className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
					</button>
				</div>
			)}
		</div>
	);
}
