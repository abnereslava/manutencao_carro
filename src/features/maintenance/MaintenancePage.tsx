import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarCheck,
  CalendarClock,
  Gauge,
  Plus,
  Search,
  Wrench
} from 'lucide-react';
import { useData } from '../../app/providers/DataProvider';
import { getComponent, SANDERO_COMPONENTS } from '../../catalog/components/sandero';
import { PageHeader } from '../../components/layout/AppShell';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Select,
  Tabs,
  Textarea
} from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { usePersistentState } from '../../hooks/usePersistentState';
import { useDraft } from '../../hooks/useDraft';
import { formatDate, formatKm, todayISO } from '../../lib/format';
import type { Issue } from '../../types/domain';

const labels = {
  overdue: 'Vencida',
  upcoming: 'Próxima',
  ok: 'Em dia',
  pending: 'Pendente',
  in_progress: 'Em andamento',
  archived: 'Arquivada'
} as const;
export function statusTone(status: string) {
  return status === 'overdue'
    ? 'danger'
    : status === 'upcoming'
      ? 'warning'
      : status === 'ok'
        ? 'success'
        : 'info';
}

export function MaintenancePage() {
  const { data } = useData();
  const location = useLocation();
  const requestedTab = new URLSearchParams(location.search).get('tab');
  const initialTab = requestedTab ?? 'all';
  const defaults = { tab: initialTab, query: '' };
  const {
    value: preferences,
    setValue: setPreferences,
    reset
  } = usePersistentState(
    'maintenance',
    defaults,
    data.settings.persistentFilters,
    requestedTab ? { tab: requestedTab } : undefined
  );
  const { tab, query } = preferences;
  const clearFilters = () => setPreferences({ ...preferences, query: '' });
  const plans = useMemo(
    () =>
      data.maintenancePlans.filter((item) => {
        const text =
          `${item.title} ${getComponent(item.componentDefinitionId)?.name ?? ''}`.toLocaleLowerCase(
            'pt-BR'
          );
        if (!text.includes(query.toLocaleLowerCase('pt-BR'))) return false;
        if (tab === 'all') return true;
        if (tab === 'issues') return false;
        if (tab === 'inspections') return item.type === 'inspection';
        if (tab === 'recurring') return item.recurrenceType !== 'none';
        return item.status === tab;
      }),
    [data.maintenancePlans, query, tab]
  );
  const counts = (status: string) =>
    data.maintenancePlans.filter((item) => item.status === status).length;
  return (
    <>
      <PageHeader
        eyebrow="Agenda técnica"
        title="Manutenções"
        description="Planos preventivos, inspeções e correções em um só lugar."
        actions={
          <Link className="button primary" to="/maintenance/new">
            <Plus />
            Nova manutenção
          </Link>
        }
      />
      <div className="toolbar">
        <label className="search">
          <Search />
          <input
            aria-label="Buscar manutenções"
            placeholder="Buscar manutenção ou componente"
            value={query}
            onChange={(e) => setPreferences({ ...preferences, query: e.target.value })}
          />
        </label>
        <Tabs
          active={tab}
          onChange={(value) => setPreferences({ ...preferences, tab: value })}
          items={[
            { id: 'all', label: 'Visão geral', count: data.maintenancePlans.length },
            { id: 'overdue', label: 'Vencidas', count: counts('overdue') },
            { id: 'upcoming', label: 'Próximas', count: counts('upcoming') },
            { id: 'pending', label: 'Pendentes', count: counts('pending') },
            { id: 'in_progress', label: 'Em andamento', count: counts('in_progress') },
            {
              id: 'inspections',
              label: 'Inspeções',
              count: data.maintenancePlans.filter((item) => item.type === 'inspection').length
            },
            { id: 'recurring', label: 'Recorrentes' },
            {
              id: 'issues',
              label: 'Problemas',
              count: data.issues.filter((item) => !['resolved', 'ignored'].includes(item.status))
                .length
            }
          ]}
        />
        <Button variant="secondary" onClick={clearFilters}>
          Limpar filtros
        </Button>
        <Button variant="ghost" onClick={reset}>
          Restaurar padrão
        </Button>
      </div>
      {tab === 'issues' ? (
        <IssuesList />
      ) : plans.length ? (
        <div className="data-list">
          {plans.map((plan) => (
            <Card className="data-row" key={plan.id}>
              <span className={`row-icon ${statusTone(plan.status)}`}>
                <Wrench />
              </span>
              <div className="data-main">
                <div>
                  <h3>{plan.title}</h3>
                  <Badge tone={statusTone(plan.status)}>{labels[plan.status]}</Badge>
                </div>
                <p>
                  {getComponent(plan.componentDefinitionId)?.system ?? 'Geral'} ·{' '}
                  {getComponent(plan.componentDefinitionId)?.name ?? plan.description}
                </p>
                <div className="meta-row">
                  <span>
                    <Gauge />
                    {plan.nextDueKm ? formatKm(plan.nextDueKm) : 'Sem limite de KM'}
                  </span>
                  <span>
                    <CalendarClock />
                    {formatDate(plan.nextDueDate)}
                  </span>
                </div>
              </div>
              <div className="row-actions">
                <Link className="button secondary" to={`/maintenance/${plan.id}`}>
                  Ver detalhes
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhuma manutenção encontrada"
          description="Ajuste os filtros ou cadastre um novo plano."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setPreferences({ tab: 'all', query: '' });
              }}
            >
              Limpar filtros
            </Button>
          }
        />
      )}
    </>
  );
}

