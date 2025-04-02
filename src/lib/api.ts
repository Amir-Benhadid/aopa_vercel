import {
	Abstract,
	Activity,
	Building,
	Congress,
	CongressType,
} from '@/types/database';
import { processReportData } from './pdf-utils';
import { supabase } from './supabase';

// Mock data for development
const mockCongress: Congress = {
	id: '1',
	title: 'Annual European Congress of Ophthalmology 2024',
	description:
		'Join us for the largest ophthalmology congress in Europe, featuring world-renowned speakers, cutting-edge research presentations, and networking opportunities.',
	start_date: '2024-09-15',
	end_date: '2024-09-18',
	location: 'Vienna, Austria' as unknown as Building,
	congress_type: 'in-person' as CongressType,
	state: 0,
	registration_open: true,
	registration_deadline: '2024-08-15',
	abstract_submission_deadline: '2024-06-01',
	image: '/congress/2024-vienna.jpg',
};

const mockActivities: Activity[] = [
	{
		id: '1',
		title: 'Advanced Cataract Surgery Techniques',
		description:
			'A comprehensive workshop on the latest techniques in cataract surgery, including femtosecond laser-assisted procedures and premium IOL implantation.',
		start_date: '2024-07-10',
		end_date: '2024-07-10',
		congress_id: null,
		room_id: null,
		price: 0,
		type: 'wetlab',
		sequential: false,
		sequence_length: null,
		created_at: null,
		updated_at: null,
		deleted_at: null,
	},
	{
		id: '2',
		title: 'Glaucoma Research Symposium',
		description:
			'A gathering of leading researchers to discuss the latest findings in glaucoma diagnosis, treatment, and management strategies.',
		start_date: '2024-08-05',
		end_date: '2024-08-05',
		congress_id: null,
		room_id: null,
		price: 0,
		type: 'cour',
		sequential: false,
		sequence_length: null,
		created_at: null,
		updated_at: null,
		deleted_at: null,
	},
	{
		id: '3',
		title: 'Pediatric Ophthalmology Update',
		description:
			'The latest advances in pediatric eye care, including amblyopia treatment, strabismus surgery, and management of congenital eye disorders.',
		start_date: '2024-08-20',
		end_date: '2024-08-20',
		congress_id: null,
		room_id: null,
		price: 0,
		type: 'cour',
		sequential: false,
		sequence_length: null,
		created_at: null,
		updated_at: null,
		deleted_at: null,
	},
];

/**
 * Fetches the upcoming congress data
 * @returns Promise with congress data
 */
export async function getUpcomingCongress(): Promise<Congress> {
	try {
		// Fetch the active congress (state = 2) with location information
		const { data, error } = await supabase
			.from('congresses')
			.select(
				`
				*,
				location:location_id(
					id,
					name,
					address:address_id(
						street,
						number,
						city,
						country
					)
				)
			`
			)
			.eq('state', 2)
			.single();

		if (error) {
			console.error('Error fetching upcoming congress:', error);
			throw error;
		}

		if (!data) {
			console.warn('No active congress found, returning mock data');
			return mockCongress;
		}

		// Format the location string from the building and address data
		let locationString = '';
		if (data.location) {
			const building = data.location;
			const address = building.address;

			if (address) {
				locationString = `${building.name}, ${address.city}, ${address.country}`;
			} else {
				locationString = building.name;
			}
		}

		// Return the congress with the formatted location
		return {
			...data,
			location: locationString,
		} as Congress;
	} catch (error) {
		console.error('Error fetching upcoming congress:', error);
		// Return mock data as fallback to prevent UI from breaking
		return mockCongress;
	}
}

/**
 * Fetches featured activities
 * @returns Promise with an array of featured activities
 */
