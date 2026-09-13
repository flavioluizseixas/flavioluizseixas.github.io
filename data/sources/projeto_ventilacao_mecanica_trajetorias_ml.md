# Liberação da Ventilação Mecânica: uso de Machine Learning na Identificação e Predição de Trajetórias

**Modalidade:** Iniciação Científica / Pesquisa
**Área:** Inteligência Artificial em Saúde, Machine Learning, Medicina Intensiva e Ciência de Dados em Saúde
**Status:** Inscrições abertas
**Semestre de divulgação:** 02-2026
**Carga horária:** 4 horas semanais

## Resumo

A ventilação mecânica invasiva (VMI) é um recurso essencial no cuidado de pacientes críticos, mas a definição do momento e da trajetória de liberação do suporte ventilatório permanece um desafio relevante na terapia intensiva. O projeto investiga o uso de **Machine Learning e análise de sequências** para identificar padrões de evolução de pacientes submetidos à VMI e avaliar se esses padrões podem ser previstos a partir de informações clínicas disponíveis nas primeiras 24 horas de internação na UTI.

O projeto combina duas etapas principais: primeiro, a identificação de trajetórias semelhantes por meio de **análise de sequências de estados**; em seguida, o desenvolvimento de modelos preditivos capazes de estimar, a partir das características iniciais do paciente, a trajetória à qual ele provavelmente pertencerá.

## Pergunta de pesquisa

> Com base nas características clínicas disponíveis nas primeiras 24 horas de internação na UTI, é possível prever a trajetória de liberação da ventilação mecânica invasiva (VMI)?

## Base de dados e desenho do estudo

O estudo utiliza dados de pacientes internados na **Fiocruz**, no período de **abril de 2021 a agosto de 2026**, em um desenho observacional retrospectivo.

### População

- Pacientes adultos submetidos à ventilação mecânica invasiva.
- Pacientes com desfecho hospitalar completo até alta ou óbito.
- Pacientes com COVID-19 são excluídos da análise.

### Unidade de análise

Cada paciente constitui uma unidade de análise, com sua trajetória reconstruída a partir das datas de eventos clínicos relacionados à ventilação mecânica:

- início da VMI;
- extubação;
- reintubação;
- traqueostomia;
- término da VMI;
- alta ou óbito.

## Variáveis preditoras

As variáveis utilizadas para predição serão restritas às informações disponíveis nas **primeiras 24 horas de internação na UTI**, incluindo:

- características demográficas, como idade, sexo e IMC;
- indicadores de gravidade, como SAPS III e SOFA/componentes;
- parâmetros respiratórios na admissão, incluindo relação P/F, SpO₂, FiO₂, fluxo de oxigênio e uso de VNI/CNAF;
- motivo da internação;
- comorbidades;
- CPAX na admissão ao CTI.

Essa restrição temporal busca aproximar o modelo de um cenário de uso clínico em que a predição possa ser realizada precocemente.

## Abordagem de Machine Learning

A metodologia é organizada em duas etapas.

### 1. Identificação das trajetórias

A trajetória diária dos pacientes será representada como uma sequência de estados clínicos, considerando eventos como:

1. ventilação mecânica invasiva;
2. extubação;
3. reintubação;
4. traqueostomia;
5. alta;
6. óbito.

Métodos de **Sequence Analysis** serão utilizados para comparar as trajetórias e identificar grupos de pacientes com padrões semelhantes de evolução.

Entre os padrões clínicos que poderão emergir da análise estão trajetórias compatíveis com:

- liberação rápida da ventilação mecânica;
- liberação prolongada;
- ausência de liberação antes do óbito.

Esses grupos não devem ser considerados previamente fixos: a proposta é que sua estrutura seja identificada matematicamente a partir das trajetórias observadas.

### 2. Modelagem preditiva

Após a identificação das trajetórias, serão avaliados modelos capazes de predizer a classe de trajetória utilizando somente dados clínicos iniciais.

**Modelo de referência:**

- Regressão Logística Multinomial.

**Modelos candidatos de Machine Learning:**

- Random Forest;
- XGBoost;
- LightGBM;
- CatBoost, dependendo da natureza final das variáveis.

A avaliação poderá considerar:

- desempenho por classe;
- AUC;
- calibração por classe;
- matriz de confusão;
- análise da importância das variáveis;
- SHAP para interpretabilidade clínica.

A apresentação inicial do projeto prevê divisão dos dados em **80% para treinamento e 20% para teste**.

## Impactos potenciais na sociedade

O projeto poderá contribuir para:

- ampliar o conhecimento sobre diferentes trajetórias de pacientes dependentes de ventilação mecânica;
- apoiar a identificação precoce de pacientes com maior probabilidade de liberação rápida ou prolongada da VMI;
- produzir evidências que auxiliem equipes de terapia intensiva na avaliação da evolução clínica;
- favorecer planejamento assistencial e melhor utilização de recursos de UTI;
- investigar o potencial de modelos de Machine Learning como apoio à decisão clínica;
- contribuir para métodos mais individualizados de acompanhamento de pacientes críticos;
- avançar a aplicação de inteligência artificial interpretável em problemas relevantes da medicina intensiva.

