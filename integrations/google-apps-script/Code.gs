// Selecione estas funções no editor com a conta responsável pela implantação.
// As entradas sem _ também são visíveis ao RPC: a verificação de identidade é obrigatória.
function prepararInscricoes() {
  requireAdministrativeUser_();
  return setupRegistrations_();
}

function diagnosticarInscricoes() {
  requireAdministrativeUser_();
  return diagnoseRegistrations_();
}

function testarArmazenamento() {
  requireAdministrativeUser_();
  return testRegistrationStorage_();
}

function requireAdministrativeUser_() {
  // getEffectiveUser sozinho identifica o dono mesmo em chamadas anônimas.
  // Exigir também a identidade ativa impede que visitantes executem a administração.
  const active = Session.getActiveUser().getEmail().trim().toLowerCase();
  const effective = Session.getEffectiveUser().getEmail().trim().toLowerCase();
  if (!active || !effective || active !== effective) {
    throw new Error(
      'Acesso administrativo negado. Execute pelo editor do Apps Script com a conta responsável pela implantação.'
    );
  }
}

// Implementações internas: funções terminadas em _ não são chamadas por google.script.run.
function setupRegistrations_() {
  const properties = PropertiesService.getScriptProperties();
  const rootId = properties.getProperty('ROOT_FOLDER_ID');
  if (!rootId)
    throw new Error('Defina ROOT_FOLDER_ID nas propriedades do script.');
  const root = DriveApp.getFolderById(rootId);
  if (root.getSharingAccess() !== DriveApp.Access.PRIVATE) {
    throw new Error('A pasta raiz deve ter acesso geral Restrito.');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    REGISTRATION_CONFIG.projects.forEach(function (project) {
      const key = resourceKey_(project);
      const existing = properties.getProperty(key);
      if (existing) {
        if (JSON.parse(existing).rootId !== rootId) {
          throw new Error(
            'A pasta raiz mudou. Use outro projeto Apps Script para outro arquivo de inscrições.'
          );
        }
        return;
      }
      const folder = findOrCreateFolder_(
        root,
        project.term + '--' + project.slug
      );
      const pdfs = findOrCreateFolder_(
        folder,
        REGISTRATION_CONFIG.copy.storage.pdfFolder
      );
      const spreadsheets = folder.getFilesByName(
        REGISTRATION_CONFIG.copy.storage.spreadsheet
      );
      let spreadsheet;
      if (spreadsheets.hasNext()) {
        spreadsheet = SpreadsheetApp.openById(spreadsheets.next().getId());
        if (spreadsheets.hasNext())
          throw new Error('Há planilhas com nomes duplicados na pasta.');
      } else {
        spreadsheet = SpreadsheetApp.create(
          REGISTRATION_CONFIG.copy.storage.spreadsheet
        );
        DriveApp.getFileById(spreadsheet.getId()).moveTo(folder);
      }
      const sheet = spreadsheet.getSheets()[0];
      sheet.setName(REGISTRATION_CONFIG.copy.storage.sheet);
      if (!sheet.getLastRow()) {
        sheet.appendRow(REGISTRATION_CONFIG.copy.storage.headers);
        sheet.setFrozenRows(1);
      }
      SpreadsheetApp.flush();
      properties.setProperty(
        key,
        JSON.stringify({
          rootId: rootId,
          pdfFolderId: pdfs.getId(),
          spreadsheetId: spreadsheet.getId()
        })
      );
    });
    if (properties.getProperty('REGISTRATIONS_PAUSED') === null) {
      properties.setProperty('REGISTRATIONS_PAUSED', 'false');
    }
  } finally {
    lock.releaseLock();
  }
  console.log(
    'Preparação concluída. Projetos: ' + REGISTRATION_CONFIG.projects.length
  );
}

