'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTranslation } from 'react-i18next';

interface PageLoadingProps {
	/**
	 * Optional custom loading message
	 */
	message?: string;

	/**
	 * Whether to make the loading component fullscreen
	 * @default false
	 */
	fullscreen?: boolean;

	/**
	 * Background style for the loading spinner
	 * @default "white"
	 */
	background?: 'gradient' | 'transparent' | 'white';

	/**
	 * Size of the loading spinner
	 * @default "default"
	 */
	size?: 'small' | 'default' | 'large';
}

export function PageLoading({
	message,
	fullscreen = false,
	background = 'white',
	size = 'default',
}: PageLoadingProps) {
	const { t } = useTranslation();
	const loadingText = message || t('common.loading') || 'Loading...';

	return (
		<LoadingSpinner
			message={loadingText}
			background={background}
			size={size}
			fullScreen={fullscreen}
		/>
	);
}
