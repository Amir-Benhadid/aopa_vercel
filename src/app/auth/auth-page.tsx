'use client';

import { AuthCard, useAuthCard } from '@/components/auth/AuthCard';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/Dialog';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/providers/AuthProvider';
import { Form, Formik } from 'formik';
import {
	AlertCircle,
	CheckCircle,
	Eye,
	EyeOff,
	Loader2,
	Lock,
	Mail,
	User,
	X,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import './auth.css';

// Form validation schemas
const loginSchema = Yup.object().shape({
	email: Yup.string().email('Invalid email').required('Required'),
	password: Yup.string().required('Required'),
});

const signupSchema = Yup.object().shape({
	email: Yup.string().email('Invalid email').required('Required'),
	name: Yup.string().required('Required'),
	surname: Yup.string().required('Required'),
	password: Yup.string()
		.min(8, 'Password must be at least 8 characters')
		.matches(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			'Password must contain at least one uppercase letter, one lowercase letter, and one number'
		)
		.required('Required'),
	acceptTerms: Yup.boolean().oneOf(
		[true],
		'You must accept the terms and conditions'
	),
});

// Form interfaces
interface LoginFormValues {
	email: string;
	password: string;
}

interface SignupFormValues {
	email: string;
	name: string;
	surname: string;
	password: string;
	acceptTerms: boolean;
}

// Form state persistence
const getStoredFormValues = (key: string) => {
	if (typeof window === 'undefined') return null;
	const stored = localStorage.getItem(`auth_form_${key}`);
	return stored ? JSON.parse(stored) : null;
};

const setStoredFormValues = (key: string, values: any) => {
	if (typeof window === 'undefined') return;
	localStorage.setItem(`auth_form_${key}`, JSON.stringify(values));
};

const clearStoredFormValues = (key: string) => {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(`auth_form_${key}`);
};

const LoginForm = ({ onForgotPassword }: { onForgotPassword: () => void }) => {
	const { login, authState, resendVerificationEmail } = useAuth();
	const router = useRouter();
	const { showDialog, closeDialog } = useAuthCard();
	const { t } = useTranslation();
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isResendingVerification, setIsResendingVerification] = useState(false);
	const [failedAttempts, setFailedAttempts] = useState(0);
	const [savedValues, setSavedValues] = useState<LoginFormValues>(
		() => getStoredFormValues('login') || { email: '', password: '' }
	);

	// Effect to handle auth state changes
	useEffect(() => {
		if (authState.status === 'authenticated') {
			// Don't immediately redirect - the success dialog should be shown first,
			// and the redirect will be triggered after the user sees the success message

			// Clear stored form values and failed attempts on successful login
			clearStoredFormValues('login');
			setFailedAttempts(0);
		}
	}, [authState]);

	const handleResendVerification = async (email: string) => {
		if (isResendingVerification) return;
		setIsResendingVerification(true);

		showDialog(
			'loading',
			t('auth.resendingVerificationEmail'),
			t('auth.resendingVerificationEmailMessage')
		);

		try {
			const result = await resendVerificationEmail(email);

			if (result.success) {
				showDialog(
					'success',
					t('auth.verificationEmailResent'),
					t('auth.verificationEmailResentMessage'),
					t('common.ok')
				);
			} else {
				showDialog(
					'error',
					t('auth.verificationEmailResendFailed'),
					result.error?.description ||
						result.error?.message ||
						t('auth.verificationEmailResendFailedMessage'),
					t('common.tryAgain')
				);
			}
		} catch (error: any) {
			console.error('Resend verification error:', error);
			showDialog(
				'error',
				t('auth.verificationEmailResendFailed'),
				error.message || t('auth.verificationEmailResendFailedMessage'),
				t('common.tryAgain')
			);
		} finally {
			setIsResendingVerification(false);
		}
	};

	const handleSubmit = async (
		values: LoginFormValues,
		{ setFieldError }: any
	) => {
		if (isSubmitting) return;

		setIsSubmitting(true);
		setSavedValues(values);
		setStoredFormValues('login', values);
		showDialog('loading', t('auth.signingIn'), t('auth.signingInMessage'));

		try {
			const result = await login(values.email, values.password);

			if (result.success) {
				console.log('Login successful, showing success dialog');
				showDialog(
					'success',
					t('auth.loginSuccess'),
					t('auth.loginSuccessMessage'),
					t('common.ok'),
					() => {
						// Don't auto-redirect, wait for user acknowledgment
					}
				);

				// Add a delay before redirect to ensure dialog is seen
				setTimeout(() => {
					if (result.data?.role === 'doctor') {
						console.log('Redirecting doctor to dashboard');
						router.push('/dashboard');
					} else {
						console.log('Redirecting patient to homepage');
						router.push('/');
					}
				}, 1500);
			} else {
				// Increment failed attempts counter for password-related errors
				if (
					result.error?.code === 'auth/invalid-login-credentials' ||
					result.error?.code === 'auth/invalid-credentials' ||
					result.error?.code === 'auth/wrong-password'
				) {
					setFailedAttempts((prev) => prev + 1);
				}

				switch (result.error?.code) {
					case 'auth/invalid-login-credentials':
					case 'auth/invalid-credentials':
					case 'auth/wrong-password':
						setFieldError('password', t('auth.wrongPassword'));
						showDialog(
							'error',
							t('auth.signInFailed'),
							t('auth.wrongPasswordMessage'),
							failedAttempts >= 2
								? t('auth.resetPassword')
								: t('common.tryAgain'),
							failedAttempts >= 2 ? onForgotPassword : undefined
						);
						break;

					case 'auth/user-not-found':
						setFieldError('email', t('auth.userNotFound'));
						showDialog(
							'error',
							t('auth.signInFailed'),
							t('auth.userNotFoundMessage'),
							t('common.tryAgain')
						);
						break;

					case 'auth/too-many-requests':
						showDialog(
							'error',
							t('auth.signInFailed'),
							t('auth.tooManyRequestsMessage'),
							t('auth.resetPassword'),
							onForgotPassword
						);
						break;

					case 'auth/email-not-confirmed':
						showDialog(
							'error',
							t('auth.verificationNeeded'),
							t('auth.emailNotVerifiedMessage'),
							t('auth.resendVerificationEmail'),
							() => handleResendVerification(values.email)
						);
						break;

					default:
						showDialog(
							'error',
							t('auth.signInFailed'),
							result.error?.description ||
								result.error?.message ||
								t('auth.signInFailedMessage'),
							t('common.tryAgain')
						);
				}
			}
		} catch (error: any) {
			console.error('Sign in error:', error);
			showDialog(
				'error',
				t('auth.signInFailed'),
				error.message || t('auth.signInFailedMessage'),
				t('common.tryAgain')
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
					{t('auth.welcome')}
				</h2>
				<p className="text-gray-500 dark:text-gray-400">
					{t('auth.loginSubtitle')}
				</p>
			</div>

			<Formik
				initialValues={savedValues}
				validationSchema={loginSchema}
				onSubmit={handleSubmit}
				validateOnBlur={false}
				enableReinitialize={false}
			>
				{({
					handleChange,
					values,
					errors,
					touched,
					handleSubmit: formikSubmit,
				}) => (
					<Form
						id="login-form"
						className="space-y-5"
						onSubmit={(e) => {
							e.preventDefault();
							formikSubmit(e);
						}}
					>
						<div className="space-y-4">
							<div className="group">
								<TextField
									name="email"
									type="email"
									label={t('auth.email')}
									value={values.email}
									onChange={handleChange}
									error={!!(errors.email && touched.email)}
									helperText={touched.email ? errors.email : ''}
									fullWidth
									startAdornment={
										<Mail className="text-primary-400 h-5 w-5 group-hover:text-primary-600 transition-colors" />
									}
									className="rounded-lg transition-all duration-300 hover:shadow-md auth-input-field"
									disabled={isSubmitting}
								/>
							</div>

							<div className="group">
								<TextField
									name="password"
									type={showPassword ? 'text' : 'password'}
									label={t('auth.password')}
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
											disabled={isSubmitting}
										>
											{showPassword ? (
												<EyeOff className="h-5 w-5" />
											) : (
												<Eye className="h-5 w-5" />
											)}
										</button>
									}
									className="rounded-lg transition-all duration-300 hover:shadow-md auth-input-field"
									disabled={isSubmitting}
								/>
							</div>

							<div className="flex justify-end">
								<Button
									type="button"
									variant="link"
									onClick={onForgotPassword}
									className="text-sm text-primary-500 hover:text-primary-600 p-0"
									disabled={isSubmitting}
								>
									{t('auth.forgotPassword')}
								</Button>
							</div>
						</div>

						<Button
							type="submit"
							disabled={isSubmitting}
							className="w-full h-12 bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg auth-button disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ? (
								<div className="flex items-center justify-center">
									<Loader2 className="h-5 w-5 animate-spin mr-2" />
									{t('common.loading')}
								</div>
							) : (
								t('auth.signIn')
							)}
						</Button>
					</Form>
				)}
			</Formik>
		</div>
	);
};

