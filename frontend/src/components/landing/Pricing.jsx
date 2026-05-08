import { useState } from 'react';
import Button from '../shared/Button';
import Icon from '../shared/Icon';
import './Pricing.css';

const Pricing = () => {
  const [loading, setLoading] = useState(false);

  const handleBuyNow = () => {
    setLoading(true);
    // Navegar para página de checkout
    window.location.href = '/checkout';
  };

  return (
    <section className="pricing" id="pricing">
      <div className="container">
        <h2 className="section-title">Invista em você hoje</h2>
        <p className="section-subtitle">
          Acesso vitalício ao curso completo com garantia de 7 dias
        </p>

        <div className="pricing-card">
          <div className="pricing-badge">PROMOÇÃO POR TEMPO LIMITADO</div>

          <div className="price-container">
            <span className="old-price">De R$ 97,00</span>
            <div className="current-price">
              <span className="currency">R$</span>
              <span className="value">34</span>
              <span className="cents">,90</span>
            </div>
            <span className="discount-badge">70% OFF</span>
          </div>

          <ul className="pricing-features">
            <li><Icon name="check" size={20} color="#10b981" /> 25 Frases Essenciais para Viagens</li>
            <li><Icon name="check" size={20} color="#10b981" /> 6 Módulos: Aeroporto, Hotel, Restaurante, Compras, Transporte e Emergências</li>
            <li><Icon name="check" size={20} color="#10b981" /> Áudios com pronúncia clara e didática para brasileiros</li>
            <li><Icon name="check" size={20} color="#10b981" /> Foco em compreensão e fala no contexto de viagem</li>
            <li><Icon name="check" size={20} color="#10b981" /> Acesso vitalício</li>
            <li><Icon name="check" size={20} color="#10b981" /> Funciona em todos os dispositivos</li>
            <li><Icon name="check" size={20} color="#10b981" /> Garantia de 7 dias</li>
          </ul>

          <Button
            variant="primary"
            size="xl"
            className="pricing-cta animate-pulse"
            onClick={handleBuyNow}
            disabled={loading}
          >
            {loading ? 'PROCESSANDO...' : 'SIM, EU QUERO APRENDER!'}
          </Button>

          <div className="guarantee-section">
            <div className="guarantee-icon">
              <Icon name="check" size={48} color="#10b981" />
            </div>
            <div>
              <h4>Garantia de 7 dias ou seu dinheiro de volta</h4>
              <p>Se você não gostar do curso, devolvemos 100% do seu investimento</p>
            </div>
          </div>

          <div className="payment-methods">
            <p>Formas de pagamento:</p>
            <div className="payment-icons">
              <span>Cartão de Crédito</span>
              <span>PIX</span>
              <span>Boleto</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
