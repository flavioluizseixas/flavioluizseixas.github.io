import fs from 'node:fs';
import path from 'node:path';

const ORCID = '0000-0002-7160-0818';
const API = `https://pub.orcid.org/v3.0/${ORCID}`;

type AnyRecord = Record<string, any>;

async function getJson(url: string, accept = 'application/json') {
  const response = await fetch(url, {
    headers: { Accept: accept, 'User-Agent': 'site-academico-flavio-seixas' }
  });
  if (!response.ok) throw new Error(`${response.status} ao consultar ${url}`);
  return response.json() as Promise<AnyRecord>;
}

async function inBatches<T, R>(
  items: T[],
  size: number,
  task: (item: T) => Promise<R>
) {
  const output: R[] = [];
  for (let index = 0; index < items.length; index += size) {
    output.push(
      ...(await Promise.all(items.slice(index, index + size).map(task)))
    );
  }
  return output;
}

const index = await getJson(`${API}/works`);
const summaries = index.group.map(
  (group: AnyRecord) => group['work-summary'][0]
);
const works = await inBatches(summaries, 8, (summary: AnyRecord) =>
  getJson(`${API}/work/${summary['put-code']}`)
);

const publications = await inBatches(works, 1, async (work: AnyRecord) => {
  const ids = work['external-ids']?.['external-id'] ?? [];
  const doi = ids.find((id: AnyRecord) => id['external-id-type'] === 'doi')?.[
    'external-id-value'
  ];
  let crossref: AnyRecord = {};
  if (doi) {
    try {
      crossref = (
        await getJson(
          `https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=fseixas@ic.uff.br`
        )
      ).message;
    } catch (error) {
      console.warn(`Crossref indisponível para ${doi}: ${String(error)}`);
    }
  }
  const orcidAuthors = (work.contributors?.contributor ?? [])
    .filter(
      (contributor: AnyRecord) =>
        contributor['contributor-attributes']?.['contributor-role'] === 'author'
    )
    .map((contributor: AnyRecord) => contributor['credit-name']?.value)
    .filter(Boolean);
  const crossrefAuthors = (crossref.author ?? []).map((author: AnyRecord) =>
    [author.given, author.family].filter(Boolean).join(' ')
  );
  const date = work['publication-date'];
  return {
    id: String(work['put-code']),
    title: work.title?.title?.value ?? 'Título não informado',
    authors: orcidAuthors.length ? orcidAuthors : crossrefAuthors,
    year: Number(
      date?.year?.value ?? crossref.published?.['date-parts']?.[0]?.[0] ?? 0
    ),
    type: work.type,
    container:
      work['journal-title']?.value ?? crossref['container-title']?.[0] ?? null,
    publisher: crossref.publisher ?? null,
    volume: crossref.volume ?? null,
    issue: crossref.issue ?? null,
    pages: crossref.page ?? crossref['article-number'] ?? null,
    doi: doi ?? null,
    url: doi ? `https://doi.org/${doi}` : (work.url?.value ?? null)
  };
});

publications.sort(
  (a, b) => b.year - a.year || a.title.localeCompare(b.title, 'pt-BR')
);
const target = path.resolve('src/data/publications.json');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(
  target,
  `${JSON.stringify(
    {
      orcid: ORCID,
      syncedAt: new Date().toISOString(),
      count: publications.length,
      publications
    },
    null,
    2
  )}\n`
);
console.log(`${publications.length} publicações importadas do ORCID.`);
