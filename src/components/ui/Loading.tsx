'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { HTMLAttributes, useEffect, useState } from 'react';

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
	/**
	 * Size of the loading component
	 * @default "default"
	 */
	size?: 'sm' | 'default' | 'lg' | 'xl' | 'fullscreen';

	/**
	 * Variant of the loading component
	 * @default "spinner"
	 */
	variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';

	/**
	 * Optional text to display below the loading indicator
	 */
	text?: string;

	/**
	 * Whether the loading indicator is transparent (used for overlays)
	 * @default false
	 */
	transparent?: boolean;
}

export function Loading({
	size = 'default',
	variant = 'spinner',
	text,
	transparent = false,
	className,
	...props
}: LoadingProps) {
	const { theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Avoid hydration mismatch with theme
	useEffect(() => {
		setMounted(true);
	}, []);

	const isDark =
		mounted &&
		(theme === 'dark' ||
			(!theme && window.matchMedia('(prefers-color-scheme: dark)').matches));

	// Size mappings
	const sizeClasses = {
		sm: 'h-24 w-24',
		default: 'h-32 w-32',
		lg: 'h-40 w-40',
		xl: 'h-52 w-52',
		fullscreen: 'h-screen w-screen fixed inset-0 z-50',
	};

	// Render spinner variant
	const renderSpinner = () => (
		<div className="relative flex items-center justify-center">
			<motion.div
				className={cn(
					'rounded-full border-t-2 border-b-2',
					isDark
						? 'border-t-blue-500 border-b-transparent'
						: 'border-t-blue-600 border-b-transparent',
					size === 'sm'
						? 'h-6 w-6'
						: size === 'lg'
						? 'h-12 w-12'
						: size === 'xl'
						? 'h-16 w-16'
						: 'h-8 w-8'
				)}
				animate={{ rotate: 360 }}
				transition={{ duration: 1, ease: 'linear', repeat: Infinity }}
			/>
			{size !== 'sm' && (
				<motion.div
					className={cn(
						'absolute rounded-full border-t-2 border-r-2',
						isDark
							? 'border-t-indigo-500 border-r-transparent'
							: 'border-t-indigo-600 border-r-transparent',
						size === 'lg' ? 'h-9 w-9' : size === 'xl' ? 'h-12 w-12' : 'h-6 w-6'
					)}
					animate={{ rotate: -180 }}
					transition={{ duration: 1.5, ease: 'linear', repeat: Infinity }}
				/>
			)}
		</div>
	);

	// Render dots variant
	const renderDots = () => (
		<div className="flex space-x-2">
			{[0, 1, 2].map((i) => (
				<motion.div
					key={i}
					className={cn(
						'rounded-full bg-current',
						isDark ? 'text-blue-500' : 'text-blue-600',
						size === 'sm'
							? 'h-2 w-2'
							: size === 'lg'
							? 'h-4 w-4'
							: size === 'xl'
							? 'h-5 w-5'
							: 'h-3 w-3'
					)}
					initial={{ opacity: 0.4, y: 0 }}
					animate={{ opacity: [0.4, 1, 0.4], y: ['0%', '-50%', '0%'] }}
					transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
				/>
			))}
		</div>
	);

	// Render pulse variant
	const renderPulse = () => (
		<div className="relative">
			<motion.div
				className={cn(
					'rounded-full bg-current absolute',
					isDark ? 'text-blue-500/20' : 'text-blue-600/20',
					size === 'sm'
						? 'h-8 w-8'
						: size === 'lg'
						? 'h-16 w-16'
						: size === 'xl'
						? 'h-20 w-20'
						: 'h-12 w-12'
				)}
				animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.25, 0.5] }}
				transition={{ duration: 2, repeat: Infinity }}
			/>
			<Loader2
				className={cn(
					'animate-spin text-current',
					isDark ? 'text-blue-500' : 'text-blue-600',
					size === 'sm'
						? 'h-8 w-8'
						: size === 'lg'
						? 'h-16 w-16'
						: size === 'xl'
						? 'h-20 w-20'
						: 'h-12 w-12'
				)}
			/>
		</div>
	);

	// Render skeleton variant
	const renderSkeleton = () => (
		<div
			className={cn(
				'flex flex-col items-center space-y-4',
				size === 'sm'
					? 'w-16'
					: size === 'lg'
					? 'w-52'
					: size === 'xl'
					? 'w-64'
					: 'w-32'
			)}
		>
			<motion.div
				className={cn(
					'w-full h-2 rounded-full',
					isDark ? 'bg-gray-700' : 'bg-gray-200'
				)}
				animate={{ opacity: [0.5, 1, 0.5] }}
				transition={{ duration: 1.5, repeat: Infinity }}
			/>
			<motion.div
				className={cn(
					'w-3/4 h-2 rounded-full',
					isDark ? 'bg-gray-700' : 'bg-gray-200'
				)}
				animate={{ opacity: [0.7, 1, 0.7] }}
				transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
			/>
			<motion.div
				className={cn(
					'w-1/2 h-2 rounded-full',
					isDark ? 'bg-gray-700' : 'bg-gray-200'
				)}
				animate={{ opacity: [0.9, 1, 0.9] }}
				transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
			/>
		</div>
	);

	let loadingContent;
	switch (variant) {
		case 'dots':
			loadingContent = renderDots();
			break;
		case 'pulse':
			loadingContent = renderPulse();
			break;
		case 'skeleton':
			loadingContent = renderSkeleton();
			break;
		default:
			loadingContent = renderSpinner();
	}

	return (
		<div
			className={cn(
				'flex flex-col items-center justify-center',
				sizeClasses[size],
				transparent
					? 'bg-transparent'
					: size === 'fullscreen'
					? isDark
						? 'bg-gray-900/90'
						: 'bg-white/90'
					: '',
				className
			)}
			{...props}
		>
			{loadingContent}

			{text && (
				<motion.p
					className={cn(
						'mt-4 text-center font-medium',
						isDark ? 'text-gray-300' : 'text-gray-700',
						size === 'sm'
							? 'text-xs'
							: size === 'lg'
							? 'text-lg'
							: size === 'xl'
							? 'text-xl'
							: 'text-sm'
					)}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					{text}
				</motion.p>
			)}
		</div>
	);
}
