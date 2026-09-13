import fs from 'node:fs';
import { format } from 'prettier';
import site from '../data/site.json';
import settings from '../data/registration.json';
import copy from '../data/registration-copy.json';
import { registrationConfigSchema } from '../src/lib/registration-config.js';
import { extensionProjectSchema } from '../src/lib/extension-project-schema.js';
import { loadCollection } from './content.js';

export async function registrationBundle() {
  const config = registrationConfigSchema.parse(settings);
  const {
    enabled: _enabled,
    webAppUrl: _url,
    additionalAllowedOrigins,
    ...limits
  } = config;
  const projects = loadCollection('extension-projects').map((entry) => {
    const project = extensionProjectSchema.parse(entry);
    return {
      slug: project.slug,
      title: project.titulo,
      term: project.semestre_divulgacao,
      status: project.status,
      deadline: project.data_encerramento_inscricoes || null
    };
  });
  return format(
    '// Gerado por npm run prepare:registrations. Edite data/, não este arquivo.\n' +
      `const REGISTRATION_CONFIG = ${JSON.stringify({ ...limits, allowedOrigins: [...new Set([new URL(site.url).origin, ...additionalAllowedOrigins])], projects, copy }, null, 2)};\n`,
    {
      parser: 'babel',
      singleQuote: true,
      trailingComma: 'none',
      endOfLine: 'lf'
    }
  );
}

const target = 'integrations/google-apps-script/Config.gs';
const content = await registrationBundle();
if (process.argv.includes('--check')) {
  if (
    !fs.existsSync(target) ||
    fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n') !== content
  ) {
    throw new Error(
      'Config.gs desatualizado: execute npm run prepare:registrations e atualize a implantação no Google.'
    );
  }
} else {
  fs.mkdirSync('integrations/google-apps-script', { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
  console.log(
    `Configuração gerada: ${target}. Nenhuma credencial foi incluída.`
  );
}
