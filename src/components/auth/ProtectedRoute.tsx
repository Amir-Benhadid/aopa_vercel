'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { user, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !user) {
			router.push('/');
		}
	}, [user, isLoading, router]);

	// Show nothing while loading or if not authenticated
	if (isLoading || !user) {
		return null;
	}

	// If authenticated, render the children
	return <>{children}</>;
}
