'use client';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Camera, Loader2, Save, User } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export default function ProfilePage() {
	const { t } = useTranslation();
	const { user, isAuthenticated } = useAuth();
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		name: '',
		surname: '',
		email: '',
		bio: '',
		title: '',
		organization: '',
		phone: '',
		website: '',
	});

	// Load user data
	useEffect(() => {
		if (!isAuthenticated || !user) return;

		// Set form data from user
		setFormData({
			name: user.name || '',
			surname: user.surname || '',
			email: user.email || '',
			bio: '',
			title: '',
			organization: '',
			phone: '',
			website: '',
		});

		// Fetch additional user data from Supabase
		const fetchUserData = async () => {
			try {
				const { data, error } = await supabase
					.from('accounts')
					.select('*')
					.eq('id', user.id)
					.single();

				if (error && error.code !== 'PGRST116') throw error;

				if (data) {
					setFormData((prev) => ({
						...prev,
						bio: data.bio || '',
						title: data.title || '',
						organization: data.organization || '',
						phone: data.phone || '',
						website: data.website || '',
					}));

					setAvatarUrl(data.avatar_url || null);
				}
			} catch (error) {
				console.error('Error fetching user data:', error);
				toast.error('Failed to load profile data');
			}
		};

		fetchUserData();
	}, [isAuthenticated, user]);

	// Handle form input changes
	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// Handle avatar upload
	const handleAvatarUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file || !user) return;

		setUploading(true);

		try {
			// Create a unique file path
			const fileExt = file.name.split('.').pop();
			const fileName = `avatars/${user.id}/${Math.random()
				.toString(36)
				.substring(2)}.${fileExt}`;

			// Upload the file to Supabase storage
			const { error: uploadError } = await supabase.storage
				.from('public')
				.upload(fileName, file, { upsert: true });

			if (uploadError) throw uploadError;

			// Get the public URL
			const { data: publicUrlData } = supabase.storage
				.from('public')
				.getPublicUrl(fileName);

			// Update the user's avatar URL
			const { error: updateError } = await supabase
				.from('accounts')
				.update({ avatar_url: publicUrlData.publicUrl })
				.eq('id', user.id);

			if (updateError) throw updateError;

			setAvatarUrl(publicUrlData.publicUrl);
			toast.success('Avatar uploaded successfully');
		} catch (error: any) {
			console.error('Error uploading avatar:', error);
			toast.error(error.message || 'Error uploading avatar');
		} finally {
			setUploading(false);
		}
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		setLoading(true);

		try {
			// Update user metadata in Supabase Auth
			const { error: authError } = await supabase.auth.updateUser({
				data: {
					name: formData.name,
					surname: formData.surname,
				},
			});

			if (authError) throw authError;

			// Check if user exists in accounts table
			const { data: existingAccount, error: checkError } = await supabase
				.from('accounts')
				.select('id')
				.eq('id', user.id)
				.single();

			if (checkError && checkError.code !== 'PGRST116') {
				throw checkError;
			}

			// Update or insert account data
			const accountData = {
				id: user.id,
				name: formData.name,
				surname: formData.surname,
				bio: formData.bio,
				title: formData.title,
				organization: formData.organization,
				phone: formData.phone,
				website: formData.website,
				avatar_url: avatarUrl,
			};

			if (existingAccount) {
				// Update existing account
				const { error: updateError } = await supabase
					.from('accounts')
					.update(accountData)
					.eq('id', user.id);

				if (updateError) throw updateError;
			} else {
				// Insert new account
				const { error: insertError } = await supabase
					.from('accounts')
					.insert(accountData);

				if (insertError) throw insertError;
			}

			toast.success('Profile updated successfully');
		} catch (error: any) {
			console.error('Error updating profile:', error);
			toast.error(error.message || 'Error updating profile');
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div className="mb-8">
				<h1 className="text-2xl font-bold">
					{t('dashboard.profile.title') || 'Profile Settings'}
				</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">
					{t('dashboard.profile.description') ||
						'Manage your personal information and preferences'}
				</p>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
				<div className="p-6 sm:p-8">
					<form onSubmit={handleSubmit} className="space-y-8">
						{/* Avatar Upload */}
						<div className="flex flex-col sm:flex-row items-center gap-6">
							<div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
								{avatarUrl ? (
									<Image
										src={avatarUrl}
										alt="Avatar"
										fill
										className="object-cover"
										priority
									/>
								) : (
									<div className="flex items-center justify-center h-full">
										<User className="h-12 w-12 text-gray-400" />
									</div>
								)}

								{uploading && (
									<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
										<Loader2 className="h-8 w-8 animate-spin text-white" />
									</div>
								)}

								<label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
									<input
										type="file"
										accept="image/*"
										className="hidden"
										onChange={handleAvatarUpload}
										disabled={uploading}
									/>
									<Camera className="h-4 w-4 text-white" />
								</label>
							</div>

							<div>
								<h3 className="font-medium text-lg">
									{formData.name} {formData.surname}
								</h3>
								<p className="text-gray-500 dark:text-gray-400 text-sm">
									{formData.email}
								</p>
								<p className="text-sm mt-2">
									Upload a profile picture to personalize your account
								</p>
							</div>
						</div>

						{/* Personal Information */}
						<div>
							<h3 className="text-lg font-medium mb-4">Personal Information</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label
										htmlFor="name"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										First Name
									</label>
									<input
										type="text"
										id="name"
										name="name"
										value={formData.name}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
									/>
								</div>

								<div>
									<label
										htmlFor="surname"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Last Name
									</label>
									<input
										type="text"
										id="surname"
										name="surname"
										value={formData.surname}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
									/>
								</div>

								<div>
									<label
										htmlFor="email"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Email Address
									</label>
									<input
										type="email"
										id="email"
										name="email"
										value={formData.email}
										disabled
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
									/>
									<p className="mt-1 text-xs text-gray-500">
										Email cannot be changed
									</p>
								</div>

								<div>
									<label
										htmlFor="title"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Title / Position
									</label>
									<input
										type="text"
										id="title"
										name="title"
										value={formData.title}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
										placeholder="e.g. Professor, Doctor, Researcher"
									/>
								</div>

								<div>
									<label
										htmlFor="organization"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Organization / Institution
									</label>
									<input
										type="text"
										id="organization"
										name="organization"
										value={formData.organization}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
										placeholder="e.g. University, Hospital, Research Center"
									/>
								</div>

								<div>
									<label
										htmlFor="phone"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Phone Number
									</label>
									<input
										type="tel"
										id="phone"
										name="phone"
										value={formData.phone}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
										placeholder="e.g. +1 (555) 123-4567"
									/>
								</div>

								<div>
									<label
										htmlFor="website"
										className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Website
									</label>
									<input
										type="url"
										id="website"
										name="website"
										value={formData.website}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
										placeholder="e.g. https://example.com"
									/>
								</div>
							</div>
						</div>

						{/* Bio */}
						<div>
							<label
								htmlFor="bio"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
							>
								Bio
							</label>
							<textarea
								id="bio"
								name="bio"
								value={formData.bio}
								onChange={handleInputChange}
								rows={4}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
								placeholder="Tell us about yourself, your research interests, and expertise"
							/>
						</div>

						{/* Submit Button */}
						<div className="flex justify-end">
							<button
								type="submit"
								disabled={loading}
								className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
							>
								{loading ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
										Saving...
									</>
								) : (
									<>
										<Save className="h-4 w-4 mr-2" />
										Save Changes
									</>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}
