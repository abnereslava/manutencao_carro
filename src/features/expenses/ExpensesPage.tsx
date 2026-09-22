import { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Edit3,
  Receipt,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { useData } from '../../app/providers/DataProvider';
import { getComponent } from '../../catalog/components/sandero';
import { PageHeader } from '../../components/layout/AppShell';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Select,
  Textarea
} from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { calculateExpense } from '../../domain/expenses';
import { usePersistentState } from '../../hooks/usePersistentState';
import { formatDate, formatMoney, todayISO } from '../../lib/format';
import type { MaintenanceOccurrence } from '../../types/domain';

type PeriodFilter =
  | 'history'
  | 'current_month'
  | 'current_year'
  | 'last_12_months'
  | `year:${string}`
  | `month:${string}`;
type Grouping = 'category' | 'maintenance' | 'component' | 'system' | 'month' | 'year';

interface FinancialRow {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  gross: number;
  refunded: number;
  net: number;
  categories: Record<string, number>;
  maintenanceId?: string;
  componentId?: string;
  componentLabel: string;
  systemLabel: string;
  occurrence?: MaintenanceOccurrence;
}

function parseMoneyToCents(value: string) {
  const normalized = value.trim().replace(/\./g, '').replace(',', '.');
  return Math.round(Number(normalized) * 100);
}

function matchesPeriod(date: string, period: PeriodFilter, today: string) {
  if (period === 'history') return true;
  if (period === 'current_month') return date.slice(0, 7) === today.slice(0, 7);
  if (period === 'current_year') return date.slice(0, 4) === today.slice(0, 4);
  if (period.startsWith('year:')) return date.slice(0, 4) === period.slice(5);
  if (period.startsWith('month:')) return date.slice(0, 7) === period.slice(6);
  const end = new Date(`${today}T12:00:00`);
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 1);
  const parsed = new Date(`${date}T12:00:00`);
  return parsed >= start && parsed <= end;
}

