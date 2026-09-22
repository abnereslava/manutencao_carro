import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useData } from '../../app/providers/DataProvider';
import { SANDERO_COMPONENTS } from '../../catalog/components/sandero';
import { PageHeader } from '../../components/layout/AppShell';
import { Button, Card, Input, Select, Textarea } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { calculateExpense } from '../../domain/expenses';
import { nextCycle } from '../../domain/maintenance';
import { formatDate, formatKm, formatMoney, todayISO } from '../../lib/format';

interface PartActionDraft {
  id: string;
  componentDefinitionId: string;
  action: 'installed' | 'replaced' | 'removed' | 'inspected' | 'repaired';
  partName: string;
  brand: string;
  model: string;
  partCode: string;
  conditionAtInstall: 'new' | 'used' | 'reconditioned' | 'unknown';
  priorLifeKnown: boolean;
  initialConditionNotes: string;
  purchasePrice: string;
  observations: string;
  essentialRemovalConfirmed: boolean;
}

function newPartAction(
  componentDefinitionId = '',
  action: PartActionDraft['action'] = 'installed'
): PartActionDraft {
  return {
    id: crypto.randomUUID(),
    componentDefinitionId,
    action,
    partName: '',
    brand: '',
    model: '',
    partCode: '',
    conditionAtInstall: 'new',
    priorLifeKnown: true,
    initialConditionNotes: '',
    purchasePrice: '',
    observations: '',
    essentialRemovalConfirmed: false
  };
}

function currencyToCents(value: string): number {
  const normalized = value.includes(',') ? value.replace(/\./g, '').replace(',', '.') : value;
  const amount = Number(normalized || 0);
  return Number.isFinite(amount) ? Math.round(amount * 100) : Number.NaN;
}

