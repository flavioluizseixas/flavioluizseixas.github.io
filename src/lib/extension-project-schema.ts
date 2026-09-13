import { z } from 'astro/zod';

const text = z.string().trim().min(1);
const slug = text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }, 'Data inválida');

export const extensionProjectSchema = z.object({
  id: slug,
  slug,
  titulo: text,
  resumo_curto: text,
  logo: z
    .object({
      src: text.regex(
        /^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:png|jpe?g|webp|avif|gif|svg)$/,
        'Use um arquivo em data/images, como enfermagem.png'
      ),
      alt: text
    })
    .optional(),
  modalidade: z.array(text).min(1),
  area: z.array(text).min(1),
  status: z.enum(['inscricoes-abertas', 'em-andamento', 'concluido']),
  semestre_divulgacao: text.regex(/^0[12]-\d{4}$/),
  data_publicacao: date,
  carga_horaria: text,
  destaque: z.boolean().default(false),
  equipe: z.array(z.object({ nome: text, vinculo: text })).min(1),
  palavras_chave: z.array(text).min(1),
  link_inscricao: z.preprocess(
    (value) =>
      value === null || (typeof value === 'string' && !value.trim())
        ? undefined
        : value,
    z
      .string()
      .trim()
      .url()
      .refine(
        (value) => /^https?:\/\//.test(value),
        'Use uma URL HTTP ou HTTPS'
      )
      .optional()
  ),
  data_encerramento_inscricoes: date.optional()
});

export type ExtensionProject = z.infer<typeof extensionProjectSchema>;
