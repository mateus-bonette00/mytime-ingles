import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './PaymentStatus.css';

const PaymentPending = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const purchaseId = (
      searchParams.get('external_reference')
      || searchParams.get('purchase_id')
      || sessionStorage.getItem('mytime_purchase_id')
    );

    if (!purchaseId) return;

    const checkStatus = async () => {
      try {
        const response = await api.get(`/payments/status/${purchaseId}`);
        const currentStatus = response.data.status;

        if (currentStatus === 'approved') {
          navigate(`/pagamento/sucesso?purchase_id=${encodeURIComponent(purchaseId)}`);
        }
      } catch {
        // Manter como pendente
      }
    };

    checkStatus();

    // Verificar a cada 15 segundos se o status mudou
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [searchParams, navigate]);

  return (
    <div className="payment-status-page">
      <div className="payment-status-container">
        <div className="status-icon pending">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="40" fill="#FFA500" fillOpacity="0.1"/>
            <path d="M40 20v20l15 10" stroke="#FFA500" strokeWidth="4" strokeLinecap="round"/>
          </svg>
        </div>

        <h1>Pagamento Pendente</h1>
        <p className="status-subtitle">
          Seu pagamento está sendo processado.
        </p>

        <div className="status-card">
          <div className="status-info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" fill="#FFA500"/>
            </svg>
            <div>
              <h3>Aguardando Confirmação</h3>
              <p>
                Estamos aguardando a confirmação do pagamento. Isso pode levar alguns minutos ou até 2 dias úteis, dependendo do método escolhido.
              </p>
            </div>
          </div>

          <div className="status-info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#FFA500"/>
            </svg>
            <div>
              <h3>Cadastro liberado após aprovação</h3>
              <p>Assim que o pagamento for aprovado, você poderá criar sua conta na tela de sucesso usando o e-mail e CPF da compra.</p>
            </div>
          </div>

          <div className="status-warning warning-orange">
            <p><strong>DICA:</strong> Verifique o status do pagamento no app ou site do Mercado Pago. Esta página verifica automaticamente a cada 15 segundos.</p>
          </div>
        </div>

        <div className="status-actions">
          <button onClick={() => navigate('/')} className="btn-primary">
            VOLTAR PARA INÍCIO
          </button>
        </div>

        <p className="status-note">
          Tem dúvidas? Entre em contato conosco através do e-mail de suporte.
        </p>
      </div>
    </div>
  );
};

export default PaymentPending;
