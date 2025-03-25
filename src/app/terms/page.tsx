'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function TermsPage() {
	const { t } = useTranslation();

	return (
		<div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="max-w-4xl mx-auto"
			>
				<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8">
					{t('terms.title', 'Terms of Use')}
				</h1>

				<div className="prose dark:prose-invert max-w-none">
					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
							{t('terms.sections.acceptance.title', 'Acceptance of Terms')}
						</h2>
						<p className="text-gray-600 dark:text-gray-300">
							{t(
								'terms.sections.acceptance.content',
								'By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.'
							)}
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
							{t('terms.sections.use.title', 'Use License')}
						</h2>
						<p className="text-gray-600 dark:text-gray-300">
							{t(
								'terms.sections.use.content',
								"Permission is granted to temporarily download one copy of the materials (information or software) on AOPA's website for personal, non-commercial transitory viewing only."
							)}
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
							{t('terms.sections.disclaimer.title', 'Disclaimer')}
						</h2>
						<p className="text-gray-600 dark:text-gray-300">
							{t(
								'terms.sections.disclaimer.content',
								"The materials on AOPA's website are provided on an 'as is' basis. AOPA makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights."
							)}
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
							{t('terms.sections.limitations.title', 'Limitations')}
						</h2>
						<p className="text-gray-600 dark:text-gray-300">
							{t(
								'terms.sections.limitations.content',
								"In no event shall AOPA or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AOPA's website."
							)}
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
							{t('terms.sections.revisions.title', 'Revisions and Errata')}
						</h2>
						<p className="text-gray-600 dark:text-gray-300">
							{t(
								'terms.sections.revisions.content',
								"The materials appearing on AOPA's website could include technical, typographical, or photographic errors. AOPA does not warrant that any of the materials on its website are accurate, complete or current."
							)}
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
							{t('terms.sections.modifications.title', 'Modifications')}
						</h2>
						<p className="text-gray-600 dark:text-gray-300">
							{t(
								'terms.sections.modifications.content',
								'AOPA may revise these terms of use for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.'
							)}
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
							{t('terms.sections.contact.title', 'Contact Us')}
						</h2>
						<p className="text-gray-600 dark:text-gray-300">
							{t(
								'terms.sections.contact.content',
								'If you have any questions about these Terms, please contact us.'
							)}
						</p>
					</section>
				</div>
			</motion.div>
		</div>
	);
}
