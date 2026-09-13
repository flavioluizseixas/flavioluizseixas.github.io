import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadCollection } from '../scripts/content';
import {
  extensionProjectSchema,
  type ExtensionProject
} from '../src/lib/extension-project-schema';
import {
  featuredProjects,
  isNewProject,
  normalizeSearch,
  projectSearchText,
  sortProjects
} from '../src/lib/extension-projects';

const projects = loadCollection<ExtensionProject>('extension-projects');
const today = '2026-09-12';
const project = (slug: string, overrides: Partial<ExtensionProject> = {}) => ({
  data: { ...projects[0], id: slug, slug, destaque: false, ...overrides }
});

describe('catálogo de extensão', () => {
  it('considera o limite de 60 dias sem marcar publicações futuras ou inválidas', () => {
    expect(isNewProject('2026-09-02', today)).toBe(true);
    expect(isNewProject('2026-07-14', today)).toBe(true);
    expect(isNewProject('2026-07-13', today)).toBe(false);
    expect(isNewProject('2026-06-14', today)).toBe(false);
    expect(isNewProject('2026-09-13', today)).toBe(false);
    expect(isNewProject('inválida', today)).toBe(false);
  });

  it('destaca até três oportunidades abertas por data, incluindo destaque editorial antigo', () => {
    const entries = [
      project('antigo', { data_publicacao: '2026-06-14' }),
      project('editorial', { data_publicacao: '2026-06-15', destaque: true }),
      project('concluido', { status: 'concluido', destaque: true }),
      project('andamento', { status: 'em-andamento', destaque: true }),
      project('novo-um', { data_publicacao: '2026-09-02' }),
      project('novo-dois', { data_publicacao: '2026-09-01' }),
      project('novo-tres', { data_publicacao: '2026-08-30' })
    ];
    expect(featuredProjects(entries, today).map((p) => p.data.slug)).toEqual([
      'novo-um',
      'novo-dois',
      'novo-tres'
    ]);
    expect(
      featuredProjects(entries.slice(0, 5), today).map((p) => p.data.slug)
    ).toEqual(['novo-um', 'editorial']);
    expect(sortProjects(entries, today)).toHaveLength(entries.length);
  });

  it('ordena abertas, novas em andamento, em andamento e concluídas, por data em cada grupo', () => {
    const entries = [
      project('concluido-antigo', {
        status: 'concluido',
        data_publicacao: '2026-01-01'
      }),
      project('concluido-recente', { status: 'concluido' }),
      project('andamento', {
        status: 'em-andamento',
        data_publicacao: '2026-01-01'
      }),
      project('novo', { status: 'em-andamento' }),
      project('aberto-antigo', { data_publicacao: '2026-01-01' }),
      project('aberto-recente')
    ];
    expect(sortProjects(entries, today).map((p) => p.data.slug)).toEqual([
      'aberto-recente',
      'aberto-antigo',
      'novo',
      'andamento',
      'concluido-recente',
      'concluido-antigo'
    ]);
    expect(entries[0].data.slug).toBe('concluido-antigo');
  });

  it('busca nomes, áreas e palavras-chave sem distinguir acentos ou caixa', () => {
    const find = (query: string) =>
      projects
        .filter((entry) =>
          projectSearchText(entry).includes(normalizeSearch(query))
        )
        .map((entry) => entry.slug);
    expect(find('AUDITORIA')).toHaveLength(2);
    expect(find('patricia')).toEqual(['qualificacao-denuncias-enfermagem']);
    expect(find('ANS')).toContain('auditoria-saude-suplementar');
    expect(find('business intelligence')).toEqual(['acenf']);
  });

  it('valida as três fontes e rejeita datas, estados, slugs e inscrições inválidos', () => {
    expect(projects).toHaveLength(3);
    for (const entry of projects)
      expect(extensionProjectSchema.safeParse(entry).success).toBe(true);
    for (const invalid of [
      { data_publicacao: '2026-02-30' },
      { status: 'aberto' },
      { slug: '../outro' },
      { equipe: [] },
      { link_inscricao: 'javascript:alert(1)' }
    ])
      expect(
        extensionProjectSchema.safeParse({ ...projects[0], ...invalid }).success
      ).toBe(false);
    for (const link_inscricao of ['', null, undefined]) {
      expect(
        extensionProjectSchema.parse({ ...projects[0], link_inscricao })
          .link_inscricao
      ).toBeUndefined();
    }
  });

  it('preserva integralmente os parágrafos e atividades acadêmicas da fonte', () => {
    const source = fs.readFileSync(
      'prompts/projetos_iniciacao_extensao_2026-2.md',
      'utf8'
    );
    const sections = [
      ...source.matchAll(/^## \d\. (.+)\r?\n([\s\S]*?)(?=\r?\n---)/gm)
    ];
    for (const [, title, body] of sections) {
      const entry = projects.find((item) => item.titulo === title.trim())!;
      const content = fs.readFileSync(
        `src/content/extension-projects/${entry.slug}.md`,
        'utf8'
      );
      const details = body.slice(
        body.indexOf('### Resumo'),
        body.indexOf('### Equipe')
      );
      for (const line of details
        .split(/\r?\n/)
        .filter((line) => line.trim() && !line.startsWith('### '))) {
        expect(content).toContain(line);
      }
      expect(entry.equipe).toHaveLength(2);
      for (const member of entry.equipe)
        expect(body).toContain(`**${member.nome}** — ${member.vinculo}`);
    }
  });
});
