import { useState } from 'react';
import {
  CalendarClock,
  Edit3,
  ExternalLink,
  FileCheck2,
  FileText,
  Plus,
  Trash2
} from 'lucide-react';
import { useData } from '../../app/providers/DataProvider';
import { PageHeader } from '../../components/layout/AppShell';
import { Badge, Button, Card, Input, Modal, Select, Textarea } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { formatDate, formatMoney } from '../../lib/format';
import type { DocumentRecord } from '../../types/domain';

interface DocumentForm {
  id?: string;
  name: string;
  type: DocumentRecord['type'];
  customTypeName: string;
  referenceNumber: string;
  referenceYear: string;
  issueDate: string;
  dueDate: string;
  amount: string;
  status: DocumentRecord['status'];
  documentUrl: string;
  observations: string;
}

const emptyForm = (): DocumentForm => ({
  name: '',
  type: 'licensing',
  customTypeName: '',
  referenceNumber: '',
  referenceYear: String(new Date().getFullYear()),
  issueDate: '',
  dueDate: '',
  amount: '',
  status: 'pending',
  documentUrl: '',
  observations: ''
});

const statusLabel: Record<DocumentRecord['status'], string> = {
  pending: 'Pendente',
  paid: 'Pago',
  expired: 'Vencido',
  active: 'Ativo'
};

function typeLabel(document: DocumentRecord) {
  if (document.type === 'custom') return document.customTypeName || 'Personalizado';
  if (document.type === 'licensing') return 'Licenciamento';
  if (document.type === 'insurance') return 'Seguro';
  return 'IPVA';
}

