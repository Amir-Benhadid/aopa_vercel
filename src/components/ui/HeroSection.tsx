'use client';

import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export function HeroSection() {
	const { t } = useTranslation();

	return (
		<section className="relative h-screen overflow-hidden">
			<div className="absolute inset-0">
				<Image
					src="/hero-background.svg"
					alt={t('home.hero.backgroundAlt')}
					layout="fill"
					objectFit="cover"
					className="opacity-50"
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-blue-500/30 to-blue-900/50 backdrop-blur-sm" />
			</div>

			<div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
				<div>
					<h1 className="text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 drop-shadow-lg">
						{t('home.hero.title')}
					</h1>
				</div>

				<div>
					<p className="mt-6 text-xl text-white/90 text-center max-w-2xl">
						{t('home.hero.subtitle')}
					</p>
				</div>

				<button className="mt-8 px-8 py-3 bg-white text-blue-900 rounded-full font-semibold">
					{t('home.hero.getStarted')}
				</button>

				<div className="absolute bottom-8">
					<div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-2">
						<div className="w-1 h-1 bg-white rounded-full" />
					</div>
				</div>
			</div>
		</section>
	);
}
