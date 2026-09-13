import type { ExtensionProject } from './extension-project-schema';
import { todayInSaoPaulo } from './site';

export const NEW_PROJECT_DAYS = 60;
export const PROJECT_STATUS_LABELS = {
  'inscricoes-abertas': 'Inscrições abertas',
  'em-andamento': 'Em andamento',
  concluido: 'Concluído'
} as const;

export function isNewProject(publication: string, today = todayInSaoPaulo()) {
  const age = (Date.parse(today) - Date.parse(publication)) / 86_400_000;
  return age >= 0 && age <= NEW_PROJECT_DAYS;
}

export function sortProjects<T extends { data: ExtensionProject }>(
  projects: T[],
  today = todayInSaoPaulo()
) {
  const priority = (project: ExtensionProject) => {
    if (project.status === 'inscricoes-abertas') return 0;
    if (project.status === 'concluido') return 3;
    return isNewProject(project.data_publicacao, today) ? 1 : 2;
  };
  return [...projects].sort(
    (a, b) =>
      priority(a.data) - priority(b.data) ||
      b.data.data_publicacao.localeCompare(a.data.data_publicacao) ||
      a.data.titulo.localeCompare(b.data.titulo, 'pt-BR')
  );
}

export function groupProjects<T extends { data: ExtensionProject }>(
  projects: T[],
  today = todayInSaoPaulo()
) {
  const sorted = sortProjects(projects, today);
  return {
    opportunities: sorted.filter(
      ({ data }) => data.status === 'inscricoes-abertas'
    ),
    searchable: sorted.filter(
      ({ data }) => data.status !== 'inscricoes-abertas'
    )
  };
}

export type ProjectSearchEntry = {
  search: string;
  status: string;
  area: string[];
  modalidade: string[];
};

export function matchesProject(
  entry: ProjectSearchEntry,
  filters: { query: string; status: string; modalidade: string; area: string }
) {
  const terms = normalizeSearch(filters.query).split(/\s+/).filter(Boolean);
  return (
    (entry.status === 'em-andamento' || entry.status === 'concluido') &&
    terms.every((term) => entry.search.includes(term)) &&
    (!filters.status || entry.status === filters.status) &&
    (!filters.modalidade || entry.modalidade.includes(filters.modalidade)) &&
    (!filters.area || entry.area.includes(filters.area))
  );
}

export const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const filterValue = (value: string) =>
  normalizeSearch(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const projectSearchText = (project: ExtensionProject) =>
  normalizeSearch(
    [
      project.titulo,
      project.resumo_curto,
      ...project.area,
      ...project.palavras_chave,
      ...project.equipe.map((member) => member.nome)
    ].join(' ')
  );

export const resultCount = (count: number) =>
  `${count} ${count === 1 ? 'projeto encontrado' : 'projetos encontrados'}`;