export async function getFeaturedActivities(): Promise<Activity[]> {
	try {
		// Get the active congress ID (state = 2)
		const { data: congressData, error: congressError } = await supabase
			.from('congresses')
			.select('id')
			.eq('state', 2)
			.single();

		if (congressError && congressError.code !== 'PGRST116') {
			console.error('Error fetching active congress:', congressError);
			throw congressError;
		}

		// Fetch activities with room and building information
		let query = supabase
			.from('activities')
			.select(
				`
				*,
				room:room_id(
					id,
					name,
					building:building_id(
						id,
						name,
						address:address_id(
							street,
							number,
							city,
							country
						)
					)
				)
			`
			)
			.order('start_date', { ascending: true })
			.limit(3); // Limit to 3 activities for the featured section

		// If we have an active congress, try to filter by it
		if (congressData) {
			// Check if congress_id column exists by attempting to filter
			try {
				query = query.eq('congress_id', congressData.id);
			} catch (e) {
				console.warn(
					'congress_id column may not exist on activities table, fetching all activities'
				);
			}
		}

		const { data, error } = await query;

		if (error) {
			console.error('Error fetching featured activities:', error);
			throw error;
		}

		if (!data || data.length === 0) {
			console.warn('No activities found, returning mock data');
			return mockActivities;
		}

		// Format the activities with proper location strings and map activity types
		return data.map((activity) => {
			let locationString = '';

			if (activity.room && activity.room.building) {
				const building = activity.room.building;
				const address = building.address;

				if (address) {
					locationString = `${activity.room.name}, ${building.name}, ${address.city}, ${address.country}`;
				} else {
					locationString = `${activity.room.name}, ${building.name}`;
				}
			}

			// Map the activity type from the database enum to the frontend enum
			let activityType: 'workshop' | 'symposium' | 'course' | 'webinar' =
				'workshop';
			switch (activity.type) {
				case 'atelier':
					activityType = 'workshop';
					break;
				case 'wetlab':
					activityType = 'workshop';
					break;
				case 'cour':
					activityType = 'course';
					break;
				case 'lunch-symposium':
					activityType = 'symposium';
					break;
				default:
					activityType = 'workshop';
			}

			return {
				...activity,
				location: locationString,
				// Format date from start_date
				date: activity.start_date,
				// Set activity type based on the mapping
				activity_type: activityType,
				// Set featured to true for the frontend
				featured: true,
				// Ensure there's an image (use a default if none exists)
				image: activity.image || `/activities/default-${activityType}.jpg`,
			} as Activity;
		});
	} catch (error) {
		console.error('Error fetching featured activities:', error);
		// Return mock data as fallback to prevent UI from breaking
		return mockActivities;
	}
}

/**
 * Fetches a specific activity by ID
 * @param id - The activity ID
 * @returns Promise with the activity data or null if not found
 */
export async function getActivityById(id: string): Promise<Activity | null> {
	try {
		// Fetch activity from Supabase with room and building information
		const { data, error } = await supabase
			.from('activities')
			.select(
				`
				*,
				room:room_id(
					id,
					name,
					building:building_id(
						id,
						name,
						address:address_id(
							street,
							number,
							city,
							country
						)
					)
				)
			`
			)
			.eq('id', id)
			.single();

		if (error) {
			console.error(`Error fetching activity with ID ${id}:`, error);
			throw error;
		}

		if (!data) {
			console.warn(`Activity with ID ${id} not found, checking mock data`);
			// Fallback to mock data if not found in database
			return mockActivities.find((a) => a.id === id) || null;
		}

		// Format the location string
		let locationString = '';
		if (data.room && data.room.building) {
			const building = data.room.building;
			const address = building.address;

			if (address) {
				locationString = `${data.room.name}, ${building.name}, ${address.city}, ${address.country}`;
			} else {
				locationString = `${data.room.name}, ${building.name}`;
			}
		}

		// Map the activity type from the database enum to the frontend enum
		let activityType: 'workshop' | 'symposium' | 'course' | 'webinar' =
			'workshop';
		switch (data.type) {
			case 'atelier':
				activityType = 'workshop';
				break;
			case 'wetlab':
				activityType = 'workshop';
				break;
			case 'cour':
				activityType = 'course';
				break;
			case 'lunch-symposium':
				activityType = 'symposium';
				break;
			default:
				activityType = 'workshop';
		}

		return {
			...data,
			location: locationString,
			// Format date from start_date
			date: data.start_date,
			// Set activity type based on the mapping
			activity_type: activityType,
			// Set featured to true for the frontend (assuming all activities shown in detail are featured)
			featured: true,
			// Ensure there's an image (use a default if none exists)
			image: data.image || `/activities/default-${activityType}.jpg`,
		} as Activity;
	} catch (error) {
		console.error(`Error fetching activity with ID ${id}:`, error);
		// Fallback to mock data
		return mockActivities.find((a) => a.id === id) || null;
	}
}

