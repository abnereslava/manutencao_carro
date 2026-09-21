import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Bell,
  CarFront,
  FileText,
  Gauge,
  History,
  Menu,
  PackageOpen,
  Receipt,
  Settings,
  Sparkles,
  Wrench,
  X,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { useData } from '../../app/providers/DataProvider';
import { IconButton } from '../ui';

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
  const startX = useRef<number | null>(null);
  const { user } = useAuth();
  const { data } = useData();
  const location = useLocation();
  const activeAlerts = data.alerts.filter((item) => !item.resolved && !item.hidden).length;
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
          <span className={`connection ${online ? '' : 'offline'}`}>
            {online ? <Wifi /> : <WifiOff />}
            {online ? 'Online' : 'Offline'}
          </span>
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
