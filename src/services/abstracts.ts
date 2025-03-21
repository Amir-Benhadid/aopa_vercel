import { supabase } from '@/lib/supabase';
import { Abstract } from '@/types/database';

export const fetchFilteredAbstracts = async (filters: {
	search?: string;
	status?: string;
	type?: string;
	congress?: string;
	userId?: string;
}): Promise<Abstract[]> => {
	try {
		// Initialize query
		let query = supabase
			.from('abstracts')
			.select('*')
			.order('created_at', { ascending: false });

		// If userId is provided, filter by the user's account
		if (filters.userId) {
			console.log('Filtering abstracts for user ID:', filters.userId);

			// First get the account ID for this user
			const { data: accountData, error: accountError } = await supabase
				.from('accounts')
				.select('id')
				.eq('user_id', filters.userId)
				.single();

			if (accountError) {
				console.error('Error getting account:', accountError);
				return [];
			}

			console.log('Found account ID:', accountData.id);

			// Filter by account_id
			query = query.eq('account_id', accountData.id);
		} else {
			// No user ID - fetch all abstracts
			console.log('Fetching all abstracts (no user filter)');
		}

		// Apply other filters
		if (filters.search) {
			query = query.or(
				`title.ilike.%${filters.search}%,introduction.ilike.%${filters.search}%`
			);
		}

		if (filters.status) {
			query = query.eq('status', filters.status);
		}

		if (filters.type) {
			query = query.eq('type', filters.type);
		}

		if (filters.congress) {
			query = query.eq('congress_id', filters.congress);
		}

		const { data, error } = await query;

		if (error) {
			console.error('Error fetching abstracts:', error);
			return [];
		}

		console.log('Fetched abstracts:', data?.length || 0);
		return data || [];
	} catch (error) {
		console.error('Error in fetchFilteredAbstracts:', error);
		return [];
	}
};

// Add other abstract-related functions
export const createAbstract = async (
	abstractData: Omit<Abstract, 'id' | 'created_at'>
) => {
	const { data, error } = await supabase
		.from('abstracts')
		.insert(abstractData)
		.select()
		.single();

	if (error) throw error;
	return data;
};

export const updateAbstract = async (
	id: string,
	updates: Partial<Abstract>
) => {
	const { data, error } = await supabase
		.from('abstracts')
		.update(updates)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data;
};

export const deleteAbstract = async (id: string) => {
	const { error } = await supabase.from('abstracts').delete().eq('id', id);

	if (error) throw error;
};
