import { createTheme } from '@mui/material/styles';

// Define the color palette
export const colors = {
	primary: {
		main: '#1976d2',
		light: '#42a5f5',
		dark: '#1565c0',
		contrastText: '#ffffff',
	},
	secondary: {
		main: '#9c27b0',
		light: '#ba68c8',
		dark: '#7b1fa2',
		contrastText: '#ffffff',
	},
	success: {
		main: '#2e7d32',
		light: '#4caf50',
		dark: '#1b5e20',
		contrastText: '#ffffff',
	},
	error: {
		main: '#d32f2f',
		light: '#ef5350',
		dark: '#c62828',
		contrastText: '#ffffff',
	},
	warning: {
		main: '#ed6c02',
		light: '#ff9800',
		dark: '#e65100',
		contrastText: '#ffffff',
	},
	info: {
		main: '#0288d1',
		light: '#03a9f4',
		dark: '#01579b',
		contrastText: '#ffffff',
	},
	text: {
		primary: 'rgba(0, 0, 0, 0.87)',
		secondary: 'rgba(0, 0, 0, 0.6)',
		disabled: 'rgba(0, 0, 0, 0.38)',
	},
	background: {
		default: '#f5f5f5',
		paper: '#ffffff',
	},
	divider: 'rgba(0, 0, 0, 0.12)',
};

// Create the light theme
export const lightTheme = createTheme({
	palette: {
		mode: 'light',
		primary: colors.primary,
		secondary: colors.secondary,
		success: colors.success,
		error: colors.error,
		warning: colors.warning,
		info: colors.info,
		text: colors.text,
		background: colors.background,
		divider: colors.divider,
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
		h1: {
			fontSize: '2.5rem',
			fontWeight: 700,
			lineHeight: 1.2,
		},
		h2: {
			fontSize: '2rem',
			fontWeight: 700,
			lineHeight: 1.2,
		},
		h3: {
			fontSize: '1.75rem',
			fontWeight: 600,
			lineHeight: 1.2,
		},
		h4: {
			fontSize: '1.5rem',
			fontWeight: 600,
			lineHeight: 1.2,
		},
		h5: {
			fontSize: '1.25rem',
			fontWeight: 600,
			lineHeight: 1.2,
		},
		h6: {
			fontSize: '1rem',
			fontWeight: 600,
			lineHeight: 1.2,
		},
		body1: {
			fontSize: '1rem',
			lineHeight: 1.5,
		},
		body2: {
			fontSize: '0.875rem',
			lineHeight: 1.5,
		},
		button: {
			textTransform: 'none',
			fontWeight: 500,
		},
	},
	shape: {
		borderRadius: 8,
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					fontWeight: 500,
					borderRadius: 8,
					padding: '8px 16px',
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
				},
			},
		},
	},
});

// Create the dark theme
export const darkTheme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#90caf9',
			light: '#e3f2fd',
			dark: '#42a5f5',
			contrastText: 'rgba(0, 0, 0, 0.87)',
		},
		secondary: {
			main: '#ce93d8',
			light: '#f3e5f5',
			dark: '#ab47bc',
			contrastText: 'rgba(0, 0, 0, 0.87)',
		},
		success: {
			main: '#66bb6a',
			light: '#e8f5e9',
			dark: '#388e3c',
			contrastText: 'rgba(0, 0, 0, 0.87)',
		},
		error: {
			main: '#f44336',
			light: '#ffebee',
			dark: '#d32f2f',
			contrastText: '#ffffff',
		},
		warning: {
			main: '#ffa726',
			light: '#fff3e0',
			dark: '#f57c00',
			contrastText: 'rgba(0, 0, 0, 0.87)',
		},
		info: {
			main: '#29b6f6',
			light: '#e1f5fe',
			dark: '#0288d1',
			contrastText: 'rgba(0, 0, 0, 0.87)',
		},
		text: {
			primary: '#ffffff',
			secondary: 'rgba(255, 255, 255, 0.7)',
			disabled: 'rgba(255, 255, 255, 0.5)',
		},
		background: {
			default: '#121212',
			paper: '#1e1e1e',
		},
		divider: 'rgba(255, 255, 255, 0.12)',
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					fontWeight: 500,
					borderRadius: 8,
					padding: '8px 16px',
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
				},
			},
		},
	},
});
