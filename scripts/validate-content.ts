import { englishContent } from '../src/i18n/content.js';
import { loadCollection, loadOfferings, type Offering } from './content.js';
const allowed = new Set([
  'aula',
  'laboratorio',
  'atividade',
  'avaliacao',
  'entrega',
  'apresentacao',
  'feriado',
  'sem-aula'
]);
const statuses = new Set(['planned', 'changed', 'cancelled', 'completed']);
const errors: string[] = [];
const currents = new Map<string, number>();
const offerings = loadOfferings();
const translatable = new Set<string>();
const addTranslation = (value: unknown) => {
  if (typeof value === 'string' && value.trim()) translatable.add(value);
};
const addArray = (values: unknown) => {
  if (Array.isArray(values)) values.forEach(addTranslation);
};
const collectOfferingTranslations = (offer: Offering) => {
  [
    offer.title,
    offer.summary,
    offer.overview,
    offer.objective,
    offer.methodology,
    offer.evaluation,
    offer.notice,
    offer.schedule
  ].forEach(addTranslation);
  [offer.syllabus, offer.prerequisites].forEach(addArray);
  offer.materials?.forEach((material) => addTranslation(material.title));
  offer.calendar?.forEach((event) => {
    [event.title, event.previous_title, event.note].forEach(addTranslation);
    addArray(event.topics);
    event.materials?.forEach((material) => addTranslation(material.title));
  });
};

for (const offer of offerings) {
  collectOfferingTranslations(offer);
  if (offer.current)
    currents.set(offer.slug, (currents.get(offer.slug) || 0) + 1);
  if (!Array.isArray(offer.calendar))
    errors.push(`${offer.slug} ${offer.term}: calendário ausente`);
  for (const [i, event] of (offer.calendar || []).entries()) {
    const place = `${offer.slug} ${offer.term}, evento ${i + 1}`;
    if (!event.title?.trim()) errors.push(`${place}: título ausente`);
    if (!allowed.has(event.type))
      errors.push(`${place}: tipo desconhecido “${event.type}”`);
    if (!statuses.has(event.status))
      errors.push(`${place}: estado desconhecido “${event.status}”`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(event.date) ||
      Number.isNaN(Date.parse(`${event.date}T12:00:00-03:00`)) ||
      new Date(`${event.date}T12:00:00-03:00`).toISOString().slice(0, 10) !==
        event.date
    )
      errors.push(`${place}: data inválida “${event.date}”`);
  }
}
for (const name of ['courses', 'projects']) {
  for (const entry of loadCollection<Record<string, unknown>>(name)) {
    ['title', 'summary'].forEach((key) => addTranslation(entry[key]));
    addArray(entry.topics);
  }
}
for (const value of translatable) {
  if (!Object.hasOwn(englishContent, value))
    errors.push(`tradução inglesa ausente: “${value}”`);
}
for (const [slug, count] of currents)
  if (count > 1)
    errors.push(`${slug}: ${count} disciplinas marcadas como atuais`);
if (errors.length) {
  console.error(`Validação falhou:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(
  `Conteúdo válido: ${offerings.length} disciplinas e ${translatable.size} traduções verificadas.`
);
