import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, CheckCircle2, Gauge, Wrench } from 'lucide-react';
import { useData } from '../../app/providers/DataProvider';
import { getComponent } from '../../catalog/components/sandero';
import { PageHeader } from '../../components/layout/AppShell';
import { Badge, Button, Card, Input, Modal, Textarea } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { calculateExpense } from '../../domain/expenses';
import { nextCycle } from '../../domain/maintenance';
import { formatDate, formatKm, formatMoney, todayISO } from '../../lib/format';
import { statusTone } from './MaintenancePage';

function currencyToCents(value: string): number {
  const normalized = value.includes(',') ? value.replace(/\./g, '').replace(',', '.') : value;
  const amount = Number(normalized || 0);
  return Number.isFinite(amount) ? Math.round(amount * 100) : Number.NaN;
}

export function MaintenanceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, completeMaintenance } = useData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [km, setKm] = useState(String(data.vehicle.currentOdometer));
  const [provider, setProvider] = useState('');
  const [observations, setObservations] = useState('');
  const [partsCost, setPartsCost] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [otherCost, setOtherCost] = useState('');
  const [manualOverrideEnabled, setManualOverrideEnabled] = useState(false);
  const [manualTotal, setManualTotal] = useState('');
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
  const component = getComponent(plan.componentDefinitionId);
  const history = data.occurrences.filter((item) => item.maintenancePlanId === plan.id);
  const preview = nextCycle(plan, Number(km || 0), date);
  const expense = {
    partsTotalCents: currencyToCents(partsCost),
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
        partActions: []
      });
      toast('Manutenção concluída e próximo ciclo recalculado.');
      setOpen(false);
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
        eyebrow="Manutenções / Detalhe"
        title={plan.title}
        description={plan.description || component?.name}
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft />
              Voltar
            </Button>
            <Button onClick={() => setOpen(true)}>
              <CheckCircle2 />
              Concluir manutenção
            </Button>
          </>
        }
      />
      <div className="detail-grid">
        <Card className="detail-card">
          <div className="detail-heading">
            <span className="row-icon warning">
              <Wrench />
            </span>
            <div>
              <span className="eyebrow">Estado atual</span>
              <h2>{plan.title}</h2>
            </div>
            <Badge tone={statusTone(plan.status)}>
              {plan.status === 'overdue'
                ? 'Vencida'
                : plan.status === 'upcoming'
                  ? 'Próxima'
                  : 'Em dia'}
            </Badge>
          </div>
          <dl className="details">
            <div>
              <dt>Componente</dt>
              <dd>{component?.name ?? 'Não vinculado'}</dd>
            </div>
            <div>
              <dt>Sistema</dt>
              <dd>{component?.system ?? 'Geral'}</dd>
            </div>
            <div>
              <dt>Prioridade</dt>
              <dd>{plan.priority}</dd>
            </div>
            <div>
              <dt>Recorrência</dt>
              <dd>{plan.recurrenceType === 'km_or_time' ? 'KM ou tempo' : plan.recurrenceType}</dd>
            </div>
          </dl>
          <div className="due-panels">
            <div>
              <Gauge />
              <span>Próximo KM</span>
              <b>{plan.nextDueKm ? formatKm(plan.nextDueKm) : '—'}</b>
            </div>
            <div>
              <CalendarClock />
              <span>Próxima data</span>
              <b>{formatDate(plan.nextDueDate)}</b>
            </div>
          </div>
        </Card>
        <Card className="side-card">
          <span className="eyebrow">Histórico do plano</span>
          <h2>
            {history.length} ocorrência{history.length === 1 ? '' : 's'}
          </h2>
          {history.map((item) => (
            <div className="history-mini" key={item.id}>
              <CheckCircle2 />
              <div>
                <b>Manutenção concluída</b>
                <span>
                  {formatDate(item.performedDate)} · {formatKm(item.odometerKm)}
                </span>
                <small>{item.workshopOrProvider}</small>
              </div>
            </div>
          ))}
          {!history.length && <p>Ainda não há conclusões registradas.</p>}
        </Card>
      </div>
      <Modal
        open={open}
        onClose={() => !isSubmitting && setOpen(false)}
        title="Concluir manutenção"
        size="wide"
      >
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
            <Input
              label="Custo das peças (R$)"
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
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando…' : 'Confirmar conclusão'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
