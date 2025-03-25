'use client';

import { PublicRoute } from '@/components/auth/PublicRoute';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import AuthPage from './auth-page';

export default function Page() {
	const searchParams = useSearchParams();
	const { t } = useTranslation();

	useEffect(() => {
		// Check for error messages or success indicators in URL
		const error = searchParams.get('error');
		const verified = searchParams.get('verified');

		if (error) {
			toast.error(decodeURIComponent(error));
		}

		if (verified === 'true') {
			toast.success(t('auth.verificationNeededMessage'));
		}
	}, [searchParams, t]);

	return (
		<PublicRoute>
			<AuthPage />
		</PublicRoute>
	);
}
