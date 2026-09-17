import fs from 'node:fs';
import { format } from 'prettier';
import { loadCollection } from './content';
import { extensionProjectSchema } from '../src/lib/extension-project-schema';
import { sortProjects } from '../src/lib/extension-projects';
import site from '../data/site.json';

const projects = sortProjects(
  loadCollection('extension-projects').map((entry) => ({
    data: extensionProjectSchema.parse(entry)
  }))
).map(({ data }, index) => ({
  slug: data.slug,
  title: data.titulo,
  fileName: `${String(index + 1).padStart(2, '0')} — ${data.titulo}`,
  description: [
    'Inscrição para participação no projeto de extensão.',
    data.resumo_curto,
    `Dedicação: ${data.carga_horaria}. Semestre: ${data.semestre_divulgacao}.`,
    'Preencha os campos obrigatórios e anexe seu histórico escolar da UFF, gerado pelo IdUFF, em PDF.',
    'Seus dados e seu histórico serão utilizados pela equipe responsável para analisar sua inscrição e entrar em contato sobre o projeto.'
  ].join('\n\n'),
  pageUrl: `${site.url}/extensao/projetos/${data.slug}/`
}));

const config = {
  folderPath: ['extension-projects', 'google-forms'],
  templateName: 'Modelo — Inscrição nos projetos de extensão',
  fields: {
    name: 'Nome completo',
    email: 'E-mail',
    transcript: 'Histórico escolar da UFF',
    interest: 'O que despertou seu interesse nesse projeto?'
  },
  confirmation:
    'Sua inscrição foi recebida. A equipe responsável pelo projeto poderá entrar em contato pelo e-mail informado.',
  projects
};

const target = 'data/extension-projects/google-forms/Config.gs';
const content = await format(
  '// Gerado por npm run prepare:google-forms a partir de data/extension-projects/.\n' +
    `const GOOGLE_FORMS_CONFIG = ${JSON.stringify(config, null, 2)};\n`,
  { parser: 'babel', singleQuote: true, trailingComma: 'none' }
);
if (process.argv.includes('--check')) {
  if (
    !fs.existsSync(target) ||
    fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n') !==
      content.replace(/\r\n/g, '\n')
  ) {
    throw new Error(
      'Execute npm run prepare:google-forms para atualizar Config.gs.'
    );
  }
} else {
  fs.mkdirSync('data/extension-projects/google-forms', { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
  console.log(
    `${projects.length} formulários preparados em ${target}. Execute Code.gs no Google Apps Script para criá-los no Drive.`
  );
}