function findOrCreateFolder_(parent, name) {
  const matches = parent.getFoldersByName(name);
  if (!matches.hasNext()) return parent.createFolder(name);
  const folder = matches.next();
  if (matches.hasNext())
    throw new Error('Há pastas com nomes duplicados: ' + name);
  return folder;
}

function resourceKey_(project) {
  return 'PROJECT_' + project.term + '_' + project.slug;
}

function doGet(event) {
  const params = (event && event.parameter) || {};
  if (
    REGISTRATION_CONFIG.allowedOrigins.indexOf(params.origin) < 0 ||
    !/^[a-f0-9-]{36}$/.test(params.channel || '')
  ) {
    return HtmlService.createHtmlOutput(
      'Acesse o formulário pela página do projeto.'
    );
  }
  const template = HtmlService.createTemplateFromFile('Bridge');
  template.siteOrigin = params.origin;
  template.channel = params.channel;
  return template
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function submitRegistration(payload) {
  const context = { stage: 'INITIALIZE' };
  try {
    return saveRegistration_(payload, context);
  } catch (error) {
    // Não devolver exceções do Google, IDs internos nem dados pessoais ao navegador.
    const code = Object.prototype.hasOwnProperty.call(
      REGISTRATION_CONFIG.copy.errors,
      error.message
    )
      ? error.message
      : 'retry';
    console.error(
      JSON.stringify({
        event: 'REGISTRATION_FAILED',
        code: code,
        reason: error.registrationReason || 'GOOGLE_SERVICE_ERROR',
        stage: context.stage
      })
    );
    return { ok: false, code: code };
  }
}

function fail_(code, reason) {
  const error = new Error(code);
  error.registrationReason = reason || code;
  throw error;
}

function normalizeSubmission_(payload) {
  if (
    !payload ||
    typeof payload !== 'object' ||
    payload.website ||
    payload.acknowledgment !== true ||
    payload.privacyVersion !== REGISTRATION_CONFIG.privacyVersion ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(
      payload.requestId || ''
    )
  )
    fail_('invalid');
  const name =
    typeof payload.name === 'string'
      ? payload.name.trim().replace(/\s+/g, ' ')
      : '';
  if (name.length > 150 || !/^\S+\s+\S/.test(name) || /[\x00-\x1f]/.test(name))
    fail_('name');
  const email =
    typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  if (
    email.length > 254 ||
    !/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@id\.uff\.br$/.test(
      email
    )
  )
    fail_('email');
  const interest =
    typeof payload.interest === 'string' ? payload.interest.trim() : '';
  if (
    interest.length < 20 ||
    interest.length > 3000 ||
    /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(interest)
  )
    fail_('interest');
  const project = REGISTRATION_CONFIG.projects.find(function (entry) {
    return entry.slug === payload.project;
  });
  if (!project || payload.term !== project.term) fail_('closed');
  const file = payload.file;
  if (
    !file ||
    typeof file.name !== 'string' ||
    file.name.length > 255 ||
    !/\.pdf$/i.test(file.name) ||
    (file.type !== '' && file.type !== 'application/pdf') ||
    typeof file.base64 !== 'string' ||
    file.base64.length > Math.ceil(REGISTRATION_CONFIG.maxPdfBytes / 3) * 4 ||
    !file.base64.length ||
    file.base64.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(file.base64)
  )
    fail_('pdf');
  let bytes;
  try {
    bytes = Utilities.base64Decode(file.base64);
  } catch (_) {
    fail_('pdf');
  }
  if (bytes.length > REGISTRATION_CONFIG.maxPdfBytes || bytes.length < 20)
    fail_('pdf');
  const header = bytes
    .slice(0, 8)
    .map(function (byte) {
      return String.fromCharCode(byte & 255);
    })
    .join('');
  const tail = bytes
    .slice(-1024)
    .map(function (byte) {
      return String.fromCharCode(byte & 255);
    })
    .join('');
  if (!/^%PDF-(1\.[0-7]|2\.0)/.test(header) || !/%%EOF\s*$/.test(tail))
    fail_('pdf');
  return {
    name: name,
    email: email,
    interest: interest,
    project: project,
    bytes: bytes,
    requestId: payload.requestId
  };
}

function digest_(value) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value)
    .map(function (byte) {
      return ('0' + (byte & 255).toString(16)).slice(-2);
    })
    .join('');
}

