# PRD — Novo site acadêmico de Flávio Luiz Seixas

**Versão:** 1.0  
**Data:** 21/07/2026  
**Destino:** GitHub Pages  
**Idioma principal:** português do Brasil  
**Documento para implementação pelo Codex**

## 1. Resumo executivo

Desenvolver um novo site pessoal acadêmico para Flávio Luiz Seixas, professor do Instituto de Computação da Universidade Federal Fluminense (UFF), substituindo progressivamente a estrutura atual em MediaWiki. O site deverá ser moderno, responsivo, acessível, rápido e simples de manter. O conteúdo editorial será armazenado prioritariamente em arquivos Markdown/MDX; toda alteração submetida ao repositório deverá ser automaticamente compilada e publicada no GitHub Pages.

O principal caso de uso é acadêmico: um aluno deve localizar sua disciplina atual e descobrir a próxima aula, próximas avaliações, materiais e calendário completo em poucos segundos, inclusive pelo celular. O segundo caso de uso é institucional: estudantes, pesquisadores e parceiros devem encontrar biografia, interesses, projetos, produção e formas de contato.

## 2. Diagnóstico do conteúdo atual

Foram examinadas a página principal e as páginas de Modelagem de Processos de Negócios, Redes de Computadores, Programação de Aplicações Web e Aprendizado de Máquina na Saúde, incluindo páginas semestrais e recursos internos/externos diretamente vinculados quando acessíveis.

### 2.1 Conteúdo existente a preservar e reorganizar

| Área | Conteúdo encontrado | Tratamento no novo site |
|---|---|---|
| Página principal | Disciplinas atuais e dos últimos anos, projeto de extensão, biografia, interesses, contato, Lattes, Google Scholar, ORCID, LinkedIn e tese | Transformar em página inicial orientada a tarefas e páginas institucionais próprias |
| Modelagem de Processos | Logística, objetivo, ementa, calendário, ferramentas BPMN, bibliografia e links | Migrar para disciplina versionada por semestre; destacar calendário e projeto AS-IS/TO-BE |
| Redes de Computadores | Logística, ementa, calendário, bibliografia, Packet Tracer, Wireshark e extras | Migrar para disciplina versionada; categorizar aulas, laboratórios, provas e projeto |
| Aplicações Web | Objetivo, ementa, planejamento semanal, aulas gravadas, bibliografia, IDEs e extras | Migrar e marcar como conteúdo histórico quando não for oferta corrente; preservar links válidos |
| ML na Saúde | Logística, objetivo, ementa, tópicos, avaliação, implementação, cronograma, referências por tema, periódicos/conferências e bibliografia | Dividir em visão geral, avaliação, calendário, materiais/referências; preservar profundidade sem sobrecarregar a página inicial da disciplina |
| Ofertas antigas | Páginas distintas por período (ex.: 2024.1, 2024.2 e 2025.2) | Criar arquivo pesquisável por disciplina e semestre, sem misturar calendário antigo com o atual |

### 2.2 Problemas observados

- A interface genérica do MediaWiki compete visualmente com o conteúdo acadêmico.
- A página inicial não mostra imediatamente a próxima aula ou os próximos prazos.
- Calendários extensos são tabelas pouco confortáveis em telas pequenas.
- O calendário, a oferta e os dados logísticos não possuem modelo consistente entre disciplinas.
- Ofertas atuais e históricas podem ser confundidas.
- Materiais, ferramentas, bibliografia e links externos aparecem em listas longas, sem filtros ou estados.
- Há dados que exigem validação durante a migração, como a data `29/04/2926`, links sem destino visível e calendários antigos sem data em todas as linhas.
- O site não apresenta busca orientada a disciplinas/materiais e não oferece feed de calendário.
- A atualização depende de edição em Wiki e não possui validação automatizada de datas, links ou estrutura.

## 3. Objetivos do produto

1. Fazer o aluno chegar ao calendário da disciplina corrente em no máximo dois cliques.
2. Mostrar na página inicial e em cada disciplina a próxima atividade e os próximos prazos.
3. Permitir manutenção cotidiana por edição de Markdown, sem alterar componentes de interface.
4. Preservar ofertas anteriores em arquivo claramente identificado.
5. Automatizar build, testes e publicação no GitHub Pages.
6. Oferecer experiência consistente em desktop e celular, com acessibilidade WCAG 2.2 nível AA.
7. Melhorar a presença acadêmica do professor, integrando ensino, pesquisa, extensão e perfis científicos.

