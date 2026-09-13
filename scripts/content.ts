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
  instructors?: string[];
  syllabus?: string[];
  prerequisites?: string[];
  materials?: { title: string }[];
  calendar: Event[];
};
export function loadCollectionEntries<T>(name: string, dataRoot = 'data') {
  const dir = path.resolve(dataRoot, name);
  const pattern = name === 'offerings' ? /\.mdx?$/ : /\.md$/;
  return fs
    .readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && pattern.test(entry.name))
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort()
    .map((file) => {
      const raw = fs.readFileSync(file, 'utf8');
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) throw new Error(`${file}: frontmatter ausente`);
      try {
        return {
          file,
          data: YAML.parse(match[1]) as T,
          body: raw.slice(match[0].length).trim()
        };
      } catch (error) {
        throw new Error(`${file}: YAML inválido — ${error}`);
      }
    });
}

export function loadCollection<T>(name: string, dataRoot = 'data'): T[] {
  return loadCollectionEntries<T>(name, dataRoot).map((entry) => entry.data);
}

export function loadOfferings(): Offering[] {
  return loadCollection<Offering>('offerings');
}
