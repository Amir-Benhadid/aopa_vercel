'use client';

import Image from 'next/image';
import { useState } from 'react';

interface FallbackImageProps {
	src: string;
	alt: string;
	fallbackSrc: string;
	fill?: boolean;
	className?: string;
	width?: number;
	height?: number;
}

export function FallbackImage({
	src,
	alt,
	fallbackSrc,
	fill = false,
	className = '',
	width,
	height,
}: FallbackImageProps) {
	const [imgSrc, setImgSrc] = useState(src);
	const [hasError, setHasError] = useState(false);

	const handleError = () => {
		if (!hasError) {
			console.log(`Image error for ${src}, falling back to ${fallbackSrc}`);
			setImgSrc(fallbackSrc);
			setHasError(true);
		}
	};

	return fill ? (
		<Image
			src={imgSrc}
			alt={alt}
			fill
			className={className}
			onError={handleError}
		/>
	) : (
		<Image
			src={imgSrc}
			alt={alt}
			width={width || 300}
			height={height || 200}
			className={className}
			onError={handleError}
		/>
	);
}
