'use client';

import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function SponsorsPage() {
	const { t } = useTranslation();

	return (
		<div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto text-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
						{t('sponsors.comingSoon.title', 'Partner Program Coming Soon')}
					</h1>
					<p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
						{t(
							'sponsors.comingSoon.description',
							'We are working on creating an amazing partnership program. Stay tuned for exciting opportunities to collaborate with us!'
						)}
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl p-8 mb-12"
				>
					<div className="max-w-md mx-auto">
						<div className="bg-white dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
							<Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
						</div>
						<h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
							{t('sponsors.comingSoon.notifyTitle', 'Get Notified')}
						</h2>
						<p className="text-gray-600 dark:text-gray-300 mb-6">
							{t(
								'sponsors.comingSoon.notifyDescription',
								'Leave your contact information and be the first to know when our partnership program launches.'
							)}
						</p>
						<Button asChild className="group">
							<Link href="/contact">
								{t('sponsors.comingSoon.contactUs', 'Contact Us')}
								<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
							</Link>
						</Button>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className="grid grid-cols-1 md:grid-cols-3 gap-8"
				>
					<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
							{t('sponsors.benefits.visibility.title', 'Enhanced Visibility')}
						</h3>
						<p className="text-gray-600 dark:text-gray-300">
							{t(
								'sponsors.benefits.visibility.description',
								'Reach a wider audience in the ophthalmology community'
							)}
						</p>
					</div>

					<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
							{t('sponsors.benefits.network.title', 'Networking')}
						</h3>
						<p className="text-gray-600 dark:text-gray-300">
							{t(
								'sponsors.benefits.network.description',
								'Connect with leading professionals in the field'
							)}
						</p>
					</div>

					<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
							{t('sponsors.benefits.growth.title', 'Growth')}
						</h3>
						<p className="text-gray-600 dark:text-gray-300">
							{t(
								'sponsors.benefits.growth.description',
								'Expand your business through strategic partnerships'
							)}
						</p>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