## 4. Não objetivos da primeira versão

- Substituir Google Classroom, Moodle ou sistemas oficiais da UFF.
- Receber trabalhos, lançar notas ou armazenar dados pessoais de alunos.
- Criar autenticação ou área privada.
- Implementar um CMS com banco de dados.
- Copiar automaticamente toda a aparência ou todos os metadados do MediaWiki.
- Atualizar ementas ou referências academicamente sem revisão do professor.

## 5. Usuários e necessidades

### 5.1 Aluno de disciplina corrente — usuário prioritário

Precisa responder rapidamente: “qual é a próxima aula?”, “há prova ou entrega próxima?”, “onde estão os slides/notebooks?”, “qual é a sala?” e “o calendário mudou?”. Usa majoritariamente celular e chega por link direto ou busca.

### 5.2 Aluno de período anterior

Procura materiais, bibliografia ou o calendário de uma oferta específica. Deve perceber claramente que está vendo uma versão arquivada.

### 5.3 Candidato, pesquisador ou parceiro

Procura biografia, linhas de pesquisa, projetos, publicações e perfis como Lattes, ORCID e Google Scholar.

### 5.4 Professor/editor

Deseja atualizar calendário, aviso ou material alterando poucos arquivos Markdown/YAML, com preview local e validação automática antes da publicação.

## 6. Princípios de experiência

- **Calendário primeiro:** disciplinas correntes sempre expõem próxima atividade e calendário no primeiro viewport ou logo abaixo do resumo.
- **Atual versus arquivo:** semestre atual usa destaque visual; páginas antigas exibem faixa “Oferta encerrada — semestre X”.
- **Divulgação progressiva:** informações urgentes primeiro; ementa, referências e histórico depois.
- **Links com significado:** usar rótulos como “Slides da aula 3”, nunca “aqui”.
- **Conteúdo é a fonte de verdade:** componentes apenas apresentam dados; não duplicar datas no código.
- **Mobile first:** tabelas viram cartões/agenda em telas estreitas.
- **Institucional sem rigidez:** visual sóbrio, humano e contemporâneo, inspirado na identidade da UFF sem depender de assets protegidos ou de carregamento externo.

## 7. Arquitetura de informação

### 7.1 Navegação global

- Início
- Ensino
- Pesquisa
- Extensão
- Publicações
- Sobre
- Busca

No celular, usar menu compacto e manter um atalho persistente “Disciplinas”. Não colocar ofertas antigas na navegação principal.

### 7.2 Mapa do site

```text
/
├── ensino/
│   ├── index.md                         # disciplinas atuais + arquivo
│   ├── modelagem-processos/
│   │   ├── index.md                     # visão geral permanente
│   │   └── ofertas/2026-1.md
│   ├── redes-computadores/
│   │   ├── index.md
│   │   └── ofertas/2025-2.md
│   ├── programacao-web/
│   │   ├── index.md
│   │   └── ofertas/2024-1.md
│   └── aprendizado-maquina-saude/
│       ├── index.md
│       └── ofertas/2025-2.md
├── pesquisa/index.md
├── extensao/index.md
├── publicacoes/index.md
├── sobre/index.md
├── contato/index.md
└── arquivo/index.md
```

Cada disciplina deve ter URL permanente e cada oferta, URL imutável. O `index.md` da disciplina aponta para a oferta corrente definida por metadado, evitando quebrar links compartilhados.

## 8. Requisitos funcionais

### RF-01 — Página inicial orientada a tarefas

A página inicial deve conter, nesta ordem:

1. Cabeçalho compacto com nome, cargo e vínculo UFF.
2. Bloco “Ensino neste semestre” com cartões das disciplinas ativas.
3. Bloco “Próximas atividades” agregado dos calendários ativos, limitado inicialmente a cinco itens futuros.
4. Acesso rápido a Lattes, ORCID, Google Scholar, GitHub e e-mail institucional.
5. Resumo curto de pesquisa e extensão com chamadas para páginas internas.