/**
 * Fetches a specific congress by ID
 * @param id - The congress ID
 * @returns Promise with the congress data or null if not found
 */
export async function getCongressById(id: string): Promise<Congress | null> {
	try {
		// Fetch congress from Supabase with location information
		const { data, error } = await supabase
			.from('congresses')
			.select(
				`
				*,
				location:location_id(
					id,
					name,
					address:address_id(
						street,
						number,
						city,
						country
					)
				)
			`
			)
			.eq('id', id)
			.single();

		if (error) {
			console.error(`Error fetching congress with ID ${id}:`, error);
			throw error;
		}

		if (!data) {
			console.warn(`Congress with ID ${id} not found, checking mock data`);
			// Fallback to mock data if not found in database
			return id === mockCongress.id ? mockCongress : null;
		}

		// Format the location string
		let locationString = '';
		if (data.location) {
			const building = data.location;
			const address = building.address;

			if (address) {
				locationString = `${building.name}, ${address.city}, ${address.country}`;
			} else {
				locationString = building.name;
			}
		}

		return {
			...data,
			location: locationString,
		} as Congress;
	} catch (error) {
		console.error(`Error fetching congress with ID ${id}:`, error);
		// Fallback to mock data
		return id === mockCongress.id ? mockCongress : null;
	}
}

/**
 * Subscribes a user to the newsletter
 * @param email - The user's email address
 * @returns Promise with success status
 */
export async function subscribeToNewsletter(
	email: string
): Promise<{ success: boolean; message: string }> {
	try {
		// Simple validation
		if (!email || !email.includes('@')) {
			return {
				success: false,
				message: 'Please provide a valid email address',
			};
		}

		// Check if email already exists
		const { data: existingSubscriber, error: checkError } = await supabase
			.from('newsletter_subscribers')
			.select('id')
			.eq('email', email)
			.single();

		if (checkError && checkError.code !== 'PGRST116') {
			// PGRST116 is "not found" which is expected
			console.error('Error checking existing subscriber:', checkError);
			throw checkError;
		}

		if (existingSubscriber) {
			return {
				success: true,
				message: 'You are already subscribed to our newsletter!',
			};
		}

		// Add email to subscribers
		const { error: insertError } = await supabase
			.from('newsletter_subscribers')
			.insert([
				{
					email,
					subscribed_at: new Date().toISOString(),
					active: true,
				},
			]);

		if (insertError) {
			console.error('Error subscribing to newsletter:', insertError);
			throw insertError;
		}

		return {
			success: true,
			message: 'Thank you for subscribing to our newsletter!',
		};
	} catch (error) {
		console.error('Error in newsletter subscription:', error);
		return {
			success: false,
			message: 'An error occurred while subscribing. Please try again later.',
		};
	}
}

export async function getAbstracts(userId: string): Promise<Abstract[]> {
	const { data: accountData, error: accountError } = await supabase
		.from('accounts')
		.select('id, name, surname, phone')
		.eq('user_id', userId)
		.single();

	if (accountError) {
		const error = new Error(
			'Please complete your profile before submitting an abstract.'
		);
		error.name = 'INCOMPLETE_PROFILE';
		throw error;
	}

	const { data, error } = await supabase
		.from('abstracts')
		.select('*')
		.eq('account_id', accountData.id)
		.order('created_at', { ascending: false });

	if (error) throw error;
	return data as Abstract[];
}