Os modelos desenvolvidos terão caráter de pesquisa e apoio à investigação científica, não substituindo a avaliação e a decisão dos profissionais de saúde.

## O que o aluno poderá desenvolver

A participação de um estudante de graduação poderá envolver diferentes etapas do projeto, de acordo com sua experiência e evolução durante a iniciação científica:

- organização e documentação da base de dados;
- análise exploratória dos dados clínicos;
- avaliação de qualidade, consistência e dados ausentes;
- preparação e transformação das variáveis das primeiras 24 horas;
- reconstrução computacional das trajetórias de ventilação mecânica;
- representação das trajetórias como sequências de estados;
- aplicação e comparação de métodos de análise de sequências;
- análise de similaridade e agrupamento de trajetórias;
- visualização dos diferentes padrões de evolução clínica;
- desenvolvimento de modelos de classificação;
- comparação entre regressão logística multinomial e modelos baseados em árvores;
- avaliação das métricas de desempenho;
- análise de calibração dos modelos;
- construção e interpretação de matrizes de confusão;
- aplicação de técnicas de explicabilidade, incluindo SHAP;
- preparação de gráficos, tabelas e resultados para relatórios e publicações científicas;
- documentação do código e dos experimentos para garantir reprodutibilidade.

## Perfil desejado

Projeto indicado para estudantes interessados em **Machine Learning, Ciência de Dados, Inteligência Artificial em Saúde ou análise de dados clínicos**.

É desejável que o estudante tenha:

- conhecimentos básicos de programação;
- interesse em Python e análise de dados;
- conhecimentos iniciais de estatística;
- interesse em aprender técnicas de Machine Learning;
- organização para documentação e reprodução dos experimentos;
- interesse em trabalhar em uma equipe interdisciplinar envolvendo Computação e Saúde.

Não é necessário conhecimento prévio sobre ventilação mecânica ou medicina intensiva. Os conceitos clínicos necessários poderão ser desenvolvidos durante o projeto em conjunto com a equipe.

## Tecnologias e competências envolvidas

- Python;
- Pandas e NumPy;
- análise exploratória de dados;
- visualização de dados;
- Scikit-learn;
- modelos baseados em árvores;
- XGBoost / LightGBM / CatBoost;
- análise de sequências;
- clusterização;
- classificação multiclasse;
- métricas de desempenho preditivo;
- calibração de modelos;
- SHAP e Inteligência Artificial Explicável;
- tratamento de dados clínicos;
- reprodutibilidade de experimentos;
- Ciência de Dados em Saúde.

## Desafios científicos do projeto

O projeto possui alguns desafios metodológicos relevantes que também constituem oportunidades de aprendizagem:

- identificação de trajetórias clinicamente interpretáveis a partir de sequências complexas de eventos;
- tratamento de possíveis mudanças nos protocolos assistenciais ao longo do período da coorte;
- prevenção de vazamento de informação entre a construção do desfecho e as variáveis preditoras;
- avaliação da generalização dos modelos em uma base proveniente de um único centro;
- interpretação clínica dos padrões identificados;
- integração entre uma etapa não supervisionada de descoberta das trajetórias e uma etapa supervisionada de predição.

## Equipe

- **Flávio Luiz Seixas** — Instituto de Computação / Universidade Federal Fluminense (UFF)
- **Tatiane Martins S. de Morais** — pesquisadora/aluna responsável pelo projeto

## Palavras-chave

`Machine Learning` `Saúde Digital` `Ventilação Mecânica` `UTI` `Medicina Intensiva` `Sequence Analysis` `Trajetórias Clínicas` `XGBoost` `Random Forest` `SHAP` `Inteligência Artificial Explicável`

---

## Metadados sugeridos para integração ao catálogo

```yaml
---
id: ventilacao-mecanica-trajetorias-ml
slug: ventilacao-mecanica-trajetorias-ml

titulo: 'Liberação da Ventilação Mecânica: uso de Machine Learning na Identificação e Predição de Trajetórias'

resumo_curto: >
  Uso de análise de sequências e Machine Learning para identificar
  trajetórias de pacientes submetidos à ventilação mecânica invasiva
  e prever sua evolução a partir de dados clínicos das primeiras
  24 horas de internação na UTI.

modalidade:
  - Iniciação Científica
  - Pesquisa

area:
  - Inteligência Artificial em Saúde
  - Machine Learning
  - Ciência de Dados em Saúde
  - Medicina Intensiva

status: inscricoes-abertas

semestre_divulgacao: '02-2026'
carga_horaria: '4 horas semanais'

destaque: true

equipe:
  - nome: 'Flávio Luiz Seixas'
    vinculo: 'Instituto de Computação / Universidade Federal Fluminense (UFF)'

  - nome: 'Tatiane Martins S. de Morais'
    vinculo: 'Pesquisadora/aluna responsável pelo projeto'

palavras_chave:
  - Machine Learning
  - Saúde Digital
  - Ventilação Mecânica
  - UTI
  - Medicina Intensiva
  - Sequence Analysis
  - Trajetórias Clínicas
  - XGBoost
  - Random Forest
  - SHAP
  - Inteligência Artificial Explicável
---
```
