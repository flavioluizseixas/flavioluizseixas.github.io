# Site acadêmico — Flávio Luiz Seixas

Site estático acadêmico construído com Astro, Markdown e CSS próprio. O projeto prioriza o acesso rápido aos calendários e funciona em GitHub Pages (domínio de usuário ou project page). A integração opcional de inscrições usa Google Apps Script para gravar respostas e PDFs no Drive institucional.

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
- `npm run test:e2e:registrations`: testa o formulário em desktop e celular com o Google simulado.
- `npm run prepare:registrations`: gera a configuração do Apps Script a partir dos projetos e textos em `data/`.
- `npm run sync:orcid`: atualiza a cópia local das publicações usando os dados públicos do ORCID e do Crossref.
- `npm run sync:calendar:mpn`: transfere a aba `2026.2` da planilha de planejamento para o calendário de Modelagem de Processos de Negócio.

## Atualizar as publicações

A página de publicações usa uma cópia versionada em `data/publications.json`, portanto continua funcionando mesmo se o ORCID estiver temporariamente indisponível. Para sincronizar novos trabalhos:

```bash
npm run sync:orcid
npm run build
```

Revise as referências geradas antes da publicação. Os registros são apresentados em estilo ABNT com os metadados disponíveis; campos ausentes na origem não são inventados.

## Atualizar o calendário de Processos de Negócio

