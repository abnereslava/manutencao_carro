import { AlertTriangle, Bell, CalendarClock, CheckCheck, Eye, Gauge, MoonStar } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../app/providers/DataProvider';
import { PageHeader } from '../../components/layout/AppShell';
import { Badge, Button, Card, EmptyState } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { formatDate, formatKm } from '../../lib/format';

export function AlertsPage() {
  const { data, markAlertSeen, snoozeAlert } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const updateAlert = async (id: string, action: 'seen' | 'snooze', href?: string) => {
    setBusyId(id);
    setError('');
    try {
      if (action === 'seen') await markAlertSeen(id);
      else await snoozeAlert(id);
      if (action === 'snooze') toast('Alerta adiado e sincronizado.');
      if (href) navigate(href);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível atualizar o alerta.');
    } finally {
      setBusyId(null);
    }
  };
  const alerts = data.alerts
    .filter((item) => !item.resolved && !item.hidden)
    .sort(
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
      {alerts.length ? (
        <div className="alert-list">
          {error && <p className="field-error">{error}</p>}
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
                  {!alert.seen && <span className="unread">Novo</span>}
                </div>
                <p>{alert.description}</p>
                <div className="meta-row">
                  {alert.dueKm && (
                    <span>
                      <Gauge />
                      {formatKm(alert.dueKm)}
                    </span>
                  )}
                  {alert.dueDate && (
                    <span>
                      <CalendarClock />
                      {formatDate(alert.dueDate)}
                    </span>
                  )}
                  {alert.snoozedUntilDate && (
                    <span>
                      <MoonStar />
                      Adiado até {formatDate(alert.snoozedUntilDate)}
                    </span>
                  )}
                </div>
              </div>
              <div className="alert-actions">
                {!alert.seen && (
                  <Button
                    variant="ghost"
                    disabled={busyId === alert.id}
                    onClick={() => void updateAlert(alert.id, 'seen')}
                  >
                    <Eye />
                    Marcar visto
                  </Button>
                )}
                {alert.canSnooze && !alert.snoozedUntilDate && (
                  <Button
                    variant="secondary"
                    disabled={busyId === alert.id}
                    onClick={() => void updateAlert(alert.id, 'snooze')}
                  >
                    <MoonStar />
                    Adiar
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
          title="Nenhum alerta ativo"
          description="O carango está em dia."
          action={<CheckCheck />}
        />
      )}
    </>
  );
}
