import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Add auth cookie names for direct checking
const AUTH_COOKIE_NAMES = [
	'sb-access-token',
	'sb-refresh-token',
	'supabase-auth-token',
];

export async function GET(request: Request) {
	try {
		// Get the cookie store
		const cookieStore = cookies();

		// Check for auth cookies directly
		const authCookies = AUTH_COOKIE_NAMES.filter((name) =>
			cookieStore.has(name)
		);

		const hasAuthCookies = authCookies.length > 0;
		console.log('API: Auth cookies exist:', hasAuthCookies);
		if (hasAuthCookies) {
			console.log('API: Auth cookie names found:', authCookies);
		}

		// Get all cookie names for debugging
		const allCookies = Array.from(cookieStore.getAll()).map(
			(cookie) => cookie.name
		);

		// Create the supabase client
		const supabase = createRouteHandlerClient({ cookies });

		// Try to get the user first for more reliable checking
		const { data: userData, error: userError } = await supabase.auth.getUser();
		if (userError) {
			console.error('API: Error getting user:', userError.message);
		}

		// Get the session
		const {
			data: { session },
			error: sessionError,
		} = await supabase.auth.getSession();
		if (sessionError) {
			console.error('API: Error fetching session:', sessionError);
		}

		// Combined auth check using multiple signals
		const isAuthenticated = !!userData?.user || !!session || hasAuthCookies;

		return NextResponse.json({
			authenticated: isAuthenticated,
			hasAuthCookies,
			authCookies,
			hasUser: !!userData?.user,
			hasSession: !!session,
			user: userData?.user || null,
			session,
			cookies: {
				names: allCookies,
				count: allCookies.length,
			},
		});
	} catch (err) {
		console.error('API: Unexpected error:', err);
		return NextResponse.json(
			{
				authenticated: false,
				error: 'Unexpected error',
				errorDetails: (err as Error).message,
			},
			{ status: 500 }
		);
	}
}

export function OPTIONS() {
	return new NextResponse(null, {
		status: 200,
		headers: {
			Allow: 'GET, OPTIONS',
			'Content-Type': 'application/json',
		},
	});
}