Cada cartão de disciplina deve mostrar nome, código, turma, dias/horário, sala, próxima atividade e botão “Ver calendário”.

### RF-02 — Página de disciplina

Toda oferta deve suportar:

- nome, código, nível, turma, período, estado e idioma;
- dias/horário, sala e links de ambiente virtual;
- aviso destacado opcional;
- próxima atividade calculada pela data local `America/Sao_Paulo`;
- navegação interna: Visão geral, Calendário, Avaliação, Materiais e Referências;
- calendário completo com filtros por categoria;
- links para semestre anterior/próximo quando existirem;
- indicação inequívoca de oferta atual ou arquivada;
- data da última atualização obtida do Git, sem edição manual.

### RF-03 — Calendário acadêmico estruturado

O calendário deve ser mantido preferencialmente em YAML dentro do frontmatter ou em arquivo de dados YAML/JSON referenciado pelo Markdown. Cada evento deverá aceitar:

```yaml
- date: 2026-03-09
  end_date: null
  title: "Apresentação do curso"
  type: aula          # aula | laboratorio | atividade | avaliacao | entrega | apresentacao | feriado | sem-aula
  topics: []
  references: []
  materials: []
  status: planned     # planned | changed | cancelled | completed
  note: null
```

Regras:

- Datas devem usar ISO 8601 no conteúdo e `dd/mm/aaaa` na interface.
- O build deve falhar para datas inválidas, eventos sem título ou tipos desconhecidos.
- Eventos alterados preservam opcionalmente `previous_title`/`previous_date` e recebem marcador “Alterado”.
- Eventos cancelados não são apagados: ficam visíveis como cancelados.
- Avaliações, entregas e apresentações usam destaque sem depender apenas de cor.
- Disponibilizar visualização “Agenda” como padrão e “Tabela” como alternativa.
- Oferecer download `.ics` por disciplina e um `.ics` agregado das disciplinas ativas.
- Permitir links diretos para eventos (`#2026-04-15-p1`).
- Gerar automaticamente “próxima atividade” e “próximas avaliações”.

### RF-04 — Materiais e recursos

Materiais devem poder ser ligados a evento ou agrupados por tipo: slides, exercício, notebook, vídeo, software, leitura e dataset. Cada item aceita título, URL/caminho, formato, descrição curta, idioma e indicação de acesso externo.

Links para Google Drive/Classroom não devem revelar identificadores sensíveis ou exigir que o site contorne permissões. Links quebrados devem ser reportados no CI, com lista de domínios que podem ser ignorados por exigirem autenticação.

### RF-05 — Busca

Implementar busca estática, sem serviço pago, indexando títulos, subtítulos, disciplinas, códigos, semestres, tópicos e materiais. A busca deve priorizar ofertas correntes e permitir filtrar por “Disciplina”, “Material”, “Pesquisa” e “Página”. Sugestão: Pagefind após o build.

### RF-06 — Arquivo de disciplinas

Exibir ofertas agrupadas por ano/semestre e por disciplina. A oferta atual aparece separada. A página arquivada deve conter banner, período e link para a versão corrente. Nunca redirecionar silenciosamente um semestre antigo para o novo.

### RF-07 — Avisos

Permitir avisos em Markdown com níveis `info`, `attention` e `urgent`, data de início, expiração e escopo (site ou disciplina). Avisos expirados não aparecem, mas permanecem no histórico Git. A primeira versão não precisa de notificações push.

### RF-08 — Conteúdo institucional

- Sobre: biografia curta e completa, áreas de interesse e contato institucional.
- Pesquisa: linhas e projetos selecionados, com links.
- Extensão: Fábrica de Software e Tecnologia para a Saúde e outros projetos.
- Publicações: inicialmente curadoria Markdown e links para Lattes/Scholar/ORCID; integração automática poderá ser fase futura.
- Contato: e-mail em formato resistente a coleta simples, endereço profissional e links acadêmicos.

### RF-09 — Redirecionamentos e migração

Criar mapa `legacy-url -> new-url`. Como o domínio antigo pode não permitir redirects no servidor, manter uma página de transição na Wiki com links canônicos e, quando possível, configurar redirecionamentos. Preservar títulos/âncoras relevantes e adicionar canonical URL no novo site.

