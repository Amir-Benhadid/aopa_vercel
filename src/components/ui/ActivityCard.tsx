'use client';

import { formatDate } from '@/lib/utils';
import { Activity } from '@/types/database';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface ActivityCardProps {
	activity: Pick<
		Activity,
		| 'id'
		| 'title'
		| 'description'
		| 'start_date'
		| 'end_date'
		| 'type'
		| 'price'
	> & {
		speakers?: {
			account: {
				id: string;
				name: string;
				surname: string;
			};
		}[];
	};
}

export function ActivityCard({ activity }: ActivityCardProps) {
	const { t } = useTranslation();

	return (
		<div className="group">
			<Link
				href={`/activities/${activity.id}`}
				className="block relative overflow-hidden rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
			>
				<div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100" />

				<div className="p-6">
					<div className="flex justify-between items-start gap-4">
						<div>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
								{activity.title}
							</h3>
							<p className="mt-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
								{activity.description}
							</p>
						</div>
						<span className="inline-flex items-center rounded-full bg-primary-50 dark:bg-primary-900/50 px-3 py-1 text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-800/50 transition-colors">
							{t(`activityTypes.${activity.type}`, activity.type)}
						</span>
					</div>

					<div className="mt-6 flex items-center gap-6">
						<div>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								{t('congress.date', 'Date & Time')}
							</p>
							<p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
								{formatDate(activity.start_date)}
							</p>
						</div>
						<div>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								{t('activities.price', 'Price')}
							</p>
							<p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
								${activity.price}
							</p>
						</div>
					</div>

					{activity.speakers && activity.speakers.length > 0 && (
						<div className="mt-6">
							<p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
								{t('activities.speakers', 'Speakers')}
							</p>
							<div className="flex flex-wrap gap-2">
								{activity.speakers.map((speaker) => (
									<span
										key={speaker.account.id}
										className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-sm text-gray-700 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors"
									>
										{speaker.account.name} {speaker.account.surname}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			</Link>
		</div>
	);
}
