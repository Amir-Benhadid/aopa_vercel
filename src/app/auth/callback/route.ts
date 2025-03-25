import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get('code');
	const type = requestUrl.searchParams.get('type');
	const error = requestUrl.searchParams.get('error');
	const errorDescription = requestUrl.searchParams.get('error_description');

	console.log('Auth callback received:', {
		code: !!code,
		type,
		error,
		errorDescription,
	});

	// Handle error cases from Supabase
	if (error) {
		console.error('Auth error:', error, errorDescription);
		return NextResponse.redirect(
			new URL(
				`/auth?error=${encodeURIComponent(
					errorDescription || 'Authentication error'
				)}`,
				requestUrl.origin
			)
		);
	}

	if (code) {
		try {
			const supabase = createRouteHandlerClient({ cookies });
			const { error: exchangeError } =
				await supabase.auth.exchangeCodeForSession(code);

			if (exchangeError) {
				console.error('Error exchanging code for session:', exchangeError);
				return NextResponse.redirect(
					new URL(
						`/auth?error=${encodeURIComponent(exchangeError.message)}`,
						requestUrl.origin
					)
				);
			}

			// Handle different auth types
			if (type === 'recovery') {
				// For password reset
				return NextResponse.redirect(
					new URL('/auth/reset-password', requestUrl.origin)
				);
			} else if (type === 'signup') {
				// For email verification after signup
				return NextResponse.redirect(
					new URL('/auth?verified=true', requestUrl.origin)
				);
			} else if (type === 'magiclink') {
				// For magic link login
				return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
			} else if (type === 'invite') {
				// For organization invites
				return NextResponse.redirect(
					new URL('/dashboard?invited=true', requestUrl.origin)
				);
			}

			// Default redirect to dashboard
			return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
		} catch (err) {
			console.error('Error exchanging code for session:', err);
			return NextResponse.redirect(
				new URL(
					'/auth?error=Could not complete authentication',
					requestUrl.origin
				)
			);
		}
	}

	// If no code is present, redirect to home page
	console.log('No auth code found, redirecting to home');
	return NextResponse.redirect(new URL('/', requestUrl.origin));
}
