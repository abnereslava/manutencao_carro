import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider';
import { AppShell } from '../components/layout/AppShell';
import { Skeleton } from '../components/ui';
import { LoginPage } from '../features/auth/LoginPage';
import { UpdatePrompt } from '../components/feedback/UpdatePrompt';
import { TrustedDeviceGate } from './providers/TrustedDeviceGate';
import { DataProvider } from './providers/DataProvider';

const DashboardPage = lazy(() =>
  import('../features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const MaintenancePage = lazy(() =>
  import('../features/maintenance/MaintenancePage').then((m) => ({ default: m.MaintenancePage }))
);
const NewMaintenancePage = lazy(() =>
  import('../features/maintenance/NewMaintenancePage').then((m) => ({
    default: m.NewMaintenancePage
  }))
);
const MaintenanceDetailPage = lazy(() =>
  import('../features/maintenance/MaintenanceDetailPage').then((m) => ({
    default: m.MaintenanceDetailPage
  }))
);
const CompleteMaintenancePage = lazy(() =>
  import('../features/maintenance/CompleteMaintenancePage').then((m) => ({
    default: m.CompleteMaintenancePage
  }))
);
const PartsPage = lazy(() =>
  import('../features/parts/PartsPage').then((m) => ({ default: m.PartsPage }))
);
const PartDetailPage = lazy(() =>
  import('../features/parts/PartDetailPage').then((m) => ({ default: m.PartDetailPage }))
);
const HistoryPage = lazy(() =>
  import('../features/history/HistoryPage').then((m) => ({ default: m.HistoryPage }))
);
const ExpensesPage = lazy(() =>
  import('../features/expenses/ExpensesPage').then((m) => ({ default: m.ExpensesPage }))
);
const DocumentsPage = lazy(() =>
  import('../features/documents/DocumentsPage').then((m) => ({ default: m.DocumentsPage }))
);
const VehiclePage = lazy(() =>
  import('../features/vehicle/VehiclePage').then((m) => ({ default: m.VehiclePage }))
);
const AlertsPage = lazy(() =>
  import('../features/alerts/AlertsPage').then((m) => ({ default: m.AlertsPage }))
);
const SettingsPage = lazy(() =>
  import('../features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const NotFoundPage = lazy(() =>
  import('../features/not-found/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

export function App() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="app-loading">
        <span className="brand">
          <span className="brand-mark">CV</span>Carango Véio
        </span>
        <Skeleton lines={3} />
      </div>
    );
  if (!user) return <LoginPage />;
  return (
    <TrustedDeviceGate enabled={!user.demo}>
      <DataProvider>
        <AppShell>
          <Suspense
            fallback={
              <div className="route-loading">
                <Skeleton lines={6} />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/maintenance/new" element={<NewMaintenancePage />} />
              <Route path="/maintenance/:id/complete" element={<CompleteMaintenancePage />} />
              <Route path="/maintenance/:id" element={<MaintenanceDetailPage />} />
              <Route path="/parts" element={<PartsPage />} />
              <Route path="/parts/:id" element={<PartDetailPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/vehicle" element={<VehiclePage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          <UpdatePrompt />
        </AppShell>
      </DataProvider>
    </TrustedDeviceGate>
  );
}
