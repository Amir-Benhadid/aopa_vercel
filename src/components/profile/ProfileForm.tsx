'use client';

import { Button } from '@/components/ui/Button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/Dialog';
import { TextField } from '@/components/ui/TextField';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Form, Formik } from 'formik';
import { Camera, CheckCircle, Key, Loader2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as Yup from 'yup';

interface ProfileFormProps {
	initialData?: any;
	onComplete?: () => void;
	isModal?: boolean;
}

interface PasswordChangeData {
	oldPassword: string;
	newPassword: string;
	confirmPassword: string;
}

export function ProfileForm({
	initialData,
	onComplete,
	isModal = false,
}: ProfileFormProps) {
	const { user } = useAuth();
	const router = useRouter();
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
	const [isEmailChangeOpen, setIsEmailChangeOpen] = useState(false);
	const [isEmailVerificationSent, setIsEmailVerificationSent] = useState(false);
	const [isEmailUpdating, setIsEmailUpdating] = useState(false);
	const [newEmail, setNewEmail] = useState('');
	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
	const { t } = useTranslation();
	const [isInitialized, setIsInitialized] = useState(false);
	const [profileData, setProfileData] = useState<{
		name: string;
		surname: string;
		status: string;
		specialty: string;
		phone: string;
		street: string;
		city: string;
		country: string;
		civility: string;
		email: string;
	}>({
		name: '',
		surname: '',
		status: '',
		specialty: '',
		phone: '',
		street: '',
		city: '',
		country: 'Morocco',
		civility: '',
		email: user?.email || '',
	});
	const [emailError, setEmailError] = useState<string | null>(null);

	// Define translated options within component scope
	const SPECIALTIES = [
		'ophthalmology',
		'retina',
		'glaucoma',
		'cornea',
		'pediatric_ophthalmology',
		'oculoplastics',
		'neuro_ophthalmology',
		'other',
	] as const;

	const STATUSES = [
		'liberal',
		'public',
		'resident',
		'orthoptiste',
		'optometrist',
		'optician',
	] as const;

	const CIVILITIES = ['mr', 'mme', 'dr'] as const;

	type Specialty = (typeof SPECIALTIES)[number];
	type Status = (typeof STATUSES)[number];
	type Civility = (typeof CIVILITIES)[number];

	interface ProfileFormData {
		name: string;
		surname: string;
		status: Status;
		specialty: Specialty;
		phone: string;
		street: string;
		city: string;
		country: string;
		civility: Civility;
		email: string;
	}

	// Create validation schema with translations
	const profileSchema = Yup.object().shape({
		name: Yup.string().required(t('profile.validation.nameRequired')),
		surname: Yup.string().required(t('profile.validation.surnameRequired')),
		status: Yup.string()
			.oneOf(STATUSES)
			.required(t('profile.validation.statusRequired')),
		specialty: Yup.string()
			.oneOf(SPECIALTIES)
			.required(t('profile.validation.specialtyRequired')),
		phone: Yup.string().required(t('profile.validation.phoneRequired')),
		street: Yup.string().required(t('profile.validation.streetRequired')),
		city: Yup.string().required(t('profile.validation.cityRequired')),
		civility: Yup.string()
			.oneOf(CIVILITIES)
			.required(t('profile.validation.civilityRequired')),
		email: Yup.string()
			.email(t('profile.validation.emailInvalid'))
			.required(t('profile.validation.emailRequired')),
	});

	const passwordChangeSchema = Yup.object().shape({
		oldPassword: Yup.string().required(
			t('profile.validation.oldPasswordRequired')
		),
		newPassword: Yup.string()
			.min(8, t('profile.validation.passwordMinLength'))
			.required(t('profile.validation.newPasswordRequired')),
		confirmPassword: Yup.string()
			.oneOf([Yup.ref('newPassword')], t('profile.validation.passwordMismatch'))
			.required(t('profile.validation.confirmPasswordRequired')),
	});

	useEffect(() => {
		const fetchData = async () => {
			if (!user) return;

			try {
				// Fetch the account data with address
				const { data: accountData, error: accountError } = await supabase
					.from('accounts')
					.select('*, addresses(*)')
					.eq('user_id', user.id)
					.single();

				if (accountError && accountError.code !== 'PGRST116') {
					console.error('Error fetching account data:', accountError);
					setIsInitialized(true);
					return;
				}

				if (accountData) {
					// Update avatar URL from user metadata
					const userData = user as any;
					if (userData.user_metadata?.avatar_url) {
						setAvatarUrl(userData.user_metadata.avatar_url);
					}

					// Prepare the form data with proper type
					const newProfileData = {
						name: accountData.name || '',
						surname: accountData.surname || '',
						status: accountData.status || '',
						specialty: accountData.specialty || '',
						phone: accountData.phone || '',
						civility: accountData.civility || '',
						email: user.email || '',
						street: '',
						city: '',
						country: 'Morocco',
					};

					// Add address data if available
					if (accountData.addresses) {
						const addressData = accountData.addresses;
						newProfileData.street = addressData.street || '';
						newProfileData.city = addressData.city || '';
						newProfileData.country = addressData.country || 'Morocco';
					}

					console.log('Loaded profile data:', newProfileData);

					// Update the state
					setProfileData(newProfileData);
				}
			} catch (error) {
				console.error('Error initializing profile data:', error);
			} finally {
				setIsInitialized(true);
			}
		};

		fetchData();
	}, [user]);

	const handleEmailChange = async (newEmail: string) => {
		try {
			// Reset error state
			setEmailError(null);

			if (!newEmail || newEmail === user?.email) {
				setEmailError(t('profile.errors.emailUnchanged'));
				return;
			}

			setIsEmailUpdating(true);
			// Show loading toast
			const loadingToast = toast.loading(t('profile.form.updatingEmail'));

			// First verify if the user is allowed to change the email
			// This will also work as a verification of the user's identity
			const { error: verificationError } = await supabase.auth.getSession();

			if (verificationError) {
				console.error('Session verification error:', verificationError);
				setIsEmailUpdating(false);
				toast.dismiss(loadingToast);
				setEmailError(t('profile.errors.sessionExpired'));
				return;
			}

			// Update email in Supabase Auth
			const { error } = await supabase.auth.updateUser({ email: newEmail });

			// Clear loading toast
			toast.dismiss(loadingToast);
			setIsEmailUpdating(false);

			if (error) {
				console.error('Email update error:', error);

				// Handle specific error types with proper localized messages
				if (
					error.message.includes('already been registered') ||
					error.message.includes('already registered') ||
					error.message.includes('déjà enregistré')
				) {
					setEmailError(t('profile.errors.emailExists'));
					toast.error(t('profile.errors.emailExists'));
					return;
				}

				// Handle auth errors
				if (
					error.message.includes('reauthentication required') ||
					error.message.includes('session expired') ||
					error.message.includes('not authenticated')
				) {
					setEmailError(t('profile.errors.authRequired'));
					toast.error(t('profile.errors.authRequired'));
					return;
				}

				// Show generic error message for other errors
				setEmailError(t('profile.errors.emailUpdateFailed'));
				toast.error(t('profile.errors.emailUpdateFailed'));
				return;
			}

			setIsEmailVerificationSent(true);
			setIsEmailChangeOpen(false);
			toast.success(t('profile.success.emailVerificationSent'));
		} catch (error) {
			console.error('Email change error:', error);
			setEmailError(t('profile.errors.emailUpdateFailed'));
			setIsEmailUpdating(false);
			toast.error(t('profile.errors.emailUpdateFailed'));
		}
	};

	const handlePasswordChange = async (values: PasswordChangeData) => {
		try {
			// Reset error state
			setPasswordError(null);
			setIsPasswordUpdating(true);

			// First verify the old password
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email: user?.email || '',
				password: values.oldPassword,
			});

			if (signInError) {
				console.error('Old password verification failed:', signInError);

				// Check for specific error types
				if (signInError.message.includes('Invalid login credentials')) {
					setPasswordError(t('profile.errors.wrongPassword'));
					toast.error(t('profile.errors.wrongPassword'));
					setIsPasswordUpdating(false);
					return;
				}

				// If there's another type of error with the sign-in
				setPasswordError(
					signInError.message || t('profile.errors.passwordUpdateFailed')
				);
				toast.error(
					signInError.message || t('profile.errors.passwordUpdateFailed')
				);
				setIsPasswordUpdating(false);
				return;
			}

			// Show loading toast
			const loadingToast = toast.loading(t('profile.passwordChange.updating'));

			// If old password is correct, update to new password
			const { error } = await supabase.auth.updateUser({
				password: values.newPassword,
			});

			// Clear loading toast
			toast.dismiss(loadingToast);
			setIsPasswordUpdating(false);

			if (error) {
				console.error('Password update error:', error);

				// Handle specific error cases for password update
				if (error.message.includes('auth/invalid-action-code')) {
					setPasswordError(t('profile.errors.invalidResetLink'));
					toast.error(t('profile.errors.invalidResetLink'));
					return;
				}

				if (error.message.includes('expired')) {
					setPasswordError(t('profile.errors.expiredResetLink'));
					toast.error(t('profile.errors.expiredResetLink'));
					return;
				}

				// More specific error handling
				if (
					error.message.includes('reauthentication required') ||
					error.message.includes('session expired') ||
					error.message.includes('not authenticated')
				) {
					setPasswordError(t('profile.errors.sessionExpired'));
					toast.error(t('profile.errors.sessionExpired'));
					// Optionally redirect to login page after a delay
					setTimeout(() => {
						router.push('/auth');
					}, 2000);
					return;
				}

				// Password strength check
				if (
					error.message.includes('password') &&
					error.message.includes('weak')
				) {
					setPasswordError(t('profile.validation.passwordMinLength'));
					toast.error(t('profile.validation.passwordMinLength'));
					return;
				}

				// Generic error
				setPasswordError(
					error.message || t('profile.errors.passwordUpdateFailed')
				);
				toast.error(error.message || t('profile.errors.passwordUpdateFailed'));
				return;
			}

			// Close dialog and show success message
			setIsPasswordDialogOpen(false);
			toast.success(t('profile.success.passwordUpdated'));
		} catch (error: any) {
			console.error('Password change error:', error);
			setPasswordError(
				error.message || t('profile.errors.passwordUpdateFailed')
			);
			toast.error(error.message || t('profile.errors.passwordUpdateFailed'));
			setIsPasswordUpdating(false);
		}
	};

	const handleAvatarUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		try {
			setUploading(true);

			if (!event.target.files || event.target.files.length === 0) {
				throw new Error(t('profile.errors.selectImage'));
			}

			const file = event.target.files[0];
			const fileExt = file.name.split('.').pop();
			const fileName = `avatar-${Date.now()}.${fileExt}`;
			const filePath = `${user?.id}/${fileName}`;

			// Upload the file to Supabase storage
			const { error: uploadError } = await supabase.storage
				.from('avatars')
				.upload(filePath, file, { upsert: true });

			if (uploadError) {
				console.error('Avatar upload error:', uploadError);
				throw uploadError;
			}

			// Get the public URL
			const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

			if (!data || !data.publicUrl) {
				throw new Error('Failed to get public URL for uploaded avatar');
			}

			const newAvatarUrl = data.publicUrl;
			console.log('Avatar uploaded successfully, URL:', newAvatarUrl);

			// Update the user's avatar_url in auth.users
			const { error: updateError } = await supabase.auth.updateUser({
				data: { avatar_url: newAvatarUrl },
			});

			if (updateError) {
				console.error('Error updating avatar in auth:', updateError);
				throw updateError;
			}

			setAvatarUrl(newAvatarUrl);
			toast.success(t('profile.success.avatarUploaded'));
		} catch (error: any) {
			console.error('Avatar upload error:', error);
			toast.error(error.message || t('profile.errors.uploadFailed'));
		} finally {
			setUploading(false);
			// Clear the input value to allow selecting the same file again
			if (event.target) {
				event.target.value = '';
			}
		}
	};

	const handleSubmit = async (values: any, { setSubmitting }: any) => {
		try {
			if (!user) throw new Error('No user');

			console.log('Starting profile update with data:', values);

			// First, check if account exists
			const { data: existingAccount, error: accountCheckError } = await supabase
				.from('accounts')
				.select('id, address_id')
				.eq('user_id', user.id)
				.single();

			if (accountCheckError && accountCheckError.code !== 'PGRST116') {
				console.error('Error checking account:', accountCheckError);
				throw accountCheckError;
			}

			console.log('Existing account:', existingAccount);

			// Handle address
			let addressId = existingAccount?.address_id;
			console.log('Address values:', {
				street: values.street,
				city: values.city,
				country: values.country,
			});

			if (values.street || values.city) {
				const addressData = {
					street: values.street || '',
					city: values.city || '',
					country: 'Morocco',
					updated_at: new Date(),
				};

				if (!addressId) {
					// Create new address
					console.log('Creating new address with data:', addressData);
					const { data: newAddress, error: addressError } = await supabase
						.from('addresses')
						.insert([addressData])
						.select('id')
						.single();

					if (addressError) {
						console.error('Error creating address:', addressError);
						throw addressError;
					}

					console.log('New address created:', newAddress);
					addressId = newAddress.id;
				} else {
					// Update existing address
					console.log(
						'Updating address id:',
						addressId,
						'with data:',
						addressData
					);

					const { error: updateAddressError } = await supabase
						.from('addresses')
						.update(addressData)
						.eq('id', addressId);

					if (updateAddressError) {
						console.error('Error updating address:', updateAddressError);
						throw updateAddressError;
					}

					console.log('Address updated successfully');
				}
			}

			// Prepare account data
			const accountData = {
				user_id: user.id,
				name: values.name,
				surname: values.surname,
				phone: values.phone || null,
				address_id: addressId,
				status: values.status,
				specialty: values.specialty,
				civility: values.civility,
			};

			console.log('Account data prepared:', accountData);

			// Insert or update account
			if (!existingAccount) {
				console.log('Creating new account with data:', accountData);
				const { data: newAccount, error: insertError } = await supabase
					.from('accounts')
					.insert([accountData])
					.select('id')
					.single();

				if (insertError) {
					console.error('Error creating account:', insertError);
					throw insertError;
				}

				console.log('New account created:', newAccount);
			} else {
				console.log('Updating existing account with data:', accountData);
				const { error: updateError } = await supabase
					.from('accounts')
					.update(accountData)
					.eq('id', existingAccount.id);

				if (updateError) {
					console.error('Error updating account:', updateError);
					throw updateError;
				}

				console.log('Account updated successfully');
			}

			// Update user metadata
			console.log('Updating user metadata in Auth');
			const { error: updateMetadataError } = await supabase.auth.updateUser({
				data: {
					avatar_url: avatarUrl,
					name: values.name,
					surname: values.surname,
					civility: values.civility,
				},
			});

			if (updateMetadataError) {
				console.error('Failed to update user metadata:', updateMetadataError);
				throw updateMetadataError;
			}

			console.log('Profile updated successfully');
			toast.success(t('profile.success.profileUpdated'));

			// Refresh the profile data
			setIsInitialized(false);
			setTimeout(() => {
				// Wait a moment before handling completion
				if (onComplete) {
					console.log('Executing onComplete callback');
					onComplete();
				} else if (!isModal) {
					console.log('Redirecting to home page');
					router.push('/');
				}
			}, 500);
		} catch (error: any) {
			console.error('Profile update error:', error);
			toast.error(error.message || t('profile.errors.updateFailed'));
		} finally {
			setSubmitting(false);
		}
	};

	const translatedSpecialties = SPECIALTIES.map((specialty) => ({
		value: specialty,
		label: t(`profile.form.specialties.${specialty}`),
	}));

	const translatedStatuses = STATUSES.map((status) => ({
		value: status,
		label: t(`profile.form.statuses.${status}`),
	}));

	const translatedCivilities = CIVILITIES.map((civility) => ({
		value: civility,
		label: t(`profile.form.civilities.${civility}`),
	}));

	return (
		<>
			{isInitialized && (
				<Formik
					initialValues={profileData}
					validationSchema={profileSchema}
					onSubmit={handleSubmit}
				>
					{({
						values,
						errors,
						touched,
						handleChange,
						setFieldValue,
						isSubmitting,
					}) => (
						<Form className="space-y-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
							{/* Avatar Upload */}
							<div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
								<div className="relative h-24 w-24">
									{avatarUrl ? (
										<Image
											src={avatarUrl}
											alt="Profile"
											width={96}
											height={96}
											className="h-24 w-24 rounded-full object-cover border-2 border-primary-100 dark:border-primary-900"
										/>
									) : (
										<div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
											<Camera className="h-8 w-8 text-gray-400 dark:text-gray-500" />
										</div>
									)}
									{uploading && (
										<div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
											<Loader2 className="h-8 w-8 animate-spin text-white" />
										</div>
									)}
								</div>

								<div className="flex flex-col space-y-2">
									<h3 className="text-lg font-medium text-gray-900 dark:text-white">
										{t('profile.form.profilePicture')}
									</h3>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										{t('profile.form.profilePictureDescription')}
									</p>
									<div className="mt-1">
										<label
											htmlFor="avatar-upload"
											className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800"
										>
											<Upload className="h-4 w-4" />
											{uploading
												? t('profile.form.uploading')
												: t('profile.form.uploadPhoto')}
										</label>
										<input
											id="avatar-upload"
											type="file"
											className="sr-only"
											accept="image/*"
											onChange={handleAvatarUpload}
											disabled={uploading}
										/>
									</div>
								</div>
							</div>

							{/* Personal Information Section */}
							<div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
								<h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
									{t('profile.personalInfo')}
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
									<div className="w-full">
										<TextField
											name="name"
											label={t('profile.form.firstName')}
											value={values.name}
											onChange={handleChange}
											error={!!(errors.name && touched.name)}
											helperText={touched.name ? String(errors.name) : ''}
											required
											className="h-10 w-full"
										/>
									</div>

									<div className="w-full">
										<TextField
											name="surname"
											label={t('profile.form.lastName')}
											value={values.surname}
											onChange={handleChange}
											error={!!(errors.surname && touched.surname)}
											helperText={touched.surname ? String(errors.surname) : ''}
											required
											className="h-10 w-full"
										/>
									</div>

									<div className="w-full">
										<TextField
											name="phone"
											label={t('profile.form.phone')}
											value={values.phone}
											onChange={handleChange}
											error={!!(errors.phone && touched.phone)}
											helperText={touched.phone ? String(errors.phone) : ''}
											required
											className="h-10 w-full"
										/>
									</div>

									<div className="w-full">
										<TextField
											name="email"
											label={t('profile.form.email')}
											value={values.email}
											onChange={handleChange}
											error={!!(errors.email && touched.email)}
											helperText={touched.email ? String(errors.email) : ''}
											required
											disabled
											className="h-10 w-full bg-gray-50 dark:bg-gray-700/30"
										/>
									</div>
								</div>
							</div>

							{/* Professional Information Section */}
							<div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
								<h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
									{t('profile.academicInfo')}
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
											{t('profile.form.civility')} *
										</label>
										<select
											name="civility"
											value={values.civility}
											onChange={handleChange}
											className={`w-full h-10 px-3 py-2 border ${
												errors.civility && touched.civility
													? 'border-red-500 focus:ring-red-500'
													: 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
											} rounded-md shadow-sm focus:border-primary-500 focus:outline-none dark:bg-gray-700 dark:text-white bg-white`}
										>
											<option value="">
												{t('profile.form.selectCivility')}
											</option>
											{translatedCivilities.map(({ value, label }) => (
												<option key={value} value={value}>
													{label}
												</option>
											))}
										</select>
										{errors.civility && touched.civility && (
											<p className="mt-1 text-xs text-red-500">
												{errors.civility as string}
											</p>
										)}
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
											{t('profile.form.status')} *
										</label>
										<select
											name="status"
											value={values.status}
											onChange={handleChange}
											className={`w-full h-10 px-3 py-2 border ${
												errors.status && touched.status
													? 'border-red-500 focus:ring-red-500'
													: 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
											} rounded-md shadow-sm focus:border-primary-500 focus:outline-none dark:bg-gray-700 dark:text-white bg-white`}
										>
											<option value="">{t('profile.form.selectStatus')}</option>
											{translatedStatuses.map(({ value, label }) => (
												<option key={value} value={value}>
													{label}
												</option>
											))}
										</select>
										{errors.status && touched.status && (
											<p className="mt-1 text-xs text-red-500">
												{errors.status as string}
											</p>
										)}
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
											{t('profile.form.specialty')} *
										</label>
										<select
											name="specialty"
											value={values.specialty}
											onChange={handleChange}
											className={`w-full h-10 px-3 py-2 border ${
												errors.specialty && touched.specialty
													? 'border-red-500 focus:ring-red-500'
													: 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
											} rounded-md shadow-sm focus:border-primary-500 focus:outline-none dark:bg-gray-700 dark:text-white bg-white`}
										>
											<option value="">
												{t('profile.form.selectSpecialty')}
											</option>
											{translatedSpecialties.map(({ value, label }) => (
												<option key={value} value={value}>
													{label}
												</option>
											))}
										</select>
										{errors.specialty && touched.specialty && (
											<p className="mt-1 text-xs text-red-500">
												{errors.specialty as string}
											</p>
										)}
									</div>
								</div>
							</div>

							{/* Contact Information Section */}
							<div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
								<h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
									{t('profile.contactInfo')}
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
									<div className="w-full">
										<TextField
											name="street"
											label={t('profile.form.street')}
											value={values.street}
											onChange={handleChange}
											error={!!(errors.street && touched.street)}
											helperText={touched.street ? String(errors.street) : ''}
											required
											className="h-10 w-full"
										/>
									</div>

									<div className="w-full">
										<TextField
											name="city"
											label={t('profile.form.city')}
											value={values.city}
											onChange={handleChange}
											error={!!(errors.city && touched.city)}
											helperText={touched.city ? String(errors.city) : ''}
											required
											className="h-10 w-full"
										/>
									</div>
								</div>
							</div>

							{/* Account Settings Section */}
							<div className="mt-8 p-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
								<h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
									{t('profile.form.accountSettings')}
								</h3>

								<div className="space-y-5">
									<div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900/50">
										<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
											<div className="flex-1">
												<h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
													{t('profile.form.email')}
												</h4>
												<div className="flex flex-col gap-2">
													<div className="flex items-center gap-2">
														<span className="text-sm text-gray-600 dark:text-gray-400">
															{user?.email}
														</span>
														{isEmailVerificationSent && (
															<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
																<CheckCircle className="w-3 h-3 mr-1" />
																{t('profile.success.emailVerificationSent')}
															</span>
														)}
													</div>
												</div>
											</div>
											<Button
												type="button"
												onClick={() => {
													setNewEmail('');
													setIsEmailChangeOpen(true);
												}}
												variant="outline"
												className="h-9 whitespace-nowrap"
												disabled={isEmailUpdating}
											>
												{isEmailUpdating ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														{t('profile.form.updatingEmail')}
													</>
												) : (
													t('profile.form.updateEmail')
												)}
											</Button>
										</div>
									</div>

									<div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900/50">
										<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
											<div>
												<h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
													{t('profile.passwordChange.title')}
												</h4>
												<p className="text-sm text-gray-600 dark:text-gray-400">
													{t('profile.passwordChange.description')}
												</p>
											</div>
											<Button
												type="button"
												variant="outline"
												onClick={() => setIsPasswordDialogOpen(true)}
												className="h-9 whitespace-nowrap flex items-center gap-2"
											>
												<Key className="h-4 w-4" />
												{t('profile.form.changePassword')}
											</Button>
										</div>
									</div>
								</div>
							</div>

							<div className="flex justify-end space-x-4 pt-8">
								{!isModal && (
									<Button
										type="button"
										variant="outline"
										onClick={() => router.back()}
										className="h-10 px-4"
										disabled={isSubmitting || uploading}
									>
										{t('common.cancel')}
									</Button>
								)}

								<Button
									type="submit"
									disabled={isSubmitting || uploading}
									className="h-10 px-6"
								>
									{isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											{t('profile.form.saving')}
										</>
									) : (
										t('profile.form.save')
									)}
								</Button>
							</div>
						</Form>
					)}
				</Formik>
			)}
			{!isInitialized && (
				<div className="flex justify-center items-center h-60">
					<Loader2 className="h-8 w-8 animate-spin text-primary-500" />
				</div>
			)}

			{/* Email Change Dialog */}
			<Dialog
				open={isEmailChangeOpen}
				onOpenChange={(open) => {
					if (!isEmailUpdating) {
						setIsEmailChangeOpen(open);
						if (!open) {
							setEmailError(null);
						}
					}
				}}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{t('profile.emailChange.title')}</DialogTitle>
					</DialogHeader>

					<div className="space-y-4 pt-4">
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{t('profile.emailChange.description')}
						</p>

						<div className="space-y-4">
							<div className="relative">
								<label
									htmlFor="email-input"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
								>
									{t('profile.emailChange.newEmail')} *
								</label>
								<input
									id="email-input"
									type="email"
									value={newEmail}
									onChange={(e) => setNewEmail(e.target.value)}
									className={`w-full h-10 px-3 py-2 border ${
										emailError
											? 'border-red-500 focus:ring-red-500'
											: 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
									} rounded-md shadow-sm focus:border-primary-500 focus:outline-none dark:bg-gray-700 dark:text-white bg-white`}
									disabled={isEmailUpdating}
								/>
							</div>

							{emailError && (
								<div className="rounded-md bg-red-50 p-3 text-sm border border-red-200">
									<div className="flex">
										<div className="flex-shrink-0">
											<svg
												className="h-5 w-5 text-red-400"
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fillRule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<div className="ml-3">
											<p className="text-sm font-medium text-red-800">
												{emailError}
											</p>
										</div>
									</div>
								</div>
							)}
						</div>

						<div className="flex justify-end space-x-4 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setIsEmailChangeOpen(false);
									setEmailError(null);
								}}
								className="h-10"
								disabled={isEmailUpdating}
							>
								{t('common.cancel')}
							</Button>
							<Button
								type="button"
								onClick={() => handleEmailChange(newEmail)}
								className="h-10"
								disabled={
									isEmailUpdating || !newEmail || newEmail === user?.email
								}
							>
								{isEmailUpdating ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{t('profile.form.updatingEmail')}
									</>
								) : (
									t('profile.emailChange.update')
								)}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Password Change Dialog */}
			<Dialog
				open={isPasswordDialogOpen}
				onOpenChange={setIsPasswordDialogOpen}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{t('profile.passwordChange.title')}</DialogTitle>
					</DialogHeader>
					<Formik
						initialValues={{
							oldPassword: '',
							newPassword: '',
							confirmPassword: '',
						}}
						validationSchema={passwordChangeSchema}
						onSubmit={handlePasswordChange}
					>
						{({ values, errors, touched, handleChange, isSubmitting }) => (
							<Form className="space-y-4 pt-4">
								<div className="space-y-4">
									<div className="relative">
										<label
											htmlFor="oldPassword"
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
										>
											{t('profile.passwordChange.oldPassword')} *
										</label>
										<input
											id="oldPassword"
											name="oldPassword"
											type="password"
											value={values.oldPassword}
											onChange={handleChange}
											className={`w-full h-10 px-3 py-2 border ${
												errors.oldPassword && touched.oldPassword
													? 'border-red-500 focus:ring-red-500'
													: 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
											} rounded-md shadow-sm focus:border-primary-500 focus:outline-none dark:bg-gray-700 dark:text-white bg-white`}
										/>
										{errors.oldPassword && touched.oldPassword && (
											<p className="mt-1 text-xs text-red-500">
												{errors.oldPassword}
											</p>
										)}
									</div>

									<div className="relative">
										<label
											htmlFor="newPassword"
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
										>
											{t('profile.passwordChange.newPassword')} *
										</label>
										<input
											id="newPassword"
											name="newPassword"
											type="password"
											value={values.newPassword}
											onChange={handleChange}
											className={`w-full h-10 px-3 py-2 border ${
												errors.newPassword && touched.newPassword
													? 'border-red-500 focus:ring-red-500'
													: 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
											} rounded-md shadow-sm focus:border-primary-500 focus:outline-none dark:bg-gray-700 dark:text-white bg-white`}
										/>
										{errors.newPassword && touched.newPassword && (
											<p className="mt-1 text-xs text-red-500">
												{errors.newPassword}
											</p>
										)}
									</div>

									<div className="relative">
										<label
											htmlFor="confirmPassword"
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
										>
											{t('profile.passwordChange.confirmPassword')} *
										</label>
										<input
											id="confirmPassword"
											name="confirmPassword"
											type="password"
											value={values.confirmPassword}
											onChange={handleChange}
											className={`w-full h-10 px-3 py-2 border ${
												errors.confirmPassword && touched.confirmPassword
													? 'border-red-500 focus:ring-red-500'
													: 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
											} rounded-md shadow-sm focus:border-primary-500 focus:outline-none dark:bg-gray-700 dark:text-white bg-white`}
										/>
										{errors.confirmPassword && touched.confirmPassword && (
											<p className="mt-1 text-xs text-red-500">
												{errors.confirmPassword}
											</p>
										)}
									</div>

									{passwordError && (
										<div className="rounded-md bg-red-50 p-3 text-sm border border-red-200">
											<div className="flex">
												<div className="flex-shrink-0">
													<svg
														className="h-5 w-5 text-red-400"
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 20 20"
														fill="currentColor"
													>
														<path
															fillRule="evenodd"
															d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												<div className="ml-3">
													<p className="text-sm font-medium text-red-800">
														{passwordError}
													</p>
												</div>
											</div>
										</div>
									)}
								</div>

								<div className="flex justify-end space-x-4 pt-4 mt-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setIsPasswordDialogOpen(false);
											setPasswordError(null);
										}}
										className="h-10"
									>
										{t('common.cancel')}
									</Button>
									<Button
										type="submit"
										disabled={isSubmitting || isPasswordUpdating}
										className="h-10"
									>
										{isSubmitting || isPasswordUpdating ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												{t('profile.passwordChange.updating')}
											</>
										) : (
											t('profile.passwordChange.update')
										)}
									</Button>
								</div>
							</Form>
						)}
					</Formik>
				</DialogContent>
			</Dialog>
		</>
	);
}