export function CompleteMaintenancePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data, completeMaintenance } = useData();
  const { toast } = useToast();
  const [date, setDate] = useState(todayISO());
  const [km, setKm] = useState(String(data.vehicle.currentOdometer));
  const [provider, setProvider] = useState('');
  const [observations, setObservations] = useState('');
  const [partsCost, setPartsCost] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [otherCost, setOtherCost] = useState('');
  const [manualOverrideEnabled, setManualOverrideEnabled] = useState(false);
  const [manualTotal, setManualTotal] = useState('');
  const [partActions, setPartActions] = useState<PartActionDraft[]>(() => {
    const componentDefinitionId = searchParams.get('component') ?? '';
    const requestedAction = searchParams.get('action');
    const allowedActions: PartActionDraft['action'][] = [
      'installed',
      'replaced',
      'removed',
      'inspected',
      'repaired'
    ];
    return componentDefinitionId &&
      allowedActions.includes(requestedAction as PartActionDraft['action'])
      ? [newPartAction(componentDefinitionId, requestedAction as PartActionDraft['action'])]
      : [];
  });
  const [inspectionResult, setInspectionResult] = useState<
    'satisfactory' | 'attention' | 'problem'
  >('satisfactory');
  const [inspectionObservations, setInspectionObservations] = useState('');
  const [createIssueFromInspection, setCreateIssueFromInspection] = useState(false);
  const [resolveIssueIds, setResolveIssueIds] = useState<string[]>([]);
  const [hasWarranty, setHasWarranty] = useState(false);
  const [warrantyEndDate, setWarrantyEndDate] = useState('');
  const [warrantyEndKm, setWarrantyEndKm] = useState('');
  const [warrantyProvider, setWarrantyProvider] = useState('');
  const [warrantyTerms, setWarrantyTerms] = useState('');
  const [warrantyUrl, setWarrantyUrl] = useState('');
  const [warrantyObservations, setWarrantyObservations] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const plan = data.maintenancePlans.find((item) => item.id === id);
  if (!plan)
    return (
      <Card className="not-found-card">
        <h2>Manutenção não encontrada</h2>
        <Link to="/maintenance">Voltar à lista</Link>
      </Card>
    );
  const updatePartAction = (id: string, patch: Partial<PartActionDraft>) =>
    setPartActions((current) =>
      current.map((action) => (action.id === id ? { ...action, ...patch } : action))
    );
  const linkedIssues = data.issues.filter(
    (issue) =>
      issue.relatedMaintenancePlanId === plan.id && !['resolved', 'ignored'].includes(issue.status)
  );
  const preview = nextCycle(plan, Number(km || 0), date);
  const detailedPartsTotalCents = partActions.reduce(
    (total, action) => total + currencyToCents(action.purchasePrice),
    0
  );
  const expense = {
    partsTotalCents: currencyToCents(partsCost) + detailedPartsTotalCents,
    laborCostCents: currencyToCents(laborCost),
    otherCostCents: currencyToCents(otherCost),
    manualTotalCents: manualOverrideEnabled ? currencyToCents(manualTotal) : undefined,
    manualOverrideEnabled,
    refundStatus: 'none' as const,
    refundedAmountCents: 0
  };
  const expensePreview = Object.values(expense).some(
    (value) => typeof value === 'number' && Number.isNaN(value)
  )
    ? undefined
    : calculateExpense(expense);

  const complete = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError('');
    if (!date || km === '' || Number(km) < 0) {
      setSubmitError('Informe uma data e uma quilometragem válidas.');
      return;
    }
    if (!expensePreview || (manualOverrideEnabled && manualTotal.trim() === '')) {
      setSubmitError('Revise os valores informados nos custos.');
      return;
    }
    if (
      partActions.some(
        (action) =>
          !action.componentDefinitionId ||
          ((action.action === 'installed' || action.action === 'replaced') &&
            !action.partName.trim()) ||
          Number.isNaN(currencyToCents(action.purchasePrice)) ||
          currencyToCents(action.purchasePrice) < 0
      )
    ) {
      setSubmitError('Revise os componentes, nomes e custos das ações de peças.');
      return;
    }
    if (
      partActions.some(
        (action) =>
          action.action === 'removed' &&
          SANDERO_COMPONENTS.find((component) => component.id === action.componentDefinitionId)
            ?.isEssential &&
          !action.essentialRemovalConfirmed
      )
    ) {
      setSubmitError('Confirme a remoção dos componentes essenciais antes de continuar.');
      return;
    }
    if (hasWarranty && !warrantyEndDate && warrantyEndKm === '') {
      setSubmitError('Informe o vencimento da garantia por data, KM ou ambos.');
      return;
    }
    if (
      expense.partsTotalCents < 0 ||
      expense.laborCostCents < 0 ||
      expense.otherCostCents < 0 ||
      (expense.manualTotalCents ?? 0) < 0
    ) {
      setSubmitError('Os custos não podem ser negativos.');
      return;
    }

    setIsSubmitting(true);
    try {
      await completeMaintenance(plan.id, {
        performedDate: date,
        odometerKm: Number(km),
        workshopOrProvider: provider.trim() || undefined,
        observations: observations.trim(),
        expense,
        partActions: (plan.type === 'inspection' ? [] : partActions).map((action) => ({
          componentDefinitionId: action.componentDefinitionId,
          action: action.action,
          observations: action.observations.trim() || undefined,
          newPart:
            action.action === 'installed' || action.action === 'replaced'
              ? {
                  name: action.partName.trim(),
                  brand: action.brand.trim() || undefined,
                  model: action.model.trim() || undefined,
                  partCode: action.partCode.trim() || undefined,
                  conditionAtInstall: action.conditionAtInstall,
                  priorLifeKnown: action.priorLifeKnown,
                  initialConditionNotes: action.initialConditionNotes.trim() || undefined,
                  purchasePriceCents: currencyToCents(action.purchasePrice)
                }
              : undefined
        })),
        warranty: hasWarranty
          ? {
              endDate: warrantyEndDate || undefined,
              endOdometerKm: warrantyEndKm === '' ? undefined : Number(warrantyEndKm),
              provider: warrantyProvider.trim() || provider.trim() || undefined,
              terms: warrantyTerms.trim() || undefined,
              documentUrl: warrantyUrl.trim() || undefined,
              observations: warrantyObservations.trim()
            }
          : undefined,
        inspection:
          plan.type === 'inspection'
            ? {
                result: inspectionResult,
                observations: inspectionObservations,
                createIssue: createIssueFromInspection
              }
            : undefined,
        resolveIssueIds
      });
      toast('Manutenção concluída e próximo ciclo recalculado.');
      navigate(`/maintenance/${plan.id}`, { replace: true });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Não foi possível concluir a manutenção.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="Manutenções / Concluir"
        title={`Concluir ${plan.title}`}
        description="Registre o serviço, as peças, os custos e a garantia em uma única operação."
        actions={
          <Button variant="ghost" onClick={() => navigate(`/maintenance/${plan.id}`)}>
            <ArrowLeft />
            Voltar ao detalhe
          </Button>
        }
      />
      <Card className="completion-page-card">
        <form onSubmit={complete}>
          <div className="completion-preview">
            <b>Prévia do próximo ciclo</b>
            {plan.recurrenceType === 'none' ? (
              <span>Este plano será arquivado após a conclusão.</span>
            ) : (
              <span>
                {preview.nextDueKm !== undefined
                  ? `Próximo KM: ${formatKm(preview.nextDueKm)}`
                  : 'Sem limite por KM'}
                {' · '}
                {preview.nextDueDate
                  ? `Próxima data: ${formatDate(preview.nextDueDate)}`
                  : 'Sem limite por data'}
              </span>
            )}
          </div>
          <div className="form-grid">
            <Input
              label="Data realizada"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label="Quilometragem"
              type="number"
              min="0"
              required
              value={km}
              hint="Pode ser menor que o KM atual em registros históricos."
              onChange={(e) => setKm(e.target.value)}
            />
            <Input
              label="Oficina ou prestador"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            />
            <Textarea
              className="full"
              label="Observações"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
            {plan.type === 'inspection' && (
              <section className="completion-subsection full" aria-labelledby="inspection-title">
                <div className="completion-subsection-heading">
                  <div>
                    <h3 id="inspection-title">Resultado da inspeção</h3>
                    <p>A inspeção registra o estado observado sem substituir a peça.</p>
                  </div>
                </div>
                <div className="form-grid">
                  <Select
                    label="Resultado"
                    value={inspectionResult}
                    onChange={(event) =>
                      setInspectionResult(
                        event.target.value as 'satisfactory' | 'attention' | 'problem'
                      )
                    }
                  >
                    <option value="satisfactory">Satisfatório</option>
                    <option value="attention">Requer atenção</option>
                    <option value="problem">Problema identificado</option>
                  </Select>
                  <Textarea
                    className="full"
                    label="Observações da inspeção"
                    value={inspectionObservations}
                    onChange={(event) => setInspectionObservations(event.target.value)}
                  />
                  {inspectionResult !== 'satisfactory' && (
                    <label className="checkbox-field full">
                      <input
                        type="checkbox"
                        checked={createIssueFromInspection}
                        onChange={(event) => setCreateIssueFromInspection(event.target.checked)}
                      />
                      Criar problema a partir deste resultado
                    </label>
                  )}
                </div>
              </section>
            )}
            {plan.type !== 'inspection' && (
              <section className="completion-subsection full" aria-labelledby="part-actions-title">
                <div className="completion-subsection-heading">
                  <div>
                    <h3 id="part-actions-title">Ações de peças</h3>
                    <p>Adicione quantas ações foram realmente executadas nesta manutenção.</p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      setPartActions((current) => {
                        const state = data.componentStates.find(
                          (item) => item.componentDefinitionId === plan.componentDefinitionId
                        );
                        return [
                          ...current,
                          newPartAction(
                            plan.componentDefinitionId,
                            state?.currentPartInstanceId ? 'inspected' : 'installed'
                          )
                        ];
                      })
                    }
                  >
                    <Plus />
                    Adicionar ação
                  </Button>
                </div>
                {partActions.map((action, index) => {
                  const actionComponentState = data.componentStates.find(
                    (state) => state.componentDefinitionId === action.componentDefinitionId
                  );
                  const currentPart = data.parts.find(
                    (part) => part.id === actionComponentState?.currentPartInstanceId
                  );
                  const createsPart = action.action === 'installed' || action.action === 'replaced';
                  return (
                    <Card className="part-action-editor" key={action.id}>
                      <div className="part-action-title">
                        <b>Ação {index + 1}</b>
                        <Button
                          type="button"
                          variant="ghost"
                          aria-label={`Remover ação ${index + 1}`}
                          onClick={() =>
                            setPartActions((current) =>
                              current.filter((item) => item.id !== action.id)
                            )
                          }
                        >
                          <Trash2 />
                          Remover
                        </Button>
                      </div>
                      <div className="form-grid">
                        <Select
                          label="Componente"
                          required
                          value={action.componentDefinitionId}
                          onChange={(event) =>
                            updatePartAction(
                              action.id,
                              (() => {
                                const state = data.componentStates.find(
                                  (item) => item.componentDefinitionId === event.target.value
                                );
                                return {
                                  componentDefinitionId: event.target.value,
                                  action: state?.currentPartInstanceId ? 'inspected' : 'installed',
                                  essentialRemovalConfirmed: false
                                };
                              })()
                            )
                          }
                        >
                          <option value="">Selecione</option>
                          {SANDERO_COMPONENTS.map((item) => (
                            <option value={item.id} key={item.id}>
                              {item.system} — {item.name}
                            </option>
                          ))}
                        </Select>
                        <Select
                          label="Ação executada"
                          value={action.action}
                          onChange={(event) =>
                            updatePartAction(action.id, {
                              action: event.target.value as PartActionDraft['action'],
                              essentialRemovalConfirmed: false
                            })
                          }
                        >
                          {!currentPart && <option value="installed">Instalar</option>}
                          {currentPart && <option value="replaced">Substituir</option>}
                          {currentPart && <option value="removed">Remover/descartar</option>}
                          {currentPart && <option value="inspected">Inspecionar</option>}
                          {currentPart && <option value="repaired">Reparar</option>}
                        </Select>
                        {action.componentDefinitionId && (
                          <p className="part-action-context full">
                            {currentPart
                              ? `Peça atual: ${currentPart.name}`
                              : 'Este componente não possui peça instalada.'}
                          </p>
                        )}
                        {action.action === 'removed' &&
                          SANDERO_COMPONENTS.find(
                            (item) => item.id === action.componentDefinitionId
                          )?.isEssential && (
                            <div className="essential-removal-warning full">
                              <b>Atenção: componente essencial</b>
                              <p>
                                Esta remoção deixará o componente sem peça instalada e criará um
                                alerta crítico. Nenhum item será mantido como estoque.
                              </p>
                              <label className="checkbox-field">
                                <input
                                  type="checkbox"
                                  checked={action.essentialRemovalConfirmed}
                                  onChange={(event) =>
                                    updatePartAction(action.id, {
                                      essentialRemovalConfirmed: event.target.checked
                                    })
                                  }
                                />
                                Confirmo a remoção desta peça essencial
                              </label>
                            </div>
                          )}
                        {createsPart && (
                          <>
                            <Input
                              label="Nome da nova peça"
                              required
                              value={action.partName}
                              onChange={(event) =>
                                updatePartAction(action.id, { partName: event.target.value })
                              }
                            />
                            <Input
                              label="Custo da peça (R$)"
                              inputMode="decimal"
                              value={action.purchasePrice}
                              onChange={(event) =>
                                updatePartAction(action.id, { purchasePrice: event.target.value })
                              }
                            />
                            <Input
                              label="Marca"
                              value={action.brand}
                              onChange={(event) =>
                                updatePartAction(action.id, { brand: event.target.value })
                              }
                            />
                            <Input
                              label="Modelo"
                              value={action.model}
                              onChange={(event) =>
                                updatePartAction(action.id, { model: event.target.value })
                              }
                            />
                            <Input
                              label="Código"
                              value={action.partCode}
                              onChange={(event) =>
                                updatePartAction(action.id, { partCode: event.target.value })
                              }
                            />
                            <Select
                              label="Condição"
                              value={action.conditionAtInstall}
                              onChange={(event) =>
                                updatePartAction(action.id, {
                                  conditionAtInstall: event.target
                                    .value as PartActionDraft['conditionAtInstall']
                                })
                              }
                            >
                              <option value="new">Nova</option>
                              <option value="used">Usada</option>
                              <option value="reconditioned">Recondicionada</option>
                              <option value="unknown">Desconhecida</option>
                            </Select>
                            <label className="checkbox-field full">
                              <input
                                type="checkbox"
                                checked={action.priorLifeKnown}
                                onChange={(event) =>
                                  updatePartAction(action.id, {
                                    priorLifeKnown: event.target.checked
                                  })
                                }
                              />
                              Vida útil anterior conhecida
                            </label>
                            <Textarea
                              className="full"
                              label="Estado inicial da peça"
                              value={action.initialConditionNotes}
                              onChange={(event) =>
                                updatePartAction(action.id, {
                                  initialConditionNotes: event.target.value
                                })
                              }
                            />
                          </>
                        )}
                        <Textarea
                          className="full"
                          label={
                            action.action === 'removed' || action.action === 'replaced'
                              ? 'Motivo e observações'
                              : 'Observações da ação'
                          }
                          value={action.observations}
                          onChange={(event) =>
                            updatePartAction(action.id, { observations: event.target.value })
                          }
                        />
                      </div>
                    </Card>
                  );
                })}
                {!partActions.length && (
                  <p className="part-action-empty">Nenhuma ação de peça adicionada.</p>
                )}
              </section>
            )}
            <Input
              label="Outros custos de peças/insumos (R$)"
              inputMode="decimal"
              value={partsCost}
              onChange={(e) => setPartsCost(e.target.value)}
            />
            <Input
              label="Mão de obra (R$)"
              inputMode="decimal"
              value={laborCost}
              onChange={(e) => setLaborCost(e.target.value)}
            />
            <Input
              label="Outros custos (R$)"
              inputMode="decimal"
              value={otherCost}
              onChange={(e) => setOtherCost(e.target.value)}
            />
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={manualOverrideEnabled}
                onChange={(event) => setManualOverrideEnabled(event.target.checked)}
              />
              Informar um total manual
            </label>
            {manualOverrideEnabled && (
              <Input
                label="Total manual (R$)"
                inputMode="decimal"
                required
                value={manualTotal}
                onChange={(e) => setManualTotal(e.target.value)}
              />
            )}
          </div>
          {linkedIssues.length > 0 && (
            <section className="completion-subsection linked-issues-section">
              <div className="completion-subsection-heading">
                <div>
                  <h3>Problemas relacionados</h3>
                  <p>Escolha quais problemas esta manutenção resolveu.</p>
                </div>
              </div>
              {linkedIssues.map((issue) => (
                <label className="checkbox-field" key={issue.id}>
                  <input
                    type="checkbox"
                    checked={resolveIssueIds.includes(issue.id)}
                    onChange={(event) =>
                      setResolveIssueIds((current) =>
                        event.target.checked
                          ? [...current, issue.id]
                          : current.filter((id) => id !== issue.id)
                      )
                    }
                  />
                  Marcar “{issue.title}” como resolvido
                </label>
              ))}
            </section>
          )}
          <div className="completion-preview completion-totals">
            <b>
              Total calculado:{' '}
              {expensePreview ? formatMoney(expensePreview.calculatedTotalCents) : 'Valor inválido'}
            </b>
            {manualOverrideEnabled && expensePreview && (
              <span>
                Total efetivo com override: {formatMoney(expensePreview.grossAmountCents)}
              </span>
            )}
          </div>
          <section className="completion-subsection warranty-section">
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={hasWarranty}
                onChange={(event) => setHasWarranty(event.target.checked)}
              />
              Cadastrar garantia deste serviço
            </label>
            {hasWarranty && (
              <div className="form-grid warranty-fields">
                <Input
                  label="Garantia até a data"
                  type="date"
                  value={warrantyEndDate}
                  onChange={(event) => setWarrantyEndDate(event.target.value)}
                />
                <Input
                  label="Garantia até o KM"
                  type="number"
                  min={Number(km || 0)}
                  value={warrantyEndKm}
                  onChange={(event) => setWarrantyEndKm(event.target.value)}
                />
                <Input
                  label="Prestador/fornecedor"
                  value={warrantyProvider}
                  onChange={(event) => setWarrantyProvider(event.target.value)}
                />
                <Input
                  label="URL do documento"
                  type="url"
                  value={warrantyUrl}
                  onChange={(event) => setWarrantyUrl(event.target.value)}
                />
                <Textarea
                  className="full"
                  label="Termos da garantia"
                  value={warrantyTerms}
                  onChange={(event) => setWarrantyTerms(event.target.value)}
                />
                <Textarea
                  className="full"
                  label="Observações da garantia"
                  value={warrantyObservations}
                  onChange={(event) => setWarrantyObservations(event.target.value)}
                />
              </div>
            )}
          </section>
          {submitError && (
            <p className="form-submit-error" role="alert">
              {submitError}
            </p>
          )}
          <div className="form-actions">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => navigate(`/maintenance/${plan.id}`)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando…' : 'Confirmar conclusão'}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
