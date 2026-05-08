import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/auth';
import Icon from '../components/shared/Icon';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user] = useState(authService.getCurrentUser());
  const [stats, setStats] = useState(null);
  const [phrases, setPhrases] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(() => (
    typeof window !== 'undefined' ? window.innerWidth > 768 : true
  ));

  const fetchData = useCallback(async () => {
    try {
      const [progressRes, phrasesRes, modulesRes] = await Promise.allSettled([
        api.get('/progress'),
        api.get('/progress/phrases'),
        api.get('/progress/modules')
      ]);

      if (progressRes.status === 'fulfilled') {
        setStats(progressRes.value.data.stats);
      } else {
        console.error('Erro ao buscar progresso:', progressRes.reason);
        if (progressRes.reason?.response?.status === 401) {
          authService.logout();
          return;
        }
        setStats({ phrases_studied: 0, phrases_completed: 0, completion_percentage: 0 });
      }

      if (phrasesRes.status === 'fulfilled') {
        setPhrases(phrasesRes.value.data.phrases);
      }

      if (modulesRes.status === 'fulfilled') {
        setModules(modulesRes.value.data.modules);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getLastStudiedPhrase = () => {
    if (!phrases.length) return null;
    const studied = phrases.filter(p => p.user_completed);
    if (!studied.length) return null;

    const toTimestamp = (value) => {
      const ts = value ? new Date(value).getTime() : 0;
      return Number.isNaN(ts) ? 0 : ts;
    };

    const lastCompleted = studied.reduce((latest, current) => {
      const latestTime = toTimestamp(latest.user_completed_at);
      const currentTime = toTimestamp(current.user_completed_at);

      if (currentTime === latestTime) {
        return Number(current.phrase_number) > Number(latest.phrase_number) ? current : latest;
      }
      return currentTime > latestTime ? current : latest;
    });

    const orderedPhrases = [...phrases].sort((a, b) => Number(a.phrase_number) - Number(b.phrase_number));
    const lastIndex = orderedPhrases.findIndex(p => Number(p.phrase_number) === Number(lastCompleted.phrase_number));
    if (lastIndex >= 0 && lastIndex < orderedPhrases.length - 1) {
      return orderedPhrases[lastIndex + 1];
    }

    return lastCompleted;
  };

  const getModuleProgress = (mod) => {
    const modulePhrases = phrases.filter(p => Number(p.module_id) === Number(mod.id));

    if (modulePhrases.length > 0) {
      const completed = modulePhrases.filter(p => p.user_completed).length;
      const total = modulePhrases.length;
      const percent = Math.round((completed / total) * 100);
      return { completed, total, percent };
    }

    const completed = parseInt(mod.phrases_completed, 10) || 0;
    const total = parseInt(mod.phrase_count, 10) || 0;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  };

  const handleModuleClick = (mod) => {
    if (mod.first_phrase_number) {
      navigate(`/lessons/${mod.first_phrase_number}`);
    }
  };

  const getModuleImage = (mod) => {
    if (!mod.image_url) return '/mytime_logo.jpeg';
    if (mod.image_url.startsWith('/uploads')) {
      const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || '';
      return `${BASE_URL}${mod.image_url}`;
    }
    return mod.image_url;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  const completedPercentage = stats?.completion_percentage || 0;
  const lastPhrase = getLastStudiedPhrase();
  const hasStarted = phrases.some(p => p.user_completed);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <img src="/mytime_logo.jpeg" alt="MyTime Inglês" className="sidebar-logo" />
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points={sidebarOpen ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <a className="sidebar-item active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span className="sidebar-label">Página Inicial</span>
          </a>
          {hasStarted && lastPhrase && (
            <a className="sidebar-item" onClick={() => navigate(`/lessons/${lastPhrase.phrase_number}`)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span className="sidebar-label">Continuar assistindo</span>
            </a>
          )}
          <a className="sidebar-item" href="https://wa.me/5535998183459?text=Gostaria%20de%20falar%20com%20o%20Suporte%20Mateus%20Bonette" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            <span className="sidebar-label">Falar com o suporte</span>
          </a>
          <a className="sidebar-item" href="https://www.instagram.com/teacher.ediane/" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
            <span className="sidebar-label">@teacher.ediane</span>
          </a>
          <a className="sidebar-item" onClick={() => navigate('/configuracoes')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span className="sidebar-label">Configurações</span>
          </a>
          {authService.isAdmin() && (
            <a className="sidebar-item" onClick={() => navigate('/admin')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span className="sidebar-label">Painel Admin</span>
            </a>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="sidebar-username">{user?.name}</span>
          </div>
          <button onClick={() => authService.logout()} className="sidebar-logout" title="Sair">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Botão abrir sidebar (desktop) */}
      {!sidebarOpen && (
        <button className="sidebar-open-btn" onClick={() => setSidebarOpen(true)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      )}

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Banner */}
        <div className="dashboard-banner">
          <div className="banner-content">
            <div className="banner-text">
              <div className="banner-brand-pill">
                <h2 className="banner-brand-title">Inglês na Mala</h2>
                <p className="banner-brand-sub">com Teacher Ediane</p>
              </div>
              <h1 className="banner-highlight">Guia Prático de Inglês<br/>Para Suas Viagens<br/>Internacionais</h1>
              <p className="banner-sub">25 frases essenciais com Teacher Ediane</p>
            </div>
            <div className="banner-visual">
              <img
                src="/teacher.ediane-IA.png"
                alt="Teacher Ediane"
                className="banner-teacher-img"
              />
            </div>
          </div>
        </div>

        {/* Continuar assistindo */}
        {hasStarted && lastPhrase && (
          <section className="section">
            <h2 className="section-title">Continuar assistindo</h2>
            <div className="continue-card" onClick={() => navigate(`/lessons/${lastPhrase.phrase_number}`)}>
              <div className="continue-thumb">
                <Icon name="headphones" size={36} color="#1E4BA0" />
              </div>
              <div className="continue-info">
                <span className="continue-lesson">Frase {lastPhrase.phrase_number}</span>
                <span className="continue-text">{lastPhrase.text_en}</span>
                <div className="continue-progress-bar">
                  <div
                    className="continue-progress-fill"
                    style={{ width: `${completedPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="continue-play">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </section>
        )}

        {/* Módulos do curso */}
        <section className="section">
          <h2 className="section-title">Módulos do Curso</h2>
          <div className="modules-grid">
            {modules.map((mod) => {
              const { completed, total, percent } = getModuleProgress(mod);
              return (
                <div
                  key={mod.id}
                  className="module-card"
                  onClick={() => handleModuleClick(mod)}
                >
                  <div className="module-thumb">
                    <img src={getModuleImage(mod)} alt={mod.name} className="module-thumb-img" />
                    {completed === total && total > 0 && (
                      <div className="module-badge-complete">
                        <Icon name="check" size={14} color="white" />
                      </div>
                    )}
                  </div>
                  <div className="module-info">
                    <h3 className="module-name">{mod.name}</h3>
                    <div className="module-progress">
                      <div className="module-progress-bar">
                        <div
                          className="module-progress-fill"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <span className="module-progress-text">
                        {completed}/{total} ({percent}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Seu progresso */}
        <section className="section">
          <h2 className="section-title">Seu Progresso</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #1E4BA0, #153a7a)' }}>
                <Icon name="headphones" size={24} color="white" />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats?.phrases_studied || 0}</span>
                <span className="stat-label">Frases estudadas</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <Icon name="check" size={24} color="white" />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats?.phrases_completed || 0}</span>
                <span className="stat-label">Frases completadas</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #E3242B, #c41d23)' }}>
                <Icon name="award" size={24} color="white" />
              </div>
              <div className="stat-info">
                <span className="stat-value">{completedPercentage}%</span>
                <span className="stat-label">Conclusão</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