export interface AbstractSubmission {
	title: string;
	introduction: string;
	materials: string;
	results: string;
	observations: string;
	discussion: string;
	conclusion: string;
	type: 'poster' | 'oral';
	theme: string;
	co_authors: string[];
}

export async function submitAbstract(
	data: AbstractSubmission,
	congressId: string,
	userId: string,
	userEmail: string
) {
	// Then get the account info
	const { data: accountData, error: accountError } = await supabase
		.from('accounts')
		.select('id, name, surname, phone')
		.eq('user_id', userId)
		.single();

	if (accountError) {
		const error = new Error(
			'Please complete your profile before submitting an abstract.'
		);
		error.name = 'INCOMPLETE_PROFILE';
		throw error;
	}

	// Insert the abstract
	const { data: insertedAbstract, error: insertError } = await supabase
		.from('abstracts')
		.insert({
			congress_id: congressId,
			account_id: accountData.id,
			name: accountData.name,
			surname: accountData.surname,
			email: userEmail,
			phone: accountData.phone,
			title: data.title,
			introduction: data.introduction,
			materials: data.materials,
			results: data.results,
			discussion: data.discussion,
			conclusion: data.conclusion,
			co_authors: data.co_authors,
			theme: data.theme,
			type: data.type,
			status: 'submitted',
		})
		.select()
		.single();

	if (insertError) throw insertError;

	return insertedAbstract;
}

/**
 * Fetches upcoming events (activities and congresses) from Supabase
 * @returns An array of upcoming events sorted by date
 */
export async function getUpcomingEvents(): Promise<Array<Activity | Congress>> {
	try {
		const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

		// Fetch upcoming activities with location information
		const { data: activities, error: activitiesError } = await supabase
			.from('activities')
			.select(
				`
				*,
				room:room_id(
					id,
					name,
					building:building_id(
						id,
						name,
						address:address_id(
							street,
							number,
							city,
							country
						)
					)
				)
			`
			)
			.gte('start_date', today)
			.order('start_date', { ascending: true })
			.limit(5);

		if (activitiesError) {
			console.error('Error fetching upcoming activities:', activitiesError);
			throw activitiesError;
		}

		// Format activities with location information
		const formattedActivities = activities.map((activity) => {
			let locationString = '';

			if (activity.room && activity.room.building) {
				const building = activity.room.building;
				const address = building.address;

				if (address) {
					locationString = `${activity.room.name}, ${building.name}, ${address.city}, ${address.country}`;
				} else {
					locationString = `${activity.room.name}, ${building.name}`;
				}
			}

			// Map the activity type from the database enum to the frontend enum
			let activityType: 'workshop' | 'symposium' | 'course' | 'webinar' =
				'workshop';
			switch (activity.type) {
				case 'atelier':
					activityType = 'workshop';
					break;
				case 'wetlab':
					activityType = 'workshop';
					break;
				case 'cour':
					activityType = 'course';
					break;
				case 'lunch-symposium':
					activityType = 'symposium';
					break;
				default:
					activityType = 'workshop';
			}

			return {
				...activity,
				location: locationString,
				date: activity.start_date,
				activity_type: activityType,
				featured: true,
				image: activity.image || `/activities/default-${activityType}.jpg`,
				eventType: 'activity',
			};
		});

		// Fetch upcoming congresses (state = 1 for upcoming) with location information
		const { data: congresses, error: congressesError } = await supabase
			.from('congresses')
			.select(
				`
				*,
				location:location_id(
					id,
					name,
					address:address_id(
						street,
						number,
						city,
						country
					)
				)
			`
			)
			.eq('state', 1)
			.order('start_date', { ascending: true })
			.limit(5);

		if (congressesError) {
			console.error('Error fetching upcoming congresses:', congressesError);
			throw congressesError;
		}

		// Format congresses with location information
		const formattedCongresses = congresses.map((congress) => {
			let locationString = '';

			if (congress.location) {
				const building = congress.location;
				const address = building.address;

				if (address) {
					locationString = `${building.name}, ${address.city}, ${address.country}`;
				} else {
					locationString = building.name;
				}
			}

			return {
				...congress,
				location: locationString,
				date: congress.start_date,
				eventType: 'congress',
			};
		});

		// Combine and sort all events by date
		const allEvents = [...formattedActivities, ...formattedCongresses];

		// Sort by date
		allEvents.sort((a, b) => {
			const dateA = new Date(a.date);
			const dateB = new Date(b.date);
			return dateA.getTime() - dateB.getTime();
		});

		return allEvents.slice(0, 3); // Return top 3 upcoming events
	} catch (error) {
		console.error('Error in getUpcomingEvents:', error);
		return [];
	}
}

