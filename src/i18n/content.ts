import type { Locale } from './index';

// Academic source content remains in Portuguese. Every string rendered as
// translatable content must have an explicit English counterpart here.
// validate-content.ts checks this table so new Portuguese content cannot be
// published silently on English pages.
export const englishContent: Record<string, string> = {
  'Aprendizado de Máquina na Saúde': 'Machine Learning in Healthcare',
  'Métodos, implementação e avaliação de aprendizado de máquina aplicados à saúde.':
    'Methods, implementation, and evaluation of machine learning applied to healthcare.',
  'A disciplina aborda preparação de dados, aprendizado supervisionado e não supervisionado, avaliação de modelos e aplicações clínicas, com atenção à metodologia científica.':
    'This course covers data preparation, supervised and unsupervised learning, model evaluation, and clinical applications, with attention to scientific methodology.',
  'Disciplina encerrada. O detalhamento histórico deve ser validado com a página original antes da publicação definitiva.':
    'This course has ended. Historical details must be checked against the original page before final publication.',
  'Disciplina encerrada': 'Course completed',
  'Apresentação da disciplina': 'Course introduction',
  'Apresentações finais': 'Final presentations',
  'Introdução ao Aprendizado de Máquina para Saúde':
    'Introduction to Machine Learning for Healthcare',
  'Inteligência artificial em saúde, do problema clínico e dos dados à validação, implementação, monitoramento e governança.':
    'Artificial intelligence in healthcare, from clinical problems and data to validation, implementation, monitoring, and governance.',
  'A disciplina integra computação, medicina, epidemiologia e informática em saúde no estudo do ciclo de vida de soluções de inteligência artificial. Abrange definição do problema clínico, qualidade e interoperabilidade dos dados, modelagem, validação, interpretação, avaliação clínica, implementação, monitoramento e governança, com discussão crítica de vieses, equidade, privacidade, segurança e regulação.':
    'This course integrates computing, medicine, epidemiology, and health informatics to study the life cycle of artificial intelligence solutions. It covers clinical problem definition, data quality and interoperability, modeling, validation, interpretation, clinical evaluation, implementation, monitoring, and governance, with critical discussion of bias, equity, privacy, safety, and regulation.',
  'Capacitar estudantes a compreender, desenvolver, avaliar criticamente e comunicar soluções de aprendizado de máquina para problemas de saúde, considerando desempenho técnico, validade clínica, riscos, viabilidade de implementação, aspectos éticos e regulatórios e impacto no cuidado ao paciente.':
    'Enable students to understand, develop, critically evaluate, and communicate machine learning solutions for healthcare problems, considering technical performance, clinical validity, risks, implementation feasibility, ethical and regulatory aspects, and impact on patient care.',
  'Aulas integradas a seminários, análise de estudos de caso reais e desenvolvimento de um miniprojeto prático com bases como MIMIC-IV, PhysioNet, imagens públicas ou dados sintéticos quando houver restrição ética.':
    'Classes integrated with seminars, analysis of real-world case studies, and development of a practical mini-project using datasets such as MIMIC-IV, PhysioNet, public images, or synthetic data when ethical restrictions apply.',
  'A avaliação considera participação nas aulas e discussões, trabalhos práticos e relatórios, além do projeto final e de sua apresentação.':
    'Assessment considers participation in classes and discussions, practical assignments and reports, as well as the final project and its presentation.',
  'Sala e ambiente virtual serão informados em breve.':
    'The room and virtual learning environment will be announced soon.',
  'Sextas-feiras, 14h–18h': 'Fridays, 2–6 p.m.',
  'Fundamentos de IA e aprendizado de máquina em saúde: evolução histórica; predição, diagnóstico, prognóstico, triagem, recomendação e decisão clínica.':
    'Foundations of AI and machine learning in healthcare: historical evolution; prediction, diagnosis, prognosis, triage, recommendation, and clinical decision-making.',
  'Dados clínicos, qualidade e interoperabilidade: EHR, imagens, sinais, notas clínicas, dados ômicos, determinantes sociais, missingness, leakage, governança, HL7 FHIR, OMOP, LOINC e SNOMED CT.':
    'Clinical data, quality, and interoperability: EHRs, images, signals, clinical notes, omics data, social determinants, missingness, leakage, governance, HL7 FHIR, OMOP, LOINC, and SNOMED CT.',
  'Desenho de estudos e ciclo de vida de modelos: população, desfecho, janelas temporais, particionamento, validação, calibração, curvas ROC/PR, curvas de decisão e subgrupos.':
    'Study design and model life cycle: population, outcome, time windows, partitioning, validation, calibration, ROC/PR curves, decision curves, and subgroups.',
  'Aprendizado supervisionado e não supervisionado: classificação, regressão, árvores, ensembles, SVM, redes neurais, clustering, redução de dimensionalidade e fenotipagem.':
    'Supervised and unsupervised learning: classification, regression, trees, ensembles, SVMs, neural networks, clustering, dimensionality reduction, and phenotyping.',
  'Aprendizado profundo para dados biomédicos: redes convolucionais e transformers para imagens, sinais e séries temporais; transferência de aprendizado e avaliação por paciente e instituição.':
    'Deep learning for biomedical data: convolutional networks and transformers for images, signals, and time series; transfer learning and evaluation by patient and institution.',
  'NLP biomédico, modelos de linguagem e multimodais: extração de informação, embeddings, transformers, sumarização, RAG, alucinação, segurança, privacidade e uso responsável.':
    'Biomedical NLP, language models, and multimodal models: information extraction, embeddings, transformers, summarization, RAG, hallucination, safety, privacy, and responsible use.',
  'Sobrevivência, inferência causal e evidência do mundo real: riscos competitivos, censura, ensaios-alvo, confundimento, DAGs, propensity score e limites dos dados observacionais.':
    'Survival, causal inference, and real-world evidence: competing risks, censoring, target trials, confounding, DAGs, propensity scores, and limitations of observational data.',
  'Apoio à decisão clínica e implementação: integração ao fluxo de trabalho, usabilidade, fadiga de alertas, interação humano-IA, segurança do paciente e avaliação prospectiva.':
    'Clinical decision support and implementation: workflow integration, usability, alert fatigue, human–AI interaction, patient safety, and prospective evaluation.',
  'Explicabilidade, equidade, privacidade e segurança: SHAP/LIME, saliency, viés algorítmico, LGPD, anonimização, robustez e explicações clinicamente úteis.':
    'Explainability, equity, privacy, and security: SHAP/LIME, saliency, algorithmic bias, Brazil’s LGPD, anonymization, robustness, and clinically useful explanations.',
  'Regulação, relato científico e monitoramento: SaMD, RDC ANVISA 657/2022, FDA, TRIPOD+AI, CONSORT-AI, SPIRIT-AI, DECIDE-AI, drift, MLOps e governança contínua.':
    'Regulation, scientific reporting, and monitoring: SaMD, ANVISA RDC 657/2022, FDA, TRIPOD+AI, CONSORT-AI, SPIRIT-AI, DECIDE-AI, drift, MLOps, and continuous governance.',
  'Estrutura de Dados': 'Data Structures',
  'Estrutura de Dados e seus Algoritmos': 'Data Structures and Algorithms',
  'Probabilidade e Estatística': 'Probability and Statistics',
  'Epidemiologia 1': 'Epidemiology 1',
  'Apresentação do curso': 'Course introduction',
  'Apresentação da ementa, metodologia, avaliação e projeto integrador.':
    'Presentation of the syllabus, methodology, assessment, and integrative project.',
  'Hackathon: definição do problema e prototipação':
    'Hackathon: problem definition and prototyping',
  'Montagem de equipes, definição do problema, imersão, ideação e prototipação.':
    'Team formation, problem definition, immersion, ideation, and prototyping.',
  'Aula 1: Introdução e evolução da IA na medicina':
    'Lecture 1: Introduction and evolution of AI in medicine',
  'Módulo 1 — Fundamentos e ecossistema de dados.':
    'Module 1 — Foundations and data ecosystem.',
  'Aula 2: Tipos de dados clínicos e qualidade':
    'Lecture 2: Clinical data types and quality',
  'Aula 3: Interoperabilidade e padrões clínicos':
    'Lecture 3: Interoperability and clinical standards',
  'Aula 4: Formulação do problema e ciclo de vida do modelo':
    'Lecture 4: Problem formulation and model life cycle',
  'Módulo 2 — Desenho de estudos e aprendizado de máquina clássico.':
    'Module 2 — Study design and classical machine learning.',
  'Aula 5: Avaliação de desempenho e validação; Aula 6: Aprendizado supervisionado e não supervisionado clássico':
    'Lecture 5: Performance evaluation and validation; Lecture 6: Classical supervised and unsupervised learning',
  'Apresentação de artigo 1': 'Paper presentation 1',
  'Aula 7: Deep learning 1 — visão computacional médica':
    'Lecture 7: Deep learning 1 — medical computer vision',
  'Módulo 3 — Aprendizado profundo e NLP.': 'Module 3 — Deep learning and NLP.',
  'Aula 8: Deep learning 2 — transformers e sinais biomédicos':
    'Lecture 8: Deep learning 2 — transformers and biomedical signals',
  'Aula 9: Processamento de linguagem natural biomédico; Aula 10: Modelos de linguagem e multimodalidade':
    'Lecture 9: Biomedical natural language processing; Lecture 10: Language models and multimodality',
  'Aula 11: Análise de sobrevivência, predição de risco; Aula 12: Inferência causal e evidência de mundo real':
    'Lecture 11: Survival analysis and risk prediction; Lecture 12: Causal inference and real-world evidence',
  'Módulo 4 — Sobrevivência, inferência causal e decisão.':
    'Module 4 — Survival, causal inference, and decision-making.',
  'Semana de extensão (SEMEXT)': 'University Outreach Week (SEMEXT)',
  'Aula 13: Sistemas de apoio à decisão clínica e implementação; Aula 14: Explicabilidade, equidade e privacidade; Aula 15: Regulação, relato científico e MLOps':
    'Lecture 13: Clinical decision support systems and implementation; Lecture 14: Explainability, equity, and privacy; Lecture 15: Regulation, scientific reporting, and MLOps',
  'Módulo 5 — Ética, regulação e prática profissional.':
    'Module 5 — Ethics, regulation, and professional practice.',
  'Apresentação de artigo 2': 'Paper presentation 2',
  Feriado: 'Public holiday',
  'Não haverá aula.': 'There will be no class.',
  'Aula 16: O futuro da medicina baseada em IA':
    'Lecture 16: The future of AI-based medicine',
  'Apresentação do projeto final': 'Final project presentation',
  'Apresentação e discussão dos miniprojetos desenvolvidos pelas equipes.':
    'Presentation and discussion of the mini-projects developed by the teams.',
  'Modelagem de Processos de Negócios': 'Business Process Modeling',
  'Descoberta, modelagem, análise e redesenho de processos de negócio, da situação atual à visão de futuro.':
    'Business process discovery, modeling, analysis, and redesign, from the current state to the future vision.',
  'O curso apresenta conceitos de processos de negócio e uma metodologia que parte do levantamento e do entendimento da situação atual (AS-IS), passa pela avaliação do processo e chega ao desenho da situação futura (TO-BE).':
    'The course introduces business process concepts and a methodology that starts by documenting and understanding the current state (AS-IS), proceeds through process assessment, and reaches the design of the future state (TO-BE).',
  'As datas de P1, P2, VR, VS e apresentações estão destacadas no calendário. Critérios e pesos devem ser confirmados no ambiente oficial da disciplina.':
    'Dates for P1, P2, VR, VS, and presentations are highlighted in the calendar. Criteria and weights must be confirmed in the official course environment.',
  'Calendário migrado da página legada. Confirme eventuais alterações com o professor.':
    'Calendar migrated from the legacy page. Confirm any changes with the professor.',
  'Segundas e quartas, 18h–20h': 'Mondays and Wednesdays, 6–8 p.m.',
  'Aula 1: Partes de um negócio': 'Lecture 1: Parts of a business',
  'Aula 2: Fundamentos de gerenciamento de processos de negócio':
    'Lecture 2: Fundamentals of business process management',
  'Aula 3: Fundamentos sobre processos de negócio':
    'Lecture 3: Fundamentals of business processes',
  'Aula 4: Descoberta de processos de negócio':
    'Lecture 4: Business process discovery',
  'Aula 5: Modelagem com BPMN — parte 1':
    'Lecture 5: Modeling with BPMN — part 1',
  'Aula 6: Modelagem com BPMN — parte 2':
    'Lecture 6: Modeling with BPMN — part 2',
  'Exercício em classe 1: modelagem de processos':
    'In-class exercise 1: process modeling',
  'Exercício em classe 2: modelagem de processos':
    'In-class exercise 2: process modeling',
  'Exercício em classe 3: modelagem de processos':
    'In-class exercise 3: process modeling',
  'Exercício em classe 4: modelagem de processos':
    'In-class exercise 4: process modeling',
  P1: 'P1',
  'Não haverá aula': 'No class',
  'Apresentação 1: tema do estudo de caso — parte 1':
    'Presentation 1: case study topic — part 1',
  'Apresentação 1: tema do estudo de caso — parte 2':
    'Presentation 1: case study topic — part 2',
  'Ano corrigido de 2926 para 2026; requer validação humana.':
    'Year corrected from 2926 to 2026; human validation required.',
  'Aula 7: Análise qualitativa de processos':
    'Lecture 7: Qualitative process analysis',
  'Aula 8: Análise quantitativa de processos':
    'Lecture 8: Quantitative process analysis',
  'Apresentação 2: modelo AS-IS — parte 1':
    'Presentation 2: AS-IS model — part 1',
  'Apresentação 2: modelo AS-IS — parte 2':
    'Presentation 2: AS-IS model — part 2',
  'Apresentação 2: modelo AS-IS — parte 3':
    'Presentation 2: AS-IS model — part 3',
  'Palestra: Processos e segurança da informação':
    'Guest lecture: Processes and information security',
  'Aula 9: Redesenho e melhoria TO-BE':
    'Lecture 9: TO-BE redesign and improvement',
  'Aula 10: Monitoramento de processos': 'Lecture 10: Process monitoring',
  'Exercício 5: análise qualitativa e quantitativa':
    'Exercise 5: qualitative and quantitative analysis',
  P2: 'P2',
  'Apresentação 4: desenho TO-BE — parte 1':
    'Presentation 4: TO-BE design — part 1',
  VR: 'VR',
  'Apresentação 4: desenho TO-BE — parte 2':
    'Presentation 4: TO-BE design — part 2',
  VS: 'VS',
  'Camunda Modeler': 'Camunda Modeler',
  'Bizagi Modeler': 'Bizagi Modeler',
  'Seixas Modeler': 'Seixas Modeler',
  'Modelagem de Processos de Negócio': 'Business Process Modeling',
  'O calendário de avaliações e os respectivos critérios serão publicados após a confirmação do planejamento do semestre.':
    'The assessment calendar and criteria will be published after the term plan is confirmed.',
  'Sextas-feiras, 18h–22h': 'Fridays, 6–10 p.m.',
  'Aula 2: Gerenciamento de processos de negócio':
    'Lecture 2: Business process management',
  'Aula 3: Ciclo de gestão de processos de negócio usando BPM':
    'Lecture 3: Business process management cycle using BPM',
  'Aula 5: Modelagem de processos de negócio com BPMN - parte 1':
    'Lecture 5: Business process modeling with BPMN — part 1',
  'Aula 6: Modelagem de processos de negócio com BPMN - parte 2':
    'Lecture 6: Business process modeling with BPMN — part 2',
  'Apresentação 1: tema do estudo de caso': 'Presentation 1: case study topic',
  'Aula 7: Análise de processos de negócio. Análise qualitativa: análise de valor agregado, análise de desperdício, análise de partes interessadas, diagrama de causa-efeito, técnica dos 5 porquês, pareto.':
    'Lecture 7: Business process analysis. Qualitative analysis: value-added analysis, waste analysis, stakeholder analysis, cause-and-effect diagram, five whys technique, and Pareto analysis.',
  'Aula 8: Análise de processos de negócio. Análise quantitativa: análise de fluxo, análise de fila, simulação de processos.':
    'Lecture 8: Business process analysis. Quantitative analysis: flow analysis, queue analysis, and process simulation.',
  'Apresentação 2: Modelagem de processos de negócio AS-IS':
    'Presentation 2: AS-IS business process modeling',
  'Aula 9: Redesenho e melhoria de processos de negócio; Aula 10: Monitoramento de processos':
    'Lecture 9: Business process redesign and improvement; Lecture 10: Process monitoring',
  'Apresentação 3: Desenho do processo TO-BE':
    'Presentation 3: TO-BE process design',
  'Programação de Aplicações Web': 'Web Application Programming',
  'Projeto e desenvolvimento de aplicações para a web, do navegador ao servidor e ao banco de dados.':
    'Design and development of web applications, from the browser to the server and database.',
  'Conteúdo histórico sobre arquitetura web, HTML, CSS, JavaScript, programação no servidor e persistência de dados. A atualização curricular desta disciplina precisa de validação antes do lançamento canônico.':
    'Historical content on web architecture, HTML, CSS, JavaScript, server-side programming, and data persistence. The curriculum update for this course requires validation before canonical release.',
  'Datas e critérios não estavam disponíveis de forma inequívoca na fonte pública consultada.':
    'Dates and criteria were not unambiguously available in the public source consulted.',
  'A página pública de origem não informa código, sala ou datas completas; confirme a logística com o professor.':
    'The original public page does not provide a code, room, or complete dates; confirm logistics with the professor.',
  'Horário a confirmar': 'Schedule to be confirmed',
  'Data indicativa para estruturar a disciplina; requer validação.':
    'Tentative date used to structure the course; validation required.',
  'Redes de Computadores': 'Computer Networks',
  'Disciplina histórica de Redes de Computadores, com fundamentos e laboratórios.':
    'Historical Computer Networks course, covering foundations and laboratory work.',
  'Registro preservado da disciplina de 2025.2.':
    'Preserved record of the 2025.2 course.',
  'Consulte o calendário histórico e os registros oficiais do semestre.':
    'See the historical calendar and the official records for the term.',
  'Quartas e sextas, 20h–22h': 'Wednesdays and Fridays, 8–10 p.m.',
  'Aula 1: O que é a Internet?': 'Lecture 1: What is the Internet?',
  'Aula 2: Camadas e modelos de serviço':
    'Lecture 2: Layers and service models',
  'Aula 3: Princípios de aplicações de rede':
    'Lecture 3: Principles of network applications',
  'Aula 4: Web e HTTP': 'Lecture 4: The Web and HTTP',
  'Laboratório 1: HTTP': 'Lab 1: HTTP',
  'Laboratório 2: Programação de sockets': 'Lab 2: Socket programming',
  'Laboratório 3: DNS': 'Lab 3: DNS',
  'Laboratório 4: TCP': 'Lab 4: TCP',
  'A Internet e as camadas de aplicação, transporte, rede e enlace, combinando fundamentos e laboratórios.':
    'The Internet and the application, transport, network, and link layers, combining foundations and laboratory work.',
  'A disciplina percorre a pilha da Internet: aplicações, transporte, rede e enlace. A teoria é acompanhada por exercícios e laboratórios com ferramentas de análise e simulação.':
    'The course covers the Internet stack: applications, transport, network, and link layers. Theory is accompanied by exercises and labs using analysis and simulation tools.',
  'O calendário destaca provas, revisão e apresentação do projeto. Pesos e regras devem ser consultados no canal oficial da turma.':
    'The calendar highlights exams, review sessions, and the project presentation. Weights and rules must be checked in the class’s official channel.',
  'Sala e ambiente virtual ainda precisam de confirmação.':
    'The room and virtual learning environment still need to be confirmed.',
  'Segundas e quartas, 20h–22h': 'Mondays and Wednesdays, 8–10 p.m.',
  'Aula 5: E-mail, DNS e distribuição de conteúdo':
    'Lecture 5: Email, DNS, and content distribution',
  'Aula 6: Camada de transporte': 'Lecture 6: Transport layer',
  'Aula 7: UDP e TCP': 'Lecture 7: UDP and TCP',
  Exercícios: 'Exercises',
  'Aula 8: Controle de congestionamento TCP':
    'Lecture 8: TCP congestion control',
  'Apresentação do tema do projeto': 'Project topic presentation',
  'Aula 9: Camada de rede': 'Lecture 9: Network layer',
  'Aula 10: Roteadores': 'Lecture 10: Routers',
  'Aula 11: Endereçamento IP': 'Lecture 11: IP addressing',
  'Aula 12: NAT, DHCP e ICMP': 'Lecture 12: NAT, DHCP, and ICMP',
  'Aula 13: Enlace, LANs e Ethernet':
    'Lecture 13: Link layer, LANs, and Ethernet',
  'Laboratório 5: ARP': 'Lab 5: ARP',
  'Revisão dos exercícios': 'Exercise review',
  'Apresentação do projeto de aplicação': 'Application project presentation',
  'Cisco Packet Tracer': 'Cisco Packet Tracer',
  Wireshark: 'Wireshark',
  'Inteligência artificial em saúde, dos dados e do desenho de estudos à implementação clínica, ética e regulação.':
    'Artificial intelligence in healthcare, from data and study design to clinical implementation, ethics, and regulation.',
  'aprendizado de máquina': 'machine learning',
  'inteligência artificial em saúde': 'artificial intelligence in healthcare',
  'dados clínicos e interoperabilidade': 'clinical data and interoperability',
  'aprendizado profundo': 'deep learning',
  'NLP biomédico e modelos de linguagem': 'biomedical NLP and language models',
  'inferência causal e sobrevivência': 'causal inference and survival',
  'apoio à decisão clínica': 'clinical decision support',
  'explicabilidade, equidade e privacidade':
    'explainability, equity, and privacy',
  'regulação e MLOps': 'regulation and MLOps',
  'Descoberta, modelagem, análise e redesenho de processos de negócio.':
    'Business process discovery, modeling, analysis, and redesign.',
  BPMN: 'BPMN',
  'AS-IS': 'AS-IS',
  'TO-BE': 'TO-BE',
  'gestão de processos': 'process management',
  'Fundamentos e prática do desenvolvimento de aplicações para a web.':
    'Foundations and practice of web application development.',
  HTML: 'HTML',
  CSS: 'CSS',
  JavaScript: 'JavaScript',
  PHP: 'PHP',
  MySQL: 'MySQL',
  'Fundamentos da Internet e das camadas de aplicação, transporte, rede e enlace.':
    'Foundations of the Internet and the application, transport, network, and link layers.',
  Internet: 'Internet',
  HTTP: 'HTTP',
  TCP: 'TCP',
  IP: 'IP',
  Ethernet: 'Ethernet',
  'Fábrica de Software e Tecnologia para a Saúde':
    'Software and Healthcare Technology Factory',
  'Projeto de extensão que aproxima computação, saúde, formação discente e necessidades reais da comunidade.':
    'An outreach project connecting computing, healthcare, student education, and real community needs.',
  'Inteligência artificial aplicada à saúde':
    'Artificial intelligence applied to healthcare',
  'Métodos computacionais de apoio à decisão e análise de sinais e imagens médicas.':
    'Computational methods for decision support and medical signal and image analysis.'
};

