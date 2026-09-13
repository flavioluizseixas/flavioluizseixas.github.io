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
- `npm run sync:calendar:mpn`: transfere a aba `2026.2` da planilha de planejamento para o calendário de Modelagem de Processos de Negócio.

## Atualizar as publicações

A página de publicações usa uma cópia versionada em `src/data/publications.json`, portanto continua funcionando mesmo se o ORCID estiver temporariamente indisponível. Para sincronizar novos trabalhos:

```bash
npm run sync:orcid
npm run build
```

Revise as referências geradas antes da publicação. Os registros são apresentados em estilo ABNT com os metadados disponíveis; campos ausentes na origem não são inventados.

## Atualizar o calendário de Processos de Negócio

A fonte versionada é `data/MPN Planejamento.xlsx`. Edite a aba do semestre e mantenha as colunas `Data` e `Conteúdo` preenchidas. As demais colunas aceitas são:

- `Referências`: texto bibliográfico exibido no evento.
- `Tipo`: `aula`, `laboratorio`, `atividade`, `avaliacao`, `entrega`, `apresentacao`, `feriado` ou `sem-aula`. Se ficar vazio, será inferido pelo título.
- `Status`: `planned`, `changed`, `cancelled` ou `completed`. Se ficar vazio, será usado `planned`.
- `Observações`: aviso opcional exibido no evento.

Para importar e validar:

```bash
npm run sync:calendar:mpn
npm run validate:content
```

Outro semestre ou arquivo pode ser selecionado sem alterar o script:

```bash
npm run sync:calendar:mpn -- --sheet 2027.1 --file "data/MPN Planejamento.xlsx" --offering src/content/offerings/modelagem-processos-2027-1.md
```

Para Aprendizado de Máquina para Saúde, a fonte versionada é `data/AMS Planejamento.xlsx`. Depois de editar a aba `2026.2`, execute:

```bash
npm run sync:calendar:ams
npm run validate:content
```

O arquivo usa as mesmas colunas `Referências`, `Tipo`, `Status` e `Observações`. Referências podem ficar vazias em atividades para as quais não se aplica uma leitura específica.

## Atualizar conteúdo bilíngue

O português é o idioma editorial de origem. As páginas institucionais mantêm os textos `pt` e `en` lado a lado no próprio arquivo `.astro`. As disciplinas, agendas, cursos e projetos permanecem em uma única fonte Markdown em português; as traduções correspondentes ficam em `src/i18n/content.ts`.

Ao alterar ou adicionar um texto acadêmico:

1. Edite a fonte em `src/content/`.
2. Adicione a tradução inglesa exata em `englishContent`, em `src/i18n/content.ts`.
3. Execute `npm run validate:content`.

A validação percorre títulos, resumos, ementas, avisos, tópicos, materiais e eventos. O build falha se algum texto publicável não tiver tradução, evitando que a versão inglesa fique silenciosamente desatualizada.

As rotas em português não têm prefixo (`/ensino/`, `/pesquisa/`). As equivalentes em inglês usam `/en/` e nomes traduzidos (`/en/teaching/`, `/en/research/`). O seletor no cabeçalho grava `site-locale` no `localStorage`; essa escolha sempre prevalece. Apenas na primeira visita, o site consulta `api.country.is` para distinguir Brasil dos demais países e usa o idioma do navegador como fallback.

## Publicar projetos da Fábrica de Software

O catálogo `/extensao/` usa a coleção Astro `extensionProjects`, separada dos projetos institucionais de pesquisa/extensão em `src/content/projects/`. Cada oportunidade tem um arquivo Markdown em `src/content/extension-projects/`; o front matter alimenta cards, filtros, equipe, metadados e a URL `/extensao/projetos/{slug}/`. O corpo contém a descrição completa.

Para adicionar um projeto:

1. Copie `src/content/extension-projects/_template.md.example` para um arquivo `.md` na mesma pasta.
2. Preencha todos os campos, usando `id` e `slug` únicos, sem acentos ou espaços. Atualize a data de publicação (`AAAA-MM-DD`) e o semestre (`01-AAAA` ou `02-AAAA`).
3. Escreva o conteúdo acadêmico nas seções do Markdown. Equipe e palavras-chave são exibidas a partir do front matter.
4. Execute `npm run validate:content`, `npm test`, `npm run check` e `npm run build`; revise e faça commit.

Status aceitos: `inscricoes-abertas`, `em-andamento` e `concluido`. Modalidades e áreas são listas livres; as opções dos filtros são geradas automaticamente. Um `link_inscricao` HTTP/HTTPS real é opcional; o botão de participação só aparece com esse campo preenchido e inscrições abertas. Sem formulário, o catálogo mantém o acesso à página institucional de contato.

O badge **Novo** vale por 60 dias corridos, incluindo o dia 60, a partir de `data_publicacao`, com referência ao dia em São Paulo. Ajuste `NEW_PROJECT_DAYS` em `src/lib/extension-projects.ts` para alterar o período. A seleção inicial de até três destaques é feita no build; o navegador também remove badges e destaques vencidos ao abrir a página. `destaque: true` mantém uma oportunidade aberta elegível ao destaque, mas não prolonga o badge Novo. Mudanças de status, conteúdo e seleção de destaques exigem novo build.

A busca ignora caixa e acentos e combina título, resumo, áreas, palavras-chave e equipe. Filtros podem ser compartilhados pela URL, por exemplo `/extensao/?status=inscricoes-abertas&area=saude-digital`. Sem JavaScript, todos os projetos e suas páginas continuam acessíveis.

Os três projetos de 2026.2 foram incorporados de `prompts/projetos_iniciacao_extensao_2026-2.md`, conforme `prompts/PRD_catalogo_projetos_extensao.md`. Ainda não há versões inglesas fornecidas: `/en/outreach/` mantém a apresentação institucional em inglês e aponta para o catálogo em português. As páginas individuais são publicadas apenas em português, sem anunciar traduções inexistentes; as demais rotas mantêm o seletor PT/EN. Esta coleção não exige entradas em `englishContent` até haver traduções revisadas.

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
- `src/pages/`: rotas estáticas em português e wrappers das rotas em inglês.
- `src/i18n/`: rotas, interface compartilhada e traduções do conteúdo acadêmico.
- `data/`: planilhas editoriais versionadas.
- `scripts/`: validação e geração de ICS.
- `tests/`: testes unitários e de navegação.
- `prompts/`: PRD original.

## Decisões de implementação

- Fontes do sistema e SVG local eliminam dependências visuais externas.
- O horário de referência é sempre `America/Sao_Paulo`.
- Pagefind é gerado depois do Astro e funciona sem serviço pago.
- Datas editoriais ficam no conteúdo; a interface apenas as apresenta.
- Disciplinas incompletas não receberam dados inventados e estão documentadas para revisão humana.
