import { messagesByLocale, type Locale } from './locales';

export { messagesByLocale } from './locales';
export type { Locale } from './locales';

export function getMessages(locale: Locale = 'id') {
  return messagesByLocale[locale];
}