const SignupForm = ({
	setIsFlipped,
}: {
	setIsFlipped: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const { register, authState, resendVerificationEmail } = useAuth();
	const router = useRouter();
	const { showDialog, closeDialog } = useAuthCard();
	const { t } = useTranslation();
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isResendingVerification, setIsResendingVerification] = useState(false);
	const [savedValues, setSavedValues] = useState<SignupFormValues>(
		() =>
			getStoredFormValues('signup') || {
				email: '',
				name: '',
				surname: '',
				password: '',
				acceptTerms: false,
			}
	);

	// Effect to handle auth state changes
	useEffect(() => {
		if (authState.status === 'authenticated') {
			// Don't redirect here - only clear stored values
			clearStoredFormValues('signup');
		}
	}, [authState]);

	const handleResendVerification = async (email: string) => {
		if (isResendingVerification) return;
		setIsResendingVerification(true);

		showDialog(
			'loading',
			t('auth.resendingVerificationEmail'),
			t('auth.resendingVerificationEmailMessage')
		);

		try {
			const result = await resendVerificationEmail(email);

			if (result.success) {
				showDialog(
					'success',
					t('auth.verificationEmailResent'),
					t('auth.verificationEmailResentMessage'),
					t('common.ok')
				);
			} else {
				showDialog(
					'error',
					t('auth.verificationEmailResendFailed'),
					result.error?.description ||
						result.error?.message ||
						t('auth.verificationEmailResendFailedMessage'),
					t('common.tryAgain')
				);
			}
		} catch (error: any) {
			console.error('Resend verification error:', error);
			showDialog(
				'error',
				t('auth.verificationEmailResendFailed'),
				error.message || t('auth.verificationEmailResendFailedMessage'),
				t('common.tryAgain')
			);
		} finally {
			setIsResendingVerification(false);
		}
	};

	const handleSubmit = async (values: SignupFormValues, { resetForm }: any) => {
		if (isSubmitting) return;

		setIsSubmitting(true);
		setSavedValues(values);
		setStoredFormValues('signup', values);
		showDialog(
			'loading',
			t('auth.creatingAccount'),
			t('auth.creatingAccountMessage')
		);

		try {
			const result = await register(
				values.email,
				values.password,
				values.name,
				values.surname
			);

			if (result.success) {
				console.log('Signup successful, showing success dialog');
				showDialog(
					'success',
					t('auth.signupSuccess'),
					t('auth.signupSuccessMessage'),
					t('common.ok'),
					() => {
						// Don't auto-redirect, wait for user acknowledgment
					}
				);

				// Add a delay before redirect to ensure dialog is seen
				setTimeout(() => {
					console.log('Redirecting to homepage after signup');
					router.push('/');
				}, 1500);
			} else {
				// Handle specific error codes
				console.log('Signup failed with error:', result.error);
				let errorTitle, errorMessage;

				if (result.error?.code === 'auth/email-already-in-use') {
					errorTitle = t('auth.emailInUse');
					errorMessage = t('auth.emailInUseMessage');
				} else if (result.error?.code === 'auth/weak-password') {
					errorTitle = t('auth.weakPassword');
					errorMessage = t('auth.weakPasswordMessage');
				} else {
					errorTitle = t('auth.signUpFailed');
					errorMessage =
						result.error?.description ||
						result.error?.message ||
						t('auth.signUpFailedMessage');
				}

				// Show a clean error dialog without duplicate technical information
				showDialog('error', errorTitle, errorMessage, t('common.tryAgain'));
			}
		} catch (error: any) {
			console.error('Sign up error:', error);
			showDialog(
				'error',
				t('auth.signUpFailed'),
				error.message || t('auth.signUpFailedMessage'),
				t('common.tryAgain')
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
					{t('auth.createAccount')}
				</h2>
				<p className="text-gray-500 dark:text-gray-400">
					{t('auth.registerSubtitle')}
				</p>
			</div>

			<Formik
				initialValues={savedValues}
				validationSchema={signupSchema}
				onSubmit={handleSubmit}
				validateOnBlur={false}
				enableReinitialize={false}
			>
				{({
					handleChange,
					values,
					errors,
					touched,
					setFieldValue,
					handleSubmit: formikSubmit,
				}) => (
					<Form
						id="signup-form"
						className="space-y-5"
						onSubmit={(e) => {
							e.preventDefault();
							formikSubmit(e);
						}}
					>
						<div className="space-y-4">
							<div className="group">
								<TextField
									name="email"
									type="email"
									label={t('auth.email')}
									value={values.email}
									onChange={handleChange}
									error={!!(errors.email && touched.email)}
									helperText={touched.email ? errors.email : ''}
									fullWidth
									startAdornment={
										<Mail className="text-primary-400 h-5 w-5 group-hover:text-primary-600 transition-colors" />
									}
									className="rounded-lg transition-all duration-300 hover:shadow-md"
									disabled={isSubmitting}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="group">
									<TextField
										name="name"
										type="text"
										label={t('auth.firstName')}
										value={values.name}
										onChange={handleChange}
										error={!!(errors.name && touched.name)}
										helperText={touched.name ? errors.name : ''}
										fullWidth
										startAdornment={
											<User className="text-primary-400 h-5 w-5 group-hover:text-primary-600 transition-colors" />
										}
										className="rounded-lg transition-all duration-300 hover:shadow-md"
										disabled={isSubmitting}
									/>
								</div>

								<div className="group">
									<TextField
										name="surname"
										type="text"
										label={t('auth.lastName')}
										value={values.surname}
										onChange={handleChange}
										error={!!(errors.surname && touched.surname)}
										helperText={touched.surname ? errors.surname : ''}
										fullWidth
										startAdornment={
											<User className="text-primary-400 h-5 w-5 group-hover:text-primary-600 transition-colors" />
										}
										className="rounded-lg transition-all duration-300 hover:shadow-md"
										disabled={isSubmitting}
									/>
								</div>
							</div>

							<div className="group">
								<TextField
									name="password"
									type={showPassword ? 'text' : 'password'}
									label={t('auth.password')}
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
											disabled={isSubmitting}
										>
											{showPassword ? (
												<EyeOff className="h-5 w-5" />
											) : (
												<Eye className="h-5 w-5" />
											)}
										</button>
									}
									className="rounded-lg transition-all duration-300 hover:shadow-md"
									disabled={isSubmitting}
								/>
							</div>

							{/* Terms and Conditions Checkbox */}
							<div className="mt-4">
								<div className="flex items-start space-x-3">
									<div className="flex h-5 items-center">
										<Checkbox
											id="acceptTerms"
											name="acceptTerms"
											checked={values.acceptTerms}
											onCheckedChange={(checked) => {
												setFieldValue('acceptTerms', checked === true);
											}}
											disabled={isSubmitting}
										/>
									</div>
									<div className="ml-2 text-sm">
										<label
											htmlFor="acceptTerms"
											className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
										>
											{t('auth.termsOfService')}
										</label>
										{errors.acceptTerms && touched.acceptTerms && (
											<p className="mt-1 text-xs text-red-500">
												{errors.acceptTerms}
											</p>
										)}
									</div>
								</div>
							</div>
						</div>

						<Button
							type="submit"
							disabled={isSubmitting}
							className="w-full h-12 bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg auth-button disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ? (
								<div className="flex items-center justify-center">
									<Loader2 className="h-5 w-5 animate-spin mr-2" />
									{t('common.loading')}
								</div>
							) : (
								t('auth.createAccount')
							)}
						</Button>
					</Form>
				)}
			</Formik>
		</div>
	);
};

