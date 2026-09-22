import { useState } from 'react';
import { CalendarClock, ExternalLink, FileCheck2, FileText, Plus } from 'lucide-react';
import { useData } from '../../app/providers/DataProvider';
import { PageHeader } from '../../components/layout/AppShell';
import { Badge, Button, Card, Input, Modal, Select } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { formatDate, formatMoney } from '../../lib/format';

export function DocumentsPage() {
  const { data, addDocument } = useData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'licensing' as 'ipva' | 'licensing' | 'insurance' | 'custom',
    referenceYear: String(new Date().getFullYear()),
    dueDate: '',
    amount: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await addDocument({
        name: form.name,
        type: form.type,
        referenceYear: Number(form.referenceYear),
        dueDate: form.dueDate || undefined,
        amountCents: form.amount
          ? Math.round(Number(form.amount.replace(',', '.')) * 100)
          : undefined
      });
      toast('Documento sincronizado.');
      setOpen(false);
      setForm({ ...form, name: '', dueDate: '', amount: '' });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar o documento.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="Papelada em ordem"
        title="Documentos"
        description="IPVA, licenciamento, seguro e registros anuais preservados no histórico."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus />
            Novo documento
          </Button>
        }
      />
      <div className="document-summary">
        <Card>
          <FileCheck2 />
          <div>
            <strong>
              {
                data.documents.filter((item) => item.status === 'active' || item.status === 'paid')
                  .length
              }
            </strong>
            <span>Regulares</span>
          </div>
        </Card>
        <Card>
          <CalendarClock />
          <div>
            <strong>{data.documents.filter((item) => item.status === 'pending').length}</strong>
            <span>Próximos</span>
          </div>
        </Card>
        <Card>
          <FileText />
          <div>
            <strong>{data.documents.length}</strong>
            <span>No histórico</span>
          </div>
        </Card>
      </div>
      <div className="document-grid">
        {data.documents.map((item) => (
          <Card className="document-card" key={item.id}>
            <header>
              <span className="document-icon">
                <FileText />
              </span>
              <Badge tone={item.status === 'pending' ? 'warning' : 'success'}>
                {item.status === 'paid' ? 'Pago' : item.status === 'active' ? 'Ativo' : 'Pendente'}
              </Badge>
            </header>
            <span className="eyebrow">
              {item.type === 'licensing' ? 'Licenciamento' : item.type.toUpperCase()}
            </span>
            <h2>{item.name}</h2>
            <dl>
              <div>
                <dt>Ano</dt>
                <dd>{item.referenceYear}</dd>
              </div>
              <div>
                <dt>Vencimento</dt>
                <dd>{formatDate(item.dueDate)}</dd>
              </div>
              <div>
                <dt>Valor</dt>
                <dd>{item.amountCents ? formatMoney(item.amountCents) : '—'}</dd>
              </div>
            </dl>
            {item.documentUrl ? (
              <a href={item.documentUrl} target="_blank" rel="noreferrer">
                Abrir documento <ExternalLink />
              </a>
            ) : (
              <span className="no-link">Sem link externo</span>
            )}
          </Card>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Novo documento" size="wide">
        <form onSubmit={submit}>
          <div className="form-grid">
            <Input
              className="full"
              label="Nome"
              required
              placeholder="Ex.: Licenciamento 2027"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Select
              label="Tipo"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
            >
              <option value="ipva">IPVA</option>
              <option value="licensing">Licenciamento</option>
              <option value="insurance">Seguro</option>
              <option value="custom">Personalizado</option>
            </Select>
            <Input
              label="Ano de referência"
              required
              type="number"
              min="1900"
              max="2200"
              value={form.referenceYear}
              onChange={(e) => setForm({ ...form, referenceYear: e.target.value })}
            />
            <Input
              label="Vencimento"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
            <Input
              label="Valor (R$)"
              inputMode="decimal"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          {error && <p className="field-error">{error}</p>}
          <div className="form-actions">
            <Button type="button" variant="ghost" disabled={saving} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar documento'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
