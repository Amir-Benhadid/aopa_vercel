'use client';

import { supabase } from '@/lib/supabase';
import { fetchFilteredAbstracts } from '@/services/abstracts';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useDebounce } from './useDebounce';

export function useAbstracts(userId?: string) {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [typeFilter, setTypeFilter] = useState('all');
	const [congressFilter, setCongressFilter] = useState('all');
	const [isUserReady, setIsUserReady] = useState(true);

	const debouncedSearch = useDebounce(searchTerm, 300);

	// Set isUserReady when userId is available or not required
	useEffect(() => {
		// Always consider ready since we now support fetching without a userId
		setIsUserReady(true);
	}, [userId]);

	const { data: congresses } = useQuery({
		queryKey: ['congresses'],
		queryFn: async () => {
			const { data, error } = await supabase
				.from('congresses')
				.select('id, name')
				.order('start_date', { ascending: false });
			if (error) throw error;
			return data;
		},
	});

	const {
		data: abstracts,
		isLoading,
		isFetching,
		isError,
		refetch,
	} = useQuery({
		queryKey: [
			'abstracts',
			debouncedSearch,
			statusFilter,
			typeFilter,
			congressFilter,
			userId,
		],
		queryFn: async () => {
			console.log(
				'Fetching abstracts with userId:',
				userId || 'ALL (no user filter)'
			);

			try {
				const data = await fetchFilteredAbstracts({
					search: debouncedSearch || undefined,
					status: statusFilter !== 'all' ? statusFilter : undefined,
					type: typeFilter !== 'all' ? typeFilter : undefined,
					congress: congressFilter !== 'all' ? congressFilter : undefined,
					userId: userId, // Pass userId which may be undefined - service will handle this
				});
				console.log('Fetched abstracts:', data.length);
				return data;
			} catch (error) {
				console.error('Error in useAbstracts queryFn:', error);
				return [];
			}
		},
		enabled: isUserReady, // Just depend on isUserReady, which is always true now
		retry: 1,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	return {
		abstracts: abstracts || [],
		congresses,
		isLoading,
		isFetching,
		isError,
		searchTerm,
		setSearchTerm,
		statusFilter,
		setStatusFilter,
		typeFilter,
		setTypeFilter,
		congressFilter,
		setCongressFilter,
		refetch,
	};
}
