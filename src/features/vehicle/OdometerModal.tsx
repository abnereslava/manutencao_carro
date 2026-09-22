import { useEffect, useState } from 'react';
import { useData } from '../../app/providers/DataProvider';
import { Button, Input, Modal, Textarea } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { getCurrentOdometer } from '../../domain/odometer';
import { formatKm, todayISO } from '../../lib/format';
import type { OdometerRecord } from '../../types/domain';

export function OdometerModal({
  open,
  onClose,
  record
}: {
  open: boolean;
  onClose: () => void;
  record?: OdometerRecord | null;
}) {
  const { data, addOdometer, updateOdometer } = useData();
  const { toast } = useToast();
  const [km, setKm] = useState(String(data.vehicle.currentOdometer));
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!open) return;
    setKm(String(record?.odometerKm ?? data.vehicle.currentOdometer));
    setDate(record?.recordedDate ?? '');
    setNotes(record?.observations ?? '');
    setError('');
  }, [data.vehicle.currentOdometer, open, record]);

  const numericKm = Number(km);
  const proposedCurrent = record
    ? getCurrentOdometer(
        data.odometer.map((item) =>
          item.id === record.id && Number.isInteger(numericKm)
            ? { ...item, odometerKm: numericKm, recordedDate: date || todayISO() }
            : item
        )
      )
    : data.vehicle.currentOdometer;
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const message = record
        ? await updateOdometer(record.id, Number(km), date, notes)
        : await addOdometer(Number(km), date, notes);
      if (message) {
        setError(message);
        return;
      }
      toast(
        record ? 'Leitura corrigida e dependências recalculadas.' : 'Quilometragem sincronizada.'
      );
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a leitura.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={record ? 'Editar leitura' : 'Atualizar quilometragem'}
    >
      <form onSubmit={save}>
        <div className="form-grid">
          <Input
            label="Nova leitura"
            type="number"
            min={0}
            required
            value={km}
            onChange={(e) => setKm(e.target.value)}
            error={error}
            hint={`Atual: ${data.vehicle.currentOdometer.toLocaleString('pt-BR')} km`}
          />
          <Input
            label="Data da leitura"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            hint={`Opcional; em branco usa ${todayISO().split('-').reverse().join('/')}`}
          />
          <Textarea
            className="full"
            label="Observações"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        {record && (
          <div className="odometer-impact" role="status">
            <b>Impacto desta correção</b>
            <span>
              KM atual: {formatKm(data.vehicle.currentOdometer)} → {formatKm(proposedCurrent)}
            </span>
            <small>
              {data.maintenancePlans.length} planos, {data.warranties.length} garantias e os alertas
              dependentes serão recalculados. Nenhuma manutenção será marcada como realizada.
            </small>
          </div>
        )}
        <div className="form-actions">
          <Button type="button" variant="ghost" disabled={saving} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando…' : record ? 'Salvar correção' : 'Salvar leitura'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
