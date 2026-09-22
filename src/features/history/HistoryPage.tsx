import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CircleDollarSign,
  FileText,
  Gauge,
  PackageOpen,
  Search,
  ShieldCheck,
  Stethoscope,
  Wrench
} from 'lucide-react';
import { useData } from '../../app/providers/DataProvider';
import { SANDERO_COMPONENTS } from '../../catalog/components/sandero';
import { positionLabel, VEHICLE_POSITIONS } from '../../catalog/positions/vehicle-positions';
import { PageHeader } from '../../components/layout/AppShell';
import { Button, EmptyState, Input, Modal, Select, Tabs, Textarea } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { analyzeOccurrenceDependencies, deriveTimeline } from '../../domain/history';
import { formatDate, formatKm, todayISO } from '../../lib/format';
import { WarrantyManager } from '../warranties/WarrantyManager';

function matchesPeriod(date: string, period: string) {
  const today = todayISO();
  if (period === 'all') return true;
  if (period === 'current_year') return date.startsWith(today.slice(0, 4));
  if (period === 'current_month') return date.startsWith(today.slice(0, 7));
  if (period === 'last_12_months') {
    const start = new Date(`${today}T12:00:00`);
    start.setFullYear(start.getFullYear() - 1);
    return date >= start.toISOString().slice(0, 10) && date <= today;
  }
  return period.startsWith('year:') ? date.startsWith(period.slice(5)) : true;
}

const categoryLabels: Record<string, string> = {
  maintenance: 'Manutenção',
  inspection: 'Inspeção',
  part: 'Peça',
  issue: 'Problema',
  document: 'Documento',
  warranty: 'Garantia',
  odometer: 'Quilometragem',
  expense: 'Gasto'
};

