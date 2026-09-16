import { test, expect } from '@playwright/test';
import { loadCollection } from '../../scripts/content';
import type { ExtensionProject } from '../../src/lib/extension-project-schema';
import { NEW_PROJECT_DAYS } from '../../data/extension-catalog';

const projects = loadCollection<ExtensionProject>('extension-projects');
const opportunities = projects.filter(
  (project) => project.status === 'inscricoes-abertas'
);

test('oportunidades abertas aparecem uma única vez e não integram a busca', async ({
  page
}) => {
  await page.goto('/extensao/');
  await expect(page.locator('#novas-oportunidades .project-card')).toHaveCount(
    opportunities.length
  );
  await expect(page.locator('#project-results .project-card')).toHaveCount(0);
  const slugs = await page
    .locator('[data-project]')
    .evaluateAll((cards) =>
      cards.map((card) => card.getAttribute('data-project'))
    );
  expect([...new Set(slugs)].sort()).toEqual(
    projects.map((project) => project.slug).sort()
  );
  await expect(page.locator('.extension-intro')).toContainText(
    'pesquisas em parceria com a Fiocruz'
  );
  const logos = page.locator('.project-card .project-logo img');
  await expect(logos).toHaveCount(
    projects.filter((project) => project.logo).length
  );
  for (const project of projects.filter((project) => project.logo)) {
    const logo = page.locator(
      `[data-project="${project.slug}"] .project-logo img`
    );
    await expect(logo).toHaveAttribute('alt', project.logo!.alt);
    expect(await logo.getAttribute('src')).toContain(
      project.logo!.src.split('.')[0]
    );
    await logo.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        logo.evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
        )
      )
      .toBe(true);
  }
  await expect(
    page.getByRole('heading', {
      name: 'Em andamento e concluídos',
      exact: true
    })
  ).toBeVisible();
  await expect(
    page.getByText(
      'Ainda não há projetos em andamento ou concluídos no catálogo.'
    )
  ).toBeVisible();
  await expect(page.getByRole('searchbox')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Limpar filtros' })
  ).toHaveCount(0);
});

test('filtros na URL não ocultam nem duplicam oportunidades abertas', async ({
  page
}) => {
  await page.goto('/extensao/?q=gisele&status=em-andamento&area=saude-digital');
  await expect(
    page.locator('#novas-oportunidades .project-card:visible')
  ).toHaveCount(opportunities.length);
  await expect(page.locator('#project-results .project-card')).toHaveCount(0);
  await page.locator('[data-project="acenf"] .project-link').click();
  await expect(page).toHaveURL(/\/extensao\/projetos\/acenf\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/status=em-andamento/);
  await page.reload();
  await expect(
    page.locator('#novas-oportunidades .project-card:visible')
  ).toHaveCount(opportunities.length);
  await expect(page.locator('#project-results .project-card')).toHaveCount(0);
});

test('páginas individuais contêm descrição, equipe, metadados e links de retorno', async ({
  page
}) => {
  for (const project of projects) {
    const { slug } = project;
    await page.goto(`/extensao/projetos/${slug}/`);
    await expect(page.locator('main h1')).toHaveText(project.titulo);
    const logo = page.locator('.project-detail-hero .project-logo img');
    if (project.logo) {
      await expect(logo).toHaveAttribute('alt', project.logo.alt);
      expect(await logo.getAttribute('src')).toContain(
        project.logo.src.split('.')[0]
      );
      await expect
        .poll(() =>
          logo.evaluate(
            (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
          )
        )
        .toBe(true);
    } else {
      await expect(logo).toHaveCount(0);
    }
    await expect(page.locator('.project-facts')).toContainText(
      project.carga_horaria
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
    for (const member of project.equipe) {
      await expect(page.locator('.project-team')).toContainText(member.nome);
    }
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
  await expect(page.locator('[data-project]')).toHaveCount(projects.length);
});

test('conteúdo e links continuam disponíveis sem JavaScript', async ({
  browser
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/extensao/');
  await expect(page.locator('[data-project]')).toHaveCount(projects.length);
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
  const latestPublication = Math.max(
    ...projects.map((project) =>
      Date.parse(`${project.data_publicacao}T15:00:00Z`)
    )
  );
  await page.clock.setFixedTime(
    new Date(latestPublication + (NEW_PROJECT_DAYS + 1) * 86_400_000)
  );
  await page.goto('/extensao/');
  await expect(page.locator('.project-new:visible')).toHaveCount(0);
  await expect(
    page.locator('#novas-oportunidades .project-card:visible')
  ).toHaveCount(opportunities.length);
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
        '/extensao/projetos/qualificacao-denuncias-enfermagem/',
        '/extensao/projetos/ventilacao-mecanica-trajetorias-ml/'
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
            .locator('#novas-oportunidades .project-grid')
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