export default function AuthPage() {
	// State
	const [isFlipped, setIsFlipped] = useState(false);
	const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
	const [showForgotPassword, setShowForgotPassword] = useState(false);
	const [isResettingPassword, setIsResettingPassword] = useState(false);
	const [resetLoadingDialogOpen, setResetLoadingDialogOpen] = useState(false);
	const [resetSuccessDialogOpen, setResetSuccessDialogOpen] = useState(false);
	const [resetErrorDialogOpen, setResetErrorDialogOpen] = useState(false);
	const [resetErrorMessage, setResetErrorMessage] = useState('');
	const [resetErrorTitle, setResetErrorTitle] = useState('');

	// Hooks
	const { authState, resetPassword } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	const { showDialog, closeDialog, showProcessDialog } = useAuthCard();
	const { t } = useTranslation();

	// Check for URL parameters on mount
	useEffect(() => {
		const mode = searchParams.get('mode');
		if (mode === 'signup') {
			setIsFlipped(true);
		} else {
			setIsFlipped(false);
		}
		const verified = searchParams.get('verified');
		const error = searchParams.get('error');

		if (verified === 'true') {
			showDialog(
				'success',
				t('auth.verificationSuccess'),
				t('auth.verificationSuccessMessage'),
				t('common.ok')
			);
		}

		if (error) {
			showDialog(
				'error',
				t('auth.error'),
				decodeURIComponent(error),
				t('common.tryAgain')
			);
		}
	}, [searchParams, showDialog, t]);

	// Handlers
	const handleForgotPassword = () => {
		setShowForgotPassword(true);
	};

	const handleResetPassword = async () => {
		if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
			setResetErrorTitle(t('auth.invalidEmail'));
			setResetErrorMessage(t('auth.pleaseEnterValidEmail'));
			setResetErrorDialogOpen(true);
			return;
		}

		if (isResettingPassword) return;
		setIsResettingPassword(true);

		// Step 1: Show loading dialog
		setResetLoadingDialogOpen(true);
		setResetSuccessDialogOpen(false);
		setResetErrorDialogOpen(false);

		try {
			console.log(
				'[RESET] Calling resetPassword API with email:',
				forgotPasswordEmail
			);
			const result = await resetPassword(forgotPasswordEmail);
			console.log(
				'[RESET] Reset password API result:',
				JSON.stringify(result, null, 2)
			);

			// Step 2: Close loading dialog
			setResetLoadingDialogOpen(false);

			// Step 3: Show appropriate result dialog
			if (result.success) {
				console.log(
					'[RESET] Password reset successful, showing success dialog'
				);
				setResetSuccessDialogOpen(true);
			} else {
				console.log('[RESET] Password reset failed:', result.error);

				// Determine appropriate error message
				let errorTitle = t('auth.resetLinkFailed');
				let errorMessage = '';

				if (result.error?.code === 'auth/user-not-found') {
					errorMessage =
						result.error.description || t('auth.userNotFoundMessage');
				} else if (result.error?.code === 'auth/too-many-requests') {
					errorMessage =
						result.error.description || t('auth.tooManyRequestsMessage');
				} else if (result.error?.code === 'auth/invalid-email') {
					errorMessage =
						result.error.description || t('auth.invalidEmailMessage');
				} else {
					errorMessage =
						result.error?.description ||
						result.error?.message ||
						t('auth.resetLinkFailedMessage');
				}

				setResetErrorTitle(errorTitle);
				setResetErrorMessage(errorMessage);
				setResetErrorDialogOpen(true);
			}
		} catch (error: any) {
			console.error('[RESET] Unexpected error:', error);
			setResetLoadingDialogOpen(false);

			setResetErrorTitle(t('auth.resetLinkFailed'));
			setResetErrorMessage(error.message || t('auth.unexpectedErrorMessage'));
			setResetErrorDialogOpen(true);
		} finally {
			setIsResettingPassword(false);
		}
	};

	// Effect to handle authentication state
	useEffect(() => {
		// Do not redirect automatically on auth state change
		// The redirect should happen after the user sees and acknowledges success dialogs
	}, [authState, router]);

	// If still loading, show a centered loading spinner
	if (authState.status === 'loading') {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
				<div className="flex flex-col items-center">
					<Loader2 className="h-12 w-12 text-primary-500 animate-spin mb-4" />
					<p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
						{t('common.loading')}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center ">
			{/* Forgot Password Dialog */}
			<Dialog
				open={showForgotPassword}
				onOpenChange={(open) => {
					// Always allow closing with X button, just not during processing
					if (!open && !isResettingPassword) {
						setShowForgotPassword(false);
					}
				}}
			>
				<DialogContent className="sm:max-w-md rounded-xl">
					<DialogHeader>
						<DialogTitle className="text-center">
							{t('auth.forgotPassword')}
						</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
							{t('auth.enterEmailForReset')}
						</p>
						<TextField
							name="forgotPasswordEmail"
							type="email"
							label={t('auth.email')}
							value={forgotPasswordEmail}
							onChange={(e) => setForgotPasswordEmail(e.target.value)}
							fullWidth
							startAdornment={
								<Mail className="text-primary-400 h-5 w-5 group-hover:text-primary-600 transition-colors" />
							}
							className="rounded-lg transition-all duration-300 hover:shadow-md"
							disabled={isResettingPassword}
							required={true}
						/>
					</div>
					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setShowForgotPassword(false)}
							className="flex items-center gap-1"
							disabled={isResettingPassword}
						>
							<X className="h-4 w-4" />
							{t('common.cancel')}
						</Button>
						<Button
							id="reset-password-btn"
							type="button"
							size="sm"
							className="bg-primary-500 hover:bg-primary-600"
							disabled={
								isResettingPassword ||
								!forgotPasswordEmail ||
								!forgotPasswordEmail.includes('@')
							}
							onClick={() => {
								console.log(
									'Reset button clicked with email:',
									forgotPasswordEmail
								);
								handleResetPassword();
							}}
						>
							{isResettingPassword ? (
								<div className="flex items-center">
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									{t('common.loading')}
								</div>
							) : (
								t('auth.sendResetLink')
							)}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Reset Password Loading Dialog */}
			<Dialog
				open={resetLoadingDialogOpen}
				onOpenChange={(open) => {
					// Allow the X button to close this dialog
					if (!open) {
						setResetLoadingDialogOpen(false);
						// Also cleanup any other open dialogs
						setResetSuccessDialogOpen(false);
						setResetErrorDialogOpen(false);
					}
				}}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
							<span>{t('auth.sendingResetLink')}</span>
						</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<p className="text-sm text-gray-600 dark:text-gray-300">
							{t('auth.pleaseWait')} {forgotPasswordEmail}
						</p>
					</div>
				</DialogContent>
			</Dialog>

			{/* Reset Password Success Dialog */}
			<Dialog
				open={resetSuccessDialogOpen}
				onOpenChange={(open) => {
					if (!open) {
						setResetSuccessDialogOpen(false);
						setShowForgotPassword(false);
						setForgotPasswordEmail('');
					}
				}}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<CheckCircle className="w-5 h-5 text-green-500" />
							<span>{t('auth.resetLinkSent')}</span>
						</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<p className="text-sm text-gray-600 dark:text-gray-300">
							{t('auth.resetLinkSentMessage', { email: forgotPasswordEmail })}
						</p>
					</div>
					<div className="flex justify-end">
						<Button
							type="button"
							onClick={() => {
								setResetSuccessDialogOpen(false);
								setShowForgotPassword(false);
								setForgotPasswordEmail('');
							}}
							className="bg-green-600 hover:bg-green-700 text-white"
						>
							{t('common.ok')}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Reset Password Error Dialog */}
			<Dialog
				open={resetErrorDialogOpen}
				onOpenChange={(open) => {
					// Always allow closing with X button
					if (!open) {
						setResetErrorDialogOpen(false);
					}
				}}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<AlertCircle className="w-5 h-5 text-red-500" />
							<span>{resetErrorTitle}</span>
						</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<p className="text-sm text-gray-600 dark:text-gray-300">
							{resetErrorMessage}
						</p>

						{/* Debug info in development - only show if we have additional technical details */}
						{process.env.NODE_ENV === 'development' &&
							resetErrorMessage.includes('Server reported:') && (
								<div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
									<p className="text-xs font-mono text-red-800 dark:text-red-300 whitespace-pre-wrap break-all">
										{resetErrorMessage.split('Server reported:')[1]}
									</p>
								</div>
							)}
					</div>
					<div className="flex justify-end">
						<Button
							type="button"
							onClick={() => {
								setResetErrorDialogOpen(false);
							}}
							className="bg-red-600 hover:bg-red-700 text-white"
						>
							{t('common.tryAgain')}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<div className="flip-card-container">
				<div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
					<div className="flip-card-front">
						<AuthCard
							isFlipped={isFlipped}
							onFlip={() => setIsFlipped(!isFlipped)}
							frontLabelKey="auth.noAccount"
							backLabelKey="auth.signUp"
						>
							<LoginForm onForgotPassword={() => setShowForgotPassword(true)} />
						</AuthCard>
					</div>
					<div className="flip-card-back">
						<AuthCard
							isFlipped={isFlipped}
							onFlip={() => setIsFlipped(!isFlipped)}
							frontLabelKey="auth.haveAccount"
							backLabelKey="auth.signIn"
						>
							<SignupForm setIsFlipped={setIsFlipped} />
						</AuthCard>
					</div>
				</div>
			</div>
		</div>
	);
}
