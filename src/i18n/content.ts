import { englishContent } from '../../data/i18n/content';
export { englishContent };
import type { Locale } from './index';

// Academic source content remains in Portuguese. Every string rendered as
// translatable content must have an explicit counterpart in data/i18n/content.ts.
// validate-content.ts checks this table so new Portuguese content cannot be
// published silently on English pages.

export const translateContent = (
  value: string | null | undefined,
  locale: Locale
) => {
  if (!value || locale === 'pt') return value;
  return englishContent[value] ?? value;
};

const translatedArray = (
  values: string[] | undefined,
  locale: Locale
): string[] => (values ?? []).map((value) => translateContent(value, locale)!);

const localizeMaterialUrl = (url: string, offeringSlug?: string): string => {
  if (
    offeringSlug !== 'aprendizado-maquina-saude' ||
    !/\.pdf(?:[?#]|$)/i.test(url) ||
    /_en\.pdf(?:[?#]|$)/i.test(url)
  ) {
    return url;
  }

  return url.replace(/\.pdf(?=[?#]|$)/i, '_en.pdf');
};

const localizeMaterial = (material: any, offeringSlug?: string) => ({
  ...material,
  title: translateContent(material.title, 'en'),
  url: localizeMaterialUrl(material.url, offeringSlug)
});

export const localizeOffering = <T extends Record<string, any>>(
  source: T,
  locale: Locale
): T => {
  if (locale === 'pt') return source;
  return {
    ...source,
    code: translateContent(source.code, locale),
    title: translateContent(source.title, locale),
    summary: translateContent(source.summary, locale),
    overview: translateContent(source.overview, locale),
    objective: translateContent(source.objective, locale),
    methodology: translateContent(source.methodology, locale),
    evaluation: translateContent(source.evaluation, locale),
    notice: translateContent(source.notice, locale),
    schedule: translateContent(source.schedule, locale),
    class_group: translateContent(source.class_group, locale),
    syllabus: translatedArray(source.syllabus, locale),
    prerequisites: translatedArray(source.prerequisites, locale),
    materials: (source.materials ?? []).map((material: any) =>
      localizeMaterial(material, source.slug)
    ),
    calendar: (source.calendar ?? []).map((event: any) => ({
      ...event,
      title: translateContent(event.title, locale),
      previous_title: translateContent(event.previous_title, locale),
      note: translateContent(event.note, locale),
      topics: translatedArray(event.topics, locale),
      materials: (event.materials ?? []).map((material: any) =>
        localizeMaterial(material, source.slug)
      )
    }))
  };
};
