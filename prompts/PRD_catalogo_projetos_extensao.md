# PRD — Catálogo de Projetos de Iniciação Científica e Extensão

**Página-alvo:** `https://flavioluizseixas.github.io/extensao/`  
**Projeto:** Página acadêmica de Flávio Luiz Seixas — UFF  
**Versão:** 1.0  
**Data:** 2026-09-12  
**Executor previsto:** Codex

---

## 1. Contexto

A página de Extensão atualmente apresenta de forma sintética a **Fábrica de Software e Tecnologia para a Saúde**, destacando sua atuação na articulação entre formação discente e desenvolvimento de soluções computacionais para desafios da saúde.

A seção de projetos ainda deve ser expandida para publicar projetos, resultados e oportunidades de participação.

O objetivo desta implementação é transformar a página `/extensao/` em um **catálogo acadêmico de projetos**, principalmente oportunidades de:

- Iniciação Científica;
- Extensão;
- desenvolvimento tecnológico;
- participação discente em projetos vinculados à Saúde Digital e áreas correlatas.

A solução deve ser simples de manter, compatível com o site existente e escalável para dezenas de projetos.

---

# 2. Objetivo do produto

Criar uma interface que permita ao visitante:

1. identificar imediatamente os **novos projetos com inscrições abertas**;
2. navegar facilmente pelos projetos existentes;
3. filtrar oportunidades conforme interesse;
4. consultar detalhes suficientes antes de manifestar interesse;
5. visualizar projetos em andamento e concluídos;
6. compreender rapidamente a área, dedicação e perfil esperado;
7. acessar cada projeto por URL própria e compartilhável.

Do ponto de vista de manutenção, deve ser possível adicionar um projeto novo alterando apenas seu arquivo de conteúdo/dados, sem necessidade de editar manualmente a estrutura HTML da página principal.

---

# 3. Princípios de design

A implementação deve seguir os seguintes princípios.

## 3.1 Conteúdo antes de decoração

Os projetos são o elemento central.

Evitar excesso de elementos gráficos, animações ou componentes que reduzam a legibilidade.

## 3.2 Compatibilidade visual

Preservar:

- cabeçalho atual;
- navegação;
- tipografia;
- largura de conteúdo;
- modo claro/escuro;
- comportamento responsivo;
- rodapé;
- seletor PT/EN, caso já implementado na arquitetura;
- identidade visual geral do site.

**Não criar um novo design system e não migrar o site para outro framework.**

## 3.3 Mobile first

Todos os componentes devem funcionar adequadamente em:

- smartphones;
- tablets;
- desktop.

## 3.4 Progressive enhancement

O conteúdo principal deve continuar legível mesmo se algum JavaScript adicional não for executado.

## 3.5 Acessibilidade

Atender, na medida do possível, WCAG 2.2 AA:

- contraste adequado;
- navegação por teclado;
- foco visível;
- semântica HTML;
- labels em campos de busca;
- uso de texto além de cor para indicar status;
- `aria-label` quando necessário.

---

# 4. Arquitetura recomendada

## 4.1 Regra principal

**Separar conteúdo, apresentação e comportamento.**

Os dados dos projetos não devem ficar codificados diretamente nos cards da página.

Antes de implementar, inspecionar a arquitetura atual do repositório e reutilizar o mecanismo de conteúdo já existente sempre que possível.

Não migrar o projeto para outro gerador de site.

---

## 4.2 Modelo preferencial de armazenamento

Usar um arquivo Markdown por projeto em data/extension-projects/. O modelo
canônico, com campos e seções editáveis, fica em
data/extension-projects/_template.md.example. O catálogo lê esse diretório
automaticamente; logos são arquivos em data/images/, referenciados no Markdown.

## 4.3 Alternativa

Se a arquitetura atual não permitir coleção de Markdown/front matter de forma natural, utilizar um único arquivo estruturado:

```text
data/projetos.yaml
```

ou:

```text
data/projetos.json
```

