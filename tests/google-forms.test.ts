import fs from 'node:fs';
import vm from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import { loadCollection } from '../scripts/content';
import type { ExtensionProject } from '../src/lib/extension-project-schema';

const configSource = fs.readFileSync(
  'data/extension-projects/google-forms/Config.gs',
  'utf8'
);
const codeSource = fs.readFileSync(
  'data/extension-projects/google-forms/Code.gs',
  'utf8'
);

function harness() {
  const properties = new Map([['GOOGLE_FORMS_TEMPLATE_ID', 'template']]);
  const files = new Map<string, ReturnType<typeof makeFile>>();
  const forms = new Map<string, ReturnType<typeof makeForm>>();
  const copies: string[] = [];
  const faults = { title: false };
  const lock = { waitLock: vi.fn(), releaseLock: vi.fn() };
  const iterator = <T>(values: T[]) => {
    let index = 0;
    return {
      hasNext: () => index < values.length,
      next: () => values[index++]
    };
  };
  function makeForm(id: string) {
    const items = [
      ['Nome completo', 'TEXT'],
      ['E-mail', 'TEXT'],
      ['Histórico escolar da UFF', 'FILE_UPLOAD'],
      ['O que despertou seu interesse nesse projeto?', 'PARAGRAPH_TEXT']
    ].map(([title, type]) => ({
      getTitle: () => title,
      getType: () => type,
      asTextItem: () => ({ isRequired: () => true }),
      asParagraphTextItem: () => ({ isRequired: () => true })
    }));
    let published = false;
    const form = {
      items,
      getItems: () => items,
      isPublished: () => published,
      setPublished: vi.fn((value: boolean) => {
        published = value;
      }),
      setTitle: vi.fn((_title: string) => {
        if (faults.title) throw new Error('Falha temporária do Google');
      }),
      setDescription: vi.fn(),
      setConfirmationMessage: vi.fn(),
      setPublishingSummary: vi.fn(),
      setCollectEmail: vi.fn(),
      setShuffleQuestions: vi.fn(),
      getEditUrl: () => `https://docs.google.com/forms/d/${id}/edit`,
      getPublishedUrl: () => `https://docs.google.com/forms/d/e/${id}/viewform`
    };
    forms.set(id, form);
    return form;
  }
  function makeFile(name: string, id: string) {
    const file = { name, getId: () => id, setContent: vi.fn() };
    files.set(id, file);
    return file;
  }
  const folder = {
    getUrl: () => 'https://drive.google.com/drive/folders/forms',
    getFoldersByName: vi.fn((_name: string) => iterator([folder])),
    getFilesByName: (name: string) =>
      iterator([...files.values()].filter((file) => file.name === name)),
    createFile: (name: string, content: string) => {
      const file = makeFile(name, 'index');
      file.setContent(content);
      return file;
    }
  };
  const template = makeForm('template');
  const context = vm.createContext({
    console: { log: vi.fn() },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key: string) => properties.get(key) ?? null,
        setProperty: (key: string, value: string) => properties.set(key, value)
      })
    },
    LockService: { getScriptLock: () => lock },
    FormApp: {
      ItemType: {
        TEXT: 'TEXT',
        FILE_UPLOAD: 'FILE_UPLOAD',
        PARAGRAPH_TEXT: 'PARAGRAPH_TEXT'
      },
      openById: (id: string) => forms.get(id)
    },
    DriveApp: {
      getRootFolder: () => folder,
      getFileById: () => ({
        makeCopy: (name: string) => {
          copies.push(name);
          const id = `form-${copies.length}`;
          makeForm(id);
          return makeFile(name, id);
        }
      })
    }
  });
  vm.runInContext(configSource + '\n' + codeSource, context);
  return {
    run: () => vm.runInContext('criarFormularios()', context),
    context,
    template,
    copies,
    forms,
    files,
    faults,
    lock,
    folder
  };
}

describe('preparação dos Google Forms', () => {
  it('prepara todos os projetos do catálogo com egressos por último', () => {
    const setup = harness();
    const config = vm.runInContext('GOOGLE_FORMS_CONFIG', setup.context);
    const projects = loadCollection<ExtensionProject>('extension-projects');
    expect(
      config.projects.map((project: { slug: string }) => project.slug).sort()
    ).toEqual(projects.map((project) => project.slug).sort());
    expect(config.projects.at(-1).slug).toBe('sistema-acompanhamento-egressos');
    for (const project of projects) {
      expect(
        config.projects.find(
          (entry: { slug: string }) => entry.slug === project.slug
        ).title
      ).toBe(project.titulo);
    }
  });

  it('recusa modelo sem upload e não cria cópias incompletas', () => {
    const setup = harness();
    setup.template.items.splice(2, 1);
    expect(setup.run).toThrow(/Upload de arquivo/);
    expect(setup.copies).toHaveLength(0);
    expect(setup.lock.releaseLock).toHaveBeenCalledOnce();
  });

  it('recusa modelo publicado antes de copiar', () => {
    const setup = harness();
    setup.template.setPublished(true);
    expect(setup.run).toThrow(/Despublique o modelo/);
    expect(setup.copies).toHaveLength(0);
  });

  it('organiza sete rascunhos e reaproveita os formulários sem despublicá-los', () => {
    const setup = harness();
    const links = setup.run();
    expect(links).toHaveLength(7);
    expect(
      setup.folder.getFoldersByName.mock.calls.map(([name]) => name)
    ).toEqual(['extension-projects', 'google-forms']);
    expect(links.every((link: { published: boolean }) => !link.published)).toBe(
      true
    );
    expect(setup.files.get('index')!.setContent).toHaveBeenCalled();
    const form = setup.forms.get('form-1')!;
    form.setPublished(true);
    const rerun = setup.run();
    expect(setup.copies).toHaveLength(7);
    expect(form.setTitle).toHaveBeenCalledOnce();
    expect(rerun[0].published).toBe(true);
  });

  it('retoma falha após copiar sem duplicar o formulário', () => {
    const setup = harness();
    setup.faults.title = true;
    expect(setup.run).toThrow(/Falha temporária/);
    expect(setup.copies).toHaveLength(1);
    setup.faults.title = false;
    expect(setup.run()).toHaveLength(7);
    expect(setup.copies).toHaveLength(7);
    expect(setup.lock.releaseLock).toHaveBeenCalledTimes(2);
  });
});
