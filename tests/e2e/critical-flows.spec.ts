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
  await expect(page.locator('.connection')).toContainText('Sincronizado');
});

test('histórico de KM pode ser corrigido e excluído com recomposição dos derivados', async ({
  page
}) => {
  await page.goto('./#/vehicle');
  const currentRow = page.locator('.odometer-row').filter({ hasText: '148.250 km' });
  await currentRow.getByRole('button', { name: 'Editar leitura' }).click();
  await expect(page.getByText('Impacto desta correção')).toBeVisible();
  await page.getByLabel('Nova leitura').fill('147500');
  await expect(page.getByText(/148\.250 km.*147\.500 km/)).toBeVisible();
  await page.getByRole('button', { name: 'Salvar correção' }).click();
  await expect(page.getByText('147.500 km').first()).toBeVisible();

  let saved = await page.evaluate(() => JSON.parse(localStorage.getItem('carango-demo-data-v1')!));
  expect(saved.vehicle.currentOdometer).toBe(147500);
  expect(
    saved.maintenancePlans.find((plan: { id: string }) => plan.id === 'maint-brakes').status
  ).toBe('ok');
  expect(
    saved.alerts.some((alert: { id: string }) => alert.id === 'maintenance-maint-brakes')
  ).toBe(false);

  const correctedRow = page.locator('.odometer-row').filter({ hasText: '147.500 km' });
  await correctedRow.getByRole('button', { name: 'Excluir leitura' }).click();
  await expect(page.getByRole('dialog').getByText(/147\.500 km.*147\.380 km/)).toBeVisible();
  await page.getByRole('button', { name: 'Excluir leitura', exact: true }).click();
  await expect(page.getByText('147.380 km').first()).toBeVisible();

  await page.getByRole('button', { name: 'Atualizar KM' }).click();
  await expect(page.getByLabel('Data da leitura')).toHaveValue('');
  await page.getByLabel('Nova leitura').fill('148000');
  await page.getByRole('button', { name: 'Salvar leitura' }).click();

  saved = await page.evaluate(() => JSON.parse(localStorage.getItem('carango-demo-data-v1')!));
  const added = saved.odometer.find(
    (record: { odometerKm: number }) => record.odometerKm === 148000
  );
  const today = await page.evaluate(() => new Date().toISOString().slice(0, 10));
  expect(added.recordedDate).toBe(today);
  expect(saved.vehicle.currentOdometer).toBe(148000);
  expect(
    saved.maintenancePlans.find((plan: { id: string }) => plan.id === 'maint-brakes').status
  ).toBe('upcoming');
  expect(
    saved.alerts.some((alert: { id: string }) => alert.id === 'maintenance-maint-brakes')
  ).toBe(true);
});

test('recorrência temporal aceita anos em um plano combinado', async ({ page }) => {
  await page.goto('./#/maintenance/new');
  await page.getByLabel('Título').fill('Substituir correia auxiliar');
  await page
    .getByRole('spinbutton', { name: 'KM da última realização', exact: true })
    .fill('148250');
  await page
    .getByRole('textbox', { name: 'Data da última realização', exact: true })
    .fill('2026-09-20');
  await page.getByRole('spinbutton', { name: 'Intervalo em KM', exact: true }).fill('40000');
  await page.getByRole('spinbutton', { name: 'Intervalo de tempo', exact: true }).fill('2');
  await page.getByLabel('Unidade de tempo').selectOption('years');
  await expect(page.getByRole('textbox', { name: /^Próxima data/ })).toHaveValue('2028-09-20');
  await page.getByRole('button', { name: 'Criar manutenção' }).click();

  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('carango-demo-data-v1')!)
  );
  const plan = saved.maintenancePlans.find(
    (item: { title: string }) => item.title === 'Substituir correia auxiliar'
  );
  expect(plan).toMatchObject({
    recurrenceType: 'km_or_time',
    intervalKm: 40000,
    intervalYears: 2,
    nextDueKm: 188250,
    nextDueDate: '2028-09-20'
  });
  expect(plan.intervalDays).toBeUndefined();
  expect(plan.intervalMonths).toBeUndefined();
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

