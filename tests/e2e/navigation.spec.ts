import { test, expect } from '@playwright/test';
test('aluno chega ao calendário em até dois cliques', async ({ page }) => {
  await page.goto('/');
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
