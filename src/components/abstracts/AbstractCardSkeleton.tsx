import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';

export function AbstractCardSkeleton() {
	return (
		<motion.div
			layout
			className="h-full"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		>
			<Card className="group overflow-hidden rounded-xl bg-white dark:bg-gray-800 relative border border-gray-200 dark:border-gray-700 h-full flex flex-col">
				{/* Status Bar with filling effect on hover */}
				<div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
				</div>

				<div className="p-6 flex flex-col flex-1 space-y-4">
					{/* Header Skeleton */}
					<div className="flex items-start justify-between mb-4">
						<div className="flex-1">
							<div className="flex items-center justify-between">
								<div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-3/4" />
								<div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
							</div>

							<div className="flex gap-2 mt-2">
								<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-24" />
								<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-20" />
							</div>
						</div>
					</div>

					{/* Content Skeleton */}
					<div className="space-y-4 flex-1">
						<div className="flex items-start">
							<div className="w-4 h-4 mr-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
							<div className="flex-1">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16 mb-1" />
								<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
							</div>
						</div>

						<div className="flex items-start">
							<div className="w-4 h-4 mr-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
							<div className="flex-1">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16 mb-1" />
								<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-40" />
							</div>
						</div>

						<div className="flex items-start">
							<div className="w-4 h-4 mr-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
							<div className="flex-1">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16 mb-1" />
								<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-28" />
							</div>
						</div>

						<div className="mt-3 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full mb-2" />
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6 mt-2" />
						</div>
					</div>

					{/* Action Buttons Skeleton - Only show sometimes to match real component */}
					{Math.random() > 0.5 && (
						<div className="mt-5 flex flex-col sm:flex-row gap-2">
							<div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-full" />
							{Math.random() > 0.5 && (
								<div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-full" />
							)}
						</div>
					)}
				</div>
			</Card>
		</motion.div>
	);
}
