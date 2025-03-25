'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function PrivacyPage() {
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
					{t('privacy.title', 'Privacy Policy')}
				</h1>

				<div className="prose dark:prose-invert max-w-none">
					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
							{t('privacy.sections.introduction.title', 'Introduction')}
						</h2>
						<p className="text-gray-600 dark:text-gray-300">
							{t(
								'privacy.sections.introduction.content',
								"Your privacy is important to us. It is AOPA's policy to respect your privacy regarding any information we may collect from you across our website."
							)}
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
							{t('privacy.sections.collection.title', 'Information We Collect')}
						</h2>
						<p className="text-gray-600 dark:text-gray-300">
							{t(
								'privacy.sections.collection.content',
								'We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.'
							)}
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
							{t('privacy.sections.usage.title', 'Use of Information')}
						</h2>
						<p className="text-gray-600 dark:text-gray-300">
							{t(
								'privacy.sections.usage.content',
								'We use the information we collect in various ways, including to: provide, operate, and maintain our website; improve and personalize your experience; understand and analyze how you use our website; and develop new products, services, features, and functionality.'
							)}
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
							{t('privacy.sections.cookies.title', 'Cookies')}
						</h2>
						<p className="text-gray-600 dark:text-gray-300">
							{t(
								'privacy.sections.cookies.content',
								'We use cookies to understand and save your preferences for future visits and compile aggregate data about site traffic and site interaction.'
							)}
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
							{t('privacy.sections.thirdParty.title', 'Third-Party Services')}
						</h2>
						<p className="text-gray-600 dark:text-gray-300">
							{t(
								'privacy.sections.thirdParty.content',
								'We may employ third-party companies and individuals due to the following reasons: to facilitate our Service; to provide the Service on our behalf; to perform Service-related services; or to assist us in analyzing how our Service is used.'
							)}
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
							{t('privacy.sections.security.title', 'Security')}
						</h2>
						<p className="text-gray-600 dark:text-gray-300">
							{t(
								'privacy.sections.security.content',
								'We value your trust in providing us your personal information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.'
							)}
						</p>
					</section>

					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
							{t('privacy.sections.changes.title', 'Changes to This Policy')}
						</h2>
						<p className="text-gray-600 dark:text-gray-300">
							{t(
								'privacy.sections.changes.content',
								'We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. These changes are effective immediately after they are posted on this page.'
							)}
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
							{t('privacy.sections.contact.title', 'Contact Us')}
						</h2>
						<p className="text-gray-600 dark:text-gray-300">
							{t(
								'privacy.sections.contact.content',
								'If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.'
							)}
						</p>
					</section>
				</div>
			</motion.div>
		</div>
	);
}
