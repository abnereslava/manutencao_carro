import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Bell,
  CarFront,
  CloudCheck,
  FileText,
  Gauge,
  History,
  LoaderCircle,
  Menu,
  PackageOpen,
  Receipt,
  Settings,
  Sparkles,
  Wrench,
  X,
  TriangleAlert,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { useData, type ConflictValue } from '../../app/providers/DataProvider';
import { isAlertActive } from '../../domain/alerts';
import { Button, IconButton, Modal, Textarea } from '../ui';

const links = [
  { to: '/', label: 'Início', icon: Gauge },
  { to: '/maintenance', label: 'Manutenções', icon: Wrench },
  { to: '/parts', label: 'Peças', icon: PackageOpen },
  { to: '/history', label: 'Histórico', icon: History },
  { to: '/expenses', label: 'Gastos', icon: Receipt },
  { to: '/documents', label: 'Documentos', icon: FileText },
  { to: '/vehicle', label: 'Veículo', icon: CarFront },
  { to: '/settings', label: 'Configurações', icon: Settings }
];

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const [conflictError, setConflictError] = useState('');
  const [resolving, setResolving] = useState(false);
  const startX = useRef<number | null>(null);
  const { user } = useAuth();
  const { data, syncState, conflicts, resolveConflict } = useData();
  const location = useLocation();
  const activeAlerts = data.alerts.filter((item) =>
    isAlertActive(item, data.vehicle.currentOdometer)
  ).length;
  const activeConflict = conflicts[0];
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    addEventListener('online', on);
    addEventListener('offline', off);
    return () => {
      removeEventListener('online', on);
      removeEventListener('offline', off);
    };
  }, []);
  useEffect(() => {
    if (!activeConflict) return;
    setConflictOpen(true);
    setManualOpen(false);
    setManualValue(JSON.stringify(activeConflict.local, null, 2));
    setConflictError('');
  }, [activeConflict]);
  const syncLabel = !online
    ? syncState.status === 'pending'
      ? 'Pendente'
      : 'Offline'
    : conflicts.length
      ? 'Conflito'
      : syncState.status === 'saving'
        ? 'Salvando…'
        : syncState.status === 'pending'
          ? 'Pendente'
          : syncState.status === 'error'
            ? 'Erro ao salvar'
            : syncState.status === 'synced'
              ? 'Sincronizado'
              : 'Online';
  const resolve = async (choice: 'local' | 'remote' | 'manual') => {
    if (!activeConflict) return;
    setResolving(true);
    setConflictError('');
    try {
      const manual = choice === 'manual' ? (JSON.parse(manualValue) as ConflictValue) : undefined;
      await resolveConflict(activeConflict.id, choice, manual);
      if (conflicts.length <= 1) setConflictOpen(false);
    } catch (error) {
      setConflictError(error instanceof Error ? error.message : 'Não foi possível resolver.');
    } finally {
      setResolving(false);
    }
  };
  const onTouchStart = (event: React.TouchEvent) => {
    startX.current = event.touches[0].clientX;
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    if (startX.current === null) return;
    const delta = event.changedTouches[0].clientX - startX.current;
    if (!menuOpen && startX.current > innerWidth - 32 && delta < -60) setMenuOpen(true);
    if (menuOpen && delta > 60) setMenuOpen(false);
    startX.current = null;
  };
  return (
    <div className="app-shell" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">
            <CarFront />
          </span>
          <span>
            Carango <b>Véio</b>
          </span>
        </NavLink>
        <nav className="desktop-nav" aria-label="Navegação principal">
          {links.map(({ to, label }) => (
            <NavLink end={to === '/'} key={to} to={to}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="top-actions">
          <button
            className={`connection ${!online || syncState.status === 'pending' ? 'offline' : ''} ${syncState.status} ${conflicts.length ? 'error' : ''}`}
            aria-label={`Sincronização: ${syncLabel}`}
            title={syncState.message}
            onClick={() => conflicts.length && setConflictOpen(true)}
          >
            {!online ? (
              <WifiOff />
            ) : conflicts.length || syncState.status === 'error' ? (
              <TriangleAlert />
            ) : syncState.status === 'saving' || syncState.status === 'pending' ? (
              <LoaderCircle className="spin" />
            ) : syncState.status === 'synced' ? (
              <CloudCheck />
            ) : (
              <Wifi />
            )}
            <span>{syncLabel}</span>
            {conflicts.length > 0 && <b>{conflicts.length}</b>}
          </button>
          <NavLink to="/alerts" className="alert-button" aria-label={`${activeAlerts} alertas`}>
            <Bell />
            {activeAlerts > 0 && <b>{activeAlerts}</b>}
          </NavLink>
          <div className="avatar" title={user?.name}>
            {user?.photoURL ? <img src={user.photoURL} alt="" /> : user?.name.slice(0, 1)}
          </div>
          <IconButton
            className="mobile-menu-button"
            label="Abrir menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu />
          </IconButton>
        </div>
      </header>
      {menuOpen && (
        <button
          className="drawer-overlay"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside className={`mobile-drawer ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <header>
          <div className="brand">
            <span className="brand-mark">
              <CarFront />
            </span>
            Carango Véio
          </div>
          <IconButton label="Fechar menu" onClick={() => setMenuOpen(false)}>
            <X />
          </IconButton>
        </header>
        <nav aria-label="Navegação mobile">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink end={to === '/'} key={to} to={to}>
              <Icon />
              {label}
            </NavLink>
          ))}
          <NavLink to="/alerts">
            <Bell />
            Alertas <span className="nav-count">{activeAlerts}</span>
          </NavLink>
        </nav>
        <div className="drawer-note">
          <Sparkles />
          <span>Seu histórico, sem mistério.</span>
        </div>
      </aside>
      <main>{children}</main>
      <Modal
        open={conflictOpen && Boolean(activeConflict)}
        onClose={() => setConflictOpen(false)}
        title="Conflito de sincronização"
        size="wide"
      >
        {activeConflict && (
          <div className="conflict-panel">
            <p>
              Outra conta alterou este registro depois que você o abriu. Nenhuma versão foi
              descartada. Compare os campos abaixo e escolha como continuar.
            </p>
            <div className="conflict-meta">
              <span>
                <b>Versão local</b>
                {activeConflict.local.updatedBy} ·{' '}
                {new Date(activeConflict.local.updatedAt).toLocaleString('pt-BR')} · revisão{' '}
                {activeConflict.local.revision}
              </span>
              <span>
                <b>Versão remota</b>
                {activeConflict.remote.updatedBy} ·{' '}
                {new Date(activeConflict.remote.updatedAt).toLocaleString('pt-BR')} · revisão{' '}
                {activeConflict.remote.revision}
              </span>
            </div>
            <div className="conflict-table" role="table" aria-label="Campos divergentes">
              <div className="conflict-row heading" role="row">
                <b>Campo</b>
                <b>Local</b>
                <b>Remoto</b>
              </div>
              {(activeConflict.divergentFields.length
                ? activeConflict.divergentFields
                : ['updatedAt']
              ).map((field) => (
                <div className="conflict-row" role="row" key={field}>
                  <b>{field}</b>
                  <code>
                    {JSON.stringify(
                      (activeConflict.local as unknown as Record<string, unknown>)[field]
                    ) ?? '—'}
                  </code>
                  <code>
                    {JSON.stringify(
                      (activeConflict.remote as unknown as Record<string, unknown>)[field]
                    ) ?? '—'}
                  </code>
                </div>
              ))}
            </div>
            {manualOpen && (
              <Textarea
                label="Versão revisada manualmente (JSON)"
                rows={12}
                value={manualValue}
                onChange={(event) => setManualValue(event.target.value)}
                error={conflictError}
              />
            )}
            {!manualOpen && conflictError && <p className="field-error">{conflictError}</p>}
            <div className="form-actions conflict-actions">
              <Button
                disabled={resolving}
                variant="secondary"
                onClick={() => void resolve('remote')}
              >
                Usar remota
              </Button>
              <Button
                disabled={resolving}
                variant="secondary"
                onClick={() => void resolve('local')}
              >
                Manter local
              </Button>
              {manualOpen ? (
                <Button disabled={resolving} onClick={() => void resolve('manual')}>
                  Salvar revisão manual
                </Button>
              ) : (
                <Button disabled={resolving} onClick={() => setManualOpen(true)}>
                  Revisar manualmente
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}
