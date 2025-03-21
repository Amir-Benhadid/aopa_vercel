import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useCongress } from '@/contexts/CongressContext';
import { formatDate, getCongressImage } from '@/lib/utils';
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
	const [imageError, setImageError] = useState<boolean>(false);
	const { t } = useTranslation();

	useEffect(() => {
		// Load congress image using our utility function
		const loadImage = async () => {
			try {
				// Get the best available image for this congress
				const imagePath = await getCongressImage(congress);
				setPosterImage(imagePath);
			} catch (error) {
				console.error('Error loading image for EventCard:', error);
				// Fallback to default or congress.image
				if (congress.image) {
					setPosterImage(congress.image);
				} else {
					setPosterImage('/images/congress-default.jpg');
				}
			}
		};

		loadImage();
	}, [congress]);

	// Handle image loading errors
	const handleImageError = () => {
		setImageError(true);
		// Fall back to a default image or placeholder
		if (congress.image && posterImage !== congress.image) {
			setPosterImage(congress.image);
		} else {
			// If congress.image is already failing or not available, use a placeholder
			setPosterImage('/images/congress-default.jpg');
		}
	};

	return (
		<Card className="overflow-hidden">
			<div className="relative h-48 bg-gradient-to-r from-primary-600 to-primary-400">
				{posterImage && !imageError ? (
					<div className="absolute inset-0">
						{posterImage.endsWith('.pdf#page=1') ? (
							<iframe
								src={posterImage}
								className="w-full h-full"
								title={`${t('congress.affiche')}: ${congress.title}`}
								onError={() => handleImageError()}
							/>
						) : (
							<Image
								src={posterImage}
								alt={congress.title}
								fill
								className="object-cover"
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
								onError={handleImageError}
							/>
						)}
					</div>
				) : (
					// Placeholder when no image is available or there's an error
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="text-white/80 text-lg font-medium">
							{congress.title}
						</div>
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
