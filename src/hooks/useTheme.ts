'use client';

import { useTheme as useNextTheme } from 'next-themes';

export function useTheme() {
	const { theme, setTheme, systemTheme } = useNextTheme();

	return {
		theme: theme === 'system' ? systemTheme : theme,
		setTheme,
		isDark: theme === 'dark' || (theme === 'system' && systemTheme === 'dark'),
	};
}
