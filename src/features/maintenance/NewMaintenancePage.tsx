import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useData } from '../../app/providers/DataProvider';
import { SANDERO_COMPONENTS } from '../../catalog/components/sandero';
import { PageHeader } from '../../components/layout/AppShell';
import { Button, Card, Input, Select, Textarea } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { nextCycle } from '../../domain/maintenance';
import { useDraft } from '../../hooks/useDraft';

interface MaintenanceDraft {
  title: string;
  type: 'preventive_recurring' | 'preventive_one_time' | 'corrective' | 'inspection';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  initialStatus: 'pending' | 'scheduled';
  recurrenceType: 'none' | 'km' | 'time' | 'km_or_time';
  componentDefinitionId: string;
  initialPerformedKm: string;
  initialPerformedDate: string;
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
  initialStatus: 'scheduled',
  recurrenceType: 'km_or_time',
  componentDefinitionId: '',
  initialPerformedKm: '',
  initialPerformedDate: '',
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
  const [searchParams] = useSearchParams();
  const requestedComponentId = searchParams.get('component') ?? '';
  const requestedAction = searchParams.get('action') ?? '';
  const requestedComponent = SANDERO_COMPONENTS.find(
    (component) => component.id === requestedComponentId
  );
  const actionLabels: Record<string, string> = {
    installed: 'Instalar',
    replaced: 'Substituir',
    removed: 'Remover',
    inspected: 'Inspecionar',
    repaired: 'Reparar'
  };
  const requestedInitial: MaintenanceDraft = requestedComponent
    ? {
        ...initial,
        title: `${actionLabels[requestedAction] ?? 'Manutenção em'} ${requestedComponent.name}`,
        type: requestedAction === 'inspected' ? 'inspection' : 'corrective',
        priority: requestedComponent.isEssential ? 'high' : 'medium',
        recurrenceType: 'none',
        componentDefinitionId: requestedComponent.id,
        description: `Ação iniciada pelo Hub de Peças para ${requestedComponent.name}.`
      }
    : initial;
  const draftKey = requestedComponent
    ? `new-maintenance-${requestedComponent.id}-${requestedAction || 'related'}`
    : 'new-maintenance';
  const { value, setValue, status, clear } = useDraft(draftKey, requestedInitial);
  const [titleError, setTitleError] = useState('');
  const [cycleError, setCycleError] = useState('');

