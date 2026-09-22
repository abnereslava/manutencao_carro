import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Ban,
  Calendar,
  CircleHelp,
  Edit3,
  Gauge,
  Hammer,
  PackageOpen,
  RefreshCw,
  RotateCcw,
  SearchCheck,
  ShieldCheck,
  Trash2,
  Wrench
} from 'lucide-react';
import { useData } from '../../app/providers/DataProvider';
import { getComponent } from '../../catalog/components/sandero';
import { positionLabel } from '../../catalog/positions/vehicle-positions';
import { PageHeader } from '../../components/layout/AppShell';
import { Badge, Button, Card, Collapse, Input, Modal, Select, Textarea } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { calculateWarrantyState } from '../../domain/warranty';
import { useDraft } from '../../hooks/useDraft';
import { formatDate, formatKm, formatMoney } from '../../lib/format';

interface PartEditDraft {
  name: string;
  manufacturer: string;
  brand: string;
  model: string;
  partCode: string;
  conditionAtInstall: 'new' | 'used' | 'reconditioned' | 'unknown';
  priorLifeKnown: boolean;
  initialConditionNotes: string;
  supplier: string;
  purchasePrice: string;
  observations: string;
}

function partDraft(part?: ReturnType<typeof useData>['data']['parts'][number]): PartEditDraft {
  return {
    name: part?.name ?? '',
    manufacturer: part?.manufacturer ?? '',
    brand: part?.brand ?? '',
    model: part?.model ?? '',
    partCode: part?.partCode ?? '',
    conditionAtInstall: part?.conditionAtInstall ?? 'unknown',
    priorLifeKnown: part?.priorLifeKnown ?? false,
    initialConditionNotes: part?.initialConditionNotes ?? '',
    supplier: part?.supplier ?? '',
    purchasePrice:
      part?.purchasePriceCents !== undefined
        ? (part.purchasePriceCents / 100).toFixed(2).replace('.', ',')
        : '',
    observations: part?.observations ?? ''
  };
}

function currencyToCents(value: string) {
  if (!value.trim()) return undefined;
  const normalized = value.includes(',') ? value.replace(/\./g, '').replace(',', '.') : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : Number.NaN;
}

