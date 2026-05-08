import { useState, useEffect } from 'react';
import adminApi from '../../../services/adminApi';

const statusLabels = {
  '': 'Todas',
  'approved': 'Aprovada',
  'pending': 'Pendente',
  'rejected': 'Recusada',
  'refunded': 'Reembolsada',
};

const statusBadge = {
  'approved': 'admin-badge-success',
  'pending': 'admin-badge-warning',
  'rejected': 'admin-badge-error',
  'refunded': 'admin-badge-error',
  'cancelled': 'admin-badge-error',
};

const PurchasesSection = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.getPurchases(params);
      setPurchases(res.data.purchases || []);
    } catch {
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPurchases(); }, [statusFilter]);

  if (loading) return <div className="admin-loading">Carregando vendas...</div>;

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-header">
        <div className="admin-table-title">Vendas ({purchases.length})</div>
        <div className="admin-filters">
          {Object.entries(statusLabels).map(([value, label]) => (
            <button
              key={value}
              className={`admin-filter-btn ${statusFilter === value ? 'active' : ''}`}
              onClick={() => setStatusFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {purchases.length === 0 ? (
        <div className="admin-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <p>Nenhuma venda encontrada</p>
        </div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table admin-table-mobile admin-table-purchases">
            <thead>
              <tr>
                <th>#</th>
                <th>Aluno</th>
                <th>Email</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase, index) => (
                <tr key={purchase.id}>
                  <td data-label="#">{index + 1}</td>
                  <td data-label="Aluno"><strong>{purchase.name || '-'}</strong></td>
                  <td data-label="Email" style={{ color: '#64748b' }}>{purchase.email}</td>
                  <td data-label="Valor">R$ {Number(purchase.amount || 0).toFixed(2).replace('.', ',')}</td>
                  <td data-label="Status">
                    <span className={`admin-badge ${statusBadge[purchase.payment_status] || 'admin-badge-info'}`}>
                      {statusLabels[purchase.payment_status] || purchase.payment_status}
                    </span>
                  </td>
                  <td data-label="Data">{new Date(purchase.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PurchasesSection;
