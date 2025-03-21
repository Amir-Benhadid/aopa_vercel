'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { HandshakeIcon, MapIcon, UsersIcon } from 'lucide-react';
import Link from 'next/link';

export default function SponsorsPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
						Become a Sponsor
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-400">
						Join us in advancing ophthalmology and connecting with leading
						professionals
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
					<Card className="p-6 hover:shadow-lg transition-shadow">
						<div className="flex flex-col items-center text-center space-y-4">
							<div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
								<HandshakeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
							</div>
							<h3 className="text-lg font-semibold">Partnership Benefits</h3>
							<p className="text-gray-600 dark:text-gray-400">
								Discover the advantages of being a sponsor and our partnership
								opportunities
							</p>
						</div>
					</Card>

					<Card className="p-6 hover:shadow-lg transition-shadow">
						<div className="flex flex-col items-center text-center space-y-4">
							<div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
								<MapIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
							</div>
							<h3 className="text-lg font-semibold">Exhibition Space</h3>
							<p className="text-gray-600 dark:text-gray-400">
								Reserve your stand location and showcase your products and
								services
							</p>
						</div>
					</Card>

					<Card className="p-6 hover:shadow-lg transition-shadow">
						<div className="flex flex-col items-center text-center space-y-4">
							<div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
								<UsersIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
							</div>
							<h3 className="text-lg font-semibold">Group Registration</h3>
							<p className="text-gray-600 dark:text-gray-400">
								Register multiple attendees and manage group participation
							</p>
						</div>
					</Card>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Link href="/sponsors/benefits" className="block">
						<Button className="w-full" variant="outline">
							View Benefits
						</Button>
					</Link>

					<Link href="/sponsors/stands" className="block">
						<Button className="w-full" variant="outline">
							Reserve Stands
						</Button>
					</Link>

					<Link href="/sponsors/registration" className="block">
						<Button className="w-full" variant="outline">
							Group Registration
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
