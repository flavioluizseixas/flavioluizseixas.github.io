import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { extensionProjectSchema } from './lib/extension-project-schema';

const material = z.object({
  title: z.string(),
  url: z.string(),
  type: z.enum([
    'slides',
    'exercicio',
    'notebook',
    'video',
    'software',
    'leitura',
    'dataset'
  ]),
  external: z.boolean().default(false)
});

const event = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().nullable().optional(),
  title: z.string().min(1),
  type: z.enum([
    'aula',
    'laboratorio',
    'atividade',
    'avaliacao',
    'entrega',
    'apresentacao',
    'feriado',
    'sem-aula'
  ]),
  status: z
    .enum(['planned', 'changed', 'cancelled', 'completed'])
    .default('planned'),
  previous_title: z.string().optional(),
  previous_date: z.string().optional(),
  note: z.string().nullable().optional(),
  topics: z.array(z.string()).default([]),
  references: z.array(z.string()).default([]),
  materials: z.array(material).default([])
});

const offerings = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './data/offerings',
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, '')
  }),
  schema: z.object({
    title: z.string(),
    code: z.string(),
    slug: z.string(),
    term: z.string(),
    current: z.boolean().default(false),
    status: z.enum(['active', 'archived', 'draft']),
    level: z.enum(['graduacao', 'pos-graduacao']),
    class_group: z.string(),
    schedule: z.string(),
    room: z.string().nullable(),
    classroom_url: z.string().url().nullable().optional(),
    classroom_code: z.string().min(1).nullable().optional(),
    instructors: z.array(z.string().min(1)).default([]),
    timezone: z.literal('America/Sao_Paulo'),
    summary: z.string(),
    overview: z.string().optional(),
    objective: z.string().optional(),
    syllabus: z.array(z.string()).default([]),
    methodology: z.string().optional(),
    workload: z.string().optional(),
    credits: z.number().int().positive().optional(),
    prerequisites: z.array(z.string()).default([]),
    evaluation: z.string().optional(),
    references: z.array(z.string()).default([]),
    language: z.string().default('pt-BR'),
    updated: z.string(),
    notice: z.string().optional(),
    calendar: z.array(event),
    materials: z.array(material).default([])
  })
});

const courses = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './data/courses' }),
  schema: z.object({
    title: z.string(),
    code: z.string(),
    slug: z.string(),
    summary: z.string(),
    topics: z.array(z.string())
  })
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './data/projects' }),
  schema: z.object({
    title: z.string(),
    kind: z.enum(['pesquisa', 'extensao']),
    summary: z.string(),
    featured: z.boolean().default(false)
  })
});

const extensionProjects = defineCollection({
  loader: glob({
    // Inclui projetos em subpastas, mas exclui a automação em google-forms/.
    pattern: '{*.md,!(google-forms)/**/*.md}',
    base: './data/extension-projects',
    generateId: ({ data }) => String(data.id)
  }),
  schema: extensionProjectSchema
});

export const collections = {
  offerings,
  courses,
  projects,
  extensionProjects
};
