import { useState } from 'react';
import { Cloud, Database, LogOut, Moon, RotateCcw, ShieldCheck, Sun, Trash2 } from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { useData } from '../../app/providers/DataProvider';
import { useTheme, type ThemePreference } from '../../app/providers/ThemeProvider';
import { PageHeader } from '../../components/layout/AppShell';
import { Button, Card, Input, Modal } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { clearLocalFirebaseData } from '../../data/firebase/config';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { data, updateSettings, resetDemo } = useData();
  const { preference, setPreference } = useTheme();
  const { toast } = useToast();
  const [km, setKm] = useState(String(data.settings.alertKmThreshold));
  const [days, setDays] = useState(String(data.settings.alertDaysThreshold));
  const [persistentFilters, setPersistentFilters] = useState(data.settings.persistentFilters);
  const [confirmClear, setConfirmClear] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const trusted = localStorage.getItem('carango-trusted-device') === 'yes';
  const changeTheme = (value: ThemePreference) => setPreference(value);
  const saveSettings = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await updateSettings({
        ...data.settings,
        alertKmThreshold: Number(km),
        alertDaysThreshold: Number(days),
        persistentFilters
      });
      toast('Preferências de alerta sincronizadas.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="Preferências"
        title="Configurações"
        description="Ajuste alertas, aparência, sessão e dados deste dispositivo."
      />
      <div className="settings-layout">
        <section>
          <h2>Aparência</h2>
          <Card className="settings-card">
            <div className="settings-copy">
              <div>
                <Sun />
                <span>
                  <b>Tema</b>
                  <small>Escolha como o Carango Véio aparece.</small>
                </span>
              </div>
            </div>
            <div className="theme-options">
              {(
                [
                  { id: 'light', label: 'Claro', icon: Sun },
                  { id: 'dark', label: 'Escuro', icon: Moon },
                  { id: 'system', label: 'Sistema', icon: Cloud }
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className={preference === id ? 'active' : ''}
                  onClick={() => changeTheme(id)}
                >
                  <Icon />
                  {label}
                </button>
              ))}
            </div>
          </Card>
        </section>
        <section>
          <h2>Antecedência dos alertas</h2>
          <Card className="settings-card vertical">
            <p>Um plano entra em “Próxima” quando alcançar qualquer uma destas faixas.</p>
            <div className="form-grid">
              <Input
                label="Quilômetros de antecedência"
                type="number"
                min="0"
                value={km}
                onChange={(e) => setKm(e.target.value)}
              />
              <Input
                label="Dias de antecedência"
                type="number"
                min="0"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={persistentFilters}
                onChange={(event) => setPersistentFilters(event.target.checked)}
              />
              Lembrar buscas, filtros, agrupamentos e abas neste dispositivo
            </label>
            {saveError && <p className="field-error">{saveError}</p>}
            <Button disabled={saving} onClick={() => void saveSettings()}>
              {saving ? 'Salvando…' : 'Salvar preferências'}
            </Button>
          </Card>
        </section>
        <section>
          <h2>Privacidade e dispositivo</h2>
          <Card className="settings-card vertical">
            <div className="settings-line">
              <div>
                <ShieldCheck />
                <span>
                  <b>{trusted ? 'Dispositivo confiável' : 'Dispositivo não confiável'}</b>
                  <small>
                    {trusted
                      ? 'Cache offline persistente habilitado.'
                      : 'Dados permanecem apenas durante a sessão.'}
                  </small>
                </span>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  localStorage.setItem('carango-trusted-device', trusted ? 'no' : 'yes');
                  toast('Preferência alterada. Ela será aplicada na próxima sessão.');
                }}
              >
                {trusted ? 'Marcar como não confiável' : 'Confiar neste dispositivo'}
              </Button>
            </div>
            <div className="settings-line">
              <div>
                <Database />
                <span>
                  <b>Dados locais</b>
                  <small>Limpe cache, rascunhos e preferências salvas.</small>
                </span>
              </div>
              <Button variant="danger" onClick={() => setConfirmClear(true)}>
                <Trash2 />
                Limpar dados locais
              </Button>
            </div>
          </Card>
        </section>
        <section>
          <h2>Conta</h2>
          <Card className="settings-card account-card">
            <div className="avatar large">{user?.name.slice(0, 1)}</div>
            <div>
              <b>{user?.name}</b>
              <span>{user?.email}</span>
            </div>
            {user?.demo && (
              <Button
                variant="ghost"
                onClick={() => {
                  resetDemo();
                  toast('Dados de demonstração restaurados.');
                }}
              >
                <RotateCcw />
                Restaurar demo
              </Button>
            )}
            <Button variant="secondary" onClick={logout}>
              <LogOut />
              Sair
            </Button>
          </Card>
        </section>
      </div>
      <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title="Limpar dados locais">
        <p>
          Rascunhos, preferências e cache offline serão removidos deste navegador. Os dados já
          sincronizados no servidor não serão apagados.
        </p>
        <div className="form-actions">
          <Button variant="ghost" onClick={() => setConfirmClear(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              sessionStorage.clear();
              localStorage.removeItem('carango-demo-data-v1');
              await clearLocalFirebaseData();
              setConfirmClear(false);
              toast('Dados locais removidos.');
            }}
          >
            Limpar deste dispositivo
          </Button>
        </div>
      </Modal>
    </>
  );
}
