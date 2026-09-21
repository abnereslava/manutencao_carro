import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, CheckCircle2, Gauge, Wrench } from 'lucide-react';
import { useData } from '../../app/providers/DataProvider';
import { getComponent } from '../../catalog/components/sandero';
import { PageHeader } from '../../components/layout/AppShell';
import { Badge, Button, Card, Input, Modal } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { formatDate, formatKm, todayISO } from '../../lib/format';
import { statusTone } from './MaintenancePage';

export function MaintenanceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, completeMaintenance } = useData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [km, setKm] = useState(String(data.vehicle.currentOdometer));
  const [provider, setProvider] = useState('');
  const [cost, setCost] = useState('');
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
  const complete = (event: React.FormEvent) => {
    event.preventDefault();
    completeMaintenance(
      plan.id,
      date,
      Number(km),
      provider,
      Math.round(Number(cost.replace(',', '.')) * 100)
    );
    toast('Manutenção concluída e próximo ciclo recalculado.');
    setOpen(false);
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
      <Modal open={open} onClose={() => setOpen(false)} title="Concluir manutenção" size="wide">
        <form onSubmit={complete}>
          <div className="completion-preview">
            <b>Resumo da conclusão</b>
            <span>O próximo ciclo será calculado a partir da data e KM reais.</span>
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
              min={data.vehicle.currentOdometer}
              required
              value={km}
              onChange={(e) => setKm(e.target.value)}
            />
            <Input
              label="Oficina ou prestador"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            />
            <Input
              label="Custo total (R$)"
              inputMode="decimal"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Confirmar conclusão</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
