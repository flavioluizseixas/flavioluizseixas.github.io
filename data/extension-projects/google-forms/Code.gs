// Use em um projeto independente do Apps Script, executado pelo editor.
// Não é necessário implantar um aplicativo web.

function prepararModelo() {
  return comBloqueio_(function () {
    const folder = pastaFormularios_();
    const properties = PropertiesService.getScriptProperties();
    let id = properties.getProperty('GOOGLE_FORMS_TEMPLATE_ID');
    let form;
    if (id) {
      form = FormApp.openById(id);
    } else {
      const existing = arquivoUnico_(folder, GOOGLE_FORMS_CONFIG.templateName);
      form = existing
        ? FormApp.openById(existing.getId())
        : FormApp.create(GOOGLE_FORMS_CONFIG.templateName, false);
      id = form.getId();
      properties.setProperty('GOOGLE_FORMS_TEMPLATE_ID', id);
    }
    DriveApp.getFileById(id).moveTo(folder);
    form.setPublished(false);
    form.setDescription(
      'Modelo de inscrição. Acrescente a pergunta obrigatória de upload do histórico escolar da UFF antes de criar os formulários dos projetos.'
    );
    form.setCollectEmail(false);
    form.setPublishingSummary(false);
    form.setShuffleQuestions(false);
    form.setConfirmationMessage(GOOGLE_FORMS_CONFIG.confirmation);
    const fields = GOOGLE_FORMS_CONFIG.fields;
    campoTexto_(form, fields.name, FormApp.ItemType.TEXT)
      .setHelpText(
        'Informe seu nome completo, como consta no histórico escolar.'
      )
      .setRequired(true);
    campoTexto_(form, fields.email, FormApp.ItemType.TEXT)
      .setHelpText('Informe um e-mail válido para contato.')
      .setValidation(
        FormApp.createTextValidation().requireTextIsEmail().build()
      )
      .setRequired(true);
    campoTexto_(form, fields.interest, FormApp.ItemType.PARAGRAPH_TEXT)
      .setHelpText(
        'Conte o que chamou sua atenção no projeto e por que gostaria de participar.'
      )
      .setRequired(true);
    console.log('Pasta: ' + folder.getUrl());
    console.log('Modelo: ' + form.getEditUrl());
    console.log(
      'No modelo, acrescente como terceira pergunta: "' +
        fields.transcript +
        '". Tipo: Upload de arquivo; obrigatória; apenas PDF; 1 arquivo; até 10 MB. Depois execute criarFormularios.'
    );
    return form.getEditUrl();
  });
}

function criarFormularios() {
  return comBloqueio_(function () {
    const properties = PropertiesService.getScriptProperties();
    const templateId = properties.getProperty('GOOGLE_FORMS_TEMPLATE_ID');
    if (!templateId) throw new Error('Execute prepararModelo primeiro.');
    const template = FormApp.openById(templateId);
    validarModelo_(template);
    if (template.isPublished()) {
      throw new Error(
        'Despublique o modelo antes de copiar, para criar os projetos como rascunhos.'
      );
    }
    const folder = pastaFormularios_();
    const templateFile = DriveApp.getFileById(templateId);
    const links = GOOGLE_FORMS_CONFIG.projects.map(function (project) {
      const key = 'GOOGLE_FORM_' + project.slug;
      const saved = properties.getProperty(key);
      let state = saved ? JSON.parse(saved) : null;
      if (!state) {
        // Reaproveita uma cópia caso a execução tenha parado antes de salvar o ID.
        const file =
          arquivoUnico_(folder, project.fileName) ||
          templateFile.makeCopy(project.fileName, folder);
        state = { id: file.getId(), ready: false };
        properties.setProperty(key, JSON.stringify(state));
      }
      const form = FormApp.openById(state.id);
      if (!state.ready) {
        form.setPublished(false);
        validarModelo_(form);
        form.setTitle(project.title);
        form.setDescription(
          project.description + '\n\nSobre o projeto: ' + project.pageUrl
        );
        form.setConfirmationMessage(GOOGLE_FORMS_CONFIG.confirmation);
        form.setPublishingSummary(false);
        form.setCollectEmail(false);
        form.setShuffleQuestions(false);
        state.ready = true;
        properties.setProperty(key, JSON.stringify(state));
      }
      // Formulários já preparados não são reconfigurados nem despublicados.
      const link = {
        slug: project.slug,
        title: project.title,
        editUrl: form.getEditUrl(),
        responseUrl: form.getPublishedUrl(),
        published: form.isPublished()
      };
      console.log(JSON.stringify(link));
      return link;
    });
    const indexName = 'links-formularios.json';
    const content = JSON.stringify(links, null, 2);
    const index = arquivoUnico_(folder, indexName);
    if (index) index.setContent(content);
    else folder.createFile(indexName, content, 'application/json');
    console.log('Formulários organizados em: ' + folder.getUrl());
    console.log(
      'Confira o upload em cada cópia, publique os formulários no Google Forms e use os links de resposta.'
    );
    return links;
  });
}

