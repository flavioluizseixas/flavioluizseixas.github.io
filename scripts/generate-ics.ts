import fs from 'node:fs';
import path from 'node:path';
import { loadOfferings, type Offering } from './content.js';
import { localizeOffering } from '../src/i18n/content.js';
const out = path.resolve('dist/feed');
const outEn = path.join(out, 'en');
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(outEn, { recursive: true });
const esc = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
const stamp = new Date()
  .toISOString()
  .replace(/[-:]/g, '')
  .replace(/\.\d{3}/, '');
function calendar(name: string, offers: Offering[], language = 'PT-BR') {
  const events = offers.flatMap((o) =>
    o.calendar
      .filter((e) => e.status !== 'cancelled')
      .map((e) =>
        [
          'BEGIN:VEVENT',
          `UID:${o.slug}-${o.term}-${e.date}-${Buffer.from(e.title).toString('hex').slice(0, 16)}@flavioluizseixas.github.io`,
          `DTSTAMP:${stamp}`,
          `DTSTART;VALUE=DATE:${e.date.replaceAll('-', '')}`,
          `SUMMARY:${esc(e.title)} — ${esc(o.title)}`,
          `DESCRIPTION:${esc(`${o.code} · ${o.term}${e.note ? ` · ${e.note}` : ''}`)}`,
          'END:VEVENT'
        ].join('\r\n')
      )
  );
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//Flavio Luiz Seixas//Academic Calendar//${language}`,
    `X-WR-CALNAME:${esc(name)}`,
    ...events,
    'END:VCALENDAR',
    ''
  ].join('\r\n');
}
const offers = loadOfferings();
for (const o of offers) {
  fs.writeFileSync(
    path.join(out, `${o.slug}-${o.term.replace('.', '-')}.ics`),
    calendar(`${o.title} ${o.term}`, [o])
  );
  const englishOffering = localizeOffering(o, 'en') as Offering;
  fs.writeFileSync(
    path.join(outEn, `${o.slug}-${o.term.replace('.', '-')}.ics`),
    calendar(
      `${englishOffering.title} ${englishOffering.term}`,
      [englishOffering],
      'EN'
    )
  );
}
fs.writeFileSync(
  path.join(out, 'calendario.ics'),
  calendar(
    'Disciplinas de Flávio Luiz Seixas',
    offers.filter((o) => o.current)
  )
);
fs.writeFileSync(
  path.join(outEn, 'calendar.ics'),
  calendar(
    'Courses taught by Flávio Luiz Seixas',
    offers
      .filter((offering) => offering.current)
      .map((offering) => localizeOffering(offering, 'en') as Offering),
    'EN'
  )
);
console.log(`${(offers.length + 1) * 2} calendários ICS gerados.`);
