import { describe, expect, it } from 'vitest';
import { localizeOffering } from '../src/i18n/content';

describe('course material localization', () => {
  it('uses the English PDFs for the healthcare machine learning course', () => {
    const localized = localizeOffering(
      {
        slug: 'aprendizado-maquina-saude',
        materials: [
          { title: 'Handout', url: '/files/handout.pdf' },
          { title: 'Handout', url: '/files/handout_en.pdf' },
          { title: 'Notebook', url: '/files/notebook.ipynb' }
        ],
        calendar: [
          {
            title: 'Lecture',
            materials: [
              {
                title: 'Handout',
                url: 'https://example.com/lecture-1.pdf?download=1#material'
              }
            ]
          }
        ]
      },
      'en'
    );

    expect(localized.materials.map((material: any) => material.url)).toEqual([
      '/files/handout_en.pdf',
      '/files/handout_en.pdf',
      '/files/notebook.ipynb'
    ]);
    expect(localized.calendar[0].materials[0].url).toBe(
      'https://example.com/lecture-1_en.pdf?download=1#material'
    );
  });

  it('keeps Portuguese PDFs and PDFs from other courses unchanged', () => {
    const material = { title: 'Handout', url: '/files/handout.pdf' };

    expect(
      localizeOffering(
        {
          slug: 'aprendizado-maquina-saude',
          materials: [material],
          calendar: []
        },
        'pt'
      ).materials[0].url
    ).toBe('/files/handout.pdf');
    expect(
      localizeOffering(
        { slug: 'other-course', materials: [material], calendar: [] },
        'en'
      ).materials[0].url
    ).toBe('/files/handout.pdf');
  });
});
