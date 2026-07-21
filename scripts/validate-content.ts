import { loadOfferings } from './content.js';
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
for (const offer of loadOfferings()) {
  if (offer.current)
    currents.set(offer.slug, (currents.get(offer.slug) || 0) + 1);
  if (!offer.calendar?.length)
    errors.push(`${offer.slug} ${offer.term}: calendário vazio`);
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
for (const [slug, count] of currents)
  if (count > 1) errors.push(`${slug}: ${count} ofertas marcadas como atuais`);
if (errors.length) {
  console.error(`Validação falhou:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Conteúdo válido: ${loadOfferings().length} ofertas verificadas.`);
