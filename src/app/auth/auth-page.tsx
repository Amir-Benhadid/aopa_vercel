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
import { Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import './auth.css';

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
		.required('Required'),
	acceptTerms: Yup.boolean().oneOf(
		[true],
		'You must accept the terms and conditions'
	),
});

const LoginForm = ({ onForgotPassword }: { onForgotPassword: () => void }) => {
	const { login } = useAuth();
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const { showDialog } = useAuthCard();
	const { t } = useTranslation();

	return (
		<div className="space-y-8">
			<div className="space-y-2 text-center">
				<div className="flex justify-center mb-4">
					<div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
						<User className="text-primary-600 h-8 w-8" />
					</div>
				</div>
				<h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
					{t('auth.loginTitle')}
				</h2>
				<p className="text-center text-card-foreground/60">
					{t('auth.loginSubtitle')}
				</p>
			</div>

			<Formik
				initialValues={{
					email: '',
					password: '',
				}}
				validationSchema={loginSchema}
				onSubmit={async (values, { setSubmitting, setFieldError }) => {
					try {
						// Show loading dialog
						showDialog(
							'loading',
							t('auth.signingIn'),
							t('auth.signingInMessage')
						);

						const result = await login(values.email, values.password);

						if (result.success) {
							// Show success dialog
							showDialog(
								'success',
								t('auth.signInSuccess'),
								t('auth.signInSuccessMessage'),
								t('auth.goToDashboard'),
								() => router.push('/')
							);
						} else {
							// Handle specific error types
							if (result.error?.code === 'auth/wrong-password') {
								setFieldError('password', t('auth.wrongPassword'));
								throw new Error(t('auth.wrongPasswordMessage'));
							} else if (result.error?.code === 'auth/user-not-found') {
								setFieldError('email', t('auth.userNotFound'));
								throw new Error(t('auth.userNotFoundMessage'));
							} else if (result.error?.code === 'auth/too-many-requests') {
								throw new Error(t('auth.tooManyRequestsMessage'));
							} else {
								throw result.error;
							}
						}
					} catch (error: any) {
						// Show error dialog
						showDialog(
							'error',
							t('auth.signInFailed'),
							error.message || t('auth.signInFailedMessage')
						);
					} finally {
						setSubmitting(false);
					}
				}}
			>
				{({
					isSubmitting,
					handleChange,
					values,
					errors,
					touched,
					setFieldError,
				}) => (
					<Form className="space-y-6">
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

							<div className="flex justify-end">
								<Button
									type="button"
									variant="link"
									onClick={(e) => {
										e.preventDefault();
										onForgotPassword();
									}}
									className="text-sm text-primary-500 hover:text-primary-600 p-0"
								>
									{t('auth.forgotPassword')}
								</Button>
							</div>
						</div>

						<div>
							<Button
								type="submit"
								disabled={isSubmitting}
								className="w-full h-12 bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg auth-button"
							>
								{isSubmitting ? t('common.loading') : t('auth.signIn')}
							</Button>
						</div>
					</Form>
				)}
			</Formik>
		</div>
	);
};