### RF-10 — SEO e compartilhamento

Gerar title/description, Open Graph, sitemap.xml, robots.txt, favicon, canonical URL e JSON-LD do tipo `Person` na página institucional e `Course` nas disciplinas. Não indexar previews de pull request.

## 9. Modelo editorial e exemplos

### 9.1 Frontmatter de oferta

```yaml
---
title: "Modelagem de Processos de Negócios"
code: "TCC00330"
slug: "modelagem-processos"
term: "2026.1"
current: true
status: "active"
level: "graduacao"
class_group: "A1"
schedule: "Segundas e quartas, 18h–20h"
room: "308"
timezone: "America/Sao_Paulo"
classroom_url: null
summary: "Descoberta, modelagem, análise e redesenho de processos de negócio."
calendar:
  - date: 2026-03-09
    title: "Apresentação do curso"
    type: "aula"
    status: "completed"
---
```

Após o frontmatter, o editor escreve Markdown comum para objetivo, ementa, avaliação, materiais e referências.

### 9.2 Coleções de conteúdo

Definir schemas tipados para `courses`, `offerings`, `projects`, `publications`, `notices` e `pages`. Validar unicidade de `current: true` por disciplina e impedir que duas ofertas da mesma disciplina sejam simultaneamente correntes.

## 10. Requisitos de interface

### 10.1 Direção visual

- Estética acadêmica contemporânea, limpa e acolhedora.
- Paleta base: azul profundo, azul claro, neutros quentes e uma cor de destaque; validar contraste AA.
- Tipografia legível com fontes locais ou system stack; evitar dependência de Google Fonts.
- Largura confortável de leitura (aprox. 70–75 caracteres para texto).
- Ícones acompanhados de rótulos quando a ação não for óbvia.
- Modo escuro opcional respeitando `prefers-color-scheme`.
- Usar imagens com parcimônia; o calendário e o conteúdo devem carregar antes de elementos decorativos.

### 10.2 Componente de agenda

No desktop, cada linha mostra data/dia da semana, categoria, título, tópicos, materiais e status. No celular, cada evento vira cartão com data destacada. Deve haver:

- botão “Ir para hoje/próxima aula”;
- chips de filtro acessíveis por categoria;
- seção curta “Próximos” antes do calendário completo;
- marcador textual para prova, entrega, alteração e cancelamento;
- impressão limpa, ocultando navegação e controles.

### 10.3 Estados

Prever loading mínimo, resultado vazio de busca, calendário sem eventos futuros, link indisponível, disciplina sem oferta corrente e erro 404 com atalhos para Ensino e Busca.

## 11. Arquitetura técnica recomendada

### 11.1 Stack

- **Framework:** Astro (versão estável atual no momento da implementação).
- **Conteúdo:** Markdown/MDX e Astro Content Collections.
- **Componentes interativos:** Astro/TypeScript; usar JavaScript no cliente apenas para busca, filtros e controles necessários.
- **Estilos:** CSS moderno com tokens próprios; evitar framework pesado salvo justificativa documentada.
- **Busca:** Pagefind, gerado após build.
- **Calendário ICS:** script TypeScript no build.
- **Testes:** Vitest para dados/utilitários, Playwright para fluxos críticos e axe para acessibilidade.
- **Qualidade:** ESLint, Prettier e Markdownlint.
- **Deploy:** GitHub Actions + GitHub Pages.

Astro é preferido a Jekyll porque fornece schemas de conteúdo, componentes e busca moderna sem abandonar Markdown. Evitar Next.js: o produto não necessita servidor, hidratação ampla ou infraestrutura além do GitHub Pages.

### 11.2 Estrutura sugerida do repositório

```text
site-academico/
├── .github/workflows/deploy.yml
├── public/
│   ├── files/
│   └── images/
├── scripts/
│   ├── generate-ics.ts
│   ├── validate-links.ts
│   └── migrate-content.ts
├── src/
│   ├── components/
│   ├── content/
│   │   ├── courses/
│   │   ├── offerings/
│   │   ├── notices/
│   │   ├── projects/
│   │   └── publications/
│   ├── content.config.ts
│   ├── layouts/
│   ├── pages/
│   └── styles/
├── tests/
├── astro.config.mjs
├── package.json
└── README.md
```

