import { test, expect } from '@playwright/test';
test('aluno chega ao calendário em até dois cliques', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.course-card h3')).toHaveText([
    'Introdução ao Aprendizado de Máquina para Saúde',
    'Modelagem de Processos de Negócio',
    'Informática em Saúde Aplicada à Enfermagem'
  ]);
  await page.getByRole('link', { name: 'Ver calendário' }).first().click();
  await expect(page.locator('#calendario')).toBeVisible();
});
test('filtro da agenda funciona', async ({ page }) => {
  await page.goto('/ensino/redes-computadores/2026-1/');
  await page.getByRole('button', { name: 'Avaliação' }).click();
  await expect(page.locator('.event:not([hidden])')).toHaveCount(4);
});

test('seletor troca para inglês e mantém a rota equivalente', async ({
  page
}) => {
  await page.goto('/pesquisa/');
  await page.getByRole('link', { name: 'Inglês' }).click();
  await expect(page).toHaveURL(/\/en\/research\/$/);
  await expect(
    page.getByRole('heading', { name: 'Computing for better decisions' })
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('site-locale')))
    .toBe('en');
});

test('disciplina e agenda são renderizadas em inglês', async ({ page }) => {
  await page.goto('/en/teaching/redes-computadores/2026-1/');
  await expect(
    page.getByRole('heading', { name: 'Computer Networks', exact: true })
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Assessment' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('links de slides múltiplos são separados visualmente', async ({
  page
}) => {
  await page.goto('/ensino/aprendizado-maquina-saude/2026-2/');
  await expect(page.locator('#calendario .material-separator')).toHaveCount(5);
});

test('disciplina de Informática em Saúde exibe docentes e encontros', async ({
  page
}) => {
  await page.goto('/ensino/informatica-saude-enfermagem/2026-2/');
  await expect(
    page.getByRole('heading', {
      name: 'Informática em Saúde Aplicada à Enfermagem',
      exact: true
    })
  ).toBeVisible();
  await expect(page.locator('.facts')).toContainText(
    'Bianca Dargam Gomes Vieira · Flávio Luiz Seixas'
  );
  await expect(page.locator('#materiais .resource')).toHaveCount(1);
  await expect(page.locator('#materiais a[href*="/encontro_"]')).toHaveCount(0);
  await expect(page.locator('#calendario a[href*="/encontro_"]')).toHaveCount(
    6
  );
  await expect(page.locator('#calendario .event')).toHaveCount(5);
  await expect(page.locator('#visao-geral ol li')).toHaveCount(6);
  await expect(page.locator('#visao-geral ol')).not.toContainText('Encontro 1');
});
