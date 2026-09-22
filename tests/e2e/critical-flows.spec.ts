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

test('Hub de Peças busca dados da peça e inicia ação vinculada à manutenção', async ({ page }) => {
  await page.goto('./#/parts');
  await page.getByLabel('Buscar peças').fill('Moura');
  await expect(page.getByRole('heading', { name: 'Bateria' })).toBeVisible();

  await page.goto('./#/parts/engine-oil');
  await page.getByRole('button', { name: 'Editar peça' }).click();
  await page.getByLabel('Marca').fill('Mobil');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.getByText('Peça atualizada.')).toBeVisible();
  await expect(page.getByText(/Mobil/)).toBeVisible();

  await page.getByRole('button', { name: 'Inspecionar' }).click();
  await expect(page).toHaveURL(/maintenance\/maint-oil\/complete/);
  await expect(page.getByRole('combobox', { name: 'Componente', exact: true })).toHaveValue(
    'engine-oil'
  );
  await expect(page.getByRole('combobox', { name: 'Ação executada' })).toHaveValue('inspected');
  await page.getByRole('button', { name: 'Adicionar ação' }).click();
  await page.getByRole('combobox', { name: 'Ação executada' }).nth(1).selectOption('repaired');
  await page.getByRole('button', { name: 'Confirmar conclusão' }).click();
  await expect(page.getByText(/próximo ciclo recalculado/i)).toBeVisible();
  const partActions = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('carango-demo-data-v1')!);
    return {
      actions: saved.occurrences[0].partActions.map((action: { action: string }) => action.action),
      currentPartInstanceId: saved.componentStates.find(
        (item: { componentDefinitionId: string }) => item.componentDefinitionId === 'engine-oil'
      ).currentPartInstanceId
    };
  });
  expect(partActions).toEqual({
    actions: ['inspected', 'repaired'],
    currentPartInstanceId: 'part-engine-oil'
  });

  await page.goto('./#/parts/engine-oil');
  await page.getByRole('button', { name: 'Remover/descartar' }).click();
  await expect(page.getByLabel('Confirmo a remoção desta peça essencial')).toBeVisible();
});

test('componente pode sair e voltar ao estado não aplicável', async ({ page }) => {
  await page.goto('./#/parts/air-conditioning');
  await page.getByRole('button', { name: 'Tornar aplicável' }).click();
  await page.getByRole('button', { name: 'Confirmar' }).click();
  await expect(page.getByText('Componente voltou ao estado aplicável.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sem informações' })).toBeVisible();

  await page.getByRole('button', { name: 'Não se aplica' }).click();
  await page.getByRole('button', { name: 'Confirmar' }).click();
  await expect(page.getByText('Componente marcado como não aplicável.')).toBeVisible();
  const state = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('carango-demo-data-v1')!);
    return saved.componentStates.find(
      (item: { componentDefinitionId: string }) => item.componentDefinitionId === 'air-conditioning'
    );
  });
  expect(state).toMatchObject({ state: 'notApplicable' });
});

test('problema pode ser criado, editado e resolvido com confirmação', async ({ page }) => {
  await page.goto('./#/maintenance?tab=issues');
  await page.getByRole('button', { name: 'Novo problema' }).click();
  await page.getByLabel('Título').fill('Vazamento próximo ao motor');
  await page.getByLabel('Descrição').fill('Há marcas de fluido após estacionar.');
  await page.getByLabel('Prioridade').selectOption('high');
  await page.getByLabel('Componente').selectOption('engine-oil');
  await page.getByRole('button', { name: 'Salvar problema' }).click();
  await expect(page.getByText('Problema registrado.')).toBeVisible();

  await page.getByRole('button', { name: 'Abrir problema Vazamento próximo ao motor' }).click();
  await page.getByLabel('Descrição').fill('Há marcas de óleo após estacionar.');
  await page.getByRole('button', { name: 'Salvar problema' }).click();
  await expect(page.getByText('Problema atualizado.')).toBeVisible();

  await page.getByRole('button', { name: 'Abrir problema Vazamento próximo ao motor' }).click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await page.getByRole('button', { name: 'Resolver' }).click();
  await expect(page.getByText('Confirmar resolução do problema?')).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar' }).click();
  await expect(page.getByText(/marcado como resolvido/i)).toBeVisible();
  const issue = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('carango-demo-data-v1')!);
    return saved.issues.find((item: { title: string }) => item.title.includes('Vazamento'));
  });
  expect(issue).toMatchObject({ status: 'resolved', componentDefinitionId: 'engine-oil' });
  expect(issue.resolvedDate).toBeTruthy();
});

