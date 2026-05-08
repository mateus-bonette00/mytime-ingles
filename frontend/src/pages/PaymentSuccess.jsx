import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './PaymentStatus.css';

const getPurchaseId = (searchParams) => {
  return (
    searchParams.get('external_reference')
    || searchParams.get('purchase_id')
    || sessionStorage.getItem('mytime_purchase_id')
    || ''
  );
};

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const purchaseId = useMemo(() => getPurchaseId(searchParams), [searchParams]);
  const [verifiedStatus, setVerifiedStatus] = useState('loading');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!purchaseId) {
        setVerifiedStatus('approved');
        return;
      }

      try {
        const response = await api.get(`/payments/status/${purchaseId}`);
        const status = response.data.status;

        if (status === 'pending') {
          setVerifiedStatus('pending');
        } else {
          setVerifiedStatus('approved');
        }
      } catch {
        setVerifiedStatus('approved');
      }
    };

    verifyPayment();
  }, [purchaseId]);

  useEffect(() => {
    if (purchaseId) {
      sessionStorage.setItem('mytime_purchase_id', purchaseId);
    }
  }, [purchaseId]);

  useEffect(() => {
    if (verifiedStatus === 'pending') {
      const query = purchaseId ? `?purchase_id=${encodeURIComponent(purchaseId)}` : '';
      navigate(`/pagamento/pendente${query}`);
    }
  }, [verifiedStatus, navigate, purchaseId]);

  if (verifiedStatus === 'loading') {
    return (
      <div className="payment-status-page">
        <div className="payment-status-container">
          <div className="status-icon pending">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="40" fill="#0EA5E9" fillOpacity="0.1"/>
              <path d="M40 20v20l15 10" stroke="#0EA5E9" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>
          <h1>Verificando pagamento...</h1>
          <p className="status-subtitle">Aguarde enquanto confirmamos seu pagamento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-status-page">
      <div className="payment-status-container">
        <div className="status-icon success">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="40" fill="#10B981" fillOpacity="0.1"/>
            <path d="M25 40L35 50L55 30" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1>Pagamento Aprovado!</h1>
        <p className="status-subtitle">
          Parabéns! Sua compra foi confirmada com sucesso.
        </p>

        <div className="status-card">
          <div className="status-info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#10B981"/>
            </svg>
            <div>
              <h3>Verifique seu e-mail</h3>
              <p>
                Enviamos um e-mail para o endereço cadastrado na compra com o link para criar sua senha e acessar o curso.
              </p>
            </div>
          </div>

          <div className="status-info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" fill="currentColor"/>
            </svg>
            <div>
              <h3>Próximos Passos</h3>
              <p>
                1. Abra o e-mail que enviamos para você<br/>
                2. Clique no link para criar sua senha<br/>
                3. Faça login e acesse o curso imediatamente
              </p>
            </div>
          </div>

          <div className="status-warning">
            <p><strong>IMPORTANTE:</strong> Verifique também a pasta de spam caso não encontre o e-mail na caixa de entrada.</p>
          </div>
        </div>

        <div className="status-actions">
          <button onClick={() => navigate('/login')} className="btn-primary">
            IR PARA LOGIN
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary">
            VOLTAR PARA INÍCIO
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
