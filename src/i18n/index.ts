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

export const commonCopy = {
  pt: {
    homeTitle: 'Início',
    fullHomeTitle: 'Flávio Luiz Seixas — Professor e pesquisador',
    navLabel: 'Navegação principal',
    skip: 'Pular para o conteúdo',
    menu: 'Menu',
    search: 'Buscar',
    theme: 'Alternar tema',
    brandLabel: 'Página inicial de Flávio Luiz Seixas',
    institute: 'Instituto de Computação · UFF',
    instituteAlt: 'Instituto de Computação da UFF',
    nav: {
      home: 'Início',
      teaching: 'Ensino',
      research: 'Pesquisa',
      outreach: 'Extensão',
      publications: 'Publicações',
      about: 'Sobre'
    },
    footerRole: 'Professor de Ciência da Computação',
    university: 'Universidade Federal Fluminense',
    shortcuts: 'Atalhos',
    courses: 'Disciplinas',
    contact: 'Contato',
    archive: 'Arquivo',
    thisSite: 'Este site',
    siteDescription: 'Conteúdo acadêmico aberto, rápido e acessível.',
    subscribe: 'Assinar calendário',
    footerNote:
      'Atualizado a partir de conteúdo versionado. Horários em Brasília.',
    portuguese: 'Português',
    english: 'Inglês',
    language: 'Idioma'
  },
  en: {
    homeTitle: 'Home',
    fullHomeTitle: 'Flávio Luiz Seixas — Professor and researcher',
    navLabel: 'Main navigation',
    skip: 'Skip to content',
    menu: 'Menu',
    search: 'Search',
    theme: 'Toggle theme',
    brandLabel: 'Flávio Luiz Seixas home page',
    institute: 'Institute of Computing · UFF',
    instituteAlt: 'UFF Institute of Computing',
    nav: {
      home: 'Home',
      teaching: 'Teaching',
      research: 'Research',
      outreach: 'Outreach',
      publications: 'Publications',
      about: 'About'
    },
    footerRole: 'Professor of Computer Science',
    university: 'Fluminense Federal University',
    shortcuts: 'Shortcuts',
    courses: 'Courses',
    contact: 'Contact',
    archive: 'Archive',
    thisSite: 'This site',
    siteDescription: 'Open, fast, and accessible academic content.',
    subscribe: 'Subscribe to calendar',
    footerNote:
      'Updated from version-controlled content. Times are in Brasília time.',
    portuguese: 'Portuguese',
    english: 'English',
    language: 'Language'
  }
} as const;