export const translateContent = (
  value: string | null | undefined,
  locale: Locale
) => {
  if (!value || locale === 'pt') return value;
  return englishContent[value] ?? value;
};

const translatedArray = (
  values: string[] | undefined,
  locale: Locale
): string[] => (values ?? []).map((value) => translateContent(value, locale)!);

export const localizeOffering = <T extends Record<string, any>>(
  source: T,
  locale: Locale
): T => {
  if (locale === 'pt') return source;
  return {
    ...source,
    title: translateContent(source.title, locale),
    summary: translateContent(source.summary, locale),
    overview: translateContent(source.overview, locale),
    objective: translateContent(source.objective, locale),
    methodology: translateContent(source.methodology, locale),
    evaluation: translateContent(source.evaluation, locale),
    notice: translateContent(source.notice, locale),
    schedule: translateContent(source.schedule, locale),
    syllabus: translatedArray(source.syllabus, locale),
    prerequisites: translatedArray(source.prerequisites, locale),
    materials: (source.materials ?? []).map((material: any) => ({
      ...material,
      title: translateContent(material.title, locale)
    })),
    calendar: (source.calendar ?? []).map((event: any) => ({
      ...event,
      title: translateContent(event.title, locale),
      previous_title: translateContent(event.previous_title, locale),
      note: translateContent(event.note, locale),
      topics: translatedArray(event.topics, locale),
      materials: (event.materials ?? []).map((material: any) => ({
        ...material,
        title: translateContent(material.title, locale)
      }))
    }))
  };
};
