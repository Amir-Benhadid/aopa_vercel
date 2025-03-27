'use client';

import { useTheme as useNextTheme } from 'next-themes';

export function useTheme() {
	const { setTheme } = useNextTheme();

	// Always return light theme and isDark as false, regardless of actual theme
	return {
		theme: 'light',
		setTheme,
		isDark: false,
	};
}
