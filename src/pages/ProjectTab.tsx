import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import StrategyKanban from '../components/project/StrategyKanban';
import ExperimentationKanban from '../components/project/ExperimentationKanban';
import ContentCalendar from '../components/project/ContentCalendar';
import ToDoList from '../components/project/ToDoList';
import { Share, Printer, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import type { ProjectData } from '../types';
import { supabase } from '../supabase';
import './ProjectTab.css';

const ProjectAccordion = ({ 
  project, 
  isExpanded, 
  onToggle, 
  onUpdateProject, 
  onDeleteProject,
  onUpdateProjectData 
}: { 
  project: ProjectData, 
  isExpanded: boolean, 
  onToggle: () => void, 
  onUpdateProject: (id: string, newName: string) => void, 
  onDeleteProject: (id: string) => void,
  onUpdateProjectData: (id: string, key: string, data: any[]) => void
}) => {
  const [activeTab, setActiveTab] = useState<'strategy'|'experimentation'|'content'|'todo'>('strategy');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (isExpanded && customEvent.detail) {
        setActiveTab(customEvent.detail as any);
      }
    };
    window.addEventListener('switch-tab', handleSwitchTab);
    return () => window.removeEventListener('switch-tab', handleSwitchTab);
  }, [isExpanded]);

  return (
    <div className={`project-accordion-item ${isExpanded ? 'expanded' : ''} slide-up`}>
      <div className="project-accordion-header" onClick={onToggle}>
        <div className="project-header-info">
          <h3 
            className="project-card-title editable-title"
            contentEditable
            suppressContentEditableWarning
            onClick={(e) => e.stopPropagation()}
            onBlur={(e) => {
              const newName = e.currentTarget.textContent?.trim();
              if (newName && newName !== project.name) {
                onUpdateProject(project.id, newName);
              } else if (!newName && e.currentTarget.textContent !== project.name) {
                e.currentTarget.textContent = project.name;
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
          >
            {project.name}
          </h3>
          <p className="project-card-date">{new Date(project.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="project-header-right">
          {isExpanded && (
            <div className="project-accordion-actions" onClick={(e) => e.stopPropagation()}>
              <button className="action-btn icon-only" onClick={() => window.print()} title="Print">
                <Printer size={16} strokeWidth={1.5} />
              </button>
              <button className="action-btn icon-only" title="Share">
                <Share size={16} strokeWidth={1.5} />
              </button>
              <button className="action-btn icon-only" onClick={() => setShowDeleteConfirm(true)} title="Delete Strategy">
                <Trash2 size={16} strokeWidth={1.5} />
              </button>
            </div>
          )}
          <div className="project-header-icon">
            {isExpanded ? <ChevronUp size={20} strokeWidth={1.5} /> : <ChevronDown size={20} strokeWidth={1.5} />}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="subtle-modal-overlay fade-in-up" onClick={() => setShowDeleteConfirm(false)}>
          <div className="subtle-modal-content" onClick={e => e.stopPropagation()}>
            <p>Delete this project permanently?</p>
            <div className="subtle-modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn-danger" onClick={() => { setShowDeleteConfirm(false); onDeleteProject(project.id); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
      
      {isExpanded && (
        <div className="project-accordion-content">
          <div className="project-sub-nav">
            <button className={`sub-nav-item ${activeTab === 'strategy' ? 'active' : ''}`} onClick={() => setActiveTab('strategy')}>Strategy</button>
            <button className={`sub-nav-item ${activeTab === 'experimentation' ? 'active' : ''}`} onClick={() => setActiveTab('experimentation')}>Experiments</button>
            <button className={`sub-nav-item ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>Content</button>
            <button className={`sub-nav-item ${activeTab === 'todo' ? 'active' : ''}`} onClick={() => setActiveTab('todo')}>To do</button>
          </div>
          
          <div className="project-content-area">
            {activeTab === 'strategy' && (
              <StrategyKanban 
                project={project} 
                onUpdateCard={(cardId, newContent) => {
                  const updatedCards = project.strategy.cards.map((c: any) => 
                    (c.id === cardId || c.index === cardId) ? { ...c, content: newContent } : c
                  );
                  onUpdateProjectData(project.id, 'cards', updatedCards);
                }} 
              />
            )}
            {activeTab === 'experimentation' && (
              <ExperimentationKanban 
                project={project} 
                onUpdateExperiments={(updatedExperiments) => {
                  onUpdateProjectData(project.id, 'experiments', updatedExperiments);
                }}
              />
            )}
            {activeTab === 'content' && (
              <ContentCalendar 
                project={project} 
                onUpdateContent={(updatedContent) => {
                  onUpdateProjectData(project.id, 'content', updatedContent);
                }}
              />
            )}
            {activeTab === 'todo' && (
              <ToDoList 
                project={project} 
                onUpdateTodo={(updatedTodo) => {
                  onUpdateProjectData(project.id, 'todo', updatedTodo);
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectList = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(error);
    } else {
      const mapped = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        idea: p.idea,
        createdAt: p.created_at,
        strategy: p.strategy_json
      }));
      setProjects(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleToggle = (projectId: string) => {
    if (id === projectId) {
      navigate('/project');
    } else {
      navigate(`/project/${projectId}`);
    }
  };

  const handleUpdateProject = async (projectId: string, newName: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ name: newName })
      .eq('id', projectId);
    
    if (error) console.error(error);
    else fetchProjects();
  };

  const handleUpdateProjectData = async (projectId: string, key: string, data: any[]) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedStrategy = { 
      ...project.strategy, 
      [key]: data 
    };

    const { error } = await supabase
      .from('projects')
      .update({ strategy_json: updatedStrategy })
      .eq('id', projectId);
    
    if (error) {
      console.error(error);
    } else {
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, strategy: updatedStrategy } : p
      ));
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    
    if (error) console.error(error);
    else {
      fetchProjects();
      if (id === projectId) navigate('/project');
    }
  };

  if (loading) return <div className="container"><p>Loading projects...</p></div>;

  return (
    <div className="container project-list-container">
      {projects.length === 0 ? (
        <div className="empty-state">
          <p className="text-muted">No projects generated yet.</p>
          <button className="btn-primary" style={{marginTop: '1rem'}} onClick={() => navigate('/done')}>
            Generate New Strategy
          </button>
        </div>
      ) : (
        <div className="projects-list">
          {projects.map((p) => (
            <ProjectAccordion 
              key={p.id} 
              project={p} 
              isExpanded={id === p.id} 
              onToggle={() => handleToggle(p.id)}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              onUpdateProjectData={handleUpdateProjectData}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectTab = () => {
  return (
    <Routes>
      <Route path="/" element={<ProjectList />} />
      <Route path="/:id/*" element={<ProjectList />} />
    </Routes>
  );
};

export default ProjectTab;
