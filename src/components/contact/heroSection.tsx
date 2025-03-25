import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
	const { t } = useTranslation();
	const { scrollY } = useScroll();

	const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
	const contentOpacity = useTransform(scrollY, [0, 300], [1, 0.5]);
	const contentY = useTransform(scrollY, [0, 300], [0, 50]);
	return (
		<section className="relative h-[50vh] min-h-[400px] flex items-end overflow-hidden w-full pb-12">
			{/* Parallax Background */}
			<motion.div className="absolute inset-0 z-0" style={{ y: backgroundY }}>
				<Image
					src="/images/hero-background.jpg"
					alt="Contact us background"
					fill
					className="object-cover object-center"
					priority
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/80 mix-blend-multiply" />
			</motion.div>

			{/* Background Elements */}
			<div className="absolute inset-0 z-0">
				<motion.div
					className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-600/20 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						repeatType: 'reverse',
					}}
				/>
				<motion.div
					className="absolute bottom-1/3 left-1/4 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl"
					animate={{
						scale: [1, 1.1, 1],
						opacity: [0.2, 0.4, 0.2],
					}}
					transition={{
						duration: 10,
						repeat: Infinity,
						repeatType: 'reverse',
						delay: 1,
					}}
				/>
			</div>

			{/* Hero Content */}
			<div className="w-full px-8 sm:px-12 lg:px-16 relative z-10">
				<motion.div
					className="max-w-3xl mx-auto text-center"
					style={{
						opacity: contentOpacity,
						y: contentY,
					}}
				>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="inline-block px-4 py-1.5 mb-4 sm:mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
					>
						<span className="text-sm sm:text-base font-medium text-white">
							{t('contact.tagline') || 'Get in Touch'}
						</span>
					</motion.div>

					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6"
					>
						{t('contact.title') || 'Contact Us'}
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto"
					>
						{t('contact.subtitle') ||
							"Have questions or want to get in touch? We'd love to hear from you."}
					</motion.p>
				</motion.div>
			</div>
		</section>
	);
}