function rowForRequest_(sheet, requestId) {
  const last = sheet.getLastRow();
  if (last < 2) return null;
  const cell = sheet
    .getRange(2, 10, last - 1, 1)
    .createTextFinder(requestId)
    .matchEntireCell(true)
    .useRegularExpression(false)
    .findNext();
  return cell ? sheet.getRange(cell.getRow(), 1, 1, 12).getValues()[0] : null;
}

function receipt_(row, hash) {
  if (row[10] !== hash) fail_('conflict');
  return { ok: true, protocol: row[0] };
}

function takeQuota_(properties, email) {
  const day = Utilities.formatDate(
    new Date(),
    'America/Sao_Paulo',
    'yyyy-MM-dd'
  );
  let quota = JSON.parse(properties.getProperty('DAILY_QUOTA') || '{}');
  if (quota.day !== day) quota = { day: day, total: 0, emails: {} };
  const key = digest_(email).slice(0, 32);
  if (
    quota.total >= REGISTRATION_CONFIG.maxSubmissionsPerDay ||
    (quota.emails[key] || 0) >= REGISTRATION_CONFIG.maxSubmissionsPerEmailPerDay
  )
    fail_('limit');
  quota.total++;
  quota.emails[key] = (quota.emails[key] || 0) + 1;
  properties.setProperty('DAILY_QUOTA', JSON.stringify(quota));
}

function safeCell_(value) {
  // Texto fornecido por alunos nunca pode virar fórmula no Sheets.
  return /^[=+\-@\t\r\n]/.test(value) ? "'" + value : value;
}

function saveRegistration_(payload, context) {
  const properties = PropertiesService.getScriptProperties();
  const rootId = properties.getProperty('ROOT_FOLDER_ID');
  if (!rootId) fail_('unavailable', 'ROOT_NOT_CONFIGURED');
  const paused = properties.getProperty('REGISTRATIONS_PAUSED');
  if (paused === null) fail_('unavailable', 'SETUP_REQUIRED');
  if (paused !== 'false') fail_('unavailable', 'SERVICE_PAUSED');
  context.stage = 'VALIDATE_SUBMISSION';
  const submission = normalizeSubmission_(payload);
  const project = submission.project;
  context.stage = 'PROJECT_RESOURCES';
  let resources;
  try {
    resources = JSON.parse(
      properties.getProperty(resourceKey_(project)) || 'null'
    );
  } catch (_) {
    fail_('unavailable', 'PROJECT_CONFIG_INVALID');
  }
  if (!resources) fail_('unavailable', 'PROJECT_NOT_INITIALIZED');
  if (resources.rootId !== rootId) fail_('unavailable', 'ROOT_CHANGED');
  if (!resources.pdfFolderId || !resources.spreadsheetId)
    fail_('unavailable', 'PROJECT_CONFIG_INVALID');
  const hash = digest_(
    JSON.stringify([
      submission.name,
      submission.email,
      submission.interest,
      project.slug,
      project.term,
      REGISTRATION_CONFIG.privacyVersion,
      digest_(submission.bytes)
    ])
  );
  const lock = LockService.getScriptLock();
  context.stage = 'ACQUIRE_LOCK';
  if (!lock.tryLock(5000)) fail_('retry');
  try {
    context.stage = 'OPEN_SPREADSHEET';
    const sheet = SpreadsheetApp.openById(
      resources.spreadsheetId
    ).getSheets()[0];
    context.stage = 'FIND_PREVIOUS_SUBMISSION';
    const previous = rowForRequest_(sheet, submission.requestId);
    if (previous) return receipt_(previous, hash);
    const today = Utilities.formatDate(
      new Date(),
      'America/Sao_Paulo',
      'yyyy-MM-dd'
    );
    if (
      project.status !== 'inscricoes-abertas' ||
      (project.deadline && today > project.deadline)
    )
      fail_('closed');
    context.stage = 'CHECK_QUOTA';
    takeQuota_(properties, submission.email);
    const protocol = 'EXT-' + submission.requestId;
    context.stage = 'CREATE_PDF';
    const folder = DriveApp.getFolderById(resources.pdfFolderId);
    const pdf = folder.createFile(
      Utilities.newBlob(submission.bytes, 'application/pdf', protocol + '.pdf')
    );
    const row = [
      protocol,
      new Date().toISOString(),
      safeCell_(project.title),
      project.term,
      safeCell_(submission.name),
      safeCell_(submission.email),
      safeCell_(submission.interest),
      pdf.getUrl(),
      pdf.getId(),
      submission.requestId,
      hash,
      REGISTRATION_CONFIG.privacyVersion
    ];
    try {
      context.stage = 'APPEND_RESPONSE';
      sheet.appendRow(row);
      context.stage = 'FLUSH_RESPONSE';
      SpreadsheetApp.flush();
    } catch (error) {
      // Um timeout pode ocorrer depois de o Sheets gravar: verificar antes de remover o PDF.
      // Se a consulta também falhar, preservar o arquivo para reconciliação pelo responsável.
      const persisted = rowForRequest_(sheet, submission.requestId);
      if (persisted) return receipt_(persisted, hash);
      pdf.setTrashed(true);
      throw error;
    }
    return { ok: true, protocol: protocol };
  } finally {
    lock.releaseLock();
  }
}

