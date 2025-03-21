'use client';

import { AbstractsPage as AbstractsContent } from '@/components/abstracts/AbstractsPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function Page() {
	return (
		<ProtectedRoute>
			<AbstractsContent />
		</ProtectedRoute>
	);
}
