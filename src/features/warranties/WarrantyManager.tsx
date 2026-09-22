import { useState } from 'react';
import { Edit3, Plus, ShieldCheck } from 'lucide-react';
import { useData } from '../../app/providers/DataProvider';
import { Button, Card, Input, Modal, Select, Textarea } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { calculateWarrantyState } from '../../domain/warranty';
import { formatDate, formatKm, todayISO } from '../../lib/format';
import type { Warranty } from '../../types/domain';

interface WarrantyDraft {
  type: Warranty['type'];
  partInstanceId: string;
  maintenanceOccurrenceId: string;
  startDate: string;
  startOdometerKm: string;
  endDate: string;
  endOdometerKm: string;
  provider: string;
  terms: string;
  documentUrl: string;
  observations: string;
}

function emptyDraft(currentOdometer: number): WarrantyDraft {
  return {
    type: 'part',
    partInstanceId: '',
    maintenanceOccurrenceId: '',
    startDate: todayISO(),
    startOdometerKm: String(currentOdometer),
    endDate: '',
    endOdometerKm: '',
    provider: '',
    terms: '',
    documentUrl: '',
    observations: ''
  };
}

const warrantyStateLabels = {
  active: 'Ativa',
  upcoming: 'Próxima do vencimento',
  expired: 'Vencida'
};

