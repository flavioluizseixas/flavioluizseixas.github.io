export const profileLinks = [
  { label: 'Currículo Lattes', href: 'http://lattes.cnpq.br/4319951805195534' },
  { label: 'ORCID', href: 'https://orcid.org/0000-0002-7160-0818' },
  {
    label: 'Google Scholar',
    href: 'https://scholar.google.com.br/citations?user=0wCico0AAAAJ'
  },
  { label: 'GitHub', href: 'https://github.com/flavioluizseixas' }
];

const currentCourseOrder = [
  'aprendizado-maquina-saude',
  'modelagem-processos',
  'informatica-saude-enfermagem'
];

export const sortCurrentOfferings = <
  T extends { data: { slug: string; title: string } }
>(
  offerings: T[]
) =>
  [...offerings].sort((a, b) => {
    const aIndex = currentCourseOrder.indexOf(a.data.slug);
    const bIndex = currentCourseOrder.indexOf(b.data.slug);
    const aPriority = aIndex === -1 ? currentCourseOrder.length : aIndex;
    const bPriority = bIndex === -1 ? currentCourseOrder.length : bIndex;
    return aPriority - bPriority || a.data.title.localeCompare(b.data.title);
  });

export const withBase = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export const formatDate = (
  iso: string,
  options: Intl.DateTimeFormatOptions = {},
  locale = 'pt-BR'
) =>
  new Intl.DateTimeFormat(locale, {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options
  })
    .format(new Date(`${iso}T12:00:00-03:00`))
    .replace('.', '');

export const eventSlug = (date: string, title: string) =>
  `${date}-${title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 45)}`;

export const todayInSaoPaulo = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
