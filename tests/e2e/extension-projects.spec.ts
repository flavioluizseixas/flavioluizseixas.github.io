import { test, expect } from '@playwright/test';

test('catálogo combina busca, filtros, contagem e limpeza por teclado', async ({
  page
}) => {
  await page.goto('/extensao/');
  await expect(page.locator('#novas-oportunidades .project-card')).toHaveCount(
    3
  );
  await expect(page.locator('#project-results .project-card')).toHaveCount(3);
  const search = page.getByRole('searchbox', { name: 'Buscar projetos' });
  await search.fill('AUDITORIA');
  await expect(page.getByRole('status')).toHaveText('2 projetos encontrados');
  await page
    .getByLabel('Status', { exact: true })
    .selectOption('inscricoes-abertas');
  await page.getByLabel('Modalidade', { exact: true }).selectOption('extensao');
  await page
    .getByLabel('Área', { exact: true })
    .selectOption('business-intelligence');
  await expect(page.locator('[data-project]:visible')).toHaveCount(1);
  await expect(page.locator('[data-project]:visible')).toContainText('ACEnf');
  await expect(page).toHaveURL(/area=business-intelligence/);
  await expect(page.getByRole('status')).toHaveText('1 projeto encontrado');
  await search.fill('patricia');
  await expect(
    page.getByText('Nenhum projeto encontrado com esses filtros.')
  ).toBeVisible();
  await page.locator('[data-clear-projects]').focus();
  await page.keyboard.press('Enter');
  await expect(search).toBeFocused();
  await expect(page.getByRole('status')).toHaveText('3 projetos encontrados');
  await expect(page).toHaveURL(/\/extensao\/$/);
  await search.fill('PATRICIA');
  await expect(page.locator('[data-project]:visible')).toHaveCount(1);
  await expect(page.locator('[data-project]:visible')).toContainText(
    'Denúncias'
  );
  await page.getByLabel('Status', { exact: true }).selectOption('concluido');
  await expect(page.getByRole('status')).toHaveText('0 projetos encontrados');
});

test('URL filtrada sobrevive à navegação para os detalhes e ao retorno', async ({
  page
}) => {
  await page.goto(
    '/extensao/?q=gisele&status=inscricoes-abertas&area=saude-digital'
  );
  await expect(page.locator('[data-project]:visible')).toHaveCount(1);
  await page.locator('[data-project]:visible .project-link').click();
  await expect(page).toHaveURL(/\/extensao\/projetos\/acenf\/$/);
  await expect(
    page.getByRole('heading', { name: 'Equipe', exact: true })
  ).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('searchbox')).toHaveValue('gisele');
  await expect(page.getByRole('status')).toHaveText('1 projeto encontrado');
  await page.reload();
  await expect(page.locator('[data-project]:visible')).toHaveCount(1);
});

test('páginas individuais contêm descrição, equipe, metadados e links de retorno', async ({
  page
}) => {
  for (const [slug, member] of [
    ['acenf', 'Gisele Morais'],
    ['auditoria-saude-suplementar', 'Talita Barcelos'],
    ['qualificacao-denuncias-enfermagem', 'Patrícia Oliveira']
  ]) {
    await page.goto(`/extensao/projetos/${slug}/`);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('.project-facts')).toContainText(
      '4 horas semanais'
    );
    for (const heading of [
      'Sobre o projeto',
      'Impactos potenciais na sociedade',
      'O que o aluno poderá desenvolver',
      'Perfil desejado',
      'Tecnologias e competências envolvidas',
      'Equipe',
      'Palavras-chave'
    ]) {
      await expect(
        page.getByRole('heading', { name: heading, exact: true })
      ).toBeVisible();
    }
    await expect(page.locator('.project-team')).toContainText(member);
    await expect(page.locator('.project-team')).toContainText(
      'Flávio Luiz Seixas'
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`/extensao/projetos/${slug}/$`)
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /.+/
    );
    await expect(
      page.getByRole('link', { name: 'Quero participar' })
    ).toHaveCount(0);
    await page.getByRole('link', { name: 'Voltar aos projetos' }).click();
    await expect(page).toHaveURL(/\/extensao\/#todos-os-projetos$/);
  }
});

test('navegação em inglês identifica o conteúdo disponível em português', async ({
  page
}) => {
  await page.goto('/extensao/');
  await page.getByRole('link', { name: 'Inglês', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/outreach\/$/);
  await expect(
    page.getByText(
      'Project descriptions and participation opportunities are currently available in Portuguese.'
    )
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'Explore projects in Portuguese' })
    .click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.locator('[data-project]')).toHaveCount(3);
});

test('conteúdo e links continuam disponíveis sem JavaScript', async ({
  browser
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/extensao/');
  await expect(page.locator('[data-project]')).toHaveCount(3);
  await expect(page.getByRole('searchbox')).toHaveCount(0);
  await page.locator('[data-project="acenf"] .project-link').click();
  await expect(
    page.getByRole('heading', { name: 'Sobre o projeto' })
  ).toBeVisible();
  await context.close();
});

test('badges vencem automaticamente mesmo com conteúdo de um build anterior', async ({
  page
}) => {
  await page.clock.setFixedTime(new Date('2026-11-12T15:00:00Z'));
  await page.goto('/extensao/');
  await expect(page.locator('.project-new:visible')).toHaveCount(0);
  await expect(
    page.locator('#novas-oportunidades .project-card:visible')
  ).toHaveCount(3);
});

test('catálogo e detalhes cabem em 360, 768, 1024 e 1440 px nos dois temas', async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of [360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'dark']) {
      for (const path of [
        '/extensao/',
        '/extensao/projetos/qualificacao-denuncias-enfermagem/'
      ]) {
        await page.goto(path);
        await page.evaluate((value) => {
          document.documentElement.dataset.theme = value;
        }, theme);
        await expect(page.locator('main h1')).toBeVisible();
        const sizes = await page.evaluate(() => ({
          content: document.documentElement.scrollWidth,
          viewport: window.innerWidth
        }));
        expect(
          sizes.content,
          `${path} ${width}px ${theme}`
        ).toBeLessThanOrEqual(sizes.viewport);
        if (path === '/extensao/') {
          const columns = await page
            .locator('#project-results')
            .evaluate(
              (grid) =>
                getComputedStyle(grid).gridTemplateColumns.split(' ').length
            );
          expect(columns).toBe(width >= 1000 ? 3 : width >= 680 ? 2 : 1);
          await page.screenshot({
            path: testInfo.outputPath(`catalog-${width}-${theme}.png`),
            fullPage: true
          });
        }
      }
    }
  }
  expect(errors).toEqual([]);
});
