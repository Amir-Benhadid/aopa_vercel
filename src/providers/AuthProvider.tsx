'use client';

import { supabase } from '@/lib/supabase';
import {
	AuthChangeEvent,
	Session,
	User as SupabaseUser,
} from '@supabase/supabase-js';
import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

// Define the User type
interface User {
	id: string;
	email: string;
	name?: string;
	surname?: string;
}

// Define Auth State for better type safety and predictability
type AuthState =
	| { status: 'loading' }
	| { status: 'authenticated'; user: User }
	| { status: 'unauthenticated' };

// Define the AuthContext type
interface AuthContextType {
	authState: AuthState;
	isLoading: boolean;
	isAuthenticated: boolean;
	user: User | null;
	login: (email: string, password: string) => Promise<AuthResult>;
	logout: () => Promise<void>;
	register: (
		email: string,
		password: string,
		name: string,
		surname: string
	) => Promise<AuthResult>;
	resetPassword: (email: string) => Promise<AuthResult>;
	updatePassword: (password: string) => Promise<AuthResult>;
	refreshSession: () => Promise<void>;
	resendVerificationEmail: (email: string) => Promise<AuthResult>;
}

// Extend the return type to include better error handling
interface AuthResult {
	success: boolean;
	data?: any;
	error?: {
		message: string;
		code: string;
		description?: string;
	};
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a hook to use the AuthContext
export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}

// Helper function to convert Supabase user to our User type
const formatUser = (supabaseUser: SupabaseUser | null): User | null => {
	if (!supabaseUser) return null;

	return {
		id: supabaseUser.id,
		email: supabaseUser.email || '',
		name: supabaseUser.user_metadata?.name,
		surname: supabaseUser.user_metadata?.surname,
	};
};

// Helper for error codes
const getErrorCode = (error: any): string => {
	if (error.name === 'AuthApiError') {
		return `auth/${error.message.toLowerCase().replace(/\s+/g, '-')}`;
	}

	// For common error messages, make them more consistent
	if (error.message?.includes('Invalid login credentials')) {
		return 'auth/invalid-login-credentials';
	}
	if (error.message?.includes('Email not confirmed')) {
		return 'auth/email-not-confirmed';
	}
	if (error.message?.includes('User not found')) {
		return 'auth/user-not-found';
	}

	return 'auth/unknown-error';
};

// Create the AuthProvider component
interface AuthProviderProps {
	children: ReactNode;
}

const DEBUG = process.env.NODE_ENV === 'development';
function debug(...args: any[]) {
	if (DEBUG) console.log('[AUTH-PROVIDER]', ...args);
}

