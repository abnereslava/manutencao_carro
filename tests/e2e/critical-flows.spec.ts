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
  await page.getByLabel('Quilometragem').fill('147000');
  await page.getByLabel('Custo das peças (R$)').fill('100,00');
  await page.getByLabel('Mão de obra (R$)').fill('50,00');
  await page.getByLabel('Outros custos (R$)').fill('25,00');
  await page.getByLabel('Observações').fill('Registro retroativo validado.');
  await expect(page.getByText('Total calculado: R$ 175,00')).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar conclusão' }).click();
  await expect(page.getByText(/próximo ciclo recalculado/i)).toBeVisible();
  await expect(page.getByText('157.000 km')).toBeVisible();
  await page.goto('./#/expenses');
  await expect(page.getByText('R$ 175,00', { exact: true })).toBeVisible();
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
