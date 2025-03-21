'use client';

import i18n from '@/lib/i18n';
import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';

interface I18nProviderProps {
	children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
	const [isI18nInitialized, setIsI18nInitialized] = useState(
		i18n.isInitialized
	);

	useEffect(() => {
		// Initialize i18n on the client side only if not already initialized
		if (!i18n.isInitialized) {
			const initI18n = async () => {
				await i18n.init();
				setIsI18nInitialized(true);
			};

			initI18n();
		}
	}, []);

	// Render children immediately without waiting for i18n to initialize
	// This improves initial render performance
	return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