export function AuthProvider({ children }: AuthProviderProps) {
	// Use useRef to track initialization state
	const isInitialized = useRef(false);
	const authStateChangeCount = useRef(0);

	// State to track auth status with a more structured approach
	const [authState, setAuthState] = useState<AuthState>({ status: 'loading' });

	// Computed properties for compatibility with existing code
	const isLoading = authState.status === 'loading';
	const isAuthenticated = authState.status === 'authenticated';
	const user = authState.status === 'authenticated' ? authState.user : null;

	// Refresh session helper that won't trigger unnecessary re-renders
	const refreshSession = useCallback(async (): Promise<void> => {
		try {
			debug('Refreshing session silently');
			const { error } = await supabase.auth.refreshSession();
			if (error) {
				debug('Session refresh error:', error);
			} else {
				debug('Session refreshed silently');
			}
		} catch (error) {
			debug('Session refresh failed:', error);
		}
	}, []);

	// Handle auth state changes that come from Supabase
	const handleAuthStateChange = useCallback(
		async (event: AuthChangeEvent, session: Session | null) => {
			authStateChangeCount.current += 1;
			const currentCount = authStateChangeCount.current;

			debug(
				`Auth state change [${currentCount}]:`,
				event,
				session?.user?.email
			);

			// Only process the latest auth state change
			if (event === 'SIGNED_IN' && session?.user) {
				debug(`SIGNED_IN [${currentCount}]`);
				const formattedUser = formatUser(session.user);
				if (formattedUser) {
					setAuthState({
						status: 'authenticated',
						user: formattedUser,
					});
				}
			} else if (event === 'SIGNED_OUT') {
				debug(`SIGNED_OUT [${currentCount}]`);
				setAuthState({ status: 'unauthenticated' });
			} else if (event === 'TOKEN_REFRESHED' && session?.user) {
				debug(`TOKEN_REFRESHED [${currentCount}]`);
				const formattedUser = formatUser(session.user);
				if (formattedUser) {
					setAuthState({
						status: 'authenticated',
						user: formattedUser,
					});
				}
			}
		},
		[]
	);

	// Initialize auth state only once
	useEffect(() => {
		if (isInitialized.current) return;

		debug('Starting auth initialization');
		isInitialized.current = true;

		// Get current session without triggering state updates
		const initializeAuth = async () => {
			try {
				debug('Initializing auth state');
				// Initialize supabase auth
				await supabase.auth.initialize();

				// Get current session
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();

				if (error) {
					debug('Error getting session:', error);
					setAuthState({ status: 'unauthenticated' });
					return;
				}

				if (session?.user) {
					debug('Session found for user:', session.user.email);
					const formattedUser = formatUser(session.user);
					if (formattedUser) {
						setAuthState({
							status: 'authenticated',
							user: formattedUser,
						});
					} else {
						setAuthState({ status: 'unauthenticated' });
					}
				} else {
					debug('No session found');
					setAuthState({ status: 'unauthenticated' });
				}
			} catch (error) {
				debug('Auth initialization error:', error);
				setAuthState({ status: 'unauthenticated' });
			}
		};

		initializeAuth();

		// Set up auth state change listener without recreating it
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(handleAuthStateChange);

		// Cleanup
		return () => {
			debug('Cleaning up auth subscription');
			subscription.unsubscribe();
		};
	}, [handleAuthStateChange]);

	// Login function with optimistic updates
	const login = useCallback(
		async (email: string, password: string): Promise<AuthResult> => {
			try {
				debug('Login attempt for:', email);

				const { data, error } = await supabase.auth.signInWithPassword({
					email,
					password,
				});

				if (error) {
					debug('Login error:', error);
					return {
						success: false,
						error: {
							message: error.message,
							code: getErrorCode(error),
							description: error.message,
						},
					};
				}

				debug('Login successful, session:', !!data.session);

				// Optimistically update the auth state for a smoother UX
				if (data.user) {
					const formattedUser = formatUser(data.user);
					if (formattedUser) {
						setAuthState({
							status: 'authenticated',
							user: formattedUser,
						});
					}
				}

				return { success: true, data };
			} catch (error: any) {
				debug('Unexpected login error:', error);
				return {
					success: false,
					error: {
						message: error.message || 'Unknown error occurred during login',
						code: 'auth/unexpected-error',
						description: error.toString(),
					},
				};
			}
		},
		[]
	);

	// Logout function with optimistic updates
	const logout = useCallback(async (): Promise<void> => {
		debug('Logout attempt');

		try {
			// Optimistically update state for smoother UX
			setAuthState({ status: 'unauthenticated' });

			const { error } = await supabase.auth.signOut();
			if (error) {
				debug('Logout error:', error);
				throw error;
			}

			debug('Logout successful');
		} catch (error) {
			debug('Logout error:', error);
			throw error;
		}
	}, []);

	// Register function with optimistic updates
	const register = useCallback(
		async (
			email: string,
			password: string,
			name: string,
			surname: string
		): Promise<AuthResult> => {
			debug('Register attempt for:', email);

			try {
				// Create the full URL for email verification redirect
				const redirectUrl = new URL(
					'/auth/callback',
					window.location.origin
				).toString();

				debug('Registration with redirect URL:', redirectUrl);

				const { data, error } = await supabase.auth.signUp({
					email,
					password,
					options: {
						data: {
							name,
							surname,
						},
						emailRedirectTo: redirectUrl,
					},
				});

				debug('Registration response:', {
					success: !error,
					user: data?.user?.id,
					session: !!data?.session,
					identitiesLength: data?.user?.identities?.length,
				});

				if (error) {
					debug('Registration error:', error);
					return {
						success: false,
						error: {
							message: error.message,
							code: getErrorCode(error),
							description: error.message,
						},
					};
				}

				// Check if email confirmation is required or if the email is already in use
				if (data?.user?.identities?.length === 0) {
					debug('Email already in use: identities length is 0');
					return {
						success: false,
						error: {
							message: 'Email already in use',
							code: 'auth/email-already-in-use',
							description:
								'An account with this email already exists. Please use a different email or try to sign in.',
						},
					};
				}

				// Check if email confirmation is needed
				if (!data.session) {
					debug('Email confirmation needed');
					return {
						success: true,
						data: {
							...data,
							emailVerificationNeeded: true,
						},
					};
				}

				debug('Registration successful with immediate session');

				// Optimistic update for smoother UX
				if (data.user) {
					const formattedUser = formatUser(data.user);
					if (formattedUser) {
						setAuthState({
							status: 'authenticated',
							user: formattedUser,
						});
					}
				}

				return {
					success: true,
					data,
				};
			} catch (error: any) {
				debug('Unexpected registration error:', error);
				return {
					success: false,
					error: {
						message:
							error.message || 'Unknown error occurred during registration',
						code: 'auth/unexpected-error',
						description: error.toString(),
					},
				};
			}
		},
		[]
	);

	// Reset password function
	const resetPassword = useCallback(
		async (email: string): Promise<AuthResult> => {
			debug('Reset password attempt for:', email);

			try {
				// Create the full URL for password reset redirect
				const redirectUrl = new URL(
					'/auth/reset-password',
					window.location.origin
				).toString();

				debug('Reset password with redirect URL:', redirectUrl);

				const { error } = await supabase.auth.resetPasswordForEmail(email, {
					redirectTo: redirectUrl,
				});

				if (error) {
					debug('Reset password error:', error);
					return {
						success: false,
						error: {
							message: error.message,
							code: getErrorCode(error),
							description: error.message,
						},
					};
				}

				debug('Reset password email sent successfully');
				return { success: true };
			} catch (error: any) {
				debug('Unexpected reset password error:', error);
				return {
					success: false,
					error: {
						message:
							error.message || 'Unknown error occurred during password reset',
						code: 'auth/unexpected-error',
						description: error.toString(),
					},
				};
			}
		},
		[]
	);

	// Update password function
	const updatePassword = useCallback(
		async (password: string): Promise<AuthResult> => {
			debug('Update password attempt');

			try {
				const { error } = await supabase.auth.updateUser({
					password,
				});

				if (error) {
					debug('Update password error:', error);
					return {
						success: false,
						error: {
							message: error.message,
							code: getErrorCode(error),
							description: error.message,
						},
					};
				}

				debug('Password updated successfully');
				return { success: true };
			} catch (error: any) {
				debug('Unexpected update password error:', error);
				return {
					success: false,
					error: {
						message:
							error.message || 'Unknown error occurred during password update',
						code: 'auth/unexpected-error',
						description: error.toString(),
					},
				};
			}
		},
		[]
	);

	// Resend verification email function
	const resendVerificationEmail = useCallback(
		async (email: string): Promise<AuthResult> => {
			debug('Resend verification email attempt for:', email);

			try {
				// Create the full URL for email verification redirect
				const redirectUrl = new URL(
					'/auth/callback',
					window.location.origin
				).toString();

				debug('Resending verification email with redirect URL:', redirectUrl);

				const { error } = await supabase.auth.resend({
					type: 'signup',
					email,
					options: {
						emailRedirectTo: redirectUrl,
					},
				});

				if (error) {
					debug('Resend verification email error:', error);
					return {
						success: false,
						error: {
							message: error.message,
							code: getErrorCode(error),
							description: error.message,
						},
					};
				}

				debug('Verification email resent successfully');
				return { success: true };
			} catch (error: any) {
				debug('Unexpected resend verification email error:', error);
				return {
					success: false,
					error: {
						message:
							error.message ||
							'Unknown error occurred while resending verification email',
						code: 'auth/unexpected-error',
						description: error.toString(),
					},
				};
			}
		},
		[]
	);

	// Create memoized context value to prevent unnecessary rerenders
	const contextValue = useMemo(
		() => ({
			authState,
			isLoading,
			isAuthenticated,
			user,
			login,
			logout,
			register,
			resetPassword,
			updatePassword,
			refreshSession,
			resendVerificationEmail,
		}),
		[
			authState,
			isLoading,
			isAuthenticated,
			user,
			login,
			logout,
			register,
			resetPassword,
			updatePassword,
			refreshSession,
			resendVerificationEmail,
		]
	);

	return (
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	);
}
