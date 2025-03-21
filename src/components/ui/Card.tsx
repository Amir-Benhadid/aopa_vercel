'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	variant?: 'default' | 'outline' | 'elevated' | 'filled';
	padding?: 'none' | 'sm' | 'md' | 'lg';
	hover?: boolean;
	clickable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
	(
		{
			className,
			children,
			variant = 'default',
			padding = 'md',
			hover = false,
			clickable = false,
			...props
		},
		ref
	) => {
		const variantClasses = {
			default:
				'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
			outline: 'border border-gray-200 dark:border-gray-700 bg-transparent',
			elevated: 'bg-white dark:bg-gray-800 shadow-md border-none',
			filled: 'bg-gray-100 dark:bg-gray-700 border-none',
		};

		const paddingClasses = {
			none: 'p-0',
			sm: 'p-3',
			md: 'p-5',
			lg: 'p-7',
		};

		return (
			<div
				ref={ref}
				className={cn(
					'rounded-lg',
					variantClasses[variant],
					paddingClasses[padding],
					hover && 'transition-all duration-200 hover:shadow-md',
					clickable && 'cursor-pointer',
					className
				)}
				{...props}
			>
				{children}
			</div>
		);
	}
);
Card.displayName = 'Card';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	title?: string;
	titleKey?: string;
	subtitle?: string;
	subtitleKey?: string;
	action?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
	(
		{
			className,
			children,
			title,
			titleKey,
			subtitle,
			subtitleKey,
			action,
			...props
		},
		ref
	) => {
		const { t } = useTranslation();

		const displayTitle = titleKey ? t(titleKey) : title;
		const displaySubtitle = subtitleKey ? t(subtitleKey) : subtitle;

		return (
			<div
				ref={ref}
				className={cn('flex flex-col space-y-1.5 p-6', className)}
				{...props}
			>
				{displayTitle || displaySubtitle || action ? (
					<div className="flex items-start justify-between">
						<div>
							{displayTitle && (
								<h3 className="text-lg font-semibold leading-none tracking-tight">
									{displayTitle}
								</h3>
							)}
							{displaySubtitle && (
								<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
									{displaySubtitle}
								</p>
							)}
						</div>
						{action && <div>{action}</div>}
					</div>
				) : null}
				{children}
			</div>
		);
	}
);
CardHeader.displayName = 'CardHeader';

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
	({ className, children, ...props }, ref) => {
		return (
			<div ref={ref} className={cn('p-6 pt-0', className)} {...props}>
				{children}
			</div>
		);
	}
);
CardContent.displayName = 'CardContent';

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
	({ className, children, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn('flex items-center p-6 pt-0', className)}
				{...props}
			>
				{children}
			</div>
		);
	}
);
CardFooter.displayName = 'CardFooter';
