import { useRef } from 'react';
import './Hero.css';
import Button from '../shared/Button';
import Icon from '../shared/Icon';

const Hero = () => {
  const videoRef = useRef(null);

  const handleVideoClick = () => {
    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        videoEl.play().catch(() => {});
      }, 500);
    }
  };

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-brand">
            <h2 className="brand-name">Inglês na Mala</h2>
            <p className="brand-sub">com Teacher Ediane</p>
          </div>

          <p className="hero-guide animate-slideInUp">
            Guia Prático de Inglês Para Suas Viagens Internacionais
          </p>

          <h1 className="hero-title animate-slideInUp">
            Domine as <span className="text-gradient">25 Frases Essenciais</span>{' '}
            para sua Próxima Viagem Internacional
          </h1>

          <p className="hero-subtitle animate-slideInUp">
            Áudios com pronúncia clara e didática para brasileiros.
            Foco em compreensão e fala no contexto de viagem.
          </p>

          <div className="hero-video-header animate-slideInUp" onClick={handleVideoClick} style={{ cursor: 'pointer' }}>
            <span className="hero-video-label">
              <Icon name="play" size={22} color="#1E4BA0" />
              Assista ao Vídeo
            </span>
          </div>

          <div className="hero-video animate-slideInUp">
            <video
              ref={videoRef}
              width="100%"
              height="100%"
              controls
              poster="/ediane.jpeg"
              preload="metadata"
            >
              <source src="/VideoApresentacaoTeacherEdiane.mp4" type="video/mp4" />
              Seu navegador não suporta vídeos HTML5.
            </video>
          </div>

          <Button
            variant="primary"
            size="xl"
            className="hero-cta animate-pulse"
            onClick={() => {
              document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            QUERO APRENDER AGORA R$ 34,90
          </Button>

          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <a
              href="/login"
              style={{
                display: 'inline-block',
                padding: '12px 28px',
                border: '2px solid #1E4BA0',
                borderRadius: '50px',
                color: '#1E4BA0',
                fontWeight: '600',
                fontSize: '14px',
                textDecoration: 'none',
                background: 'transparent',
              }}
            >
              Já comprou o Inglês na Mala? Clique aqui
            </a>
          </div>

          <div className="hero-badges">
            <div className="badge">
              <div className="badge-icon">
                <Icon name="plane" size={24} color="#1E4BA0" />
              </div>
              <span>Inglês para viagens</span>
            </div>
            <div className="badge">
              <div className="badge-icon">
                <Icon name="headphones" size={24} color="#1E4BA0" />
              </div>
              <span>Áudios em Inglês</span>
            </div>
            <div className="badge">
              <div className="badge-icon">
                <Icon name="clock" size={24} color="#1E4BA0" />
              </div>
              <span>Acesso vitalício</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