const SignupForm = () => {
	const { register } = useAuth();
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const { showDialog } = useAuthCard();
	const { t } = useTranslation();

	return (
		<div className="space-y-8">
			<div className="space-y-2 text-center">
				<div className="flex justify-center mb-4">
					<div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
						<User className="text-primary-600 h-8 w-8" />
					</div>
				</div>
				<h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
					{t('auth.registerTitle')}
				</h2>
				<p className="text-center text-card-foreground/60">
					{t('auth.registerSubtitle')}
				</p>
			</div>

			<Formik
				initialValues={{
					email: '',
					name: '',
					surname: '',
					password: '',
					acceptTerms: false,
				}}
				validationSchema={signupSchema}
				onSubmit={async (values, { setSubmitting, setFieldError }) => {
					try {
						// Show loading dialog
						showDialog(
							'loading',
							t('auth.creatingAccount'),
							t('auth.creatingAccountMessage')
						);

						const result = await register(
							values.email,
							values.password,
							values.name,
							values.surname
						);

						if (result.success) {
							// Show success dialog
							showDialog(
								'success',
								t('auth.accountCreated'),
								t('auth.accountCreatedMessage'),
								t('auth.goToDashboard'),
								() => router.push('/')
							);
						} else {
							// Handle specific error types
							if (result.error?.code === 'auth/email-already-in-use') {
								setFieldError('email', t('auth.emailInUse'));
								throw new Error(t('auth.emailInUseMessage'));
							} else if (result.error?.code === 'auth/weak-password') {
								setFieldError('password', t('auth.weakPassword'));
								throw new Error(t('auth.weakPasswordMessage'));
							} else {
								throw result.error;
							}
						}
					} catch (error: any) {
						// Show error dialog
						showDialog(
							'error',
							t('auth.signUpFailed'),
							error.message || t('auth.signUpFailedMessage')
						);
					} finally {
						setSubmitting(false);
					}
				}}
			>
				{({
					isSubmitting,
					handleChange,
					values,
					errors,
					touched,
					setFieldValue,
					setFieldError,
				}) => (
					<Form className="space-y-6">
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
										className="rounded-lg transition-all duration-300 hover:shadow-md"
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
										className="rounded-lg transition-all duration-300 hover:shadow-md"
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
										>
											{showPassword ? (
												<EyeOff className="h-5 w-5" />
											) : (
												<Eye className="h-5 w-5" />
											)}
										</button>
									}
									className="rounded-lg transition-all duration-300 hover:shadow-md"
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

						<div>
							<Button
								type="submit"
								disabled={isSubmitting}
								className="w-full h-12 bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg auth-button"
							>
								{isSubmitting ? t('common.loading') : t('auth.createAccount')}
							</Button>
						</div>
					</Form>
				)}
			</Formik>
		</div>
	);
};

export default function AuthPage() {
	const searchParams = useSearchParams();
	const [isFlipped, setIsFlipped] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
	const [showForgotPassword, setShowForgotPassword] = useState(false);
	const [captchaVerified, setCaptchaVerified] = useState(true); // Set to true for now to bypass captcha
	const { user, login, register, resetPassword, isLoading } = useAuth();
	const router = useRouter();
	const { showDialog } = useAuthCard();
	const { t } = useTranslation();

	// Handle forgot password
	const handleForgotPassword = () => {
		setShowForgotPassword(true);
	};

	// Handle reset password
	const handleResetPassword = async () => {
		if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
			showDialog(
				'error',
				t('auth.invalidEmail'),
				t('auth.pleaseEnterValidEmail')
			);
			return;
		}

		try {
			showDialog(
				'loading',
				t('auth.sendingResetLink'),
				t('auth.sendingResetLinkMessage')
			);

			// Call the resetPassword function from AuthProvider
			const result = await resetPassword(forgotPasswordEmail);

			// Check if result is successful (no error)
			if (!result.error) {
				showDialog(
					'success',
					t('auth.resetLinkSent'),
					t('auth.resetLinkSentMessage')
				);
				setShowForgotPassword(false);
			} else {
				throw result.error;
			}
		} catch (error: any) {
			showDialog(
				'error',
				t('auth.resetLinkFailed'),
				error.message || t('auth.resetLinkFailedMessage')
			);
		}
	};

	// Redirect if user is already authenticated
	useEffect(() => {
		if (!isLoading && user) {
			router.push('/');
		}
	}, [user, router, isLoading]);

	// If still loading or user is authenticated, show nothing
	if (isLoading || user) {
		return null;
	}

	// Add the actual rendering of the auth cards
	return (
		<div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
			{/* Forgot Password Dialog */}
			<Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{t('auth.forgotPassword')}</DialogTitle>
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
						/>
					</div>
					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={(e) => {
								e.preventDefault();
								setShowForgotPassword(false);
							}}
							className="flex items-center gap-1"
						>
							<X className="h-4 w-4" />
							{t('common.cancel')}
						</Button>
						<Button
							type="button"
							size="sm"
							onClick={(e) => {
								e.preventDefault();
								handleResetPassword();
							}}
						>
							{t('auth.sendResetLink')}
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
							<SignupForm />
						</AuthCard>
					</div>
				</div>
			</div>
		</div>
	);
}
