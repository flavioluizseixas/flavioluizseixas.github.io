import { commonCopy } from '../../data/i18n/common';
export { commonCopy };
import { withBase } from '../lib/site';

export type Locale = 'pt' | 'en';
export type RouteName =
  | 'home'
  | 'teaching'
  | 'research'
  | 'outreach'
  | 'publications'
  | 'about'
  | 'contact'
  | 'archive'
  | 'search';

export const locales: Locale[] = ['pt', 'en'];

const routes: Record<Locale, Record<RouteName, string>> = {
  pt: {
    home: '',
    teaching: 'ensino/',
    research: 'pesquisa/',
    outreach: 'extensao/',
    publications: 'publicacoes/',
    about: 'sobre/',
    contact: 'contato/',
    archive: 'arquivo/',
    search: 'busca/'
  },
  en: {
    home: 'en/',
    teaching: 'en/teaching/',
    research: 'en/research/',
    outreach: 'en/outreach/',
    publications: 'en/publications/',
    about: 'en/about/',
    contact: 'en/contact/',
    archive: 'en/archive/',
    search: 'en/search/'
  }
};

export const route = (locale: Locale, name: RouteName) =>
  withBase(routes[locale][name]);

export const courseRoute = (
  locale: Locale,
  slug: string,
  term?: string,
  hash = ''
) => {
  const base = routes[locale].teaching;
  const suffix = term ? `${slug}/${term.replace('.', '-')}/` : `${slug}/`;
  return `${withBase(`${base}${suffix}`)}${hash}`;
};

export const localeTag = (locale: Locale) => (locale === 'pt' ? 'pt-BR' : 'en');

export const otherLocale = (locale: Locale): Locale =>
  locale === 'pt' ? 'en' : 'pt';
