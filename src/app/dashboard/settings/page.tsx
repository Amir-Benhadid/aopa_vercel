'use client';

import { useAuth } from '@/providers/AuthProvider';
import { motion } from 'framer-motion';
import { Bell, Globe, Loader2, Moon, Save, Sun } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export default function SettingsPage() {
	const { t, i18n } = useTranslation();
	const { isAuthenticated } = useAuth();
	const [loading, setLoading] = useState(false);
	const [settings, setSettings] = useState({
		language: i18n.language || 'en',
		theme:
			(typeof window !== 'undefined' && window.localStorage.getItem('theme')) ||
			'light',
		notifications: {
			email: true,
			browser: true,
			mobile: false,
		},
	});

	// Handle theme change
	const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
		setSettings((prev) => ({ ...prev, theme }));

		if (theme === 'system') {
			const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
				.matches
				? 'dark'
				: 'light';
			document.documentElement.classList.toggle('dark', systemTheme === 'dark');
			localStorage.removeItem('theme');
		} else {
			document.documentElement.classList.toggle('dark', theme === 'dark');
			localStorage.setItem('theme', theme);
		}
	};

	// Handle language change
	const handleLanguageChange = (language: string) => {
		setSettings((prev) => ({ ...prev, language }));
		i18n.changeLanguage(language);
		localStorage.setItem('i18nextLng', language);
	};

	// Handle notification toggle
	const handleNotificationToggle = (type: 'email' | 'browser' | 'mobile') => {
		setSettings((prev) => ({
			...prev,
			notifications: {
				...prev.notifications,
				[type]: !prev.notifications[type],
			},
		}));
	};

	// Handle settings save
	const handleSaveSettings = () => {
		setLoading(true);

		// Simulate API call
		setTimeout(() => {
			setLoading(false);
			toast.success('Settings saved successfully');
		}, 1000);
	};

	return (
		<>
			<div className="mb-8">
				<h1 className="text-2xl font-bold">
					{t('dashboard.settings.title') || 'Settings'}
				</h1>
				<p className="text-gray-600 dark:text-gray-400 mt-1">
					{t('dashboard.settings.description') ||
						'Manage your application settings and preferences'}
				</p>
			</div>

			<div className="space-y-8">
				{/* Appearance Settings */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
				>
					<div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
						<h2 className="font-semibold">
							{t('dashboard.settings.appearance') || 'Appearance'}
						</h2>
					</div>

					<div className="p-6 space-y-6">
						{/* Theme Selection */}
						<div>
							<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
								{t('dashboard.settings.theme') || 'Theme'}
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<button
									onClick={() => handleThemeChange('light')}
									className={`flex items-center p-3 rounded-lg border ${
										settings.theme === 'light'
											? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
											: 'border-gray-200 dark:border-gray-700'
									}`}
								>
									<Sun className="h-5 w-5 mr-2 text-amber-500" />
									<span>{t('dashboard.settings.lightTheme') || 'Light'}</span>
								</button>

								<button
									onClick={() => handleThemeChange('dark')}
									className={`flex items-center p-3 rounded-lg border ${
										settings.theme === 'dark'
											? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
											: 'border-gray-200 dark:border-gray-700'
									}`}
								>
									<Moon className="h-5 w-5 mr-2 text-indigo-500" />
									<span>{t('dashboard.settings.darkTheme') || 'Dark'}</span>
								</button>

								<button
									onClick={() => handleThemeChange('system')}
									className={`flex items-center p-3 rounded-lg border ${
										settings.theme === 'system'
											? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
											: 'border-gray-200 dark:border-gray-700'
									}`}
								>
									<svg
										className="h-5 w-5 mr-2 text-gray-500"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<path
											d="M14 15v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									<span>{t('dashboard.settings.systemTheme') || 'System'}</span>
								</button>
							</div>
						</div>

						{/* Language Selection */}
						<div>
							<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
								{t('dashboard.settings.language') || 'Language'}
							</h3>
							<div className="flex items-center space-x-2">
								<Globe className="h-5 w-5 text-gray-500" />
								<select
									value={settings.language}
									onChange={(e) => handleLanguageChange(e.target.value)}
									className="block w-full max-w-xs rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="en">English</option>
									<option value="es">Español</option>
									<option value="fr">Français</option>
								</select>
							</div>
						</div>
					</div>
				</motion.div>

				{/* Notification Settings */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.1 }}
					className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
				>
					<div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
						<h2 className="font-semibold">
							{t('dashboard.settings.notifications') || 'Notifications'}
						</h2>
					</div>

					<div className="p-6 space-y-6">
						<div className="flex items-center mb-2">
							<Bell className="h-5 w-5 text-gray-500 mr-2" />
							<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
								{t('dashboard.settings.notificationChannels') ||
									'Notification Channels'}
							</h3>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
										{t('dashboard.settings.emailNotifications') ||
											'Email Notifications'}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										{t('dashboard.settings.emailNotificationsDesc') ||
											'Receive notifications via email'}
									</p>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										className="sr-only peer"
										checked={settings.notifications.email}
										onChange={() => handleNotificationToggle('email')}
									/>
									<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
								</label>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
										{t('dashboard.settings.browserNotifications') ||
											'Browser Notifications'}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										{t('dashboard.settings.browserNotificationsDesc') ||
											'Show notifications in your browser'}
									</p>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										className="sr-only peer"
										checked={settings.notifications.browser}
										onChange={() => handleNotificationToggle('browser')}
									/>
									<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
								</label>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
										{t('dashboard.settings.mobileNotifications') ||
											'Mobile Notifications'}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										{t('dashboard.settings.mobileNotificationsDesc') ||
											'Receive notifications on your mobile device'}
									</p>
								</div>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										className="sr-only peer"
										checked={settings.notifications.mobile}
										onChange={() => handleNotificationToggle('mobile')}
									/>
									<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
								</label>
							</div>
						</div>
					</div>
				</motion.div>

				{/* Save Button */}
				<div className="flex justify-end">
					<button
						onClick={handleSaveSettings}
						disabled={loading}
						className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
					>
						{loading ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
								{t('dashboard.settings.saving') || 'Saving...'}
							</>
						) : (
							<>
								<Save className="h-4 w-4 mr-2" />
								{t('dashboard.settings.saveChanges') || 'Save Changes'}
							</>
						)}
					</button>
				</div>
			</div>
		</>
	);
}
