/* ------------------------------------------------------------------
   1) ENUM (Type) Definitions
   ------------------------------------------------------------------ */

/**
 * From: create type user_role as enum (
 *   'admin', 'basic', 'sponsor', 'doctor', 'manager'
 * );
 */
export type UserRole = 'admin' | 'basic' | 'sponsor' | 'doctor' | 'manager';

/**
 * From: create type gender_type as enum (
 *   'male', 'female', 'other'
 * );
 */
export type GenderType = 'male' | 'female' | 'other';

/**
 * From: create type theme_type as enum (
 *   'science', 'technology', 'engineering', 'medicine'
 * );
 */
export type ThemeType = 'science' | 'technology' | 'engineering' | 'medicine';

/**
 * From: create type abstract_type as enum (
 *   'poster', 'oral'
 * );
 */
export type AbstractType = 'poster' | 'oral';

/**
 * From: create type abstract_status as enum (
 *   'submitted', 'reviewing', 'approved', 'rejected'
 * );
 */
export type AbstractStatus =
	| 'draft'
	| 'submitted'
	| 'reviewing'
	| 'approved'
	| 'rejected'
	| 'type-change'
	| 'final-version';

/**
 * From: create type congress_type as enum (
 *   'in-person', 'virtual', 'hybrid'
 * );
 */
export type CongressType = 'in-person' | 'virtual' | 'hybrid';

/**
 * From: create type activity_role as enum (
 *   'speaker', 'moderator'
 * );
 */
export type ActivityRole = 'speaker' | 'moderator';

/**
 * From: create type payment_type as enum (
 *   'online', 'in-person'
 * );
 */
export type PaymentType = 'online' | 'in-person';

/**
 * From: create type activity_type as enum (
 *   'atelier', 'wetlab', 'cour', 'lunch-symposium'
 * );
 */
export type ActivityType = 'atelier' | 'wetlab' | 'cour' | 'lunch-symposium';

/**
 * From: create type masterclass_role as enum (
 *   'moderator', 'orateur'
 * );
 */
export type MasterclassRole = 'moderator' | 'orateur';

/**
 * From: create type conference_role as enum (
 *   'moderator', 'orateur'
 * );
 */
export type ConferenceRole = 'moderator' | 'orateur';

/**
 * From: create type segment_role as enum (
 *   'moderator', 'orateur'
 * );
 */
export type SegmentRole = 'moderator' | 'orateur';

/* ------------------------------------------------------------------
   2) TABLE Interfaces
   ------------------------------------------------------------------ */

/* ---------------------------------------
   addresses
------------------------------------------ */
export interface Address {
	id: string;
	street: string;
	number: string | null;
	city: string;
	country: string;
	created_at: Date;
	updated_at: Date;
}

/* ---------------------------------------
   buildings
------------------------------------------ */
export interface Building {
	building: any;
	id: string;
	name: string;
	address?: {
		street: string;
		number: string;
		city: string;
		country: string;
	};
	latitude: number | null;
	longitude: number | null;
	created_at: Date;
	updated_at: Date;
}

/* ---------------------------------------
   rooms
------------------------------------------ */
export interface Room {
	id: string;
	name: string;
	building_id: string | null;
	created_at: Date;
	updated_at: Date;
}

/* ---------------------------------------
   users
------------------------------------------ */
export interface User {
	id: string;
	email: string;
	password: string;
	role: UserRole;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
}

/* ---------------------------------------
   accounts
------------------------------------------ */
export interface Account {
	id: string;
	user_id: string; // references users(id)
	name: string;
	surname: string;
	profile_picture: string | null;
	phone: string | null;
	address_id: string | null; // references addresses(id)
	gender: GenderType;
	status: string; // text not null
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
}

/* ---------------------------------------
   professional_infos
------------------------------------------ */
export interface ProfessionalInfo {
	id: string;
	account_id: string; // references accounts(id)
	profession: string;
	status: string;
	created_at: Date;
	updated_at: Date;
}

/* ---------------------------------------
   congresses
------------------------------------------ */
export interface Congress {
	id: string;
	title: string;
	description: string;
	start_date: string;
	end_date: string;
	location: Building;
	congress_type: CongressType;
	registration_open: boolean;
	registration_deadline: string;
	abstract_submission_deadline: string;
	image: string;
	program_file?: string;
	site_plan?: string;
	banner?: string;
	images?: string[];
	eposters?: (
		| string
		| {
				path: string;
				title: string;
				category?: string;
				authors?: string;
		  }
	)[];
	webinars?: string[];
	state: number;
	abstract_form?: boolean;
	sponsor_selection?: boolean;
	registration?: boolean;
	created_at?: string;
	updated_at?: string;
	deleted_at?: string | null;
}

/* ---------------------------------------
   reports
------------------------------------------ */
export interface Report {
	id: string;
	title: string;
	published_at: Date;
	description: string;
	introduction?: string;
	authors: string;
}

