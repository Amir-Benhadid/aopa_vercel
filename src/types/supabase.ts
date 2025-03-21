export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export interface Database {
	public: {
		Tables: {
			congresses: {
				Row: {
					id: string;
					title: string;
					description: string | null;
					start_date: string;
					end_date: string;
					congress_type: 'in-person' | 'virtual' | 'hybrid';
					banner: string | null;
					created_at: string;
					updated_at: string;
					deleted_at: string | null;
					state: number;
				};
				Insert: {
					id?: string;
					title: string;
					description?: string | null;
					start_date: string;
					end_date: string;
					congress_type: 'in-person' | 'virtual' | 'hybrid';
					banner?: string | null;
					created_at?: string;
					updated_at?: string;
					deleted_at?: string | null;
					state?: number;
				};
				Update: {
					id?: string;
					title?: string;
					description?: string | null;
					start_date?: string;
					end_date?: string;
					congress_type?: 'in-person' | 'virtual' | 'hybrid';
					banner?: string | null;
					created_at?: string;
					updated_at?: string;
					deleted_at?: string | null;
					state?: number;
				};
			};
			activities: {
				Row: {
					id: string;
					title: string;
					description: string | null;
					start_date: string;
					end_date: string;
					type: 'atelier' | 'wetlab' | 'cour' | 'lunch-symposium';
					price: number;
					created_at: string;
					updated_at: string;
					deleted_at: string | null;
				};
				Insert: {
					id?: string;
					title: string;
					description?: string | null;
					start_date: string;
					end_date: string;
					type: 'atelier' | 'wetlab' | 'cour' | 'lunch-symposium';
					price: number;
					created_at?: string;
					updated_at?: string;
					deleted_at?: string | null;
				};
				Update: {
					id?: string;
					title?: string;
					description?: string | null;
					start_date?: string;
					end_date?: string;
					type?: 'atelier' | 'wetlab' | 'cour' | 'lunch-symposium';
					price?: number;
					created_at?: string;
					updated_at?: string;
					deleted_at?: string | null;
				};
			};
			accounts: {
				Row: {
					id: string;
					name: string;
					surname: string;
					created_at: string;
					updated_at: string;
					deleted_at: string | null;
				};
				Insert: {
					id?: string;
					name: string;
					surname: string;
					created_at?: string;
					updated_at?: string;
					deleted_at?: string | null;
				};
				Update: {
					id?: string;
					name?: string;
					surname?: string;
					created_at?: string;
					updated_at?: string;
					deleted_at?: string | null;
				};
			};
			account_activities: {
				Row: {
					account_id: string;
					activity_id: string;
					role: 'speaker' | 'moderator';
					created_at: string;
				};
				Insert: {
					account_id: string;
					activity_id: string;
					role: 'speaker' | 'moderator';
					created_at?: string;
				};
				Update: {
					account_id?: string;
					activity_id?: string;
					role?: 'speaker' | 'moderator';
					created_at?: string;
				};
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
	};
}
