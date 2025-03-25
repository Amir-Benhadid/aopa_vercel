'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/Dialog';
import { AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type FeedbackType = 'success' | 'error' | 'loading';

interface DialogState {
	type: FeedbackType | null;
	title: string;
	message: string;
	isOpen: boolean;
	actionLabel?: string;
	onAction?: () => void;
}

interface AuthCardProps {
	children: React.ReactNode;
	isFlipped: boolean;
	onFlip: () => void;
	frontLabelKey: string;
	backLabelKey: string;
	className?: string;
}

// Update the context type to include closeDialog function
const AuthCardContext = createContext<{
	showDialog: (
		type: FeedbackType,
		title: string,
		message: string,
		actionLabel?: string,
		onAction?: () => void
	) => void;
	closeDialog: () => void;
}>({
	showDialog: () => {},
	closeDialog: () => {},
});

export function AuthCard({
	children,
	isFlipped,
	onFlip,
	frontLabelKey,
	backLabelKey,
	className,
}: AuthCardProps) {
	const { t } = useTranslation();
	const [dialog, setDialog] = useState<DialogState>({
		type: null,
		title: '',
		message: '',
		isOpen: false,
	});

	// Function to show dialog messages
	const showDialog = useCallback(
		(
			type: FeedbackType,
			title: string,
			message: string,
			actionLabel?: string,
			onAction?: () => void
		) => {
			setDialog({
				type,
				title,
				message,
				isOpen: true,
				actionLabel,
				onAction,
			});
		},
		[]
	);

	// Function to close dialog
	const closeDialog = () => {
		setDialog((prev) => ({ ...prev, isOpen: false }));
	};

	// Handle flip with preventDefault
	const handleFlip = (e: React.MouseEvent) => {
		e.preventDefault();
		onFlip();
	};

	// Export these functions to be used by child components
	useEffect(() => {
		// @ts-ignore - Adding functions to window for demonstration
		window.authCardFunctions = {
			showSuccessDialog: (title: string, message: string) =>
				showDialog('success', title, message),
			showErrorDialog: (title: string, message: string) =>
				showDialog('error', title, message),
			showLoadingDialog: (title: string, message: string) =>
				showDialog('loading', title, message),
		};

		return () => {
			// @ts-ignore
			delete window.authCardFunctions;
		};
	}, [showDialog]);

	// Add debugging for form submissions at the card level
	useEffect(() => {
		console.log('AUTH CARD: Setting up form submission capture');

		const captureFormSubmits = (e: Event) => {
			const form = e.target as HTMLFormElement;
			console.log('AUTH CARD: Form submit intercepted', {
				formId: form.id,
				formAction: form.action,
				formMethod: form.method,
				formTarget: form.target,
				defaultPrevented: e.defaultPrevented,
			});

			// For login and signup forms, we let Formik handle the submission
			// For all other forms, we prevent the default action to avoid page refresh
			const isLoginForm = form.id?.includes('login-form');
			const isSignupForm = form.id?.includes('signup-form');

			if (!isLoginForm && !isSignupForm) {
				console.log(
					'AUTH CARD: ⚠️ Preventing unknown form submission!',
					form.id
				);
				e.preventDefault();
				e.stopPropagation();
				return false;
			} else {
				console.log('AUTH CARD: Allowing known form submission', form.id);
				// For login and signup forms, we still need to prevent the default browser submission
				// but let Formik handle the values and submission logic
				e.preventDefault();
				return true;
			}
		};

		// Add listener to capture all form submissions
		document.querySelectorAll('form').forEach((form) => {
			console.log('AUTH CARD: Adding submit listener to form', form.id);
			form.addEventListener('submit', captureFormSubmits, true);
		});

		return () => {
			document.querySelectorAll('form').forEach((form) => {
				form.removeEventListener('submit', captureFormSubmits, true);
			});
		};
	}, []);

	return (
		<AuthCardContext.Provider value={{ showDialog, closeDialog }}>
			<Card
				className={`w-full max-w-md mx-auto p-6 sm:p-8 shadow-xl bg-white dark:bg-gray-800 border-0 overflow-hidden rounded-xl card-glow flex flex-col justify-between relative ${
					className || ''
				}`}
			>
				{/* Decorative elements */}
				<div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-primary-100/50 dark:bg-primary-900/20 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 z-0"></div>
				<div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-primary-100/50 dark:bg-primary-900/20 rounded-full -ml-10 sm:-ml-12 -mb-10 sm:-mb-12 z-0"></div>

				<div className="flex-1 relative z-10">{children}</div>

				<div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 relative z-10">
					<div className="flex items-center justify-center space-x-2 flex-wrap">
						<span className="text-sm text-gray-500 dark:text-gray-400">
							{t(frontLabelKey)}
						</span>
						<Button
							type="button"
							variant="link"
							onClick={handleFlip}
							aria-label={isFlipped ? 'Flip to login' : 'Flip to signup'}
							className="text-primary-600 dark:text-primary-400 p-0 h-auto font-medium hover:text-primary-700 transition-colors relative group"
						>
							{t(backLabelKey)}
							<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300"></span>
						</Button>
					</div>
				</div>
			</Card>

			{/* Dialog for messages */}
			<Dialog open={dialog.isOpen} onOpenChange={closeDialog}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							{dialog.type === 'success' && (
								<CheckCircle className="h-5 w-5 text-green-500" />
							)}
							{dialog.type === 'error' && (
								<AlertCircle className="h-5 w-5 text-red-500" />
							)}
							{dialog.type === 'loading' && (
								<Loader2 className="h-5 w-5 text-primary-500 animate-spin" />
							)}
							<span>{dialog.title}</span>
						</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<p className="text-sm text-gray-600 dark:text-gray-300">
							{dialog.message}
						</p>
					</div>
					<div className="flex justify-end gap-3">
						{dialog.type !== 'loading' && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={closeDialog}
								className="flex items-center gap-1"
							>
								<X className="h-4 w-4" />
								{t('common.close')}
							</Button>
						)}
						{dialog.actionLabel && dialog.onAction && (
							<Button type="button" size="sm" onClick={dialog.onAction}>
								{dialog.actionLabel}
							</Button>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</AuthCardContext.Provider>
	);
}

// Custom hook to use the AuthCard context
export function useAuthCard() {
	const context = React.useContext(AuthCardContext);
	if (!context) {
		throw new Error('useAuthCard must be used within an AuthCard');
	}
	return context;
}