/**
 * Fetches past congresses (state = 0)
 * @returns Promise with an array of past congresses
 */
export async function getPastCongresses(): Promise<Congress[]> {
	try {
		// Fetch past congresses (state = 0) with location information
		const { data, error } = await supabase
			.from('congresses')
			.select(
				`
				*,
				location:location_id(
					id,
					name,
					address:address_id(
						street,
						number,
						city,
						country
					)
				)
			`
			)
			.neq('state', 2)
			.order('end_date', { ascending: false });

		console.log('pastCongressesData', data);

		if (error) {
			console.error('Error fetching past congresses:', error);
			throw error;
		}

		if (!data || data.length === 0) {
			console.warn('No past congresses found');
			return [];
		}

		// Format the congresses with proper location strings
		return data.map((congress) => {
			let locationString = '';

			if (congress.location) {
				const building = congress.location;
				const address = building.address;

				if (address) {
					locationString = `${building.name}, ${address.city}, ${address.country}`;
				} else {
					locationString = building.name;
				}
			}

			return {
				...congress,
				location: locationString,
			} as Congress;
		});
	} catch (error) {
		console.error('Error fetching past congresses:', error);
		return [];
	}
}

/**
 * Fetches past congresses (state = 0)
 * @returns Promise with an array of past congresses
 */
export async function getPreviousCongress(): Promise<Congress> {
	try {
		// Fetch past congresses (state = 0) with location information
		const { data, error } = await supabase
			.from('congresses')
			.select(
				`
				*,
				location:location_id(
					id,
					name,
					address:address_id(
						street,
						number,
						city,
						country
					)
				)
			`
			)
			.eq('state', 1)
			.single();

		if (error) {
			console.error('Error fetching previous congress:', error);
			throw error;
		}

		if (!data) {
			console.warn('No previous congress found');
			return mockCongress;
		}

		// Format the congress with proper location string
		let locationString = '';
		if (data.location) {
			const building = data.location;
			const address = building.address;

			if (address) {
				locationString = `${building.name}, ${address.city}, ${address.country}`;
			} else {
				locationString = building.name;
			}
		}

		// Return the formatted congress
		return {
			...data,
			location: locationString,
		};
	} catch (error) {
		console.error('Error fetching previous congress:', error);
		return mockCongress;
	}
}

/**
 * Fetches annual reports from Supabase
 * @returns Promise with an array of annual reports
 */
