import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadCollection } from '../scripts/content';
import {
  extensionProjectSchema,
  type ExtensionProject
} from '../src/lib/extension-project-schema';
import {
  groupProjects,
  matchesProject,
  filterValue,
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

  it('separa todas as oportunidades dos projetos pesquisáveis sem repetir ou omitir cards', () => {
    const entries = [
      project('antigo', { data_publicacao: '2026-06-14' }),
      project('editorial', { data_publicacao: '2026-06-15', destaque: true }),
      project('concluido', { status: 'concluido', destaque: true }),
      project('andamento', { status: 'em-andamento', destaque: true }),
      project('novo-um', { data_publicacao: '2026-09-02' }),
      project('novo-dois', { data_publicacao: '2026-09-01' }),
      project('novo-tres', { data_publicacao: '2026-08-30' })
    ];
    const { opportunities, searchable } = groupProjects(entries, today);
    expect(opportunities.map((p) => p.data.slug)).toEqual([
      'novo-um',
      'novo-dois',
      'novo-tres',
      'editorial',
      'antigo'
    ]);
    expect(searchable.map((p) => p.data.slug)).toEqual([
      'andamento',
      'concluido'
    ]);
    const slugs = [...opportunities, ...searchable].map((p) => p.data.slug);
    expect(new Set(slugs).size).toBe(entries.length);
    expect(slugs).toHaveLength(entries.length);

    const updated = entries.map((entry) =>
      entry.data.slug === 'novo-um'
        ? { data: { ...entry.data, status: 'em-andamento' as const } }
        : entry
    );
    const moved = groupProjects(updated, today);
    expect(
      moved.opportunities.some((entry) => entry.data.slug === 'novo-um')
    ).toBe(false);
    expect(
      moved.searchable.filter((entry) => entry.data.slug === 'novo-um')
    ).toHaveLength(1);
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

  it('combina busca e filtros somente em projetos em andamento ou concluídos', () => {
    const entry = projects.find((item) => item.slug === 'acenf')!;
    const indexed = {
      search: projectSearchText(entry),
      status: 'em-andamento',
      area: entry.area.map(filterValue),
      modalidade: entry.modalidade.map(filterValue)
    };
    const filters = {
      query: 'GISELE auditoría',
      status: 'em-andamento',
      area: 'business-intelligence',
      modalidade: 'extensao'
    };
    expect(matchesProject(indexed, filters)).toBe(true);
    expect(
      matchesProject(indexed, { ...filters, area: 'gestao-em-saude' })
    ).toBe(false);
    expect(matchesProject(indexed, { ...filters, query: 'patricia' })).toBe(
      false
    );
    expect(matchesProject(indexed, { ...filters, status: 'concluido' })).toBe(
      false
    );
    const all = { query: '', status: '', area: '', modalidade: '' };
    expect(matchesProject({ ...indexed, status: 'concluido' }, all)).toBe(true);
    expect(
      matchesProject({ ...indexed, status: 'inscricoes-abertas' }, all)
    ).toBe(false);
    expect(
      matchesProject(
        { ...indexed, status: 'inscricoes-abertas' },
        { ...all, status: 'inscricoes-abertas' }
      )
    ).toBe(false);
  });

  it('mantém as seções acadêmicas preenchidas no conteúdo publicado', () => {
    for (const entry of projects) {
      const content = fs.readFileSync(
        `src/content/extension-projects/${entry.slug}.md`,
        'utf8'
      );
      const sections = new Map(
        content
          .split(/^## /m)
          .slice(1)
          .map((section) => {
            const [heading, ...body] = section.split(/\r?\n/);
            return [heading.trim(), body.join('\n').trim()];
          })
      );
      for (const heading of [
        'Sobre o projeto',
        'Impactos potenciais na sociedade',
        'O que o aluno poderá desenvolver',
        'Perfil desejado',
        'Tecnologias e competências envolvidas'
      ]) {
        expect(sections.get(heading), `${entry.slug}: ${heading}`).toMatch(
          /\S/
        );
      }
    }
  });
});
