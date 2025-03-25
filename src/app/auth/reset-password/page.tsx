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
import * as Yup from 'yup';

const resetPasswordSchema = Yup.object().shape({
	password: Yup.string()
		.min(8, 'Password must be at least 8 characters')
		.required('Required'),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref('password')], 'Passwords must match')
		.required('Required'),
});

function ResetPasswordContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { updatePassword } = useAuth();
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isTokenValid, setIsTokenValid] = useState(true);

	// Dialog state
	const [feedbackDialog, setFeedbackDialog] = useState({
		isOpen: false,
		title: '',
		message: '',
		type: 'loading' as 'success' | 'error' | 'loading',
		actionLabel: '',
		onAction: () => {},
	});

	// Check if the reset token is present in the URL
	useEffect(() => {
		// Supabase automatically handles the token validation
		// We just need to check if we're on this page with a valid session
		const checkToken = async () => {
			try {
				console.log('Checking reset token validity...');
				console.log('Current URL:', window.location.href);
				console.log(
					'Search params:',
					Object.fromEntries([...searchParams.entries()])
				);
				console.log('Hash fragment:', window.location.hash);

				// Check if we have a hash fragment in the URL (Supabase sometimes uses this)
				const hasAccessToken =
					window.location.hash &&
					window.location.hash.includes('access_token=') &&
					window.location.hash.includes('type=recovery');

				// Supabase uses 'code' parameter for password reset links
				// Check for either 'token' or 'code' in the URL
				const hasToken = searchParams.has('token');
				const hasCode = searchParams.has('code');
				const hasType = searchParams.has('type');
				const isPasswordRecovery = searchParams.get('type') === 'recovery';

				console.log('Token validation details:', {
					hasAccessToken,
					hasToken,
					hasCode,
					hasType,
					isPasswordRecovery,
				});

				// If we have a code parameter, we need to exchange it for a session
				if (hasCode && hasType && isPasswordRecovery) {
					console.log(
						'Found code parameter, exchanging for session with code:',
						searchParams.get('code')
					);
					try {
						// Exchange the code for a session directly in the client
						const { data, error } = await supabase.auth.exchangeCodeForSession(
							searchParams.get('code') || ''
						);

						console.log('Exchange result:', { data, error });

						if (error) {
							console.error('Error exchanging code for session:', error);
							setIsTokenValid(false);

							// Show error dialog for invalid code
							setFeedbackDialog({
								isOpen: true,
								title: 'Invalid Reset Link',
								message:
									'This password reset link is invalid or has expired. Please request a new one.',
								type: 'error',
								actionLabel: 'Back to Login',
								onAction: () => router.push('/auth'),
							});

							return;
						}

						console.log('Session exchange successful');

						// Verify that we now have a valid session
						const sessionCheck = await supabase.auth.getSession();
						console.log('Session after exchange:', sessionCheck);

						// Remove the code from the URL to prevent reusing it
						const newUrl = new URL(window.location.href);
						newUrl.searchParams.delete('code');
						newUrl.searchParams.delete('type');
						window.history.replaceState({}, '', newUrl.toString());
					} catch (exchangeError) {
						console.error('Exception during code exchange:', exchangeError);
						setIsTokenValid(false);
						setFeedbackDialog({
							isOpen: true,
							title: 'Error Processing Reset Link',
							message:
								'An error occurred while processing your password reset request.',
							type: 'error',
							actionLabel: 'Back to Login',
							onAction: () => router.push('/auth'),
						});
						return;
					}
				}

				// Valid if we have a code parameter and it's a recovery type, or if we have a hash fragment with access token
				const isValid =
					(hasCode && hasType && isPasswordRecovery) ||
					hasToken ||
					hasAccessToken;

				if (!isValid) {
					console.error('No valid token parameters found in URL');
					setIsTokenValid(false);

					// Show error dialog for missing token
					setFeedbackDialog({
						isOpen: true,
						title: 'Invalid Reset Link',
						message:
							'This password reset link is invalid or missing required parameters. Please request a new one.',
						type: 'error',
						actionLabel: 'Back to Login',
						onAction: () => router.push('/auth'),
					});
				} else if (hasAccessToken) {
					// If we have an access token in the hash, we need to set the session
					console.log('Found access token in URL hash, continuing with reset');
					setIsTokenValid(true);
				} else {
					// Check if we have a valid session for password reset
					console.log('Checking for valid session');
					const { data, error } = await supabase.auth.getSession();
					console.log('Session check result:', { data, error });

					if (error || !data.session) {
						console.error('No valid session for password reset:', error);
						setIsTokenValid(false);

						// Show error dialog for invalid session
						setFeedbackDialog({
							isOpen: true,
							title: 'Invalid Reset Link',
							message:
								'This password reset link is invalid or has expired. Please request a new one.',
							type: 'error',
							actionLabel: 'Back to Login',
							onAction: () => router.push('/auth'),
						});
					} else {
						console.log('Valid session found, proceeding with password reset');
						setIsTokenValid(true);
					}
				}
			} catch (error) {
				console.error('Error checking token:', error);
				setIsTokenValid(false);

				// Show error dialog for unexpected error
				setFeedbackDialog({
					isOpen: true,
					title: 'Error Validating Link',
					message:
						'An unexpected error occurred while validating your reset link. Please try again or request a new link.',
					type: 'error',
					actionLabel: 'Back to Login',
					onAction: () => router.push('/auth'),
				});
			}
		};

		checkToken();
	}, [searchParams, router]);

	const handleResetPassword = async (password: string) => {
		setIsSubmitting(true);
		try {
			// Show loading dialog
			setFeedbackDialog({
				isOpen: true,
				title: 'Updating Password',
				message: 'Please wait while we update your password...',
				type: 'loading',
				actionLabel: '',
				onAction: () => {},
			});

			console.log('Attempting to reset password');

			// Check if we have an access token in the hash
			const hasAccessToken =
				window.location.hash &&
				window.location.hash.includes('access_token=') &&
				window.location.hash.includes('type=recovery');

			console.log('Has access token in hash?', hasAccessToken);

			let error = null;

			// Check current session state
			const { data: sessionData } = await supabase.auth.getSession();
			console.log('Current session before password update:', sessionData);

			if (hasAccessToken) {
				console.log('Using access token from hash for password reset');
				// When we have the access token in the URL, we can directly call updateUser
				// Supabase client will automatically use the token from the URL
				const updateResult = await supabase.auth.updateUser({
					password,
				});
				console.log('Direct updateUser result:', updateResult);
				error = updateResult.error;
			} else {
				// Use the normal method through our AuthProvider
				console.log('Using auth provider for password reset');
				const updateResult = await updatePassword(password);
				console.log('AuthProvider updatePassword result:', updateResult);
				error = updateResult.error;
			}

			if (error) {
				console.error('Password update error:', error);
				throw error;
			}

			console.log('Password update successful');

			// Check session after update
			const postUpdateSession = await supabase.auth.getSession();
			console.log('Session after password update:', postUpdateSession);

			// Show success dialog
			setFeedbackDialog({
				isOpen: true,
				title: 'Password Updated',
				message: 'Your password has been successfully updated!',
				type: 'success',
				actionLabel: 'Go to Login',
				onAction: () => router.push('/auth'),
			});

			// Redirect to login page after successful password reset
			setTimeout(() => {
				router.push('/auth');
			}, 3000);

			return { success: true };
		} catch (error: any) {
			console.error('Reset password error:', error);

			// Show error dialog
			setFeedbackDialog({
				isOpen: true,
				title: 'Password Reset Failed',
				message: error.message || 'Failed to reset password. Please try again.',
				type: 'error',
				actionLabel: 'Try Again',
				onAction: () =>
					setFeedbackDialog((prev) => ({ ...prev, isOpen: false })),
			});

			return { success: false, error };
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isTokenValid) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
				<div className="w-full max-w-md">
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden card-glow p-8 text-center">
						<div className="space-y-4">
							<h2 className="text-2xl font-bold text-red-500">
								Invalid Reset Link
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								This password reset link is invalid or has expired.
							</p>
							<button
								onClick={() => router.push('/auth')}
								className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md auth-button"
							>
								Back to Login
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

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
									Reset Password
								</h2>
								<p className="text-center text-card-foreground/60">
									Enter your new password below
								</p>
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
													label="New Password"
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
													label="Confirm Password"
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
													? 'Updating Password...'
													: 'Update Password'}
											</Button>
										</div>

										<div className="text-center">
											<button
												type="button"
												onClick={() => router.push('/auth')}
												className="text-sm text-primary-500 hover:text-primary-600 auth-button"
											>
												Back to Login
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
	return (
		<Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
			<ResetPasswordContent />
		</Suspense>
	);
}
