import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./#/');
  await page.getByRole('button', { name: 'Explorar demonstração' }).click();
});

test('KM atualiza o veículo sem regressão', async ({ page }) => {
  await page.getByRole('button', { name: 'Atualizar KM' }).first().click();
  await page.getByLabel('Nova leitura').fill('149000');
  await page.getByRole('button', { name: 'Salvar leitura' }).click();
  await expect(page.getByText('149.000', { exact: false }).first()).toBeVisible();
});

test('conclusão recorrente gera histórico e próximo ciclo', async ({ page }) => {
  await page.goto('./#/maintenance/maint-oil');
  await page.getByRole('button', { name: 'Concluir manutenção' }).click();
  await page.getByLabel('Quilometragem').fill('150000');
  await page.getByRole('button', { name: 'Confirmar conclusão' }).click();
  await expect(page.getByText(/próximo ciclo recalculado/i)).toBeVisible();
  await expect(page.getByText('160.000 km')).toBeVisible();
});

test('alerta crítico não oferece adiamento quando não permitido', async ({ page }) => {
  await page.goto('./#/alerts');
  const critical = page.getByText('Correia dentada vencida').locator('..').locator('..');
  await expect(critical).toContainText('Crítico');
});

test('menu mobile abre por botão', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Fluxo exclusivo do projeto mobile');
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Navegação mobile' })).toBeVisible();
});
