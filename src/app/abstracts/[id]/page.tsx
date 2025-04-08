'use client';

import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { deleteAbstract } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { AbstractStatus } from '@/types/database';
import {
	ArrowLeft,
	ArrowRight,
	Calendar,
	Check,
	Clock,
	Download,
	Eye,
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
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Dialog imports
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/Dialog';

interface Props {
	params: { id: string };
}

export default function AbstractUserPage({ params }: Props) {
	const [loading, setLoading] = useState(false);
	const [abstract, setAbstract] = useState<any>(null);
	const [error, setError] = useState<Error | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();
	const { isAuthenticated, user } = useAuth();
	const { t } = useTranslation();

	const statusConfig = useMemo(
		() => ({
			submitted: {
				color: 'text-blue-700 dark:text-blue-300',
				bgColor: 'bg-blue-50 dark:bg-blue-900/20',
				icon: <Clock className="w-5 h-5" />,
				label: t('abstracts.filters.submitted'),
			},
			reviewing: {
				color: 'text-yellow-700 dark:text-yellow-300',
				bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
				icon: <Clock className="w-5 h-5" />,
				label: t('abstracts.filters.reviewing'),
			},
			approved: {
				color: 'text-green-700 dark:text-green-300',
				bgColor: 'bg-green-50 dark:bg-green-900/20',
				icon: <Check className="w-5 h-5" />,
				label: t('abstracts.filters.approved'),
			},
			rejected: {
				color: 'text-red-700 dark:text-red-300',
				bgColor: 'bg-red-50 dark:bg-red-900/20',
				icon: <X className="w-5 h-5" />,
				label: t('abstracts.filters.rejected'),
			},
			'type-change': {
				color: 'text-indigo-700 dark:text-indigo-300',
				bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
				icon: <RefreshCw className="w-5 h-5" />,
				label: t('abstracts.filters.typeChange'),
			},
			'final-version': {
				color: 'text-purple-700 dark:text-purple-300',
				bgColor: 'bg-purple-50 dark:bg-purple-900/20',
				icon: <FileText className="w-5 h-5" />,
				label: t('abstracts.filters.finalVersion'),
			},
			draft: {
				color: 'text-gray-700 dark:text-gray-300',
				bgColor: 'bg-gray-50 dark:bg-gray-800/50',
				icon: <File className="w-5 h-5" />,
				label: t('abstracts.statusMessages.draft'),
			},
		}),
		[t]
	);

	const getStatusActions = (status: AbstractStatus) => {
		switch (status) {
			case 'submitted':
				return [
					{
						newStatus: 'reviewing' as AbstractStatus,
						label: t('Start Review'),
						icon: <ArrowRight className="h-4 w-4" />,
						className: 'bg-yellow-600 hover:bg-yellow-700',
					},
				];
			case 'reviewing':
				return [
					{
						newStatus: 'approved' as AbstractStatus,
						label: t('Approve'),
						icon: <Check className="h-4 w-4" />,
						className: 'bg-green-600 hover:bg-green-700',
					},
					{
						newStatus: 'rejected' as AbstractStatus,
						label: t('Reject'),
						icon: <X className="h-4 w-4" />,
						className: 'bg-red-600 hover:bg-red-700',
					},
				];
			default:
				return [];
		}
	};

	// Fetch abstract data
	useState(async () => {
		if (!isAuthenticated || !user) return;

		try {
			setLoading(true);
			const { data, error } = await supabase
				.from('abstracts')
				.select('*')
				.eq('id', params.id)
				.single();

			if (error) throw error;
			setAbstract(data);
		} catch (err) {
			console.error('Error fetching abstract:', err);
			setError(err as Error);
		} finally {
			setLoading(false);
		}
	});

	// Handle file upload
	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setFileName(file.name);
			toast.success(`File "${file.name}" selected for upload`);
			// TODO: Implement file upload logic
		}
	};

	// Handle type change
	const handleTypeChange = () => {
		if (!abstract) return;

		const newType = abstract.type === 'poster' ? 'oral' : 'poster';
		toast.success(`Abstract type changed to ${newType}`);
		// TODO: Implement type change logic
	};

	// Handle download template
	const handleDownloadTemplate = () => {
		toast.info('Downloading template...');
		setTimeout(() => {
			toast.success('Template downloaded successfully');
		}, 1000);
	};

	// Handle download final version
	const handleDownloadFinal = () => {
		toast.info('Downloading your final version...');
		setTimeout(() => {
			toast.success('Final version downloaded successfully');
		}, 1000);
	};

	// Handle delete confirmation
	const handleDeleteClick = () => {
		setShowDeleteDialog(true);
	};

	const handleDeleteConfirm = async () => {
		try {
			setIsDeleting(true);
			await deleteAbstract(abstract.id);
			toast.success(t('abstracts.deleteSuccess'));
			setShowDeleteDialog(false);
			// Redirect to abstracts list after deletion
			router.push('/abstracts');
		} catch (error) {
			console.error('Error deleting abstract:', error);
			toast.error(t('abstracts.deleteError'));
		} finally {
			setIsDeleting(false);
		}
	};

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

	// Type-based badge styling
	const getTypeBadgeStyling = (type: string) => {
		switch (type) {
			case 'poster':
				return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 border-orange-200 dark:border-orange-800';
			case 'oral':
				return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
		}
	};

	if (loading) {
		return (
			<LoadingSpinner
				message={t('common.loading')}
				background="transparent"
				fullScreen={true}
			/>
		);
	}

	if (error || !abstract) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					<div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
						<h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">
							{t('common.error')}
						</h2>
						<p className="text-red-600 dark:text-red-400">
							{error ? error.message : t('abstracts.error.abstractNotFound')}
						</p>
						<Button
							variant="outline"
							className="mt-4"
							onClick={() => router.push('/abstracts')}
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							{t('abstracts.backToAbstracts')}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const status = abstract.status as AbstractStatus;
	const statusInfo = statusConfig[status];

	// Determine which actions to show based on status
	const showDownloadTemplate = status === 'approved';
	const showUploadPresentation = status === 'approved';
	const showTypeChange = status === 'type-change';
	const showDownloadFinal = status === 'final-version';
	const showViewPresentation = status === 'final-version';

	return (
		<>
			<div className="container mx-auto px-4 py-8 pt-60">
				<div className="max-w-4xl mx-auto">
					<div className="mb-8 flex items-center justify-between">
						<Button
							variant="outline"
							onClick={() => router.push('/abstracts')}
							className="flex items-center gap-2"
						>
							<ArrowLeft className="w-4 h-4" />
							{t('abstracts.backToAbstracts')}
						</Button>
					</div>

					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
						{/* Status Header */}
						<div
							className={`${statusInfo.bgColor} p-4 border-b border-gray-200 dark:border-gray-700`}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									{statusInfo.icon}
									<h2 className={`text-lg font-semibold ${statusInfo.color}`}>
										{statusInfo.label}
									</h2>
								</div>
								<div
									className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center gap-1.5 ${getTypeBadgeStyling(
										abstract.type
									)}`}
								>
									<File className="w-4 h-4" />
									{t(`abstracts.types.${abstract.type}`).toUpperCase()}
								</div>
							</div>
						</div>

						<div className="p-6">
							<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
								{isEmpty(abstract.title) ? emptyFieldMessage : abstract.title}
							</h1>

							{/* Status-specific messages and actions */}
							{status === 'submitted' && (
								<div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
									<p className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
										<Clock className="w-5 h-5 flex-shrink-0" />
										{t('abstracts.statusMessages.submitted')}
									</p>
								</div>
							)}

							{status === 'reviewing' && (
								<div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
									<p className="text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
										<Clock className="w-5 h-5 flex-shrink-0" />
										{t('abstracts.statusMessages.reviewing')}
									</p>
								</div>
							)}

							{status === 'approved' && (
								<div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
									<p className="text-green-700 dark:text-green-300 flex items-center gap-2">
										<Check className="w-5 h-5 flex-shrink-0" />
										{t('abstracts.statusMessages.approved')}
									</p>
									<div className="mt-4 flex flex-col sm:flex-row gap-3">
										<Button
											variant="default"
											className="bg-green-600 hover:bg-green-700 flex items-center gap-2 w-full"
											onClick={handleDownloadTemplate}
										>
											<Download className="w-4 h-4" />
											{t('abstracts.getTemplate')}
										</Button>

										<label className="w-full cursor-pointer">
											<input
												type="file"
												className="hidden"
												onChange={handleFileUpload}
												accept=".pdf,.doc,.docx"
											/>
											<Button
												variant="default"
												className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 w-full"
											>
												<Upload className="w-4 h-4" />
												{t('abstracts.upload')}
											</Button>
										</label>
									</div>
								</div>
							)}

							{status === 'rejected' && (
								<div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
									<p className="text-red-700 dark:text-red-300 flex items-center gap-2">
										<X className="w-5 h-5 flex-shrink-0" />
										{t('abstracts.statusMessages.rejected')}
									</p>
								</div>
							)}

							{status === 'type-change' && (
								<div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
									<p className="text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
										<RefreshCw className="w-5 h-5 flex-shrink-0" />
										{t('abstracts.statusMessages.typeChange', {
											currentType: t(`abstracts.types.${abstract.type}`),
											newType: t(
												`abstracts.types.${
													abstract.type === 'poster' ? 'oral' : 'poster'
												}`
											),
										})}
									</p>
									<div className="mt-4">
										<Button
											variant="default"
											className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
											onClick={handleTypeChange}
										>
											<RefreshCw className="w-4 h-4" />
											{t('abstracts.changeType', {
												type: t(
													`abstracts.types.${
														abstract.type === 'poster' ? 'oral' : 'poster'
													}`
												),
											})}
										</Button>
									</div>
								</div>
							)}

							{status === 'final-version' && (
								<div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
									<p className="text-purple-700 dark:text-purple-300 flex items-center gap-2">
										<FileText className="w-5 h-5 flex-shrink-0" />
										{t('abstracts.statusMessages.finalVersion')}
									</p>
									<div className="mt-4 flex flex-col sm:flex-row gap-3">
										<Button
											variant="default"
											className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2 w-full"
											onClick={handleDownloadFinal}
										>
											<Download className="w-4 h-4" />
											{t('abstracts.downloadingFinalVersion')}
										</Button>

										<Button
											variant="default"
											className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 w-full"
											onClick={() =>
												router.push(`/abstracts/${abstract.id}/presentation`)
											}
										>
											<Eye className="w-4 h-4" />
											{t('abstracts.viewPresentation')}
										</Button>
									</div>
								</div>
							)}

							{status === 'draft' && (
								<div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
									<p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
										<File className="w-5 h-5 flex-shrink-0" />
										{t('abstracts.statusMessages.draft')}
									</p>
									<div className="mt-4 flex flex-col sm:flex-row gap-3">
										<Button
											variant="default"
											className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 w-full"
											onClick={() =>
												router.push(`/abstracts/new?edit=${abstract.id}`)
											}
										>
											<Pencil className="w-4 h-4" />
											{t('common.edit')}
										</Button>

										<Button
											variant="destructive"
											className="flex items-center gap-2 w-full"
											onClick={handleDeleteClick}
										>
											<Trash2 className="w-4 h-4" />
											{t('common.delete')}
										</Button>

										<Button
											variant="outline"
											className="flex items-center gap-2 w-full"
											onClick={() => router.push('/abstracts')}
										>
											<ArrowLeft className="w-4 h-4" />
											{t('common.cancel')}
										</Button>
									</div>
								</div>
							)}

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
								<div>
									<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
										{t('abstracts.details')}
									</h3>
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<File className="w-5 h-5 text-purple-500 dark:text-purple-400" />
											<div>
												<span className="font-medium">{t('common.type')}:</span>{' '}
												{t(`abstracts.types.${abstract.type}`)}
											</div>
										</div>

										<div className="flex items-center gap-2">
											<Tag className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
											<div>
												<span className="font-medium">
													{t('abstracts.theme')}:
												</span>{' '}
												{isEmpty(abstract.theme)
													? emptyFieldMessage
													: abstract.theme}
											</div>
										</div>

										<div className="flex items-center gap-2">
											<Calendar className="w-5 h-5 text-green-500 dark:text-green-400" />
											<div>
												<span className="font-medium">
													{t('abstracts.submittedDate')}:
												</span>{' '}
												{isEmpty(abstract.created_at)
													? emptyFieldMessage
													: formatDate(abstract.created_at)}
											</div>
										</div>
									</div>
								</div>

								<div>
									<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
										{t('abstracts.authorInfo')}
									</h3>
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />
											<div>
												<span className="font-medium">
													{t('abstracts.mainAuthor')}:
												</span>{' '}
												{isEmpty(abstract.name)
													? emptyFieldMessage
													: `${abstract.name} ${abstract.surname}`}
											</div>
										</div>

										{abstract.co_authors && abstract.co_authors.length > 0 && (
											<div className="flex items-start gap-2">
												<Users className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" />
												<div>
													<span className="font-medium">
														{t('abstracts.coAuthors')}:
													</span>{' '}
													{!abstract.co_authors ||
													abstract.co_authors.length === 0
														? emptyFieldMessage
														: abstract.co_authors.join(', ')}
												</div>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Abstract Content */}
							<div className="space-y-4 mt-6">
								<div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
										{t('abstracts.submission.form.introduction')}
									</h3>
									<p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
										{isEmpty(abstract.introduction)
											? emptyFieldMessage
											: abstract.introduction}
									</p>
								</div>

								<div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
										{t('abstracts.submission.form.materials')}
									</h3>
									<p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
										{isEmpty(abstract.materials)
											? emptyFieldMessage
											: abstract.materials}
									</p>
								</div>

								<div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
										{t('abstracts.submission.form.results')}
									</h3>
									<p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
										{isEmpty(abstract.results)
											? emptyFieldMessage
											: abstract.results}
									</p>
								</div>

								<div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
										{t('abstracts.submission.form.discussion')}
									</h3>
									<p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
										{isEmpty(abstract.discussion)
											? emptyFieldMessage
											: abstract.discussion}
									</p>
								</div>

								<div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
										{t('abstracts.submission.form.conclusion')}
									</h3>
									<p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
										{isEmpty(abstract.conclusion)
											? emptyFieldMessage
											: abstract.conclusion}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

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
