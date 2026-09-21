import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, CheckCircle2, Gauge, Wrench } from 'lucide-react';
import { useData } from '../../app/providers/DataProvider';
import { getComponent } from '../../catalog/components/sandero';
import { PageHeader } from '../../components/layout/AppShell';
import { Badge, Button, Card } from '../../components/ui';
import { formatDate, formatKm } from '../../lib/format';
import { statusTone } from './MaintenancePage';

export function MaintenanceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useData();
  const plan = data.maintenancePlans.find((item) => item.id === id);

  if (!plan) {
    return (
      <Card className="not-found-card">
        <h2>Manutenção não encontrada</h2>
        <Link to="/maintenance">Voltar à lista</Link>
      </Card>
    );
  }

  const component = getComponent(plan.componentDefinitionId);
  const history = data.occurrences.filter((item) => item.maintenancePlanId === plan.id);

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
            <Button onClick={() => navigate(`/maintenance/${plan.id}/complete`)}>
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
    </>
  );
}
