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
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const message = addOdometer(Number(km), date, notes);
    if (message) {
      setError(message);
      return;
    }
    toast('Quilometragem atualizada.');
    setError('');
    setNotes('');
    onClose();
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
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Salvar leitura</Button>
        </div>
      </form>
    </Modal>
  );
}