Preferir YAML quando ambos forem igualmente viáveis por ser mais simples de manter manualmente.

---

# 5. Modelo de dados

Cada projeto deverá aceitar os seguintes atributos.

## 5.1 Campos obrigatórios

| Campo | Tipo | Exemplo |
|---|---|---|
| `id` | string | `acenf` |
| `slug` | string | `acenf` |
| `titulo` | string | `ACEnf — Aplicativo...` |
| `resumo_curto` | string | texto de 1–3 linhas |
| `modalidade` | lista | IC, Extensão |
| `area` | lista | Saúde Digital |
| `status` | enum | `inscricoes-abertas` |
| `semestre_divulgacao` | string | `02-2026` |
| `data_publicacao` | date | `2026-09-12` |
| `carga_horaria` | string | `4 horas semanais` |
| `equipe` | lista | nomes/vínculos |
| `palavras_chave` | lista | termos |

## 5.2 Campos recomendados

```yaml
destaque: true | false
imagem: caminho-opcional
link_inscricao: URL-opcional
data_encerramento_inscricoes: date-opcional
```

## 5.3 Conteúdo detalhado

Cada projeto deve permitir:

- resumo completo;
- problema abordado;
- objetivos;
- impactos potenciais na sociedade;
- o que o aluno poderá desenvolver;
- perfil desejado;
- tecnologias/competências envolvidas;
- equipe;
- palavras-chave.

---

# 6. Status dos projetos

Implementar três estados padronizados:

```text
inscricoes-abertas
em-andamento
concluido
```

Exibição para o usuário:

- **Inscrições abertas**
- **Em andamento**
- **Concluído**

Cada estado deve possuir badge visual, porém o significado não deve depender apenas de cor.

---

# 7. Definição de “Novo projeto”

Não cadastrar manualmente um projeto como “novo” indefinidamente.

Utilizar `data_publicacao` para determinar automaticamente a novidade.

### Regra

Um projeto deverá receber o badge:

**NOVO**

quando:

```text
data atual - data_publicacao <= 60 dias
```

O período deve ser definido em uma constante/configuração de fácil alteração.

Exemplo:

```javascript
const NEW_PROJECT_DAYS = 60;
```

Se a arquitetura não usar JavaScript, implementar regra equivalente durante o build.

---

# 8. Estrutura da página `/extensao/`

A página deve seguir a seguinte hierarquia.

```text
[Header existente]

Extensão
Tecnologia construída em colaboração

[Introdução da Fábrica de Software e Tecnologia para a Saúde]

[NOVOS PROJETOS / OPORTUNIDADES EM DESTAQUE]

[BUSCA + FILTROS]

[TODOS OS PROJETOS]

[CTA / PARTICIPE]

[Footer existente]
```

---

# 9. Seção 1 — Introdução

Preservar a ideia atualmente utilizada:

> Tecnologia construída em colaboração

e o contexto da:

> Fábrica de Software e Tecnologia para a Saúde

A introdução deve ser curta.

Não transformar essa seção em texto institucional longo.

Objetivo: permitir que os cards dos projetos apareçam rapidamente, preferencialmente ainda próximos à primeira dobra da página em desktop.

---

# 10. Seção 2 — Novos projetos

Criar uma seção visualmente destacada:

## Novas oportunidades

Subtexto sugerido:

> Projetos recentemente divulgados com oportunidades de participação para estudantes.

### Critério de exibição

Mostrar projetos que satisfaçam:

```text
status == inscricoes-abertas
AND
(data_publicacao nos últimos 60 dias OR destaque == true)
```

### Quantidade

Exibir no máximo **3 projetos**.

Caso existam mais de três:

- ordenar por `data_publicacao DESC`;
- mostrar os três mais recentes.

### Card de destaque

Cada card deve conter:

- badge `NOVO`, quando aplicável;
- status;
- título;
- resumo curto;
- modalidade;
- área principal;
- dedicação: `4 h/semana`;
- semestre;
- botão/link `Conhecer projeto`.

