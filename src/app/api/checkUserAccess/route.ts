import { supabase } from '@/lib/supabase';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
	try {
		// Get the congress ID from the query parameters
		const searchParams = request.nextUrl.searchParams;
		const congressId = searchParams.get('congressId');

		if (!congressId) {
			return NextResponse.json(
				{ error: 'Congress ID is required' },
				{ status: 400 }
			);
		}

		// Get the current user from the session
		const supabaseClient = createServerComponentClient({ cookies });
		const {
			data: { session },
		} = await supabaseClient.auth.getSession();

		if (!session?.user) {
			return NextResponse.json(
				{ hasAccess: false, error: 'User not authenticated' },
				{ status: 401 }
			);
		}

		const userId = session.user.id;

		// Get the account ID for this user
		const { data: accountData, error: accountError } = await supabase
			.from('accounts')
			.select('id')
			.eq('user_id', userId)
			.single();

		if (accountError) {
			return NextResponse.json(
				{ hasAccess: false, error: 'User account not found' },
				{ status: 404 }
			);
		}

		// Check if the user has a paid invoice for an inscription linked to this congress
		const { data: inscriptions, error: inscriptionsError } = await supabase
			.from('inscriptions')
			.select('id')
			.eq('account_id', accountData.id)
			.eq('congress_id', congressId)
			.is('deleted_at', null);

		if (inscriptionsError) {
			console.error('Error checking inscriptions:', inscriptionsError);
			return NextResponse.json(
				{ hasAccess: false, error: 'Failed to check inscriptions' },
				{ status: 500 }
			);
		}

		// If no inscriptions found, user doesn't have access
		if (!inscriptions || inscriptions.length === 0) {
			return NextResponse.json({ hasAccess: false });
		}

		// Get the inscription IDs
		const inscriptionIds = inscriptions.map((inscription) => inscription.id);

		// Check if any of these inscriptions have a paid invoice
		const { data: invoices, error: invoicesError } = await supabase
			.from('invoices')
			.select('id')
			.in('inscription_id', inscriptionIds)
			.eq('paid', true)
			.is('deleted_at', null);

		if (invoicesError) {
			console.error('Error checking invoices:', invoicesError);
			return NextResponse.json(
				{ hasAccess: false, error: 'Failed to check invoices' },
				{ status: 500 }
			);
		}

		// User has access if they have at least one paid invoice
		const hasAccess = invoices && invoices.length > 0;

		return NextResponse.json({ hasAccess });
	} catch (error) {
		console.error('Error checking user access:', error);
		return NextResponse.json(
			{ hasAccess: false, error: 'Failed to check user access' },
			{ status: 500 }
		);
	}
}
