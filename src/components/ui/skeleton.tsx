import { cn } from '@/lib/utils';

export function Skeleton({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn('animate-pulse bg-gray-200 dark:bg-gray-700', className)}
			{...props}
		/>
	);
}
