'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface PublicRouteProps {
	children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
	const { user, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && user) {
			router.push('/');
		}
	}, [user, isLoading, router]);

	// Show nothing while loading or if authenticated
	if (isLoading || user) {
		return null;
	}

	// If not authenticated, render the children
	return <>{children}</>;
}
