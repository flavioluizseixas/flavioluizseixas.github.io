import { describe, it, expect } from 'vitest';
import { loadOfferings } from '../scripts/content';
describe('conteúdo acadêmico', () => {
  it('tem no máximo um período corrente por disciplina', () => {
    const current = loadOfferings().filter((o) => o.current);
    expect(new Set(current.map((o) => o.slug)).size).toBe(current.length);
  });
  it('mantém eventos em ordem cronológica', () => {
    for (const o of loadOfferings()) {
      const dates = o.calendar.map((e) => e.date);
      expect(dates).toEqual([...dates].sort());
    }
  });
  it('publica a co-docência da disciplina de Informática em Saúde', () => {
    const offering = loadOfferings().find(
      (o) => o.slug === 'informatica-saude-enfermagem' && o.current
    );
    expect(offering?.instructors).toEqual([
      'Bianca Dargam Gomes Vieira',
      'Flávio Luiz Seixas'
    ]);
    expect(offering?.materials).toHaveLength(1);
    expect(offering?.calendar.map((event) => event.date)).toEqual([
      '2026-08-10',
      '2026-08-11',
      '2026-08-20',
      '2026-08-27',
      '2026-09-03'
    ]);
  });
});
