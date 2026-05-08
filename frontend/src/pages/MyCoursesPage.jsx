import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import api from '../services/api';
import './MyCoursesPage.css';

const MyCoursesPage = () => {
  const navigate = useNavigate();
  const [user] = useState(authService.getCurrentUser());
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get('/progress');
        setStats(res.data.stats);
      } catch {
        setStats({ phrases_completed: 0, completion_percentage: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const completionPercentage = stats?.completion_percentage || 0;
  const phrasesCompleted = stats?.phrases_completed || 0;

  return (
    <div className="mycourses-page">
      {/* Header */}
      <header className="mycourses-header">
        <div className="mycourses-header-inner">
          <img src="/mytime_logo.jpeg" alt="MyTime Inglês" className="mycourses-logo" />
          <div className="mycourses-header-right">
            {authService.isAdmin() && (
              <button
                onClick={() => navigate('/admin')}
                className="mycourses-admin-btn"
                title="Painel Admin"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                Painel Admin
              </button>
            )}
            <div className="mycourses-user-pill" onClick={() => navigate('/configuracoes')} style={{ cursor: 'pointer' }}>
              <div className="mycourses-user-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="mycourses-user-name">{user?.name?.split(' ')[0]}</span>
            </div>
            <button onClick={() => authService.logout()} className="mycourses-logout-btn" title="Sair">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mycourses-main">
        {/* Welcome Section */}
        <div className="mycourses-welcome">
          <h1 className="mycourses-greeting">
            {greeting}, <span className="mycourses-greeting-name">{user?.name?.split(' ')[0]}</span>!
          </h1>
          <p className="mycourses-subtitle">Continue sua jornada de aprendizado</p>
        </div>

        {/* Section Title */}
        <div className="mycourses-section-header">
          <h2 className="mycourses-section-title">Meus Cursos</h2>
          <span className="mycourses-course-count">1 curso</span>
        </div>

        {/* Courses Grid */}
        <div className="mycourses-grid">
          {/* Course Card */}
          <div
            className="mycourses-card"
            onClick={() => navigate('/dashboard')}
          >
            {/* Card Thumbnail */}
            <div className="mycourses-card-thumb">
              <img
                src="/fotoEdiane.jpeg"
                alt="Teacher Ediane - Inglês na Mala"
                className="mycourses-card-image"
              />
              <div className="mycourses-card-overlay">
                <div className="mycourses-card-play">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="mycourses-card-badge">Curso online</div>
            </div>

            {/* Card Info */}
            <div className="mycourses-card-info">
              <h3 className="mycourses-card-title">Inglês na Mala</h3>
              <p className="mycourses-card-teacher">com Teacher Ediane</p>

              {/* Progress */}
              <div className="mycourses-card-progress">
                <div className="mycourses-progress-bar">
                  <div
                    className="mycourses-progress-fill"
                    style={{ width: loading ? '0%' : `${completionPercentage}%` }}
                  />
                </div>
                <span className="mycourses-progress-text">
                  {loading ? '...' : `${phrasesCompleted}/25 frases · ${completionPercentage}%`}
                </span>
              </div>

              {/* CTA */}
              <div className="mycourses-card-cta">
                <span className="mycourses-cta-text">
                  {completionPercentage === 0 ? 'Começar' : 'Continuar'}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mycourses-footer">
        <p>&copy; {new Date().getFullYear()} MyTime Inglês. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default MyCoursesPage;
