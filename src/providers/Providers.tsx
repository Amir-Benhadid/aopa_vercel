'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { I18nProvider } from './I18nProvider';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

interface ProvidersProps {
	children: ReactNode;
}

// Using React.memo to prevent unnecessary re-renders
export const Providers = React.memo(function Providers({
	children,
}: ProvidersProps) {
	return (
		<I18nProvider>
			<QueryProvider>
				<ThemeProvider>
					<AuthProvider>{children}</AuthProvider>
				</ThemeProvider>
			</QueryProvider>
		</I18nProvider>
	);
});
