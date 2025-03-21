'use client';

import { ChevronDown, Globe } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';

const languages = [
	{ code: 'en', nameKey: 'languages.english', name: 'English' },
	{ code: 'es', nameKey: 'languages.spanish', name: 'Español' },
	{ code: 'fr', nameKey: 'languages.french', name: 'Français' },
];

export function LanguageSwitcher() {
	const { i18n, t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);

	const currentLanguage =
		languages.find((lang) => lang.code === i18n.language) || languages[0];

	const changeLanguage = (code: string) => {
		i18n.changeLanguage(code);
		setIsOpen(false);
	};

	return (
		<div className="relative">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-1 text-sm"
				aria-label={t('common.changeLanguage', 'Change language')}
			>
				<Globe className="w-4 h-4" />
				<span>{t(currentLanguage.nameKey, currentLanguage.name)}</span>
				<ChevronDown className="w-3 h-3 ml-1" />
			</Button>

			{isOpen && (
				<div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
					<div className="py-1">
						{languages.map((language) => (
							<button
								key={language.code}
								onClick={() => changeLanguage(language.code)}
								className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
									language.code === i18n.language
										? 'bg-gray-100 dark:bg-gray-700 font-medium'
										: ''
								}`}
							>
								{t(language.nameKey, language.name)}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
