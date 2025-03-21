export type Database = {
	public: {
		Tables: {
			abstracts: {
				Row: {
					account_id: string | null;
					co_authors: string[] | null;
					conclusion: string;
					congress_id: string | null;
					created_at: string | null;
					deleted_at: string | null;
					discussion: string;
					email: string;
					id: string;
					introduction: string;
					materials: string;
					name: string;
					phone: string | null;
					results: string;
					status: Database['public']['Enums']['abstract_status'];
					surname: string;
					theme: Database['public']['Enums']['theme_type'];
					title: string;
					type: Database['public']['Enums']['abstract_type'];
					updated_at: string | null;
				};
				Insert: {
					account_id?: string | null;
					co_authors?: string[] | null;
					conclusion: string;
					congress_id?: string | null;
					created_at?: string | null;
					deleted_at?: string | null;
					discussion: string;
					email: string;
					id?: string;
					introduction: string;
					materials: string;
					name: string;
					phone?: string | null;
					results: string;
					status?: Database['public']['Enums']['abstract_status'];
					surname: string;
					theme: Database['public']['Enums']['theme_type'];
					title: string;
					type: Database['public']['Enums']['abstract_type'];
					updated_at?: string | null;
				};
				Update: {
					account_id?: string | null;
					co_authors?: string[] | null;
					conclusion?: string;
					congress_id?: string | null;
					created_at?: string | null;
					deleted_at?: string | null;
					discussion?: string;
					email?: string;
					id?: string;
					introduction?: string;
					materials?: string;
					name?: string;
					phone?: string | null;
					results?: string;
					status?: Database['public']['Enums']['abstract_status'];
					surname?: string;
					theme?: Database['public']['Enums']['theme_type'];
					title?: string;
					type?: Database['public']['Enums']['abstract_type'];
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'abstracts_account_id_fkey';
						columns: ['account_id'];
						isOneToOne: false;
						referencedRelation: 'accounts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'abstracts_congress_id_fkey';
						columns: ['congress_id'];
						isOneToOne: false;
						referencedRelation: 'congresses';
						referencedColumns: ['id'];
					}
				];
			};
			account_activities: {
				Row: {
					account_id: string;
					activity_id: string;
					role: Database['public']['Enums']['activity_role'];
				};
				Insert: {
					account_id: string;
					activity_id: string;
					role: Database['public']['Enums']['activity_role'];
				};
				Update: {
					account_id?: string;
					activity_id?: string;
					role?: Database['public']['Enums']['activity_role'];
				};
				Relationships: [
					{
						foreignKeyName: 'account_activities_account_id_fkey';
						columns: ['account_id'];
						isOneToOne: false;
						referencedRelation: 'accounts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'account_activities_activity_id_fkey';
						columns: ['activity_id'];
						isOneToOne: false;
						referencedRelation: 'activities';
						referencedColumns: ['id'];
					}
				];
			};
			account_conferences: {
				Row: {
					account_id: string;
					conference_id: string;
					role: Database['public']['Enums']['conference_role'];
				};
				Insert: {
					account_id: string;
					conference_id: string;
					role: Database['public']['Enums']['conference_role'];
				};
				Update: {
					account_id?: string;
					conference_id?: string;
					role?: Database['public']['Enums']['conference_role'];
				};
				Relationships: [
					{
						foreignKeyName: 'account_conferences_account_id_fkey';
						columns: ['account_id'];
						isOneToOne: false;
						referencedRelation: 'accounts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'account_conferences_conference_id_fkey';
						columns: ['conference_id'];
						isOneToOne: false;
						referencedRelation: 'conferences';
						referencedColumns: ['id'];
					}
				];
			};
			account_masterclasses: {
				Row: {
					account_id: string;
					masterclass_id: string;
					role: Database['public']['Enums']['masterclass_role'];
				};
				Insert: {
					account_id: string;
					masterclass_id: string;
					role: Database['public']['Enums']['masterclass_role'];
				};
				Update: {
					account_id?: string;
					masterclass_id?: string;
					role?: Database['public']['Enums']['masterclass_role'];
				};
				Relationships: [
					{
						foreignKeyName: 'account_masterclasses_account_id_fkey';
						columns: ['account_id'];
						isOneToOne: false;
						referencedRelation: 'accounts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'account_masterclasses_masterclass_id_fkey';
						columns: ['masterclass_id'];
						isOneToOne: false;
						referencedRelation: 'masterclasses';
						referencedColumns: ['id'];
					}
				];
			};
			account_segments: {
				Row: {
					account_id: string;
					role: Database['public']['Enums']['segment_role'];
					segment_id: string;
				};
				Insert: {
					account_id: string;
					role: Database['public']['Enums']['segment_role'];
					segment_id: string;
				};
				Update: {
					account_id?: string;
					role?: Database['public']['Enums']['segment_role'];
					segment_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'account_segments_account_id_fkey';
						columns: ['account_id'];
						isOneToOne: false;
						referencedRelation: 'accounts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'account_segments_segment_id_fkey';
						columns: ['segment_id'];
						isOneToOne: false;
						referencedRelation: 'segments';
						referencedColumns: ['id'];
					}
				];
			};
			accounts: {
				Row: {
					address_id: string | null;
					created_at: string | null;
					deleted_at: string | null;
					gender: Database['public']['Enums']['gender_type'];
					id: string;
					name: string;
					phone: string | null;
					profile_picture: string | null;
					status: string;
					surname: string;
					updated_at: string | null;
					user_id: string | null;
				};
				Insert: {
					address_id?: string | null;
					created_at?: string | null;
					deleted_at?: string | null;
					gender: Database['public']['Enums']['gender_type'];
					id?: string;
					name: string;
					phone?: string | null;
					profile_picture?: string | null;
					status: string;
					surname: string;
					updated_at?: string | null;
					user_id?: string | null;
				};
				Update: {
					address_id?: string | null;
					created_at?: string | null;
					deleted_at?: string | null;
					gender?: Database['public']['Enums']['gender_type'];
					id?: string;
					name?: string;
					phone?: string | null;
					profile_picture?: string | null;
					status?: string;
					surname?: string;
					updated_at?: string | null;
					user_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'accounts_address_id_fkey';
						columns: ['address_id'];
						isOneToOne: false;
						referencedRelation: 'addresses';
						referencedColumns: ['id'];
					}
				];
			};
			activities: {
				Row: {
					congress_id: string | null;
					created_at: string | null;
					deleted_at: string | null;
					description: string | null;
					end_date: string;
					id: string;
					price: number;
					room_id: string | null;
					sequence_length: string | null;
					sequential: boolean;
					start_date: string;
					title: string;
					type: Database['public']['Enums']['activity_type'];
					updated_at: string | null;
				};
				Insert: {
					congress_id?: string | null;
					created_at?: string | null;
					deleted_at?: string | null;
					description?: string | null;
					end_date: string;
					id?: string;
					price?: number;
					room_id?: string | null;
					sequence_length?: string | null;
					sequential?: boolean;
					start_date: string;
					title: string;
					type?: Database['public']['Enums']['activity_type'];
					updated_at?: string | null;
				};
				Update: {
					congress_id?: string | null;
					created_at?: string | null;
					deleted_at?: string | null;
					description?: string | null;
					end_date?: string;
					id?: string;
					price?: number;
					room_id?: string | null;
					sequence_length?: string | null;
					sequential?: boolean;
					start_date?: string;
					title?: string;
					type?: Database['public']['Enums']['activity_type'];
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'activities_congress_id_fkey';
						columns: ['congress_id'];
						isOneToOne: false;
						referencedRelation: 'congresses';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'activities_room_id_fkey';
						columns: ['room_id'];
						isOneToOne: false;
						referencedRelation: 'rooms';
						referencedColumns: ['id'];
					}
				];
			};
			addresses: {
				Row: {
					city: string;
					country: string;
					created_at: string | null;
					id: string;
					number: string | null;
					street: string;
					updated_at: string | null;
				};
				Insert: {
					city: string;
					country: string;
					created_at?: string | null;
					id?: string;
					number?: string | null;
					street: string;
					updated_at?: string | null;
				};
				Update: {
					city?: string;
					country?: string;
					created_at?: string | null;
					id?: string;
					number?: string | null;
					street?: string;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			annual_reports: {
				Row: {
					authors: string;
					created_at: string;
					description: string | null;
					id: number;
					published_at: string | null;
					title: string | null;
				};
				Insert: {
					authors?: string;
					created_at?: string;
					description?: string | null;
					id?: number;
					published_at?: string | null;
					title?: string | null;
				};
				Update: {
					authors?: string;
					created_at?: string;
					description?: string | null;
					id?: number;
					published_at?: string | null;
					title?: string | null;
				};
				Relationships: [];
			};
			buildings: {
				Row: {
					address_id: string | null;
					created_at: string | null;
					id: string;
					latitude: number | null;
					longitude: number | null;
					name: string;
					updated_at: string | null;
				};
				Insert: {
					address_id?: string | null;
					created_at?: string | null;
					id?: string;
					latitude?: number | null;
					longitude?: number | null;
					name: string;
					updated_at?: string | null;
				};
				Update: {
					address_id?: string | null;
					created_at?: string | null;
					id?: string;
					latitude?: number | null;
					longitude?: number | null;
					name?: string;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'buildings_address_id_fkey';
						columns: ['address_id'];
						isOneToOne: false;
						referencedRelation: 'addresses';
						referencedColumns: ['id'];
					}
				];
			};
			conferences: {
				Row: {
					congress_id: string | null;
					created_at: string | null;
					deleted_at: string | null;
					description: string | null;
					end_date: string | null;
					id: string;
					session: string | null;
					start_date: string | null;
					title: string;
					updated_at: string | null;
				};
				Insert: {
					congress_id?: string | null;
					created_at?: string | null;
					deleted_at?: string | null;
					description?: string | null;
					end_date?: string | null;
					id?: string;
					session?: string | null;
					start_date?: string | null;
					title: string;
					updated_at?: string | null;
				};
				Update: {
					congress_id?: string | null;
					created_at?: string | null;
					deleted_at?: string | null;
					description?: string | null;
					end_date?: string | null;
					id?: string;
					session?: string | null;
					start_date?: string | null;
					title?: string;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'conferences_congress_id_fkey';
						columns: ['congress_id'];
						isOneToOne: false;
						referencedRelation: 'congresses';
						referencedColumns: ['id'];
					}
				];
			};
			congresses: {
				Row: {
					abstract_form: boolean | null;
					accommodation_id: string | null;
					congress_type: Database['public']['Enums']['congress_type'];
					created_at: string | null;
					deleted_at: string | null;
					description: string | null;
					end_date: string;
					id: string;
					location_id: string | null;
					registration: boolean | null;
					sponsor_selection: boolean | null;
					start_date: string;
					state: number;
					title: string;
					updated_at: string | null;
				};
				Insert: {
					abstract_form?: boolean | null;
					accommodation_id?: string | null;
					congress_type: Database['public']['Enums']['congress_type'];
					created_at?: string | null;
					deleted_at?: string | null;
					description?: string | null;
					end_date: string;
					id?: string;
					location_id?: string | null;
					registration?: boolean | null;
					sponsor_selection?: boolean | null;
					start_date: string;
					state: number;
					title: string;
					updated_at?: string | null;
				};
				Update: {
					abstract_form?: boolean | null;
					accommodation_id?: string | null;
					congress_type?: Database['public']['Enums']['congress_type'];
					created_at?: string | null;
					deleted_at?: string | null;
					description?: string | null;
					end_date?: string;
					id?: string;
					location_id?: string | null;
					registration?: boolean | null;
					sponsor_selection?: boolean | null;
					start_date?: string;
					state?: number;
					title?: string;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'congresses_accommodation_id_fkey';
						columns: ['accommodation_id'];
						isOneToOne: false;
						referencedRelation: 'buildings';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'congresses_location_id_fkey';
						columns: ['location_id'];
						isOneToOne: false;
						referencedRelation: 'buildings';
						referencedColumns: ['id'];
					}
				];
			};
			inscription_activities: {
				Row: {
					activity_id: string;
					inscription_id: string;
				};
				Insert: {
					activity_id: string;
					inscription_id: string;
				};
				Update: {
					activity_id?: string;
					inscription_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'inscription_activities_activity_id_fkey';
						columns: ['activity_id'];
						isOneToOne: false;
						referencedRelation: 'activities';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'inscription_activities_inscription_id_fkey';
						columns: ['inscription_id'];
						isOneToOne: false;
						referencedRelation: 'inscriptions';
						referencedColumns: ['id'];
					}
				];
			};
			inscriptions: {
				Row: {
					account_id: string | null;
					congress_id: string | null;
					created_at: string | null;
					deleted_at: string | null;
					id: string;
					updated_at: string | null;
				};
				Insert: {
					account_id?: string | null;
					congress_id?: string | null;
					created_at?: string | null;
					deleted_at?: string | null;
					id?: string;
					updated_at?: string | null;
				};
				Update: {
					account_id?: string | null;
					congress_id?: string | null;
					created_at?: string | null;
					deleted_at?: string | null;
					id?: string;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'inscriptions_account_id_fkey';
						columns: ['account_id'];
						isOneToOne: false;
						referencedRelation: 'accounts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'inscriptions_congress_id_fkey';
						columns: ['congress_id'];
						isOneToOne: false;
						referencedRelation: 'congresses';
						referencedColumns: ['id'];
					}
				];
			};
			invoice_activities: {
				Row: {
					activity_id: string;
					invoice_id: string;
				};
				Insert: {
					activity_id: string;
					invoice_id: string;
				};
				Update: {
					activity_id?: string;
					invoice_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'invoice_activities_activity_id_fkey';
						columns: ['activity_id'];
						isOneToOne: false;
						referencedRelation: 'activities';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'invoice_activities_invoice_id_fkey';
						columns: ['invoice_id'];
						isOneToOne: false;
						referencedRelation: 'invoices';
						referencedColumns: ['id'];
					}
				];
			};
			invoices: {
				Row: {
					account_id: string | null;
					amount: number;
					caisse_id: string | null;
					created_at: string | null;
					deleted_at: string | null;
					id: string;
					inscription_id: string | null;
					paid: boolean | null;
					payment_type: Database['public']['Enums']['payment_type'];
					updated_at: string | null;
				};
				Insert: {
					account_id?: string | null;
					amount: number;
					caisse_id?: string | null;
					created_at?: string | null;
					deleted_at?: string | null;
					id?: string;
					inscription_id?: string | null;
					paid?: boolean | null;
					payment_type: Database['public']['Enums']['payment_type'];
					updated_at?: string | null;
				};
				Update: {
					account_id?: string | null;
					amount?: number;
					caisse_id?: string | null;
					created_at?: string | null;
					deleted_at?: string | null;
					id?: string;
					inscription_id?: string | null;
					paid?: boolean | null;
					payment_type?: Database['public']['Enums']['payment_type'];
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'invoices_account_id_fkey';
						columns: ['account_id'];
						isOneToOne: false;
						referencedRelation: 'accounts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'invoices_inscription_id_fkey';
						columns: ['inscription_id'];
						isOneToOne: false;
						referencedRelation: 'inscriptions';
						referencedColumns: ['id'];
					}
				];
			};
			masterclasses: {
				Row: {
					congress_id: string | null;
					created_at: string | null;
					deleted_at: string | null;
					description: string | null;
					end_date: string | null;
					id: string;
					price: number;
					room_id: string | null;
					start_date: string | null;
					title: string;
					updated_at: string | null;
				};
				Insert: {
					congress_id?: string | null;
					created_at?: string | null;
					deleted_at?: string | null;
					description?: string | null;
					end_date?: string | null;
					id?: string;
					price?: number;
					room_id?: string | null;
					start_date?: string | null;
					title: string;
					updated_at?: string | null;
				};
				Update: {
					congress_id?: string | null;
					created_at?: string | null;
					deleted_at?: string | null;
					description?: string | null;
					end_date?: string | null;
					id?: string;
					price?: number;
					room_id?: string | null;
					start_date?: string | null;
					title?: string;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'masterclasses_congress_id_fkey';
						columns: ['congress_id'];
						isOneToOne: false;
						referencedRelation: 'congresses';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'masterclasses_room_id_fkey';
						columns: ['room_id'];
						isOneToOne: false;
						referencedRelation: 'rooms';
						referencedColumns: ['id'];
					}
				];
			};
			newsletter: {
				Row: {
					created_at: string;
					email: string;
					id: number;
				};
				Insert: {
					created_at?: string;
					email: string;
					id?: number;
				};
				Update: {
					created_at?: string;
					email?: string;
					id?: number;
				};
				Relationships: [];
			};
			organizations: {
				Row: {
					address_id: string | null;
					created_at: string | null;
					id: string;
					logo: string | null;
					name: string;
					updated_at: string | null;
					website: string | null;
				};
				Insert: {
					address_id?: string | null;
					created_at?: string | null;
					id?: string;
					logo?: string | null;
					name: string;
					updated_at?: string | null;
					website?: string | null;
				};
				Update: {
					address_id?: string | null;
					created_at?: string | null;
					id?: string;
					logo?: string | null;
					name?: string;
					updated_at?: string | null;
					website?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'organizations_address_id_fkey';
						columns: ['address_id'];
						isOneToOne: false;
						referencedRelation: 'addresses';
						referencedColumns: ['id'];
					}
				];
			};
			post_likes: {
				Row: {
					created_at: string | null;
					id: number;
					post_id: string;
					user_id: string;
				};
				Insert: {
					created_at?: string | null;
					id?: number;
					post_id: string;
					user_id: string;
				};
				Update: {
					created_at?: string | null;
					id?: number;
					post_id?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'post_likes_post_id_fkey';
						columns: ['post_id'];
						isOneToOne: false;
						referencedRelation: 'posts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'post_likes_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
			posts: {
				Row: {
					call_to_action: string | null;
					call_to_action_url: string | null;
					category: string;
					created_at: string | null;
					deleted_at: string | null;
					id: string;
					image: string;
					likes_count: number | null;
					text: string;
					title: string;
				};
				Insert: {
					call_to_action?: string | null;
					call_to_action_url?: string | null;
					category?: string;
					created_at?: string | null;
					deleted_at?: string | null;
					id?: string;
					image: string;
					likes_count?: number | null;
					text: string;
					title: string;
				};
				Update: {
					call_to_action?: string | null;
					call_to_action_url?: string | null;
					category?: string;
					created_at?: string | null;
					deleted_at?: string | null;
					id?: string;
					image?: string;
					likes_count?: number | null;
					text?: string;
					title?: string;
				};
				Relationships: [];
			};
			professional_infos: {
				Row: {
					account_id: string | null;
					created_at: string | null;
					id: string;
					profession: string;
					status: string;
					updated_at: string | null;
				};
				Insert: {
					account_id?: string | null;
					created_at?: string | null;
					id?: string;
					profession: string;
					status: string;
					updated_at?: string | null;
				};
				Update: {
					account_id?: string | null;
					created_at?: string | null;
					id?: string;
					profession?: string;
					status?: string;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'professional_infos_account_id_fkey';
						columns: ['account_id'];
						isOneToOne: false;
						referencedRelation: 'accounts';
						referencedColumns: ['id'];
					}
				];
			};
			profiles: {
				Row: {
					avatar_url: string | null;
					full_name: string | null;
					id: string;
					updated_at: string | null;
					username: string | null;
					website: string | null;
				};
				Insert: {
					avatar_url?: string | null;
					full_name?: string | null;
					id: string;
					updated_at?: string | null;
					username?: string | null;
					website?: string | null;
				};
				Update: {
					avatar_url?: string | null;
					full_name?: string | null;
					id?: string;
					updated_at?: string | null;
					username?: string | null;
					website?: string | null;
				};
				Relationships: [];
			};
			rooms: {
				Row: {
					building_id: string | null;
					created_at: string | null;
					id: string;
					name: string;
					updated_at: string | null;
				};
				Insert: {
					building_id?: string | null;
					created_at?: string | null;
					id?: string;
					name: string;
					updated_at?: string | null;
				};
				Update: {
					building_id?: string | null;
					created_at?: string | null;
					id?: string;
					name?: string;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'rooms_building_id_fkey';
						columns: ['building_id'];
						isOneToOne: false;
						referencedRelation: 'buildings';
						referencedColumns: ['id'];
					}
				];
			};
			segments: {
				Row: {
					created_at: string | null;
					deleted_at: string | null;
					description: string | null;
					end_date: string | null;
					id: string;
					masterclass_id: string | null;
					start_date: string | null;
					title: string;
					updated_at: string | null;
				};
				Insert: {
					created_at?: string | null;
					deleted_at?: string | null;
					description?: string | null;
					end_date?: string | null;
					id?: string;
					masterclass_id?: string | null;
					start_date?: string | null;
					title: string;
					updated_at?: string | null;
				};
				Update: {
					created_at?: string | null;
					deleted_at?: string | null;
					description?: string | null;
					end_date?: string | null;
					id?: string;
					masterclass_id?: string | null;
					start_date?: string | null;
					title?: string;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'segments_masterclass_id_fkey';
						columns: ['masterclass_id'];
						isOneToOne: false;
						referencedRelation: 'masterclasses';
						referencedColumns: ['id'];
					}
				];
			};
			sponsors: {
				Row: {
					account_id: string | null;
					congress_id: string | null;
					created_at: string | null;
					deleted_at: string | null;
					id: string;
					organization_id: string | null;
					updated_at: string | null;
				};
				Insert: {
					account_id?: string | null;
					congress_id?: string | null;
					created_at?: string | null;
					deleted_at?: string | null;
					id?: string;
					organization_id?: string | null;
					updated_at?: string | null;
				};
				Update: {
					account_id?: string | null;
					congress_id?: string | null;
					created_at?: string | null;
					deleted_at?: string | null;
					id?: string;
					organization_id?: string | null;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'sponsors_account_id_fkey';
						columns: ['account_id'];
						isOneToOne: false;
						referencedRelation: 'accounts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'sponsors_congress_id_fkey';
						columns: ['congress_id'];
						isOneToOne: false;
						referencedRelation: 'congresses';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'sponsors_organization_id_fkey';
						columns: ['organization_id'];
						isOneToOne: false;
						referencedRelation: 'organizations';
						referencedColumns: ['id'];
					}
				];
			};
			stand: {
				Row: {
					area: number | null;
					congress_id: string;
					created_at: string | null;
					deleted_at: string | null;
					id: string;
					length: number;
					number: number;
					price: number;
					sponsor_id: string | null;
					updated_at: string | null;
					width: number;
				};
				Insert: {
					area?: number | null;
					congress_id: string;
					created_at?: string | null;
					deleted_at?: string | null;
					id?: string;
					length: number;
					number: number;
					price: number;
					sponsor_id?: string | null;
					updated_at?: string | null;
					width: number;
				};
				Update: {
					area?: number | null;
					congress_id?: string;
					created_at?: string | null;
					deleted_at?: string | null;
					id?: string;
					length?: number;
					number?: number;
					price?: number;
					sponsor_id?: string | null;
					updated_at?: string | null;
					width?: number;
				};
				Relationships: [
					{
						foreignKeyName: 'stands_congress_id_fkey';
						columns: ['congress_id'];
						isOneToOne: false;
						referencedRelation: 'congresses';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'stands_sponsor_id_fkey';
						columns: ['sponsor_id'];
						isOneToOne: false;
						referencedRelation: 'sponsors';
						referencedColumns: ['id'];
					}
				];
			};
			users: {
				Row: {
					created_at: string | null;
					deleted_at: string | null;
					email: string;
					id: string;
					password: string;
					role: Database['public']['Enums']['user_role'];
					updated_at: string | null;
				};
				Insert: {
					created_at?: string | null;
					deleted_at?: string | null;
					email: string;
					id?: string;
					password: string;
					role?: Database['public']['Enums']['user_role'];
					updated_at?: string | null;
				};
				Update: {
					created_at?: string | null;
					deleted_at?: string | null;
					email?: string;
					id?: string;
					password?: string;
					role?: Database['public']['Enums']['user_role'];
					updated_at?: string | null;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			abstract_status:
				| 'submitted'
				| 'reviewing'
				| 'approved'
				| 'rejected'
				| 'type-change'
				| 'final-version'
				| 'withdrawn';
			abstract_type: 'poster' | 'oral';
			activity_role: 'speaker' | 'moderator';
			activity_type: 'atelier' | 'wetlab' | 'cour' | 'lunch-symposium';
			conference_role: 'moderator' | 'orateur';
			congress_type: 'in-person' | 'virtual' | 'hybrid';
			gender_type: 'male' | 'female' | 'other';
			masterclass_role: 'moderator' | 'orateur';
			payment_type: 'online' | 'in-person';
			segment_role: 'moderator' | 'orateur';
			theme_type: 'science' | 'technology' | 'engineering' | 'medicine';
			user_role: 'admin' | 'basic' | 'sponsor' | 'doctor' | 'manager';
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (PublicSchema['Tables'] & PublicSchema['Views'])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
				Database[PublicTableNameOrOptions['schema']]['Views'])
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
			Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
	  }
		? R
		: never
	: PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
			PublicSchema['Views'])
	? (PublicSchema['Tables'] &
			PublicSchema['Views'])[PublicTableNameOrOptions] extends {
			Row: infer R;
	  }
		? R
		: never
	: never;

export type TablesInsert<
	PublicTableNameOrOptions extends
		| keyof PublicSchema['Tables']
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
	  }
		? I
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
	? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
			Insert: infer I;
	  }
		? I
		: never
	: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends
		| keyof PublicSchema['Tables']
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
	  }
		? U
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
	? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
			Update: infer U;
	  }
		? U
		: never
	: never;

export type Enums<
	PublicEnumNameOrOptions extends
		| keyof PublicSchema['Enums']
		| { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
		: never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
	? PublicSchema['Enums'][PublicEnumNameOrOptions]
	: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof PublicSchema['CompositeTypes']
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
	? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
	: never;
