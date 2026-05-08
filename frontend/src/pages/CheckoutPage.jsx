import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/shared/Button';
import Icons from '../components/shared/Icons';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
  });

  const formatCpf = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'cpf' ? formatCpf(value) : value;

    setFormData(prev => ({
      ...prev,
      [name]: nextValue,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cpfDigits = formData.cpf.replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
      setError('Digite um CPF válido com 11 números.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/payments/create-preference', {
        name: formData.name,
        email: formData.email,
        cpf: cpfDigits,
      });

      const data = response.data;

      // Salvar purchase_id para consultar status depois do retorno do MP
      sessionStorage.setItem('mytime_purchase_id', data.purchase_id);
      sessionStorage.setItem('mytime_purchase_email', formData.email.trim().toLowerCase());
      sessionStorage.setItem('mytime_purchase_cpf', cpfDigits);

      // Redirecionar para o Mercado Pago
      window.location.href = data.initPoint;

    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      const msg = err.response?.data?.error || 'Erro ao processar pagamento. Por favor, tente novamente.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <img src="/mytime_logo.jpeg" alt="MyTime Inglês" className="checkout-logo" onClick={() => navigate('/')} />
          <h1>Finalizar Compra</h1>
          <p>Você está a um passo de aprender inglês para viagens!</p>
        </div>

        <div className="checkout-content">
          <div className="checkout-summary">
            <h2>Resumo do Pedido</h2>
            <div className="summary-item">
              <span>Inglês na Mala com Teacher Ediane</span>
              <span className="old-price">R$ 97,00</span>
            </div>
            <div className="summary-item discount">
              <span>Desconto (64% OFF)</span>
              <span>-R$ 62,10</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-total">
              <span>Total</span>
              <span className="total-price">R$ 34,90</span>
            </div>

            <div className="summary-features">
              <h3>O que está incluso:</h3>
              <ul>
                <li><Icons.Check /> 25 Frases Essenciais</li>
                <li><Icons.Check /> Áudios nativos</li>
                <li><Icons.Check /> Acesso vitalício</li>
                <li><Icons.Check /> Garantia de 7 dias</li>
              </ul>
            </div>

            <div className="guarantee-badge">
              <Icons.Shield />
              <span>Compra 100% segura</span>
            </div>
          </div>

          <div className="checkout-form-container">
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-section">
                <h3>Suas Informações</h3>

                <div className="form-group">
                  <label htmlFor="name">Nome Completo</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">E-mail</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cpf">CPF</label>
                  <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                    required
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Forma de Pagamento</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                  Após preencher seus dados, você será redirecionado para o Mercado Pago onde poderá escolher entre PIX, Cartão de Crédito ou Boleto.
                </p>
                <div className="payment-icons-preview">
                  <span className="payment-preview-item">
                    <Icons.Pix />
                    <span>PIX</span>
                  </span>
                  <span className="payment-preview-item">
                    <Icons.CreditCard />
                    <span>Cartão</span>
                  </span>
                  <span className="payment-preview-item">
                    <Icons.Document />
                    <span>Boleto</span>
                  </span>
                </div>
              </div>

              {error && (
                <div className="checkout-error">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="xl"
                className="checkout-submit"
                disabled={loading}
              >
                {loading ? 'PROCESSANDO...' : 'FINALIZAR COMPRA'}
              </Button>

              <p className="checkout-guarantee">
                <Icons.Shield />
                Garantia de 7 dias ou seu dinheiro de volta
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
