import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CarFront,
  CheckCircle2,
  FileWarning,
  Gauge,
  PackageX,
  Plus,
  Receipt,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useData } from '../../app/providers/DataProvider';
import { getComponent } from '../../catalog/components/sandero';
import { PageHeader } from '../../components/layout/AppShell';
import { Badge, Button, Card } from '../../components/ui';
import { OdometerModal } from '../vehicle/OdometerModal';
import { formatDate, formatKm, formatMoney } from '../../lib/format';
import { calculateExpense, sumExpenses } from '../../domain/expenses';

export function DashboardPage() {
  const { data } = useData();
  const [odometerOpen, setOdometerOpen] = useState(false);
  const overdue = data.maintenancePlans.filter((item) => item.status === 'overdue');
  const upcoming = data.maintenancePlans.filter((item) => item.status === 'upcoming');
  const missing = data.componentStates.filter((item) => item.state === 'missing');
  const openIssues = data.issues.filter((item) => !['resolved', 'ignored'].includes(item.status));
  const yearCosts = sumExpenses(
    data.occurrences.map((item) => item.expense).filter((expense) => expense !== undefined)
  );
  return (
    <>
      <PageHeader
        eyebrow="Visão geral"
        title="Bom dia. Como anda o carango?"
        description="O que precisa da sua atenção agora, sem procurar em planilhas ou papéis."
        actions={
          <>
            <Button variant="secondary" onClick={() => setOdometerOpen(true)}>
              <Gauge />
              Atualizar KM
            </Button>
            <Link className="button primary" to="/maintenance/new">
              <Plus />
              Registrar manutenção
            </Link>
          </>
        }
      />
      <section className="hero-grid">
        <Card className="odometer-card">
          <span className="eyebrow">Quilometragem atual</span>
          <strong>
            {data.vehicle.currentOdometer.toLocaleString('pt-BR')}
            <small> km</small>
          </strong>
          <div className="meter">
            <i style={{ width: '68%' }} />
          </div>
          <p>
            <CarFront />
            Renault Sandero Expression · 2012
          </p>
        </Card>
        <div className="critical-grid">
          <Link to="/parts?tab=missing">
            <Card className="stat-card danger">
              <PackageX />
              <span>Peças faltando</span>
              <strong>{missing.length}</strong>
              <small>
                {missing.length ? getComponent(missing[0].componentDefinitionId)?.name : 'Nenhuma'}
              </small>
            </Card>
          </Link>
          <Link to="/maintenance?tab=overdue">
            <Card className="stat-card warning">
              <CalendarClock />
              <span>Manutenções vencidas</span>
              <strong>{overdue.length}</strong>
              <small>{overdue[0]?.title ?? 'Tudo em dia'}</small>
            </Card>
          </Link>
          <Link to="/maintenance?tab=issues">
            <Card className="stat-card">
              <AlertTriangle />
              <span>Problemas abertos</span>
              <strong>{openIssues.length}</strong>
              <small>{openIssues[0]?.title ?? 'Nenhum problema'}</small>
            </Card>
          </Link>
        </div>
      </section>

      <div className="section-title">
        <h2>Na mira</h2>
        <Link to="/maintenance">
          Ver todas <ArrowRight />
        </Link>
      </div>
      <div className="maintenance-grid">
        {[...overdue, ...upcoming].slice(0, 3).map((plan) => {
          const component = getComponent(plan.componentDefinitionId);
          const kmLeft =
            plan.nextDueKm === undefined
              ? undefined
              : plan.nextDueKm - data.vehicle.currentOdometer;
          return (
            <Link key={plan.id} to={`/maintenance/${plan.id}`}>
              <Card className="maintenance-card interactive">
                <div>
                  <Badge
                    tone={plan.status === 'overdue' ? 'danger' : 'warning'}
                    icon={plan.status === 'overdue' ? <AlertTriangle /> : <CalendarClock />}
                  >
                    {plan.status === 'overdue' ? 'Vencida' : 'Próxima'}
                  </Badge>
                  <span className="card-kicker">{component?.system ?? 'Manutenção'}</span>
                </div>
                <h3>{plan.title}</h3>
                <p>{component?.name}</p>
                <div className="due-row">
                  <span>
                    <Gauge />
                    {plan.nextDueKm ? formatKm(plan.nextDueKm) : 'Sem limite de KM'}
                  </span>
                  <span>
                    <CalendarClock />
                    {formatDate(plan.nextDueDate)}
                  </span>
                </div>
                {kmLeft !== undefined && (
                  <small className={kmLeft < 0 ? 'negative' : ''}>
                    {kmLeft < 0
                      ? `${formatKm(Math.abs(kmLeft))} além do limite`
                      : `Faltam ${formatKm(kmLeft)}`}
                  </small>
                )}
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="dashboard-lower">
        <section>
          <div className="section-title">
            <h2>Problemas pendentes</h2>
            <Link to="/maintenance?tab=issues">Ver todos</Link>
          </div>
          <Card className="list-card">
            {openIssues.length ? (
              openIssues.map((issue) => (
                <div className="list-row" key={issue.id}>
                  <span className="row-icon danger">
                    <AlertTriangle />
                  </span>
                  <div>
                    <b>{issue.title}</b>
                    <small>
                      {getComponent(issue.componentDefinitionId)?.name} · identificado em{' '}
                      {formatDate(issue.identifiedDate)}
                    </small>
                  </div>
                  <Badge
                    tone={
                      issue.priority === 'urgent' || issue.priority === 'high'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {issue.priority === 'high' ? 'Alta' : issue.priority}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="inline-empty">
                <CheckCircle2 />
                Nenhum problema aberto.
              </div>
            )}
          </Card>
        </section>
        <section>
          <div className="section-title">
            <h2>Documentos e garantias</h2>
            <Link to="/documents">Ver documentos</Link>
          </div>
          <Card className="list-card">
            <div className="list-row">
              <span className="row-icon warning">
                <FileWarning />
              </span>
              <div>
                <b>
                  {data.documents.find((item) => item.status === 'pending')?.name ??
                    'Documentação em dia'}
                </b>
                <small>
                  Vence em{' '}
                  {formatDate(data.documents.find((item) => item.status === 'pending')?.dueDate)}
                </small>
              </div>
              <ArrowRight />
            </div>
            <div className="list-row">
              <span className="row-icon success">
                <ShieldCheck />
              </span>
              <div>
                <b>Garantia da bateria</b>
                <small>Válida até {formatDate(data.warranties[0]?.endDate)}</small>
              </div>
              <ArrowRight />
            </div>
          </Card>
        </section>
      </div>

      <div className="section-title">
        <h2>Gastos do veículo</h2>
        <Link to="/expenses">Abrir financeiro</Link>
      </div>
      <Card className="expense-summary">
        <div>
          <span>Total registrado</span>
          <strong>
            {formatMoney(
              yearCosts + data.documents.reduce((sum, item) => sum + (item.amountCents ?? 0), 0)
            )}
          </strong>
          <small>Manutenções e documentos</small>
        </div>
        <div className="expense-bars">
          <i style={{ width: '68%' }} />
          <i style={{ width: '44%' }} />
          <i style={{ width: '26%' }} />
        </div>
        <div className="recent-expense">
          <Receipt />
          <span>
            <b>Última manutenção</b>
            <small>
              {formatMoney(calculateExpense(data.occurrences[0].expense!).netAmountCents)} ·{' '}
              {formatDate(data.occurrences[0].performedDate)}
            </small>
          </span>
        </div>
      </Card>
      <OdometerModal open={odometerOpen} onClose={() => setOdometerOpen(false)} />
    </>
  );
}
