'use client';

import { FeedbackDialog } from '@/components/auth/FeedbackDialog';
import { supabase } from '@/lib/supabase';
import { Field, Form, Formik } from 'formik';
import { AnimatePresence, motion } from 'framer-motion';
import { AtSign, Check, Loader2, Mail, SendIcon, User } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as Yup from 'yup';

// Contact form validation schema
const ContactSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, 'Name is too short')
		.max(100, 'Name is too long')
		.required('Required'),
	email: Yup.string().email('Invalid email address').required('Required'),
	subject: Yup.string()
		.min(2, 'Subject is too short')
		.max(100, 'Subject is too long')
		.required('Required'),
	message: Yup.string()
		.min(10, 'Message is too short')
		.max(1000, 'Message is too long')
		.required('Required'),
});

// Initial values for the form
const initialValues = {
	name: '',
	email: '',
	subject: '',
	message: '',
};

export default function ContactPage() {
	const { t } = useTranslation();
	const [formSuccess, setFormSuccess] = useState(false);
	const [feedbackDialog, setFeedbackDialog] = useState<{
		isOpen: boolean;
		title: string;
		message: string;
		type: 'success' | 'error' | 'loading';
	}>({
		isOpen: false,
		title: '',
		message: '',
		type: 'loading',
	});

	// Close dialog handler
	const handleCloseDialog = () => {
		setFeedbackDialog((prev) => ({ ...prev, isOpen: false }));
	};

	// Handle form submission
	const handleSubmit = async (
		values: typeof initialValues,
		{ resetForm, setSubmitting }: any
	) => {
		// Show loading dialog
		setFeedbackDialog({
			isOpen: true,
			title: t('contact.form.sending'),
			message: t('contact.form.sendingMessage'),
			type: 'loading',
		});

		try {
			// Save message to Supabase contacts table
			const { error } = await supabase.from('contact').insert({
				name: values.name,
				email: values.email,
				subject: values.subject,
				message: values.message,
				status: 'new',
				created_at: new Date().toISOString(),
			});

			if (error) {
				throw error;
			}

			// Show success dialog
			setFeedbackDialog({
				isOpen: true,
				title: t('contact.form.successTitle'),
				message: t('contact.form.successMessage'),
				type: 'success',
			});

			setFormSuccess(true);
			toast.success(t('contact.toast.success'));
			resetForm();

			// Reset success message after a delay
			setTimeout(() => {
				setFormSuccess(false);
			}, 5000);
		} catch (error: any) {
			console.error('Error sending message:', error);

			// Show error dialog
			setFeedbackDialog({
				isOpen: true,
				title: t('contact.form.errorTitle'),
				message: t('contact.form.errorMessage'),

				type: 'error',
			});

			toast.error(t('contact.toast.error'));
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div>
			{/* Feedback Dialog */}
			<FeedbackDialog
				isOpen={feedbackDialog.isOpen}
				onClose={handleCloseDialog}
				title={feedbackDialog.title}
				message={feedbackDialog.message}
				type={feedbackDialog.type}
			/>

			{/* Content Section */}
			<section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
				<div className="max-w-5xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
						{/* Contact Form */}
						<motion.div
							className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 border border-gray-100 dark:border-gray-700"
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							{/* Success overlay */}
							<AnimatePresence>
								{formSuccess && (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className="absolute inset-0 bg-white dark:bg-gray-800 flex flex-col items-center justify-center z-10 rounded-2xl"
									>
										<div className="rounded-full bg-green-100 dark:bg-green-900/30 p-5 mb-5">
											<Check className="h-10 w-10 text-green-600 dark:text-green-400" />
										</div>
										<h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
											{t('contact.form.successTitle') || 'Message Sent!'}
										</h3>
										<p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
											{t('contact.form.successMessage') ||
												'Thank you for your message. We will get back to you soon.'}
										</p>
									</motion.div>
								)}
							</AnimatePresence>

							<div className="mb-6">
								<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
									{t('contact.form.title') || 'Send us a Message'}
								</h2>
								<div className="w-20 h-1 bg-blue-500 mt-2"></div>
							</div>

							<Formik
								initialValues={initialValues}
								validationSchema={ContactSchema}
								onSubmit={handleSubmit}
							>
								{({ isSubmitting, errors, touched }) => (
									<Form className="space-y-5">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
											<div>
												<label
													htmlFor="name"
													className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
												>
													{t('contact.form.name') || 'Full Name'}
													{errors.name && touched.name && (
														<span className="text-sm text-red-500 dark:text-red-400 ml-2">
															({errors.name})
														</span>
													)}
												</label>
												<div className="relative">
													<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
														<User className="h-5 w-5 text-gray-400" />
													</div>
													<Field
														type="text"
														name="name"
														id="name"
														className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
															errors.name && touched.name
																? 'border-red-500 dark:border-red-500'
																: 'border-gray-300 dark:border-gray-600'
														}`}
														placeholder={t('contact.form.name')}
													/>
												</div>
											</div>

											<div>
												<label
													htmlFor="email"
													className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
												>
													{t('contact.form.email') || 'Email Address'}
													{errors.email && touched.email && (
														<span className="text-sm text-red-500 dark:text-red-400 ml-2">
															({errors.email})
														</span>
													)}
												</label>
												<div className="relative">
													<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
														<AtSign className="h-5 w-5 text-gray-400" />
													</div>
													<Field
														type="email"
														name="email"
														id="email"
														className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
															errors.email && touched.email
																? 'border-red-500 dark:border-red-500'
																: 'border-gray-300 dark:border-gray-600'
														}`}
														placeholder={t('contact.form.email')}
													/>
												</div>
											</div>
										</div>

										<div>
											<label
												htmlFor="subject"
												className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
											>
												{t('contact.form.subject') || 'Subject'}
												{errors.subject && touched.subject && (
													<span className="text-sm text-red-500 dark:text-red-400 ml-2">
														({errors.subject})
													</span>
												)}
											</label>
											<div className="relative">
												<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
													<Mail className="h-5 w-5 text-gray-400" />
												</div>
												<Field
													type="text"
													name="subject"
													id="subject"
													className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
														errors.subject && touched.subject
															? 'border-red-500 dark:border-red-500'
															: 'border-gray-300 dark:border-gray-600'
													}`}
													placeholder={t('contact.form.subject')}
												/>
											</div>
										</div>

										<div>
											<label
												htmlFor="message"
												className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
											>
												{t('contact.form.message') || 'Your Message'}
												{errors.message && touched.message && (
													<span className="text-sm text-red-500 dark:text-red-400 ml-2">
														({errors.message})
													</span>
												)}
											</label>
											<Field
												as="textarea"
												name="message"
												id="message"
												rows={5}
												className={`w-full px-4 py-2.5 border rounded-lg bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
													errors.message && touched.message
														? 'border-red-500 dark:border-red-500'
														: 'border-gray-300 dark:border-gray-600'
												}`}
												placeholder={t('contact.form.message')}
											/>
										</div>

										<div>
											<button
												type="submit"
												disabled={isSubmitting}
												className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
											>
												{isSubmitting ? (
													<>
														<Loader2 className="animate-spin mr-2 h-5 w-5" />
														{t('contact.form.sending') || 'Sending...'}
													</>
												) : (
													<>
														<SendIcon className="mr-2 h-5 w-5" />
														{t('contact.form.submit') || 'Send Message'}
													</>
												)}
											</button>
										</div>
									</Form>
								)}
							</Formik>
						</motion.div>

						{/* Contact Information */}
						<motion.div
							className="space-y-6"
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
						>
							<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
									{t('contact.info.email.title') || 'Email'}
								</h3>
								<div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
									<Mail className="h-5 w-5 text-blue-500 mr-2" />
									<span>contact@aopa.dz</span>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>
		</div>
	);
}
