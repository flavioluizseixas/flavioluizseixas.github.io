import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
export type Event = {
  date: string;
  title: string;
  type: string;
  status: string;
  previous_title?: string;
  note?: string;
  topics?: string[];
  materials?: { title: string }[];
};
export type Offering = {
  title: string;
  code: string;
  slug: string;
  term: string;
  current: boolean;
  status: string;
  summary: string;
  overview?: string;
  objective?: string;
  methodology?: string;
  evaluation?: string;
  notice?: string;
  schedule: string;
  syllabus?: string[];
  prerequisites?: string[];
  materials?: { title: string }[];
  calendar: Event[];
};
export function loadCollection<T>(name: string): T[] {
  const dir = path.resolve('src/content', name);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) throw new Error(`${file}: frontmatter ausente`);
      try {
        return YAML.parse(match[1]);
      } catch (error) {
        throw new Error(`${file}: YAML inválido — ${error}`);
      }
    });
}

export function loadOfferings(): Offering[] {
  return loadCollection<Offering>('offerings');
}
