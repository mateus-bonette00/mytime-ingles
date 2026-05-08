import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './PaymentStatus.css';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Verificar se o pagamento na verdade foi aprovado (raro mas possível)
    const purchaseId = (
      searchParams.get('external_reference')
      || searchParams.get('purchase_id')
      || sessionStorage.getItem('mytime_purchase_id')
    );

    if (!purchaseId) return;

    const checkStatus = async () => {
      try {
        const response = await api.get(`/payments/status/${purchaseId}`);
        if (response.data.status === 'approved') {
          navigate(`/pagamento/sucesso?purchase_id=${encodeURIComponent(purchaseId)}`);
        }
      } catch {
        // Manter na pagina de falha
      }
    };

    checkStatus();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    sessionStorage.removeItem('mytime_purchase_id');
    sessionStorage.removeItem('mytime_purchase_email');
    sessionStorage.removeItem('mytime_purchase_cpf');
    navigate('/checkout');
  };

  return (
    <div className="payment-status-page">
      <div className="payment-status-container">
        <div className="status-icon failure">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="40" fill="#EF4444" fillOpacity="0.1"/>
            <path d="M50 30L30 50M30 30L50 50" stroke="#EF4444" strokeWidth="4" strokeLinecap="round"/>
          </svg>
        </div>

        <h1>Pagamento Não Aprovado</h1>
        <p className="status-subtitle">
          Não foi possível processar seu pagamento.
        </p>

        <div className="status-card">
          <div className="status-info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="#EF4444"/>
            </svg>
            <div>
              <h3>Possíveis Motivos</h3>
              <p>
                - Saldo insuficiente<br/>
                - Dados do cartão incorretos<br/>
                - Limite de crédito atingido<br/>
                - Recusado pelo banco emissor
              </p>
            </div>
          </div>

          <div className="status-info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#0EA5E9"/>
            </svg>
            <div>
              <h3>O Que Fazer Agora?</h3>
              <p>
                1. Verifique os dados do pagamento<br/>
                2. Tente novamente com outro método<br/>
                3. Entre em contato com seu banco<br/>
                4. Ou entre em contato conosco para ajuda
              </p>
            </div>
          </div>

          <div className="status-warning warning-red">
            <p><strong>IMPORTANTE:</strong> Nenhum valor foi cobrado da sua conta.</p>
          </div>
        </div>

        <div className="status-actions">
          <button onClick={handleRetry} className="btn-primary">
            TENTAR NOVAMENTE
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary">
            VOLTAR PARA INÍCIO
          </button>
        </div>

        <p className="status-note">
          Precisa de ajuda? Entre em contato com nosso suporte.
        </p>
      </div>
    </div>
  );
};

export default PaymentFailure;
