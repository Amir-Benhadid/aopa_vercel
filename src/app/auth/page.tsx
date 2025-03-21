'use client';

import { PublicRoute } from '@/components/auth/PublicRoute';
import AuthPage from './auth-page';

export default function Page() {
	return (
		<PublicRoute>
			<AuthPage />
		</PublicRoute>
	);
}
