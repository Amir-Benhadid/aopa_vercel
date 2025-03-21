'use client';

import { darkTheme, lightTheme } from '@/styles/theme';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as NextThemeProvider, useTheme } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';

// Create a wrapper component that uses the useTheme hook
function ThemeWrapper({ children }: { children: ReactNode }) {
	const { theme } = useTheme();
	const [currentTheme, setCurrentTheme] = useState(lightTheme);

	// Update MUI theme when Next.js theme changes
	useEffect(() => {
		if (theme) {
			setCurrentTheme(theme === 'dark' ? darkTheme : lightTheme);
		}
	}, [theme]);

	return (
		<MuiThemeProvider theme={currentTheme}>
			<CssBaseline />
			{children}
		</MuiThemeProvider>
	);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [mounted, setMounted] = useState(false);

	// After mounting, we have access to the theme
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		// Prevent theme flash on initial load
		return <>{children}</>;
	}

	return (
		<NextThemeProvider
			attribute="data-theme"
			defaultTheme="system"
			enableSystem
		>
			<ThemeWrapper>{children}</ThemeWrapper>
		</NextThemeProvider>
	);
}
