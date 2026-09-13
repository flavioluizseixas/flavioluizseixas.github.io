// Execute setupRegistrations_ somente no editor, com a conta institucional.
// Funções terminadas em _ não podem ser chamadas por google.script.run.
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
  try {
    return saveRegistration_(payload);
  } catch (error) {
    // Não devolver exceções do Google, IDs internos nem dados pessoais ao navegador.
    const code = Object.prototype.hasOwnProperty.call(
      REGISTRATION_CONFIG.copy.errors,
      error.message
    )
      ? error.message
      : 'retry';
    return { ok: false, code: code };
  }
}

function fail_(code) {
  throw new Error(code);
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

function saveRegistration_(payload) {
  const properties = PropertiesService.getScriptProperties();
  if (properties.getProperty('REGISTRATIONS_PAUSED') !== 'false')
    fail_('unavailable');
  const submission = normalizeSubmission_(payload);
  const project = submission.project;
  const resources = JSON.parse(
    properties.getProperty(resourceKey_(project)) || 'null'
  );
  if (
    !resources ||
    resources.rootId !== properties.getProperty('ROOT_FOLDER_ID')
  )
    fail_('unavailable');
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
  if (!lock.tryLock(5000)) fail_('retry');
  try {
    const sheet = SpreadsheetApp.openById(
      resources.spreadsheetId
    ).getSheets()[0];
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
    takeQuota_(properties, submission.email);
    const protocol = 'EXT-' + submission.requestId;
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
      sheet.appendRow(row);
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
