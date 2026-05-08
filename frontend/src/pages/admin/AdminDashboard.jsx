import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../../services/auth';
import OverviewSection from './sections/OverviewSection';
import PhrasesSection from './sections/PhrasesSection';
import StudentsSection from './sections/StudentsSection';
import PurchasesSection from './sections/PurchasesSection';
import CreateStudentSection from './sections/CreateStudentSection';
import ModulesSection from './sections/ModulesSection';
import AdminSettingsSection from './sections/AdminSettingsSection';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { section } = useParams();
  const navigate = useNavigate();
  const [user] = useState(authService.getCurrentUser());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  const currentSection = section || 'overview';

  const menuItems = [
    { key: 'overview', label: 'Visao Geral', path: '/admin', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    )},
    { key: 'modulos', label: 'Modulos', path: '/admin/modulos', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    )},
    { key: 'frases', label: 'Todas as Frases', path: '/admin/frases', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
      </svg>
    )},
    { key: 'alunos', label: 'Alunos', path: '/admin/alunos', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )},
    { key: 'vendas', label: 'Vendas', path: '/admin/vendas', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    )},
    { key: 'criar-aluno', label: 'Criar Usuario', path: '/admin/criar-aluno', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
        <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
      </svg>
    )},
    { key: 'configuracoes', label: 'Minha Conta', path: '/admin/configuracoes', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    )},
  ];

  const handleSelectModule = (mod) => {
    setSelectedModule(mod);
    navigate('/admin/frases');
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'modulos': return <ModulesSection onSelectModule={handleSelectModule} />;
      case 'frases': return (
        <PhrasesSection
          filterModule={selectedModule}
          onBack={selectedModule ? () => { setSelectedModule(null); navigate('/admin/modulos'); } : null}
        />
      );
      case 'alunos': return <StudentsSection />;
      case 'vendas': return <PurchasesSection />;
      case 'criar-aluno': return <CreateStudentSection />;
      case 'configuracoes': return <AdminSettingsSection />;
      default: return <OverviewSection />;
    }
  };

  return (
    <div className="admin-layout">
      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <img src="/mytime_logo.jpeg" alt="MyTime" className="admin-sidebar-logo" />
          <span className="admin-sidebar-title">Painel Admin</span>
        </div>

        <nav className="admin-sidebar-nav">
          {menuItems.map(item => (
            <a
              key={item.key}
              className={`admin-sidebar-item ${currentSection === item.key ? 'active' : ''}`}
              onClick={() => { setSelectedModule(null); navigate(item.path); setSidebarOpen(false); }}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '12px 0', paddingTop: '12px' }}>
            <a
              className="admin-sidebar-item"
              href="/meus-cursos"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              <span>Ver Curso</span>
            </a>
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <span className="admin-sidebar-username">{user?.name?.split(' ')[0]}</span>
          </div>
          <button onClick={() => authService.logout()} className="admin-sidebar-logout" title="Sair">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <h1 className="admin-topbar-title">
            {selectedModule ? `Frases - ${selectedModule.name}` : (menuItems.find(m => m.key === currentSection)?.label || 'Visao Geral')}
          </h1>
        </header>

        <div className="admin-content">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