A fonte versionada é `data/planning/MPN Planejamento.xlsx`. Edite a aba do semestre e mantenha as colunas `Data` e `Conteúdo` preenchidas. As demais colunas aceitas são:

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
npm run sync:calendar:mpn -- --sheet 2027.1 --file "data/planning/MPN Planejamento.xlsx" --offering data/offerings/modelagem-processos-2027-1.md
```

Para Aprendizado de Máquina para Saúde, a fonte versionada é `data/planning/AMS Planejamento.xlsx`. Depois de editar a aba `2026.2`, execute:

```bash
npm run sync:calendar:ams
npm run validate:content
```

O arquivo usa as mesmas colunas `Referências`, `Tipo`, `Status` e `Observações`. Referências podem ficar vazias em atividades para as quais não se aplica uma leitura específica.

## Atualizar conteúdo bilíngue

O português é o idioma editorial de origem. As páginas institucionais mantêm os textos `pt` e `en` lado a lado em `data/pages/`. As disciplinas, agendas, cursos e projetos permanecem em uma única fonte Markdown em português; as traduções correspondentes ficam em `data/i18n/content.ts`. Textos compartilhados de navegação, agenda e disciplinas ficam em `data/i18n/`. Os arquivos `.astro` apenas organizam e apresentam esses dados.

Ao alterar ou adicionar um texto acadêmico:

1. Edite a fonte em `data/`.
2. Adicione a tradução inglesa exata em `englishContent`, em `data/i18n/content.ts`.
3. Execute `npm run validate:content`.

A validação percorre títulos, resumos, ementas, avisos, tópicos, materiais e eventos. O build falha se algum texto publicável não tiver tradução, evitando que a versão inglesa fique silenciosamente desatualizada.

As rotas em português não têm prefixo (`/ensino/`, `/pesquisa/`). As equivalentes em inglês usam `/en/` e nomes traduzidos (`/en/teaching/`, `/en/research/`). O seletor no cabeçalho grava `site-locale` no `localStorage`; essa escolha sempre prevalece. Apenas na primeira visita, o site consulta `api.country.is` para distinguir Brasil dos demais países e usa o idioma do navegador como fallback.

## Publicar projetos da Fábrica de Software

O catálogo `/extensao/` usa a coleção Astro `extensionProjects`, separada dos projetos institucionais de pesquisa/extensão em `data/projects/`. Cada oportunidade tem um arquivo Markdown em `data/extension-projects/`; o front matter alimenta cards, filtros, equipe, metadados e a URL `/extensao/projetos/{slug}/`. O corpo contém a descrição completa.

O carregador percorre automaticamente o diretório e suas subpastas durante o build. Adicionar um `.md` válido basta para gerar o cartão e a página individual: não é preciso cadastrar o projeto em uma lista ou editar os componentes. O catálogo reúne projetos da Enfermagem ligados ao PEA/UFF e uma pesquisa sobre ventilação mecânica em parceria com a Fiocruz; novas áreas e modalidades são aceitas sem alterações no código.

Para adicionar um projeto:

1. Copie `data/extension-projects/_template.md.example` para um arquivo `.md` na mesma pasta.
2. Preencha todos os campos, usando `id` e `slug` únicos, sem acentos ou espaços. Atualize a data de publicação (`AAAA-MM-DD`) e o semestre (`01-AAAA` ou `02-AAAA`).
3. Escreva o conteúdo acadêmico nas seções do Markdown. Equipe e palavras-chave são exibidas a partir do front matter. Para exibir uma logo, coloque a imagem em `data/images/` e informe `logo.src` e `logo.alt`.
4. Execute `npm run prepare:registrations`, `npm run validate:content`, `npm test`, `npm run check` e `npm run build`; revise e faça commit. Se as inscrições estiverem ativas, atualize também a implantação no Google conforme o guia abaixo.

Status aceitos: `inscricoes-abertas`, `em-andamento` e `concluido`. Modalidades e áreas são listas livres; as opções dos filtros são geradas automaticamente. Um `link_inscricao` HTTP/HTTPS real é opcional e tem precedência sobre o formulário nativo. Nos demais projetos abertos, a ativação em `data/registration.json` exibe o formulário na própria página. Enquanto ele não estiver configurado, é exibido um contato.

O [guia de inscrições no Google Drive](docs/inscricoes-google-drive.md) explica como autorizar a conta `@id.uff.br`, criar as pastas, implantar o Apps Script e ativar o envio. O aluno informa nome, e-mail institucional, histórico em PDF e interesse pelo projeto, sem código de confirmação. Textos ficam em `data/registration-copy.json`; a rotina do Google fica em `integrations/google-apps-script/`. Respostas reais nunca devem ser versionadas neste repositório público.

O badge **Novo** vale por 60 dias corridos, incluindo o dia 60, a partir de `data_publicacao`, com referência ao dia em São Paulo. Ajuste `NEW_PROJECT_DAYS` em `data/extension-catalog.ts` para alterar o período; esse arquivo também reúne os textos do catálogo e das páginas individuais. O navegador também remove badges vencidos ao abrir a página. Todas as oportunidades com inscrições abertas aparecem na primeira seção, independentemente da idade ou do campo opcional `destaque`, sem limite de três e sem repetir cards na busca. Mudanças de status e conteúdo exigem novo build.

A busca é exclusiva dos projetos em andamento e concluídos. Ela ignora caixa e acentos e combina título, resumo, áreas, palavras-chave e equipe. Filtros podem ser compartilhados pela URL, por exemplo `/extensao/?status=em-andamento&area=saude-digital`. Quando não há projetos nesses estados, a seção apresenta uma mensagem e oculta os filtros. As oportunidades abertas continuam visíveis durante a busca. Sem JavaScript, todos os projetos e suas páginas continuam acessíveis.

Os documentos originais dos projetos foram preservados em `data/sources/` somente como histórico. A fonte de edição e publicação é `data/extension-projects/`. Build e testes não dependem de `prompts/` nem do histórico. Ainda não há versões inglesas fornecidas: `/en/outreach/` mantém a apresentação institucional em inglês e aponta para o catálogo em português. As páginas individuais são publicadas apenas em português, sem anunciar traduções inexistentes; as demais rotas mantêm o seletor PT/EN. Esta coleção não exige entradas em `englishContent` até haver traduções revisadas.

Exemplo de logo no front matter:

```yaml
logo:
  src: enfermagem.png
  alt: Logo da Enfermagem