### 11.3 GitHub Pages

- Suportar tanto `usuario.github.io` quanto project page `usuario.github.io/repositorio/` por configuração de `site` e `base`.
- Usar somente caminhos compatíveis com `base` configurável.
- Workflow: checkout → setup Node LTS → `npm ci` → lint → validação de conteúdo → testes → build → Pagefind → teste de links internos → upload artifact → deploy Pages.
- Pull requests devem produzir build verificável; se previews externos não estiverem disponíveis, anexar artifact navegável e instruções de execução local.
- Habilitar domínio customizado futuramente sem mudança estrutural.

## 12. Segurança, privacidade e acessibilidade

- Não incluir dados pessoais de alunos, listas de notas, tokens, IDs privados ou arquivos restritos.
- Links externos abertos em nova aba devem usar `rel="noopener noreferrer"` e avisar quando apropriado.
- Aplicar Content Security Policy compatível com site estático.
- Navegação completa por teclado, foco visível, link “Pular para conteúdo”, landmarks semânticos e cabeçalhos hierárquicos.
- Contraste WCAG AA, zoom a 200%, alvos de toque adequados e respeito a redução de movimento.
- Tabelas devem possuir cabeçalhos; no mobile, a transformação visual não pode destruir a semântica.
- Datas devem incluir forma legível e atributo `datetime` ISO.

## 13. Migração de conteúdo

### Fase A — Inventário

1. Registrar todas as páginas de destino e páginas semestrais chamadas por elas.
2. Extrair títulos, seções, calendários, materiais, referências e links.
3. Classificar cada item como `migrar`, `arquivar`, `corrigir`, `validar` ou `descartar`.
4. Produzir relatório de links quebrados e redirecionamentos.

### Fase B — Normalização

1. Converter datas para ISO.
2. Normalizar nomes e códigos de disciplinas.
3. Separar conteúdo permanente (objetivo/ementa) de conteúdo da oferta (turma/calendário/avaliações).
4. Marcar conteúdo antigo como arquivado.
5. Não corrigir silenciosamente ambiguidades: gerar `migration-review.md`.

Itens já identificados para revisão: data `29/04/2926` em Modelagem; links de Classroom vazios; sala `--` em Redes; numeração repetida de “Laboratório 4”; cronograma de Aplicações Web com datas apenas em avaliações; referências e URLs antigas; coerência entre nomes “Aprendizado de máquina na saúde” e “Introdução ao Aprendizado de Máquina para Saúde”.

### Fase C — Validação humana

Apresentar diff por página, lista de dúvidas e preview. O professor aprova o conteúdo antes de tornar o novo domínio canônico.

## 14. Critérios de aceitação

### Conteúdo e navegação

- [ ] Todas as cinco áreas de origem estão representadas no novo site.
- [ ] Um aluno chega ao calendário de qualquer disciplina ativa em até dois cliques.
- [ ] A página inicial mostra automaticamente as próximas atividades válidas.
- [ ] Cada oferta antiga exibe semestre e estado arquivado de forma visível.
- [ ] Busca encontra disciplina por nome, código e tópico.
- [ ] Calendários não exigem edição de componentes para atualização.
- [ ] Links de materiais estão associados a rótulos descritivos.

### Engenharia

- [ ] `npm run build` gera site totalmente estático.
- [ ] Push na branch principal publica automaticamente no GitHub Pages.
- [ ] Datas inválidas e schemas inconsistentes bloqueiam o build.
- [ ] Feed `.ics` é válido e contém avaliações/atividades futuras.
- [ ] Não existem links internos quebrados.
- [ ] Lighthouse em páginas-chave: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95 e SEO ≥ 95 em execução controlada.
- [ ] Fluxos Playwright funcionam em viewport desktop e celular.
- [ ] Testes axe não apontam violações críticas ou sérias.

### Manutenção

- [ ] README explica em português como adicionar aula, alterar data, cancelar evento, inserir material, abrir novo semestre e publicar.
- [ ] Existe template de oferta e exemplos comentados.
- [ ] Uma atualização simples de calendário exige modificar apenas um arquivo de conteúdo.
- [ ] O CI informa arquivo e campo exatos quando a validação falhar.

