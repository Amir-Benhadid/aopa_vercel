import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Make this route dynamic

export async function POST(request: NextRequest) {
	try {
		// Parse request body
		const body = await request.json();
		const { email, password } = body;

		// Validate input
		if (!email || !password) {
			return NextResponse.json(
				{
					success: false,
					error: 'Email and password are required',
				},
				{ status: 400 }
			);
		}

		console.log('API login attempt for:', email);

		// Initialize Supabase client
		const cookieStore = cookies();
		const supabase = createRouteHandlerClient({ cookies });

		// Attempt login
		const {
			data: { user, session },
			error,
		} = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		// Handle login error
		if (error) {
			console.error('API login error:', error.message);
			return NextResponse.json(
				{
					success: false,
					error: error.message,
				},
				{ status: 401 }
			);
		}

		// Get all cookies
		const allCookies = Array.from(cookieStore.getAll()).map((c) => c.name);

		console.log('API login successful');
		console.log('User:', user?.email);
		console.log('Session exists:', !!session);
		console.log('Cookies after login:', allCookies);

		// Construct the response with detailed session info
		const response = NextResponse.json({
			success: true,
			user,
			sessionExists: !!session,
			expiresAt: session?.expires_at,
			cookies: {
				count: allCookies.length,
				names: allCookies,
			},
		});

		// Return the enhanced response
		return response;
	} catch (error) {
		console.error('Unexpected API login error:', error);
		return NextResponse.json(
			{
				success: false,
				error: 'An unexpected error occurred',
				details: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}
