'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { Organization } from '@/types/database';
import { ArrowLeft, Building2, Globe, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function BenefitsPage() {
	const [sponsors, setSponsors] = useState<
		(Organization & { sponsor_count: number })[]
	>([]);

	useEffect(() => {
		async function fetchSponsors() {
			const { data, error } = await supabase
				.from('organizations')
				.select(
					`
          *,
          sponsor_count:sponsors(count)
        `
				)
				.order('name');

			if (!error && data) {
				setSponsors(data);
			}
		}

		fetchSponsors();
	}, []);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<div className="mb-8">
					<Button asChild variant="ghost" className="p-2">
						<Link href="/sponsors">
							<ArrowLeft className="w-5 h-5 mr-2" />
							Back to Sponsors
						</Link>
					</Button>
				</div>

				{/* Thank You Section */}
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
						Our Valued Sponsors
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-400">
						Thank you for supporting ophthalmology advancement and education
					</p>
				</div>

				{/* Benefits Overview */}
				<Card className="p-8 mb-12 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
						Sponsorship Benefits
					</h2>
					<div className="space-y-4 text-gray-700 dark:text-gray-300">
						<p>
							As a valued sponsor, your organization receives the following
							benefits:
						</p>
						<ul className="list-disc list-inside space-y-2 ml-4">
							<li>Premium exhibition space (24m²)</li>
							<li>Logo placement on conference materials</li>
							<li>Access to networking events</li>
							<li>Company profile in conference program</li>
							<li>5 complimentary conference registrations</li>
							<li>Priority booking for future events</li>
						</ul>
					</div>
				</Card>

				{/* Sponsors List */}
				<div className="space-y-6">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
						Current Sponsors
					</h2>
					<div className="grid gap-6">
						{sponsors.map((org) => (
							<Card key={org.id} className="p-6 hover:shadow-lg transition-all">
								<div className="flex items-start gap-6">
									{org.logo ? (
										<img
											src={org.logo}
											alt={`${org.name} logo`}
											className="w-24 h-24 object-contain rounded-lg"
										/>
									) : (
										<div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
											<Building2 className="w-12 h-12 text-gray-400" />
										</div>
									)}
									<div className="flex-1">
										<h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
											{org.name}
										</h3>
										<div className="mt-2 space-y-2 text-gray-600 dark:text-gray-400">
											{org.website && (
												<div className="flex items-center gap-2">
													<Globe className="w-4 h-4" />
													<a
														href={org.website}
														target="_blank"
														rel="noopener noreferrer"
														className="hover:text-blue-600 dark:hover:text-blue-400"
													>
														{org.website}
													</a>
												</div>
											)}
											{org.address_id && (
												<div className="flex items-center gap-2">
													<MapPin className="w-4 h-4" />
													<span>Address available</span>
												</div>
											)}
										</div>
									</div>
									<div className="text-sm text-gray-500 dark:text-gray-400">
										Sponsor since {new Date(org.created_at).getFullYear()}
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>

				{/* Call to Action */}
				<div className="mt-12 text-center">
					<p className="text-gray-600 dark:text-gray-400 mb-4">
						Ready to showcase your products and services?
					</p>
					<div className="flex gap-4 justify-center">
						<Button asChild variant="outline">
							<Link href="/sponsors/stands">View Available Stands</Link>
						</Button>
						<Button asChild>
							<Link href="/sponsors/registration">Register Group</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
