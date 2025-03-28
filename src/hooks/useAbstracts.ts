'use client';

import { supabase } from '@/lib/supabase';
import { fetchFilteredAbstracts } from '@/services/abstracts';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useDebounce } from './useDebounce';

// Define a simple interface for congress data
interface CongressItem {
	id: string;
	title: string;
}

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
			try {
				// First check if there are ANY congresses (without date filter) to see if data exists
				const { data: allCongresses, error: checkError } = await supabase
					.from('congresses')
					.select('id, title')
					.order('start_date', { ascending: false })
					.limit(1);

				if (checkError) {
					console.error('Error checking congresses:', checkError);
				} else {
					console.log(
						'Checking if any congresses exist:',
						allCongresses?.length || 0
					);
				}

				// Now get our filtered congresses for 2025+
				const { data, error } = await supabase
					.from('congresses')
					.select('id, title')
					.gte('start_date', '2025-01-01')
					.order('start_date', { ascending: false });

				if (error) {
					console.error('Error fetching congresses:', error);
					return [];
				}

				console.log('Fetched congresses from 2025+:', data?.length || 0, data);

				// Transform data to match expected format with name property
				const formattedData =
					data?.map((congress) => ({
						id: congress.id,
						name: congress.title,
					})) || [];

				// If we don't have any congresses from 2025+, add a sample one
				if (formattedData.length === 0) {
					console.log('No congresses found for 2025+, adding a sample one');
					formattedData.push({
						id: 'sample-congress-2025',
						name: 'Annual Ophthalmology Congress 2025',
					});
				}

				return formattedData;
			} catch (err) {
				console.error('Exception in congresses query:', err);
				return [];
			}
		},
	});

	console.log('THIS DATA', congresses);

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
