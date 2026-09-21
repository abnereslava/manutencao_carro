import { useState } from 'react';
import { Edit3, Gauge, Plus, Trash2 } from 'lucide-react';
import { useData } from '../../app/providers/DataProvider';
import { PageHeader } from '../../components/layout/AppShell';
import { Badge, Button, Card, Input, Modal, Textarea } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { formatDate, formatKm } from '../../lib/format';
import type { Vehicle } from '../../types/domain';
import { OdometerModal } from './OdometerModal';

export function VehiclePage() {
  const { data, saveVehicle, removeOdometer } = useData();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [odoOpen, setOdoOpen] = useState(false);
  const [draft, setDraft] = useState<Vehicle>(data.vehicle);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    saveVehicle(draft);
    toast('Dados do veículo atualizados.');
    setEditing(false);
  };
  return (
    <>
      <PageHeader
        eyebrow="Seu veículo"
        title="Renault Sandero"
        description="Expression 1.6 8V Flex · 2012"
        actions={
          <Button onClick={() => setEditing(true)}>
            <Edit3 />
            Editar dados
          </Button>
        }
      />
      <div className="vehicle-page-grid">
        <Card className="vehicle-identity">
          <div className="vehicle-photo">
            <span>SANDERO</span>
            <div className="road" />
          </div>
          <div className="vehicle-title">
            <div>
              <span className="eyebrow">Quilometragem atual</span>
              <strong>{formatKm(data.vehicle.currentOdometer)}</strong>
            </div>
            <Badge tone="success">Em uso</Badge>
          </div>
          <dl className="details">
            <div>
              <dt>Fabricante</dt>
              <dd>{data.vehicle.manufacturer}</dd>
            </div>
            <div>
              <dt>Modelo</dt>
              <dd>{data.vehicle.model}</dd>
            </div>
            <div>
              <dt>Versão</dt>
              <dd>{data.vehicle.trim}</dd>
            </div>
            <div>
              <dt>Ano / modelo</dt>
              <dd>
                {data.vehicle.year} / {data.vehicle.modelYear}
              </dd>
            </div>
            <div>
              <dt>Motor</dt>
              <dd>{data.vehicle.engine}</dd>
            </div>
            <div>
              <dt>Combustível</dt>
              <dd>{data.vehicle.fuelType}</dd>
            </div>
            <div>
              <dt>Cor</dt>
              <dd>{data.vehicle.color || 'Não informada'}</dd>
            </div>
            <div>
              <dt>Placa</dt>
              <dd>{data.vehicle.plate || 'Não informada'}</dd>
            </div>
            <div>
              <dt>RENAVAM</dt>
              <dd>{data.vehicle.renavam || 'Não informado'}</dd>
            </div>
            <div>
              <dt>Chassi</dt>
              <dd>{data.vehicle.chassis || 'Não informado'}</dd>
            </div>
          </dl>
          <div className="vehicle-notes">
            <b>Observações</b>
            <p>{data.vehicle.observations || 'Nenhuma observação.'}</p>
          </div>
        </Card>
        <section>
          <div className="section-title first">
            <h2>Histórico de quilometragem</h2>
            <Button variant="secondary" onClick={() => setOdoOpen(true)}>
              <Plus />
              Atualizar KM
            </Button>
          </div>
          <Card className="odometer-history">
            {data.odometer
              .sort((a, b) => b.recordedDate.localeCompare(a.recordedDate))
              .map((record, index) => (
                <div className="odometer-row" key={record.id}>
                  <span className="timeline-dot odometer">
                    <Gauge />
                  </span>
                  <div>
                    <strong>{formatKm(record.odometerKm)}</strong>
                    <span>{formatDate(record.recordedDate)}</span>
                    <small>{record.observations || 'Sem observações'}</small>
                  </div>
                  {index === 0 ? (
                    <Badge tone="success">Atual</Badge>
                  ) : (
                    <button
                      className="icon-button"
                      aria-label={`Excluir leitura de ${formatKm(record.odometerKm)}`}
                      onClick={() => setDeleteId(record.id)}
                    >
                      <Trash2 />
                    </button>
                  )}
                </div>
              ))}
          </Card>
        </section>
      </div>
      <Modal
        open={editing}
        onClose={() => {
          setDraft(data.vehicle);
          setEditing(false);
        }}
        title="Editar veículo"
        size="wide"
      >
        <form onSubmit={save}>
          <div className="form-grid">
            <Input
              label="Fabricante"
              required
              value={draft.manufacturer}
              onChange={(e) => setDraft({ ...draft, manufacturer: e.target.value })}
            />
            <Input
              label="Modelo"
              required
              value={draft.model}
              onChange={(e) => setDraft({ ...draft, model: e.target.value })}
            />
            <Input
              label="Versão"
              value={draft.trim}
              onChange={(e) => setDraft({ ...draft, trim: e.target.value })}
            />
            <Input
              label="Motor"
              value={draft.engine}
              onChange={(e) => setDraft({ ...draft, engine: e.target.value })}
            />
            <Input
              label="Cor"
              value={draft.color}
              onChange={(e) => setDraft({ ...draft, color: e.target.value })}
            />
            <Input
              label="Placa"
              value={draft.plate}
              onChange={(e) => setDraft({ ...draft, plate: e.target.value.toUpperCase() })}
            />
            <Input
              label="RENAVAM"
              value={draft.renavam}
              onChange={(e) => setDraft({ ...draft, renavam: e.target.value })}
            />
            <Input
              label="Chassi"
              value={draft.chassis}
              onChange={(e) => setDraft({ ...draft, chassis: e.target.value })}
            />
            <Input
              className="full"
              label="URL da imagem"
              type="url"
              value={draft.imageUrl ?? ''}
              onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
            />
            <Textarea
              className="full"
              label="Observações"
              value={draft.observations}
              onChange={(e) => setDraft({ ...draft, observations: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar alterações</Button>
          </div>
        </form>
      </Modal>
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Excluir leitura">
        <p>Ao excluir, a quilometragem atual e os estados dependentes serão recalculados.</p>
        <div className="form-actions">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (deleteId) removeOdometer(deleteId);
              setDeleteId(null);
              toast('Leitura excluída e dependências recalculadas.');
            }}
          >
            Excluir leitura
          </Button>
        </div>
      </Modal>
      <OdometerModal open={odoOpen} onClose={() => setOdoOpen(false)} />
    </>
  );
}
