import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest) => {
	try {
		const searchParams = request.nextUrl.searchParams;
		const search = searchParams.get('search');
		const status = searchParams.get('status');
		const type = searchParams.get('type');
		const congress = searchParams.get('congress');
		const userId = searchParams.get('userId');

		if (!userId) {
			return NextResponse.json(
				{ error: 'User ID is required' },
				{ status: 400 }
			);
		}

		// First get the account ID for this user
		const { data: accountData, error: accountError } = await supabase
			.from('accounts')
			.select('id')
			.eq('user_id', userId)
			.single();

		if (accountError) {
			return NextResponse.json(
				{ error: 'User profile not found' },
				{ status: 404 }
			);
		}

		let query = supabase
			.from('abstracts')
			.select('*')
			.eq('account_id', accountData.id)
			.order('created_at', { ascending: false });

		if (search) {
			query = query.or(
				`title.ilike.%${search}%,introduction.ilike.%${search}%`
			);
		}

		if (status) {
			query = query.eq('status', status);
		}

		if (type) {
			query = query.eq('type', type);
		}

		if (congress) {
			query = query.eq('congress_id', congress);
		}

		const { data: abstracts, error } = await query;

		if (error) throw error;

		return NextResponse.json(abstracts);
	} catch (error) {
		console.error('Error fetching abstracts:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch abstracts' },
			{ status: 500 }
		);
	}
};

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			title,
			introduction,
			methods,
			results,
			conclusion,
			keywords,
			type,
			theme,
			coAuthors,
			institution,
			department,
			city,
			country,
		} = body;

		// Get the active congress
		const { data: activeCongress, error: congressError } = await supabase
			.from('congresses')
			.select('id')
			.eq('status', 'active')
			.single();

		if (congressError) throw congressError;
		if (!activeCongress) throw new Error('No active congress found');

		const { data: abstract, error } = await supabase
			.from('abstracts')
			.insert([
				{
					title,
					introduction,
					methods,
					results,
					conclusion,
					keywords,
					type,
					theme,
					co_authors: coAuthors,
					institution,
					department,
					city,
					country,
					congress_id: activeCongress.id,
					status: 'submitted',
				},
			])
			.select()
			.single();

		if (error) throw error;

		return NextResponse.json(abstract);
	} catch (error) {
		console.error('Error creating abstract:', error);
		return NextResponse.json(
			{ error: 'Failed to create abstract' },
			{ status: 500 }
		);
	}
}