test('estorno parcial pode virar total e ser removido sem desfazer manutenção', async ({
  page
}) => {
  await page.goto('./#/expenses');
  const expense = page.locator('.financial-row').filter({ hasText: 'Troca de óleo e filtro' });
  await expense.getByRole('button', { name: 'Registrar estorno' }).click();
  await page.getByLabel('Valor estornado (R$)').fill('50,00');
  await page.getByLabel('Observação do estorno').fill('Crédito parcial do fornecedor');
  await page.getByRole('button', { name: 'Salvar estorno' }).click();
  await expect(expense).toContainText('Estornado R$ 50,00');
  await expect(expense).toContainText('Líquido R$ 209,90');
  await expect(expense).toContainText('Parcialmente estornada');

  await expense.getByRole('button', { name: 'Editar estorno' }).click();
  await page.getByLabel('Tipo de estorno').selectOption('full');
  const saveRefundButton = page.getByRole('button', { name: 'Salvar estorno' });
  await saveRefundButton.press('Enter');
  await expect(expense).toContainText('Líquido R$ 0,00');
  await expect(expense).toContainText('Estornada');

  await expense.getByRole('button', { name: 'Editar estorno' }).click();
  await page.getByRole('button', { name: 'Remover', exact: true }).click();
  await page.getByRole('button', { name: 'Remover estorno' }).click();
  await expect(expense).toContainText('R$ 259,90');
  await expect(expense).toContainText('Normal');

  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('carango-demo-data-v1') ?? '{}')
  );
  const occurrence = saved.occurrences.find((item: { id: string }) => item.id === 'occ-oil');
  expect(occurrence.expense).toMatchObject({ refundStatus: 'none', refundedAmountCents: 0 });
  expect(occurrence.partActions).toHaveLength(1);
});

