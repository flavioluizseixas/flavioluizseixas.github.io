import fs from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import copy from '../../data/registration-copy.json' with { type: 'json' };

type Submission = {
  requestId: string;
  project: string;
  email: string;
  file: { name: string; type: string; base64: string };
};
const pdf = Buffer.from('%PDF-1.7\nTest transcript fixture\n%%EOF\n');

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('oferece contato e impede envio nativo de dados', async ({ page }) => {
    await page.goto('/extensao/projetos/acenf/#inscricao');
    await expect(page.getByText(copy.noScript)).toBeVisible();
    await expect(
      page.getByRole('button', { name: copy.submit })
    ).toBeDisabled();
    await expect(
      page.getByRole('link', { name: copy.contact, exact: true })
    ).toBeVisible();
    await expect(page.locator('[data-registration-form]')).toHaveAttribute(
      'method',
      'post'
    );
  });
});

async function mockGoogle(page: Page, failFirst = false) {
  const submissions: Submission[] = [];
  await page.route(
    'https://script.google.com/macros/s/registration-test/exec?**',
    async (route) => {
      const query = new URL(route.request().url()).search;
      await route.fulfill({
        contentType: 'text/html',
        body: `<iframe src="https://test-script.googleusercontent.com/bridge${query.replaceAll('&', '&amp;')}"></iframe>`
      });
    }
  );
  await page.route(
    'https://test-script.googleusercontent.com/bridge?**',
    async (route) => {
      const params = new URL(route.request().url()).searchParams;
      let html = fs
        .readFileSync('integrations/google-apps-script/Bridge.html', 'utf8')
        .replace('<?= siteOrigin ?>', params.get('origin')!)
        .replace('<?= channel ?>', params.get('channel')!);
      html = html.replace(
        '<script>',
        `<script>
      window.google = { script: { run: {
        withSuccessHandler(fn) { this.success = fn; return this; },
        withFailureHandler(fn) { this.failure = fn; return this; },
        submitRegistration(payload) {
          fetch('https://registration-mock.invalid/submit', { method: 'POST', body: JSON.stringify(payload) })
            .then(response => response.json()).then(value => this.success(value)).catch(() => this.failure());
        }
      } } };
    </script><script>`
      );
      await route.fulfill({ contentType: 'text/html', body: html });
    }
  );
  await page.route(
    'https://registration-mock.invalid/submit',
    async (route) => {
      const payload = JSON.parse(route.request().postData()!) as Submission;
      submissions.push(payload);
      const response =
        failFirst && submissions.length === 1
          ? { ok: false, code: 'retry' }
          : { ok: true, protocol: `EXT-${payload.requestId}` };
      await route.fulfill({
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(response)
      });
    }
  );
  return submissions;
}

async function fillForm(page: Page) {
  await page.goto('/extensao/projetos/acenf/#inscricao');
  await page.getByLabel(copy.name, { exact: true }).fill('Aluno Exemplo');
  await page.getByLabel(copy.email, { exact: true }).fill('aluno@id.uff.br');
  await page.getByLabel(copy.transcript, { exact: true }).setInputFiles({
    name: 'historico.pdf',
    mimeType: 'application/pdf',
    buffer: pdf
  });
  await page
    .getByLabel(copy.interest, { exact: true })
    .fill('Quero desenvolver sistemas para melhorar o atendimento em saúde.');
  await page.getByLabel(copy.acknowledgment).check();
}

test('envia do Astro por iframe Google aninhado e mostra o protocolo', async ({
  page
}) => {
  const submissions = await mockGoogle(page);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await fillForm(page);
  await expect(page.locator('input[autocomplete="one-time-code"]')).toHaveCount(
    0
  );
  await page.getByRole('button', { name: copy.submit }).click();
  await expect(page.locator('[data-registration-status]')).toContainText(
    'Inscrição recebida.'
  );
  expect(submissions).toHaveLength(1);
  expect(submissions[0].project).toBe('acenf');
  expect(Buffer.from(submissions[0].file.base64, 'base64')).toEqual(pdf);
  await expect(page.getByRole('button', { name: copy.submit })).toBeDisabled();
  await expect(page.getByLabel(copy.name, { exact: true })).toHaveValue('');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  expect(errors).toEqual([]);
});

test('bloqueia e-mail externo antes de iniciar a conexão', async ({ page }) => {
  const submissions = await mockGoogle(page);
  await fillForm(page);
  await page.getByLabel(copy.email, { exact: true }).fill('aluno@gmail.com');
  await page.getByRole('button', { name: copy.submit }).click();
  expect(
    await page
      .getByLabel(copy.email, { exact: true })
      .evaluate((element: HTMLInputElement) => element.validationMessage)
  ).toBe(copy.errors.email);
  expect(submissions).toHaveLength(0);
  await expect(page.locator('iframe')).toHaveCount(0);
});

test('rejeita conteúdo falso com extensão PDF e arquivos acima de 5 MB', async ({
  page
}) => {
  const submissions = await mockGoogle(page);
  await fillForm(page);
  for (const buffer of [
    Buffer.from('Arquivo que não é PDF, apesar do nome.'),
    Buffer.alloc(5242881)
  ]) {
    await page.getByLabel(copy.transcript, { exact: true }).setInputFiles({
      name: 'historico.pdf',
      mimeType: 'application/pdf',
      buffer
    });
    await page.getByRole('button', { name: copy.submit }).click();
    await expect(page.locator('[data-registration-status]')).toHaveText(
      copy.errors.pdf
    );
  }
  expect(submissions).toHaveLength(0);
});

test('uma nova tentativa preserva dados e identificador após falha', async ({
  page
}) => {
  const submissions = await mockGoogle(page, true);
  await fillForm(page);
  await page.getByRole('button', { name: copy.submit }).click();
  await expect(page.locator('[data-registration-status]')).toHaveText(
    copy.errors.retry
  );
  await expect(page.getByLabel(copy.name, { exact: true })).toHaveValue(
    'Aluno Exemplo'
  );
  await page.getByRole('button', { name: copy.submit }).click();
  await expect(page.locator('[data-registration-status]')).toContainText(
    'Inscrição recebida.'
  );
  expect(submissions).toHaveLength(2);
  expect(submissions[1]).toEqual(submissions[0]);
});
