import { describe, it, expect } from 'vitest';
import { loadOfferings } from '../scripts/content';
describe('conteúdo acadêmico', () => {
  it('tem no máximo uma oferta corrente por disciplina', () => {
    const current = loadOfferings().filter((o) => o.current);
    expect(new Set(current.map((o) => o.slug)).size).toBe(current.length);
  });
  it('mantém eventos em ordem cronológica', () => {
    for (const o of loadOfferings()) {
      const dates = o.calendar.map((e) => e.date);
      expect(dates).toEqual([...dates].sort());
    }
  });
});