test('alertas respeitam contexto, adiamento, ocultação e integridade essencial', async ({
  page
}) => {
  await page.goto('./#/alerts');
  const critical = page.locator('.alert-card').filter({ hasText: 'Revisar correia dentada' });
  await expect(critical).toContainText('Crítico');
  await expect(critical).toContainText('6.750 km de atraso');
  await expect(critical).toContainText('Correia dentada');
  await expect(critical).toContainText('Critério mais urgente: KM');
  const alertButton = page.locator('.alert-button');
  const activeBefore = Number((await alertButton.getAttribute('aria-label'))?.match(/\d+/)?.[0]);

  const optionalMissing = page
    .locator('.alert-card')
    .filter({ hasText: 'Filtro de cabine faltando' });
  await optionalMissing.getByRole('button', { name: 'Adiar' }).click();
  await page.getByLabel('Prazo por tempo').selectOption('7');
  await page.getByLabel('Prazo por quilometragem').selectOption('500');
  await page.getByRole('button', { name: 'Confirmar adiamento' }).click();
  await expect(optionalMissing).toHaveCount(0);
  await expect(alertButton).toHaveAttribute('aria-label', `${activeBefore - 1} alertas`);
  await page.getByRole('tab', { name: /Adiados 1/ }).click();
  await expect(page.getByText('Filtro de cabine faltando')).toBeVisible();
  await expect(page.getByText(/Adiado até 148\.750 km/)).toBeVisible();
  await page.getByRole('button', { name: 'Reativar agora' }).click();
  await expect(page.getByText('Filtro de cabine faltando')).toHaveCount(0);
  await expect(alertButton).toHaveAttribute('aria-label', `${activeBefore} alertas`);

  await page.getByRole('tab', { name: /Ativos/ }).click();
  await expect(page.getByText('Filtro de cabine faltando')).toBeVisible();
  const documentAlert = page
    .locator('.alert-card')
    .filter({ hasText: 'Licenciamento 2026 próximo' });
  await documentAlert.getByRole('button', { name: 'Ocultar' }).click();
  await expect(documentAlert).toHaveCount(0);
  await expect(alertButton).toHaveAttribute('aria-label', `${activeBefore - 1} alertas`);
  await page.getByRole('tab', { name: /Ocultos 1/ }).click();
  await expect(page.getByText('Licenciamento 2026 próximo')).toBeVisible();
  await page.getByRole('button', { name: 'Reexibir' }).click();
  await expect(page.getByText('Licenciamento 2026 próximo')).toHaveCount(0);

  await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('carango-demo-data-v1')!);
    const battery = saved.componentStates.find(
      (item: { componentDefinitionId: string }) => item.componentDefinitionId === 'battery'
    );
    battery.state = 'missing';
    delete battery.currentPartInstanceId;
    localStorage.setItem('carango-demo-data-v1', JSON.stringify(saved));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Explorar demonstração' }).click();
  await page.goto('./#/alerts');
  const essentialMissing = page.locator('.alert-card').filter({ hasText: 'Bateria faltando' });
  await expect(essentialMissing).toContainText('Componente essencial');
  await expect(essentialMissing.getByRole('button', { name: 'Adiar' })).toHaveCount(0);
  await expect(essentialMissing.getByRole('button', { name: 'Ocultar' })).toHaveCount(0);
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

test('documento personalizado pode ser criado, editado e excluído com todos os campos', async ({
  page
}) => {
  await page.goto('./#/documents');
  await page.getByRole('button', { name: 'Novo documento' }).click();
  await page.getByLabel('Nome').fill('Laudo cautelar 2026');
  await page.getByLabel('Tipo').selectOption('custom');
  await page.getByLabel('Tipo personalizado').fill('Laudo cautelar');
  await page.getByLabel('Número / referência').fill('LC-9876');
  await page.getByLabel('Ano de referência').fill('2026');
  await page.getByLabel('Data de emissão').fill('2026-08-12');
  await page.getByLabel('Vencimento').fill('2027-08-12');
  await page.getByLabel('Valor (R$)').fill('350,90');
  await page.getByLabel('Situação').selectOption('active');
  await page.getByLabel('URL do documento').fill('https://example.com/laudo-cautelar');
  await page.getByLabel('Observações').fill('Documento completo arquivado digitalmente.');
  await page.getByRole('button', { name: 'Salvar documento' }).click();

  const card = page.locator('.document-card').filter({ hasText: 'Laudo cautelar 2026' });
  await expect(card).toContainText('Laudo cautelar');
  await expect(card).toContainText('LC-9876');
  await expect(card).toContainText('R$ 350,90');
  await expect(card).toContainText('Ativo');
  await expect(card.getByRole('link', { name: 'Abrir documento' })).toHaveAttribute(
    'href',
    'https://example.com/laudo-cautelar'
  );

  await card.getByRole('button', { name: 'Editar' }).click();
  await page.getByLabel('Nome').fill('Laudo cautelar atualizado');
  await page.getByLabel('Situação').selectOption('paid');
  await page.getByRole('button', { name: 'Salvar documento' }).click();
  const updatedCard = page
    .locator('.document-card')
    .filter({ hasText: 'Laudo cautelar atualizado' });
  await expect(updatedCard).toContainText('Pago');

  await updatedCard.getByRole('button', { name: 'Excluir' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Excluir documento' }).click();
  await expect(page.getByText('Laudo cautelar atualizado')).toHaveCount(0);
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('carango-demo-data-v1')!)
  );
  expect(
    saved.documents.some((item: { name: string }) => item.name.includes('Laudo cautelar'))
  ).toBe(false);
});

test('histórico unificado filtra e recompõe somente o plano da ocorrência corrigida', async ({
  page
}) => {
  await page.goto('./#/history');
  await expect(page.getByRole('tab', { name: 'Inspeções' })).toBeVisible();
  await page.getByRole('tab', { name: 'Gastos' }).click();
  await expect(page.getByRole('heading', { name: 'Gasto — Troca de óleo e filtro' })).toBeVisible();
  await page.getByRole('tab', { name: 'Tudo' }).click();
  await page.getByLabel('Manutenção').selectOption('maint-oil');
  await expect(page.getByText(/eventos? encontrados?/)).toBeVisible();

  await page.getByRole('button', { name: 'Editar ocorrência' }).click();
  await page.getByLabel('Data da ocorrência').fill('2026-02-20');
  await page.getByLabel('Quilometragem da ocorrência').fill('140500');
  await page.getByLabel('Oficina / prestador').fill('Oficina revisada');
  await page.getByLabel('Observações da ocorrência').fill('Registro histórico corrigido.');
  await page.getByRole('button', { name: 'Salvar correção' }).click();
  await expect(page.getByText(/Ocorrência corrigida/)).toBeVisible();

  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('carango-demo-data-v1')!)
  );
  expect(saved.occurrences.find((item: { id: string }) => item.id === 'occ-oil')).toMatchObject({
    performedDate: '2026-02-20',
    odometerKm: 140500,
    workshopOrProvider: 'Oficina revisada',
    observations: 'Registro histórico corrigido.'
  });
  expect(
    saved.maintenancePlans.find((item: { id: string }) => item.id === 'maint-oil')
  ).toMatchObject({ nextDueKm: 150500, nextDueDate: '2027-02-20' });
  expect(
    saved.maintenancePlans.find((item: { id: string }) => item.id === 'maint-brakes')
  ).toMatchObject({ nextDueKm: 149000, status: 'upcoming', revision: 1 });
});

