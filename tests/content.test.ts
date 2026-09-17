import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadCollection, loadOfferings } from '../scripts/content';

describe('carregamento editorial', () => {
  it('descobre novos Markdown em subpastas e ignora modelos e imagens', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-content-'));
    const collection = path.join(root, 'extension-projects');
    const nested = path.join(collection, 'enfermagem');
    fs.mkdirSync(nested, { recursive: true });
    const first = path.join(collection, 'primeiro.md');
    const second = path.join(nested, 'segundo.md');
    const template = path.join(collection, '_template.md.example');
    const image = path.join(collection, 'logo.png');
    try {
      fs.writeFileSync(first, '---\nid: primeiro\n---\nDescrição.');
      fs.writeFileSync(template, 'Modelo não publicável.');
      fs.writeFileSync(image, 'Não é Markdown.');
      expect(loadCollection('extension-projects', root)).toEqual([
        { id: 'primeiro' }
      ]);
      fs.writeFileSync(second, '---\r\nid: segundo\r\n---\r\nDescrição.');
      expect(
        loadCollection<{ id: string }>('extension-projects', root)
          .map((entry) => entry.id)
          .sort()
      ).toEqual(['primeiro', 'segundo']);
    } finally {
      for (const file of [first, second, template, image]) {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      }
      fs.rmdirSync(nested);
      fs.rmdirSync(collection);
      fs.rmdirSync(root);
    }
  });

  it('exclui a pasta auxiliar google-forms sem ocultar projetos inválidos', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-content-'));
    const collection = path.join(root, 'extension-projects');
    const forms = path.join(collection, 'google-forms');
    const nested = path.join(forms, 'docs');
    fs.mkdirSync(nested, { recursive: true });
    const project = path.join(collection, 'projeto.md');
    const readme = path.join(forms, 'README.md');
    const auxiliary = path.join(nested, 'exemplo.md');
    try {
      fs.writeFileSync(project, '---\nid: projeto\n---\nDescrição.');
      fs.writeFileSync(
        readme,
        '# Instruções dos formulários, sem frontmatter.'
      );
      fs.writeFileSync(auxiliary, '---\nid: auxiliar\n---\nNão é um projeto.');
      expect(loadCollection('extension-projects', root)).toEqual([
        { id: 'projeto' }
      ]);
      fs.writeFileSync(project, 'Projeto sem os metadados obrigatórios.');
      expect(() => loadCollection('extension-projects', root)).toThrow(
        'frontmatter ausente'
      );
    } finally {
      for (const file of [project, readme, auxiliary]) {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      }
      fs.rmdirSync(nested);
      fs.rmdirSync(forms);
      fs.rmdirSync(collection);
      fs.rmdirSync(root);
    }
  });
});

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
