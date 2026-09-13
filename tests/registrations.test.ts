import fs from 'node:fs';
import vm from 'node:vm';
import { createHash, randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import config from '../data/registration.json';
import { registrationConfigSchema } from '../src/lib/registration-config';
import { validInstitutionalEmail } from '../src/lib/registration-validation';
import { isGoogleScriptOrigin } from '../src/lib/registration-transport';

const pdf = Buffer.from('%PDF-1.7\nTest transcript fixture\n%%EOF\n');
const validPayload = () => ({
  requestId: randomUUID(),
  project: 'acenf',
  term: '02-2026',
  name: 'Aluno Exemplo',
  email: 'aluno@id.uff.br',
  interest: 'Tenho interesse em desenvolver sistemas para a saúde.',
  acknowledgment: true,
  privacyVersion: config.privacyVersion,
  website: '',
  file: {
    name: 'historico.pdf',
    type: 'application/pdf',
    base64: pdf.toString('base64')
  }
});

function harness() {
  const logs: string[] = [];
  const rows: unknown[][] = [Array(12).fill('header')];
  const files: {
    folder: string;
    trashed: boolean;
    name: string;
    type: string;
    bytes: number[];
  }[] = [];
  const properties = new Map<string, string>([
    ['ROOT_FOLDER_ID', 'root'],
    ['REGISTRATIONS_PAUSED', 'false'],
    [
      'PROJECT_02-2026_acenf',
      JSON.stringify({
        rootId: 'root',
        pdfFolderId: 'pdfs-acenf',
        spreadsheetId: 'sheet-acenf'
      })
    ]
  ]);
  const faults = {
    append: false,
    afterAppend: false,
    lookup: false,
    locked: false
  };
  const locks = { acquired: 0, released: 0 };
  const sheet = {
    getLastRow: () => rows.length,
    appendRow: (row: unknown[]) => {
      if (faults.append) throw new Error('Private Google error');
      rows.push(row);
      if (faults.afterAppend) throw new Error('Timeout after writing');
    },
    getRange: (start: number) => ({
      getValues: () => [rows[start - 1]],
      createTextFinder: (query: string) => {
        const finder = {
          matchEntireCell: () => finder,
          useRegularExpression: () => finder,
          findNext: () => {
            if (faults.lookup) throw new Error('Unavailable');
            const index = rows.findIndex((row) => row[9] === query);
            return index < 0 ? null : { getRow: () => index + 1 };
          }
        };
        return finder;
      }
    })
  };
  const context = vm.createContext({
    console: {
      log: (value: string) => logs.push(value),
      error: (value: string) => logs.push(value)
    },
    Date,
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key: string) => properties.get(key) ?? null,
        setProperty: (key: string, value: string) => properties.set(key, value)
      })
    },
    LockService: {
      getScriptLock: () => ({
        tryLock: () => {
          if (faults.locked) return false;
          locks.acquired++;
          return true;
        },
        releaseLock: () => locks.released++
      })
    },
    SpreadsheetApp: {
      openById: (id: string) => {
        expect(id).toBe('sheet-acenf');
        return { getSheets: () => [sheet] };
      },
      flush: () => {}
    },
    DriveApp: {
      getFolderById: (folder: string) => ({
        createFile: (blob: { name: string; type: string; bytes: number[] }) => {
          const file = { ...blob, folder, trashed: false };
          files.push(file);
          const id = `pdf-${files.length}`;
          return {
            getId: () => id,
            getUrl: () => `https://drive.google.com/file/d/${id}/view`,
            setTrashed: (value: boolean) => {
              file.trashed = value;
            }
          };
        }
      })
    },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'SHA_256' },
      computeDigest: (_algorithm: string, value: string | number[]) =>
        Array.from(
          createHash('sha256')
            .update(typeof value === 'string' ? value : Buffer.from(value))
            .digest()
        ),
      base64Decode: (value: string) => Array.from(Buffer.from(value, 'base64')),
      newBlob: (bytes: number[], type: string, name: string) => ({
        bytes,
        type,
        name
      }),
      formatDate: (date: Date) =>
        date.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
    }
  });
  vm.runInContext(
    fs.readFileSync('integrations/google-apps-script/Config.gs', 'utf8') +
      '\n' +
      fs.readFileSync('integrations/google-apps-script/Code.gs', 'utf8'),
    context
  );
  const server = context as unknown as {
    submitRegistration: (payload: unknown) => {
      ok: boolean;
      code?: string;
      protocol?: string;
    };
  };
  return {
    submit: server.submitRegistration,
    rows,
    files,
    properties,
    faults,
    locks,
    logs,
    context
  };
}