export function WarrantyManager() {
  const { data, saveWarranty } = useData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Warranty>();
  const [draft, setDraft] = useState<WarrantyDraft>(() => emptyDraft(data.vehicle.currentOdometer));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const openWarranty = (warranty?: Warranty) => {
    setSelected(warranty);
    setDraft(
      warranty
        ? {
            type: warranty.type,
            partInstanceId: warranty.partInstanceId ?? '',
            maintenanceOccurrenceId: warranty.maintenanceOccurrenceId ?? '',
            startDate: warranty.startDate ?? '',
            startOdometerKm:
              warranty.startOdometerKm === undefined ? '' : String(warranty.startOdometerKm),
            endDate: warranty.endDate ?? '',
            endOdometerKm:
              warranty.endOdometerKm === undefined ? '' : String(warranty.endOdometerKm),
            provider: warranty.provider ?? '',
            terms: warranty.terms ?? '',
            documentUrl: warranty.documentUrl ?? '',
            observations: warranty.observations
          }
        : emptyDraft(data.vehicle.currentOdometer)
    );
    setError('');
    setOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await saveWarranty({
        id: selected?.id,
        type: draft.type,
        partInstanceId: draft.partInstanceId || undefined,
        maintenanceOccurrenceId: draft.maintenanceOccurrenceId || undefined,
        startDate: draft.startDate || undefined,
        startOdometerKm: draft.startOdometerKm === '' ? undefined : Number(draft.startOdometerKm),
        endDate: draft.endDate || undefined,
        endOdometerKm: draft.endOdometerKm === '' ? undefined : Number(draft.endOdometerKm),
        provider: draft.provider || undefined,
        terms: draft.terms || undefined,
        documentUrl: draft.documentUrl || undefined,
        observations: draft.observations
      });
      setOpen(false);
      toast(selected ? 'Garantia atualizada.' : 'Garantia cadastrada.');
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Não foi possível salvar a garantia.'
      );
    } finally {
      setSaving(false);
    }
  };

  const relationLabel = (warranty: Warranty) => {
    if (warranty.partInstanceId)
      return (
        data.parts.find((part) => part.id === warranty.partInstanceId)?.name ?? 'Peça removida'
      );
    const occurrence = data.occurrences.find(
      (item) => item.id === warranty.maintenanceOccurrenceId
    );
    return (
      data.maintenancePlans.find((plan) => plan.id === occurrence?.maintenancePlanId)?.title ??
      'Serviço registrado'
    );
  };

  return (
    <section className="warranty-manager" aria-labelledby="warranty-manager-title">
      <div className="section-toolbar">
        <div>
          <h2 id="warranty-manager-title">Garantias</h2>
          <p>Cadastre garantias de peças e serviços por data, KM ou ambos.</p>
        </div>
        <Button onClick={() => openWarranty()}>
          <Plus />
          Nova garantia
        </Button>
      </div>
      {data.warranties.length > 0 && (
        <div className="warranty-list">
          {data.warranties.map((warranty) => {
            const state = calculateWarrantyState(
              warranty,
              data.vehicle.currentOdometer,
              todayISO(),
              data.settings.alertDaysThreshold,
              data.settings.alertKmThreshold
            );
            return (
              <Card className={`warranty-card ${state}`} key={warranty.id}>
                <ShieldCheck />
                <div>
                  <span>{warranty.type === 'part' ? 'Peça' : 'Serviço'}</span>
                  <h3>{relationLabel(warranty)}</h3>
                  <p>
                    {warranty.endDate
                      ? `Data: ${formatDate(warranty.endDate)}`
                      : 'Sem limite de data'}
                    {' · '}
                    {warranty.endOdometerKm !== undefined
                      ? `KM: ${formatKm(warranty.endOdometerKm)}`
                      : 'Sem limite de KM'}
                  </p>
                  <b>{warrantyStateLabels[state]}</b>
                </div>
                <Button
                  variant="secondary"
                  aria-label={`Editar garantia de ${relationLabel(warranty)}`}
                  onClick={() => openWarranty(warranty)}
                >
                  <Edit3 />
                  Editar
                </Button>
              </Card>
            );
          })}
        </div>
      )}
      <Modal
        open={open}
        onClose={() => !saving && setOpen(false)}
        title={selected ? 'Editar garantia' : 'Nova garantia'}
        size="wide"
      >
        <form onSubmit={submit}>
          <div className="form-grid">
            <Select
              label="Tipo de garantia"
              value={draft.type}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  type: event.target.value as Warranty['type'],
                  partInstanceId: '',
                  maintenanceOccurrenceId: ''
                })
              }
            >
              <option value="part">Peça</option>
              <option value="service">Serviço</option>
            </Select>
            {draft.type === 'part' ? (
              <Select
                label="Peça vinculada"
                required
                value={draft.partInstanceId}
                onChange={(event) => setDraft({ ...draft, partInstanceId: event.target.value })}
              >
                <option value="">Selecione</option>
                {data.parts.map((part) => (
                  <option value={part.id} key={part.id}>
                    {part.name} — {part.status === 'installed' ? 'Instalada' : 'Histórico'}
                  </option>
                ))}
              </Select>
            ) : (
              <Select
                label="Serviço vinculado"
                required
                value={draft.maintenanceOccurrenceId}
                onChange={(event) =>
                  setDraft({ ...draft, maintenanceOccurrenceId: event.target.value })
                }
              >
                <option value="">Selecione</option>
                {data.occurrences.map((occurrence) => (
                  <option value={occurrence.id} key={occurrence.id}>
                    {data.maintenancePlans.find((plan) => plan.id === occurrence.maintenancePlanId)
                      ?.title ?? 'Manutenção'}{' '}
                    — {formatDate(occurrence.performedDate)}
                  </option>
                ))}
              </Select>
            )}
            <Input
              label="Data inicial"
              type="date"
              value={draft.startDate}
              onChange={(event) => setDraft({ ...draft, startDate: event.target.value })}
            />
            <Input
              label="KM inicial"
              type="number"
              min="0"
              value={draft.startOdometerKm}
              onChange={(event) => setDraft({ ...draft, startOdometerKm: event.target.value })}
            />
            <Input
              label="Data final"
              type="date"
              value={draft.endDate}
              onChange={(event) => setDraft({ ...draft, endDate: event.target.value })}
            />
            <Input
              label="KM final"
              type="number"
              min="0"
              value={draft.endOdometerKm}
              onChange={(event) => setDraft({ ...draft, endOdometerKm: event.target.value })}
            />
            <Input
              label="Prestador ou fornecedor"
              value={draft.provider}
              onChange={(event) => setDraft({ ...draft, provider: event.target.value })}
            />
            <Input
              label="URL do documento"
              type="url"
              value={draft.documentUrl}
              onChange={(event) => setDraft({ ...draft, documentUrl: event.target.value })}
            />
            <Textarea
              className="full"
              label="Termos"
              value={draft.terms}
              onChange={(event) => setDraft({ ...draft, terms: event.target.value })}
            />
            <Textarea
              className="full"
              label="Observações da garantia"
              value={draft.observations}
              onChange={(event) => setDraft({ ...draft, observations: event.target.value })}
            />
          </div>
          {error && (
            <p className="form-submit-error" role="alert">
              {error}
            </p>
          )}
          <div className="form-actions">
            <Button type="button" variant="ghost" disabled={saving} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar garantia'}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
