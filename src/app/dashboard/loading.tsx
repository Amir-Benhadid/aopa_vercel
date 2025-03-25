'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTranslation } from 'react-i18next';

export default function DashboardLoading() {
	const { t } = useTranslation();

	return (
		<LoadingSpinner
			message={t('dashboard.loading', 'Loading dashboard...')}
			background="white"
			size="default"
			fullScreen={false}
		/>
	);
}
