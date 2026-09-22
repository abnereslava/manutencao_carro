import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, CheckCircle2, Gauge, Wrench } from 'lucide-react';
import { useData } from '../../app/providers/DataProvider';
import { getComponent } from '../../catalog/components/sandero';
import { PageHeader } from '../../components/layout/AppShell';
import { Badge, Button, Card } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { formatDate, formatKm } from '../../lib/format';
import type { MaintenancePlan } from '../../types/domain';
import { statusTone } from './MaintenancePage';

const statusLabels = {
  overdue: 'Vencida',
  upcoming: 'Próxima',
  ok: 'Em dia',
  pending: 'Pendente',
  in_progress: 'Em andamento',
  archived: 'Arquivada'
} as const;

function recurrenceLabel(plan: MaintenancePlan) {
  if (plan.recurrenceType === 'none') return 'Sem recorrência';
  const intervals: string[] = [];
  if (plan.intervalKm) intervals.push(`a cada ${formatKm(plan.intervalKm)}`);
  if (plan.intervalDays) intervals.push(`a cada ${plan.intervalDays} dia(s)`);
  if (plan.intervalMonths) intervals.push(`a cada ${plan.intervalMonths} mês(es)`);
  if (plan.intervalYears) intervals.push(`a cada ${plan.intervalYears} ano(s)`);
  return intervals.join(' ou ') || 'Intervalo não informado';
}

export function MaintenanceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, setMaintenanceStatus } = useData();
  const { toast } = useToast();
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
            {plan.status !== 'archived' && (
              <Button
                variant="secondary"
                onClick={async () => {
                  const nextStatus = plan.status === 'pending' ? 'in_progress' : 'pending';
                  await setMaintenanceStatus(plan.id, nextStatus);
                  toast(
                    nextStatus === 'in_progress'
                      ? 'Manutenção iniciada.'
                      : 'Manutenção marcada como pendente.'
                  );
                }}
              >
                {plan.status === 'pending' ? 'Iniciar' : 'Marcar pendente'}
              </Button>
            )}
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
            <Badge tone={statusTone(plan.status)}>{statusLabels[plan.status]}</Badge>
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
              <dd>{recurrenceLabel(plan)}</dd>
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