export async function getAnnualReports() {
	try {
		const { data, error } = await supabase
			.from('annual_reports')
			.select('*')
			.order('published_at', { ascending: false });

		if (error) {
			console.error('Error fetching annual reports:', error);
			throw error;
		}

		if (!data || data.length === 0) {
			console.warn('No annual reports found, returning mock data');
			// Return mock data if no real data exists
			return [
				{
					id: '1',
					title: 'Annual Report',
					year: 2023,
					fileSize: '4.2 MB',
					downloadUrl: '/reports/report_2023.pdf',
					file_url: '/reports/annual_report_2023.pdf',
					file_size: '4.2 MB',
					published_at: '2023-12-15',
					description:
						'Our comprehensive report covering all activities and achievements of 2023.',
					authors: 'Dr. Jane Smith, Dr. Michael Johnson',
					template: [1, 2, 3, 4],
				},
				{
					id: '2',
					title: 'Annual Report',
					year: 2022,
					fileSize: '3.8 MB',
					downloadUrl: '/reports/report_2022.pdf',
					file_url: '/reports/annual_report_2022.pdf',
					file_size: '3.8 MB',
					published_at: '2022-12-10',
					description:
						"A summary of our organization's work and impact throughout 2022.",
					authors: 'Dr. Robert Brown, Dr. Sarah Williams',
					template: [1, 2, 3, 4],
				},
				{
					id: '3',
					title: 'Annual Report',
					year: 2021,
					fileSize: '3.5 MB',
					downloadUrl: '/reports/report_2021.pdf',
					file_url: '/reports/annual_report_2021.pdf',
					file_size: '3.5 MB',
					published_at: '2021-12-05',
					description:
						'Overview of our key accomplishments and financial performance in 2021.',
					authors: 'Dr. Emily Chen, Dr. David Patel',
					template: [1, 2, 3, 4],
				},
			];
		}

		// Process each report to ensure correct data format
		return data.map((report) => processReportData(report));
	} catch (error) {
		console.error('Error fetching annual reports:', error);
		// Return mock data as fallback
		return [
			{
				id: '1',
				title: 'Annual Report',
				year: 2023,
				fileSize: '4.2 MB',
				downloadUrl: '/reports/report_2023.pdf',
				file_url: '/reports/annual_report_2023.pdf',
				file_size: '4.2 MB',
				published_at: '2023-12-15',
				description:
					'Our comprehensive report covering all activities and achievements of 2023.',
				authors: 'Dr. Jane Smith, Dr. Michael Johnson',
				template: [1, 2, 3, 4],
			},
			{
				id: '2',
				title: 'Annual Report',
				year: 2022,
				fileSize: '3.8 MB',
				downloadUrl: '/reports/report_2022.pdf',
				file_url: '/reports/annual_report_2022.pdf',
				file_size: '3.8 MB',
				published_at: '2022-12-10',
				description:
					"A summary of our organization's work and impact throughout 2022.",
				authors: 'Dr. Robert Brown, Dr. Sarah Williams',
				template: [1, 2, 3, 4],
			},
			{
				id: '3',
				title: 'Annual Report',
				year: 2021,
				fileSize: '3.5 MB',
				downloadUrl: '/reports/report_2021.pdf',
				file_url: '/reports/annual_report_2021.pdf',
				file_size: '3.5 MB',
				published_at: '2021-12-05',
				description:
					'Overview of our key accomplishments and financial performance in 2021.',
				authors: 'Dr. Emily Chen, Dr. David Patel',
				template: [1, 2, 3, 4],
			},
		];
	}
}

/**
 * Fetches activities for a specific congress
 * @param congressId - The congress ID
 * @returns Promise with an array of activities
 */
