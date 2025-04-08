'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { deleteAbstract } from '@/lib/api';
import { Abstract } from '@/types/database';
import {
	Calendar,
	Check,
	ChevronRight,
	Clock,
	Download,
	EyeIcon,
	File,
	FileText,
	Pencil,
	RefreshCw,
	Tag,
	Trash2,
	Upload,
	Users,
	X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Dialog imports
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/Dialog';

function AbstractCardComponent({ abstract }: { abstract: Abstract }) {
	const router = useRouter();
	const [selectedType, setSelectedType] = useState(abstract.type);
	const [fileName, setFileName] = useState<string | null>(null);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const { t } = useTranslation();

	const handleCardClick = () => {
		router.push(`/abstracts/${abstract.id}`);
	};

	const handleTypeChange = (e: React.MouseEvent) => {
		e.stopPropagation();
		const newType = selectedType === 'poster' ? 'oral' : 'poster';
		setSelectedType(newType);
		toast.success(
			t('abstracts.typeChanged', { type: t(`abstracts.filters.${newType}`) })
		);
		// TODO: Implement type change logic
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.stopPropagation();
		const file = event.target.files?.[0];
		if (file) {
			setFileName(file.name);
			toast.success(t('abstracts.fileSelected', { name: file.name }));
			// TODO: Implement file upload logic
		}
	};

	const handleDownload = (e: React.MouseEvent) => {
		e.stopPropagation();

		if (abstract.status === 'approved') {
			toast.info(t('abstracts.downloadingTemplate'));
			setTimeout(() => {
				toast.success(t('abstracts.templateDownloaded'));
			}, 1000);
		} else if (abstract.status === 'final-version') {
			toast.info(t('abstracts.downloadingFinalVersion'));
			setTimeout(() => {
				toast.success(t('abstracts.finalVersionDownloaded'));
			}, 1000);
		}
	};

	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		router.push(`/abstracts/new?edit=${abstract.id}`);
	};

	const handleDeleteClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowDeleteDialog(true);
	};

	const handleDeleteConfirm = async () => {
		try {
			setIsDeleting(true);
			await deleteAbstract(abstract.id);
			toast.success(t('abstracts.deleteSuccess'));
			setShowDeleteDialog(false);
			// Trigger page refresh to update the list
			window.location.reload();
		} catch (error) {
			console.error('Error deleting abstract:', error);
			toast.error(t('abstracts.deleteError'));
		} finally {
			setIsDeleting(false);
		}
	};

	const getStatusInfo = () => {
		switch (abstract.status) {
			case 'submitted':
				return {
					bg: 'bg-blue-50 dark:bg-blue-900/20',
					text: 'text-blue-700 dark:text-blue-200',
					border: 'border-blue-200 dark:border-blue-800',
					icon: <Clock className="w-4 h-4" />,
					label: t('abstracts.filters.submitted').toUpperCase(),
					barColor: 'from-blue-400 to-blue-600',
				};
			case 'reviewing':
				return {
					bg: 'bg-amber-50 dark:bg-amber-900/20',
					text: 'text-amber-700 dark:text-amber-200',
					border: 'border-amber-200 dark:border-amber-800',
					icon: <Clock className="w-4 h-4" />,
					label: t('abstracts.filters.reviewing').toUpperCase(),
					barColor: 'from-amber-400 to-amber-600',
				};
			case 'approved':
				return {
					bg: 'bg-green-50 dark:bg-green-900/20',
					text: 'text-green-700 dark:text-green-200',
					border: 'border-green-200 dark:border-green-800',
					icon: <Check className="w-4 h-4" />,
					label: t('abstracts.filters.approved').toUpperCase(),
					barColor: 'from-green-400 to-green-600',
				};
			case 'rejected':
				return {
					bg: 'bg-red-50 dark:bg-red-900/20',
					text: 'text-red-700 dark:text-red-200',
					border: 'border-red-200 dark:border-red-800',
					icon: <X className="w-4 h-4" />,
					label: t('abstracts.filters.rejected').toUpperCase(),
					barColor: 'from-red-400 to-red-600',
				};
			case 'type-change':
				return {
					bg: 'bg-indigo-50 dark:bg-indigo-900/20',
					text: 'text-indigo-700 dark:text-indigo-200',
					border: 'border-indigo-200 dark:border-indigo-800',
					icon: <RefreshCw className="w-4 h-4" />,
					label: t('abstracts.filters.typeChange').toUpperCase(),
					barColor: 'from-indigo-400 to-indigo-600',
				};
			case 'final-version':
				return {
					bg: 'bg-purple-50 dark:bg-purple-900/20',
					text: 'text-purple-700 dark:text-purple-200',
					border: 'border-purple-200 dark:border-purple-800',
					icon: <FileText className="w-4 h-4" />,
					label: t('abstracts.filters.finalVersion').toUpperCase(),
					barColor: 'from-purple-400 to-purple-600',
				};
			case 'draft':
				return {
					bg: 'bg-gray-50 dark:bg-gray-800/50',
					text: 'text-gray-700 dark:text-gray-300',
					border: 'border-gray-200 dark:border-gray-700',
					icon: <File className="w-4 h-4" />,
					label: t('abstracts.statusMessages.draft').toUpperCase(),
					barColor: 'from-gray-400 to-gray-600',
				};
			default:
				return {
					bg: 'bg-gray-50 dark:bg-gray-800',
					text: 'text-gray-700 dark:text-gray-200',
					border: 'border-gray-200 dark:border-gray-700',
					icon: <FileText className="w-4 h-4" />,
					label: t('common.unknown').toUpperCase(),
					barColor: 'from-gray-400 to-gray-600',
				};
		}
	};

	// Type-based badge styling
	const getTypeBadgeStyling = () => {
		switch (abstract.type) {
			case 'poster':
				return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 border-orange-200 dark:border-orange-800';
			case 'oral':
				return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
		}
	};

	const statusInfo = getStatusInfo();

	// Format date
	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		return date.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	// Check for empty fields
	const isEmpty = (value: string | null | undefined) => {
		return !value || value.trim() === '';
	};

	const emptyFieldMessage = (
		<span className="text-gray-500 italic">{t('common.empty')}</span>
	);

	// Determine if we should show action buttons
	const showDownloadButton =
		abstract.status === 'approved' || abstract.status === 'final-version';
	const showUploadButton = abstract.status === 'approved';
	const showTypeChangeButton = abstract.status === 'type-change';
	const showViewButton = abstract.status === 'final-version';
	const showEditButton = abstract.status === 'draft';
	const showDeleteButton = abstract.status === 'draft';

	return (
		<>
			<Card
				onClick={handleCardClick}
				className="group overflow-hidden rounded-xl hover:shadow-lg hover:cursor-pointer transition-all duration-300 bg-white dark:bg-gray-800 relative border border-gray-200 dark:border-gray-700 w-full h-full flex flex-col"
			>
				{/* Status Bar with filling effect on hover */}
				<div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
					<div
						className={`absolute inset-0 bg-gradient-to-r ${statusInfo.barColor} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
					/>
				</div>

				<div className="p-6 flex flex-col flex-1">
					{/* Header */}
					<div className="flex items-start justify-between mb-4">
						<div className="flex-1">
							<div className="flex items-center justify-between">
								<h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
									{isEmpty(abstract.title) ? emptyFieldMessage : abstract.title}
								</h3>
								<ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
							</div>

							<div className="flex flex-wrap gap-2 mt-2">
								<Badge
									className={`${statusInfo.bg} ${statusInfo.text} px-3 py-1 text-xs font-medium rounded-full border ${statusInfo.border} flex items-center gap-1.5`}
								>
									{statusInfo.icon}
									{statusInfo.label}
								</Badge>

								<Badge
									className={`${getTypeBadgeStyling()} px-3 py-1 text-xs font-medium rounded-full border flex items-center gap-1.5`}
								>
									<File className="w-4 h-4" />
									{abstract.type.toUpperCase()}
								</Badge>
							</div>
						</div>
					</div>

					{/* Content */}
					<div className="space-y-3 flex-1">
						<div className="flex items-start text-gray-600 dark:text-gray-300">
							<Tag className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400 flex-shrink-0 mt-0.5" />
							<div>
								<span className="font-medium block text-sm text-gray-500 dark:text-gray-400">
									{t('abstracts.submission.form.theme')}
								</span>
								{isEmpty(abstract.theme) ? (
									emptyFieldMessage
								) : (
									<span>{abstract.theme}</span>
								)}
							</div>
						</div>

						<div className="flex items-start text-gray-600 dark:text-gray-300">
							<Users className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
							<div>
								<span className="font-medium block text-sm text-gray-500 dark:text-gray-400">
									{t('abstracts.submission.form.coAuthors')}
								</span>
								{isEmpty(abstract.name) &&
								(!abstract.co_authors || abstract.co_authors.length === 0) ? (
									emptyFieldMessage
								) : (
									<span>
										{abstract.name && (
											<>
												{abstract.name} {abstract.surname}
											</>
										)}
										{abstract.name &&
											abstract.co_authors &&
											abstract.co_authors.length > 0 &&
											', '}
										{abstract.co_authors && abstract.co_authors.length > 0
											? abstract.co_authors.join(', ')
											: ''}
									</span>
								)}
							</div>
						</div>

						<div className="flex items-start text-gray-600 dark:text-gray-300">
							<Calendar className="w-4 h-4 mr-2 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
							<div>
								<span className="font-medium block text-sm text-gray-500 dark:text-gray-400">
									{t('abstracts.submitted')}
								</span>
								{isEmpty(abstract.created_at) ? (
									emptyFieldMessage
								) : (
									<span>{formatDate(abstract.created_at)}</span>
								)}
							</div>
						</div>

						<div className="mt-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
							<p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
								{isEmpty(abstract.introduction)
									? emptyFieldMessage
									: abstract.introduction}
							</p>
						</div>
					</div>

					{/* Actions */}
					<div className="mt-4 flex flex-wrap gap-3">
						{showDownloadButton && (
							<Button
								size="sm"
								variant="default"
								className="bg-blue-600 hover:bg-blue-700 text-white"
								onClick={(e) => handleDownload(e)}
							>
								<Download className="w-4 h-4 mr-1" />
								{t('abstracts.getTemplate')}
							</Button>
						)}

						{showUploadButton && (
							<label onClick={(e) => e.stopPropagation()}>
								<input
									type="file"
									className="hidden"
									onChange={handleFileUpload}
									accept=".pdf,.doc,.docx"
								/>
								<Button
									size="sm"
									variant="default"
									className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
								>
									<Upload className="w-4 h-4 mr-1" />
									{t('abstracts.upload')}
								</Button>
							</label>
						)}

						{showTypeChangeButton && (
							<Button
								size="sm"
								variant="default"
								className="bg-indigo-600 hover:bg-indigo-700 text-white"
								onClick={(e) => handleTypeChange(e)}
							>
								<RefreshCw className="w-4 h-4 mr-1" />
								{t('abstracts.changeType')}
							</Button>
						)}

						{showViewButton && (
							<Button
								size="sm"
								variant="default"
								className="bg-purple-600 hover:bg-purple-700 text-white"
								onClick={(e) => {
									e.stopPropagation();
									router.push(`/abstracts/${abstract.id}/presentation`);
								}}
							>
								<EyeIcon className="w-4 h-4 mr-1" />
								{t('abstracts.viewPresentation')}
							</Button>
						)}
					</div>

					{/* Draft actions */}
					{(showEditButton || showDeleteButton) && (
						<div className="mt-4 grid grid-cols-2 gap-3">
							{showEditButton && (
								<Button
									size="sm"
									variant="default"
									className="bg-blue-600 hover:bg-blue-700 text-white"
									onClick={handleEdit}
								>
									<Pencil className="w-4 h-4 mr-1" />
									{t('common.edit')}
								</Button>
							)}

							{showDeleteButton && (
								<Button
									size="sm"
									variant="destructive"
									onClick={handleDeleteClick}
								>
									<Trash2 className="w-4 h-4 mr-1" />
									{t('common.delete')}
								</Button>
							)}
						</div>
					)}
				</div>
			</Card>

			{/* Delete Confirmation Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('abstracts.deleteDialog.title')}</DialogTitle>
					</DialogHeader>
					<div className="p-6">
						<p className="mb-6">{t('abstracts.deleteDialog.message')}</p>

						<div className="flex justify-end gap-3">
							<Button
								variant="outline"
								onClick={() => setShowDeleteDialog(false)}
								disabled={isDeleting}
							>
								{t('common.cancel')}
							</Button>
							<Button
								variant="destructive"
								onClick={handleDeleteConfirm}
								disabled={isDeleting}
							>
								{isDeleting
									? t('abstracts.deleteDialog.deleting')
									: t('common.delete')}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

const AbstractCard = memo(AbstractCardComponent);
export default AbstractCard;
