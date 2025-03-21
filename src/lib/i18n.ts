import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Import local JSON translation files
import enCommon from '@/lib/locales/en/common.json';
import esCommon from '@/lib/locales/es/common.json';
import frCommon from '@/lib/locales/fr/common.json';

const resources = {
	en: { common: enCommon },
	es: { common: esCommon },
	fr: { common: frCommon },
};

const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
	i18n
		.use(LanguageDetector)
		.use(initReactI18next)
		.init({
			resources,
			fallbackLng: 'en',
			debug: false,
			interpolation: {
				escapeValue: false,
			},
			react: {
				useSuspense: false,
			},
			supportedLngs: ['en', 'es', 'fr'],
			defaultNS: 'common',
			// Force synchronous initialization to ensure translations are ready on first render
			initImmediate: false,
		});
} else {
	// Minimal configuration for server-side rendering
	i18n.use(initReactI18next).init({
		resources,
		fallbackLng: 'en',
		supportedLngs: ['en', 'es', 'fr'],
		defaultNS: 'common',
		interpolation: {
			escapeValue: false,
		},
		react: {
			useSuspense: false,
		},
		initImmediate: false,
	});
}

export default i18n;
