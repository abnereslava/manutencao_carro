import { useMemo, useState } from 'react';
import { AlertTriangle, FileText, Gauge, PackageOpen, Search, Wrench } from 'lucide-react';
import { useData } from '../../app/providers/DataProvider';
import { getComponent } from '../../catalog/components/sandero';
import { PageHeader } from '../../components/layout/AppShell';
import { EmptyState, Tabs } from '../../components/ui';
import { formatDate, formatKm } from '../../lib/format';
import type { TimelineEvent } from '../../types/domain';

export function HistoryPage() {
  const { data } = useData();
  const [type, setType] = useState('all');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(12);
  const events = useMemo<TimelineEvent[]>(
    () =>
      [
        ...data.odometer.map((item) => ({
          id: item.id,
          date: item.recordedDate,
          type: 'odometer',
          title: 'Quilometragem registrada',
          detail: item.observations || 'Leitura do odômetro',
          odometerKm: item.odometerKm
        })),
        ...data.occurrences.map((item) => ({
          id: item.id,
          date: item.performedDate,
          type: 'maintenance',
          title:
            data.maintenancePlans.find((plan) => plan.id === item.maintenancePlanId)?.title ??
            'Manutenção concluída',
          detail: item.workshopOrProvider ?? 'Prestador não informado',
          odometerKm: item.odometerKm
        })),
        ...data.parts
          .filter((item) => item.installDate)
          .map((item) => ({
            id: `${item.id}-install`,
            date: item.installDate!,
            type: 'part',
            title: `${item.name} instalada`,
            detail: getComponent(item.componentDefinitionId)?.name ?? '',
            odometerKm: item.installOdometerKm
          })),
        ...data.issues.map((item) => ({
          id: item.id,
          date: item.identifiedDate,
          type: 'issue',
          title: item.title,
          detail: `Problema ${item.status === 'resolved' ? 'resolvido' : 'identificado'}`,
          odometerKm: item.identifiedOdometerKm
        })),
        ...data.documents.map((item) => ({
          id: item.id,
          date: item.issueDate ?? `${item.referenceYear}-01-01`,
          type: 'document',
          title: item.name,
          detail: `Documento ${item.status}`
        }))
      ].sort((a, b) => b.date.localeCompare(a.date)),
    [data]
  );
  const filtered = events.filter(
    (event) =>
      (type === 'all' || event.type === type) &&
      `${event.title} ${event.detail}`
        .toLocaleLowerCase('pt-BR')
        .includes(query.toLocaleLowerCase('pt-BR'))
  );
  const icon = (eventType: string) =>
    eventType === 'odometer' ? (
      <Gauge />
    ) : eventType === 'maintenance' ? (
      <Wrench />
    ) : eventType === 'part' ? (
      <PackageOpen />
    ) : eventType === 'issue' ? (
      <AlertTriangle />
    ) : (
      <FileText />
    );
  return (
    <>
      <PageHeader
        eyebrow="Memória do veículo"
        title="Histórico"
        description="Tudo o que aconteceu com o carro, em uma linha do tempo pesquisável."
      />
      <div className="toolbar">
        <label className="search">
          <Search />
          <input
            aria-label="Buscar no histórico"
            placeholder="Buscar evento, peça ou manutenção"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <Tabs
          active={type}
          onChange={setType}
          items={[
            { id: 'all', label: 'Tudo', count: events.length },
            { id: 'maintenance', label: 'Manutenções' },
            { id: 'part', label: 'Peças' },
            { id: 'odometer', label: 'KM' },
            { id: 'issue', label: 'Problemas' },
            { id: 'document', label: 'Documentos' }
          ]}
        />
      </div>
      {filtered.length ? (
        <div className="timeline history-page">
          {filtered.slice(0, visible).map((event, index) => (
            <div className="timeline-item" key={event.id}>
              <span className={`timeline-dot ${event.type}`}>{icon(event.type)}</span>
              <div className="timeline-content">
                <div>
                  <time>{formatDate(event.date)}</time>
                  <span>{event.type}</span>
                </div>
                <h3>{event.title}</h3>
                <p>{event.detail}</p>
                {event.odometerKm !== undefined && (
                  <small>
                    <Gauge />
                    {formatKm(event.odometerKm)}
                  </small>
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
    </>
  );
}