Exemplo conceitual:

```text
┌──────────────────────────────────────┐
│ NOVO              INSCRIÇÕES ABERTAS │
│                                      │
│ ACEnf — Aplicativo para Auditoria    │
│ Clínica de Enfermagem                │
│                                      │
│ Aplicativo móvel para apoiar...      │
│                                      │
│ Saúde Digital · Desenvolvimento      │
│ 4 h/semana · 02-2026                 │
│                                      │
│ Conhecer projeto →                   │
└──────────────────────────────────────┘
```

---

# 11. Seção 3 — Busca e filtros

Título:

## Explore os projetos

Criar uma pequena barra de ferramentas.

### Busca

Campo:

```text
Buscar projetos...
```

Pesquisar, no mínimo:

- título;
- resumo;
- área;
- palavras-chave;
- nomes da equipe.

A busca deve ignorar diferenças entre:

- maiúsculas/minúsculas;
- preferencialmente acentuação.

---

## 11.1 Filtro por status

Usar chips, botões segmentados ou select.

Opções:

```text
Todos
INSCRIÇÕES ABERTAS
EM ANDAMENTO
Concluídos
```

O padrão é:

```text
Todos
```

---

## 11.2 Filtro por modalidade

Opções geradas dinamicamente a partir dos dados:

```text
Todas
Iniciação Científica
Extensão
```

Preparar a arquitetura para modalidades futuras.

---

## 11.3 Filtro por área

Gerar as opções dinamicamente a partir dos dados.

Exemplos:

```text
Saúde Digital
Desenvolvimento de Sistemas
Business Intelligence
Gestão da Informação
Apoio à Decisão
```

Não hard-code a lista se ela puder ser derivada dos projetos.

---

# 12. Seção 4 — Lista de projetos

Título:

## Todos os projetos

Utilizar grid responsivo.

### Desktop

```text
3 cards por linha
```

quando houver espaço suficiente.

### Tablet

```text
2 cards por linha
```

### Smartphone

```text
1 card por linha
```

---

# 13. Ordenação padrão

A ordenação deve priorizar oportunidades relevantes.

Ordem:

1. inscrições abertas;
2. projetos novos;
3. projetos em andamento;
4. concluídos.

Dentro de cada grupo:

```text
data_publicacao DESC
```

Projetos concluídos mais recentes antes dos mais antigos.

---

# 14. Card padrão de projeto

Evitar cards excessivamente altos.

Cada card da listagem deve conter somente as informações necessárias para decisão inicial.

### Conteúdo

1. status;
2. `NOVO`, se aplicável;
3. título;
4. resumo curto;
5. modalidade;
6. área(s), limitando visualmente o excesso;
7. carga horária;
8. semestre;
9. link `Ver detalhes`.

Não colocar toda a descrição do projeto dentro do card.

---

# 15. Página individual do projeto

Cada projeto deverá possuir uma URL própria.

Exemplo:

```text
/extensao/projetos/acenf/
```

Estrutura:

```text
Breadcrumb

Extensão > Projetos > ACEnf

[BADGES]

Título

Resumo

Informações rápidas
- Status
- Modalidade
- Dedicação
- Semestre

Sobre o projeto

Impactos potenciais na sociedade

O que o aluno poderá desenvolver

Perfil desejado

Tecnologias e competências envolvidas

Equipe

[CTA de inscrição, quando houver]

[Voltar aos projetos]
```

---

# 16. Informações rápidas

Na página individual, criar uma área compacta contendo:

```text
Status               Inscrições abertas
Modalidade            IC / Extensão
Dedicação             4 horas semanais
Divulgação            02-2026
```

Em desktop, pode ser grid horizontal.

Em mobile, empilhar.

---

# 17. Equipe

Exibir nome e vínculo.

Exemplo:

```text
Flávio Luiz Seixas
Instituto de Computação / UFF

Gisele Morais
Mestrado Profissional em Enfermagem Assistencial (PEA/UFF)
```

