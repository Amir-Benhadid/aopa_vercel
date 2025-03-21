'use client';

import { TextField as MuiTextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { forwardRef } from 'react';

const StyledTextField = styled(MuiTextField)(({ theme }) => ({
	'& .MuiOutlinedInput-root': {
		backgroundColor: 'var(--background)',
		'& fieldset': {
			borderColor: 'var(--border)',
		},
		'&:hover fieldset': {
			borderColor: 'var(--primary)',
		},
		'&.Mui-focused fieldset': {
			borderColor: 'var(--primary)',
		},
	},
	'& .MuiInputLabel-root': {
		color: 'var(--foreground)',
		'&.Mui-focused': {
			color: 'var(--primary)',
		},
	},
	'& .MuiOutlinedInput-input': {
		color: 'var(--foreground)',
		height: '2.5rem',
		padding: '0.5rem 1rem',
	},
}));

interface TextFieldProps {
	name: string;
	label: string;
	type?: string;
	error?: boolean;
	helperText?: string;
	value?: string;
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	className?: string;
	required?: boolean;
	fullWidth?: boolean;
	startAdornment?: React.ReactNode;
	endAdornment?: React.ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
	({ startAdornment, endAdornment, ...props }, ref) => {
		return (
			<StyledTextField
				variant="outlined"
				InputProps={{
					startAdornment,
					endAdornment,
				}}
				{...props}
				ref={ref}
			/>
		);
	}
);

TextField.displayName = 'TextField';
