'use client';

import { PublicRoute } from '@/components/auth/PublicRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import AuthPage from './auth-page';

// Create a client-side only component that uses useSearchParams
function AuthPageWithParams() {
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

	return <AuthPage />;
}

export default function Page() {
	return (
		<PublicRoute>
			<Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
				<AuthPageWithParams />
			</Suspense>
		</PublicRoute>
	);
}
