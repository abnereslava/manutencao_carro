import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '../ui';

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW();
  if (!needRefresh) return null;
  return (
    <div className="update-prompt" role="status">
      <div>
        <b>Nova versão disponível</b>
        <span>Atualize quando terminar o que está fazendo.</span>
      </div>
      <Button variant="ghost" onClick={() => setNeedRefresh(false)}>
        Depois
      </Button>
      <Button onClick={() => updateServiceWorker(true)}>Atualizar agora</Button>
    </div>
  );
}
