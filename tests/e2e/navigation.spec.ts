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