export function ExpensesPage() {
  const { data, saveRefund, removeRefund } = useData();
  const { toast } = useToast();
  const today = todayISO();
  const defaults = {
    period: 'history' as PeriodFilter,
    grouping: 'category' as Grouping,
    category: 'all',
    system: 'all',
    component: 'all',
    maintenance: 'all'
  };
  const {
    value: preferences,
    setValue: setPreferences,
    reset
  } = usePersistentState('expenses', defaults, data.settings.persistentFilters);
  const { period, grouping, category, system, component, maintenance } = preferences;
  const setPreference = <K extends keyof typeof preferences>(
    key: K,
    value: (typeof preferences)[K]
  ) => setPreferences({ ...preferences, [key]: value });
  const clearFilters = () => setPreferences({ ...defaults, grouping: preferences.grouping });
  const [selected, setSelected] = useState<FinancialRow | null>(null);
  const [refundType, setRefundType] = useState<'partial' | 'full'>('partial');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundNotes, setRefundNotes] = useState('');
  const [refundError, setRefundError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const rows = useMemo<FinancialRow[]>(() => {
    const maintenanceRows = data.occurrences
      .map((occurrence) => {
        const amount = calculateExpense(occurrence.expense);
        const plan = data.maintenancePlans.find((item) => item.id === occurrence.maintenancePlanId);
        const componentIds = [
          plan?.componentDefinitionId,
          ...occurrence.partActions.map((action) => action.componentDefinitionId)
        ].filter((id, index, values): id is string => Boolean(id) && values.indexOf(id) === index);
        const primaryComponent =
          componentIds.length === 1 ? getComponent(componentIds[0]) : undefined;
        const calculatedCategories: Record<string, number> = {
          Peças: occurrence.expense?.partsTotalCents ?? 0,
          'Mão de obra': occurrence.expense?.laborCostCents ?? 0,
          Outros: occurrence.expense?.otherCostCents ?? 0
        };
        const manualAdjustment = amount.grossAmountCents - amount.calculatedTotalCents;
        if (manualAdjustment) calculatedCategories['Ajuste manual'] = manualAdjustment;
        return {
          id: occurrence.id,
          date: occurrence.performedDate,
          title: plan?.title ?? 'Manutenção removida',
          subtitle: occurrence.workshopOrProvider || 'Sem prestador informado',
          gross: amount.grossAmountCents,
          refunded: amount.refundedAmountCents,
          net: amount.netAmountCents,
          categories: calculatedCategories,
          maintenanceId: plan?.id,
          componentId: primaryComponent?.id,
          componentLabel:
            componentIds.length > 1
              ? 'Vários componentes'
              : (primaryComponent?.name ?? 'Sem componente'),
          systemLabel:
            componentIds.length > 1 ? 'Vários sistemas' : (primaryComponent?.system ?? 'Geral'),
          occurrence
        } satisfies FinancialRow;
      })
      .filter((row) => row.gross > 0 || row.refunded > 0);
    const documentRows = data.documents
      .filter(
        (document) =>
          (document.amountCents ?? 0) > 0 &&
          (document.status === 'paid' || document.status === 'active')
      )
      .map((document) => {
        const documentCategory =
          document.type === 'insurance'
            ? 'Seguro'
            : document.type === 'ipva'
              ? 'Impostos'
              : 'Documentos';
        return {
          id: document.id,
          date: document.issueDate ?? document.dueDate ?? `${document.referenceYear}-01-01`,
          title: document.name,
          subtitle: `${documentCategory} · ${document.referenceYear}`,
          gross: document.amountCents ?? 0,
          refunded: 0,
          net: document.amountCents ?? 0,
          categories: { [documentCategory]: document.amountCents ?? 0 },
          componentLabel: 'Sem componente',
          systemLabel: 'Documentos'
        } satisfies FinancialRow;
      });
    return [...maintenanceRows, ...documentRows].sort((a, b) => b.date.localeCompare(a.date));
  }, [data.documents, data.maintenancePlans, data.occurrences]);

  const categories = [...new Set(rows.flatMap((row) => Object.keys(row.categories)))].sort();
  const systems = [...new Set(rows.map((row) => row.systemLabel))].sort();
  const components = [...new Set(rows.map((row) => row.componentLabel))].sort();
  const years = [...new Set(rows.map((row) => row.date.slice(0, 4)))].sort().reverse();
  const months = [...new Set(rows.map((row) => row.date.slice(0, 7)))].sort().reverse();
  const plans = data.maintenancePlans
    .filter((plan) => rows.some((row) => row.maintenanceId === plan.id))
    .sort((a, b) => a.title.localeCompare(b.title));

  const filteredRows = rows.filter(
    (row) =>
      matchesPeriod(row.date, period, today) &&
      (category === 'all' || (row.categories[category] ?? 0) !== 0) &&
      (system === 'all' || row.systemLabel === system) &&
      (component === 'all' || row.componentLabel === component) &&
      (maintenance === 'all' || row.maintenanceId === maintenance)
  );
  const gross = filteredRows.reduce((sum, row) => sum + row.gross, 0);
  const refunded = filteredRows.reduce((sum, row) => sum + row.refunded, 0);
  const net = gross - refunded;

  const grouped = useMemo(() => {
    const values = new Map<string, number>();
    const add = (label: string, value: number) =>
      values.set(label, (values.get(label) ?? 0) + value);
    filteredRows.forEach((row) => {
      if (grouping === 'category') {
        Object.entries(row.categories).forEach(([label, value]) => add(label, value));
        if (row.refunded) add('Estornos', -row.refunded);
        return;
      }
      const label =
        grouping === 'maintenance'
          ? row.maintenanceId
            ? row.title
            : 'Documentos'
          : grouping === 'component'
            ? row.componentLabel
            : grouping === 'system'
              ? row.systemLabel
              : grouping === 'month'
                ? new Date(`${row.date.slice(0, 7)}-01T12:00:00`).toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric'
                  })
                : row.date.slice(0, 4);
      add(label, row.net);
    });
    return [...values.entries()].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  }, [filteredRows, grouping]);

  const openRefund = (row: FinancialRow) => {
    const status = row.occurrence?.expense?.refundStatus;
    setSelected(row);
    setRefundType(status === 'full' ? 'full' : 'partial');
    setRefundAmount(row.refunded ? (row.refunded / 100).toFixed(2).replace('.', ',') : '');
    setRefundNotes(row.occurrence?.expense?.refundNotes ?? '');
    setRefundError('');
    setConfirmRemove(false);
  };
  const closeRefund = () => {
    if (saving) return;
    setSelected(null);
    setConfirmRemove(false);
  };
  const submitRefund = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected?.occurrence) return;
    const amount = refundType === 'full' ? selected.gross : parseMoneyToCents(refundAmount);
    if (!Number.isFinite(amount)) {
      setRefundError('Informe um valor válido.');
      return;
    }
    if (refundType === 'partial' && amount >= selected.gross) {
      setRefundError('No estorno parcial, o valor deve ser menor que o original.');
      return;
    }
    setSaving(true);
    setRefundError('');
    try {
      await saveRefund(selected.occurrence.id, amount, refundNotes);
      toast(
        refundType === 'full' ? 'Estorno total sincronizado.' : 'Estorno parcial sincronizado.'
      );
      setSelected(null);
    } catch (error) {
      setRefundError(error instanceof Error ? error.message : 'Não foi possível salvar o estorno.');
    } finally {
      setSaving(false);
    }
  };
  const confirmRefundRemoval = async () => {
    if (!selected?.occurrence) return;
    setSaving(true);
    setRefundError('');
    try {
      await removeRefund(selected.occurrence.id);
      toast('Estorno removido e totais restaurados.');
      setSelected(null);
    } catch (error) {
      setRefundError(
        error instanceof Error ? error.message : 'Não foi possível remover o estorno.'
      );
    } finally {
      setSaving(false);
    }
  };
  const refundImpact = selected
    ? selected.gross -
      (refundType === 'full'
        ? selected.gross
        : Number.isFinite(parseMoneyToCents(refundAmount))
          ? parseMoneyToCents(refundAmount)
          : 0)
    : 0;

  return (
    <>
      <PageHeader
        eyebrow="Vida financeira"
        title="Gastos"
        description="Custos reais, estornos e onde o dinheiro foi parar."
      />
      <Card className="financial-filters">
        <Select
          label="Período"
          value={period}
          onChange={(event) => setPreference('period', event.target.value as PeriodFilter)}
        >
          <option value="history">Todo o histórico</option>
          <option value="current_month">Mês atual</option>
          <option value="current_year">Ano atual</option>
          <option value="last_12_months">Últimos 12 meses</option>
          {years.map((year) => (
            <option key={year} value={`year:${year}`}>
              Ano {year}
            </option>
          ))}
          {months.map((month) => (
            <option key={month} value={`month:${month}`}>
              {new Date(`${month}-01T12:00:00`).toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric'
              })}
            </option>
          ))}
        </Select>
        <Select
          label="Agrupar por"
          value={grouping}
          onChange={(event) => setPreference('grouping', event.target.value as Grouping)}
        >
          <option value="category">Categoria</option>
          <option value="maintenance">Manutenção</option>
          <option value="component">Peça / componente</option>
          <option value="system">Sistema</option>
          <option value="month">Mês</option>
          <option value="year">Ano</option>
        </Select>
        <Select
          label="Categoria"
          value={category}
          onChange={(event) => setPreference('category', event.target.value)}
        >
          <option value="all">Todas</option>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Select
          label="Sistema"
          value={system}
          onChange={(event) => setPreference('system', event.target.value)}
        >
          <option value="all">Todos</option>
          {systems.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Select
          label="Componente"
          value={component}
          onChange={(event) => setPreference('component', event.target.value)}
        >
          <option value="all">Todos</option>
          {components.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Select
          label="Manutenção"
          value={maintenance}
          onChange={(event) => setPreference('maintenance', event.target.value)}
        >
          <option value="all">Todas</option>
          {plans.map((plan) => (
            <option value={plan.id} key={plan.id}>
              {plan.title}
            </option>
          ))}
        </Select>
        <Button variant="secondary" onClick={clearFilters}>
          Limpar filtros
        </Button>
        <Button variant="ghost" onClick={reset}>
          Restaurar padrão
        </Button>
      </Card>
      <div className="money-cards">
        <Card>
          <span className="row-icon">
            <CircleDollarSign />
          </span>
          <div>
            <small>Gasto líquido</small>
            <strong>{formatMoney(net)}</strong>
            <span>Período filtrado</span>
          </div>
        </Card>
        <Card>
          <span className="row-icon warning">
            <ArrowUpRight />
          </span>
          <div>
            <small>Gasto bruto</small>
            <strong>{formatMoney(gross)}</strong>
            <span>Valor original</span>
          </div>
        </Card>
        <Card>
          <span className="row-icon success">
            <ArrowDownRight />
          </span>
          <div>
            <small>Total estornado</small>
            <strong>{formatMoney(refunded)}</strong>
            <span>Parcial + total</span>
          </div>
        </Card>
      </div>
      <div className="expense-layout">
        <Card className="expense-chart">
          <div className="section-title">
            <h2>Visão agrupada</h2>
            <span>{grouped.length} grupos</span>
          </div>
          {grouped.length ? (
            <div className="financial-groups">
              {grouped.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <b className={value < 0 ? 'negative' : ''}>{formatMoney(value)}</b>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sem gastos neste recorte"
              description="Altere os filtros ou registre uma despesa real."
            />
          )}
        </Card>
        <section>
          <div className="section-title">
            <h2>Histórico financeiro</h2>
            <span>{filteredRows.length} registros</span>
          </div>
          <Card className="list-card expense-list">
            {filteredRows.length ? (
              filteredRows.map((row) => {
                const status =
                  row.refunded === 0
                    ? 'Normal'
                    : row.net === 0
                      ? 'Estornada'
                      : 'Parcialmente estornada';
                return (
                  <div className="list-row financial-row" key={row.id}>
                    <span className="row-icon">
                      <Receipt />
                    </span>
                    <div>
                      <b>{row.title}</b>
                      <small>
                        {formatDate(row.date)} · {row.subtitle}
                      </small>
                      <span className="financial-values">
                        Original {formatMoney(row.gross)}
                        {row.refunded > 0 &&
                          ` · Estornado ${formatMoney(row.refunded)} · Líquido ${formatMoney(row.net)}`}
                      </span>
                    </div>
                    <div className="money-row">
                      <b>{formatMoney(row.net)}</b>
                      <Badge
                        tone={row.refunded === 0 ? 'neutral' : row.net === 0 ? 'danger' : 'warning'}
                      >
                        {row.refunded > 0 && <RotateCcw />}
                        {status}
                      </Badge>
                    </div>
                    {row.occurrence && row.gross > 0 && (
                      <Button variant="ghost" onClick={() => openRefund(row)}>
                        {row.refunded > 0 ? <Edit3 /> : <RotateCcw />}
                        {row.refunded > 0 ? 'Editar estorno' : 'Registrar estorno'}
                      </Button>
                    )}
                  </div>
                );
              })
            ) : (
              <EmptyState
                title="Nenhuma movimentação"
                description="Não existem gastos reais para os filtros selecionados."
              />
            )}
          </Card>
        </section>
      </div>
      <Modal
        open={Boolean(selected)}
        onClose={closeRefund}
        title={selected?.refunded ? 'Editar estorno' : 'Registrar estorno'}
      >
        {selected &&
          (confirmRemove ? (
            <div>
              <p>
                Remover o estorno restaura {formatMoney(selected.gross)} ao gasto líquido. A
                manutenção e seus fatos mecânicos permanecem inalterados.
              </p>
              {refundError && <p className="field-error">{refundError}</p>}
              <div className="form-actions">
                <Button variant="ghost" disabled={saving} onClick={() => setConfirmRemove(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  disabled={saving}
                  onClick={() => void confirmRefundRemoval()}
                >
                  {saving ? 'Removendo…' : 'Remover estorno'}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submitRefund}>
              <div className="refund-summary">
                <span>
                  Valor original <b>{formatMoney(selected.gross)}</b>
                </span>
                <span>
                  Impacto líquido <b>{formatMoney(Math.max(0, refundImpact))}</b>
                </span>
              </div>
              {selected.refunded > 0 && (
                <Button
                  className="refund-remove"
                  type="button"
                  variant="danger"
                  disabled={saving}
                  onClick={() => setConfirmRemove(true)}
                >
                  <Trash2 />
                  Remover
                </Button>
              )}
              <div className="form-grid">
                <Select
                  label="Tipo de estorno"
                  value={refundType}
                  onChange={(event) => setRefundType(event.target.value as 'partial' | 'full')}
                >
                  <option value="partial">Parcial</option>
                  <option value="full">Total</option>
                </Select>
                <Input
                  label="Valor estornado (R$)"
                  required={refundType === 'partial'}
                  disabled={refundType === 'full'}
                  inputMode="decimal"
                  value={
                    refundType === 'full'
                      ? (selected.gross / 100).toFixed(2).replace('.', ',')
                      : refundAmount
                  }
                  onChange={(event) => setRefundAmount(event.target.value)}
                  error={refundError}
                />
                <Textarea
                  className="full"
                  label="Observação do estorno"
                  value={refundNotes}
                  onChange={(event) => setRefundNotes(event.target.value)}
                />
              </div>
              <p className="form-note">
                O estorno altera somente os totais financeiros. Manutenção, peças, garantia e
                problemas não são desfeitos.
              </p>
              <div className="form-actions">
                <Button type="button" variant="ghost" disabled={saving} onClick={closeRefund}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Salvando…' : 'Salvar estorno'}
                </Button>
              </div>
            </form>
          ))}
      </Modal>
    </>
  );
}
