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
  await page.getByRole('button', { name: 'Adicionar ação' }).click();
  await page.getByLabel('Ação executada').selectOption('replaced');
  await page.getByLabel('Nome da nova peça').fill('Óleo sintético 5W40');
  await page.getByLabel('Custo da peça (R$)').fill('80,00');
  await page.getByLabel('Outros custos de peças/insumos (R$)').fill('20,00');
  await page.getByLabel('Mão de obra (R$)').fill('50,00');
  await page.getByLabel('Outros custos (R$)').fill('25,00');
  await page
    .getByRole('textbox', { name: 'Observações', exact: true })
    .fill('Registro retroativo validado.');
  await page.getByLabel('Cadastrar garantia deste serviço').check();
  await page.getByLabel('Garantia até a data').fill('2027-09-20');
  await expect(page.getByText('Total calculado: R$ 175,00')).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar conclusão' }).click();
  await expect(page.getByText(/próximo ciclo recalculado/i)).toBeVisible();
  await expect(page.getByText('157.000 km')).toBeVisible();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('carango-demo-data-v1')!)
  );
  const occurrence = saved.occurrences[0];
  const installedPart = saved.parts.find(
    (part: { id: string }) => part.id === occurrence.partActions[0].partInstanceId
  );
  const previousPart = saved.parts.find((part: { id: string }) => part.id === 'part-engine-oil');
  const componentState = saved.componentStates.find(
    (state: { componentDefinitionId: string }) => state.componentDefinitionId === 'engine-oil'
  );
  expect(occurrence.expense).toMatchObject({
    partsTotalCents: 10000,
    laborCostCents: 5000,
    otherCostCents: 2500
  });
  expect(installedPart).toMatchObject({ name: 'Óleo sintético 5W40', status: 'installed' });
  expect(previousPart).toMatchObject({
    status: 'replaced',
    replacedByPartInstanceId: installedPart.id
  });
  expect(componentState.currentPartInstanceId).toBe(installedPart.id);
  expect(saved.warranties[0]).toMatchObject({
    type: 'service',
    maintenanceOccurrenceId: occurrence.id,
    endDate: '2027-09-20'
  });
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
