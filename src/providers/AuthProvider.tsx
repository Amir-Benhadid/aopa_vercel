'use client';

import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';

// Define the User type
interface User {
	id: string;
	email: string;
	name?: string;
	surname?: string;
}

// Define the AuthContext type
interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (email: string, password: string) => Promise<any>;
	logout: () => Promise<void>;
	register: (
		email: string,
		password: string,
		name: string,
		surname: string
	) => Promise<any>;
	resetPassword: (email: string) => Promise<{ error: any | null }>;
	updatePassword: (password: string) => Promise<{ error: any | null }>;
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

// Create the AuthProvider component
interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [hasInitialized, setHasInitialized] = useState(false);

	// Check if the user is authenticated on mount and set up auth state listener
	useEffect(() => {
		// Get initial session
		const initializeAuth = async () => {
			if (hasInitialized) return;

			setIsLoading(true);
			try {
				console.log('AuthProvider: Initializing auth state');

				// Force Supabase to synchronize with local storage and cookies
				await supabase.auth.initialize();

				console.log('AuthProvider: Checking local storage for session');
				// Manually check local storage for session
				const storedSession = localStorage.getItem('sb-auth-token');
				console.log('AuthProvider: Found stored session:', !!storedSession);

				// Get current session
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();

				if (error) {
					console.error('AuthProvider: Error getting session:', error);
				}

				console.log('AuthProvider: Session found:', !!session);
				if (session?.user) {
					console.log('AuthProvider: User email:', session.user.email);
					// Force refresh auth tokens to ensure cookies are set properly
					const { error: refreshError } = await supabase.auth.refreshSession();
					if (refreshError) {
						console.error(
							'AuthProvider: Error refreshing session:',
							refreshError
						);
					} else {
						console.log('AuthProvider: Session refreshed successfully');
					}
				}

				setUser(formatUser(session?.user || null));

				// Set up auth state change listener
				const {
					data: { subscription },
				} = supabase.auth.onAuthStateChange((event, session) => {
					console.log('Auth state changed:', event, session?.user?.email);
					setUser(formatUser(session?.user || null));

					// For sign_in events, force a session refresh
					if (event === 'SIGNED_IN') {
						console.log('SIGNED_IN event detected, refreshing session');
						supabase.auth.refreshSession().then(({ error }) => {
							if (error) {
								console.error('Error refreshing session after sign in:', error);
							} else {
								console.log('Session refreshed after sign in');
							}
						});
					}
				});

				setHasInitialized(true);
				return () => {
					subscription.unsubscribe();
				};
			} catch (error) {
				console.error('Authentication initialization error:', error);
			} finally {
				setIsLoading(false);
			}
		};

		initializeAuth();
	}, [hasInitialized]);

	// Login function
	const login = async (email: string, password: string) => {
		setIsLoading(true);
		try {
			console.log('AuthProvider: Attempting login for:', email);
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) throw error;

			console.log('AuthProvider: Login successful, session:', !!data.session);

			// Force refresh the tokens to ensure cookies are properly set
			const { error: refreshError } = await supabase.auth.refreshSession();
			if (refreshError) {
				console.error(
					'AuthProvider: Error refreshing session after login:',
					refreshError
				);
			} else {
				console.log('AuthProvider: Session refreshed after login');
			}

			setUser(formatUser(data.user));
			return data;
		} catch (error) {
			console.error('Login error:', error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	// Logout function
	const logout = async () => {
		setIsLoading(true);
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;

			setUser(null);
		} catch (error) {
			console.error('Logout error:', error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	// Register function
	const register = async (
		email: string,
		password: string,
		name: string,
		surname: string
	) => {
		setIsLoading(true);
		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						name,
						surname,
					},
					emailRedirectTo: `${window.location.origin}/auth/callback`,
				},
			});

			if (error) throw error;

			// Note: User might not be immediately available after signup
			// if email confirmation is required
			setUser(formatUser(data.user));
			return data;
		} catch (error) {
			console.error('Registration error:', error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	// Reset password function (sends reset email)
	const resetPassword = async (email: string) => {
		setIsLoading(true);
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/auth/reset-password`,
			});
			return { error };
		} catch (error) {
			console.error('Reset password error:', error);
			return { error };
		} finally {
			setIsLoading(false);
		}
	};

	// Update password function (after reset)
	const updatePassword = async (password: string) => {
		setIsLoading(true);
		try {
			const { error } = await supabase.auth.updateUser({ password });
			return { error };
		} catch (error) {
			console.error('Update password error:', error);
			return { error };
		} finally {
			setIsLoading(false);
		}
	};

	// Create the auth value object
	const authValue: AuthContextType = {
		user,
		isLoading,
		isAuthenticated: !!user,
		login,
		logout,
		register,
		resetPassword,
		updatePassword,
	};

	return (
		<AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
	);
}
