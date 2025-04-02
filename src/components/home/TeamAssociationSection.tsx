'use client';

import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
	BookOpen,
	Calendar,
	Eye,
	Globe,
	Heart,
	Lightbulb,
	Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function TeamAssociationSection() {
	const { t } = useTranslation();

	const teamMembers = [
		{
			id: '1',
			name: 'Dr. Sarah Johnson',
			role: t('team.roles.president'),
			image: '/team/member1.jpg',
		},
		{
			id: '2',
			name: 'Dr. Michael Chen',
			role: t('team.roles.vicePresident'),
			image: '/team/member2.jpg',
		},
		{
			id: '3',
			name: 'Dr. Elena Rodriguez',
			role: t('team.roles.secretary'),
			image: '/team/member3.jpg',
		},
		{
			id: '4',
			name: 'Dr. James Wilson',
			role: t('team.roles.treasurer'),
			image: '/team/member4.jpg',
		},
	];

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
	};

	const statVariants = {
		hidden: { opacity: 0, scale: 0.8 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				type: 'spring',
				stiffness: 300,
				damping: 15,
				duration: 0.5,
			},
		},
		hover: {
			scale: 1.05,
			boxShadow:
				'0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
			transition: {
				type: 'spring',
				stiffness: 400,
				damping: 10,
			},
		},
	};

	const memberVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5 },
		},
		hover: {
			y: -10,
			transition: {
				duration: 0.3,
				ease: [0.25, 0.1, 0.25, 1], // Cubic bezier for a smooth, non-bouncy transition
			},
		},
	};

	const imageVariants = {
		hidden: { scale: 0.9, opacity: 0.8 },
		visible: { scale: 1, opacity: 1 },
		hover: {
			scale: 1.05,
			transition: {
				duration: 0.3,
				ease: [0.25, 0.1, 0.25, 1], // Matching the member transition
			},
		},
	};

	return (
		<div className="space-y-12 sm:space-y-16">
			<div className="text-center">
				<motion.h2
					initial={{ opacity: 0, y: -20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
				>
					{t('home.team.title')}
				</motion.h2>
				<motion.p
					initial={{ opacity: 0, y: -10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
				>
					{t('home.team.subtitle')}
				</motion.p>
			</div>

			{/* Company Presentation */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.5 }}
				className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 mx-auto"
			>
				{/* Background pattern */}
				<div className="absolute inset-0 opacity-5">
					<svg
						className="w-full h-full"
						viewBox="0 0 100 100"
						xmlns="http://www.w3.org/2000/svg"
					>
						<defs>
							<pattern
								id="grid"
								width="10"
								height="10"
								patternUnits="userSpaceOnUse"
							>
								<path
									d="M 10 0 L 0 0 0 10"
									fill="none"
									stroke="currentColor"
									strokeWidth="0.5"
								/>
							</pattern>
						</defs>
						<rect width="100" height="100" fill="url(#grid)" />
					</svg>
				</div>

				<div className="relative p-8 sm:p-10 flex flex-col md:flex-row gap-8">
					{/* Left side - Icon and mission statement */}
					<div className="md:w-1/3 flex flex-col items-center md:items-start">
						<div className="bg-blue-500 dark:bg-blue-600 text-white p-5 rounded-full shadow-md mb-6">
							<Eye className="w-10 h-10" />
						</div>
						<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center md:text-left">
							{t('home.team.mission')}
						</h3>
						<div className="w-16 h-1 bg-blue-500 rounded mb-4"></div>
						<p className="text-blue-600 dark:text-blue-400 font-medium text-center md:text-left">
							{t('home.team.missionStatement')}
						</p>
					</div>

					{/* Right side - Main text */}
					<div className="md:w-2/3 text-justify">
						<p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
							{t('home.team.presentation')}
						</p>
						<div className="mt-6 flex flex-wrap gap-6">
							<div className="flex items-center">
								<div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full mr-3">
									<Lightbulb className="w-5 h-5 text-amber-500" />
								</div>
								<span className="font-medium">
									{t('home.team.values.innovation')}
								</span>
							</div>
							<div className="flex items-center">
								<div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
									<Globe className="w-5 h-5 text-green-500" />
								</div>
								<span className="font-medium">
									{t('home.team.values.globalReach')}
								</span>
							</div>
							<div className="flex items-center">
								<div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full mr-3">
									<Heart className="w-5 h-5 text-red-500" />
								</div>
								<span className="font-medium">
									{t('home.team.values.patientCare')}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Bottom accent bar */}
				<div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
			</motion.div>

			{/* Association Stats */}
			<motion.div
				variants={containerVariants}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
				className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
			>
				<motion.div
					variants={statVariants}
					whileHover="hover"
					className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 text-center border border-gray-100 dark:border-gray-700"
				>
					<div className="flex justify-center mb-3">
						<Globe className="h-8 w-8 text-blue-500" />
					</div>
					<div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1">
						{t('home.team.stats.countriesCount', '42')}
					</div>
					<div className="text-sm text-gray-500 dark:text-gray-400">
						{t('home.team.stats.countries')}
					</div>
				</motion.div>

				<motion.div
					variants={statVariants}
					whileHover="hover"
					className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 text-center border border-gray-100 dark:border-gray-700"
				>
					<div className="flex justify-center mb-3">
						<Users className="h-8 w-8 text-purple-500" />
					</div>
					<div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1">
						{t('home.team.stats.membersCount', '5,200+')}
					</div>
					<div className="text-sm text-gray-500 dark:text-gray-400">
						{t('home.team.stats.members')}
					</div>
				</motion.div>

				<motion.div
					variants={statVariants}
					whileHover="hover"
					className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 text-center border border-gray-100 dark:border-gray-700"
				>
					<div className="flex justify-center mb-3">
						<Calendar className="h-8 w-8 text-green-500" />
					</div>
					<div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1">
						{t('home.team.stats.yearsCount', '35')}
					</div>
					<div className="text-sm text-gray-500 dark:text-gray-400">
						{t('home.team.stats.years')}
					</div>
				</motion.div>

				<motion.div
					variants={statVariants}
					whileHover="hover"
					className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 text-center border border-gray-100 dark:border-gray-700"
				>
					<div className="flex justify-center mb-3">
						<BookOpen className="h-8 w-8 text-amber-500" />
					</div>
					<div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1">
						{t('home.team.stats.publicationsCount', '1,800+')}
					</div>
					<div className="text-sm text-gray-500 dark:text-gray-400">
						{t('home.team.stats.publications')}
					</div>
				</motion.div>
			</motion.div>

			{/* Team Members */}
			<motion.div
				variants={containerVariants}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
				className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
			>
				{teamMembers.map((member, index) => (
					<motion.div
						key={member.id}
						variants={memberVariants}
						whileHover="hover"
						custom={index}
						className="group"
					>
						<div className="relative aspect-square overflow-hidden rounded-xl mb-3">
							<motion.div variants={imageVariants} className="absolute inset-0">
								<Image
									src={member.image}
									alt={member.name}
									fill
									className="object-cover"
								/>
							</motion.div>
							<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
								<div className="text-white">
									<div className="font-medium">{member.name}</div>
									<div className="text-sm text-white/80">{member.role}</div>
								</div>
							</div>
						</div>
						<div className="text-center group-hover:opacity-0 transition-opacity duration-300">
							<div className="font-medium text-gray-900 dark:text-white">
								{member.name}
							</div>
							<div className="text-sm text-gray-500 dark:text-gray-400">
								{member.role}
							</div>
						</div>
					</motion.div>
				))}
			</motion.div>

			<div className="flex flex-col sm:flex-row justify-center gap-4">
				<Button asChild>
					<Link href="/about">{t('home.team.aboutButton')}</Link>
				</Button>
				<Button variant="outline" asChild>
					<Link href="/team">{t('home.team.teamButton')}</Link>
				</Button>
			</div>
		</div>
	);
}
