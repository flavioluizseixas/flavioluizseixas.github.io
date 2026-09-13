import fs from 'node:fs';
import vm from 'node:vm';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';

function harness() {
  const properties = new Map<string, string>();
  const resources = new Map<string, Resource>();
  const books = new Map<string, { getId(): string; getSheets(): Sheet[] }>();
  const faults = { sheetsWrite: false, cleanup: false };
  const logs: string[] = [];
  const propertyReads: string[] = [];
  const identity = {
    active: 'responsavel@id.uff.br',
    effective: 'responsavel@id.uff.br'
  };
  const iterator = <T>(items: T[]) => {
    let index = 0;
    return { hasNext: () => index < items.length, next: () => items[index++] };
  };
  class Resource {
    id = randomUUID();
    trashed = false;
    constructor(
      public name: string,
      public parent?: Folder
    ) {
      resources.set(this.id, this);
    }
    getId() {
      return this.id;
    }
    getUrl() {
      return `https://drive.google.com/resource/${this.id}`;
    }
    isTrashed() {
      return this.trashed;
    }
    setTrashed(value: boolean) {
      if (faults.cleanup)
        throw new Error('Sem permissão para remover o teste.');
      this.trashed = value;
    }
  }
  class Folder extends Resource {
    sharing = 'PRIVATE';
    getSharingAccess() {
      return this.sharing;
    }
    createFolder(name: string) {
      return new Folder(name, this);
    }
    getFoldersByName(name: string) {
      return iterator(
        [...resources.values()].filter(
          (entry) =>
            entry instanceof Folder &&
            entry.parent === this &&
            entry.name === name &&
            !entry.trashed
        )
      );
    }
    getFilesByName(name: string) {
      return iterator(
        [...resources.values()].filter(
          (entry) =>
            entry instanceof File &&
            entry.parent === this &&
            entry.name === name &&
            !entry.trashed
        )
      );
    }
    createFile(blob: { text: string; name: string }) {
      const file = new File(blob.name, this);
      file.text = blob.text;
      return file;
    }
  }
  class File extends Resource {
    text = '';
    moveTo(folder: Folder) {
      this.parent = folder;
    }
    getBlob() {
      return { getDataAsString: () => this.text };
    }
  }
  class Sheet {
    rows: string[][] = [];
    setName(_name: string) {}
    setFrozenRows(_count: number) {}
    getLastRow() {
      return this.rows.length;
    }
    appendRow(row: string[]) {
      if (faults.sheetsWrite) throw new Error('Falha de escrita no Sheets.');
      this.rows.push([...row]);
    }
    getRange(row: number, column: number, count: number, columns: number) {
      return {
        getDisplayValues: () =>
          this.rows
            .slice(row - 1, row - 1 + count)
            .map((entry) => entry.slice(column - 1, column - 1 + columns))
      };
    }
  }
  const root = new Folder('Inscrições');
  properties.set('ROOT_FOLDER_ID', root.id);
  const context = vm.createContext({
    console: { log: (value: string) => logs.push(value) },
    Session: {
      getActiveUser: () => ({ getEmail: () => identity.active }),
      getEffectiveUser: () => ({ getEmail: () => identity.effective })
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key: string) => {
          propertyReads.push(key);
          return properties.get(key) ?? null;
        },
        setProperty: (key: string, value: string) => properties.set(key, value)
      })
    },
    LockService: {
      getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} })
    },
    DriveApp: {
      Access: { PRIVATE: 'PRIVATE' },
      getFolderById: (id: string) => {
        const value = resources.get(id);
        if (!(value instanceof Folder)) throw new Error('Pasta inacessível.');
        return value;
      },
      getFileById: (id: string) => {
        const value = resources.get(id);
        if (!(value instanceof File)) throw new Error('Arquivo inacessível.');
        return value;
      }
    },
    SpreadsheetApp: {
      create: (name: string) => {
        const file = new File(name);
        const sheet = new Sheet();
        const book = { getId: () => file.id, getSheets: () => [sheet] };
        books.set(file.id, book);
        return book;
      },
      openById: (id: string) => {
        const book = books.get(id);
        if (!book) throw new Error('Planilha inacessível.');
        return book;
      },
      flush: () => {}
    },
    Utilities: {
      getUuid: randomUUID,
      newBlob: (text: string, _type: string, name: string) => ({ text, name })
    }
  });
  vm.runInContext(
    fs.readFileSync('integrations/google-apps-script/Config.gs', 'utf8') +
      '\n' +
      fs.readFileSync('integrations/google-apps-script/Code.gs', 'utf8'),
    context
  );
  vm.runInContext(
    "REGISTRATION_CONFIG.projects = [{slug: 'teste', term: '02-2026', title: 'Projeto de teste', status: 'inscricoes-abertas', deadline: null}]",
    context
  );
  type Report = {
    ok: boolean;
    checks: { item: string; ok: boolean; detail?: string }[];
    rootUrl?: string;
    stage?: string;
    error?: string;
    cleanupErrors?: string[];
  };
  const server = context as unknown as {
    prepararInscricoes(): void;
    diagnosticarInscricoes(): Report;
    testarArmazenamento(): Report;
  };
  return {
    server,
    properties,
    resources,
    books,
    root,
    logs,
    faults,
    identity,
    propertyReads
  };
}

