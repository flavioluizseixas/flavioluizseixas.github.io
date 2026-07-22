import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import * as prettier from 'prettier';
import XLSX from 'xlsx';
import YAML from 'yaml';

type CalendarType =
  | 'aula'
  | 'laboratorio'
  | 'atividade'
  | 'avaliacao'
  | 'entrega'
  | 'apresentacao'
  | 'feriado'
  | 'sem-aula';
type CalendarStatus = 'planned' | 'changed' | 'cancelled' | 'completed';

const defaults = {
  spreadsheet: 'data/MPN Planejamento.xlsx',
  sheet: '2026.2',
  offering: 'src/content/offerings/modelagem-processos-2026-2.md'
};

function argument(name: string, fallback: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1]
    ? process.argv[index + 1]
    : fallback;
}

export function inferEventType(title: string): CalendarType {
  const normalized = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (normalized.includes('nao havera aula')) return 'sem-aula';
  if (/^(p\d+|vr|vs)\b/.test(normalized)) return 'avaliacao';
  if (normalized.startsWith('apresentacao')) return 'apresentacao';
  if (normalized.startsWith('exercicio') || normalized.startsWith('atividade'))
    return 'atividade';
  if (normalized.startsWith('laboratorio')) return 'laboratorio';
  if (normalized.includes('feriado')) return 'feriado';
  return 'aula';
}

function excelDate(value: unknown): string {
  if (value instanceof Date) {
    return [value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate()]
      .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, '0'))
      .join('-');
  }
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed)
      return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
  }
  const text = String(value ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  throw new Error(`Data inválida na planilha: “${text}”`);
}

function cellText(sheet: XLSX.WorkSheet, column: number, row: number) {
  return String(
    sheet[XLSX.utils.encode_cell({ c: column, r: row })]?.v ?? ''
  ).trim();
}

const spreadsheetPath = path.resolve(argument('file', defaults.spreadsheet));
const sheetName = argument('sheet', defaults.sheet);
const offeringPath = path.resolve(argument('offering', defaults.offering));
const workbook = XLSX.readFile(spreadsheetPath, {
  cellDates: false,
  cellStyles: true
});
const sheet = workbook.Sheets[sheetName];
if (!sheet)
  throw new Error(`Aba “${sheetName}” não encontrada em ${spreadsheetPath}`);

const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:D1');
const headers = ['Tipo', 'Status', 'Observações'];
let spreadsheetChanged = headers.some(
  (header, index) => cellText(sheet, index + 4, 0) !== header
);
if (spreadsheetChanged)
  XLSX.utils.sheet_add_aoa(sheet, [headers], {
    origin: 'E1'
  });

const events = [];
const allowedTypes = new Set<CalendarType>([
  'aula',
  'laboratorio',
  'atividade',
  'avaliacao',
  'entrega',
  'apresentacao',
  'feriado',
  'sem-aula'
]);
const allowedStatuses = new Set<CalendarStatus>([
  'planned',
  'changed',
  'cancelled',
  'completed'
]);
for (let row = 1; row <= range.e.r; row += 1) {
  const title = cellText(sheet, 2, row).replace(/\s+/g, ' ');
  const dateCell = sheet[XLSX.utils.encode_cell({ c: 1, r: row })]?.v;
  if (!title && (dateCell === undefined || dateCell === '')) continue;
  if (!title || dateCell === undefined || dateCell === '')
    throw new Error(`Linha ${row + 1}: Data e Conteúdo são obrigatórios.`);

  const inferredType = inferEventType(title);
  const type = (cellText(sheet, 4, row) || inferredType) as CalendarType;
  const status = (cellText(sheet, 5, row) || 'planned') as CalendarStatus;
  const note = cellText(sheet, 6, row);
  const reference = cellText(sheet, 3, row);
  if (!allowedTypes.has(type))
    throw new Error(`Linha ${row + 1}: Tipo inválido “${type}”.`);
  if (!allowedStatuses.has(status))
    throw new Error(`Linha ${row + 1}: Status inválido “${status}”.`);

  if (
    cellText(sheet, 4, row) !== type ||
    cellText(sheet, 5, row) !== status ||
    cellText(sheet, 6, row) !== note
  ) {
    spreadsheetChanged = true;
    XLSX.utils.sheet_add_aoa(sheet, [[type, status, note]], {
      origin: XLSX.utils.encode_cell({ c: 4, r: row })
    });
  }
  events.push({
    date: excelDate(dateCell),
    title,
    type,
    status,
    ...(note ? { note } : {}),
    ...(reference ? { references: [reference] } : {})
  });
}

if (!events.length)
  throw new Error(`Nenhum evento encontrado na aba “${sheetName}”.`);
if (spreadsheetChanged)
  XLSX.writeFile(workbook, spreadsheetPath, { compression: true });

const markdown = fs.readFileSync(offeringPath, 'utf8');
const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
if (!match) throw new Error(`Frontmatter ausente em ${offeringPath}`);
const document = YAML.parseDocument(match[1]);
document.set('calendar', events);
document.set(
  'updated',
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  }).format(new Date())
);
const newFrontmatter = document
  .toString({ lineWidth: 0 })
  .replace(/^(\s+- date: )(\d{4}-\d{2}-\d{2})$/gm, "$1'$2'")
  .trimEnd();
const updatedMarkdown = markdown.replace(match[1], newFrontmatter);
const prettierConfig = await prettier.resolveConfig(offeringPath);
const formattedMarkdown = await prettier.format(updatedMarkdown, {
  ...prettierConfig,
  filepath: offeringPath
});
fs.writeFileSync(offeringPath, formattedMarkdown);

console.log(
  `${events.length} eventos importados de “${sheetName}” para ${path.relative(process.cwd(), offeringPath)}.`
);
console.log('Colunas Tipo, Status e Observações verificadas na planilha.');
