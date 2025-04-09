import { Database } from '@/types/supabase';
import { createClient } from '@supabase/supabase-js';

const url = 'https://crmfdcioxwviuendnlik.supabase.co';
const key =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNybWZkY2lveHd2aXVlbmRubGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyMzk5MDEsImV4cCI6MjA1MDgxNTkwMX0.SXlBRQqbPMbIDkXIKn55Imwu0GAZJEgJF2tNertFAJc';

// Create a storage object that safely works in both browser and server contexts
const storage =
	typeof window !== 'undefined'
		? window.localStorage
		: {
				getItem: () => null,
				setItem: () => {},
				removeItem: () => {},
		  };

// Create the Supabase client with proper persistence settings
export const supabase = createClient<Database>(url, key, {
	auth: {
		persistSession: true,
		storageKey: 'sb-auth-token',
		autoRefreshToken: true,
		detectSessionInUrl: true,
		flowType: 'pkce',
		debug: false,
		storage,
	},
});
