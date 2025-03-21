'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/lib/supabase';
import { Congress, Stand } from '@/types/database';
import { ArrowLeft, Check, MapPin, Ruler, SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function StandsPage() {
	const [selectedStands, setSelectedStands] = useState<string[]>([]);
	const [stands, setStands] = useState<Stand[]>([]);
	const [congress, setCongress] = useState<Congress | null>(null);
	const [totalPrice, setTotalPrice] = useState(0);
	const [searchQuery, setSearchQuery] = useState('');
	const [sizeFilter, setSizeFilter] = useState<
		'all' | 'small' | 'medium' | 'large'
	>('all');
	const [statusFilter, setStatusFilter] = useState<
		'all' | 'available' | 'reserved'
	>('all');
	const debouncedSearchQuery = useDebounce(searchQuery, 300);

	// Fetch data with filters
	useEffect(() => {
		async function fetchData() {
			try {
				// Fetch active congress
				const { data: congressData, error: congressError } = await supabase
					.from('congresses')
					.select(
						`
						*,
						location:buildings!location_id (
							*,
							addresses (
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

				if (congressError) throw congressError;
				setCongress(congressData);

				// Fetch stands with filters
				let query = supabase
					.from('stand')
					.select('*')
					.eq('congress_id', congressData.id)
					.is('deleted_at', null);

				// Apply search filter
				if (debouncedSearchQuery) {
					query = query.ilike('number', `%${debouncedSearchQuery}%`);
				}

				// Apply size filter
				if (sizeFilter !== 'all') {
					const sizeRanges = {
						small: [0, 24],
						medium: [24, 36],
						large: [36, Infinity],
					};
					const [min, max] = sizeRanges[sizeFilter];

					// Use a raw SQL filter to calculate area on the fly
					query = query.filter('length * width', 'gte', min);
					if (max !== Infinity) {
						query = query.filter('length * width', 'lt', max);
					}
				}

				// Apply status filter

				if (statusFilter !== 'all') {
					if (statusFilter === 'available') {
						query = query.is('sponsor_id', null);
					} else if (statusFilter === 'reserved') {
						query = query.not('sponsor_id', 'is', null);
					}
				}

				const { data: standsData, error: standsError } = await query.order(
					'number',
					{ ascending: true }
				);

				if (standsError) throw standsError;
				setStands(standsData || []);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		}

		fetchData();
	}, [debouncedSearchQuery, sizeFilter, statusFilter]);

	// Update total price when selection changes
	useEffect(() => {
		const newTotal = stands
			.filter((stand) => selectedStands.includes(stand.id))
			.reduce((sum, stand) => sum + stand.price, 0);
		setTotalPrice(newTotal);
	}, [selectedStands, stands]);

	const handleStandSelection = (stand: Stand) => {
		if (stand.sponsor_id) return; // Cannot select reserved stands
		setSelectedStands((prev) =>
			prev.includes(stand.id)
				? prev.filter((id) => id !== stand.id)
				: [...prev, stand.id]
		);
	};

	const handleReservation = async () => {
		// TODO: Implement stand reservation logic
		console.log('Selected stands:', selectedStands);
	};

	// Calculate stand size category
	const getStandSize = (length: number, width: number) => {
		const area = length * width;
		if (area >= 36) return 'Large';
		if (area >= 24) return 'Medium';
		return 'Small';
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-6xl mx-auto">
				<div className="mb-8">
					<Button asChild variant="ghost" className="p-2">
						<Link href="/sponsors">
							<ArrowLeft className="w-5 h-5 mr-2" />
							Back to Sponsors
						</Link>
					</Button>
				</div>

				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
						Exhibition Stands
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-400">
						Select your preferred exhibition space
					</p>
				</div>

				{/* Congress Building Info */}
				{congress?.location && (
					<Card className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
						<div className="flex items-start gap-4">
							<MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
							<div>
								<h2 className="text-xl font-semibold mb-2">
									{typeof congress.location === 'string'
										? congress.location
										: congress.location.name}
								</h2>
								{typeof congress.location !== 'string' &&
									congress.location.address && (
										<p className="text-gray-600 dark:text-gray-400">
											{congress.location.address.street}{' '}
											{congress.location.address.number},{' '}
											{congress.location.address.city}
										</p>
									)}
							</div>
						</div>
					</Card>
				)}

				{/* Search and Filters */}
				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8">
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1 relative">
							<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<Input
								placeholder="Search by stand number..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
						<div className="flex items-center gap-2">
							<Select
								value={sizeFilter}
								onValueChange={(value) => setSizeFilter(value as any)}
								options={[
									{ value: 'all', label: 'All Sizes' },
									{ value: 'small', label: 'Small' },
									{ value: 'medium', label: 'Medium' },
									{ value: 'large', label: 'Large' },
								]}
							/>

							<Select
								value={statusFilter}
								onValueChange={(value) => setStatusFilter(value as any)}
								options={[
									{ value: 'all', label: 'All Statuses' },
									{ value: 'available', label: 'Available' },
									{ value: 'reserved', label: 'Reserved' },
								]}
							/>
						</div>
					</div>
					<div className="mt-2 text-sm text-gray-500">
						{stands.length} stands found
					</div>
				</div>

				{/* Stands Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{stands.map((stand) => (
						<Card
							key={stand.id}
							className={`relative p-6 cursor-pointer transition-all ${
								selectedStands.includes(stand.id)
									? 'ring-2 ring-primary'
									: stand.sponsor_id
									? 'opacity-60'
									: 'hover:shadow-lg'
							}`}
							onClick={() => handleStandSelection(stand)}
						>
							{/* Selection indicator */}
							{selectedStands.includes(stand.id) && (
								<div className="absolute top-2 right-2">
									<Check className="w-5 h-5 text-primary" />
								</div>
							)}

							{/* Stand status indicator */}
							<div
								className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
									stand.sponsor_id
										? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
										: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
								}`}
							>
								{stand.sponsor_id ? 'Reserved' : 'Available'}
							</div>

							<div className="space-y-4 mt-6">
								{/* Stand number and size */}
								<div className="flex justify-between items-center">
									<h3 className="text-2xl font-bold">Stand #{stand.number}</h3>
									<span className="text-sm font-medium px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
										{getStandSize(stand.length, stand.width)}
									</span>
								</div>

								{/* Dimensions */}
								<div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
									<Ruler className="w-4 h-4" />
									<span>
										{stand.length}m × {stand.width}m (
										{stand.length * stand.width} m²)
									</span>
								</div>

								{/* Price */}
								<div className="text-xl font-semibold text-primary">
									€{stand.price.toLocaleString()}
								</div>

								{/* Stand visualization */}
								<div className="relative mt-4">
									<div
										className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
										style={{
											aspectRatio: `${stand.length}/${stand.width}`,
										}}
									>
										<div className="absolute inset-0 flex items-center justify-center">
											<div className="text-center">
												<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
													Stand #{stand.number}
												</div>
												<div className="text-xs text-gray-500 dark:text-gray-400">
													{stand.length}m × {stand.width}m
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</Card>
					))}
				</div>

				{/* Summary and Action Buttons */}
				<div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
					<div className="text-lg">
						<span className="text-gray-600 dark:text-gray-400">Selected: </span>
						<span className="font-semibold">
							{selectedStands.length} stands
						</span>
						<span className="mx-2">•</span>
						<span className="text-gray-600 dark:text-gray-400">Total: </span>
						<span className="font-semibold text-primary">
							€{totalPrice.toLocaleString()}
						</span>
					</div>
					<div className="flex gap-4">
						<Button
							variant="outline"
							onClick={() => setSelectedStands([])}
							disabled={selectedStands.length === 0}
						>
							Clear Selection
						</Button>
						<Button
							onClick={handleReservation}
							disabled={selectedStands.length === 0}
						>
							Reserve Selected Stands
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