```

O caminho é relativo a `data/images/` e aceita subpastas. Logos são opcionais e específicas de cada projeto: os projetos da Enfermagem usam `enfermagem.png`, e a pesquisa em parceria com a Fiocruz usa `fiocruz.jpg`. A mesma logo aparece no cartão e na página individual. Uma referência a imagem inexistente faz a validação falhar.

## Editar uma disciplina

Cada disciplina por semestre é um único arquivo em `data/offerings/`. Para adicionar uma aula, inclua no `calendar`, mantendo ordem cronológica:

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

Arquivos locais ficam em `data/static/files/` e são publicados em `/files/`. Não publique links privados, tokens ou dados de alunos.

## Abrir um semestre

1. Copie `data/offerings/_template.md.example` para um novo `.md`.
2. Altere período, turma, logística e calendário.
3. Marque a disciplina do semestre anterior como `current: false` e `status: archived`.
4. Marque apenas a disciplina do novo semestre como `current: true`.
5. Execute `npm run validate:content && npm test && npm run build`.

A URL da disciplina em cada semestre é imutável: `/ensino/{slug}/{ano-semestre}/`. A URL permanente `/ensino/{slug}/` aponta para o semestre corrente.

## GitHub Pages

O workflow em `.github/workflows/deploy.yml` valida pull requests e publica pushes em `main`. Ele também permite publicar manualmente pela aba **Actions → Validar e publicar → Run workflow**, selecionando `main`. Ative **Settings → Pages → Build and deployment → Source: GitHub Actions**. O `astro.config.mjs` detecta project pages pelo nome de `GITHUB_REPOSITORY`; `SITE_URL` e `BASE_PATH` podem substituir a configuração automaticamente.

Se o log executar `actions/jekyll-build-pages` e mostrar `Invalid YAML front matter` em arquivos `.astro`, a publicação está usando Jekyll. O bloco inicial de um componente Astro contém JavaScript/TypeScript; o Jekyll tenta interpretá-lo como YAML. Selecione **GitHub Actions** como origem e use o workflow **Validar e publicar**, que executa `npm run build` e envia somente `dist/`. O workflow existente dispensa a criação de um template Jekyll. Adicionar apenas `.nojekyll` à raiz não compila o código Astro.

Referência: [configurar a origem de publicação do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow).

Antes do lançamento, ajuste o domínio em `data/site.json`, `data/static/robots.txt` e confirme as pendências em [migration-review.md](docs/migration-review.md). O mapa de URLs antigas está em [legacy-redirects.json](data/legacy-redirects.json).

## Estrutura

| Diretório ou arquivo                                    | Responsabilidade                                                                 |
| ------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `data/extension-projects/`                              | Um Markdown por projeto divulgado, incluindo a referência à logo                 |
| `data/courses/`, `data/offerings/`, `data/projects/`    | Disciplinas, ofertas semestrais e projetos institucionais                        |
| `data/pages/`, `data/i18n/`                             | Textos das páginas, interface e traduções                                        |
| `data/site.json`, `data/profile.ts`                     | Identidade, contato, imagens do site, perfis e ordem das disciplinas             |
| `data/extension-catalog.ts`                             | Textos e configuração editorial do catálogo                                      |
| `data/registration.json`, `data/registration-copy.json` | Configuração e textos dos formulários de inscrição                               |
| `data/publications.json`                                | Cópia versionada das publicações                                                 |
| `data/images/`                                          | Logos, retrato e imagens; processadas pelo Astro/Vite                            |
| `data/planning/`                                        | Planilhas e configuração de importação em `calendars.json`                       |
| `data/static/`                                          | Arquivos copiados sem processamento, como `robots.txt` e materiais para download |
| `data/sources/`                                         | Histórico editorial; não alimenta as páginas                                     |
| `src/`                                                  | Rotas, componentes, layouts, estilos, carregadores e lógica                      |
| `scripts/`                                              | Validação, sincronização de dados e geração de ICS                               |
| `integrations/google-apps-script/`                      | Rotina de gravação de inscrições para implantar na conta Google institucional    |
| `docs/`                                                 | Inventário de conteúdo e revisão da migração                                     |
| `tests/`                                                | Testes unitários e de navegação                                                  |
| `prompts/`                                              | Instruções de trabalho locais; não armazena imagens nem conteúdo a publicar      |

Consulte [data/README.md](data/README.md) para escolher o arquivo de edição. Somente `data/static/` é copiado integralmente para o site; planilhas, fontes históricas e arquivos editoriais não são expostos como downloads automaticamente.

## Decisões de implementação

- Fontes do sistema e SVG local eliminam dependências visuais externas.
- O horário de referência é sempre `America/Sao_Paulo`.
- Pagefind é gerado depois do Astro e funciona sem serviço pago.
- Datas editoriais ficam no conteúdo; a interface apenas as apresenta.
- Disciplinas incompletas não receberam dados inventados e estão documentadas para revisão humana.
