import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCheck,
  Eye,
  EyeOff,
  Gauge,
  MoonStar,
  PackageOpen,
  RotateCcw
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../../app/providers/DataProvider';
import { PageHeader } from '../../components/layout/AppShell';
import { Badge, Button, Card, EmptyState, Input, Modal, Select, Tabs } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { isAlertActive, isAlertSnoozed } from '../../domain/alerts';
import { formatDate, formatKm, todayISO } from '../../lib/format';

type AlertView = 'active' | 'snoozed' | 'hidden';

const criterionLabel = {
  km: 'KM',
  date: 'data',
  both: 'KM e data'
} as const;

export function AlertsPage() {
  const { data, markAlertSeen, reactivateAlert, setAlertHidden, snoozeAlert } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [view, setView] = useState<AlertView>('active');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [snoozeId, setSnoozeId] = useState<string | null>(null);
  const [dayOption, setDayOption] = useState('7');
  const [customDate, setCustomDate] = useState('');
  const [kmOption, setKmOption] = useState('none');
  const [customKm, setCustomKm] = useState('');
  const updateAlert = async (
    id: string,
    action: 'seen' | 'hide' | 'restore' | 'reactivate',
    href?: string
  ) => {
    setBusyId(id);
    setError('');
    try {
      if (action === 'seen') await markAlertSeen(id);
      if (action === 'hide') {
        await setAlertHidden(id, true);
        toast('Alerta ocultado. Ele continua disponível em Ocultos.');
      }
      if (action === 'restore') {
        await setAlertHidden(id, false);
        toast('Alerta restaurado para a lista ativa.');
      }
      if (action === 'reactivate') {
        await reactivateAlert(id);
        toast('Alerta reativado agora.');
      }
      if (href) navigate(href);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível atualizar o alerta.');
    } finally {
      setBusyId(null);
    }
  };
  const confirmSnooze = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!snoozeId) return;
    setBusyId(snoozeId);
    setError('');
    try {
      let untilDate: string | undefined;
      if (dayOption === 'custom') untilDate = customDate || undefined;
      else if (dayOption !== 'none') {
        const date = new Date(`${todayISO()}T12:00:00Z`);
        date.setUTCDate(date.getUTCDate() + Number(dayOption));
        untilDate = date.toISOString().slice(0, 10);
      }
      const kmDelta =
        kmOption === 'custom'
          ? Number(customKm)
          : kmOption === 'none'
            ? undefined
            : Number(kmOption);
      await snoozeAlert(snoozeId, {
        untilDate,
        untilKm:
          kmDelta === undefined || !Number.isFinite(kmDelta)
            ? undefined
            : data.vehicle.currentOdometer + kmDelta
      });
      setSnoozeId(null);
      toast('Alerta adiado e removido da lista ativa.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível adiar o alerta.');
    } finally {
      setBusyId(null);
    }
  };
  const activeAlerts = data.alerts.filter((item) =>
    isAlertActive(item, data.vehicle.currentOdometer)
  );
  const snoozedAlerts = data.alerts.filter(
    (item) => !item.resolved && !item.hidden && isAlertSnoozed(item, data.vehicle.currentOdometer)
  );
  const hiddenAlerts = data.alerts.filter((item) => !item.resolved && item.hidden);
  const alerts = (
    view === 'active' ? activeAlerts : view === 'snoozed' ? snoozedAlerts : hiddenAlerts
  ).sort(
    (a, b) =>
      ['critical', 'important', 'attention', 'info'].indexOf(a.priority) -
      ['critical', 'important', 'attention', 'info'].indexOf(b.priority)
  );
  return (
    <>
      <PageHeader
        eyebrow="Central de atenção"
        title="Alertas"
        description="Prioridades derivadas do estado real do veículo."
      />
      <Tabs
        active={view}
        onChange={(value) => setView(value as AlertView)}
        items={[
          { id: 'active', label: 'Ativos', count: activeAlerts.length },
          { id: 'snoozed', label: 'Adiados', count: snoozedAlerts.length },
          { id: 'hidden', label: 'Ocultos', count: hiddenAlerts.length }
        ]}
      />
      {error && <p className="field-error">{error}</p>}
      {alerts.length ? (
        <div className="alert-list">
          {alerts.map((alert) => (
            <Card
              className={`alert-card ${alert.priority} ${alert.seen ? 'seen' : ''}`}
              key={alert.id}
            >
              <span className="alert-symbol">
                {alert.priority === 'critical' ? <AlertTriangle /> : <Bell />}
              </span>
              <div>
                <div className="alert-title">
                  <h2>{alert.title}</h2>
                  <Badge
                    tone={
                      alert.priority === 'critical'
                        ? 'danger'
                        : alert.priority === 'important'
                          ? 'warning'
                          : 'info'
                    }
                  >
                    {alert.priority === 'critical'
                      ? 'Crítico'
                      : alert.priority === 'important'
                        ? 'Importante'
                        : 'Atenção'}
                  </Badge>
                  {view === 'hidden' && <Badge>Oculto</Badge>}
                  {!alert.seen && <span className="unread">Novo</span>}
                </div>
                <p>{alert.description}</p>
                <div className="meta-row">
                  {alert.componentName && (
                    <span>
                      <PackageOpen />
                      {alert.componentName}
                    </span>
                  )}
                  {alert.urgentCriterion && (
                    <span>
                      <AlertTriangle />
                      Critério mais urgente: {criterionLabel[alert.urgentCriterion]}
                    </span>
                  )}
                  {alert.dueKm !== undefined && (
                    <span>
                      <Gauge />
                      Limite: {formatKm(alert.dueKm)}
                    </span>
                  )}
                  {alert.dueDate && (
                    <span>
                      <CalendarClock />
                      Limite: {formatDate(alert.dueDate)}
                    </span>
                  )}
                  {alert.snoozedUntilDate && (
                    <span>
                      <MoonStar />
                      Adiado até {formatDate(alert.snoozedUntilDate)}
                    </span>
                  )}
                  {alert.snoozedUntilKm !== undefined && (
                    <span>
                      <Gauge />
                      Adiado até {formatKm(alert.snoozedUntilKm)}
                    </span>
                  )}
                </div>
              </div>
              <div className="alert-actions">
                {view === 'active' && !alert.seen && (
                  <Button
                    variant="ghost"
                    disabled={busyId === alert.id}
                    onClick={() => void updateAlert(alert.id, 'seen')}
                  >
                    <Eye />
                    Marcar visto
                  </Button>
                )}
                {view === 'active' && alert.canSnooze && (
                  <Button
                    variant="secondary"
                    disabled={busyId === alert.id}
                    onClick={() => {
                      setError('');
                      setDayOption('7');
                      setCustomDate('');
                      setKmOption('none');
                      setCustomKm('');
                      setSnoozeId(alert.id);
                    }}
                  >
                    <MoonStar />
                    Adiar
                  </Button>
                )}
                {view === 'snoozed' && (
                  <Button
                    variant="secondary"
                    disabled={busyId === alert.id}
                    onClick={() => void updateAlert(alert.id, 'reactivate')}
                  >
                    <RotateCcw />
                    Reativar agora
                  </Button>
                )}
                {view === 'active' && alert.canHide && (
                  <Button
                    variant="ghost"
                    disabled={busyId === alert.id}
                    onClick={() => void updateAlert(alert.id, 'hide')}
                  >
                    <EyeOff />
                    Ocultar
                  </Button>
                )}
                {view === 'hidden' && (
                  <Button
                    variant="secondary"
                    disabled={busyId === alert.id}
                    onClick={() => void updateAlert(alert.id, 'restore')}
                  >
                    <RotateCcw />
                    Reexibir
                  </Button>
                )}
                <Link
                  className="button primary"
                  to={alert.href}
                  aria-disabled={busyId === alert.id}
                  onClick={(event) => {
                    event.preventDefault();
                    if (busyId !== alert.id) void updateAlert(alert.id, 'seen', alert.href);
                  }}
                >
                  Abrir item
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            view === 'active'
              ? 'Nenhum alerta ativo'
              : view === 'snoozed'
                ? 'Nenhum alerta adiado'
                : 'Nenhum alerta oculto'
          }
          description={
            view === 'active'
              ? 'O carango está em dia.'
              : 'Os alertas preservados neste estado aparecerão aqui.'
          }
          action={<CheckCheck />}
        />
      )}
      <Modal open={!!snoozeId} onClose={() => setSnoozeId(null)} title="Adiar alerta">
        <form onSubmit={confirmSnooze}>
          <p>
            Escolha tempo, quilometragem ou ambos. Com os dois critérios, o alerta reaparece no
            primeiro que for atingido.
          </p>
          <div className="form-grid">
            <Select
              label="Prazo por tempo"
              value={dayOption}
              onChange={(event) => setDayOption(event.target.value)}
            >
              <option value="none">Sem prazo por data</option>
              <option value="1">1 dia</option>
              <option value="7">7 dias</option>
              <option value="30">30 dias</option>
              <option value="custom">Data personalizada</option>
            </Select>
            {dayOption === 'custom' ? (
              <Input
                label="Data de reaparecimento"
                type="date"
                min={todayISO()}
                value={customDate}
                onChange={(event) => setCustomDate(event.target.value)}
              />
            ) : (
              <span />
            )}
            <Select
              label="Prazo por quilometragem"
              value={kmOption}
              onChange={(event) => setKmOption(event.target.value)}
            >
              <option value="none">Sem prazo por KM</option>
              <option value="100">Mais 100 km</option>
              <option value="500">Mais 500 km</option>
              <option value="1000">Mais 1.000 km</option>
              <option value="custom">Valor personalizado</option>
            </Select>
            {kmOption === 'custom' ? (
              <Input
                label="KM adicional personalizado"
                type="number"
                min="1"
                value={customKm}
                onChange={(event) => setCustomKm(event.target.value)}
              />
            ) : (
              <span />
            )}
          </div>
          {error && <p className="field-error">{error}</p>}
          <div className="form-actions">
            <Button type="button" variant="ghost" onClick={() => setSnoozeId(null)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={busyId === snoozeId}>
              {busyId === snoozeId ? 'Salvando…' : 'Confirmar adiamento'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