// Diagnóstico privado: executar no editor, nunca expor por doGet/google.script.run.
// Lê configuração, metadados e cabeçalhos; não lê as respostas dos alunos.
function diagnoseRegistrations_() {
  const properties = PropertiesService.getScriptProperties();
  const rootId = properties.getProperty('ROOT_FOLDER_ID');
  const checks = [];
  let rootUrl = null;
  function check(item, action) {
    try {
      action();
      checks.push({ item: item, ok: true });
    } catch (error) {
      checks.push({ item: item, ok: false, detail: error.message });
    }
  }
  check('ROOT_FOLDER_ID', function () {
    if (!rootId)
      throw new Error('Defina o ID da pasta raiz nas Propriedades do script.');
    const root = DriveApp.getFolderById(rootId);
    if (root.isTrashed()) throw new Error('A pasta raiz está na lixeira.');
    if (root.getSharingAccess() !== DriveApp.Access.PRIVATE)
      throw new Error('Mantenha o Acesso geral da pasta raiz como Restrito.');
    rootUrl = root.getUrl();
  });
  check('REGISTRATIONS_PAUSED', function () {
    const paused = properties.getProperty('REGISTRATIONS_PAUSED');
    if (paused === null)
      throw new Error(
        'Inicialização pendente: execute prepararInscricoes até concluir sem erros.'
      );
    if (paused !== 'false')
      throw new Error(
        'Serviço pausado. Para retomar após conferir a configuração, use o valor false (minúsculo, sem espaços).'
      );
  });
  REGISTRATION_CONFIG.projects.forEach(function (project) {
    check(resourceKey_(project), function () {
      const raw = properties.getProperty(resourceKey_(project));
      if (!raw)
        throw new Error('Projeto não preparado: execute prepararInscricoes.');
      const resources = JSON.parse(raw);
      if (!resources || resources.rootId !== rootId)
        throw new Error(
          'Cadastro incompatível com a pasta raiz atual. Confira ROOT_FOLDER_ID.'
        );
      if (!resources.pdfFolderId || !resources.spreadsheetId)
        throw new Error(
          'Cadastro incompleto. Não edite as propriedades PROJECT_* manualmente.'
        );
      const folder = DriveApp.getFolderById(resources.pdfFolderId);
      if (folder.isTrashed())
        throw new Error('A pasta de históricos está na lixeira.');
      if (DriveApp.getFileById(resources.spreadsheetId).isTrashed())
        throw new Error('A planilha de respostas está na lixeira.');
      const sheet = SpreadsheetApp.openById(
        resources.spreadsheetId
      ).getSheets()[0];
      const expected = REGISTRATION_CONFIG.copy.storage.headers;
      const headers = sheet
        .getRange(1, 1, 1, expected.length)
        .getDisplayValues()[0];
      if (JSON.stringify(headers) !== JSON.stringify(expected))
        throw new Error(
          'Cabeçalhos ou ordem das colunas diferentes da configuração. Confira a primeira aba da planilha.'
        );
    });
  });
  const report = {
    ok: checks.every(function (entry) {
      return entry.ok;
    }),
    rootUrl: rootUrl,
    allowedOrigins: REGISTRATION_CONFIG.allowedOrigins,
    projects: REGISTRATION_CONFIG.projects.length,
    checks: checks
  };
  console.log(JSON.stringify(report, null, 2));
  return report;
}