test('exclusão histórica faz rollback seguro de uma substituição A para B', async ({ page }) => {
  await page.goto('./#/history');
  await page.getByLabel('Manutenção').selectOption('maint-oil');
  await page.getByRole('button', { name: 'Editar ocorrência' }).click();
  await page.getByRole('button', { name: 'Salvar correção' }).click();
  await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('carango-demo-data-v1')!);
    const occurrence = saved.occurrences.find((item: { id: string }) => item.id === 'occ-oil');
    const previous = saved.parts.find((item: { id: string }) => item.id === 'part-engine-oil');
    occurrence.partActions = [
      {
        id: 'pa-replace',
        componentDefinitionId: 'engine-oil',
        partInstanceId: 'part-engine-oil-b',
        action: 'replaced'
      }
    ];
    previous.status = 'replaced';
    previous.replacedByPartInstanceId = 'part-engine-oil-b';
    previous.removalDate = occurrence.performedDate;
    previous.removalOdometerKm = occurrence.odometerKm;
    previous.removalOccurrenceId = occurrence.id;
    saved.parts.push({
      ...previous,
      id: 'part-engine-oil-b',
      name: 'Óleo sucessor',
      status: 'installed',
      installDate: occurrence.performedDate,
      installOdometerKm: occurrence.odometerKm,
      installationOccurrenceId: occurrence.id,
      replacedByPartInstanceId: undefined,
      removalDate: undefined,
      removalOdometerKm: undefined,
      removalOccurrenceId: undefined
    });
    const state = saved.componentStates.find(
      (item: { componentDefinitionId: string }) => item.componentDefinitionId === 'engine-oil'
    );
    state.currentPartInstanceId = 'part-engine-oil-b';
    localStorage.setItem('carango-demo-data-v1', JSON.stringify(saved));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Explorar demonstração' }).click();
  await page.goto('./#/history');
  await page.getByLabel('Manutenção').selectOption('maint-oil');
  await page.getByRole('button', { name: 'Excluir', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Confirmar exclusão' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar exclusão' }).click();
  await expect(page.getByText(/rollback seguro/)).toBeVisible();

  const result = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('carango-demo-data-v1')!);
    return {
      occurrence: saved.occurrences.find((item: { id: string }) => item.id === 'occ-oil'),
      previous: saved.parts.find((item: { id: string }) => item.id === 'part-engine-oil'),
      successor: saved.parts.find((item: { id: string }) => item.id === 'part-engine-oil-b'),
      state: saved.componentStates.find(
        (item: { componentDefinitionId: string }) => item.componentDefinitionId === 'engine-oil'
      ),
      plan: saved.maintenancePlans.find((item: { id: string }) => item.id === 'maint-oil')
    };
  });
  expect(result.occurrence).toBeUndefined();
  expect(result.successor).toBeUndefined();
  expect(result.previous.status).toBe('installed');
  expect(result.previous.replacedByPartInstanceId).toBeUndefined();
  expect(result.previous.removalOccurrenceId).toBeUndefined();
  expect(result.state.currentPartInstanceId).toBe('part-engine-oil');
  expect(result.plan).toMatchObject({ status: 'pending', isActive: true });
  expect(result.plan.nextDueKm).toBeUndefined();
});

