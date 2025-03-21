import { Button } from '@/components/ui/Button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/Dialog';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type FeedbackType = 'success' | 'error' | 'loading';

interface FeedbackDialogProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	message: string;
	type: FeedbackType;
	actionLabel?: string;
	onAction?: () => void;
}

export function FeedbackDialog({
	isOpen,
	onClose,
	title,
	message,
	type,
	actionLabel,
	onAction,
}: FeedbackDialogProps) {
	const { t } = useTranslation();

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{type === 'success' && (
							<CheckCircle className="h-6 w-6 text-green-500" />
						)}
						{type === 'error' && (
							<AlertCircle className="h-6 w-6 text-red-500" />
						)}
						{type === 'loading' && (
							<Loader2 className="h-6 w-6 text-primary-500 animate-spin" />
						)}
						<span>{title}</span>
					</DialogTitle>
				</DialogHeader>
				<div className="py-4">
					<p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
				</div>
				<div className="flex justify-end gap-3">
					{type !== 'loading' && (
						<Button
							variant="outline"
							onClick={onClose}
							translationKey="common.close"
						>
							{/* Close */}
						</Button>
					)}
					{actionLabel && onAction && (
						<Button onClick={onAction}>{actionLabel}</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