/* ---------------------------------------
   abstracts
------------------------------------------ */
export interface Abstract {
	id: string;
	account_id: string;
	congress_id: string;
	name: string;
	surname: string;
	email: string;
	phone?: string;
	co_authors?: string[];
	theme: string;
	type: 'poster' | 'oral';
	title: string;
	introduction: string;
	materials: string;
	results: string;
	discussion: string;
	conclusion: string;
	status: AbstractStatus;
	created_at: string;
	updated_at: string;
	deleted_at?: string;
}

/* ---------------------------------------
   activities
------------------------------------------ */
export interface Activity {
	id: string;
	title: string;
	description: string | null;
	start_date: string;
	end_date: string;
	congress_id: string | null;
	room_id: string | null;
	price: number;
	type: ActivityType;
	sequential: boolean;
	sequence_length: string | null;
	created_at: string | null;
	updated_at: string | null;
	deleted_at: string | null;
}

/* ---------------------------------------
   account_activities (join table)
------------------------------------------ */
export interface AccountActivity {
	account_id: string; // references accounts(id)
	activity_id: string; // references activities(id)
	role: ActivityRole;
}

/* ---------------------------------------
   masterclasses
------------------------------------------ */
export interface Masterclass {
	id: string;
	title: string;
	description: string | null;
	start_date: Date | null; // timestamps can be NULL
	end_date: Date | null;
	room_id: string | null; // references rooms(id)
	price: number;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
	room?: Room | null;
	speakers?: {
		account: {
			id: string;
			first_name: string;
			last_name: string;
			role: MasterclassRole;
		}[];
	}[];
}

/* ---------------------------------------
   account_masterclasses (join)
------------------------------------------ */
export interface AccountMasterclass {
	account_id: string; // references accounts(id)
	masterclass_id: string; // references masterclasses(id)
	role: MasterclassRole;
}

/* ---------------------------------------
   segments
------------------------------------------ */
export interface Segment {
	id: string;
	masterclass_id: string; // references masterclasses(id)
	title: string;
	description: string | null;
	start_date: Date | null;
	end_date: Date | null;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
	speakers?: {
		account: {
			id: string;
			first_name: string;
			last_name: string;
			role: SegmentRole;
		}[];
	}[];
}

/* ---------------------------------------
   account_segments (join)
------------------------------------------ */
export interface AccountSegment {
	account_id: string; // references accounts(id)
	segment_id: string; // references segments(id)
	role: SegmentRole;
}

/* ---------------------------------------
   conferences
------------------------------------------ */
export interface Conference {
	id: string;
	congress_id: string; // references congresses(id)
	title: string;
	description: string | null;
	session: string | null;
	start_date: Date | null;
	end_date: Date | null;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
}

/* ---------------------------------------
   account_conferences (join)
------------------------------------------ */
export interface AccountConference {
	account_id: string; // references accounts(id)
	conference_id: string; // references conferences(id)
	role: ConferenceRole;
}

/* ---------------------------------------
   organizations
------------------------------------------ */
export interface Organization {
	id: string;
	name: string;
	website: string | null;
	logo: string | null;
	address_id: string | null; // references addresses(id)
	created_at: Date;
	updated_at: Date;
}

/* ---------------------------------------
   sponsors
------------------------------------------ */
export interface Sponsor {
	id: string;
	name: string;
	description: string;
	logo: string;
	website: string;
	sponsorship_level: 'platinum' | 'gold' | 'silver' | 'bronze';
	congress_id: string;
}

/* ---------------------------------------
   inscriptions
------------------------------------------ */
export interface Inscription {
	id: string;
	account_id: string; // references accounts(id)
	congress_id: string; // references congresses(id)
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
}

/* ---------------------------------------
   inscription_activities (join)
------------------------------------------ */
export interface InscriptionActivity {
	inscription_id: string; // references inscriptions(id)
	activity_id: string; // references activities(id)
}

/* ---------------------------------------
   invoices
------------------------------------------ */
export interface Invoice {
	id: string;
	account_id: string; // references accounts(id)
	inscription_id: string; // references inscriptions(id)
	amount: number;
	paid: boolean;
	payment_type: PaymentType;
	caisse_id: string | null;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
}

/* ---------------------------------------
   invoice_activities (join)
------------------------------------------ */
export interface InvoiceActivity {
	invoice_id: string; // references invoices(id)
	activity_id: string; // references activities(id)
}

export interface Post {
	id: string; // UUID
	title: string;
	text: string;
	image: string; // URL to the post's image
	category: string;
	call_to_action?: string | null;
	call_to_action_url?: string | null;
	likes_count: number; // Cached number of likes
	created_at: Date;
	deleted_at: Date | null;
}

export interface PostLike {
	id: number; // Auto-incrementing primary key
	post_id: string; // UUID referencing Post
	user_id: string; // UUID referencing User
	created_at: Date;
}

export interface Stand {
	id: string;
	congress_id: string;
	sponsor_id: string | null;
	number: number;
	price: number;
	length: number;
	width: number;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
}
