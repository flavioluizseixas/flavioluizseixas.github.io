// Gerado por npm run prepare:registrations. Edite data/, não este arquivo.
const REGISTRATION_CONFIG = {
  emailDomain: 'id.uff.br',
  maxPdfBytes: 5242880,
  maxSubmissionsPerDay: 50,
  maxSubmissionsPerEmailPerDay: 3,
  privacyVersion: '2026-09-13',
  allowedOrigins: ['https://flavioluizseixas.github.io'],
  projects: [
    {
      slug: 'acenf',
      title: 'ACEnf — Aplicativo para Auditoria Clínica de Enfermagem',
      term: '02-2026',
      status: 'inscricoes-abertas',
      deadline: null
    },
    {
      slug: 'assinaturas-biologicas-orais-risco-cardiovascular',
      title:
        'Assinaturas biológicas em doenças orais: predição do risco cardiovascular',
      term: '02-2026',
      status: 'inscricoes-abertas',
      deadline: null
    },
    {
      slug: 'auditoria-saude-suplementar',
      title: 'Tecnologia Digital de Apoio à Auditoria em Saúde Suplementar',
      term: '02-2026',
      status: 'inscricoes-abertas',
      deadline: null
    },
    {
      slug: 'qualificacao-denuncias-enfermagem',
      title:
        'Sistema para Qualificação de Denúncias na Fiscalização Profissional de Enfermagem',
      term: '02-2026',
      status: 'inscricoes-abertas',
      deadline: null
    },
    {
      slug: 'sistema-acompanhamento-egressos',
      title: 'Sistema de Acompanhamento de Egressos',
      term: '02-2026',
      status: 'inscricoes-abertas',
      deadline: null
    },
    {
      slug: 'trajetorias-funcionais-deambulacao-uti',
      title:
        'Trajetórias funcionais e predição da capacidade de deambulação na alta da UTI',
      term: '02-2026',
      status: 'inscricoes-abertas',
      deadline: null
    },
    {
      slug: 'ventilacao-mecanica-trajetorias-ml',
      title:
        'Liberação da Ventilação Mecânica: trajetórias com Machine Learning',
      term: '02-2026',
      status: 'inscricoes-abertas',
      deadline: null
    }
  ],
  copy: {
    heading: 'Inscreva-se neste projeto',
    intro:
      'Preencha seus dados e anexe seu histórico escolar para participar da seleção.',
    unavailable:
      'O formulário de inscrição está em preparação. Para saber como participar, entre em contato.',
    contact: 'Entrar em contato',
    name: 'Nome completo',
    email: 'E-mail institucional',
    emailHelp:
      'Use seu endereço @id.uff.br. Confira a digitação: esse será o contato informado à equipe.',
    transcript: 'Histórico escolar em PDF',
    pdfHelp:
      'Anexe o histórico gerado pelo IdUFF. Apenas PDF, com até {maxMiB} MB.',
    interest: 'O que despertou seu interesse neste projeto?',
    interestHelp: 'Escreva de 20 a 3.000 caracteres.',
    privacy:
      'Seu nome, e-mail, texto de interesse e histórico serão armazenados no Google Drive institucional para análise da inscrição pela equipe responsável pelo projeto.',
    acknowledgment:
      'Declaro que os dados são meus, que o histórico foi gerado pelo IdUFF e que estou ciente do uso dessas informações na seleção.',
    submit: 'Enviar inscrição',
    sending: 'Enviando sua inscrição… Aguarde a confirmação.',
    success: 'Inscrição recebida. Guarde seu protocolo: {protocol}.',
    noScript:
      'Ative o JavaScript para enviar a inscrição pelo site ou entre em contato com a equipe.',
    bridgeTitle: 'Conexão para envio da inscrição',
    errors: {
      invalid: 'Confira os campos obrigatórios e tente novamente.',
      name: 'Informe seu nome completo, com nome e sobrenome (até 150 caracteres).',
      email: 'Informe um endereço válido terminado em @id.uff.br.',
      interest: 'O texto de interesse deve ter entre 20 e 3.000 caracteres.',
      pdf: 'Anexe um arquivo PDF válido gerado pelo IdUFF, dentro do limite de tamanho indicado.',
      closed: 'As inscrições para este projeto estão encerradas.',
      unavailable:
        'O envio está temporariamente indisponível. Tente mais tarde ou entre em contato com a equipe.',
      limit:
        'O limite de envios foi atingido. Tente novamente amanhã ou entre em contato com a equipe.',
      retry:
        'Não foi possível confirmar o recebimento. Mantenha esta página aberta e tente enviar novamente; o mesmo envio não será gravado duas vezes.',
      conflict:
        'Este envio já foi registrado com outros dados. Recarregue a página para fazer uma nova inscrição.'
    },
    storage: {
      pdfFolder: 'Históricos',
      spreadsheet: 'Respostas',
      sheet: 'Inscrições',
      headers: [
        'Protocolo',
        'Recebido em',
        'Projeto',
        'Semestre',
        'Nome completo',
        'E-mail informado (não verificado)',
        'Interesse',
        'Histórico PDF',
        'ID do arquivo',
        'ID do envio',
        'Hash do envio',
        'Ciência do uso dos dados (versão)'
      ]
    }
  }
};
