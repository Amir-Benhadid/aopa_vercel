'use client';

import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	className?: string;
	variant?:
		| 'default'
		| 'destructive'
		| 'outline'
		| 'secondary'
		| 'ghost'
		| 'link';
	size?: 'default' | 'sm' | 'lg' | 'icon';
	fullWidth?: boolean;
	translationKey?: string;
	translationValues?: Record<string, any>;
	loading?: boolean;
	icon?: React.ReactNode;
	iconPosition?: 'left' | 'right';
	asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant = 'default',
			size = 'default',
			fullWidth = false,
			translationKey,
			translationValues,
			children,
			loading = false,
			icon,
			iconPosition = 'left',
			asChild = false,
			disabled,
			...props
		},
		ref
	) => {
		const { t } = useTranslation();

		const Comp = asChild ? Slot : 'button';

		const buttonText = translationKey
			? t(translationKey, translationValues)
			: children;

		const variantStyles = {
			default: 'bg-primary-600 text-white hover:bg-primary-700',
			destructive: 'bg-red-500 text-white hover:bg-red-600',
			outline:
				'border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800',
			secondary:
				'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
			ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
			link: 'bg-transparent text-primary-600 hover:underline dark:text-primary-400',
		};

		const sizeStyles = {
			default: 'h-10 px-4 py-2',
			sm: 'h-8 px-3 text-sm',
			lg: 'h-12 px-6 text-lg',
			icon: 'h-10 w-10',
		};

		// If asChild is true, we need to handle the children differently
		if (asChild) {
			// When asChild is true, we expect children to be a single React element
			const child = React.Children.only(children) as React.ReactElement;

			// Clone the child element and pass our props to it
			return (
				<Comp
					ref={ref}
					className={cn(
						'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50',
						variantStyles[variant],
						sizeStyles[size],
						fullWidth && 'w-full',
						className
					)}
					disabled={loading || disabled}
					{...props}
				>
					{React.cloneElement(child, {
						className: cn(
							'flex items-center justify-center',
							child.props.className
						),
					})}
				</Comp>
			);
		}

		// For regular buttons (not asChild)
		return (
			<Comp
				ref={ref}
				className={cn(
					'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50',
					variantStyles[variant],
					sizeStyles[size],
					fullWidth && 'w-full',
					className
				)}
				disabled={loading || disabled}
				{...props}
			>
				{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				{icon && iconPosition === 'left' && !loading && (
					<span className="mr-2">{icon}</span>
				)}
				{buttonText}
				{icon && iconPosition === 'right' && (
					<span className="ml-2">{icon}</span>
				)}
			</Comp>
		);
	}
);

Button.displayName = 'Button';
