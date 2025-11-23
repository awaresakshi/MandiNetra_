import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from './locales/en/common.json';
import hiCommon from './locales/hi/common.json';
import mrCommon from './locales/mr/common.json';

import enFarmers from './locales/en/farmers.json';
import hiFarmers from './locales/hi/farmers.json';
import mrFarmers from './locales/mr/farmers.json';

import enBuyers from './locales/en/buyers.json';
import hiBuyers from './locales/hi/buyers.json';
import mrBuyers from './locales/mr/buyers.json';

import enAnalytics from './locales/en/analytics.json';
import hiAnalytics from './locales/hi/analytics.json';
import mrAnalytics from './locales/mr/analytics.json';

const resources = {
  en: {
    common: enCommon,
    farmers: enFarmers,
    buyers: enBuyers,
    analytics: enAnalytics
  },
  hi: {
    common: hiCommon,
    farmers: hiFarmers,
    buyers: hiBuyers,
    analytics: hiAnalytics
  },
  mr: {
    common: mrCommon,
    farmers: mrFarmers,
    buyers: mrBuyers,
    analytics: mrAnalytics
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    defaultNS: 'common',
    ns: ['common', 'farmers', 'buyers', 'analytics'],
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;