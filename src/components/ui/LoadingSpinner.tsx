'use client';

import { useTranslation } from 'react-i18next';

interface LoadingSpinnerProps {
	/**
	 * Optional message to display below the spinner
	 */
	message?: string;

	/**
	 * Optional background style
	 * @default "gradient" - a blue gradient background
	 */
	background?: 'gradient' | 'transparent' | 'white';

	/**
	 * Optional size of the spinner
	 * @default "default" - a medium-sized spinner
	 */
	size?: 'small' | 'default' | 'large';

	/**
	 * Optional color for the spinner
	 * @default "primary" - the primary color of the app
	 */
	color?: 'primary' | 'gray' | 'white';

	/**
	 * Whether the spinner should be full screen
	 * @default false
	 */
	fullScreen?: boolean;
}

export function LoadingSpinner({
	message,
	background = 'transparent',
	size = 'default',
	color = 'primary',
	fullScreen = false,
}: LoadingSpinnerProps) {
	const { t } = useTranslation();

	// Set spinner sizes
	const spinnerSizeClasses = {
		small: 'h-8 w-8 border-t-2 border-b-2',
		default: 'h-16 w-16 border-t-4 border-b-4',
		large: 'h-20 w-20 border-t-4 border-b-4',
	};

	// Text sizes
	const textSizeClasses = {
		small: 'text-sm',
		default: 'text-base',
		large: 'text-lg',
	};

	// Container sizes
	const containerClasses = fullScreen ? 'min-h-screen' : 'min-h-[300px]';

	// Background styles
	const backgroundClasses = {
		gradient: 'bg-transparent',
		transparent: 'bg-transparent',
		white: 'bg-transparent',
	};

	// Spinner colors
	const spinnerColorClasses = {
		primary: 'border-primary-600 dark:border-primary-500',
		gray: 'border-gray-600 dark:border-gray-400',
		white: 'border-white dark:border-white',
	};

	// Text colors
	const textColorClasses = {
		primary: 'text-primary-700 dark:text-primary-400',
		gray: 'text-gray-700 dark:text-gray-400',
		white: 'text-white dark:text-white',
	};

	const displayMessage = message || t('common.loading', 'Loading...');

	return (
		<div
			className={`flex items-center justify-center ${containerClasses} ${backgroundClasses[background]}`}
		>
			<div className="flex flex-col items-center">
				<div
					className={`animate-spin rounded-full ${spinnerSizeClasses[size]} border-b-transparent ${spinnerColorClasses[color]}`}
				></div>
				<p
					className={`mt-4 font-medium ${textSizeClasses[size]} ${textColorClasses[color]}`}
				>
					{t('common.loading', 'Loading...')}
				</p>
			</div>
		</div>
	);
}