export function HistoryPage() {
  const { data, updateOccurrence, removeOccurrence } = useData();
  const { toast } = useToast();
  const [type, setType] = useState('all');
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState('all');
  const [system, setSystem] = useState('all');
  const [component, setComponent] = useState('all');
  const [part, setPart] = useState('all');
  const [position, setPosition] = useState('all');
  const [maintenance, setMaintenance] = useState('all');
  const [issue, setIssue] = useState('all');
  const [visible, setVisible] = useState(12);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [occurrenceForm, setOccurrenceForm] = useState({
    performedDate: '',
    odometerKm: '',
    workshopOrProvider: '',
    observations: ''
  });
  const [saving, setSaving] = useState(false);
  const [operationError, setOperationError] = useState('');
  const events = useMemo(() => deriveTimeline(data), [data]);
  const years = [...new Set(events.map((event) => event.date.slice(0, 4)))].sort().reverse();
  const systems = [...new Set(SANDERO_COMPONENTS.map((item) => item.system))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  );
  const normalizedQuery = query.toLocaleLowerCase('pt-BR');
  const deletingOccurrence = data.occurrences.find((item) => item.id === deleteId);
  const dependencyAnalysis = deleteId
    ? analyzeOccurrenceDependencies(data, deleteId)
    : { canDelete: false, dependencies: [] };
  const filtered = events.filter(
    (event) =>
      (type === 'all' || event.category === type) &&
      matchesPeriod(event.date, period) &&
      (system === 'all' || event.system === system) &&
      (component === 'all' || event.componentDefinitionId === component) &&
      (part === 'all' || event.partInstanceId === part) &&
      (position === 'all' || event.positionId === position) &&
      (maintenance === 'all' || event.maintenancePlanId === maintenance) &&
      (issue === 'all' || event.issueId === issue) &&
      `${event.title} ${event.detail} ${event.system ?? ''}`
        .toLocaleLowerCase('pt-BR')
        .includes(normalizedQuery)
  );
  const icon = (eventType?: string) =>
    eventType === 'odometer' ? (
      <Gauge />
    ) : eventType === 'maintenance' ? (
      <Wrench />
    ) : eventType === 'inspection' ? (
      <Stethoscope />
    ) : eventType === 'part' ? (
      <PackageOpen />
    ) : eventType === 'issue' ? (
      <AlertTriangle />
    ) : eventType === 'warranty' ? (
      <ShieldCheck />
    ) : eventType === 'expense' ? (
      <CircleDollarSign />
    ) : (
      <FileText />
    );

  const startEdit = (id: string) => {
    const occurrence = data.occurrences.find((item) => item.id === id);
    if (!occurrence) return;
    setOccurrenceForm({
      performedDate: occurrence.performedDate,
      odometerKm: String(occurrence.odometerKm),
      workshopOrProvider: occurrence.workshopOrProvider ?? '',
      observations: occurrence.observations
    });
    setOperationError('');
    setEditingId(id);
    setDeleteId(null);
  };
  const saveOccurrence = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setOperationError('');
    try {
      await updateOccurrence(editingId, {
        performedDate: occurrenceForm.performedDate,
        odometerKm: Number(occurrenceForm.odometerKm),
        workshopOrProvider: occurrenceForm.workshopOrProvider || undefined,
        observations: occurrenceForm.observations
      });
      setEditingId(null);
      toast('Ocorrência corrigida e relações pertinentes recalculadas.');
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : 'Não foi possível editar.');
    } finally {
      setSaving(false);
    }
  };
  const confirmOccurrenceRemoval = async () => {
    if (!deleteId) return;
    setSaving(true);
    setOperationError('');
    try {
      await removeOccurrence(deleteId);
      setDeleteId(null);
      toast('Ocorrência excluída com rollback seguro.');
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : 'Não foi possível excluir.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Memória do veículo"
        title="Histórico"
        description="Tudo o que aconteceu com o carro, em uma linha do tempo pesquisável."
      />
      <WarrantyManager />
      <div className="toolbar history-toolbar">
        <label className="search">
          <Search />
          <input
            aria-label="Buscar no histórico"
            placeholder="Buscar evento, peça ou manutenção"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <Tabs
          active={type}
          onChange={(value) => {
            setType(value);
            setVisible(12);
          }}
          items={[
            { id: 'all', label: 'Tudo', count: events.length },
            { id: 'maintenance', label: 'Manutenções' },
            { id: 'inspection', label: 'Inspeções' },
            { id: 'part', label: 'Peças' },
            { id: 'odometer', label: 'KM' },
            { id: 'issue', label: 'Problemas' },
            { id: 'document', label: 'Documentos' },
            { id: 'warranty', label: 'Garantias' },
            { id: 'expense', label: 'Gastos' }
          ]}
        />
      </div>
      <div className="history-filters">
        <Select label="Período" value={period} onChange={(event) => setPeriod(event.target.value)}>
          <option value="all">Todo o histórico</option>
          <option value="current_month">Mês atual</option>
          <option value="current_year">Ano atual</option>
          <option value="last_12_months">Últimos 12 meses</option>
          {years.map((year) => (
            <option value={`year:${year}`} key={year}>
              Ano {year}
            </option>
          ))}
        </Select>
        <Select label="Sistema" value={system} onChange={(event) => setSystem(event.target.value)}>
          <option value="all">Todos</option>
          {systems.map((value) => (
            <option value={value} key={value}>
              {value}
            </option>
          ))}
        </Select>
        <Select
          label="Componente"
          value={component}
          onChange={(event) => setComponent(event.target.value)}
        >
          <option value="all">Todos</option>
          {SANDERO_COMPONENTS.map((item) => (
            <option value={item.id} key={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        <Select label="Peça" value={part} onChange={(event) => setPart(event.target.value)}>
          <option value="all">Todas</option>
          {data.parts.map((item) => (
            <option value={item.id} key={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        <Select
          label="Posição"
          value={position}
          onChange={(event) => setPosition(event.target.value)}
        >
          <option value="all">Todas</option>
          {VEHICLE_POSITIONS.map((item) => (
            <option value={item.id} key={item.id}>
              {item.label}
            </option>
          ))}
        </Select>
        <Select
          label="Manutenção"
          value={maintenance}
          onChange={(event) => setMaintenance(event.target.value)}
        >
          <option value="all">Todas</option>
          {data.maintenancePlans.map((item) => (
            <option value={item.id} key={item.id}>
              {item.title}
            </option>
          ))}
        </Select>
        <Select label="Problema" value={issue} onChange={(event) => setIssue(event.target.value)}>
          <option value="all">Todos</option>
          {data.issues.map((item) => (
            <option value={item.id} key={item.id}>
              {item.title}
            </option>
          ))}
        </Select>
      </div>
      <p className="history-result-count">
        {filtered.length} evento{filtered.length === 1 ? '' : 's'} encontrado
        {filtered.length === 1 ? '' : 's'}
        {position !== 'all' ? ` em ${positionLabel(position)}` : ''}.
      </p>
      {filtered.length ? (
        <div className="timeline history-page">
          {filtered.slice(0, visible).map((event, index) => (
            <div className="timeline-item" key={event.id}>
              <span className={`timeline-dot ${event.category}`}>{icon(event.category)}</span>
              <div className="timeline-content">
                <div>
                  <time>{formatDate(event.date)}</time>
                  <span>{categoryLabels[event.category ?? ''] ?? event.type}</span>
                </div>
                <h3>{event.title}</h3>
                <p>{event.detail}</p>
                {event.odometerKm !== undefined && (
                  <small>
                    <Gauge />
                    {formatKm(event.odometerKm)}
                  </small>
                )}
                {event.href && (
                  <Link className="history-source-link" to={event.href}>
                    Ver origem
                  </Link>
                )}
                {event.sourceType === 'maintenanceOccurrence' &&
                  (event.category === 'maintenance' || event.category === 'inspection') &&
                  event.sourceId && (
                    <div className="history-event-actions">
                      <Button variant="secondary" onClick={() => startEdit(event.sourceId!)}>
                        Editar ocorrência
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setOperationError('');
                          setDeleteId(event.sourceId!);
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  )}
              </div>
              {index === 0 && <span className="latest-label">Mais recente</span>}
            </div>
          ))}
          {visible < filtered.length && (
            <button className="load-more" onClick={() => setVisible((value) => value + 12)}>
              Carregar mais eventos
            </button>
          )}
        </div>
      ) : (
        <EmptyState title="Nenhum evento encontrado" description="Tente outro termo ou filtro." />
      )}
      <Modal
        open={!!editingId}
        onClose={() => setEditingId(null)}
        title="Editar ocorrência"
        size="wide"
      >
        <form onSubmit={saveOccurrence}>
          <div className="form-grid">
            <Input
              label="Data da ocorrência"
              type="date"
              required
              value={occurrenceForm.performedDate}
              onChange={(event) =>
                setOccurrenceForm({ ...occurrenceForm, performedDate: event.target.value })
              }
            />
            <Input
              label="Quilometragem da ocorrência"
              type="number"
              min="0"
              required
              value={occurrenceForm.odometerKm}
              onChange={(event) =>
                setOccurrenceForm({ ...occurrenceForm, odometerKm: event.target.value })
              }
            />
            <Input
              className="full"
              label="Oficina / prestador"
              value={occurrenceForm.workshopOrProvider}
              onChange={(event) =>
                setOccurrenceForm({ ...occurrenceForm, workshopOrProvider: event.target.value })
              }
            />
            <Textarea
              className="full"
              label="Observações da ocorrência"
              value={occurrenceForm.observations}
              onChange={(event) =>
                setOccurrenceForm({ ...occurrenceForm, observations: event.target.value })
              }
            />
          </div>
          <div className="history-impact-note">
            Data e KM serão propagados apenas ao ciclo deste plano, peças, garantias, problemas e
            gastos vinculados diretamente a esta ocorrência.
          </div>
          {operationError && <p className="field-error">{operationError}</p>}
          <div className="form-actions">
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={() => setEditingId(null)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar correção'}
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Excluir ocorrência"
        size="wide"
      >
        <p>
          {deletingOccurrence
            ? `Ocorrência de ${formatDate(deletingOccurrence.performedDate)} em ${formatKm(deletingOccurrence.odometerKm)}.`
            : 'Ocorrência não encontrada.'}
        </p>
        <div className="dependency-list">
          {dependencyAnalysis.dependencies.length ? (
            dependencyAnalysis.dependencies.map((dependency) => (
              <div className={dependency.blocking ? 'blocking' : ''} key={dependency.id}>
                <b>{dependency.blocking ? 'Bloqueia exclusão' : 'Será recomposto'}</b>
                <span>{dependency.label}</span>
              </div>
            ))
          ) : (
            <p>Nenhuma dependência adicional foi encontrada.</p>
          )}
        </div>
        {!dependencyAnalysis.canDelete && (
          <p className="field-error">
            Este registro possui eventos posteriores ou relações ambíguas. Corrija o histórico antes
            de excluí-lo.
          </p>
        )}
        {operationError && <p className="field-error">{operationError}</p>}
        <div className="form-actions">
          <Button variant="ghost" disabled={saving} onClick={() => setDeleteId(null)}>
            Cancelar
          </Button>
          {!dependencyAnalysis.canDelete && deleteId && (
            <Button variant="secondary" disabled={saving} onClick={() => startEdit(deleteId)}>
              Editar ocorrência
            </Button>
          )}
          {dependencyAnalysis.canDelete && (
            <Button
              variant="danger"
              disabled={saving}
              onClick={() => void confirmOccurrenceRemoval()}
            >
              {saving ? 'Excluindo…' : 'Confirmar exclusão'}
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
}