Não exigir fotografia para criar um projeto.

A arquitetura pode aceitar fotografia futuramente, mas ela não deverá ser campo obrigatório.

---

# 18. Inscrição

Preparar campo opcional:

```yaml
link_inscricao:
```

Quando preenchido e:

```text
status == inscricoes-abertas
```

mostrar CTA:

**Tenho interesse / Quero participar**

O texto final do botão pode ser adaptado ao padrão visual existente.

Se `link_inscricao` estiver vazio:

- não mostrar botão quebrado;
- não inventar URL;
- apresentar somente as informações do projeto.

---

# 19. Estado vazio

Se filtros não retornarem projetos:

Exibir:

> Nenhum projeto encontrado com esses filtros.

Adicionar ação:

**Limpar filtros**

Nunca deixar apenas uma área em branco.

---

# 20. Contagem de resultados

Após filtros, apresentar texto discreto como:

```text
6 projetos encontrados
```

ou:

```text
1 projeto encontrado
```

Implementar plural corretamente.

---

# 21. URL e navegação

Desejável sincronizar filtros com query parameters.

Exemplo:

```text
/extensao/?status=inscricoes-abertas
```

ou:

```text
/extensao/?area=saude-digital
```

Isso permite compartilhar uma visão filtrada.

Implementar somente se puder ser feito de maneira simples e sem fragilizar a arquitetura atual.

---

# 22. SEO e compartilhamento

Cada página individual deve possuir:

- `<title>` próprio;
- meta description baseada no `resumo_curto`;
- URL canônica quando suportada pelo site;
- Open Graph básico, se a infraestrutura já possuir suporte.

Exemplo:

```text
ACEnf — Aplicativo para Auditoria Clínica de Enfermagem | Flávio Luiz Seixas
```

---

# 23. Escalabilidade

A implementação deve funcionar sem alteração estrutural com:

```text
3 projetos
30 projetos
100 projetos
```

Para adicionar projeto novo, o mantenedor deverá precisar apenas:

1. copiar um template;
2. preencher front matter/dados;
3. escrever conteúdo;
4. fazer commit.

Os filtros, badges, ordenação e listagem devem se atualizar automaticamente.

---

# 24. Projetos iniciais

O conteúdo editorial dos projetos fica em Markdown individuais em
data/extension-projects/. Consulte acenf.md, auditoria-saude-suplementar.md e
qualificacao-denuncias-enfermagem.md. As logos ficam em data/images/ e são
referenciadas pelo campo logo de cada projeto. Os projetos iniciais são da Enfermagem.

A apresentação da página fica em data/pages/extensao.ts; os textos do catálogo,
em data/extension-catalog.ts. Consulte data/README.md para manutenção.

# 25. Diretrizes visuais

## 25.1 Badges

Criar badges compactos para:

```text
NOVO
INSCRIÇÕES ABERTAS
EM ANDAMENTO
CONCLUÍDO
```

Evitar cores excessivamente saturadas.

Reutilizar cores/tokens do site sempre que disponíveis.

---

## 25.2 Destaque de “novo”

`NOVO` deve chamar atenção sem competir com o título.

Preferência:

- badge pequeno;
- posição superior do card;
- ícone opcional apenas se já houver biblioteca de ícones no site.

Não adicionar uma biblioteca nova apenas para esse ícone.

---

## 25.3 Cards

Características:

- borda discreta;
- raio consistente com o site;
- espaço interno confortável;
- títulos alinhados;
- altura visual aproximadamente uniforme dentro de cada linha;
- hover discreto em desktop;
- não depender do hover para acesso a informações.

---

# 26. Internacionalização

O site atual possui navegação PT/EN.

Implementar a solução de forma compatível com o mecanismo de internacionalização já existente.

Entretanto:

**não traduzir automaticamente o conteúdo acadêmico usando texto inventado.**

Caso não haja versão em inglês dos projetos:

- manter a implementação preparada para conteúdo traduzido posteriormente;
- não bloquear a implementação em português.