function elapsedLabel(startDate?: string) {
  if (!startDate) return 'Informação insuficiente';
  const start = new Date(`${startDate}T12:00:00`);
  if (Number.isNaN(start.getTime())) return 'Informação insuficiente';
  const days = Math.max(0, Math.floor((Date.now() - start.getTime()) / 86_400_000));
  if (days < 30) return `${days} dia${days === 1 ? '' : 's'}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return `${years} ${years === 1 ? 'ano' : 'anos'}${remainingMonths ? ` e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}` : ''}`;
}

export function PartDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, setComponentNotApplicable, updatePart } = useData();
  const { toast } = useToast();
  const component = getComponent(id);
  const state = data.componentStates.find((item) => item.componentDefinitionId === id);
  const part = data.parts.find((item) => item.id === state?.currentPartInstanceId);
  const [editOpen, setEditOpen] = useState(false);
  const [applicabilityOpen, setApplicabilityOpen] = useState(false);
  const {
    value: editDraft,
    setValue: setEditDraft,
    status: draftStatus,
    hasDraft,
    clear: clearDraft,
    discard: discardDraft
  } = useDraft<PartEditDraft>(
    `edit-part-${part?.id ?? id ?? 'unknown'}`,
    partDraft(part),
    editOpen
  );
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const plans = data.maintenancePlans.filter((item) => item.componentDefinitionId === id);
  const activePlan = plans.find((plan) => plan.isActive);
  const componentParts = data.parts.filter((item) => item.componentDefinitionId === id);
  const relatedOccurrences = data.occurrences.filter((occurrence) =>
    occurrence.partActions.some((action) => action.componentDefinitionId === id)
  );
  const inspectionCount = part
    ? relatedOccurrences.reduce(
        (total, occurrence) =>
          total +
          occurrence.partActions.filter(
            (action) => action.action === 'inspected' && action.partInstanceId === part.id
          ).length,
        0
      )
    : undefined;
  const knownComponentCosts = componentParts
    .map((item) => item.purchasePriceCents)
    .filter((value): value is number => value !== undefined);
  const componentCost = knownComponentCosts.length
    ? knownComponentCosts.reduce((total, value) => total + value, 0)
    : undefined;
  const partWarranty = part
    ? data.warranties.find((warranty) => warranty.partInstanceId === part.id)
    : undefined;
  const partWarrantyState = partWarranty
    ? calculateWarrantyState(
        partWarranty,
        data.vehicle.currentOdometer,
        new Date().toISOString().slice(0, 10),
        data.settings.alertDaysThreshold,
        data.settings.alertKmThreshold
      )
    : undefined;
  const activeRecurrences = plans.filter((plan) => plan.isActive && plan.recurrenceType !== 'none');
  const actionUrl = (action?: 'installed' | 'replaced' | 'removed' | 'inspected' | 'repaired') => {
    const params = new URLSearchParams();
    if (component) params.set('component', component.id);
    if (action) params.set('action', action);
    return activePlan
      ? `/maintenance/${activePlan.id}/complete?${params.toString()}`
      : `/maintenance/new?${params.toString()}`;
  };
  const openEdit = () => {
    if (!hasDraft) setEditDraft(partDraft(part));
    setSubmitError('');
    setEditOpen(true);
  };
  const submitEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!part) return;
    const purchasePriceCents = currencyToCents(editDraft.purchasePrice);
    if (!editDraft.name.trim() || Number.isNaN(purchasePriceCents)) {
      setSubmitError('Informe um nome e um preço válido para a peça.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await updatePart(part.id, {
        name: editDraft.name,
        manufacturer: editDraft.manufacturer || undefined,
        brand: editDraft.brand || undefined,
        model: editDraft.model || undefined,
        partCode: editDraft.partCode || undefined,
        conditionAtInstall: editDraft.conditionAtInstall,
        priorLifeKnown: editDraft.priorLifeKnown,
        initialConditionNotes: editDraft.initialConditionNotes || undefined,
        supplier: editDraft.supplier || undefined,
        purchasePriceCents,
        observations: editDraft.observations
      });
      clearDraft();
      setEditOpen(false);
      toast('Peça atualizada.');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Não foi possível editar a peça.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const changeApplicability = async () => {
    if (!component || !state) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const markNotApplicable = state.state !== 'notApplicable';
      await setComponentNotApplicable(component.id, markNotApplicable);
      setApplicabilityOpen(false);
      toast(
        markNotApplicable
          ? 'Componente marcado como não aplicável.'
          : 'Componente voltou ao estado aplicável.'
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Não foi possível atualizar o componente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!component || !state)
    return (
      <Card className="not-found-card">
        <h2>Componente não encontrado</h2>
      </Card>
    );
  return (
    <>
      <PageHeader
        eyebrow={`Peças / ${component.system}`}
        title={component.name}
        description={`${component.category} · ${positionLabel(component.positionId)}`}
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft />
              Voltar
            </Button>
            {part && (
              <Button variant="secondary" onClick={openEdit}>
                <Edit3 />
                Editar peça
              </Button>
            )}
          </>
        }
      />
      <div className="detail-grid">
        <Card className="detail-card">
          <div className="detail-heading">
            <span
              className={`row-icon ${state.state === 'installed' ? 'success' : state.state === 'missing' ? 'danger' : ''}`}
            >
              {state.state === 'installed' ? <PackageOpen /> : <CircleHelp />}
            </span>
            <div>
              <span className="eyebrow">Estado do componente</span>
              <h2>
                {state.state === 'installed'
                  ? 'Peça instalada'
                  : state.state === 'missing'
                    ? 'Peça faltando'
                    : state.state === 'notApplicable'
                      ? 'Não se aplica'
                      : 'Sem informações'}
              </h2>
            </div>
            <Badge
              tone={
                state.state === 'installed'
                  ? 'success'
                  : state.state === 'missing'
                    ? 'danger'
                    : 'neutral'
              }
            >
              {component.isEssential ? 'Essencial' : 'Opcional'}
            </Badge>
          </div>
          <div className="part-operation-bar" aria-label="Ações do componente">
            {part ? (
              <>
                <Button variant="secondary" onClick={() => navigate(actionUrl('replaced'))}>
                  <RefreshCw />
                  Substituir
                </Button>
                <Button variant="secondary" onClick={() => navigate(actionUrl('removed'))}>
                  <Trash2 />
                  Remover/descartar
                </Button>
                <Button variant="secondary" onClick={() => navigate(actionUrl('inspected'))}>
                  <SearchCheck />
                  Inspecionar
                </Button>
                <Button variant="secondary" onClick={() => navigate(actionUrl('repaired'))}>
                  <Hammer />
                  Reparar
                </Button>
              </>
            ) : state.state === 'notApplicable' ? (
              <Button variant="secondary" onClick={() => setApplicabilityOpen(true)}>
                <RotateCcw />
                Tornar aplicável
              </Button>
            ) : (
              <>
                <Button onClick={() => navigate(actionUrl('installed'))}>
                  <PackageOpen />
                  Instalar peça
                </Button>
                <Button variant="secondary" onClick={() => setApplicabilityOpen(true)}>
                  <Ban />
                  Não se aplica
                </Button>
              </>
            )}
            {state.state !== 'notApplicable' && (
              <Button variant="ghost" onClick={() => navigate(actionUrl())}>
                <Wrench />
                Registrar manutenção
              </Button>
            )}
          </div>
          {part ? (
            <>
              <div className="installed-part">
                <div>
                  <span>Peça atual</span>
                  <h3>{part.name}</h3>
                  <p>
                    {[part.brand, part.model, part.partCode].filter(Boolean).join(' · ') ||
                      'Marca não informada'}
                  </p>
                </div>
                <Badge tone="success">Em uso</Badge>
              </div>
              <dl className="details">
                <div>
                  <dt>Condição na instalação</dt>
                  <dd>{part.conditionAtInstall === 'new' ? 'Nova' : part.conditionAtInstall}</dd>
                </div>
                <div>
                  <dt>Data de instalação</dt>
                  <dd>{formatDate(part.installDate)}</dd>
                </div>
                <div>
                  <dt>KM na instalação</dt>
                  <dd>
                    {part.installOdometerKm !== undefined
                      ? formatKm(part.installOdometerKm)
                      : 'Desconhecida'}
                  </dd>
                </div>
                <div>
                  <dt>Custo</dt>
                  <dd>
                    {part.purchasePriceCents !== undefined
                      ? formatMoney(part.purchasePriceCents)
                      : 'Não informado'}
                  </dd>
                </div>
              </dl>
              <section className="part-indicators" aria-labelledby="part-indicators-title">
                <h3 id="part-indicators-title">Indicadores da peça</h3>
                <dl className="details">
                  <div>
                    <dt>Tempo desde a instalação</dt>
                    <dd>{elapsedLabel(part.installDate)}</dd>
                  </div>
                  <div>
                    <dt>KM desde a instalação</dt>
                    <dd>
                      {part.installOdometerKm !== undefined &&
                      data.vehicle.currentOdometer >= part.installOdometerKm
                        ? formatKm(data.vehicle.currentOdometer - part.installOdometerKm)
                        : 'Informação insuficiente'}
                    </dd>
                  </div>
                  <div>
                    <dt>Inspeções registradas</dt>
                    <dd>{inspectionCount}</dd>
                  </div>
                  <div>
                    <dt>Manutenções relacionadas</dt>
                    <dd>{relatedOccurrences.length}</dd>
                  </div>
                  <div>
                    <dt>Custo inicial</dt>
                    <dd>
                      {part.purchasePriceCents !== undefined
                        ? formatMoney(part.purchasePriceCents)
                        : 'Informação insuficiente'}
                    </dd>
                  </div>
                  <div>
                    <dt>Custo acumulado do componente</dt>
                    <dd>
                      {componentCost !== undefined
                        ? formatMoney(componentCost)
                        : 'Informação insuficiente'}
                    </dd>
                  </div>
                  <div>
                    <dt>Garantia atual</dt>
                    <dd>
                      {partWarranty
                        ? `${partWarrantyState === 'expired' ? 'Vencida' : partWarrantyState === 'upcoming' ? 'Próxima do vencimento' : 'Ativa'}${partWarranty.endDate ? ` até ${formatDate(partWarranty.endDate)}` : partWarranty.endOdometerKm !== undefined ? ` até ${formatKm(partWarranty.endOdometerKm)}` : ''}`
                        : 'Não informada'}
                    </dd>
                  </div>
                  <div>
                    <dt>Recorrências ativas</dt>
                    <dd>{activeRecurrences.length || 'Nenhuma'}</dd>
                  </div>
                </dl>
              </section>
              <Collapse title="Dados técnicos" defaultOpen>
                {component.technicalFieldSchema.length ? (
                  component.technicalFieldSchema.map((field) => (
                    <p key={field.id}>
                      <b>{field.label}:</b>{' '}
                      {part.technicalConditionData[field.id] ?? 'Não informado'} {field.unit}
                    </p>
                  ))
                ) : (
                  <p>Este componente não possui campos técnicos específicos.</p>
                )}
              </Collapse>
              <Collapse title="Observações">
                <p>{part.observations || 'Nenhuma observação.'}</p>
              </Collapse>
            </>
          ) : (
            <div className="component-empty">
              <CircleHelp />
              <h3>Nenhuma peça vinculada</h3>
              <p>O estado pode ser atualizado ao concluir uma manutenção relacionada.</p>
            </div>
          )}
        </Card>
        <aside className="detail-side">
          <Card className="side-card">
            <span className="eyebrow">Planos relacionados</span>
            {plans.length ? (
              plans.map((plan) => (
                <div className="related-plan" key={plan.id}>
                  <Wrench />
                  <div>
                    <b>{plan.title}</b>
                    <span>
                      {plan.nextDueKm ? formatKm(plan.nextDueKm) : formatDate(plan.nextDueDate)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p>Nenhum plano relacionado.</p>
            )}
          </Card>
          <Card className="side-card">
            <span className="eyebrow">Garantia e contexto</span>
            {part &&
              data.warranties
                .filter((item) => item.partInstanceId === part.id)
                .map((warranty) => (
                  <div className="related-plan" key={warranty.id}>
                    <ShieldCheck />
                    <div>
                      <b>{warranty.provider}</b>
                      <span>Até {formatDate(warranty.endDate)}</span>
                    </div>
                  </div>
                ))}
            <div className="related-plan">
              <Calendar />
              <div>
                <b>Posição</b>
                <span>{positionLabel(component.positionId)}</span>
              </div>
            </div>
            <div className="related-plan">
              <Gauge />
              <div>
                <b>Sistema</b>
                <span>{component.system}</span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
      <Modal
        open={editOpen}
        onClose={() => !isSubmitting && setEditOpen(false)}
        title="Editar peça atual"
        size="wide"
      >
        <form onSubmit={submitEdit}>
          <div className="form-grid">
            <Input
              className="full"
              label="Nome"
              required
              value={editDraft.name}
              onChange={(event) => setEditDraft({ ...editDraft, name: event.target.value })}
            />
            <Input
              label="Fabricante"
              value={editDraft.manufacturer}
              onChange={(event) => setEditDraft({ ...editDraft, manufacturer: event.target.value })}
            />
            <Input
              label="Marca"
              value={editDraft.brand}
              onChange={(event) => setEditDraft({ ...editDraft, brand: event.target.value })}
            />
            <Input
              label="Modelo"
              value={editDraft.model}
              onChange={(event) => setEditDraft({ ...editDraft, model: event.target.value })}
            />
            <Input
              label="Código"
              value={editDraft.partCode}
              onChange={(event) => setEditDraft({ ...editDraft, partCode: event.target.value })}
            />
            <Select
              label="Condição na instalação"
              value={editDraft.conditionAtInstall}
              onChange={(event) =>
                setEditDraft({
                  ...editDraft,
                  conditionAtInstall: event.target.value as PartEditDraft['conditionAtInstall']
                })
              }
            >
              <option value="new">Nova</option>
              <option value="used">Usada</option>
              <option value="reconditioned">Recondicionada</option>
              <option value="unknown">Desconhecida</option>
            </Select>
            <Input
              label="Fornecedor"
              value={editDraft.supplier}
              onChange={(event) => setEditDraft({ ...editDraft, supplier: event.target.value })}
            />
            <Input
              label="Preço de compra (R$)"
              inputMode="decimal"
              value={editDraft.purchasePrice}
              onChange={(event) =>
                setEditDraft({ ...editDraft, purchasePrice: event.target.value })
              }
            />
            <label className="checkbox-field full">
              <input
                type="checkbox"
                checked={editDraft.priorLifeKnown}
                onChange={(event) =>
                  setEditDraft({ ...editDraft, priorLifeKnown: event.target.checked })
                }
              />
              Vida útil anterior conhecida
            </label>
            <Textarea
              className="full"
              label="Estado inicial"
              value={editDraft.initialConditionNotes}
              onChange={(event) =>
                setEditDraft({ ...editDraft, initialConditionNotes: event.target.value })
              }
            />
            <Textarea
              className="full"
              label="Observações"
              value={editDraft.observations}
              onChange={(event) => setEditDraft({ ...editDraft, observations: event.target.value })}
            />
          </div>
          {submitError && (
            <p className="form-submit-error" role="alert">
              {submitError}
            </p>
          )}
          <div className="form-actions">
            <span className={`draft-status ${draftStatus}`}>
              {draftStatus === 'saving'
                ? 'Salvando rascunho…'
                : draftStatus === 'saved'
                  ? 'Rascunho salvo — você pode sair e retomar depois.'
                  : ''}
            </span>
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => {
                discardDraft();
                setEditOpen(false);
              }}
            >
              Descartar rascunho
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => setEditOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando…' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        open={applicabilityOpen}
        onClose={() => !isSubmitting && setApplicabilityOpen(false)}
        title={
          state.state === 'notApplicable'
            ? 'Tornar componente aplicável'
            : 'Marcar como não aplicável'
        }
      >
        <p>
          {state.state === 'notApplicable'
            ? component.isEssential
              ? 'O componente voltará como peça faltando e um alerta crítico será criado.'
              : 'O componente voltará como aplicável, ainda sem informações de peça.'
            : 'O componente deixará de gerar estado ou alerta de peça faltando. Esta opção é diferente de uma peça opcional ausente.'}
        </p>
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
            onClick={() => setApplicabilityOpen(false)}
          >
            Cancelar
          </Button>
          <Button type="button" disabled={isSubmitting} onClick={changeApplicability}>
            {isSubmitting ? 'Salvando…' : 'Confirmar'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
