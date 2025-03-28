import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useContentAccess } from '@/hooks/useContentAccess';
import { useAuth } from '@/providers/AuthProvider';
import { AlertTriangle, Lock, LogIn } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface ProtectedContentProps {
	children: ReactNode;
	congressId?: string;
	title?: string;
	contentType?: 'eposter' | 'webinar' | 'general';
}

export function ProtectedContent({
	children,
	congressId,
	title = 'Protected content',
	contentType = 'general',
}: ProtectedContentProps) {
	const { t } = useTranslation();
	const { isAuthenticated } = useAuth();
	const { hasAccess, isLoading, error } = useContentAccess({ congressId });

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-12 min-h-[200px]">
				<LoadingSpinner />
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 text-center">
				<AlertTriangle className="w-12 h-12 mx-auto text-red-600 dark:text-red-400 mb-4" />
				<h3 className="text-xl font-medium text-red-700 dark:text-red-300 mb-2">
					{t('common.error')}
				</h3>
				<p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
			</div>
		);
	}

	if (!hasAccess) {
		return (
			<div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
				<Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
				<h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
					{t('content.restricted', 'Restricted content')}
				</h3>

				{!isAuthenticated ? (
					<div>
						<p className="text-gray-500 dark:text-gray-400 mb-6">
							{t(
								'content.loginToAccess',
								'You need to login to access this content'
							)}
						</p>
						<Button asChild>
							<Link href="/auth">
								<LogIn className="w-4 h-4 mr-2" />
								{t('auth.signIn', 'Sign in')}
							</Link>
						</Button>
					</div>
				) : (
					<div>
						<p className="text-gray-500 dark:text-gray-400 mb-6">
							{t(
								'content.accessRequirements',
								'To access this content, you need one of the following:'
							)}
						</p>
						<ul className="space-y-2 text-left mx-auto max-w-md mb-6">
							<li className="flex items-center text-gray-600 dark:text-gray-300">
								<div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mr-3">
									<span className="text-blue-600 dark:text-blue-400">1</span>
								</div>
								{t('content.adminRole', 'Have an admin role')}
							</li>
							<li className="flex items-center text-gray-600 dark:text-gray-300">
								<div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mr-3">
									<span className="text-blue-600 dark:text-blue-400">2</span>
								</div>
								{t('content.activeCotisation', 'Have an active cotisation')}
							</li>
							{congressId && (
								<li className="flex items-center text-gray-600 dark:text-gray-300">
									<div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mr-3">
										<span className="text-blue-600 dark:text-blue-400">3</span>
									</div>
									{contentType === 'general'
										? t(
												'content.paidRegistration',
												'Have a paid registration for this event'
										  )
										: contentType === 'eposter'
										? t(
												'content.paidRegistrationEposter',
												'Have a paid registration for this event to view its e-posters'
										  )
										: t(
												'content.paidRegistrationWebinar',
												'Have a paid registration for this event to view its webinars'
										  )}
								</li>
							)}
							{!congressId && (
								<li className="flex items-center text-gray-600 dark:text-gray-300">
									<div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mr-3">
										<span className="text-blue-600 dark:text-blue-400">3</span>
									</div>
									{t(
										'content.paidRegistrationAny',
										'Have a paid registration for any event'
									)}
								</li>
							)}
						</ul>
					</div>
				)}
			</div>
		);
	}

	return <div>{children}</div>;
}
