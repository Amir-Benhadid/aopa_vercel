import { Database } from '@/types/supabase';
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
	throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
	throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create the Supabase client with proper persistence settings
export const supabase = createClient<Database>(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	{
		auth: {
			persistSession: true,
			storageKey: 'sb-auth-token',
			autoRefreshToken: true,
			detectSessionInUrl: true,
			flowType: 'pkce',
			debug: true,
			storage: {
				getItem: (key) => {
					if (typeof window !== 'undefined') {
						return window.localStorage.getItem(key);
					}
					return null;
				},
				setItem: (key, value) => {
					if (typeof window !== 'undefined') {
						window.localStorage.setItem(key, value);
					}
				},
				removeItem: (key) => {
					if (typeof window !== 'undefined') {
						window.localStorage.removeItem(key);
					}
				},
			},
		},
	}
);
