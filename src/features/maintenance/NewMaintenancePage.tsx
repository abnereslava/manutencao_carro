import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useData } from '../../app/providers/DataProvider';
import { SANDERO_COMPONENTS } from '../../catalog/components/sandero';
import { PageHeader } from '../../components/layout/AppShell';
import { Button, Card, Input, Select, Textarea } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useDraft } from '../../hooks/useDraft';

interface MaintenanceDraft {
  title: string;
  type: 'preventive_recurring' | 'preventive_one_time' | 'corrective' | 'inspection';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recurrenceType: 'none' | 'km' | 'time' | 'km_or_time';
  componentDefinitionId: string;
  intervalKm: string;
  intervalMonths: string;
  nextDueKm: string;
  nextDueDate: string;
  description: string;
  observations: string;
}
const initial: MaintenanceDraft = {
  title: '',
  type: 'preventive_recurring',
  priority: 'medium',
  recurrenceType: 'km_or_time',
  componentDefinitionId: '',
  intervalKm: '',
  intervalMonths: '',
  nextDueKm: '',
  nextDueDate: '',
  description: '',
  observations: ''
};

export function NewMaintenancePage() {
  const { saveMaintenance } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { value, setValue, status, clear } = useDraft('new-maintenance', initial);
  const [error, setError] = useState('');
  const field = (key: keyof MaintenanceDraft) => ({
    value: value[key],
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => setValue({ ...value, [key]: event.target.value })
  });
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!value.title.trim()) {
      setError('Dê um nome para a manutenção.');
      return;
    }
    saveMaintenance({
      title: value.title,
      type: value.type,
      priority: value.priority,
      recurrenceType: value.recurrenceType,
      componentDefinitionId: value.componentDefinitionId || undefined,
      intervalKm: value.intervalKm ? Number(value.intervalKm) : undefined,
      intervalMonths: value.intervalMonths ? Number(value.intervalMonths) : undefined,
      nextDueKm: value.nextDueKm ? Number(value.nextDueKm) : undefined,
      nextDueDate: value.nextDueDate || undefined,
      description: value.description,
      observations: value.observations
    });
    clear();
    toast('Plano de manutenção criado.');
    navigate('/maintenance');
  };
  return (
    <>
      <PageHeader
        eyebrow="Manutenções / Novo plano"
        title="Nova manutenção"
        description="Planeje uma ação única ou um ciclo recorrente."
        actions={
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft />
            Voltar
          </Button>
        }
      />
      <form onSubmit={submit}>
        <Card className="form-card">
          <div className="form-section">
            <h2>Informações principais</h2>
            <p>Identifique o serviço e o componente relacionado.</p>
            <div className="form-grid">
              <Input
                className="full"
                label="Título"
                required
                placeholder="Ex.: Troca de óleo e filtro"
                error={error}
                {...field('title')}
              />
              <Select label="Tipo" {...field('type')}>
                <option value="preventive_recurring">Preventiva recorrente</option>
                <option value="preventive_one_time">Preventiva única</option>
                <option value="corrective">Corretiva</option>
                <option value="inspection">Inspeção</option>
              </Select>
              <Select label="Prioridade" {...field('priority')}>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </Select>
              <Select className="full" label="Componente" {...field('componentDefinitionId')}>
                <option value="">Sem componente específico</option>
                {SANDERO_COMPONENTS.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.system} — {item.name}
                  </option>
                ))}
              </Select>
              <Textarea className="full" label="Descrição" {...field('description')} />
            </div>
          </div>
          <div className="form-section">
            <h2>Prazo e recorrência</h2>
            <p>Se os dois limites forem usados, vence no primeiro que for atingido.</p>
            <div className="form-grid">
              <Select label="Recorrência" {...field('recurrenceType')}>
                <option value="none">Não recorrente</option>
                <option value="km">Por quilometragem</option>
                <option value="time">Por tempo</option>
                <option value="km_or_time">KM ou tempo</option>
              </Select>
              <span />
              <Input label="Intervalo em KM" type="number" min="1" {...field('intervalKm')} />
              <Input
                label="Intervalo em meses"
                type="number"
                min="1"
                {...field('intervalMonths')}
              />
              <Input label="Próximo limite em KM" type="number" min="0" {...field('nextDueKm')} />
              <Input label="Próxima data" type="date" {...field('nextDueDate')} />
            </div>
          </div>
          <div className="form-section">
            <h2>Observações</h2>
            <Textarea label="Anotações adicionais" {...field('observations')} />
          </div>
          <footer className="sticky-form-actions">
            <span className={`draft-status ${status}`}>
              {status === 'saving'
                ? 'Salvando rascunho…'
                : status === 'saved'
                  ? 'Rascunho salvo'
                  : ''}
            </span>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save />
              Criar manutenção
            </Button>
          </footer>
        </Card>
      </form>
    </>
  );
}
