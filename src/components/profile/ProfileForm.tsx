'use client';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Form, Formik } from 'formik';
import { Camera, Loader2, Upload } from 'lucide-react';
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

export function ProfileForm({
	initialData,
	onComplete,
	isModal = false,
}: ProfileFormProps) {
	const { user } = useAuth();
	const router = useRouter();
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const { t } = useTranslation();

	// Define translated options within component scope
	const SPECIALTIES = [
		t('profile.specialties.ophthalmology'),
		t('profile.specialties.retina'),
		t('profile.specialties.glaucoma'),
		t('profile.specialties.cornea'),
		t('profile.specialties.pediatric'),
		t('profile.specialties.oculoplastics'),
		t('profile.specialties.neuro'),
		t('profile.specialties.other'),
	];

	const STATUSES = [
		t('profile.statuses.practicing'),
		t('profile.statuses.resident'),
		t('profile.statuses.fellow'),
		t('profile.statuses.professor'),
		t('profile.statuses.retired'),
		t('profile.statuses.student'),
	];

	const GENDERS = [
		t('profile.genders.male'),
		t('profile.genders.female'),
		t('profile.genders.other'),
	];

	// Create validation schema with translations
	const profileSchema = Yup.object().shape({
		name: Yup.string().required(t('profile.validation.nameRequired')),
		surname: Yup.string().required(t('profile.validation.surnameRequired')),
		gender: Yup.string().required(t('profile.validation.genderRequired')),
		status: Yup.string().required(t('profile.validation.statusRequired')),
		phone: Yup.string(),
		profession: Yup.string().required(
			t('profile.validation.professionRequired')
		),
		professional_status: Yup.string().required(
			t('profile.validation.professionalStatusRequired')
		),
	});

	useEffect(() => {
		if (initialData?.profile_picture) {
			setAvatarUrl(initialData.profile_picture);
		}
	}, [initialData]);

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
			const filePath = `${user?.id}/avatar.${fileExt}`;

			// Upload the file to Supabase storage
			const { error: uploadError } = await supabase.storage
				.from('avatars')
				.upload(filePath, file, { upsert: true });

			if (uploadError) {
				throw uploadError;
			}

			// Get the public URL
			const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

			setAvatarUrl(data.publicUrl);
			toast.success(t('profile.success.avatarUploaded'));
		} catch (error: any) {
			toast.error(error.message || t('profile.errors.uploadFailed'));
		} finally {
			setUploading(false);
		}
	};

	const handleSubmit = async (values: any, { setSubmitting }: any) => {
		try {
			if (!user) throw new Error('No user');

			console.log('Starting profile update with data:', values);
			console.log(
				'isModal:',
				isModal,
				'onComplete callback present:',
				!!onComplete
			);

			// First, check if account exists
			const { data: existingAccount, error: accountCheckError } = await supabase
				.from('accounts')
				.select('id')
				.eq('user_id', user.id)
				.single();

			if (accountCheckError && accountCheckError.code !== 'PGRST116') {
				throw accountCheckError;
			}

			// Prepare the account data
			const accountData = {
				user_id: user.id,
				name: values.name,
				surname: values.surname,
				profile_picture: avatarUrl,
				phone: values.phone || null,
				gender: values.gender,
				status: values.status,
				updated_at: new Date(),
			};

			let accountId;

			// Insert or update account
			if (!existingAccount) {
				console.log('Creating new account record');
				const { data: newAccount, error: insertError } = await supabase
					.from('accounts')
					.insert([accountData])
					.select('id')
					.single();

				if (insertError) throw insertError;
				accountId = newAccount.id;
			} else {
				console.log('Updating existing account record');
				const { error: updateError } = await supabase
					.from('accounts')
					.update(accountData)
					.eq('user_id', user.id);

				if (updateError) throw updateError;
				accountId = existingAccount.id;
			}

			// Handle professional info
			const professionalData = {
				account_id: accountId,
				profession: values.profession,
				status: values.professional_status,
			};

			// Check if professional info exists
			const { data: existingProfInfo, error: profCheckError } = await supabase
				.from('professional_infos')
				.select('id')
				.eq('account_id', accountId)
				.single();

			if (profCheckError && profCheckError.code !== 'PGRST116') {
				throw profCheckError;
			}

			// Insert or update professional info
			if (!existingProfInfo) {
				console.log('Creating new professional info record');
				const { error: insertProfError } = await supabase
					.from('professional_infos')
					.insert([professionalData]);

				if (insertProfError) throw insertProfError;
			} else {
				console.log('Updating existing professional info record');
				const { error: updateProfError } = await supabase
					.from('professional_infos')
					.update(professionalData)
					.eq('account_id', accountId);

				if (updateProfError) throw updateProfError;
			}

			// First update user metadata with only the profile attributes that go in metadata
			console.log('Updating user metadata in Auth');
			const { error: updateMetadataError } = await supabase.auth.updateUser({
				data: {
					name: values.name,
					surname: values.surname,
					avatar_url: avatarUrl,
				},
			});

			if (updateMetadataError) {
				console.error('Failed to update user metadata:', updateMetadataError);
				throw updateMetadataError;
			}

			// Then, refresh the session to ensure changes are propagated
			console.log('Refreshing session after metadata update');
			const { error: refreshError } = await supabase.auth.refreshSession();

			if (refreshError) {
				console.error(
					'Failed to refresh session after profile update:',
					refreshError
				);
				// Continue anyway since the database updates were successful
			}

			console.log('Profile updated successfully');
			toast.success(t('profile.success.profileUpdated'));

			// Wait a moment before handling completion
			setTimeout(() => {
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

	return (
		<Formik
			initialValues={{
				name: initialData?.name || '',
				surname: initialData?.surname || '',
				gender: initialData?.gender || '',
				status: initialData?.status || '',
				phone: initialData?.phone || '',
				profession: initialData?.profession || '',
				professional_status: initialData?.professional_status || '',
			}}
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
									fill
									className="rounded-full object-cover border-2 border-primary-100 dark:border-primary-900"
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

					<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
						{/* Basic Information */}
						<div>
							<TextField
								name="name"
								label={t('profile.form.firstName')}
								value={values.name}
								onChange={handleChange}
								error={!!(errors.name && touched.name)}
								helperText={touched.name ? String(errors.name) : ''}
								fullWidth
								required
							/>
						</div>

						<div>
							<TextField
								name="surname"
								label={t('profile.form.lastName')}
								value={values.surname}
								onChange={handleChange}
								error={!!(errors.surname && touched.surname)}
								helperText={touched.surname ? String(errors.surname) : ''}
								fullWidth
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								{t('profile.form.gender')} *
							</label>
							<select
								name="gender"
								value={values.gender}
								onChange={handleChange}
								className={`w-full px-3 py-2.5 border ${
									errors.gender && touched.gender
										? 'border-red-500'
										: 'border-gray-300 dark:border-gray-600'
								} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white bg-white`}
							>
								<option value="">{t('profile.form.selectGender')}</option>
								{GENDERS.map((gender) => (
									<option key={gender} value={gender}>
										{t(
											`profile.form.genders.${gender}`,
											gender.charAt(0).toUpperCase() + gender.slice(1)
										)}
									</option>
								))}
							</select>
							{errors.gender && touched.gender && (
								<p className="mt-1 text-xs text-red-500">
									{errors.gender as string}
								</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								{t('profile.form.status')} *
							</label>
							<select
								name="status"
								value={values.status}
								onChange={handleChange}
								className={`w-full px-3 py-2.5 border ${
									errors.status && touched.status
										? 'border-red-500'
										: 'border-gray-300 dark:border-gray-600'
								} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white bg-white`}
							>
								<option value="">{t('profile.form.selectStatus')}</option>
								{STATUSES.map((status) => (
									<option key={status} value={status}>
										{t(`profile.form.statuses.${status.toLowerCase()}`, status)}
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
							<TextField
								name="phone"
								label={t('profile.form.phone')}
								value={values.phone}
								onChange={handleChange}
								error={!!(errors.phone && touched.phone)}
								helperText={touched.phone ? String(errors.phone) : ''}
								fullWidth
							/>
						</div>

						<div>
							<TextField
								name="profession"
								label={t('profile.form.profession')}
								value={values.profession}
								onChange={handleChange}
								error={!!(errors.profession && touched.profession)}
								helperText={
									touched.profession ? (errors.profession as string) : ''
								}
								fullWidth
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								{t('profile.form.professionalStatus')} *
							</label>
							<select
								name="professional_status"
								value={values.professional_status}
								onChange={handleChange}
								className={`w-full px-3 py-2.5 border ${
									errors.professional_status && touched.professional_status
										? 'border-red-500'
										: 'border-gray-300 dark:border-gray-600'
								} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white bg-white`}
							>
								<option value="">{t('profile.form.selectStatus')}</option>
								{SPECIALTIES.map((specialty) => (
									<option key={specialty} value={specialty}>
										{t(
											`profile.form.specialties.${specialty
												.toLowerCase()
												.replace(/-/g, '_')
												.replace(/ /g, '_')}`,
											specialty
										)}
									</option>
								))}
							</select>
							{errors.professional_status && touched.professional_status && (
								<p className="mt-1 text-xs text-red-500">
									{errors.professional_status as string}
								</p>
							)}
						</div>
					</div>

					<div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 dark:border-gray-700 mt-8">
						{!isModal && (
							<Button
								type="button"
								variant="outline"
								onClick={() => router.back()}
							>
								{t('common.cancel')}
							</Button>
						)}

						<Button
							type="submit"
							disabled={isSubmitting || uploading}
							className="px-6"
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
	);
}
