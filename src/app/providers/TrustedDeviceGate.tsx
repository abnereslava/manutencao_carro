import { useEffect, useState, type ReactNode } from 'react';
import { ShieldCheck, ShieldQuestion } from 'lucide-react';
import { initializeDataStore } from '../../data/firebase/config';
import { Button, Card, Skeleton } from '../../components/ui';

export function TrustedDeviceGate({
  children,
  enabled
}: {
  children: ReactNode;
  enabled: boolean;
}) {
  const [choice, setChoice] = useState<'yes' | 'no' | null>(
    () => localStorage.getItem('carango-trusted-device') as 'yes' | 'no' | null
  );
  const [ready, setReady] = useState(!enabled);
  useEffect(() => {
    if (!enabled || !choice) return;
    initializeDataStore(choice === 'yes').finally(() => setReady(true));
  }, [choice, enabled]);
  if (enabled && !choice)
    return (
      <div className="trust-gate">
        <Card>
          <span className="trust-icon">
            <ShieldQuestion />
          </span>
          <span className="eyebrow">Privacidade deste navegador</span>
          <h1>Este é um dispositivo confiável?</h1>
          <p>
            Em um dispositivo confiável, dados já sincronizados ficam disponíveis offline. Em
            computadores compartilhados, escolha “Não”.
          </p>
          <div>
            <Button
              variant="secondary"
              onClick={() => {
                localStorage.setItem('carango-trusted-device', 'no');
                setChoice('no');
              }}
            >
              Não, usar só nesta sessão
            </Button>
            <Button
              onClick={() => {
                localStorage.setItem('carango-trusted-device', 'yes');
                setChoice('yes');
              }}
            >
              <ShieldCheck />
              Sim, é confiável
            </Button>
          </div>
        </Card>
      </div>
    );
  if (!ready)
    return (
      <div className="app-loading">
        <Skeleton lines={4} />
      </div>
    );
  return children;
}
