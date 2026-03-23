
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navigation from './components/Navigation';
import DoneTab from './pages/DoneTab';
import ProjectTab from './pages/ProjectTab';
import AcademyTab from './pages/AcademyTab';

import { useAuth } from './context/AuthContext';
import { LogOut, User, X } from 'lucide-react';
import Auth from './components/auth/Auth';
import './App.css';

function App() {
  const [lang, setLang] = React.useState<'FR' | 'EN'>('EN');
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const { user, loading, signOut } = useAuth();

  React.useEffect(() => {
    if (user) setIsAuthModalOpen(false);
  }, [user]);

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="app-global-header" style={{ justifyContent: 'space-between' }}>
          <Link to="/done" className="brand-logo" style={{ textDecoration: 'none', color: 'inherit' }}><i>DoneApp</i></Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="lang-toggle-header">
              <button className={`lang-option ${lang === 'EN' ? 'active' : ''}`} onClick={() => setLang('EN')}>EN</button>
              <span style={{ color: '#eee', fontSize: '0.75rem' }}>/</span>
              <button className={`lang-option ${lang === 'FR' ? 'active' : ''}`} onClick={() => setLang('FR')}>FR</button>
            </div>
            {user ? (
              <button 
                onClick={signOut}
                className="header-icon-btn logout-btn"
                title={lang === 'FR' ? 'Déconnexion' : 'Logout'}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', display: 'flex', alignItems: 'center', padding: '4px' }}
              >
                <LogOut size={18} />
              </button>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="header-icon-btn login-btn"
                title={lang === 'FR' ? 'Se connecter' : 'Sign In'}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', display: 'flex', alignItems: 'center', padding: '4px' }}
              >
                <User size={18} />
              </button>
            )}
          </div>
        </header>

        {isAuthModalOpen && (
          <div className="auth-modal-overlay fade-in" onClick={() => setIsAuthModalOpen(false)}>
            <div className="auth-modal-content slide-up" onClick={e => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setIsAuthModalOpen(false)}>
                <X size={20} />
              </button>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 className="title-small" style={{ marginBottom: '8px' }}>
                  {lang === 'FR' ? 'Connexion' : 'Sign In'}
                </h2>
                <p style={{ color: 'var(--color-grey-text)', fontSize: '0.9rem' }}>
                  {lang === 'FR' ? 'Accédez à vos stratégies GTM.' : 'Access your GTM strategies.'}
                </p>
              </div>
              <Auth />
            </div>
          </div>
        )}

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/done" replace />} />
            <Route path="/done" element={<DoneTab lang={lang} onShowAuth={() => setIsAuthModalOpen(true)} />} />
            <Route path="/project/*" element={user ? <ProjectTab /> : <Navigate to="/done" replace />} />
            <Route path="/academy" element={<AcademyTab />} />
          </Routes>
        </main>
        
        <Navigation onShowAuth={() => setIsAuthModalOpen(true)} />
      </div>
    </BrowserRouter>
  );
}

export default App;
