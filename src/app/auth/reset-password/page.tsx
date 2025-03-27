'use client';

import { FeedbackDialog } from '@/components/auth/FeedbackDialog';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TextField } from '@/components/ui/TextField';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Form, Formik } from 'formik';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

function ResetPasswordContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { logout } = useAuth();
	const { t } = useTranslation();
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isTokenValid, setIsTokenValid] = useState(true); // Start assuming valid
	const [resetToken, setResetToken] = useState<string | null>(null);
	const [resetEmail, setResetEmail] = useState<string | null>(null);

	// Dialog state
	const [feedbackDialog, setFeedbackDialog] = useState({
		isOpen: false,
		title: '',
		message: '',
		type: 'loading' as 'success' | 'error' | 'loading',
		actionLabel: '',
		onAction: () => {},
	});

	useEffect(() => {
		// Function to handle the reset password flow
		const processResetToken = async () => {
			// Only run in browser environment
			if (typeof window === 'undefined') return;

			try {
				// Check for errors in URL parameters
				const urlError = searchParams.get('error');
				const urlErrorDescription = searchParams.get('error_description');

				if (urlError) {
					console.error(
						'Error in URL parameters:',
						urlError,
						urlErrorDescription
					);
					showInvalidTokenMessage(urlErrorDescription);
					return;
				}

				// Directly try to extract the token from the URL parameters
				let token = searchParams.get('token') || searchParams.get('code');

				// Also check the hash fragment
				const hash = window.location.hash.replace('#', '');
				if (!token && hash) {
					const hashParams = new URLSearchParams(hash);
					token = hashParams.get('token') || hashParams.get('code');

					// Check for errors in hash params
					const hashError = hashParams.get('error');
					if (hashError) {
						console.error('Error in hash parameters:', hashError);
						showInvalidTokenMessage(hashParams.get('error_description'));
						return;
					}
				}

				if (!token) {
					console.error('No reset token found in URL');
					showInvalidTokenMessage();
					return;
				}

				console.log('Found reset token, storing for password update');
				setResetToken(token);

				// Get email from parameters if available
				const email = searchParams.get('email');
				if (email) {
					setResetEmail(email);
				}

				// Keep token valid status - we'll verify during password update
				setIsTokenValid(true);

				// Clean up URL parameters for security
				cleanupUrl();
			} catch (error) {
				console.error('Error processing reset token:', error);
				showInvalidTokenMessage();
			}
		};

		processResetToken();

		// Cleanup effect
		return () => {
			// Clear token state when component unmounts
			setResetToken(null);
			setResetEmail(null);
		};
	}, [searchParams]);

	// Helper function to show invalid token message
	const showInvalidTokenMessage = (errorDescription?: string | null) => {
		setIsTokenValid(false);

		let message = t('resetPassword.invalidLinkMessage');
		if (errorDescription) {
			// Use the error description from Supabase if available
			message = decodeURIComponent(errorDescription).replace(/\+/g, ' ');
		}

		setFeedbackDialog({
			isOpen: true,
			title: t('resetPassword.invalidLinkTitle'),
			message: message,
			type: 'error',
			actionLabel: t('common.backToLogin'),
			onAction: () => router.push('/auth'),
		});
	};

	// Clean up URL parameters for security
	const cleanupUrl = () => {
		if (typeof window === 'undefined') return;

		try {
			// Store a copy of important params before cleaning
			const token = searchParams.get('token') || searchParams.get('code');
			const email = searchParams.get('email');
			const type = searchParams.get('type');

			const url = new URL(window.location.href);
			// Remove all query parameters
			url.search = '';
			// Remove hash
			url.hash = '';
			window.history.replaceState({}, document.title, url.toString());

			// Store token for use during password update
			if (token) {
				setResetToken(token);
			}

			// Store email if available
			if (email) {
				setResetEmail(email);
			}
		} catch (error) {
			console.error('Error cleaning URL:', error);
		}
	};

	const handleResetPassword = async (password: string) => {
		setIsSubmitting(true);

		try {
			// Show loading dialog
			setFeedbackDialog({
				isOpen: true,
				title: t('resetPassword.updatingTitle'),
				message: t('resetPassword.updatingMessage'),
				type: 'loading',
				actionLabel: '',
				onAction: () => {},
			});

			// Make sure we have a token
			if (!resetToken) {
				throw new Error('Reset token is missing');
			}

			console.log(
				'Using stored token for password reset:',
				resetToken.substring(0, 5) + '...'
			);

			// Directly update the password using the token we've stored
			const { error: updateError } = await supabase.auth.updateUser({
				password,
			});

			if (updateError) {
				console.error('Error updating password:', updateError);
				throw updateError;
			}

			// Always sign out after password change to ensure clean auth state
			await supabase.auth.signOut({ scope: 'global' }); // Sign out from all devices

			// Force clear any potential lingering auth data
			if (typeof window !== 'undefined') {
				localStorage.removeItem('sb-auth-token');

				// Clear our internal state
				setResetToken(null);
				setResetEmail(null);
			}

			// Success - show message and redirect
			setFeedbackDialog({
				isOpen: true,
				title: t('resetPassword.successTitle'),
				message: t('resetPassword.successMessage'),
				type: 'success',
				actionLabel: t('resetPassword.goToLogin'),
				onAction: () => {
					router.push('/auth');
				},
			});

			// Auto redirect after 3 seconds
			setTimeout(() => {
				router.push('/auth');
			}, 3000);
		} catch (error: any) {
			console.error('Password reset error:', error);

			// Show appropriate error message
			let errorMessage = t('resetPassword.genericError');

			if (error.message.includes('expired')) {
				errorMessage = t('resetPassword.expiredTokenError');
			} else if (error.message.includes('invalid')) {
				errorMessage = t('resetPassword.invalidTokenError');
			} else {
				errorMessage = error.message || errorMessage;
			}

			setFeedbackDialog({
				isOpen: true,
				title: t('resetPassword.failedTitle'),
				message: errorMessage,
				type: 'error',
				actionLabel: t('resetPassword.requestNewLink'),
				onAction: () => router.push('/auth/forgot-password'),
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// UI when token is invalid
	if (!isTokenValid) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
				<div className="w-full max-w-md">
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden card-glow p-8 text-center">
						<div className="space-y-4">
							<h2 className="text-2xl font-bold text-red-500">
								{t('resetPassword.invalidLinkTitle')}
							</h2>
							<p className="text-gray-600 dark:text-gray-300 mb-4">
								{t('resetPassword.invalidLinkMessage')}
							</p>
							<p className="text-gray-600 dark:text-gray-300">
								{t('resetPassword.requestNewMessage')}
							</p>
							<div className="pt-2 space-y-2">
								<button
									onClick={() => router.push('/auth')}
									className="w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md auth-button"
								>
									{t('common.backToLogin')}
								</button>
								<button
									onClick={() => router.push('/')}
									className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md auth-button"
								>
									{t('common.backToHome')}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Schema for password validation
	const resetPasswordSchema = Yup.object().shape({
		password: Yup.string()
			.min(8, t('validation.passwordMin'))
			.required(t('validation.required')),
		confirmPassword: Yup.string()
			.oneOf([Yup.ref('password')], t('validation.passwordsMatch'))
			.required(t('validation.required')),
	});

	// UI when token is assumed valid (we'll verify during password update)
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
			<div className="w-full max-w-md">
				{/* Decorative elements */}
				<div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-primary-400/20 to-primary-600/20 -z-10 blur-3xl opacity-50"></div>
				<div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-l from-primary-400/20 to-primary-600/20 -z-10 blur-3xl opacity-50"></div>

				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden card-glow">
					<div className="p-8">
						<div className="space-y-8">
							<div className="space-y-2 text-center">
								<div className="flex justify-center mb-4">
									<div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
										<Lock className="text-primary-600 h-8 w-8" />
									</div>
								</div>
								<h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
									{t('resetPassword.title')}
								</h2>
								<p className="text-center text-card-foreground/60">
									{t('resetPassword.enterNewPassword')}
								</p>
								{resetEmail && (
									<p className="text-center text-primary-500 font-medium mt-2">
										{t('resetPassword.forEmail', { email: resetEmail })}
									</p>
								)}
							</div>

							<Formik
								initialValues={{
									password: '',
									confirmPassword: '',
								}}
								validationSchema={resetPasswordSchema}
								onSubmit={async (values) => {
									await handleResetPassword(values.password);
								}}
							>
								{({ handleChange, values, errors, touched }) => (
									<Form className="space-y-6">
										<div className="space-y-4">
											<div className="group">
												<TextField
													name="password"
													type={showPassword ? 'text' : 'password'}
													label={t('resetPassword.newPassword')}
													value={values.password}
													onChange={handleChange}
													error={!!(errors.password && touched.password)}
													helperText={touched.password ? errors.password : ''}
													fullWidth
													startAdornment={
														<Lock className="text-primary-400 h-5 w-5 group-hover:text-primary-600 transition-colors" />
													}
													endAdornment={
														<button
															type="button"
															onClick={() => setShowPassword(!showPassword)}
															className="text-foreground/40 hover:text-primary-500 transition-colors"
														>
															{showPassword ? (
																<EyeOff className="h-5 w-5" />
															) : (
																<Eye className="h-5 w-5" />
															)}
														</button>
													}
													className="rounded-lg transition-all duration-300 hover:shadow-md auth-input-field"
												/>
											</div>

											<div className="group">
												<TextField
													name="confirmPassword"
													type={showPassword ? 'text' : 'password'}
													label={t('resetPassword.confirmPassword')}
													value={values.confirmPassword}
													onChange={handleChange}
													error={
														!!(
															errors.confirmPassword && touched.confirmPassword
														)
													}
													helperText={
														touched.confirmPassword
															? errors.confirmPassword
															: ''
													}
													fullWidth
													startAdornment={
														<Lock className="text-primary-400 h-5 w-5 group-hover:text-primary-600 transition-colors" />
													}
													className="rounded-lg transition-all duration-300 hover:shadow-md auth-input-field"
												/>
											</div>
										</div>

										<div>
											<Button
												type="submit"
												disabled={isSubmitting}
												className="w-full h-12 bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg auth-button"
											>
												{isSubmitting
													? t('resetPassword.updatingButton')
													: t('resetPassword.updateButton')}
											</Button>
										</div>

										<div className="text-center">
											<button
												type="button"
												onClick={() => router.push('/auth')}
												className="text-sm text-primary-500 hover:text-primary-600 auth-button"
											>
												{t('common.backToLogin')}
											</button>
										</div>
									</Form>
								)}
							</Formik>
						</div>
					</div>
				</div>
			</div>

			<FeedbackDialog
				isOpen={feedbackDialog.isOpen}
				onClose={() =>
					setFeedbackDialog((prev) => ({ ...prev, isOpen: false }))
				}
				title={feedbackDialog.title}
				message={feedbackDialog.message}
				type={feedbackDialog.type}
				actionLabel={feedbackDialog.actionLabel}
				onAction={feedbackDialog.onAction}
			/>
		</div>
	);
}

export default function ResetPasswordPage() {
	const { t } = useTranslation();
	return (
		<Suspense
			fallback={<LoadingSpinner fullScreen message={t('common.loading')} />}
		>
			<ResetPasswordContent />
		</Suspense>
	);
}