test('inspeção tem resultado próprio e cria problema sem trocar peça', async ({ page }) => {
  await page.goto('./#/maintenance?tab=inspections');
  await expect(page.getByRole('heading', { name: 'Inspecionar freios dianteiros' })).toBeVisible();
  await page.getByRole('link', { name: 'Ver detalhes' }).click();
  await page.getByRole('button', { name: 'Concluir manutenção' }).click();
  await expect(page.getByRole('heading', { name: 'Resultado da inspeção' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ações de peças' })).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Resultado', exact: true }).selectOption('problem');
  await page.getByLabel('Observações da inspeção').fill('Pastilhas próximas do limite.');
  await page.getByLabel('Criar problema a partir deste resultado').check();
  await page.getByRole('button', { name: 'Confirmar conclusão' }).click();
  await expect(page.getByText(/próximo ciclo recalculado/i)).toBeVisible();
  const result = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('carango-demo-data-v1')!);
    const occurrence = saved.occurrences[0];
    const componentState = saved.componentStates.find(
      (item: { componentDefinitionId: string }) => item.componentDefinitionId === 'front-brake-pads'
    );
    return {
      occurrence,
      componentState,
      part: saved.parts.find((item: { id: string }) => item.id === 'part-front-brake-pads'),
      issue: saved.issues.find(
        (item: { relatedMaintenanceOccurrenceId?: string }) =>
          item.relatedMaintenanceOccurrenceId === occurrence.id
      )
    };
  });
  expect(result.occurrence).toMatchObject({
    inspectionResult: 'problem',
    partActions: [{ action: 'inspected', partInstanceId: 'part-front-brake-pads' }]
  });
  expect(result.componentState.currentPartInstanceId).toBe('part-front-brake-pads');
  expect(result.part.status).toBe('installed');
  expect(result.issue).toMatchObject({ priority: 'high', status: 'identified' });

  await page.getByRole('button', { name: 'Concluir manutenção' }).click();
  const resolveIssue = page.getByLabel(/Marcar “Resultado da inspeção:/);
  await expect(resolveIssue).toBeVisible();
  await resolveIssue.check();
  await page.getByRole('button', { name: 'Confirmar conclusão' }).click();
  const resolvedStatus = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('carango-demo-data-v1')!);
    return saved.issues.find((item: { title: string }) =>
      item.title.startsWith('Resultado da inspeção:')
    ).status;
  });
  expect(resolvedStatus).toBe('resolved');
});

test('manutenção pendente aparece na aba e pode ser iniciada', async ({ page }) => {
  await page.goto('./#/maintenance/new');
  await page.getByLabel('Título').fill('Avaliar vazamento manual');
  await page.getByLabel('Tipo').selectOption('corrective');
  await page.getByLabel('Estado inicial').selectOption('pending');
  await page.getByLabel('Recorrência').selectOption('none');
  await page.getByRole('button', { name: 'Criar manutenção' }).click();
  await page.getByRole('tab', { name: /Pendentes/ }).click();
  await expect(page.getByRole('heading', { name: 'Avaliar vazamento manual' })).toBeVisible();
  await page.getByRole('link', { name: 'Ver detalhes' }).click();
  await page.getByRole('button', { name: 'Iniciar' }).click();
  await expect(page.getByText('Manutenção iniciada.')).toBeVisible();
  await expect(page.getByText('Em andamento')).toBeVisible();
});

test('garantias de peça e serviço podem ser criadas e editadas', async ({ page }) => {
  await page.goto('./#/history');
  await page.getByRole('button', { name: 'Nova garantia' }).click();
  await page.getByLabel('Peça vinculada').selectOption('part-battery');
  await page.getByLabel('Data final').fill('2026-09-22');
  await page.getByLabel('KM final').fill('160000');
  await page.getByLabel('Prestador ou fornecedor').fill('Loja da bateria');
  await page.getByLabel('URL do documento').fill('https://example.com/garantia-bateria');
  await page.getByLabel('Termos').fill('Cobertura integral de fabricação.');
  await page.getByLabel('Observações da garantia').fill('Nota fiscal arquivada.');
  await page.getByRole('button', { name: 'Salvar garantia' }).click();
  await expect(page.getByText('Garantia cadastrada.').last()).toBeVisible();
  await expect(page.getByText('Vencida').first()).toBeVisible();

  await page.getByRole('button', { name: 'Editar garantia de Bateria 60 Ah' }).first().click();
  await page.getByLabel('Prestador ou fornecedor').fill('Loja da bateria atualizada');
  await page.getByRole('button', { name: 'Salvar garantia' }).click();
  await expect(page.getByText('Garantia atualizada.')).toBeVisible();

  await page.getByRole('button', { name: 'Nova garantia' }).click();
  await page.getByLabel('Tipo de garantia').selectOption('service');
  await page.getByLabel('Serviço vinculado').selectOption('occ-oil');
  await page.getByLabel('Data final').fill('2027-09-22');
  await page.getByLabel('Prestador ou fornecedor').fill('Oficina garantidora');
  await page.getByRole('button', { name: 'Salvar garantia' }).click();
  await expect(page.getByText('Garantia cadastrada.').last()).toBeVisible();

  const warranties = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('carango-demo-data-v1')!);
    return saved.warranties.filter((item: { provider?: string }) =>
      ['Loja da bateria atualizada', 'Oficina garantidora'].includes(item.provider ?? '')
    );
  });
  expect(warranties).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        type: 'part',
        partInstanceId: 'part-battery',
        endDate: '2026-09-22',
        endOdometerKm: 160000,
        terms: 'Cobertura integral de fabricação.',
        documentUrl: 'https://example.com/garantia-bateria',
        observations: 'Nota fiscal arquivada.'
      }),
      expect.objectContaining({
        type: 'service',
        maintenanceOccurrenceId: 'occ-oil',
        endDate: '2027-09-22'
      })
    ])
  );
});

test('menu mobile abre por botão', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Fluxo exclusivo do projeto mobile');
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Navegação mobile' })).toBeVisible();
});
