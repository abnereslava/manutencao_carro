import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  CarFront,
  CheckCircle2,
  CircleHelp,
  PackageOpen,
  Search,
  Wrench
} from 'lucide-react';
import { useData } from '../../app/providers/DataProvider';
import { SANDERO_COMPONENTS, SYSTEMS } from '../../catalog/components/sandero';
import { positionLabel, VEHICLE_POSITIONS } from '../../catalog/positions/vehicle-positions';
import { PageHeader } from '../../components/layout/AppShell';
import { Badge, Card, EmptyState, Select, Tabs } from '../../components/ui';
import { calculateWarrantyState } from '../../domain/warranty';
import { todayISO } from '../../lib/format';

const stateMeta = {
  installed: { label: 'Instalada', tone: 'success' as const, icon: CheckCircle2 },
  missing: { label: 'Faltando', tone: 'danger' as const, icon: AlertTriangle },
  unknown: { label: 'Sem informações', tone: 'neutral' as const, icon: CircleHelp },
  notApplicable: { label: 'Não se aplica', tone: 'neutral' as const, icon: CircleHelp }
};
export function PartsPage() {
  const { data } = useData();
  const location = useLocation();
  const initial =
    new URLSearchParams(location.search).get('tab') ??
    localStorage.getItem('carango-parts-tab') ??
    'car';
  const [tab, setTabState] = useState(initial);
  const [query, setQuery] = useState('');
  const [system, setSystem] = useState('');
  const [category, setCategory] = useState('');
  const [position, setPosition] = useState('');
  const [componentStatus, setComponentStatus] = useState('');
  const [withHistory, setWithHistory] = useState(false);
  const [withWarranty, setWithWarranty] = useState(false);
  const [warrantyUpcoming, setWarrantyUpcoming] = useState(false);
  const [withRecurrence, setWithRecurrence] = useState(false);
  const [withAlert, setWithAlert] = useState(false);
  const setTab = (value: string) => {
    setTabState(value);
    localStorage.setItem('carango-parts-tab', value);
  };
  const items = useMemo(
    () =>
      SANDERO_COMPONENTS.filter((component) => {
        const state = data.componentStates.find(
          (item) => item.componentDefinitionId === component.id
        );
        const componentParts = data.parts.filter(
          (part) => part.componentDefinitionId === component.id
        );
        const currentPart = componentParts.find((part) => part.id === state?.currentPartInstanceId);
        const warranties = currentPart
          ? data.warranties.filter((warranty) => warranty.partInstanceId === currentPart.id)
          : [];
        const hasUpcomingWarranty = warranties.some(
          (warranty) =>
            calculateWarrantyState(
              warranty,
              data.vehicle.currentOdometer,
              todayISO(),
              data.settings.alertDaysThreshold,
              data.settings.alertKmThreshold
            ) === 'upcoming'
        );
        const hasRecurrence = data.maintenancePlans.some(
          (plan) =>
            plan.componentDefinitionId === component.id &&
            plan.isActive &&
            plan.recurrenceType !== 'none'
        );
        const relatedPlanIds = new Set(
          data.maintenancePlans
            .filter((plan) => plan.componentDefinitionId === component.id)
            .map((plan) => plan.id)
        );
        const hasAlert = data.alerts.some(
          (alert) =>
            !alert.resolved &&
            !alert.hidden &&
            ((alert.sourceType === 'part' &&
              (alert.sourceId === component.id ||
                componentParts.some((part) => part.id === alert.sourceId))) ||
              (alert.sourceType === 'maintenance' && relatedPlanIds.has(alert.sourceId)))
        );
        const matches =
          `${component.name} ${component.system} ${component.category} ${positionLabel(component.positionId)} ${currentPart?.brand ?? ''} ${currentPart?.model ?? ''} ${currentPart?.partCode ?? ''}`
            .toLocaleLowerCase('pt-BR')
            .includes(query.toLocaleLowerCase('pt-BR'));
        return (
          matches &&
          (!system || component.system === system) &&
          (!category || component.category === category) &&
          (!position || component.positionId === position) &&
          (!componentStatus || state?.state === componentStatus) &&
          (!withHistory || componentParts.length > 0) &&
          (!withWarranty || warranties.length > 0) &&
          (!warrantyUpcoming || hasUpcomingWarranty) &&
          (!withRecurrence || hasRecurrence) &&
          (!withAlert || hasAlert) &&
          (tab !== 'missing' || state?.state === 'missing')
        );
      }),
    [
      category,
      componentStatus,
      data,
      position,
      query,
      system,
      tab,
      warrantyUpcoming,
      withAlert,
      withHistory,
      withRecurrence,
      withWarranty
    ]
  );
  const missingCount = data.componentStates.filter((item) => item.state === 'missing').length;
  const categories = [...new Set(SANDERO_COMPONENTS.map((component) => component.category))].sort(
    (a, b) => a.localeCompare(b, 'pt-BR')
  );
  const hasFilters = Boolean(
    query ||
    system ||
    category ||
    position ||
    componentStatus ||
    withHistory ||
    withWarranty ||
    warrantyUpcoming ||
    withRecurrence ||
    withAlert
  );
  return (
    <>
      <PageHeader
        eyebrow="Inventário técnico"
        title="Peças e componentes"
        description="Uma visão estrutural do que está instalado, faltando ou ainda precisa ser identificado."
      />
      <Tabs
        active={tab}
        onChange={setTab}
        items={[
          { id: 'car', label: 'Visão do carro' },
          { id: 'all', label: 'Todas as peças', count: SANDERO_COMPONENTS.length },
          { id: 'missing', label: 'Peças faltando', count: missingCount },
          { id: 'systems', label: 'Por sistema', count: SYSTEMS.length },
          { id: 'history', label: 'Histórico' }
        ]}
      />
      <div className="toolbar parts-toolbar">
        <label className="search">
          <Search />
          <input
            aria-label="Buscar peças"
            placeholder="Componente, marca, modelo, código, sistema ou posição"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <Select label="Sistema" value={system} onChange={(e) => setSystem(e.target.value)}>
          <option value="">Todos os sistemas</option>
          {SYSTEMS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Select label="Categoria" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Todas as categorias</option>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Select label="Posição" value={position} onChange={(e) => setPosition(e.target.value)}>
          <option value="">Todas as posições</option>
          {VEHICLE_POSITIONS.map((item) => (
            <option value={item.id} key={item.id}>
              {item.label}
            </option>
          ))}
        </Select>
        <Select
          label="Estado"
          value={componentStatus}
          onChange={(e) => setComponentStatus(e.target.value)}
        >
          <option value="">Todos os estados</option>
          <option value="installed">Instalada</option>
          <option value="missing">Faltando</option>
          <option value="unknown">Sem informações</option>
          <option value="notApplicable">Não se aplica</option>
        </Select>
        <div className="parts-filter-toggles" aria-label="Filtros adicionais">
          <label>
            <input
              type="checkbox"
              checked={withHistory}
              onChange={(e) => setWithHistory(e.target.checked)}
            />{' '}
            Possui histórico
          </label>
          <label>
            <input
              type="checkbox"
              checked={withWarranty}
              onChange={(e) => setWithWarranty(e.target.checked)}
            />{' '}
            Possui garantia
          </label>
          <label>
            <input
              type="checkbox"
              checked={warrantyUpcoming}
              onChange={(e) => setWarrantyUpcoming(e.target.checked)}
            />{' '}
            Garantia próxima
          </label>
          <label>
            <input
              type="checkbox"
              checked={withRecurrence}
              onChange={(e) => setWithRecurrence(e.target.checked)}
            />{' '}
            Possui recorrência
          </label>
          <label>
            <input
              type="checkbox"
              checked={withAlert}
              onChange={(e) => setWithAlert(e.target.checked)}
            />{' '}
            Possui alerta
          </label>
        </div>
      </div>
      {tab === 'car' && !hasFilters ? (
        <VehicleSystems />
      ) : tab === 'systems' && !hasFilters ? (
        <SystemsView />
      ) : tab === 'history' ? (
        <PartsHistory />
      ) : items.length ? (
        <div className="parts-grid">
          {items.map((component) => {
            const state = data.componentStates.find(
              (item) => item.componentDefinitionId === component.id
            )!;
            const current = data.parts.find((item) => item.id === state.currentPartInstanceId);
            const meta = stateMeta[state.state];
            const Icon = meta.icon;
            return (
              <Link key={component.id} to={`/parts/${component.id}`}>
                <Card className={`part-card interactive ${state.state}`}>
                  <div className="part-card-top">
                    <span className="part-system">{component.system}</span>
                    <Badge tone={meta.tone} icon={<Icon />}>
                      {meta.label}
                    </Badge>
                  </div>
                  <h3>{component.name}</h3>
                  <p>
                    {current
                      ? [current.brand, current.name].filter(Boolean).join(' · ')
                      : component.category}
                  </p>
                  <footer>
                    <span>{positionLabel(component.positionId)}</span>
                    {component.isEssential && <small>Essencial</small>}
                  </footer>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Nenhum componente encontrado"
          description="Limpe a busca ou escolha outro sistema."
        />
      )}
    </>
  );
}

function VehicleSystems() {
  const { data } = useData();
  return (
    <div className="vehicle-overview">
      <Card className="car-visual">
        <div className="car-silhouette">
          <CarFront />
          <span>Sandero</span>
        </div>
        <div className="car-legend">
          <span>
            <i className="ok" />
            Instalado
          </span>
          <span>
            <i className="unknown" />
            Sem informação
          </span>
          <span>
            <i className="danger" />
            Faltando
          </span>
        </div>
      </Card>
      <div className="system-summary">
        {SYSTEMS.slice(0, 8).map((system) => {
          const components = SANDERO_COMPONENTS.filter((item) => item.system === system);
          const installed = components.filter(
            (component) =>
              data.componentStates.find((item) => item.componentDefinitionId === component.id)
                ?.state === 'installed'
          ).length;
          const missing = components.filter(
            (component) =>
              data.componentStates.find((item) => item.componentDefinitionId === component.id)
                ?.state === 'missing'
          ).length;
          return (
            <Card key={system}>
              <Wrench />
              <div>
                <b>{system}</b>
                <span>
                  {installed} instalado{installed === 1 ? '' : 's'} · {components.length}{' '}
                  componentes
                </span>
              </div>
              {missing > 0 && <Badge tone="danger">{missing} faltando</Badge>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
function SystemsView() {
  return (
    <div className="system-groups">
      {SYSTEMS.map((system) => (
        <Card key={system}>
          <span className="row-icon">
            <Wrench />
          </span>
          <div>
            <h3>{system}</h3>
            <p>
              {SANDERO_COMPONENTS.filter((item) => item.system === system)
                .map((item) => item.name)
                .join(' · ')}
            </p>
          </div>
          <b>{SANDERO_COMPONENTS.filter((item) => item.system === system).length}</b>
        </Card>
      ))}
    </div>
  );
}
function PartsHistory() {
  const { data } = useData();
  return (
    <div className="timeline">
      {data.parts
        .filter((item) => item.installDate)
        .sort((a, b) => (b.installDate ?? '').localeCompare(a.installDate ?? ''))
        .map((part) => (
          <div className="timeline-item" key={part.id}>
            <span className="timeline-dot">
              <PackageOpen />
            </span>
            <div>
              <time>{part.installDate}</time>
              <h3>{part.name} instalada</h3>
              <p>
                {SANDERO_COMPONENTS.find((item) => item.id === part.componentDefinitionId)?.name} ·{' '}
                {part.installOdometerKm?.toLocaleString('pt-BR')} km
              </p>
            </div>
          </div>
        ))}
    </div>
  );
}