---

# 27. Performance

Não utilizar frameworks ou bibliotecas grandes apenas para:

- filtros;
- busca;
- cards;
- ordenação.

Se o site atual utilizar JavaScript vanilla ou scripts pequenos, manter essa abordagem.

Meta:

- nenhum backend necessário;
- nenhum banco de dados necessário;
- compatível com GitHub Pages;
- processamento no build ou cliente;
- carregamento rápido.

---

# 28. Dependências

Antes de adicionar qualquer dependência:

1. verificar se funcionalidade equivalente já existe no projeto;
2. preferir HTML/CSS/JS nativo;
3. evitar dependências para tarefas triviais.

Não adicionar:

- React;
- Vue;
- Angular;
- banco de dados;
- API backend;

apenas para esta funcionalidade, a menos que o projeto atual já utilize alguma dessas tecnologias.

---

# 29. Responsividade

Testar pelo menos:

```text
360 px
768 px
1024 px
1440 px
```

Verificar:

- quebra de títulos;
- badges;
- filtros;
- grid;
- menu;
- cards;
- páginas individuais;
- modo claro/escuro.

---

# 30. Testes funcionais

Validar:

### Caso 1 — projeto novo

Dado projeto publicado há 10 dias:

```text
status = inscricoes-abertas
```

Resultado:

- aparece em "Novas oportunidades";
- possui badge `NOVO`;
- aparece também em "Todos os projetos".

### Caso 2 — projeto antigo com inscrições abertas

Publicado há 90 dias:

- não recebe `NOVO`;
- continua visível em "Todos os projetos";
- aparece no filtro "Inscrições abertas".

### Caso 3 — concluído

```text
status = concluido
```

Resultado:

- não aparece em novas oportunidades;
- aparece em "Todos";
- aparece no filtro "Concluídos".

### Caso 4 — busca

Pesquisar:

```text
auditoria
```

deve localizar projetos cujo:

- título;
- resumo;
- palavras-chave;
- área

contenham o termo.

### Caso 5 — combinação de filtros

Exemplo:

```text
Status: Inscrições abertas
Área: Saúde Digital
```

mostrar somente a interseção.

### Caso 6 — sem resultados

Exibir:

```text
Nenhum projeto encontrado com esses filtros.
```

e opção de limpar filtros.

---

# 31. Critérios de aceite

A funcionalidade será considerada concluída quando:

- [ ] `/extensao/` preservar identidade visual do site;
- [ ] seção atual da Fábrica de Software continuar presente;
- [ ] existir seção "Novas oportunidades";
- [ ] projetos novos receberem badge automaticamente;
- [ ] houver no máximo três projetos destacados;
- [ ] existir busca textual;
- [ ] existir filtro por status;
- [ ] existir filtro por modalidade;
- [ ] existir filtro por área;
- [ ] filtros puderem ser combinados;
- [ ] houver opção de limpar filtros;
- [ ] listagem for responsiva;
- [ ] cada projeto possuir URL própria;
- [ ] cada página apresentar informações detalhadas;
- [ ] os três projetos de 2026.2 estiverem cadastrados;
- [ ] a adição de um novo projeto não exigir edição da estrutura HTML da página;
- [ ] modo claro/escuro continuar funcionando;
- [ ] navegação PT/EN existente não seja quebrada;
- [ ] não existam links ou botões vazios;
- [ ] layout seja utilizável por teclado;
- [ ] build do site seja concluído sem erro;
- [ ] links internos sejam verificados;
- [ ] nenhuma página existente seja removida ou quebrada.

---

# 32. Estratégia de implementação para o Codex

Executar nesta ordem.

## Etapa 1 — Diagnóstico do repositório

Antes de modificar qualquer arquivo:

1. identificar framework/gerador utilizado;
2. localizar código da página `/extensao/`;
3. localizar CSS/tokens/componentes compartilhados;
4. identificar mecanismo PT/EN;
5. identificar modo claro/escuro;
6. verificar como páginas de conteúdo são atualmente criadas;
7. verificar pipeline de build/deploy.