// Teste real e privado de escrita. Só os arquivos criados nesta execução vão à lixeira.
// Não gera inscrição, não consome a cota de inscrições e não altera planilhas existentes.
function testRegistrationStorage_() {
  const temporary = [];
  const report = { ok: false, stage: 'ROOT_FOLDER', cleanupErrors: [] };
  try {
    const rootId =
      PropertiesService.getScriptProperties().getProperty('ROOT_FOLDER_ID');
    if (!rootId)
      throw new Error('Defina ROOT_FOLDER_ID nas Propriedades do script.');
    const root = DriveApp.getFolderById(rootId);
    if (root.isTrashed() || root.getSharingAccess() !== DriveApp.Access.PRIVATE)
      throw new Error('Use uma pasta raiz ativa com Acesso geral Restrito.');
    report.stage = 'CREATE_TEST_FOLDER';
    const folder = root.createFolder(
      '_teste-inscricoes-' + Utilities.getUuid()
    );
    temporary.push(folder);
    report.temporaryFolderUrl = folder.getUrl();
    report.stage = 'WRITE_DRIVE';
    const text = 'Teste de escrita das inscrições. Sem dados de alunos.';
    const file = folder.createFile(
      Utilities.newBlob(text, 'text/plain', 'teste.txt')
    );
    temporary.push(file);
    if (file.getBlob().getDataAsString() !== text)
      throw new Error('O conteúdo lido no Drive difere do conteúdo escrito.');
    report.stage = 'CREATE_SPREADSHEET';
    const spreadsheet = SpreadsheetApp.create('_teste-inscricoes');
    const spreadsheetFile = DriveApp.getFileById(spreadsheet.getId());
    temporary.push(spreadsheetFile);
    spreadsheetFile.moveTo(folder);
    report.stage = 'WRITE_SHEETS';
    const sheet = spreadsheet.getSheets()[0];
    sheet.appendRow(['Diagnóstico', 'OK']);
    SpreadsheetApp.flush();
    if (sheet.getRange(1, 1, 1, 2).getDisplayValues()[0][1] !== 'OK')
      throw new Error(
        'Não foi possível confirmar a leitura da linha de teste.'
      );
    report.ok = true;
    report.stage = 'COMPLETE';
  } catch (error) {
    report.error = error.message;
  } finally {
    temporary.reverse().forEach(function (resource) {
      try {
        resource.setTrashed(true);
      } catch (error) {
        report.cleanupErrors.push(error.message);
      }
    });
    if (report.cleanupErrors.length) report.ok = false;
  }
  console.log(JSON.stringify(report, null, 2));
  return report;
}
