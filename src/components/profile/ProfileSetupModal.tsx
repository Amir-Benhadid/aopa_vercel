'use client';

import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileForm } from './ProfileForm';

export function ProfileSetupModal({
	forceOpen,
	onComplete,
}: {
	forceOpen?: boolean;
	onComplete?: () => void;
}) {
	const { user } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const { t } = useTranslation();

	useEffect(() => {
		if (!user) return;

		// If forceOpen is true, we skip the localStorage check
		if (forceOpen) {
			setIsOpen(true);
			setLoading(false);
			return;
		}

		// Check if the user has already dismissed the modal in this session
		const hasSkippedSetup = localStorage.getItem('profile_setup_skipped');
		if (hasSkippedSetup === 'true') {
			setLoading(false);
			return;
		}

		const checkProfile = async () => {
			try {
				setLoading(true);
				const { data, error } = await supabase
					.from('accounts')
					.select('name, surname')
					.eq('user_id', user.id)
					.single();

				if (error) {
					console.error('Error checking profile:', error);
					// If error is 'not found', we need to show the modal
					if (error.code === 'PGRST116') {
						console.log('Profile not found, showing setup modal');
						setIsOpen(true);
					}
				} else if (!data.name || !data.surname) {
					// If profile exists but required fields are empty
					console.log('Profile incomplete, showing setup modal');
					setIsOpen(true);
				} else {
					console.log('Complete profile found, not showing modal');
				}
			} catch (error) {
				console.error('Error checking profile:', error);
			} finally {
				setLoading(false);
			}
		};

		checkProfile();
	}, [user, forceOpen]);

	const closeModal = () => {
		console.log('Closing profile setup modal');
		setIsOpen(false);
		if (onComplete) {
			console.log('Executing onComplete callback from modal');
			onComplete();
		}
	};

	const handleLater = () => {
		// Store a flag in localStorage to not show the modal again in this session
		localStorage.setItem('profile_setup_skipped', 'true');
		closeModal();
	};

	const handleProfileComplete = () => {
		console.log('Profile setup completed successfully');
		// Remove the skip flag if it exists since the profile is now set up
		localStorage.removeItem('profile_setup_skipped');
		closeModal();
	};

	if (loading || !isOpen) return null;

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-50" onClose={() => {}}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4 text-center">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
								<Dialog.Title
									as="h3"
									className="text-2xl font-bold text-gray-900 dark:text-white mb-6"
								>
									{t('profile.setup.title')}
								</Dialog.Title>

								<div className="mt-2">
									<p className="text-gray-600 dark:text-gray-300 mb-6">
										{t('profile.setup.description')}
									</p>

									<div className="mb-6 flex justify-end">
										<Button
											variant="outline"
											onClick={handleLater}
											className="text-gray-500"
										>
											{t('profile.setup.later')}
										</Button>
									</div>

									<ProfileForm
										initialData={null}
										onComplete={handleProfileComplete}
										isModal={true}
									/>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
}
