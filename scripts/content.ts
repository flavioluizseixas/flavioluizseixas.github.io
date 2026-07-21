import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
export type Event = {
  date: string;
  title: string;
  type: string;
  status: string;
  note?: string;
};
export type Offering = {
  title: string;
  code: string;
  slug: string;
  term: string;
  current: boolean;
  status: string;
  calendar: Event[];
};
export function loadOfferings(): Offering[] {
  const dir = path.resolve('src/content/offerings');
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const match = raw.match(/^---\n([\s\S]*?)\n---/);
      if (!match) throw new Error(`${file}: frontmatter ausente`);
      try {
        return YAML.parse(match[1]);
      } catch (error) {
        throw new Error(`${file}: YAML inválido — ${error}`);
      }
    });
}