function validarModelo_(form) {
  const fields = GOOGLE_FORMS_CONFIG.fields;
  const expected = [
    [fields.name, FormApp.ItemType.TEXT],
    [fields.email, FormApp.ItemType.TEXT],
    [fields.transcript, FormApp.ItemType.FILE_UPLOAD],
    [fields.interest, FormApp.ItemType.PARAGRAPH_TEXT]
  ];
  const items = form.getItems();
  if (
    items.length !== expected.length ||
    expected.some(function (field, index) {
      return (
        items[index].getTitle() !== field[0] ||
        items[index].getType() !== field[1]
      );
    })
  ) {
    throw new Error(
      'O modelo deve ter exatamente quatro perguntas, nesta ordem: nome completo, e-mail, histórico escolar da UFF (Upload de arquivo) e interesse. Use os títulos do README.'
    );
  }
  if (
    !items[0].asTextItem().isRequired() ||
    !items[1].asTextItem().isRequired() ||
    !items[3].asParagraphTextItem().isRequired()
  ) {
    throw new Error('Nome, e-mail e interesse precisam ser obrigatórios.');
  }
  // O serviço FormApp não expõe os ajustes específicos de FILE_UPLOAD.
  // Obrigatoriedade, PDF, quantidade e tamanho são configurados no editor do modelo.
}

function campoTexto_(form, title, type) {
  const matches = form.getItems().filter(function (item) {
    return item.getTitle() === title;
  });
  if (matches.length > 1 || (matches.length && matches[0].getType() !== type)) {
    throw new Error(
      'Confira a pergunta duplicada ou com tipo incorreto: ' + title
    );
  }
  if (type === FormApp.ItemType.PARAGRAPH_TEXT) {
    return matches.length
      ? matches[0].asParagraphTextItem()
      : form.addParagraphTextItem().setTitle(title);
  }
  return matches.length
    ? matches[0].asTextItem()
    : form.addTextItem().setTitle(title);
}

function pastaFormularios_() {
  return GOOGLE_FORMS_CONFIG.folderPath.reduce(function (parent, name) {
    const folders = parent.getFoldersByName(name);
    if (!folders.hasNext()) return parent.createFolder(name);
    const folder = folders.next();
    if (folders.hasNext())
      throw new Error(
        'Há mais de uma pasta chamada ' + name + ' no mesmo local.'
      );
    return folder;
  }, DriveApp.getRootFolder());
}

function arquivoUnico_(folder, name) {
  const files = folder.getFilesByName(name);
  if (!files.hasNext()) return null;
  const file = files.next();
  if (files.hasNext()) throw new Error('Há arquivos com o mesmo nome: ' + name);
  return file;
}

function comBloqueio_(callback) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}
