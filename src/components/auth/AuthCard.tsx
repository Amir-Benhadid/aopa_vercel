'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/Dialog';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
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

interface DialogStateConfig {
	title: string;
	message: string;
	actionLabel?: string;
	onAction?: (result?: any) => void; // Can receive result/error
}

interface AuthCardProps {
	children: React.ReactNode;
	isFlipped: boolean;
	onFlip: () => void;
	frontLabelKey: string;
	backLabelKey: string;
	className?: string;
}

// Update the context type
const AuthCardContext = createContext<{
	showDialog: (
		type: FeedbackType,
		title: string,
		message: string,
		actionLabel?: string,
		onAction?: () => void
	) => void;
	closeDialog: () => void;
	// New function to handle async operations with dialog state transitions
	showProcessDialog: <T extends { success: boolean; data?: any; error?: any }>(
		operation: () => Promise<T>,
		loadingConfig: DialogStateConfig,
		successConfig: DialogStateConfig,
		// Error config message can be a function to format the error
		errorConfig: Omit<DialogStateConfig, 'message'> & {
			message: string | ((error: any) => string);
		}
	) => Promise<T>; // Returns the result of the operation
}>({
	showDialog: () => {},
	closeDialog: () => {},
	showProcessDialog: async () => {
		// Default implementation returns a failed promise
		console.error(
			'[AuthCardContext] showProcessDialog called before initialized'
		);
		return { success: false, error: { message: 'Not initialized' } } as any;
	},
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
			console.log(`[DIALOG] Request to show ${type} dialog: "${title}"`);

			// Directly set the new dialog state after a short delay
			// This allows the previous state (e.g., loading) to potentially render first,
			// and then be replaced by the new state (e.g., success/error).
			setTimeout(() => {
				console.log(`[DIALOG] Setting dialog state to: ${type} - "${title}"`);
				setDialog({
					type,
					title,
					message,
					isOpen: true,
					actionLabel,
					onAction,
				});

				// Auto-close logic for success messages without actions remains the same
				if (type === 'success' && (!actionLabel || !onAction)) {
					console.log(
						`[DIALOG] Success dialog "${title}" will auto-close after 2.5 seconds`
					);
					setTimeout(() => {
						setDialog((prev) => {
							// Only close if it's still the same success dialog
							if (
								prev.isOpen &&
								prev.title === title &&
								prev.type === 'success'
							) {
								console.log(`[DIALOG] Auto-closing success dialog: "${title}"`);
								return { ...prev, isOpen: false };
							}
							return prev;
						});
					}, 2500);
				}
			}, 250); // Slightly increased delay to ensure transition visibility
		},
		[] // No dependencies needed here as setDialog is stable
	);

	// Function to close dialog
	const closeDialog = () => {
		console.log('Closing dialog explicitly via closeDialog function');
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

	// Implementation for the new showProcessDialog function
	const showProcessDialog = useCallback(
		async <T extends { success: boolean; data?: any; error?: any }>(
			operation: () => Promise<T>,
			loadingConfig: DialogStateConfig,
			successConfig: DialogStateConfig,
			errorConfig: Omit<DialogStateConfig, 'message'> & {
				message: string | ((error: any) => string);
			}
		): Promise<T> => {
			console.log(
				`[PROCESS_DIALOG] Starting operation: ${loadingConfig.title}`
			);

			// 1. Show Loading State Immediately
			setDialog({
				type: 'loading',
				title: loadingConfig.title,
				message: loadingConfig.message,
				isOpen: true,
				actionLabel: loadingConfig.actionLabel,
				onAction: undefined, // Loading state usually doesn't have action
			});

			let result: T;
			try {
				// 2. Execute the operation
				result = await operation();
				console.log(
					`[PROCESS_DIALOG] Operation completed. Success: ${result.success}`
				);

				// 3. Show Success or Error State
				if (result.success) {
					setDialog({
						type: 'success',
						title: successConfig.title,
						message: successConfig.message,
						isOpen: true,
						actionLabel: successConfig.actionLabel,
						onAction: successConfig.onAction
							? () => successConfig.onAction!(result.data)
							: undefined,
					});

					// Auto-close success if applicable
					if (!successConfig.actionLabel) {
						setTimeout(() => {
							setDialog((prev) =>
								prev.isOpen &&
								prev.type === 'success' &&
								prev.title === successConfig.title
									? { ...prev, isOpen: false }
									: prev
							);
						}, 2500);
					}
				} else {
					// Determine the error message
					const errorMessage =
						typeof errorConfig.message === 'function'
							? errorConfig.message(result.error)
							: errorConfig.message;

					setDialog({
						type: 'error',
						title: errorConfig.title,
						message: errorMessage,
						isOpen: true,
						actionLabel: errorConfig.actionLabel,
						onAction: errorConfig.onAction
							? () => errorConfig.onAction!(result.error)
							: undefined,
					});
				}
			} catch (err: any) {
				// Handle unexpected errors during the operation itself
				console.error(
					`[PROCESS_DIALOG] Unexpected error during operation:`,
					err
				);
				const errorMessage =
					typeof errorConfig.message === 'function'
						? errorConfig.message(err) // Pass the caught error
						: errorConfig.message;

				setDialog({
					type: 'error',
					title: errorConfig.title,
					message: `Unexpected error: ${errorMessage}`, // Indicate it was unexpected
					isOpen: true,
					actionLabel: errorConfig.actionLabel,
					onAction: errorConfig.onAction
						? () => errorConfig.onAction!(err)
						: undefined,
				});
				// Ensure the promise returns a failure structure
				result = { success: false, error: err } as T;
			}

			return result; // Return the result of the operation
		},
		[] // setDialog is stable
	);

	return (
		<AuthCardContext.Provider
			value={{ showDialog, closeDialog, showProcessDialog }}
		>
			<Card
				className={`w-[95%] max-w-md mx-auto p-4 sm:p-6 md:p-8 shadow-xl bg-white dark:bg-gray-800 border-0 overflow-hidden rounded-lg sm:rounded-xl card-glow flex flex-col justify-between relative ${
					className || ''
				}`}
			>
				{/* Decorative elements */}
				<div className="absolute top-0 right-0 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 bg-primary-100/50 dark:bg-primary-900/20 rounded-full -mr-10 sm:-mr-12 md:-mr-16 -mt-10 sm:-mt-12 md:-mt-16 z-0"></div>
				<div className="absolute bottom-0 left-0 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-primary-100/50 dark:bg-primary-900/20 rounded-full -ml-8 sm:-ml-10 md:-ml-12 -mb-8 sm:-mb-10 md:-mb-12 z-0"></div>

				<div className="flex-1 relative z-10">{children}</div>

				<div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700 relative z-10">
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
			<Dialog
				open={dialog.isOpen}
				onOpenChange={(open) => {
					// When open is false, it means the dialog is trying to close
					if (!open) {
						// Allow the dialog to close in all cases when the X button or ESC key is used
						console.log('[DIALOG] Dialog close requested');
						setDialog((prev) => ({ ...prev, isOpen: false }));
					} else {
						// Always allow opening dialogs
						setDialog((prev) => ({ ...prev, isOpen: true }));
					}
				}}
			>
				<DialogContent
					className="sm:max-w-md"
					// Prevent closing when clicking outside but allow normal close button function
					onInteractOutside={(e) => {
						// Only prevent outside clicking for error, loading dialogs, and success dialogs with action
						if (
							dialog.type === 'error' ||
							dialog.type === 'loading' ||
							(dialog.type === 'success' &&
								dialog.actionLabel &&
								dialog.onAction)
						) {
							console.log(
								`[DIALOG] Prevented outside click for ${dialog.type} dialog`
							);
							e.preventDefault();
						}
					}}
				>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							{dialog.type === 'success' && (
								<CheckCircle className="w-5 h-5 text-green-500" />
							)}
							{dialog.type === 'error' && (
								<AlertCircle className="w-5 h-5 text-red-500" />
							)}
							{dialog.type === 'loading' && (
								<Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
							)}
							<span>{dialog.title}</span>
						</DialogTitle>
					</DialogHeader>

					<div className="py-4">
						<p className="text-sm text-gray-600 dark:text-gray-300">
							{dialog.message}
						</p>

						{/* Show debug information in development mode only if we need additional technical details */}
						{process.env.NODE_ENV === 'development' &&
							dialog.type === 'error' &&
							dialog.message.includes('Server reported:') && (
								<div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
									<p className="text-xs font-mono text-red-800 dark:text-red-300 whitespace-pre-wrap break-all">
										{dialog.message.split('Server reported:')[1]}
									</p>
								</div>
							)}
					</div>

					<div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
						{(!dialog.actionLabel || !dialog.onAction) &&
							dialog.type !== 'loading' && (
								<Button
									type="button"
									variant={dialog.type === 'success' ? 'default' : 'outline'}
									onClick={closeDialog}
									className="w-full sm:w-auto"
								>
									{t('common.close')}
								</Button>
							)}
						{dialog.actionLabel && dialog.onAction && (
							<Button
								type="button"
								onClick={() => {
									dialog.onAction?.();
									closeDialog();
								}}
								className={`w-full sm:w-auto ${
									dialog.type === 'success'
										? 'bg-green-600 hover:bg-green-700'
										: dialog.type === 'error'
										? 'bg-red-600 hover:bg-red-700 text-white'
										: ''
								}`}
							>
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