export function DocumentsPage() {
  const { data, saveDocument, removeDocument } = useData();
  const { toast } = useToast();
  const [form, setForm] = useState<DocumentForm>(emptyForm);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const close = () => {
    setOpen(false);
    setError('');
    setForm(emptyForm());
  };
  const startEdit = (document: DocumentRecord) => {
    setForm({
      id: document.id,
      name: document.name,
      type: document.type,
      customTypeName: document.customTypeName ?? '',
      referenceNumber: document.referenceNumber ?? '',
      referenceYear: String(document.referenceYear),
      issueDate: document.issueDate ?? '',
      dueDate: document.dueDate ?? '',
      amount:
        document.amountCents === undefined
          ? ''
          : (document.amountCents / 100).toFixed(2).replace('.', ','),
      status: document.status,
      documentUrl: document.documentUrl ?? '',
      observations: document.observations
    });
    setError('');
    setOpen(true);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const amount = form.amount.trim() ? Number(form.amount.replace(',', '.')) : undefined;
      if (amount !== undefined && (!Number.isFinite(amount) || amount < 0))
        throw new Error('Informe um valor válido.');
      await saveDocument({
        id: form.id,
        name: form.name,
        type: form.type,
        customTypeName: form.type === 'custom' ? form.customTypeName : undefined,
        referenceNumber: form.referenceNumber || undefined,
        referenceYear: Number(form.referenceYear),
        issueDate: form.issueDate || undefined,
        dueDate: form.dueDate || undefined,
        amountCents: amount === undefined ? undefined : Math.round(amount * 100),
        status: form.status,
        documentUrl: form.documentUrl || undefined,
        observations: form.observations
      });
      toast(form.id ? 'Documento atualizado e sincronizado.' : 'Documento sincronizado.');
      close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar o documento.');
    } finally {
      setSaving(false);
    }
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setError('');
    try {
      await removeDocument(deleteId);
      setDeleteId(null);
      toast('Documento excluído e alertas recalculados.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível excluir o documento.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Papelada em ordem"
        title="Documentos"
        description="IPVA, licenciamento, seguro e registros anuais preservados no histórico."
        actions={
          <Button
            onClick={() => {
              setForm(emptyForm());
              setOpen(true);
            }}
          >
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
            <span>Pendentes</span>
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
              <Badge
                tone={
                  item.status === 'expired'
                    ? 'danger'
                    : item.status === 'pending'
                      ? 'warning'
                      : 'success'
                }
              >
                {statusLabel[item.status]}
              </Badge>
            </header>
            <span className="eyebrow">{typeLabel(item)}</span>
            <h2>{item.name}</h2>
            <dl>
              <div>
                <dt>Ano</dt>
                <dd>{item.referenceYear}</dd>
              </div>
              <div>
                <dt>Referência</dt>
                <dd>{item.referenceNumber || '—'}</dd>
              </div>
              <div>
                <dt>Emissão</dt>
                <dd>{formatDate(item.issueDate)}</dd>
              </div>
              <div>
                <dt>Vencimento</dt>
                <dd>{formatDate(item.dueDate)}</dd>
              </div>
              <div>
                <dt>Valor</dt>
                <dd>{item.amountCents !== undefined ? formatMoney(item.amountCents) : '—'}</dd>
              </div>
            </dl>
            {item.observations && <p className="document-observations">{item.observations}</p>}
            {item.documentUrl ? (
              <a href={item.documentUrl} target="_blank" rel="noreferrer">
                Abrir documento <ExternalLink />
              </a>
            ) : (
              <span className="no-link">Sem link externo</span>
            )}
            <div className="document-actions">
              <Button variant="secondary" onClick={() => startEdit(item)}>
                <Edit3 /> Editar
              </Button>
              <Button variant="ghost" onClick={() => setDeleteId(item.id)}>
                <Trash2 /> Excluir
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal
        open={open}
        onClose={close}
        title={form.id ? 'Editar documento' : 'Novo documento'}
        size="wide"
      >
        <form onSubmit={submit}>
          <div className="form-grid">
            <Input
              className="full"
              label="Nome"
              required
              placeholder="Ex.: Licenciamento 2027"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
            <Select
              label="Tipo"
              value={form.type}
              onChange={(event) =>
                setForm({ ...form, type: event.target.value as DocumentRecord['type'] })
              }
            >
              <option value="ipva">IPVA</option>
              <option value="licensing">Licenciamento</option>
              <option value="insurance">Seguro</option>
              <option value="custom">Personalizado</option>
            </Select>
            {form.type === 'custom' ? (
              <Input
                label="Tipo personalizado"
                required
                value={form.customTypeName}
                onChange={(event) => setForm({ ...form, customTypeName: event.target.value })}
              />
            ) : (
              <span />
            )}
            <Input
              label="Número / referência"
              value={form.referenceNumber}
              onChange={(event) => setForm({ ...form, referenceNumber: event.target.value })}
            />
            <Input
              label="Ano de referência"
              required
              type="number"
              min="1900"
              max="2200"
              value={form.referenceYear}
              onChange={(event) => setForm({ ...form, referenceYear: event.target.value })}
            />
            <Input
              label="Data de emissão"
              type="date"
              value={form.issueDate}
              onChange={(event) => setForm({ ...form, issueDate: event.target.value })}
            />
            <Input
              label="Vencimento"
              type="date"
              value={form.dueDate}
              onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
            />
            <Input
              label="Valor (R$)"
              inputMode="decimal"
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: event.target.value })}
            />
            <Select
              label="Situação"
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value as DocumentRecord['status'] })
              }
            >
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="expired">Vencido</option>
              <option value="active">Ativo</option>
            </Select>
            <Input
              className="full"
              label="URL do documento"
              type="url"
              value={form.documentUrl}
              onChange={(event) => setForm({ ...form, documentUrl: event.target.value })}
            />
            <Textarea
              className="full"
              label="Observações"
              value={form.observations}
              onChange={(event) => setForm({ ...form, observations: event.target.value })}
            />
          </div>
          {error && <p className="field-error">{error}</p>}
          <div className="form-actions">
            <Button type="button" variant="ghost" disabled={saving} onClick={close}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar documento'}
            </Button>
          </div>
        </form>
      </Modal>
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Excluir documento">
        <p>
          O documento sairá do histórico, do financeiro e dos alertas derivados. Esta ação exige
          confirmação explícita.
        </p>
        {error && <p className="field-error">{error}</p>}
        <div className="form-actions">
          <Button variant="ghost" disabled={deleting} onClick={() => setDeleteId(null)}>
            Cancelar
          </Button>
          <Button variant="danger" disabled={deleting} onClick={() => void confirmDelete()}>
            {deleting ? 'Excluindo…' : 'Excluir documento'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
