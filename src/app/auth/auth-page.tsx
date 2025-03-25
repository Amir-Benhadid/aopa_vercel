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
import { Eye, EyeOff, Loader2, Lock, Mail, User, X } from 'lucide-react';
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
			// Clear stored form values and failed attempts on successful login
			clearStoredFormValues('login');
			setFailedAttempts(0);

			// Close any open dialog
			closeDialog();

			// Redirect to dashboard
			router.push('/dashboard');
		}
	}, [authState, router, closeDialog]);

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
					t('auth.verificationEmailResentMessage')
				);
			} else {
				showDialog(
					'error',
					t('auth.verificationEmailResendFailed'),
					result.error?.description ||
						result.error?.message ||
						t('auth.verificationEmailResendFailedMessage')
				);
			}
		} catch (error: any) {
			showDialog(
				'error',
				t('auth.verificationEmailResendFailed'),
				error.message || t('auth.verificationEmailResendFailedMessage')
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

			if (!result.success) {
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
							failedAttempts >= 2 ? t('auth.resetPassword') : undefined,
							failedAttempts >= 2 ? onForgotPassword : undefined
						);
						break;

					case 'auth/user-not-found':
						setFieldError('email', t('auth.userNotFound'));
						showDialog(
							'error',
							t('auth.signInFailed'),
							t('auth.userNotFoundMessage')
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
								t('auth.signInFailedMessage')
						);
				}
			}
		} catch (error: any) {
			showDialog(
				'error',
				t('auth.signInFailed'),
				error.message || t('auth.signInFailedMessage')
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
							return false;
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
			// Clear stored form values on successful signup
			clearStoredFormValues('signup');

			// Close any open dialog
			closeDialog();
		}
	}, [authState, closeDialog]);

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
					t('auth.verificationEmailResentMessage')
				);
			} else {
				showDialog(
					'error',
					t('auth.verificationEmailResendFailed'),
					result.error?.description ||
						result.error?.message ||
						t('auth.verificationEmailResendFailedMessage')
				);
			}
		} catch (error: any) {
			showDialog(
				'error',
				t('auth.verificationEmailResendFailed'),
				error.message || t('auth.verificationEmailResendFailedMessage')
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
		showDialog('loading', t('auth.signingUp'), t('auth.signingUpMessage'));

		try {
			const result = await register(
				values.email,
				values.password,
				values.name,
				values.surname
			);

			if (result.success) {
				// Clear stored form values on successful registration
				clearStoredFormValues('signup');

				// Check if email verification is needed
				if (result.data?.emailVerificationNeeded) {
					showDialog(
						'success',
						t('auth.signUpSuccess'),
						t('auth.verificationEmailSent'),
						t('auth.resendVerificationEmail'),
						() => handleResendVerification(values.email)
					);
					resetForm();
					setIsFlipped(false); // Flip back to login form
				}
				// If no email verification needed, the authState effect will handle the redirect
			} else {
				showDialog(
					'error',
					t('auth.signUpFailed'),
					result.error?.message || t('auth.signUpFailedMessage')
				);
			}
		} catch (error: any) {
			showDialog(
				'error',
				t('auth.signUpFailed'),
				error.message || t('auth.signUpFailedMessage')
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
							return false;
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

	// Hooks
	const { authState, resetPassword } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	const { showDialog, closeDialog } = useAuthCard();
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
				t('auth.verificationSuccessMessage')
			);
		}

		if (error) {
			showDialog('error', t('auth.error'), decodeURIComponent(error));
		}
	}, [searchParams, showDialog, t]);

	// Handlers
	const handleForgotPassword = () => {
		setShowForgotPassword(true);
	};

	const handleResetPassword = async () => {
		if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
			showDialog(
				'error',
				t('auth.invalidEmail'),
				t('auth.pleaseEnterValidEmail')
			);
			return;
		}

		if (isResettingPassword) return;
		setIsResettingPassword(true);

		showDialog(
			'loading',
			t('auth.sendingResetLink'),
			t('auth.sendingResetLinkMessage')
		);

		try {
			const result = await resetPassword(forgotPasswordEmail);

			if (result.success) {
				showDialog(
					'success',
					t('auth.resetLinkSent'),
					t('auth.resetLinkSentMessage')
				);
				setShowForgotPassword(false);
				setForgotPasswordEmail('');
			} else {
				console.error('Reset password failed:', result.error);
				showDialog(
					'error',
					t('auth.resetLinkFailed'),
					result.error?.description ||
						result.error?.message ||
						t('auth.resetLinkFailedMessage')
				);
			}
		} catch (error: any) {
			console.error('Reset password error:', error);
			showDialog(
				'error',
				t('auth.resetLinkFailed'),
				error.message || t('auth.resetLinkFailedMessage')
			);
		} finally {
			setIsResettingPassword(false);
		}
	};

	// Effect to handle authentication state
	useEffect(() => {
		if (authState.status === 'authenticated') {
			router.push('/dashboard');
		}
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
			<Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
				<DialogContent className="sm:max-w-md rounded-xl">
					<DialogHeader>
						<DialogTitle className="text-center">
							{t('auth.forgotPassword')}
						</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleResetPassword();
						}}
					>
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
								type="submit"
								size="sm"
								className="bg-primary-500 hover:bg-primary-600"
								disabled={isResettingPassword}
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
					</form>
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