Registrar de forma breve no terminal o que foi encontrado.

**Não assumir Jekyll, Quarto, Hugo ou outro framework antes da inspeção.**

---

## Etapa 2 — Escolher integração nativa

Utilizar a solução mais compatível com o repositório existente.

Prioridade:

1. mecanismo nativo de collections/data do projeto;
2. Markdown/front matter;
3. YAML/JSON + geração existente;
4. JavaScript cliente simples, somente se necessário.

Não reconstruir o site.

---

## Etapa 3 — Implementar modelo de conteúdo

Criar schema consistente para os projetos.

Cadastrar os três projetos iniciais.

Criar também um template reutilizável, por exemplo:

```text
extensao/projetos/_template.md
```

ou equivalente apropriado à arquitetura.

---

## Etapa 4 — Implementar catálogo

Criar:

- seção de novidades;
- busca;
- filtros;
- ordenação;
- grid;
- estados vazios;
- contagem.

---

## Etapa 5 — Implementar páginas individuais

Garantir URL amigável por projeto.

---

## Etapa 6 — Refinar CSS

Priorizar reutilização das classes/tokens existentes.

Adicionar CSS específico somente quando necessário.

---

## Etapa 7 — Testar

Executar build local.

Verificar console e erros.

Validar desktop e mobile.

---

## Etapa 8 — Revisão final

Antes de finalizar:

1. verificar `git diff`;
2. remover código não utilizado;
3. remover logs temporários;
4. garantir que nenhum conteúdo existente tenha sido perdido;
5. confirmar que os três projetos foram incorporados;
6. confirmar que novos projetos podem ser adicionados somente por conteúdo/dados;
7. fornecer resumo final dos arquivos criados e modificados.

---

# 33. Não fazer

O Codex **não deve**:

- redesenhar todo o site;
- alterar o header sem necessidade;
- alterar o footer sem necessidade;
- substituir tipografia global;
- criar backend;
- adicionar autenticação;
- adicionar CMS;
- adicionar banco de dados;
- introduzir framework SPA;
- criar dependências pesadas;
- inventar links de inscrição;
- inventar informações acadêmicas;
- inventar versões em inglês;
- remover conteúdo existente;
- modificar páginas fora do escopo salvo dependência técnica clara.

---

# 34. Evoluções futuras — fora do MVP

Deixar a arquitetura preparada, mas **não implementar agora**, salvo se já for trivial no framework atual:

- formulário central de manifestação de interesse;
- projetos favoritos;
- filtros por orientador;
- filtros por tecnologia;
- arquivo por semestre;
- seção de resultados/publicações por projeto;
- imagens/galerias;
- integração com GitHub;
- indicadores do número de alunos envolvidos;
- projetos relacionados;
- feed RSS específico de novas oportunidades;
- JSON-LD para projetos;
- painel de administração.

---

# 35. Resultado esperado

Ao acessar:

```text
/extensao/
```

um aluno deve conseguir responder em menos de 20 segundos:

1. existem oportunidades abertas?
2. quais são as oportunidades mais novas?
3. qual delas combina com meus interesses?
4. quanto tempo preciso dedicar?
5. o que vou fazer no projeto?
6. quem participa da equipe?
7. como obtenho mais detalhes?

Ao mesmo tempo, o mantenedor do site deve conseguir adicionar novos projetos sem alterar a lógica da página.

---

# 36. Entregáveis esperados do Codex

Ao concluir, apresentar:

1. lista dos arquivos criados;
2. lista dos arquivos modificados;
3. explicação resumida da arquitetura adotada;
4. instruções para adicionar um novo projeto;
5. comando utilizado para build/teste;
6. resultado dos testes;
7. eventuais limitações encontradas.

Se alguma decisão deste PRD conflitar com a arquitetura existente, preservar a arquitetura atual e implementar o objetivo funcional de forma equivalente, documentando a decisão.
