import { CarFront, Database, ShieldCheck, Wrench } from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { Button } from '../../components/ui';

export function LoginPage() {
  const { signIn, enterDemo, loading, denied, configured } = useAuth();
  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="login-logo">
          <CarFront />
        </div>
        <span className="eyebrow">Sua garagem digital</span>
        <h1>
          Seu carro tem história.
          <br />
          <em>Cuide bem dela.</em>
        </h1>
        <p>Manutenções, peças, documentos e gastos do seu Sandero — organizados em um só lugar.</p>
        <div className="login-features">
          <span>
            <Wrench />
            Manutenção no tempo certo
          </span>
          <span>
            <Database />
            Histórico que não se perde
          </span>
          <span>
            <ShieldCheck />
            Acesso privado e seguro
          </span>
        </div>
      </section>
      <section className="login-panel">
        <div>
          <span className="brand">
            <span className="brand-mark">
              <CarFront />
            </span>
            Carango <b>Véio</b>
          </span>
          <h2>Bem-vindo de volta</h2>
          <p>Entre com uma das contas autorizadas para acessar os dados do veículo.</p>
          {denied && (
            <div className="login-error">
              Esta conta não está autorizada. Tente novamente com uma das contas permitidas.
            </div>
          )}
          <Button disabled={loading} onClick={signIn}>
            <span className="google-g">G</span>
            {loading ? 'Verificando sessão…' : 'Entrar com Google'}
          </Button>
          {!configured && (
            <>
              <div className="or">
                <span>ambiente local</span>
              </div>
              <Button variant="secondary" onClick={enterDemo}>
                Explorar demonstração
              </Button>
              <small>O modo demonstração aparece apenas sem configuração Firebase.</small>
            </>
          )}
          <footer>
            <ShieldCheck />
            Acesso restrito. Seus dados ficam protegidos pelo Firebase.
          </footer>
        </div>
      </section>
    </main>
  );
}
