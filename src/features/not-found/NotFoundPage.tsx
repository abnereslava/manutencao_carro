import { Link } from 'react-router-dom';
import { CarFront } from 'lucide-react';
import { Button } from '../../components/ui';
export function NotFoundPage() {
  return (
    <div className="not-found">
      <CarFront />
      <span className="eyebrow">Erro 404</span>
      <h1>Essa estrada não leva a lugar nenhum.</h1>
      <p>A rota não existe ou foi movida.</p>
      <Link to="/">
        <Button>Voltar ao início</Button>
      </Link>
    </div>
  );
}
