'use client';

import { ProfileForm } from '@/components/profile/ProfileForm';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

function ProfileContent() {
	const { user, isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [profile, setProfile] = useState<any>(null);
	const { t } = useTranslation();

	useEffect(() => {
		// Only fetch profile if user is authenticated
		if (isLoading) return;

		if (!isAuthenticated || !user) {
			setLoading(false);
			return;
		}

		const fetchProfile = async () => {
			try {
				setLoading(true);

				// Fetch account data
				const { data: accountData, error: accountError } = await supabase
					.from('accounts')
					.select('*')
					.eq('user_id', user.id)
					.single();

				if (accountError && accountError.code !== 'PGRST116') {
					console.error('Error fetching account:', accountError);
					setLoading(false);
					return;
				}

				let professionalData = null;

				// If account exists, fetch professional info
				if (accountData) {
					const { data: profData, error: profError } = await supabase
						.from('professional_infos')
						.select('*')
						.eq('account_id', accountData.id)
						.single();

					if (profError && profError.code !== 'PGRST116') {
						console.error('Error fetching professional info:', profError);
					} else {
						professionalData = profData;
					}
				}

				// Combine the data
				const combinedData = {
					...accountData,
					profession: professionalData?.profession || '',
					professional_status: professionalData?.status || '',
				};

				setProfile(combinedData);
			} catch (error) {
				console.error('Error:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [user, isAuthenticated, isLoading]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary-500" />
			</div>
		);
	}

	return (
		<div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
			<div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
				<div className="px-6 py-8">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
						{profile ? t('profile.editProfile') : t('profile.completeProfile')}
					</h1>

					<ProfileForm initialData={profile} />
				</div>
			</div>
		</div>
	);
}

export default function ProfilePage() {
	return <ProfileContent />;
}
