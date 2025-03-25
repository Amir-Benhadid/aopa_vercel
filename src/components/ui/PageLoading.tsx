'use client';

import { Loading } from '@/components/ui/Loading';
import { useTranslation } from 'react-i18next';

interface PageLoadingProps {
	/**
	 * Optional custom loading message
	 */
	message?: string;

	/**
	 * Optional variant for the loading indicator
	 * @default "spinner"
	 */
	variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';

	/**
	 * Whether to make the loading component fullscreen
	 * @default false
	 */
	fullscreen?: boolean;
}

export function PageLoading({
	message,
	variant = 'spinner',
	fullscreen = false,
}: PageLoadingProps) {
	const { t } = useTranslation();
	const loadingText = message || t('common.loading') || 'Loading...';

	return (
		<div className="h-full w-full flex items-center justify-center py-12">
			<Loading
				size={fullscreen ? 'fullscreen' : 'lg'}
				variant={variant}
				text={loadingText}
				transparent={!fullscreen}
			/>
		</div>
	);
}