export async function getCongressActivities(
	congressId: string
): Promise<Activity[]> {
	try {
		const { data, error } = await supabase
			.from('activities')
			.select(
				`
				*,
				room:room_id(
					id,
					name,
					building:building_id(
						id,
						name,
						address:address_id(
							street,
							number,
							city,
							country
						)
					)
				)
			`
			)
			.eq('congress_id', congressId)
			.order('start_date', { ascending: true });

		if (error) {
			console.error('Error fetching congress activities:', error);
			throw error;
		}

		if (!data || data.length === 0) {
			console.warn('No activities found for congress:', congressId);
			return [];
		}

		// Format activities with proper location strings and map activity types
		return data.map((activity) => {
			let locationString = '';

			if (activity.room && activity.room.building) {
				const building = activity.room.building;
				const address = building.address;

				if (address) {
					locationString = `${activity.room.name}, ${building.name}, ${address.city}, ${address.country}`;
				} else {
					locationString = `${activity.room.name}, ${building.name}`;
				}
			}

			// Map the activity type from the database enum to the frontend enum
			let activityType: 'workshop' | 'symposium' | 'course' | 'webinar' =
				'workshop';
			switch (activity.type) {
				case 'atelier':
					activityType = 'workshop';
					break;
				case 'wetlab':
					activityType = 'workshop';
					break;
				case 'cour':
					activityType = 'course';
					break;
				case 'lunch-symposium':
					activityType = 'symposium';
					break;
				default:
					activityType = 'workshop';
			}

			return {
				...activity,
				location: locationString,
				date: activity.start_date,
				activity_type: activityType,
				featured: true,
				image: activity.image || `/activities/default-${activityType}.jpg`,
			} as Activity;
		});
	} catch (error) {
		console.error('Error fetching congress activities:', error);
		return [];
	}
}

/**
 * Fetches a single annual report by ID
 * @param id The ID of the report to fetch
 * @returns Promise with a single annual report or null if not found
 */
export async function getAnnualReportById(id: string) {
	try {
		const { data, error } = await supabase
			.from('annual_reports')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			console.error('Error fetching annual report:', error);
			throw error;
		}

		if (!data) {
			console.warn(`No annual report found with id ${id}`);
			return null;
		}

		// Process report data to ensure correct format
		return processReportData(data);
	} catch (error) {
		console.error('Error fetching annual report:', error);

		// For demo purposes, return mock data based on ID
		const mockReports = [
			{
				id: '1',
				title: 'Annual Report',
				year: 2023,
				fileSize: '4.2 MB',
				downloadUrl: '/reports/report_2023.pdf',
				file_url: '/reports/annual_report_2023.pdf',
				file_size: '4.2 MB',
				published_at: '2023-12-15',
				description:
					'Our comprehensive report covering all activities and achievements of 2023.',
				authors: 'Dr. Jane Smith, Dr. Michael Johnson',
				template: [1, 2, 3, 4],
			},
			{
				id: '2',
				title: 'Annual Report',
				year: 2022,
				fileSize: '3.8 MB',
				downloadUrl: '/reports/report_2022.pdf',
				file_url: '/reports/annual_report_2022.pdf',
				file_size: '3.8 MB',
				published_at: '2022-12-10',
				description:
					"A summary of our organization's work and impact throughout 2022.",
				authors: 'Dr. Robert Brown, Dr. Sarah Williams',
				template: [1, 2, 3, 4],
			},
			{
				id: '3',
				title: 'Annual Report',
				year: 2021,
				fileSize: '3.5 MB',
				downloadUrl: '/reports/report_2021.pdf',
				file_url: '/reports/annual_report_2021.pdf',
				file_size: '3.5 MB',
				published_at: '2021-12-05',
				description:
					'Overview of our key accomplishments and financial performance in 2021.',
				authors: 'Dr. Emily Chen, Dr. David Patel',
				template: [1, 2, 3, 4],
			},
		];

		const mockReport = mockReports.find((report) => report.id === id);
		return mockReport || null;
	}
}

export async function getCongressThemes(): Promise<string[]> {
	try {
		// Query the enum values directly using raw SQL
		const { data, error } = await supabase.rpc('get_theme_type_enum');

		if (error) {
			console.error('Error fetching theme_type enum:', error);
			throw error;
		}

		return data ?? [];
	} catch (error) {
		console.error('Fallback to default congress themes due to error:', error);
		return [
			'Cataract',
			'Glaucoma',
			'Retina',
			'Cornea',
			'Pediatric Ophthalmology',
			'Neuro-Ophthalmology',
			'Refractive Surgery',
			'Oculoplastics',
			'Uveitis',
			'Other',
		];
	}
}
