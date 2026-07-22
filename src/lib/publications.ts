export interface Publication {
  id: string;
  title: string;
  authors: string[];
  year: number;
  type: string;
  container: string | null;
  publisher: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  doi: string | null;
  url: string | null;
}

export function abntAuthor(name: string) {
  const parts = name.trim().split(/\s+/);
  const surname = parts.pop() ?? name;
  const given = parts.join(' ');
  return `${surname.toLocaleUpperCase('pt-BR')}, ${given}`;
}

export function abntAuthors(authors: string[]) {
  if (!authors.length) return 'SEIXAS, Flávio Luiz et al.';
  if (authors.length > 3) return `${abntAuthor(authors[0])} et al.`;
  return authors.map(abntAuthor).join('; ');
}

export function abntReference(publication: Publication) {
  const authors = abntAuthors(publication.authors);
  const title = publication.title.replace(/[.:]+$/, '');
  const container = publication.container ? ` ${publication.container}` : '';
  const details = [
    publication.volume ? `v. ${publication.volume}` : null,
    publication.issue ? `n. ${publication.issue}` : null,
    publication.pages ? `p. ${publication.pages}` : null
  ].filter(Boolean);
  const publicationData = details.length ? `, ${details.join(', ')}` : '';
  const publisher =
    !publication.container && publication.publisher
      ? ` ${publication.publisher}.`
      : '';
  return `${authors}. ${title}.${container}${publicationData}.${publisher} ${publication.year || 's.d.'}.`
    .replace(/\s+/g, ' ')
    .replace(/\.\./g, '.');
}

export const publicationTypeLabels: Record<string, string> = {
  'journal-article': 'Artigo em periódico',
  'conference-paper': 'Trabalho em evento',
  'book-chapter': 'Capítulo de livro',
  book: 'Livro'
};