interface IssueDraft {
  title: string;
  description: string;
  componentDefinitionId: string;
  relatedPartInstanceId: string;
  relatedMaintenancePlanId: string;
  priority: Issue['priority'];
  identifiedDate: string;
  identifiedOdometerKm: string;
  observations: string;
}

const issueStatusLabels: Record<Issue['status'], string> = {
  identified: 'Identificado',
  pending: 'Pendente',
  in_progress: 'Em andamento',
  postponed: 'Adiado',
  resolved: 'Resolvido',
  ignored: 'Não será feito'
};

const emptyIssueDraft = (odometer: number): IssueDraft => ({
  title: '',
  description: '',
  componentDefinitionId: '',
  relatedPartInstanceId: '',
  relatedMaintenancePlanId: '',
  priority: 'medium',
  identifiedDate: todayISO(),
  identifiedOdometerKm: String(odometer),
  observations: ''
});

function IssuesList() {
  const { data, saveIssue, setIssueStatus } = useData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Issue>();
  const initialIssueDraft = emptyIssueDraft(data.vehicle.currentOdometer);
  const {
    value: draft,
    setValue: setDraft,
    status: draftStatus,
    hasDraft,
    clear: clearDraft,
    discard: discardDraft
  } = useDraft<IssueDraft>('new-issue', initialIssueDraft, !selected);
  const [confirmStatus, setConfirmStatus] = useState<Issue['status']>();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const openIssue = (issue?: Issue) => {
    setSelected(issue);
    if (issue) {
      discardDraft();
      setDraft({
        title: issue.title,
        description: issue.description,
        componentDefinitionId: issue.componentDefinitionId ?? '',
        relatedPartInstanceId: issue.relatedPartInstanceIds?.[0] ?? '',
        relatedMaintenancePlanId: issue.relatedMaintenancePlanId ?? '',
        priority: issue.priority,
        identifiedDate: issue.identifiedDate,
        identifiedOdometerKm:
          issue.identifiedOdometerKm === undefined ? '' : String(issue.identifiedOdometerKm),
        observations: issue.observations
      });
    } else if (!hasDraft) setDraft(initialIssueDraft);
    setConfirmStatus(undefined);
    setError('');
    setOpen(true);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await saveIssue({
        id: selected?.id,
        title: draft.title,
        description: draft.description,
        componentDefinitionId: draft.componentDefinitionId || undefined,
        relatedPartInstanceIds: draft.relatedPartInstanceId
          ? [draft.relatedPartInstanceId]
          : undefined,
        relatedMaintenancePlanId: draft.relatedMaintenancePlanId || undefined,
        priority: draft.priority,
        status: selected?.status ?? 'identified',
        identifiedDate: draft.identifiedDate,
        identifiedOdometerKm:
          draft.identifiedOdometerKm === '' ? undefined : Number(draft.identifiedOdometerKm),
        observations: draft.observations
      });
      clearDraft();
      setDraft(initialIssueDraft);
      setOpen(false);
      toast(selected ? 'Problema atualizado.' : 'Problema registrado.');
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Não foi possível salvar o problema.'
      );
    } finally {
      setSaving(false);
    }
  };
  const transition = async (status: Issue['status']) => {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      await setIssueStatus(selected.id, status);
      setSelected({
        ...selected,
        status,
        resolvedDate: status === 'resolved' ? todayISO() : undefined
      });
      setConfirmStatus(undefined);
      toast(`Problema marcado como ${issueStatusLabels[status].toLocaleLowerCase('pt-BR')}.`);
      if (status === 'resolved' || status === 'ignored') setOpen(false);
    } catch (transitionError) {
      setError(
        transitionError instanceof Error
          ? transitionError.message
          : 'Não foi possível atualizar o problema.'
      );
    } finally {
      setSaving(false);
    }
  };
  const relatedParts = data.parts.filter(
    (part) =>
      !draft.componentDefinitionId || part.componentDefinitionId === draft.componentDefinitionId
  );
  const correctivePlans = data.maintenancePlans.filter((plan) => plan.type === 'corrective');

  return (
    <>
      <div className="section-toolbar">
        <div>
          <h2>Problemas</h2>
          <p>Registre defeitos e acompanhe cada decisão até a resolução.</p>
        </div>
        <Button onClick={() => openIssue()}>
          <Plus />
          Novo problema
        </Button>
      </div>
      {data.issues.length ? (
        <div className="data-list">
          {data.issues.map((issue) => (
            <Card className="data-row" key={issue.id}>
              <span
                className={`row-icon ${issue.status === 'resolved' || issue.status === 'ignored' ? 'success' : 'danger'}`}
              >
                <AlertTriangle />
              </span>
              <div className="data-main">
                <div>
                  <h3>{issue.title}</h3>
                  <Badge
                    tone={
                      issue.status === 'resolved' || issue.status === 'ignored'
                        ? 'success'
                        : issue.priority === 'high' || issue.priority === 'urgent'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {issueStatusLabels[issue.status]}
                  </Badge>
                </div>
                <p>{issue.description}</p>
                <div className="meta-row">
                  <span>
                    <CalendarCheck />
                    {formatDate(issue.identifiedDate)}
                  </span>
                  <span>{getComponent(issue.componentDefinitionId)?.name ?? 'Sem componente'}</span>
                </div>
              </div>
              <Button
                variant="secondary"
                aria-label={`Abrir problema ${issue.title}`}
                onClick={() => openIssue(issue)}
              >
                Abrir
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum problema registrado"
          description="Registre um problema para começar o acompanhamento."
        />
      )}
      <Modal
        open={open}
        onClose={() => {
          if (saving) return;
          if (selected) discardDraft();
          setOpen(false);
        }}
        title={selected ? selected.title : 'Novo problema'}
        size="wide"
      >
        <form onSubmit={submit}>
          {selected && (
            <div className="issue-status-panel">
              <div>
                <span>Estado atual</span>
                <Badge>{issueStatusLabels[selected.status]}</Badge>
              </div>
              <div className="issue-transition-actions">
                {!['resolved', 'ignored'].includes(selected.status) && (
                  <>
                    {selected.status !== 'in_progress' && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => transition('in_progress')}
                      >
                        Iniciar
                      </Button>
                    )}
                    {selected.status !== 'postponed' && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => transition('postponed')}
                      >
                        Adiar
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setConfirmStatus('resolved')}
                    >
                      Resolver
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setConfirmStatus('ignored')}
                    >
                      Não será feito
                    </Button>
                  </>
                )}
                {['resolved', 'ignored'].includes(selected.status) && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => transition('identified')}
                  >
                    Reabrir
                  </Button>
                )}
              </div>
              {confirmStatus && (
                <div className="issue-confirmation" role="alert">
                  <b>
                    {confirmStatus === 'resolved'
                      ? 'Confirmar resolução do problema?'
                      : 'Confirmar que este problema não será executado?'}
                  </b>
                  <p>Esta decisão ficará registrada no histórico.</p>
                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setConfirmStatus(undefined)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      disabled={saving}
                      onClick={() => transition(confirmStatus)}
                    >
                      Confirmar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="form-grid">
            <Input
              className="full"
              label="Título"
              required
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
            <Textarea
              className="full"
              label="Descrição"
              required
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
            <Select
              label="Prioridade"
              value={draft.priority}
              onChange={(event) =>
                setDraft({ ...draft, priority: event.target.value as Issue['priority'] })
              }
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </Select>
            <Select
              label="Componente"
              value={draft.componentDefinitionId}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  componentDefinitionId: event.target.value,
                  relatedPartInstanceId: ''
                })
              }
            >
              <option value="">Sem componente</option>
              {SANDERO_COMPONENTS.map((component) => (
                <option value={component.id} key={component.id}>
                  {component.system} — {component.name}
                </option>
              ))}
            </Select>
            <Select
              label="Peça relacionada"
              value={draft.relatedPartInstanceId}
              onChange={(event) =>
                setDraft({ ...draft, relatedPartInstanceId: event.target.value })
              }
            >
              <option value="">Sem peça relacionada</option>
              {relatedParts.map((part) => (
                <option value={part.id} key={part.id}>
                  {part.name}
                </option>
              ))}
            </Select>
            <Select
              label="Manutenção corretiva"
              value={draft.relatedMaintenancePlanId}
              onChange={(event) =>
                setDraft({ ...draft, relatedMaintenancePlanId: event.target.value })
              }
            >
              <option value="">Sem manutenção relacionada</option>
              {correctivePlans.map((plan) => (
                <option value={plan.id} key={plan.id}>
                  {plan.title}
                </option>
              ))}
            </Select>
            <Input
              label="Data identificada"
              type="date"
              required
              value={draft.identifiedDate}
              onChange={(event) => setDraft({ ...draft, identifiedDate: event.target.value })}
            />
            <Input
              label="KM identificado"
              type="number"
              min="0"
              value={draft.identifiedOdometerKm}
              onChange={(event) => setDraft({ ...draft, identifiedOdometerKm: event.target.value })}
            />
            <Textarea
              className="full"
              label="Observações"
              value={draft.observations}
              onChange={(event) => setDraft({ ...draft, observations: event.target.value })}
            />
          </div>
          {error && (
            <p className="form-submit-error" role="alert">
              {error}
            </p>
          )}
          <div className="form-actions">
            {!selected && (
              <span className={`draft-status ${draftStatus}`}>
                {draftStatus === 'saving'
                  ? 'Salvando rascunho…'
                  : draftStatus === 'saved'
                    ? 'Rascunho salvo — você pode sair e retomar depois.'
                    : ''}
              </span>
            )}
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={() => {
                if (selected) discardDraft();
                setOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar problema'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
