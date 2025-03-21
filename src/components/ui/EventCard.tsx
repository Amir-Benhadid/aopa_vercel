import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useCongress } from '@/contexts/CongressContext';
import {
	formatDate,
	getCongressFolderPath,
	getCongressImage,
} from '@/lib/utils';
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
		images?: number;
	};
}

export function EventCard({ congress }: EventCardProps) {
	const { setCurrentCongressId } = useCongress();
	const [posterImage, setPosterImage] = useState<string | null>(null);
	const [imageError, setImageError] = useState<boolean>(false);
	const [fallbackTried, setFallbackTried] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const { t } = useTranslation();

	useEffect(() => {
		// Reset state when congress changes
		setPosterImage(null);
		setImageError(false);
		setFallbackTried(false);
		setIsLoading(true);

		// Try to generate a direct path first based on congress data
		const tryDirectPath = () => {
			// Convert location to a string
			let locationStr = '';
			if (congress.location) {
				if (typeof congress.location === 'object') {
					locationStr = (congress.location as any).name || '';
				} else {
					locationStr = congress.location.toString();
				}
			}

			// Get folder path
			const folderPath = getCongressFolderPath({
				start_date: congress.start_date,
				title: congress.title,
				location: locationStr,
			});

			// Ensure folderPath has a leading '/'
			const validFolderPath = folderPath
				? folderPath.startsWith('/')
					? folderPath
					: '/' + folderPath
				: null;

			if (!validFolderPath) {
				return null;
			}

			// If congress.images is a number, it indicates how many images exist
			// Return the first numbered image
			if (typeof congress.images === 'number' && congress.images > 0) {
				return `${validFolderPath}/photos/1.jpg`;
			}

			// Otherwise, try a poster file (1.pdf or 1.ppt)
			return `${validFolderPath}/1.pdf`;
		};

		// Load congress image using our utility function
		const loadImage = async () => {
			try {
				// First try a direct path approach for immediate display
				const directPath = tryDirectPath();
				if (directPath) {
					console.log(`Using direct path for ${congress.title}: ${directPath}`);
					setPosterImage(directPath);
				}

				// Then try the more sophisticated approach that may take longer
				const imagePath = await getCongressImage(congress);
				console.log(`Loaded image for ${congress.title}: ${imagePath}`);
				setPosterImage(imagePath);
			} catch (error) {
				console.error('Error loading image for EventCard:', error);
				// Fallback to congress.image or default
				if (congress.image && typeof congress.image === 'string') {
					setPosterImage(congress.image);
				} else {
					setPosterImage('/images/congress-default.jpg');
				}
			} finally {
				setIsLoading(false);
			}
		};

		loadImage();
	}, [congress]);

	// Handle image loading errors
	const handleImageError = () => {
		console.log(`Image error for ${congress.title}`);
		if (!fallbackTried) {
			if (
				congress.image &&
				typeof congress.image === 'string' &&
				posterImage !== congress.image
			) {
				console.log(`Falling back to congress.image: ${congress.image}`);
				setPosterImage(congress.image);
			} else {
				console.log('Using default image fallback');
				setPosterImage('/images/congress-default.jpg');
			}
			setFallbackTried(true);
		} else {
			console.log('Fallback already tried, setting error state');
			setImageError(true);
		}
	};

	return (
		<Card className="overflow-hidden">
			<div className="relative h-48 bg-gradient-to-r from-primary-600 to-primary-400">
				{isLoading ? (
					// Loading state
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="text-white/80 text-base animate-pulse">
							{t('common.loading')}...
						</div>
					</div>
				) : posterImage && !imageError ? (
					<div className="absolute inset-0">
						{posterImage.endsWith('.pdf') ||
						posterImage.endsWith('.pdf#page=1') ||
						posterImage.endsWith('.ppt') ? (
							<iframe
								src={posterImage.endsWith('.ppt') ? '' : posterImage}
								className="w-full h-full"
								title={`${t('congress.affiche')}: ${congress.title}`}
								onError={() => handleImageError()}
							/>
						) : (
							<Image
								key={posterImage}
								src={posterImage}
								alt={congress.title}
								fill
								className="object-cover"
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
								onError={handleImageError}
								unoptimized={true} // Skip Next.js image optimization for more reliable loading
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
							<p className="text-sm text-gray-500">
								{typeof congress.location === 'object'
									? (congress.location as any).name
									: congress.location}
							</p>
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
