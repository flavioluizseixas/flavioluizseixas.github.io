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

4. Execute `npm run prepare:registrations`, `npm run validate:content` e `npm run build`. Com inscrições ativas, atualize também a configuração no Google conforme o [guia de autorização](../docs/inscricoes-google-drive.md).

A coleção Astro percorre os `.md` de `extension-projects/`, inclusive subpastas de projetos, e gera o catálogo `/extensao/` e as páginas `/extensao/projetos/{slug}/`. A pasta auxiliar `extension-projects/google-forms/` é excluída tanto pelo Astro quanto pelos scripts de conteúdo: seus arquivos de automação e documentação não são projetos. O nome das subpastas de projetos não muda a URL. Os arquivos `.example` não são publicados. Não existe uma lista manual de projetos a atualizar.

Para definir a sequência das oportunidades com inscrições abertas, edite o campo opcional `ordem` no front matter de cada projeto:

```yaml
status: inscricoes-abertas
ordem: 1
```

Use inteiros positivos: `1` aparece antes de `2`, e assim por diante. Os números não precisam ser consecutivos. Projetos sem `ordem` ficam depois dos que têm ordem definida. Em caso de empate ou ausência do campo, vale a data de publicação mais recente e, depois, o título em ordem alfabética. O campo só afeta projetos com `status: inscricoes-abertas`; projetos em andamento e concluídos mantêm a ordenação por status e data. Execute `npm run build` para aplicar as alterações ao site gerado.

Os projetos da Enfermagem usam `images/enfermagem.png`; os projetos sobre ventilação mecânica e recuperação funcional na UTI em parceria com a Fiocruz usam `images/fiocruz.jpg`. Novos projetos podem indicar outras logos ou omitir o campo. O arquivo referenciado precisa existir e ter texto alternativo. PNG, JPEG, WebP, AVIF, GIF e SVG são aceitos.

## Onde editar

| Conteúdo                                                | Fonte                                                    |
| ------------------------------------------------------- | -------------------------------------------------------- |
| Biografia, pesquisa, contato e outras páginas           | `pages/`, com português e inglês lado a lado             |
| Apresentação institucional da extensão                  | `pages/extensao.ts`                                      |
| Textos do catálogo e duração do badge Novo              | `extension-catalog.ts`                                   |
| Ativação, URL e limites do formulário de inscrição      | `registration.json`                                      |
| Campos, mensagens e aviso de uso dos dados de inscrição | `registration-copy.json`                                 |
| Nome, domínio, e-mail, ORCID e imagens principais       | `site.json`                                              |
| Perfis acadêmicos e ordem das disciplinas atuais        | `profile.ts`                                             |
| Textos compartilhados e traduções acadêmicas            | `i18n/`                                                  |
| Disciplinas e agendas por semestre                      | `courses/` e `offerings/`                                |
| Projetos institucionais                                 | `projects/`                                              |
| Publicações                                             | `publications.json`, atualizado por `npm run sync:orcid` |
| Planilhas de planejamento e semestre a importar         | `planning/` e `planning/calendars.json`                  |
| Logos e retrato                                         | `images/`                                                |
| Materiais publicados em `/files/`                       | `static/files/`                                          |
| Política de indexação por buscadores                    | `static/robots.txt`                                      |

Os módulos `.ts` desta pasta contêm apenas dados; os componentes e algoritmos ficam em `src/` e `scripts/`. A importação das imagens é automática, inclusive para novos arquivos, e respeita o caminho base do GitHub Pages.

`sources/` guarda documentos originais para consulta histórica. Edite os Markdown individuais, não esses documentos. Eles e as planilhas não são publicados como downloads. `prompts/` fica reservado às instruções de trabalho, sem dependência do build.
