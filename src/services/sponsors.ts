import { supabase } from '@/lib/supabase';
import { Sponsor } from '@/types/database';

export const fetchSponsors = async (filters?: {
	search?: string;
	tier?: string;
	active?: boolean;
	congressId?: string;
}): Promise<Sponsor[]> => {
	try {
		let query = supabase
			.from('sponsors')
			.select('*, organization:organization_id(name, logo, website)')
			.order('created_at', { ascending: false });

		if (filters?.search) {
			const searchTerm = `%${filters.search}%`;
			query = query.or(
				`organization.name.ilike.${searchTerm},organization.website.ilike.${searchTerm}`
			);
		}

		if (filters?.tier) {
			query = query.eq('sponsorship_level', filters.tier);
		}

		if (filters?.congressId) {
			query = query.eq('congress_id', filters.congressId);
		}

		// Active filter would be implemented if there's an active field
		// For now, we'll assume all sponsors are active unless deleted
		if (filters?.active !== undefined) {
			query = query.is('deleted_at', filters.active ? null : 'not.null');
		}

		const { data, error } = await query;

		if (error) {
			console.error('Error fetching sponsors:', error);
			return [];
		}

		// Transform the data to match the Sponsor interface
		const sponsors = data.map((sponsor) => ({
			id: sponsor.id,
			name: sponsor.organization?.name || '',
			description: '',
			logo: sponsor.organization?.logo || '',
			website: sponsor.organization?.website || '',
			sponsorship_level: sponsor.sponsorship_level,
			congress_id: sponsor.congress_id,
		}));

		return sponsors;
	} catch (error) {
		console.error('Error in fetchSponsors:', error);
		return [];
	}
};

export const createSponsor = async (sponsorData: Omit<Sponsor, 'id'>) => {
	try {
		// First, create or get the organization
		const { data: orgData, error: orgError } = await supabase
			.from('organizations')
			.insert({
				name: sponsorData.name,
				logo: sponsorData.logo,
				website: sponsorData.website,
			})
			.select()
			.single();

		if (orgError) throw orgError;

		// Then create the sponsor with the organization ID
		const { data, error } = await supabase
			.from('sponsors')
			.insert({
				organization_id: orgData.id,
				congress_id: sponsorData.congress_id,
				sponsorship_level: sponsorData.sponsorship_level,
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		console.error('Error creating sponsor:', error);
		throw error;
	}
};

export const updateSponsor = async (id: string, updates: Partial<Sponsor>) => {
	try {
		// Get the current sponsor data
		const { data: currentSponsor, error: fetchError } = await supabase
			.from('sponsors')
			.select('*, organization:organization_id(*)')
			.eq('id', id)
			.single();

		if (fetchError) throw fetchError;

		// Update the organization if needed
		if (updates.name || updates.logo || updates.website) {
			const { error: orgError } = await supabase
				.from('organizations')
				.update({
					name: updates.name || currentSponsor.organization.name,
					logo: updates.logo || currentSponsor.organization.logo,
					website: updates.website || currentSponsor.organization.website,
				})
				.eq('id', currentSponsor.organization_id);

			if (orgError) throw orgError;
		}

		// Update the sponsor
		const { data, error } = await supabase
			.from('sponsors')
			.update({
				sponsorship_level:
					updates.sponsorship_level || currentSponsor.sponsorship_level,
				congress_id: updates.congress_id || currentSponsor.congress_id,
			})
			.eq('id', id)
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		console.error('Error updating sponsor:', error);
		throw error;
	}
};

export const deleteSponsor = async (id: string) => {
	try {
		// Soft delete by setting deleted_at
		const { error } = await supabase
			.from('sponsors')
			.update({ deleted_at: new Date().toISOString() })
			.eq('id', id);

		if (error) throw error;
	} catch (error) {
		console.error('Error deleting sponsor:', error);
		throw error;
	}
};
