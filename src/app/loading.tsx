'use client';

import { Loader2 } from 'lucide-react';

export default function Loading() {
	return (
		<div className="flex h-full w-full items-center justify-center py-12">
			<div className="text-center">
				<Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-3" />
				<p className="text-gray-700 dark:text-gray-300 font-medium text-sm">
					Loading...
				</p>
			</div>
		</div>
	);
}