## 15. Métricas de sucesso

- Tempo mediano para encontrar próxima aula em teste moderado: ≤ 15 segundos.
- Taxa de sucesso para encontrar calendário: ≥ 95%.
- Zero data duplicada manualmente entre página inicial e disciplina.
- Atualização de evento por usuário familiarizado com Markdown: ≤ 3 minutos.
- Redução de links quebrados no conteúdo migrado para zero ou registro explícito de exceção.
- Pelo menos 80% dos acessos a disciplinas correntes chegando à oferta correta sem passar pelo arquivo.

## 16. Plano de implementação

### Entrega 1 — Fundação

Scaffold Astro, tokens visuais, layouts, schemas, CI, deploy de teste, página inicial e navegação responsiva.

### Entrega 2 — Ensino e calendário

Coleções de disciplinas/ofertas, agenda responsiva, próxima atividade, filtros, ICS, arquivo e busca.

### Entrega 3 — Migração

Migrar as cinco páginas e ofertas chamadas, preservar materiais, gerar relatório de revisão e mapa de URLs antigas.

### Entrega 4 — Institucional e qualidade

Sobre, pesquisa, extensão, publicações, SEO, acessibilidade, testes, auditoria de links e documentação editorial.

### Entrega 5 — Lançamento

Revisão humana, correções, configuração definitiva do GitHub Pages/domínio, página de transição no MediaWiki e monitoramento inicial.

## 17. Instruções explícitas para o Codex implementador

1. Leia este PRD integralmente antes de alterar arquivos.
2. Inspecione o repositório e quaisquer instruções `AGENTS.md`; preserve mudanças existentes.
3. Crie primeiro um inventário de conteúdo e um plano curto; não invente informações ausentes.
4. Use as URLs antigas como fonte de migração, mas trate dados conflitantes como pendências em `migration-review.md`.
5. Implemente a stack recomendada, salvo incompatibilidade comprovada; documente qualquer desvio.
6. Faça componentes reutilizáveis, porém mantenha texto, datas, links e referências em Markdown/dados de conteúdo.
7. Priorize o fluxo do aluno e o calendário antes de animações ou elementos decorativos.
8. Não copie menus, ferramentas ou ruído estrutural do MediaWiki.
9. Não exponha links privados nem baixe materiais protegidos sem autorização.
10. Use `America/Sao_Paulo` para determinar “hoje” e “próxima atividade”, evitando diferenças de build em UTC.
11. Implemente e execute validações, testes, build e auditoria de acessibilidade antes da entrega.
12. Entregue README, relatório de migração, mapa de URLs e instruções de publicação.
13. Ao final, informe arquivos alterados, decisões tomadas, pendências de validação humana e URL/estado do deploy.

## 18. Fontes analisadas

- Página principal: <https://profs.ic.uff.br/~fseixas/index.php/P%C3%A1gina_principal>
- Modelagem de Processos de Negócios: <https://profs.ic.uff.br/~fseixas/index.php/Modelagem_de_Processos_de_Neg%C3%B3cios>
- Redes de Computadores: <https://profs.ic.uff.br/~fseixas/index.php/Redes_de_Computadores>
- Oferta de Redes 2025.2: <https://profs.ic.uff.br/~fseixas/index.php/Redes_de_Computadores_-_TCC00359_-_2025.2>
- Programação de Aplicações Web: <https://profs.ic.uff.br/~fseixas/index.php/Programa%C3%A7%C3%A3o_de_Aplica%C3%A7%C3%B5es_Web>
- Aprendizado de máquina na saúde: <https://profs.ic.uff.br/~fseixas/index.php/Aprendizado_de_m%C3%A1quina_na_sa%C3%BAde>

## 19. Decisões pendentes antes do lançamento

- Nome do repositório e URL final (`flavioluizseixas.github.io` ou project page).
- Uso ou não de domínio próprio.
- Foto profissional e autorização de uso de marcas/logos da UFF.
- Quais ofertas serão consideradas correntes no primeiro lançamento.
- Quais links de Classroom/materiais podem ser públicos.
- Escopo inicial de publicações e projetos de pesquisa.
- Permanência do conteúdo de Aplicações Web baseado em PHP/MySQL como histórico ou atualização curricular futura.

