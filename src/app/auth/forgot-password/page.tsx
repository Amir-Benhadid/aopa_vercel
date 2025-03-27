'use client';

import { FeedbackDialog } from '@/components/auth/FeedbackDialog';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { supabase } from '@/lib/supabase';
import { Form, Formik } from 'formik';
import { AtSign, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

const ForgotPasswordSchema = Yup.object().shape({
	email: Yup.string().email('Invalid email').required('Required'),
});

export default function ForgotPasswordPage() {
	const router = useRouter();
	const { t } = useTranslation();
	const [success, setSuccess] = useState(false);
	const [sentEmail, setSentEmail] = useState('');

	// Dialog state
	const [feedbackDialog, setFeedbackDialog] = useState({
		isOpen: false,
		title: '',
		message: '',
		type: 'loading' as 'success' | 'error' | 'loading',
		actionLabel: '',
		onAction: () => {},
	});

	const handleResetPassword = async (email: string) => {
		// Show loading dialog
		setFeedbackDialog({
			isOpen: true,
			title: t('auth.sendingResetLink'),
			message: t('auth.sendingResetLinkMessage'),
			type: 'loading',
			actionLabel: '',
			onAction: () => {},
		});

		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/auth/reset-password`,
			});

			if (error) {
				console.error('Error sending reset email:', error);
				setFeedbackDialog({
					isOpen: true,
					title: t('auth.resetLinkFailed'),
					message: t('auth.resetLinkFailedMessage'),
					type: 'error',
					actionLabel: t('common.tryAgain'),
					onAction: () =>
						setFeedbackDialog((prev) => ({ ...prev, isOpen: false })),
				});
				return;
			}

			// Store email for success message
			setSentEmail(email);

			// Show success dialog
			setFeedbackDialog({
				isOpen: true,
				title: t('auth.resetLinkSent'),
				message: t('auth.resetLinkSentMessage'),
				type: 'success',
				actionLabel: t('common.backToLogin'),
				onAction: () => router.push('/auth'),
			});

			// Set success state to show alternative UI
			setSuccess(true);
		} catch (error) {
			console.error('Error in resetPasswordForEmail:', error);
			setFeedbackDialog({
				isOpen: true,
				title: t('auth.resetLinkFailed'),
				message: t('auth.resetLinkFailedMessage'),
				type: 'error',
				actionLabel: t('common.tryAgain'),
				onAction: () =>
					setFeedbackDialog((prev) => ({ ...prev, isOpen: false })),
			});
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
			<div className="w-full max-w-md">
				{/* Decorative elements */}
				<div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-primary-400/20 to-primary-600/20 -z-10 blur-3xl opacity-50"></div>
				<div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-l from-primary-400/20 to-primary-600/20 -z-10 blur-3xl opacity-50"></div>

				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden card-glow">
					<div className="p-8">
						<div className="flex justify-center mb-4">
							<Image
								src="/images/logo.svg"
								alt={t('app.logoAlt')}
								width={64}
								height={64}
								className="h-16 w-auto"
								priority
							/>
						</div>

						{success ? (
							<div className="space-y-6 text-center">
								<div>
									<h2 className="text-2xl font-bold text-center bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
										{t('auth.resetLinkSent')}
									</h2>
									<p className="mt-2 text-card-foreground/60">
										{t('auth.resetLinkSentMessage')}
									</p>
									<div className="mt-4 p-3 bg-primary-50 dark:bg-gray-700 rounded-md">
										<p className="font-medium text-primary-600 dark:text-primary-400">
											{sentEmail}
										</p>
									</div>
								</div>
								<div className="space-y-3">
									<Button
										onClick={() => router.push('/auth')}
										className="w-full bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500"
									>
										{t('common.backToLogin')}
									</Button>
									<Button
										onClick={() => setSuccess(false)}
										variant="outline"
										className="w-full"
									>
										{t('common.tryAgain')}
									</Button>
								</div>
							</div>
						) : (
							<div className="space-y-6">
								<div>
									<h2 className="text-2xl font-bold text-center bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
										{t('auth.forgotPassword')}
									</h2>
									<p className="mt-2 text-center text-card-foreground/60">
										{t('auth.enterEmailForReset')}
									</p>
								</div>

								<Formik
									initialValues={{ email: '' }}
									validationSchema={ForgotPasswordSchema}
									onSubmit={async (values) => {
										await handleResetPassword(values.email);
									}}
								>
									{({
										values,
										errors,
										touched,
										handleChange,
										handleBlur,
										handleSubmit,
										isSubmitting,
									}) => (
										<Form className="space-y-4">
											<div>
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
														<AtSign className="text-primary-400 h-5 w-5" />
													}
													className="rounded-lg transition-all duration-300 hover:shadow-md auth-input-field"
												/>
												<input
													name="email-blur"
													type="hidden"
													onBlur={handleBlur}
												/>
											</div>

											<Button
												type="submit"
												disabled={isSubmitting}
												className="w-full h-12 bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg auth-button"
											>
												{t('auth.sendResetLink')}
											</Button>

											<div>
												<Link
													href="/auth"
													className="flex items-center justify-center text-sm text-primary-500 hover:text-primary-600 auth-button"
												>
													<ChevronLeft className="h-4 w-4 mr-1" />
													{t('auth.backToLogin')}
												</Link>
											</div>
										</Form>
									)}
								</Formik>
							</div>
						)}
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
