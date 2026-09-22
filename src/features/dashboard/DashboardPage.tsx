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
import { formatDate, formatKm, formatMoney, todayISO } from '../../lib/format';
import { calculateExpense, sumExpenses } from '../../domain/expenses';
import { calculateWarrantyState } from '../../domain/warranty';

export function DashboardPage() {
  const { data } = useData();
  const [odometerOpen, setOdometerOpen] = useState(false);
  const overdue = data.maintenancePlans.filter((item) => item.status === 'overdue');
  const upcoming = data.maintenancePlans.filter((item) => item.status === 'upcoming');
  const missing = data.componentStates.filter((item) => item.state === 'missing');
  const openIssues = data.issues.filter((item) => !['resolved', 'ignored'].includes(item.status));
  const today = todayISO();
  const overdueDocuments = data.documents.filter(
    (item) =>
      item.status === 'expired' ||
      (item.status === 'pending' && item.dueDate !== undefined && item.dueDate <= today)
  );
  const currentYear = today.slice(0, 4);
  const yearOccurrences = data.occurrences.filter((item) =>
    item.performedDate.startsWith(currentYear)
  );
  const yearDocuments = data.documents.filter(
    (item) =>
      (item.status === 'paid' || item.status === 'active') &&
      (item.issueDate ?? item.dueDate ?? `${item.referenceYear}`).startsWith(currentYear)
  );
  const yearCosts =
    sumExpenses(
      yearOccurrences.map((item) => item.expense).filter((expense) => expense !== undefined)
    ) + yearDocuments.reduce((sum, item) => sum + (item.amountCents ?? 0), 0);
  const latestOccurrence = [...data.occurrences].sort((a, b) =>
    b.performedDate.localeCompare(a.performedDate)
  )[0];
  const attentionDocument = [...data.documents]
    .filter((item) => item.status === 'pending' || item.status === 'expired')
    .sort((a, b) => (a.dueDate ?? '9999-12-31').localeCompare(b.dueDate ?? '9999-12-31'))[0];
  const attentionWarranty = data.warranties
    .map((warranty) => ({
      warranty,
      state: calculateWarrantyState(warranty, data.vehicle.currentOdometer, today)
    }))
    .filter((item) => item.state !== 'active')
    .sort((a, b) =>
      (a.warranty.endDate ?? '9999-12-31').localeCompare(b.warranty.endDate ?? '9999-12-31')
    )[0];
  const monthlyTotals = new Map<string, number>();
  yearOccurrences.forEach((occurrence) => {
    const month = occurrence.performedDate.slice(0, 7);
    monthlyTotals.set(
      month,
      (monthlyTotals.get(month) ?? 0) + calculateExpense(occurrence.expense).netAmountCents
    );
  });
  yearDocuments.forEach((document) => {
    const date = document.issueDate ?? document.dueDate ?? `${document.referenceYear}-01-01`;
    const month = date.slice(0, 7);
    monthlyTotals.set(month, (monthlyTotals.get(month) ?? 0) + (document.amountCents ?? 0));
  });
  const recentMonths = [...monthlyTotals.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6);
  const maxMonth = Math.max(...recentMonths.map(([, value]) => value), 1);
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
          <p>
            <CarFront />
            {data.vehicle.manufacturer} {data.vehicle.model} {data.vehicle.trim} ·{' '}
            {data.vehicle.modelYear}
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
          <Link to="/documents">
            <Card className={`stat-card ${overdueDocuments.length ? 'danger' : ''}`}>
              <FileWarning />
              <span>Documentos vencidos</span>
              <strong>{overdueDocuments.length}</strong>
              <small>{overdueDocuments[0]?.name ?? 'Nenhum vencido'}</small>
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
            {attentionDocument ? (
              <div className="list-row">
                <span className="row-icon warning">
                  <FileWarning />
                </span>
                <div>
                  <b>{attentionDocument.name}</b>
                  <small>
                    {attentionDocument.dueDate
                      ? `Vence em ${formatDate(attentionDocument.dueDate)}`
                      : 'Sem vencimento informado'}
                  </small>
                </div>
                <ArrowRight />
              </div>
            ) : (
              <div className="inline-empty">
                <CheckCircle2 />
                Nenhum documento pendente ou vencido.
              </div>
            )}
            {attentionWarranty ? (
              <div className="list-row">
                <span
                  className={`row-icon ${attentionWarranty.state === 'expired' ? 'danger' : 'warning'}`}
                >
                  <ShieldCheck />
                </span>
                <div>
                  <b>
                    {attentionWarranty.warranty.type === 'part'
                      ? (data.parts.find(
                          (part) => part.id === attentionWarranty.warranty.partInstanceId
                        )?.name ?? 'Garantia de peça')
                      : (data.maintenancePlans.find((plan) =>
                          data.occurrences.some(
                            (occurrence) =>
                              occurrence.id ===
                                attentionWarranty.warranty.maintenanceOccurrenceId &&
                              occurrence.maintenancePlanId === plan.id
                          )
                        )?.title ?? 'Garantia de serviço')}
                  </b>
                  <small>
                    {attentionWarranty.state === 'expired'
                      ? 'Garantia vencida'
                      : 'Próxima do vencimento'}
                    {attentionWarranty.warranty.endDate
                      ? ` · ${formatDate(attentionWarranty.warranty.endDate)}`
                      : ''}
                  </small>
                </div>
                <ArrowRight />
              </div>
            ) : (
              <div className="inline-empty">
                <CheckCircle2 />
                Nenhuma garantia vencida ou próxima.
              </div>
            )}
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
          <strong>{formatMoney(yearCosts)}</strong>
          <small>Manutenções e documentos em {currentYear}</small>
        </div>
        <div className="expense-bars">
          {recentMonths.length ? (
            recentMonths.map(([month, value]) => (
              <span key={month} title={`${month}: ${formatMoney(value)}`}>
                <i style={{ height: `${Math.max(8, Math.round((value / maxMonth) * 100))}%` }} />
                <small>{month.slice(5)}</small>
              </span>
            ))
          ) : (
            <small>Sem gastos em {currentYear}</small>
          )}
        </div>
        <div className="recent-expense">
          <Receipt />
          <span>
            <b>{latestOccurrence ? 'Última manutenção' : 'Nenhuma manutenção registrada'}</b>
            <small>
              {latestOccurrence
                ? `${formatMoney(
                    calculateExpense(latestOccurrence.expense).netAmountCents
                  )} · ${formatDate(latestOccurrence.performedDate)}`
                : 'Registre a primeira manutenção do veículo.'}
            </small>
          </span>
        </div>
      </Card>
      <OdometerModal open={odometerOpen} onClose={() => setOdometerOpen(false)} />
    </>
  );
}
