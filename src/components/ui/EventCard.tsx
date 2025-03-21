import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useCongress } from '@/contexts/CongressContext';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface EventCardProps {
	congress: {
		id: string;
		title: string;
		start_date: string;
		end_date: string;
		congress_type: 'in-person' | 'virtual' | 'hybrid';
		location?: string;
		image?: string;
	};
}

export function EventCard({ congress }: EventCardProps) {
	const { setCurrentCongressId } = useCongress();
	const [posterImage, setPosterImage] = useState<string | null>(null);
	const { t } = useTranslation();

	useEffect(() => {
		// Try to find the congress folder and check if affiche.pdf exists
		// Only attempt to get folder path if location is defined
		if (congress.location) {
			// Create folder path manually instead of using getCongressFolderPath
			const startDate = new Date(congress.start_date);
			const dateStr = startDate.toISOString().slice(0, 10).replace(/-/g, '');
			const titleFormatted = congress.title.replace(/\s+/g, '_').toLowerCase();
			const cityFormatted = congress.location
				.replace(/\s+/g, '_')
				.toLowerCase();

			const folderPath = `/previous_congresses/${dateStr}-${titleFormatted}-${cityFormatted}`;

			if (folderPath) {
				const affichePath = `${folderPath}/affiche.pdf`;

				// Check if affiche.pdf exists using our API endpoint
				fetch(
					`/api/fileExists?path=${encodeURIComponent(affichePath.slice(1))}`
				)
					.then((res) => res.json())
					.then((data) => {
						if (data.exists) {
							// If affiche.pdf exists, use it as the poster image
							// We'll use a thumbnail version or the first page
							setPosterImage(`${folderPath}/affiche.pdf#page=1`);
						} else if (congress.image) {
							// Fallback to congress.image if available
							setPosterImage(congress.image);
						}
					})
					.catch(() => {
						// If there's an error, fallback to congress.image if available
						if (congress.image) {
							setPosterImage(congress.image);
						}
					});
			}
		} else if (congress.image) {
			// If no location, fallback to congress.image if available
			setPosterImage(congress.image);
		}
	}, [congress]);

	return (
		<Card className="overflow-hidden">
			<div className="relative h-48 bg-gradient-to-r from-primary-600 to-primary-400">
				{posterImage && (
					<div className="absolute inset-0">
						{posterImage.endsWith('.pdf#page=1') ? (
							<iframe
								src={posterImage}
								className="w-full h-full"
								title={`${t('congress.affiche')}: ${congress.title}`}
							/>
						) : (
							<Image
								src={posterImage}
								alt={congress.title}
								fill
								className="object-cover"
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							/>
						)}
					</div>
				)}
			</div>
			<CardHeader>
				<div className="flex items-center gap-2">
					<span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
						{t(
							`congressTypes.${congress.congress_type}`,
							congress.congress_type
						)}
					</span>
					<span className="text-sm text-gray-500">
						{formatDate(congress.start_date)}
					</span>
				</div>
				<h3 className="text-2xl font-bold">{congress.title}</h3>
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between">
					<div className="space-y-2">
						{congress.location && (
							<p className="text-sm text-gray-500">{congress.location}</p>
						)}
					</div>
					<Button onClick={() => setCurrentCongressId(congress.id)} asChild>
						<Link href={`/archives/events/${congress.id}`}>
							{t('common.viewDetails', 'View Details')}
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
