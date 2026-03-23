import { NavLink } from 'react-router-dom';
import { CheckCircle, FolderOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation = ({ onShowAuth }: { onShowAuth: () => void }) => {
  const { user } = useAuth();

  const handleProtectedClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      onShowAuth();
    }
  };

  return (
    <nav className="bottom-nav">
      <div className="nav-container">
        <NavLink 
          to="/done" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="nav-icon-wrapper">
            <CheckCircle size={20} strokeWidth={1.5} />
          </div>
          <span>Done</span>
        </NavLink>
        
        <NavLink 
          to="/project" 
          onClick={handleProtectedClick}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="nav-icon-wrapper">
            <FolderOpen size={20} strokeWidth={1.5} />
          </div>
          <span>Projects</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;
