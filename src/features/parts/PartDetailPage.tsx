import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CircleHelp,
  Gauge,
  PackageOpen,
  ShieldCheck,
  Wrench
} from 'lucide-react';
import { useData } from '../../app/providers/DataProvider';
import { getComponent } from '../../catalog/components/sandero';
import { positionLabel } from '../../catalog/positions/vehicle-positions';
import { PageHeader } from '../../components/layout/AppShell';
import { Badge, Button, Card, Collapse } from '../../components/ui';
import { formatDate, formatKm, formatMoney } from '../../lib/format';

export function PartDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useData();
  const component = getComponent(id);
  const state = data.componentStates.find((item) => item.componentDefinitionId === id);
  const part = data.parts.find((item) => item.id === state?.currentPartInstanceId);
  const plans = data.maintenancePlans.filter((item) => item.componentDefinitionId === id);
  if (!component || !state)
    return (
      <Card className="not-found-card">
        <h2>Componente não encontrado</h2>
      </Card>
    );
  return (
    <>
      <PageHeader
        eyebrow={`Peças / ${component.system}`}
        title={component.name}
        description={`${component.category} · ${positionLabel(component.positionId)}`}
        actions={
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft />
            Voltar
          </Button>
        }
      />
      <div className="detail-grid">
        <Card className="detail-card">
          <div className="detail-heading">
            <span
              className={`row-icon ${state.state === 'installed' ? 'success' : state.state === 'missing' ? 'danger' : ''}`}
            >
              {state.state === 'installed' ? <PackageOpen /> : <CircleHelp />}
            </span>
            <div>
              <span className="eyebrow">Estado do componente</span>
              <h2>
                {state.state === 'installed'
                  ? 'Peça instalada'
                  : state.state === 'missing'
                    ? 'Peça faltando'
                    : state.state === 'notApplicable'
                      ? 'Não se aplica'
                      : 'Sem informações'}
              </h2>
            </div>
            <Badge
              tone={
                state.state === 'installed'
                  ? 'success'
                  : state.state === 'missing'
                    ? 'danger'
                    : 'neutral'
              }
            >
              {component.isEssential ? 'Essencial' : 'Opcional'}
            </Badge>
          </div>
          {part ? (
            <>
              <div className="installed-part">
                <div>
                  <span>Peça atual</span>
                  <h3>{part.name}</h3>
                  <p>
                    {[part.brand, part.model, part.partCode].filter(Boolean).join(' · ') ||
                      'Marca não informada'}
                  </p>
                </div>
                <Badge tone="success">Em uso</Badge>
              </div>
              <dl className="details">
                <div>
                  <dt>Condição na instalação</dt>
                  <dd>{part.conditionAtInstall === 'new' ? 'Nova' : part.conditionAtInstall}</dd>
                </div>
                <div>
                  <dt>Data de instalação</dt>
                  <dd>{formatDate(part.installDate)}</dd>
                </div>
                <div>
                  <dt>KM na instalação</dt>
                  <dd>
                    {part.installOdometerKm ? formatKm(part.installOdometerKm) : 'Desconhecida'}
                  </dd>
                </div>
                <div>
                  <dt>Custo</dt>
                  <dd>
                    {part.purchasePriceCents
                      ? formatMoney(part.purchasePriceCents)
                      : 'Não informado'}
                  </dd>
                </div>
              </dl>
              <Collapse title="Dados técnicos" defaultOpen>
                {component.technicalFieldSchema.length ? (
                  component.technicalFieldSchema.map((field) => (
                    <p key={field.id}>
                      <b>{field.label}:</b>{' '}
                      {part.technicalConditionData[field.id] ?? 'Não informado'} {field.unit}
                    </p>
                  ))
                ) : (
                  <p>Este componente não possui campos técnicos específicos.</p>
                )}
              </Collapse>
              <Collapse title="Observações">
                <p>{part.observations || 'Nenhuma observação.'}</p>
              </Collapse>
            </>
          ) : (
            <div className="component-empty">
              <CircleHelp />
              <h3>Nenhuma peça vinculada</h3>
              <p>O estado pode ser atualizado ao concluir uma manutenção relacionada.</p>
            </div>
          )}
        </Card>
        <aside className="detail-side">
          <Card className="side-card">
            <span className="eyebrow">Planos relacionados</span>
            {plans.length ? (
              plans.map((plan) => (
                <div className="related-plan" key={plan.id}>
                  <Wrench />
                  <div>
                    <b>{plan.title}</b>
                    <span>
                      {plan.nextDueKm ? formatKm(plan.nextDueKm) : formatDate(plan.nextDueDate)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p>Nenhum plano relacionado.</p>
            )}
          </Card>
          <Card className="side-card">
            <span className="eyebrow">Garantia e contexto</span>
            {part &&
              data.warranties
                .filter((item) => item.partInstanceId === part.id)
                .map((warranty) => (
                  <div className="related-plan" key={warranty.id}>
                    <ShieldCheck />
                    <div>
                      <b>{warranty.provider}</b>
                      <span>Até {formatDate(warranty.endDate)}</span>
                    </div>
                  </div>
                ))}
            <div className="related-plan">
              <Calendar />
              <div>
                <b>Posição</b>
                <span>{positionLabel(component.positionId)}</span>
              </div>
            </div>
            <div className="related-plan">
              <Gauge />
              <div>
                <b>Sistema</b>
                <span>{component.system}</span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