describe('configuração e validação do formulário', () => {
  const settings = {
    ...config,
    enabled: false,
    webAppUrl: '',
    additionalAllowedOrigins: []
  };
  const deploymentUrl =
    'https://script.google.com/macros/s/registration-test/exec';

  it('exige implantação /exec antes de ativar', () => {
    expect(
      registrationConfigSchema.safeParse({ ...settings, enabled: true }).success
    ).toBe(false);
    expect(
      registrationConfigSchema.safeParse({
        ...settings,
        enabled: true,
        webAppUrl: deploymentUrl.replace('/exec', '/dev')
      }).success
    ).toBe(false);
    expect(
      registrationConfigSchema.safeParse({
        ...settings,
        webAppUrl: 'https://evil.example/exec'
      }).success
    ).toBe(false);
  });
  it('permite configurar e ativar uma implantação /exec válida', () => {
    expect(registrationConfigSchema.safeParse(settings).success).toBe(true);
    for (const enabled of [false, true]) {
      expect(
        registrationConfigSchema.safeParse({
          ...settings,
          enabled,
          webAppUrl: deploymentUrl
        }).success
      ).toBe(true);
    }
  });
  it('rejeita origem permitida com caminho', () => {
    expect(
      registrationConfigSchema.safeParse({
        ...settings,
        additionalAllowedOrigins: ['https://site.example/path']
      }).success
    ).toBe(false);
  });
  it('aceita apenas endereços institucionais bem formados', () => {
    for (const email of ['Aluno.Silva@id.uff.br', 'aluno+projeto@id.uff.br'])
      expect(validInstitutionalEmail(email)).toBe(true);
    for (const email of [
      'aluno@gmail.com',
      '.aluno@id.uff.br',
      'aluno..nome@id.uff.br',
      'aluno@id.uff.br.evil.com',
      'a b@id.uff.br'
    ])
      expect(validInstitutionalEmail(email)).toBe(false);
  });
  it('restringe as origens da ponte Google', () => {
    for (const origin of [
      'https://script.google.com',
      'https://n-test-script.googleusercontent.com'
    ])
      expect(isGoogleScriptOrigin(origin)).toBe(true);
    for (const origin of [
      'null',
      'http://script.google.com',
      'https://script.google.com.evil.test',
      'https://evilgoogleusercontent.com',
      'https://other.googleusercontent.com'
    ])
      expect(isGoogleScriptOrigin(origin)).toBe(false);
  });
});