describe('preparação e diagnóstico privados (Google simulado)', () => {
  it('cria a estrutura e os cabeçalhos ao executar setup, sem duplicar na repetição', () => {
    const app = harness();
    app.server.prepararInscricoes();
    const names = [...app.resources.values()].map((entry) => entry.name);
    expect(names).toEqual(
      expect.arrayContaining(['02-2026--teste', 'Históricos', 'Respostas'])
    );
    expect(app.properties.get('REGISTRATIONS_PAUSED')).toBe('false');
    expect(app.properties.has('PROJECT_02-2026_teste')).toBe(true);
    const size = app.resources.size;
    app.server.prepararInscricoes();
    expect(app.resources.size).toBe(size);
    expect([...app.books.values()][0].getSheets()[0].rows).toHaveLength(1);
    expect(app.server.diagnosticarInscricoes().ok).toBe(true);
  });

  it('identifica falta de inicialização sem criar arquivos ou modificar propriedades', () => {
    const app = harness();
    const before = [...app.properties];
    const report = app.server.diagnosticarInscricoes();
    expect(report.ok).toBe(false);
    expect(
      report.checks.filter((entry) => !entry.ok).map((entry) => entry.item)
    ).toEqual(['REGISTRATIONS_PAUSED', 'PROJECT_02-2026_teste']);
    expect([...app.properties]).toEqual(before);
    expect(app.resources.size).toBe(1);
    expect(report.rootUrl).toBe(app.root.getUrl());
  });

  it('identifica pasta raiz inacessível e preserva uma pausa explícita', () => {
    const app = harness();
    app.properties.set('REGISTRATIONS_PAUSED', 'true');
    app.server.prepararInscricoes();
    expect(app.properties.get('REGISTRATIONS_PAUSED')).toBe('true');
    app.properties.set('ROOT_FOLDER_ID', 'inaccessible');
    const report = app.server.diagnosticarInscricoes();
    expect(report.ok).toBe(false);
    expect(
      report.checks.find((entry) => entry.item === 'ROOT_FOLDER_ID')?.ok
    ).toBe(false);
  });

  it('detecta históricos na lixeira e cabeçalhos alterados sem ler respostas', () => {
    const app = harness();
    app.server.prepararInscricoes();
    const resources = JSON.parse(app.properties.get('PROJECT_02-2026_teste')!);
    app.resources.get(resources.pdfFolderId)!.trashed = true;
    expect(app.server.diagnosticarInscricoes().checks.at(-1)?.detail).toContain(
      'lixeira'
    );
    app.resources.get(resources.pdfFolderId)!.trashed = false;
    const sheet = app.books.get(resources.spreadsheetId)!.getSheets()[0];
    sheet.rows.push(['dados pessoais que não devem aparecer']);
    sheet.rows[0][0] = 'Cabeçalho alterado';
    expect(app.server.diagnosticarInscricoes().checks.at(-1)?.detail).toContain(
      'Cabeçalhos'
    );
    expect(app.logs.join('')).not.toContain(
      'dados pessoais que não devem aparecer'
    );
  });

  it('o teste de escrita confirma leitura e remove só os recursos temporários', () => {
    const app = harness();
    app.server.prepararInscricoes();
    const originalIds = new Set(app.resources.keys());
    const originalProperties = [...app.properties];
    const report = app.server.testarArmazenamento();
    expect(report.ok).toBe(true);
    expect(report.stage).toBe('COMPLETE');
    for (const [id, resource] of app.resources)
      expect(resource.trashed).toBe(!originalIds.has(id));
    expect([...app.properties]).toEqual(originalProperties);
    expect([...app.books.values()][0].getSheets()[0].rows).toHaveLength(1);
  });

  it('relata a etapa da falha e ainda limpa arquivos de teste', () => {
    const app = harness();
    app.faults.sheetsWrite = true;
    const report = app.server.testarArmazenamento();
    expect(report).toMatchObject({
      ok: false,
      stage: 'WRITE_SHEETS',
      error: 'Falha de escrita no Sheets.'
    });
    for (const resource of app.resources.values())
      expect(resource.trashed).toBe(resource !== app.root);
  });

  it('relata falha de limpeza sem afirmar que o teste concluiu com sucesso', () => {
    const app = harness();
    app.faults.cleanup = true;
    const report = app.server.testarArmazenamento();
    expect(report.ok).toBe(false);
    expect(report.cleanupErrors).toHaveLength(3);
  });

  it.each([
    ['', 'responsavel@id.uff.br'],
    ['aluno@id.uff.br', 'responsavel@id.uff.br'],
    ['', ''],
    ['responsavel@id.uff.br', '']
  ])(
    'recusa administração sem identidade ativa autorizada (%s / %s)',
    (active, effective) => {
      const app = harness();
      app.identity.active = active;
      app.identity.effective = effective;
      const before = [...app.properties];
      for (const operation of [
        'prepararInscricoes',
        'diagnosticarInscricoes',
        'testarArmazenamento'
      ] as const) {
        expect(() => app.server[operation]()).toThrow(
          'Acesso administrativo negado'
        );
      }
      expect(app.propertyReads).toEqual([]);
      expect([...app.properties]).toEqual(before);
      expect(app.resources.size).toBe(1);
      expect(app.logs).toEqual([]);
    }
  );

  it('expõe somente envio, página e as três entradas administrativas protegidas', () => {
    const source = fs.readFileSync(
      'integrations/google-apps-script/Code.gs',
      'utf8'
    );
    const publicFunctions = [...source.matchAll(/^function (\w+)\(/gm)]
      .map((match) => match[1])
      .filter((name) => !name.endsWith('_'));
    expect(publicFunctions.sort()).toEqual([
      'diagnosticarInscricoes',
      'doGet',
      'prepararInscricoes',
      'submitRegistration',
      'testarArmazenamento'
    ]);
  });
});
