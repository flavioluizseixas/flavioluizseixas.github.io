# Site acadêmico — Flávio Luiz Seixas

Site estático acadêmico construído com Astro, Markdown e CSS próprio. O projeto prioriza o acesso rápido aos calendários, funciona em GitHub Pages (domínio de usuário ou project page) e não depende de serviços no servidor.

## Desenvolvimento

Requisitos: Node.js 22 ou superior e npm.

```bash
npm install
npm run dev
```

Comandos principais:

- `npm run validate:content`: valida datas, títulos, tipos e disciplinas correntes.
- `npm test`: testa regras editoriais e utilitários.
- `npm run check`: verifica Astro e TypeScript.
- `npm run build`: valida, compila, cria a busca Pagefind e gera calendários ICS.
- `npm run test:e2e`: testa os fluxos principais em desktop e celular.
- `npm run sync:orcid`: atualiza a cópia local das publicações usando os dados públicos do ORCID e do Crossref.

## Atualizar as publicações

A página de publicações usa uma cópia versionada em `src/data/publications.json`, portanto continua funcionando mesmo se o ORCID estiver temporariamente indisponível. Para sincronizar novos trabalhos:

```bash
npm run sync:orcid
npm run build
```

Revise as referências geradas antes da publicação. Os registros são apresentados em estilo ABNT com os metadados disponíveis; campos ausentes na origem não são inventados.

## Editar uma disciplina

Cada disciplina por semestre é um único arquivo em `src/content/offerings/`. Para adicionar uma aula, inclua no `calendar`, mantendo ordem cronológica:

```yaml
- date: '2026-08-12'
  title: 'Aula 2: Camada de aplicação'
  type: aula
  status: planned
```

Para alterar uma data, preserve a anterior:

```yaml
- date: '2026-08-14'
  previous_date: '2026-08-12'
  title: 'Aula 2: Camada de aplicação'
  type: aula
  status: changed
  note: 'Data alterada por ajuste do calendário.'
```

Para cancelar, use `status: cancelled`; não apague o evento. Tipos aceitos: `aula`, `laboratorio`, `atividade`, `avaliacao`, `entrega`, `apresentacao`, `feriado` e `sem-aula`.

Materiais podem ficar no nível da disciplina ou vinculados a um evento:

```yaml
materials:
  - title: Slides da aula 2
    url: /files/redes/aula-02.pdf
    type: slides
    external: false
```

Arquivos locais ficam em `public/files/`. Não publique links privados, tokens ou dados de alunos.

## Abrir um semestre

1. Copie `src/content/offerings/_template.md.example` para um novo `.md`.
2. Altere período, turma, logística e calendário.
3. Marque a disciplina do semestre anterior como `current: false` e `status: archived`.
4. Marque apenas a disciplina do novo semestre como `current: true`.
5. Execute `npm run validate:content && npm test && npm run build`.

A URL da disciplina em cada semestre é imutável: `/ensino/{slug}/{ano-semestre}/`. A URL permanente `/ensino/{slug}/` aponta para o semestre corrente.

## GitHub Pages

O workflow em `.github/workflows/deploy.yml` valida pull requests e publica pushes em `main`. Ative **Settings → Pages → Source: GitHub Actions**. O `astro.config.mjs` detecta project pages pelo nome de `GITHUB_REPOSITORY`; `SITE_URL` e `BASE_PATH` podem substituir a configuração automaticamente.

Antes do lançamento, ajuste `site`/domínio, `public/robots.txt` e confirme as pendências em [migration-review.md](migration-review.md). O mapa de URLs antigas está em [legacy-redirects.json](legacy-redirects.json).

## Estrutura

- `src/content/`: fonte editorial em Markdown.
- `src/components/`: cartões, agenda e página de disciplina.
- `src/pages/`: rotas estáticas.
- `scripts/`: validação e geração de ICS.
- `tests/`: testes unitários e de navegação.
- `prompts/`: PRD original.

## Decisões de implementação

- Fontes do sistema e SVG local eliminam dependências visuais externas.
- O horário de referência é sempre `America/Sao_Paulo`.
- Pagefind é gerado depois do Astro e funciona sem serviço pago.
- Datas editoriais ficam no conteúdo; a interface apenas as apresenta.
- Disciplinas incompletas não receberam dados inventados e estão documentadas para revisão humana.