describe('gravação no Apps Script (serviços Google simulados)', () => {
  it.each([
    ['ROOT_FOLDER_ID', null, 'ROOT_NOT_CONFIGURED'],
    ['REGISTRATIONS_PAUSED', null, 'SETUP_REQUIRED'],
    ['REGISTRATIONS_PAUSED', 'true', 'SERVICE_PAUSED'],
    ['REGISTRATIONS_PAUSED', 'False ', 'SERVICE_PAUSED'],
    ['PROJECT_02-2026_acenf', null, 'PROJECT_NOT_INITIALIZED'],
    ['PROJECT_02-2026_acenf', '{invalid', 'PROJECT_CONFIG_INVALID'],
    ['PROJECT_02-2026_acenf', '{"rootId":"root"}', 'PROJECT_CONFIG_INVALID'],
    ['PROJECT_02-2026_acenf', '{"rootId":"different"}', 'ROOT_CHANGED']
  ])(
    'registra a causa privada de indisponibilidade: %s = %s',
    (key, value, reason) => {
      const app = harness();
      if (value === null) app.properties.delete(key!);
      else app.properties.set(key!, value!);
      expect(app.submit(validPayload())).toEqual({
        ok: false,
        code: 'unavailable'
      });
      expect(JSON.parse(app.logs.at(-1)!)).toMatchObject({
        event: 'REGISTRATION_FAILED',
        reason
      });
      expect(app.files).toHaveLength(0);
    }
  );

  it('registra a etapa da falha sem expor dados do aluno nem a exceção bruta', () => {
    const app = harness();
    const payload = validPayload();
    app.faults.append = true;
    expect(app.submit(payload)).toEqual({ ok: false, code: 'retry' });
    const log = app.logs.at(-1)!;
    expect(JSON.parse(log)).toMatchObject({
      stage: 'APPEND_RESPONSE',
      reason: 'GOOGLE_SERVICE_ERROR'
    });
    for (const privateText of [
      payload.name,
      payload.email,
      payload.interest,
      payload.file.base64,
      'Private Google error'
    ])
      expect(log).not.toContain(privateText);
  });

  it('grava respostas e PDF somente na pasta cadastrada para o projeto', () => {
    const app = harness();
    const payload = {
      ...validPayload(),
      folderId: 'attacker-folder',
      email: ' ALUNO@ID.UFF.BR '
    };
    const response = app.submit(payload);
    expect(response).toEqual({
      ok: true,
      protocol: `EXT-${payload.requestId}`
    });
    expect(app.rows).toHaveLength(2);
    expect(app.rows[1][5]).toBe('aluno@id.uff.br');
    expect(app.rows[1][6]).toBe(payload.interest);
    expect(app.files[0]).toMatchObject({
      folder: 'pdfs-acenf',
      name: `${response.protocol}.pdf`,
      type: 'application/pdf',
      trashed: false
    });
    expect(app.locks).toEqual({ acquired: 1, released: 1 });
    expect(JSON.stringify(response)).not.toContain('drive.google');
  });
  it.each([
    [{ email: 'aluno@gmail.com' }, 'email'],
    [{ name: 'Aluno' }, 'name'],
    [{ interest: 'Curto' }, 'interest'],
    [{ project: 'desconhecido' }, 'closed'],
    [{ term: '01-2025' }, 'closed'],
    [{ acknowledgment: false }, 'invalid'],
    [{ website: 'spam' }, 'invalid'],
    [{ privacyVersion: 'old' }, 'invalid'],
    [{ requestId: '=IMPORTXML()' }, 'invalid'],
    [
      {
        file: {
          name: 'a.pdf',
          type: 'application/pdf',
          base64: Buffer.from('isto não é um PDF').toString('base64')
        }
      },
      'pdf'
    ],
    [
      {
        file: {
          name: 'a.html',
          type: 'text/html',
          base64: pdf.toString('base64')
        }
      },
      'pdf'
    ],
    [
      {
        file: {
          name: 'a.pdf',
          type: 'application/pdf',
          base64: 'A'.repeat(Math.ceil(config.maxPdfBytes / 3) * 4 + 4)
        }
      },
      'pdf'
    ]
  ])('rejeita entrada inválida sem gravar (caso %#)', (changes, code) => {
    const app = harness();
    expect(app.submit({ ...validPayload(), ...changes })).toEqual({
      ok: false,
      code
    });
    expect(app.files).toHaveLength(0);
    expect(app.rows).toHaveLength(1);
  });
  it('reconhece o mesmo envio depois de perder a resposta sem duplicar ou consumir cota', () => {
    const app = harness();
    const payload = validPayload();
    const first = app.submit(payload);
    expect(app.submit(payload)).toEqual(first);
    expect(app.files).toHaveLength(1);
    expect(app.rows).toHaveLength(2);
    expect(JSON.parse(app.properties.get('DAILY_QUOTA')!).total).toBe(1);
    expect(app.submit({ ...payload, name: 'Outra Pessoa' })).toEqual({
      ok: false,
      code: 'conflict'
    });
  });
  it('mantém fórmulas enviadas pelo usuário como texto', () => {
    const app = harness();
    expect(
      app.submit({
        ...validPayload(),
        name: '=Aluno Exemplo',
        interest: '=IMPORTXML("https://example.com", "//x")'
      }).ok
    ).toBe(true);
    expect(app.rows[1][4]).toBe("'=Aluno Exemplo");
    expect(String(app.rows[1][6]).startsWith("'=")).toBe(true);
  });
  it('aplica os limites por endereço e global', () => {
    const app = harness();
    for (let index = 0; index < config.maxSubmissionsPerEmailPerDay; index++)
      expect(app.submit(validPayload()).ok).toBe(true);
    expect(app.submit(validPayload())).toEqual({ ok: false, code: 'limit' });
    const quota = JSON.parse(app.properties.get('DAILY_QUOTA')!);
    quota.total = config.maxSubmissionsPerDay;
    app.properties.set('DAILY_QUOTA', JSON.stringify(quota));
    expect(app.submit({ ...validPayload(), email: 'outra@id.uff.br' })).toEqual(
      { ok: false, code: 'limit' }
    );
  });
  it('valida prazo, status e pausa no servidor', () => {
    const app = harness();
    vm.runInContext(
      "REGISTRATION_CONFIG.projects.find(p => p.slug === 'acenf').deadline = '2000-01-01'",
      app.context
    );
    expect(app.submit(validPayload())).toEqual({ ok: false, code: 'closed' });
    vm.runInContext(
      "REGISTRATION_CONFIG.projects.find(p => p.slug === 'acenf').deadline = null; REGISTRATION_CONFIG.projects.find(p => p.slug === 'acenf').status = 'concluido'",
      app.context
    );
    expect(app.submit(validPayload())).toEqual({ ok: false, code: 'closed' });
    app.properties.set('REGISTRATIONS_PAUSED', 'true');
    expect(app.submit(validPayload())).toEqual({
      ok: false,
      code: 'unavailable'
    });
    expect(app.files).toHaveLength(0);
  });
  it('remove PDF se a planilha falhar antes de salvar e permite repetir', () => {
    const app = harness();
    const payload = validPayload();
    app.faults.append = true;
    expect(app.submit(payload)).toEqual({ ok: false, code: 'retry' });
    expect(app.files[0].trashed).toBe(true);
    app.faults.append = false;
    expect(app.submit(payload).ok).toBe(true);
    expect(app.files.filter((file) => !file.trashed)).toHaveLength(1);
  });
  it('preserva PDF e recupera protocolo se a planilha gravou antes da falha', () => {
    const app = harness();
    app.faults.afterAppend = true;
    const payload = validPayload();
    expect(app.submit(payload).ok).toBe(true);
    expect(app.submit(payload).ok).toBe(true);
    expect(app.files).toHaveLength(1);
    expect(app.files[0].trashed).toBe(false);
  });
  it('não grava quando outro envio detém o lock', () => {
    const app = harness();
    app.faults.locked = true;
    expect(app.submit(validPayload())).toEqual({ ok: false, code: 'retry' });
    expect(app.files).toHaveLength(0);
  });
});
