import { useState } from 'react';
import { useData } from '../../app/providers/DataProvider';
import { Button, Input, Modal, Textarea } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { todayISO } from '../../lib/format';

export function OdometerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, addOdometer } = useData();
  const { toast } = useToast();
  const [km, setKm] = useState(String(data.vehicle.currentOdometer));
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const message = await addOdometer(Number(km), date, notes);
      if (message) {
        setError(message);
        return;
      }
      toast('Quilometragem sincronizada.');
      setNotes('');
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a leitura.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="Atualizar quilometragem">
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
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Textarea
            className="full"
            label="Observações"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="form-actions">
          <Button type="button" variant="ghost" disabled={saving} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar leitura'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
