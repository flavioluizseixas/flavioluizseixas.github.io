# Conteúdo do site

Este diretório é a fonte de todo o conteúdo editorial e das imagens. Para mudar textos, dados ou imagens, edite os arquivos daqui e execute `npm run build`.

## Projetos de extensão

1. Copie `extension-projects/_template.md.example` para `extension-projects/meu-projeto.md`.
2. Preencha o front matter e a descrição em Markdown. Use `id` e `slug` únicos.
3. Coloque a imagem em `images/` e configure o campo opcional `logo`:

   ```yaml
   logo:
     src: enfermagem.png
     alt: Logo da Enfermagem
   ```

4. Execute `npm run validate:content` e `npm run build`.

A coleção Astro percorre todos os `.md` de `extension-projects/`, inclusive subpastas, e gera o catálogo `/extensao/` e as páginas `/extensao/projetos/{slug}/`. O nome da pasta não muda a URL. Os arquivos `.example` não são publicados. Não existe uma lista manual de projetos a atualizar.

Os projetos atuais são da Enfermagem e usam a imagem `images/enfermagem.png`. Novos projetos podem indicar outras logos ou omitir o campo. O arquivo referenciado precisa existir e ter texto alternativo. PNG, JPEG, WebP, AVIF, GIF e SVG são aceitos.

## Onde editar

| Conteúdo                                          | Fonte                                                    |
| ------------------------------------------------- | -------------------------------------------------------- |
| Biografia, pesquisa, contato e outras páginas     | `pages/`, com português e inglês lado a lado             |
| Apresentação institucional da extensão            | `pages/extensao.ts`                                      |
| Textos do catálogo e duração do badge Novo        | `extension-catalog.ts`                                   |
| Nome, domínio, e-mail, ORCID e imagens principais | `site.json`                                              |
| Perfis acadêmicos e ordem das disciplinas atuais  | `profile.ts`                                             |
| Textos compartilhados e traduções acadêmicas      | `i18n/`                                                  |
| Disciplinas e agendas por semestre                | `courses/` e `offerings/`                                |
| Projetos institucionais                           | `projects/`                                              |
| Publicações                                       | `publications.json`, atualizado por `npm run sync:orcid` |
| Planilhas de planejamento e semestre a importar   | `planning/` e `planning/calendars.json`                  |
| Logos e retrato                                   | `images/`                                                |
| Materiais publicados em `/files/`                 | `static/files/`                                          |
| Política de indexação por buscadores              | `static/robots.txt`                                      |

Os módulos `.ts` desta pasta contêm apenas dados; os componentes e algoritmos ficam em `src/` e `scripts/`. A importação das imagens é automática, inclusive para novos arquivos, e respeita o caminho base do GitHub Pages.

`sources/` guarda documentos originais para consulta histórica. Edite os Markdown individuais, não esses documentos. Eles e as planilhas não são publicados como downloads. `prompts/` fica reservado às instruções de trabalho, sem dependência do build.
