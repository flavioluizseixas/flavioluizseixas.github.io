import { describe, expect, it } from 'vitest';
import { abntAuthor, abntReference } from '../src/lib/publications';

describe('referências ABNT', () => {
  it('coloca o sobrenome do autor em destaque', () => {
    expect(abntAuthor('Flávio Luiz Seixas')).toBe('SEIXAS, Flávio Luiz');
  });

  it('inclui periódico, volume, páginas, ano e pontuação final', () => {
    expect(
      abntReference({
        id: '1',
        title: 'Título do artigo',
        authors: ['Flávio Luiz Seixas'],
        year: 2026,
        type: 'journal-article',
        container: 'Revista Acadêmica',
        publisher: null,
        volume: '10',
        issue: '2',
        pages: '10-20',
        doi: null,
        url: null
      })
    ).toBe(
      'SEIXAS, Flávio Luiz. Título do artigo. Revista Acadêmica, v. 10, n. 2, p. 10-20. 2026.'
    );
  });
});
