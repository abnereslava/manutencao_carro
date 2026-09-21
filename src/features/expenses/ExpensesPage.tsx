import { ArrowDownRight, ArrowUpRight, CircleDollarSign, Receipt, RotateCcw } from 'lucide-react';
import { useData } from '../../app/providers/DataProvider';
import { PageHeader } from '../../components/layout/AppShell';
import { Badge, Card } from '../../components/ui';
import { calculateExpense } from '../../domain/expenses';
import { formatDate, formatMoney } from '../../lib/format';

export function ExpensesPage() {
  const { data } = useData();
  const maintenance = data.occurrences.map((item) => ({
    item,
    amount: calculateExpense(item.expense!)
  }));
  const documentsTotal = data.documents.reduce((sum, item) => sum + (item.amountCents ?? 0), 0);
  const gross =
    maintenance.reduce((sum, row) => sum + row.amount.grossAmountCents, 0) + documentsTotal;
  const refunded = maintenance.reduce((sum, row) => sum + row.amount.refundedAmountCents, 0);
  const net = gross - refunded;
  return (
    <>
      <PageHeader
        eyebrow="Vida financeira"
        title="Gastos"
        description="Custos reais, estornos e onde o dinheiro foi parar."
      />
      <div className="money-cards">
        <Card>
          <span className="row-icon">
            <CircleDollarSign />
          </span>
          <div>
            <small>Gasto líquido</small>
            <strong>{formatMoney(net)}</strong>
            <span>Todo o histórico</span>
          </div>
        </Card>
        <Card>
          <span className="row-icon warning">
            <ArrowUpRight />
          </span>
          <div>
            <small>Gasto bruto</small>
            <strong>{formatMoney(gross)}</strong>
            <span>Antes de estornos</span>
          </div>
        </Card>
        <Card>
          <span className="row-icon success">
            <ArrowDownRight />
          </span>
          <div>
            <small>Total estornado</small>
            <strong>{formatMoney(refunded)}</strong>
            <span>Parcial + total</span>
          </div>
        </Card>
      </div>
      <div className="expense-layout">
        <Card className="expense-chart">
          <div className="section-title">
            <h2>Distribuição por categoria</h2>
            <span>Histórico completo</span>
          </div>
          <div
            className="donut"
            style={{ '--parts': '38%', '--labor': '62%' } as React.CSSProperties}
          >
            <div>
              <strong>{formatMoney(net)}</strong>
              <span>Total</span>
            </div>
          </div>
          <div className="chart-legend">
            <span>
              <i className="parts" />
              Peças
              <b>
                {formatMoney(
                  maintenance.reduce(
                    (sum, row) => sum + (row.item.expense?.partsTotalCents ?? 0),
                    0
                  )
                )}
              </b>
            </span>
            <span>
              <i className="labor" />
              Mão de obra
              <b>
                {formatMoney(
                  maintenance.reduce((sum, row) => sum + (row.item.expense?.laborCostCents ?? 0), 0)
                )}
              </b>
            </span>
            <span>
              <i className="docs" />
              Documentos<b>{formatMoney(documentsTotal)}</b>
            </span>
          </div>
        </Card>
        <section>
          <div className="section-title">
            <h2>Movimentações recentes</h2>
          </div>
          <Card className="list-card expense-list">
            {maintenance.map(({ item, amount }) => (
              <div className="list-row" key={item.id}>
                <span className="row-icon">
                  <Receipt />
                </span>
                <div>
                  <b>
                    {
                      data.maintenancePlans.find((plan) => plan.id === item.maintenancePlanId)
                        ?.title
                    }
                  </b>
                  <small>
                    {formatDate(item.performedDate)} · {item.workshopOrProvider}
                  </small>
                </div>
                <div className="money-row">
                  <b>{formatMoney(amount.netAmountCents)}</b>
                  {amount.refundedAmountCents > 0 && (
                    <Badge tone="warning">
                      <RotateCcw />
                      Estorno
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {data.documents.map((item) => (
              <div className="list-row" key={item.id}>
                <span className="row-icon">
                  <Receipt />
                </span>
                <div>
                  <b>{item.name}</b>
                  <small>Documento · {item.referenceYear}</small>
                </div>
                <b>{formatMoney(item.amountCents ?? 0)}</b>
              </div>
            ))}
          </Card>
        </section>
      </div>
    </>
  );
}