  const field = (key: keyof MaintenanceDraft) => ({
    value: value[key],
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      setCycleError('');
      setValue({ ...value, [key]: event.target.value });
    }
  });

  const isRecurring = value.recurrenceType !== 'none';
  const usesKm = value.recurrenceType === 'km' || value.recurrenceType === 'km_or_time';
  const usesTime = value.recurrenceType === 'time' || value.recurrenceType === 'km_or_time';
  const hasCycleBase = value.initialPerformedKm !== '' && value.initialPerformedDate !== '';

  const calculatedCycle =
    isRecurring && hasCycleBase
      ? nextCycle(
          {
            recurrenceType: value.recurrenceType,
            intervalKm: value.intervalKm ? Number(value.intervalKm) : undefined,
            intervalMonths: value.intervalMonths ? Number(value.intervalMonths) : undefined
          },
          Number(value.initialPerformedKm),
          value.initialPerformedDate
        )
      : {};

  const calculatedNextDueKm =
    calculatedCycle.nextDueKm !== undefined ? String(calculatedCycle.nextDueKm) : '';
  const calculatedNextDueDate = calculatedCycle.nextDueDate ?? '';

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setTitleError('');
    setCycleError('');

    if (!value.title.trim()) {
      setTitleError('Dê um nome para a manutenção.');
      return;
    }

    if (isRecurring && !hasCycleBase) {
      setCycleError('Informe a data e a quilometragem da última realização.');
      return;
    }

    if (usesKm && !value.intervalKm) {
      setCycleError('Informe o intervalo em KM para calcular o próximo limite.');
      return;
    }

    if (usesTime && !value.intervalMonths) {
      setCycleError('Informe o intervalo em meses para calcular a próxima data.');
      return;
    }

    const planId = saveMaintenance({
      title: value.title,
      type: value.type,
      priority: value.priority,
      initialStatus: value.initialStatus,
      recurrenceType: value.recurrenceType,
      componentDefinitionId: value.componentDefinitionId || undefined,
      initialPerformedKm: isRecurring ? Number(value.initialPerformedKm) : undefined,
      initialPerformedDate: isRecurring ? value.initialPerformedDate : undefined,
      intervalKm: usesKm ? Number(value.intervalKm) : undefined,
      intervalMonths: usesTime ? Number(value.intervalMonths) : undefined,
      nextDueKm: isRecurring
        ? calculatedCycle.nextDueKm
        : value.nextDueKm
          ? Number(value.nextDueKm)
          : undefined,
      nextDueDate: isRecurring ? calculatedCycle.nextDueDate : value.nextDueDate || undefined,
      description: value.description,
      observations: value.observations
    });

    clear();
    toast('Plano de manutenção criado.');
    navigate(
      requestedComponent && requestedAction
        ? `/maintenance/${planId}/complete?component=${requestedComponent.id}&action=${requestedAction}`
        : '/maintenance'
    );
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
                error={titleError}
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
              <Select label="Estado inicial" {...field('initialStatus')}>
                <option value="scheduled">Calcular pelos prazos</option>
                <option value="pending">Pendente manual</option>
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
            <p>
              Em planos recorrentes, informe quando o serviço foi realmente realizado. O próximo
              limite é calculado automaticamente a partir dessa base.
            </p>
            <div className="form-grid">
              <Select label="Recorrência" {...field('recurrenceType')}>
                <option value="none">Não recorrente</option>
                <option value="km">Por quilometragem</option>
                <option value="time">Por tempo</option>
                <option value="km_or_time">KM ou tempo</option>
              </Select>
              <span />

              {isRecurring ? (
                <>
                  <Input
                    label="KM da última realização"
                    type="number"
                    min="0"
                    required
                    error={cycleError && value.initialPerformedKm === '' ? cycleError : undefined}
                    {...field('initialPerformedKm')}
                  />
                  <Input
                    label="Data da última realização"
                    type="date"
                    required
                    error={cycleError && value.initialPerformedDate === '' ? cycleError : undefined}
                    {...field('initialPerformedDate')}
                  />

                  {usesKm ? (
                    <Input
                      label="Intervalo em KM"
                      type="number"
                      min="1"
                      required
                      error={cycleError && !value.intervalKm ? cycleError : undefined}
                      {...field('intervalKm')}
                    />
                  ) : (
                    <span />
                  )}

                  {usesTime ? (
                    <Input
                      label="Intervalo em meses"
                      type="number"
                      min="1"
                      required
                      error={cycleError && !value.intervalMonths ? cycleError : undefined}
                      {...field('intervalMonths')}
                    />
                  ) : (
                    <span />
                  )}

                  {usesKm ? (
                    <Input
                      label="Próximo limite em KM"
                      type="number"
                      value={calculatedNextDueKm}
                      readOnly
                      placeholder="Calculado automaticamente"
                      hint="KM da última realização + intervalo em KM"
                    />
                  ) : (
                    <span />
                  )}

                  {usesTime ? (
                    <Input
                      label="Próxima data"
                      type="date"
                      value={calculatedNextDueDate}
                      readOnly
                      hint="Data da última realização + intervalo"
                    />
                  ) : (
                    <span />
                  )}
                </>
              ) : (
                <>
                  <Input
                    label="Próximo limite em KM"
                    type="number"
                    min="0"
                    {...field('nextDueKm')}
                  />
                  <Input label="Próxima data" type="date" {...field('nextDueDate')} />
                </>
              )}
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
