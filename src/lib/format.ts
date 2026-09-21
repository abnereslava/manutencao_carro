export const formatKm = (value: number) => `${value.toLocaleString('pt-BR')} km`;
export const formatMoney = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`))
    : '—';
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
