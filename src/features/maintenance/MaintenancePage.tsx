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
import { getComponent } from '../../catalog/components/sandero';
import { PageHeader } from '../../components/layout/AppShell';
import { Badge, Button, Card, EmptyState, Tabs } from '../../components/ui';
import { formatDate, formatKm } from '../../lib/format';

const labels = {
  overdue: 'Vencida',
  upcoming: 'Próxima',
  ok: 'Em dia',
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
  const initialTab = new URLSearchParams(location.search).get('tab') ?? 'all';
  const [tab, setTab] = useState(initialTab);
  const [query, setQuery] = useState('');
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
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <Tabs
          active={tab}
          onChange={setTab}
          items={[
            { id: 'all', label: 'Visão geral', count: data.maintenancePlans.length },
            { id: 'overdue', label: 'Vencidas', count: counts('overdue') },
            { id: 'upcoming', label: 'Próximas', count: counts('upcoming') },
            { id: 'in_progress', label: 'Em andamento', count: counts('in_progress') },
            { id: 'recurring', label: 'Recorrentes' },
            {
              id: 'issues',
              label: 'Problemas',
              count: data.issues.filter((item) => item.status !== 'resolved').length
            }
          ]}
        />
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
                setQuery('');
                setTab('all');
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

function IssuesList() {
  const { data } = useData();
  return (
    <div className="data-list">
      {data.issues.map((issue) => (
        <Card className="data-row" key={issue.id}>
          <span className="row-icon danger">
            <AlertTriangle />
          </span>
          <div className="data-main">
            <div>
              <h3>{issue.title}</h3>
              <Badge
                tone={
                  issue.priority === 'high' || issue.priority === 'urgent' ? 'danger' : 'warning'
                }
              >
                {issue.priority === 'high' ? 'Prioridade alta' : issue.priority}
              </Badge>
            </div>
            <p>{issue.description}</p>
            <div className="meta-row">
              <span>
                <CalendarCheck />
                {formatDate(issue.identifiedDate)}
              </span>
              <span>{getComponent(issue.componentDefinitionId)?.name}</span>
            </div>
          </div>
          <Button variant="secondary">Abrir</Button>
        </Card>
      ))}
    </div>
  );
}
