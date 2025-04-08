'use client';

import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { AbstractStatus } from '@/types/database';
import {
	ArrowLeft,
	ArrowRight,
	Calendar,
	Check,
	ChevronDown,
	Clock,
	Download,
	Edit,
	File,
	FileText,
	RefreshCw,
	Tag,
	Users,
	X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface Props {
	params: { id: string };
}

// Status badge colors and icons
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

// Get available status transitions based on current status
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
				{
					newStatus: 'type-change' as AbstractStatus,
					label: t('abstracts.changeType'),
					icon: <RefreshCw className="h-4 w-4" />,
					className: 'bg-purple-600 hover:bg-purple-700',
				},
			];
		case 'approved':
		case 'rejected':
		case 'type-change':
		case 'draft':
			return [
				{
					newStatus: 'reviewing' as AbstractStatus,
					label: t('abstracts.Start Review'),
					icon: <ArrowRight className="h-4 w-4" />,
					className: 'bg-yellow-600 hover:bg-yellow-700',
				},
			];
		default:
			return [];
	}
};

export default function AbstractAdminPage({ params }: Props) {
	const [loading, setLoading] = useState(false);
	const [abstract, setAbstract] = useState<any>(null);
	const [error, setError] = useState<Error | null>(null);
	const [adminNotes, setAdminNotes] = useState('');
	const router = useRouter();
	const { isAuthenticated, user } = useAuth();
	const { t } = useTranslation();

	// Fetch abstract data
	useEffect(() => {
		if (!isAuthenticated || !user) return;

		const fetchAbstract = async () => {
			try {
				setLoading(true);
				const { data, error } = await supabase
					.from('abstracts')
					.select('*')
					.eq('id', params.id)
					.single();

				if (error) throw error;
				setAbstract(data);
				setStatusActions(getStatusActions(data.status));

				// Fetch admin notes if they exist
				const { data: notesData } = await supabase
					.from('abstract_notes')
					.select('notes')
					.eq('abstract_id', params.id)
					.single();

				if (notesData) {
					setAdminNotes(notesData.notes);
				}
			} catch (err) {
				console.error('Error fetching abstract:', err);
				setError(err as Error);
			} finally {
				setLoading(false);
			}
		};

		fetchAbstract();
	}, [isAuthenticated, params.id, user]);

	// Handle status change
	const handleStatusChange = async (newStatus: AbstractStatus) => {
		try {
			setLoading(true);
			const { error } = await supabase
				.from('abstracts')
				.update({ status: newStatus })
				.eq('id', params.id);

			if (error) throw error;

			// Update local state
			setAbstract({
				...abstract,
				status: newStatus,
			});

			toast.success(
				`Abstract status updated to ${newStatus.replace('-', ' ')}`
			);
		} catch (error) {
			console.error('Error updating abstract status:', error);
			toast.error('Failed to update abstract status');
		} finally {
			setLoading(false);
		}
	};

	// Handle saving admin notes
	const handleSaveNotes = async () => {
		try {
			setLoading(true);

			// Check if notes already exist
			const { data: existingNotes } = await supabase
				.from('abstract_notes')
				.select('id')
				.eq('abstract_id', params.id)
				.single();

			if (existingNotes) {
				// Update existing notes
				const { error } = await supabase
					.from('abstract_notes')
					.update({ notes: adminNotes })
					.eq('abstract_id', params.id);

				if (error) throw error;
			} else {
				// Create new notes
				const { error } = await supabase
					.from('abstract_notes')
					.insert({ abstract_id: params.id, notes: adminNotes });

				if (error) throw error;
			}

			toast.success('Admin notes saved successfully');
		} catch (error) {
			console.error('Error saving admin notes:', error);
			toast.error('Failed to save admin notes');
		} finally {
			setLoading(false);
		}
	};

	// Handle download
	const handleDownload = () => {
		toast.info('Preparing abstract for download...');
		setTimeout(() => {
			toast.success('Abstract downloaded successfully');
		}, 1000);
	};

	// Handle changing abstract type directly (admin action)
	const handleTypeChange = async () => {
		if (!abstract) return;

		try {
			setLoading(true);
			const newType = abstract.type === 'poster' ? 'oral' : 'poster';

			const { error } = await supabase
				.from('abstracts')
				.update({ type: newType })
				.eq('id', params.id);

			if (error) throw error;

			// Update local state
			setAbstract({
				...abstract,
				type: newType,
			});

			toast.success(`Abstract type changed to ${newType}`);
		} catch (error) {
			console.error('Error changing abstract type:', error);
			toast.error('Failed to change abstract type');
		} finally {
			setLoading(false);
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

	if (loading && !abstract) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !abstract) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					<div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
						<h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">
							Error
						</h2>
						<p className="text-red-600 dark:text-red-400">
							{error ? error.message : 'Abstract not found'}
						</p>
						<Button
							variant="outline"
							className="mt-4"
							onClick={() => router.push('/dashboard/abstracts')}
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Abstracts
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const status = abstract.status as AbstractStatus;
	const statusInfo = statusConfig[status];
	const actions = getStatusActions(status);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<div className="mb-8 flex items-center justify-between">
					<Button
						variant="outline"
						onClick={() => router.push('/dashboard/abstracts')}
						className="flex items-center gap-2"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Abstracts
					</Button>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							onClick={handleDownload}
							className="flex items-center gap-2"
						>
							<Download className="w-4 h-4" />
							Download
						</Button>

						{abstract.status === 'type-change' && (
							<Button
								variant="default"
								className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
								onClick={handleTypeChange}
							>
								<RefreshCw className="w-4 h-4" />
								Change Type
							</Button>
						)}
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
					{/* Status Header */}
					<div
						className={`${statusInfo.bgColor} p-4 border-b border-gray-200 dark:border-gray-700`}
					>
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<div className="flex items-center gap-3">
								{statusInfo.icon}
								<h2 className={`text-lg font-semibold ${statusInfo.color}`}>
									{statusInfo.label}
								</h2>
							</div>

							{/* Status Actions */}
							{actions.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{actions.map((action, index) => (
										<Button
											key={index}
											variant="default"
											className={`${action.className} flex items-center gap-2`}
											onClick={() => handleStatusChange(action.newStatus)}
											disabled={loading}
										>
											{action.icon}
											{action.label}
										</Button>
									))}
								</div>
							)}
						</div>
					</div>

					<div className="p-6">
						<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
							{abstract.title}
						</h1>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
							<div className="space-y-4">
								<div className="flex items-start gap-2">
									<Users className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5" />
									<div>
										<h3 className="font-medium text-gray-900 dark:text-gray-100">
											Author
										</h3>
										<p className="text-gray-700 dark:text-gray-300">
											{abstract.name} {abstract.surname}
										</p>
										<p className="text-gray-600 dark:text-gray-400">
											{abstract.email}
										</p>
										{abstract.phone && (
											<p className="text-gray-600 dark:text-gray-400">
												{abstract.phone}
											</p>
										)}
									</div>
								</div>

								{abstract.co_authors && abstract.co_authors.length > 0 && (
									<div className="flex items-start gap-2">
										<Users className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" />
										<div>
											<h3 className="font-medium text-gray-900 dark:text-gray-100">
												Co-Authors
											</h3>
											<p className="text-gray-700 dark:text-gray-300">
												{abstract.co_authors.join(', ')}
											</p>
										</div>
									</div>
								)}
							</div>

							<div className="space-y-4">
								<div className="flex items-start gap-2">
									<File className="w-5 h-5 text-purple-500 dark:text-purple-400 mt-0.5" />
									<div>
										<h3 className="font-medium text-gray-900 dark:text-gray-100">
											Type
										</h3>
										<p className="text-gray-700 dark:text-gray-300">
											{abstract.type.charAt(0).toUpperCase() +
												abstract.type.slice(1)}
										</p>
									</div>
								</div>

								<div className="flex items-start gap-2">
									<Tag className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mt-0.5" />
									<div>
										<h3 className="font-medium text-gray-900 dark:text-gray-100">
											Theme
										</h3>
										<p className="text-gray-700 dark:text-gray-300">
											{abstract.theme}
										</p>
									</div>
								</div>

								<div className="flex items-start gap-2">
									<Calendar className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" />
									<div>
										<h3 className="font-medium text-gray-900 dark:text-gray-100">
											Submitted
										</h3>
										<p className="text-gray-700 dark:text-gray-300">
											{formatDate(abstract.created_at)}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Abstract Content */}
						<div className="space-y-6 mt-8">
							<Section title="Introduction" content={abstract.introduction} />
							<Section title="Materials" content={abstract.materials} />
							<Section title="Results" content={abstract.results} />
							<Section title="Discussion" content={abstract.discussion} />
							<Section title="Conclusion" content={abstract.conclusion} />
						</div>

						{/* Admin Notes */}
						<div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
								<Edit className="w-5 h-5" />
								Admin Notes
							</h3>
							<textarea
								className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mt-2"
								rows={4}
								placeholder="Add notes about this abstract (only visible to admins)"
								value={adminNotes}
								onChange={(e) => setAdminNotes(e.target.value)}
							/>
							<div className="flex justify-end mt-2">
								<Button
									variant="default"
									className="bg-primary hover:bg-primary/90"
									onClick={handleSaveNotes}
									disabled={loading}
								>
									Save Notes
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function Section({ title, content }: { title: string; content: string }) {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
			<button
				className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between text-left"
				onClick={() => setExpanded(!expanded)}
			>
				<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
					{title}
				</h3>
				<ChevronDown
					className={`w-5 h-5 text-gray-500 transition-transform ${
						expanded ? 'transform rotate-180' : ''
					}`}
				/>
			</button>

			{expanded && (
				<div className="p-4 bg-white dark:bg-gray-800">
					<p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
						{content}
					</p>
				</div>
			)}
		</div>
	);
}