test('filtros persistem somente quando a preferência global está ativa', async ({ page }) => {
  await page.goto('./#/parts');
  await page.getByRole('tab', { name: /Todas as peças/ }).click();
  await page.getByLabel('Buscar peças').fill('Moura');
  await page.getByLabel('Sistema').selectOption('Elétrica');
  await page.goto('./#/documents');
  await page.goto('./#/parts');
  await expect(page.getByLabel('Buscar peças')).toHaveValue('Moura');
  await expect(page.getByLabel('Sistema')).toHaveValue('Elétrica');

  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await expect(page.getByLabel('Buscar peças')).toHaveValue('');
  await expect(page.getByRole('tab', { name: /Todas as peças/ })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  await page.getByRole('button', { name: 'Restaurar padrão' }).click();
  await expect(page.getByRole('tab', { name: 'Visão do carro' })).toHaveAttribute(
    'aria-selected',
    'true'
  );

  await page.goto('./#/settings');
  await page.getByLabel('Lembrar buscas, filtros, agrupamentos e abas neste dispositivo').uncheck();
  await page.getByRole('button', { name: 'Salvar preferências' }).click();
  await page.goto('./#/parts');
  await page.getByLabel('Buscar peças').fill('Cobreq');
  await page.goto('./#/documents');
  await page.goto('./#/parts');
  await expect(page.getByLabel('Buscar peças')).toHaveValue('');
});

test('rascunhos extensos são retomados sem criar efeitos de domínio', async ({ page }) => {
  await page.goto('./#/maintenance/new');
  await page.getByLabel('Título').fill('Rascunho de revisão futura');
  await page.getByLabel('Descrição').fill('Ainda não deve virar manutenção.');
  await expect(page.getByText(/Rascunho salvo — você pode sair/)).toBeVisible();
  const before = await page.evaluate(() => ({
    domain: localStorage.getItem('carango-demo-data-v1'),
    draft: sessionStorage.getItem('carango-draft-new-maintenance')
  }));
  expect(before.domain).toBeNull();
  expect(before.draft).toContain('Rascunho de revisão futura');

  await page.getByRole('button', { name: 'Cancelar' }).click();
  await page.goto('./#/maintenance/new');
  await expect(page.getByLabel('Título')).toHaveValue('Rascunho de revisão futura');
  await expect(page.getByLabel('Descrição')).toHaveValue('Ainda não deve virar manutenção.');

  await page.goto('./#/documents');
  await page.getByRole('button', { name: 'Novo documento' }).click();
  await page.getByLabel('Nome').fill('Documento ainda não confirmado');
  await expect(page.getByText(/Rascunho salvo — você pode sair/)).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await page.goto('./#/maintenance');
  await page.goto('./#/documents');
  await page.getByRole('button', { name: 'Novo documento' }).click();
  await expect(page.getByLabel('Nome')).toHaveValue('Documento ainda não confirmado');

  const after = await page.evaluate(() => localStorage.getItem('carango-demo-data-v1'));
  expect(after).toBeNull();
});

test('conflito legado salvo na sessão é migrado sem apagar a interface', async ({ page }) => {
  await page.evaluate(() => {
    const metadata = {
      schemaVersion: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      createdBy: 'owner@example.com',
      updatedAt: '2026-09-22T00:00:00.000Z',
      updatedBy: 'owner@example.com',
      revision: 2
    };
    const vehicle = {
      ...metadata,
      id: 'sandero',
      manufacturer: 'Renault',
      model: 'Sandero',
      trim: 'Expression',
      year: 2013,
      modelYear: 2014,
      engine: '1.6 8V',
      fuelType: 'Flex',
      color: 'Prata',
      plate: '',
      renavam: '',
      chassis: '',
      currentOdometer: 148000,
      observations: ''
    };
    sessionStorage.setItem(
      'carango-sync-conflicts-v1',
      JSON.stringify([
        {
          id: 'vehicle:sandero',
          entityType: 'vehicle',
          entityId: 'sandero',
          local: { ...vehicle, color: 'Vermelho' },
          remote: { ...vehicle, color: 'Azul', observations: 'Servidor' },
          detectedAt: '2026-09-22T00:00:00.000Z'
        }
      ])
    );
  });
  await page.reload();
  await page.getByRole('button', { name: 'Explorar demonstração' }).click();

  const dialog = page.getByRole('dialog', { name: 'Conflito de sincronização' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('color', { exact: true })).toBeVisible();
  await expect(dialog.getByText('observations', { exact: true })).toBeVisible();
  await expect(page.locator('.app-shell')).toBeVisible();
});

test('menu mobile abre por botão', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Fluxo exclusivo do projeto mobile');
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Navegação mobile' })).toBeVisible();
});
