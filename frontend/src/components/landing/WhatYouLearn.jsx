import './WhatYouLearn.css';
import Icon from '../shared/Icon';

const WhatYouLearn = () => {
  const highlights = [
    {
      icon: 'headphones',
      color: '#1E4BA0',
      text: 'Áudios com pronúncia clara e didática para brasileiros'
    },
    {
      icon: 'globe',
      color: '#E3242B',
      text: 'Áudios com foco em compreensão e fala no contexto de viagem'
    }
  ];

  const modules = [
    {
      name: 'Aeroporto e Imigração',
      image: '/Aeroporto e Imigração.png',
      phrases: 7,
      description: 'Check-in, segurança, embarque e imigração'
    },
    {
      name: 'Hotel',
      image: '/hotel.png',
      phrases: 4,
      description: 'Reservas, check-in, pedidos e checkout'
    },
    {
      name: 'Restaurante',
      image: '/restaurante.png',
      phrases: 4,
      description: 'Pedidos, cardápio e conta'
    },
    {
      name: 'Compras',
      image: '/compras.png',
      phrases: 4,
      description: 'Preços, tamanhos e pagamentos'
    },
    {
      name: 'Transporte',
      image: '/transportes.png',
      phrases: 4,
      description: 'Táxi, ônibus, metrô e direções'
    },
    {
      name: 'Emergências',
      image: '/Emergências.png',
      phrases: 2,
      description: 'Situações urgentes e pedidos de ajuda'
    }
  ];

  return (
    <section className="what-you-learn">
      <div className="container">
        <h2 className="section-title">O que você vai aprender</h2>
        <p className="section-subtitle">
          25 frases essenciais separadas em 6 módulos para você se comunicar com confiança em suas viagens
        </p>

        {/* Highlights */}
        <div className="highlights-row">
          {highlights.map((h, i) => (
            <div key={i} className="highlight-card">
              <div className="highlight-icon" style={{ backgroundColor: `${h.color}15` }}>
                <Icon name={h.icon} size={32} color={h.color} />
              </div>
              <p className="highlight-text">{h.text}</p>
            </div>
          ))}
        </div>

        {/* Modules Grid */}
        <h3 className="modules-section-title">Módulos do Curso</h3>
        <div className="modules-landing-grid">
          {modules.map((mod, index) => (
            <div key={index} className="module-landing-card">
              <div className="module-landing-thumb">
                <img src={mod.image} alt={mod.name} className="module-landing-img" />
              </div>
              <div className="module-landing-info">
                <h4 className="module-landing-name">{mod.name}</h4>
                <p className="module-landing-desc">{mod.description}</p>
                <span className="module-landing-count">{mod.phrases} frases</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatYouLearn;
