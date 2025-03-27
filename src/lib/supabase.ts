import { Database } from '@/types/supabase';
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
	throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
	throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create a storage object that safely works in both browser and server contexts
const storage =
	typeof window !== 'undefined'
		? localStorage
		: {
				getItem: () => null,
				setItem: () => {},
				removeItem: () => {},
		  };

// Create the Supabase client with proper persistence settings
export const supabase = createClient<Database>(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	{
		auth: {
			persistSession: true,
			storageKey: 'sb-auth-token',
			autoRefreshToken: false,
			detectSessionInUrl: true,
			flowType: 'pkce',
			debug: false,
			storage,
		},
	}
);
