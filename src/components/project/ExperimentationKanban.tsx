import { useState, useEffect } from 'react';
import { Plus, Calendar, Repeat, Flag, Hash, ChevronDown, Check, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const MiniDateRange = ({ startDate, endDate, onChange }: { startDate: string, endDate: string, onChange: (s: string, e: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => startDate ? new Date(startDate) : new Date());
  const [selecting, setSelecting] = useState<'start'|'end'>('start');

  const y = currentMonth.getFullYear();
  const m = currentMonth.getMonth();

  const handleDayClick = (dayStr: string) => {
    if (selecting === 'start' || !startDate) {
      onChange(dayStr, '');
      setSelecting('end');
    } else {
      if (new Date(dayStr) >= new Date(startDate)) {
        onChange(startDate, dayStr);
        setIsOpen(false);
      } else {
        onChange(dayStr, '');
        setSelecting('end');
      }
    }
  };

  const getDaysInMonth = () => {
    const d = new Date(y, m + 1, 0).getDate();
    return Array.from({length: d}).map((_, i) => `${y}-${String(m+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`);
  };

  const firstDay = new Date(y, m, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const days = getDaysInMonth();

  const formattedStr = () => {
    if (!startDate && !endDate) return 'Select range';
    const s = startDate ? startDate.split('-').reverse().slice(0,2).join('/') : '...';
    const e = endDate ? endDate.split('-').reverse().slice(0,2).join('/') : '...';
    return `${s} - ${e}`;
  };

  return (
    <div style={{ position: 'relative', outline: 'none' }} tabIndex={0} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) { setIsOpen(false); setSelecting('start'); } }}>
      <div onClick={() => { setIsOpen(!isOpen); setSelecting('start'); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: (startDate || endDate) ? 'var(--color-black)' : 'var(--color-grey-text)', cursor: 'pointer', fontSize: '0.75rem' }}>
        <Calendar size={12} style={{ opacity: (startDate || endDate) ? 1 : 0.4 }} />
        <span style={{ padding: '2px 4px', borderRadius: '4px', backgroundColor: isOpen ? 'var(--color-bg-grey)' : 'transparent', fontWeight: isOpen ? 500 : 400 }}>
           {formattedStr()}
        </span>
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: '12px', width: '220px', zIndex: 100, animation: 'fadeIn 0.2s ease', outline: 'none', cursor: 'default' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); setCurrentMonth(new Date(y, m - 1, 1)); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-grey-text)' }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, fontFamily: 'var(--font-title)' }}>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric'})}</span>
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); setCurrentMonth(new Date(y, m + 1, 1)); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-grey-text)' }}
              >
                <ChevronRight size={16} />
              </button>
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', fontSize: '0.65rem', color: '#a3a3a3', marginBottom: '8px', fontWeight: 500 }}>
             {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => <div key={d}>{d}</div>)}
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
             {Array.from({ length: offset }).map((_, i) => <div key={`empty-${i}`} />)}
             {days.map((dStr, i) => {
                const day = i + 1;
                const isStart = dStr === startDate;
                const isEnd = dStr === endDate;
                const isSel = isStart || isEnd;
                let isRng = false;
                if (startDate && endDate) {
                  isRng = new Date(dStr) > new Date(startDate) && new Date(dStr) < new Date(endDate);
                }

                return (
                  <button
                    key={dStr}
                    type="button"
                    onClick={() => handleDayClick(dStr)}
                    style={{
                      padding: '6px 0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit',
                      background: isSel ? 'var(--color-black)' : isRng ? 'var(--color-bg-grey)' : 'transparent',
                      color: isSel ? 'var(--color-bg-white)' : 'var(--color-black)',
                      fontWeight: isSel ? 600 : 400
                    }}
                    onMouseEnter={e => { if(!isSel && !isRng) e.currentTarget.style.background = 'var(--color-bg-grey)'; }}
                    onMouseLeave={e => { if(!isSel && !isRng) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {day}
                  </button>
                )
             })}
           </div>
        </div>
      )}
    </div>
  )
};

const PriorityDropdown = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = ['Low', 'Medium', 'High'];
  
  return (
    <div style={{ position: 'relative', outline: 'none' }} tabIndex={0} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsOpen(false); }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ border: 'none', background: 'transparent', color: 'inherit', fontSize: 'inherit', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0, outline: 'none', fontFamily: 'inherit' }}
      >
        {value} <ChevronDown size={10} style={{ opacity: 0.5 }} />
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px',
          background: 'var(--color-bg-white)', border: '1px solid var(--color-border)',
          borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          padding: '6px', minWidth: '100px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '2px', animation: 'fadeIn 0.2s ease', outline: 'none'
        }}>
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setIsOpen(false); }}
              style={{ padding: '6px 12px', textAlign: 'left', fontSize: '0.75rem', border: 'none', background: 'transparent', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: opt === value ? 'var(--color-black)' : 'var(--color-grey-text)', fontWeight: opt === value ? 500 : 400, fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-grey)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
               {opt === value ? <Check size={12}/> : <div style={{width:12}}/>} {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
import type { ProjectData } from '../../types';
import './StrategyKanban.css'; // Reuse Kanban styling

type Experiment = {
  id: string | number;
  col: string;
  title: string;
  desc: string;
  startDate: string;
  endDate: string;
  recurring: boolean;
  priority: string;
  channels: string;
};

const ExperimentationKanban = ({ 
  project, 
  onUpdateExperiments 
}: { 
  project?: ProjectData, 
  onUpdateExperiments?: (updated: Experiment[]) => void 
}) => {
  const columns = ['To do', 'In progress', 'Done'];
  const [showInputForCol, setShowInputForCol] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  
  const [tasks, setTasksState] = useState<Experiment[]>(() => {
    if (project?.strategy?.experiments) return project.strategy.experiments;
    
    try {
      const saved = localStorage.getItem('doneapp_experiments');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 1, col: 'To do', title: 'A/B Test Pricing Page', desc: 'Test $15 vs $19 price point', startDate: '', endDate: '', recurring: false, priority: 'High', channels: 'Website' },
      { id: 2, col: 'To do', title: 'Launch Product Hunt', desc: 'Prepare assets and copy', startDate: '', endDate: '', recurring: false, priority: 'Medium', channels: 'Product Hunt' },
      { id: 3, col: 'In progress', title: 'Email Drip Campaign', desc: 'Drafting onboarding sequence', startDate: '', endDate: '', recurring: true, priority: 'High', channels: 'Email' },
      { id: 4, col: 'Done', title: 'Landing Page v1', desc: 'Deploy initial version to Vercel', startDate: '', endDate: '', recurring: false, priority: 'Low', channels: 'Website' }
    ];
  });

  const [expandedTasks, setExpandedTasks] = useState<Record<string | number, boolean>>({});

  const setTasks = (newTasks: Experiment[]) => {
    setTasksState(newTasks);
    if (onUpdateExperiments) onUpdateExperiments(newTasks);
  };

  const toggleTask = (id: string | number) => {
    setExpandedTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveDescription = (id: string | number, newDesc: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, desc: newDesc } : t));
  };

  useEffect(() => {
    if (!project) {
      localStorage.setItem('doneapp_experiments', JSON.stringify(tasks));
    }
  }, [tasks, project]);
  
  const [draggedTaskId, setDraggedTaskId] = useState<string | number | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string | number) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.4';
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
    setDraggedTaskId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, col: string) => {
    e.preventDefault();
    if (draggedTaskId !== null) {
      setTasks(tasks.map(t => t.id === draggedTaskId ? { ...t, col } : t));
    }
    setDraggedTaskId(null);
  };

  const handleAddTask = (col: string) => {
    setShowInputForCol(col);
    setNewTitle('');
  };

  const confirmAddTask = (col: string) => {
    if (newTitle.trim()) {
      setTasks([{ id: Date.now(), col, title: newTitle.trim(), desc: 'Click to edit description', startDate: '', endDate: '', recurring: false, priority: 'Medium', channels: '' }, ...tasks]);
    }
    setShowInputForCol(null);
    setNewTitle('');
  };

  const updateTask = (id: string | number, field: keyof Experiment, val: any) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: val } : t));
  };

  const handleDeleteTask = (id: string | number) => {
    if (confirm('Are you sure you want to delete this experiment?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  return (
    <div className="strategy-kanban">
      <div className="kanban-board">
        {columns.map((col) => (
          <div 
            key={col} 
            className="kanban-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col)}
          >
            <div className="kanban-col-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{col}</h3>
              <button 
                onClick={() => handleAddTask(col)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-grey-text)' }}
                title={`Add task to ${col}`}
              >
                <Plus size={18} />
              </button>
            </div>
            
            <div className="kanban-cards">
              {showInputForCol === col && (
                <div className="kanban-card fade-in-up" style={{ padding: '16px', backgroundColor: 'var(--color-bg-grey)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <input
                    autoFocus
                    className="card-title"
                    placeholder="Experiment title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmAddTask(col);
                      if (e.key === 'Escape') setShowInputForCol(null);
                    }}
                    onBlur={() => { if(!newTitle) setShowInputForCol(null); }}
                    style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowInputForCol(null)} style={{ background: 'transparent', border: 'none', fontSize: '0.75rem', color: 'var(--color-grey-text)', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={() => confirmAddTask(col)} style={{ background: 'var(--color-bg-grey)', border: 'none', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer' }}>Add</button>
                  </div>
                </div>
              )}
              {tasks.filter(t => t.col === col).map(task => (
                <div 
                  key={task.id} 
                  className="kanban-card fade-in-up"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  style={{ cursor: 'grab' }}
                >
                  <div className="card-header">
                    <h4 
                      className="card-title" 
                      contentEditable 
                      suppressContentEditableWarning
                      onBlur={(e) => updateTask(task.id, 'title', e.currentTarget.textContent || 'Untitled')}
                      onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                      style={{ cursor: 'text', outline: 'none' }}
                    >
                      {task.title}
                    </h4>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      style={{ background: 'transparent', border: 'none', color: '#e2e2e2', cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#e2e2e2'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p 
                    className="card-description"
                    contentEditable={expandedTasks[task.id]}
                    suppressContentEditableWarning
                    style={{ 
                      cursor: expandedTasks[task.id] ? 'text' : 'pointer', 
                      outline: 'none', 
                      marginBottom: '12px',
                      display: '-webkit-box',
                      WebkitLineClamp: expandedTasks[task.id] ? 'unset' : 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '1em'
                    }}
                    onClick={(e) => {
                      if (expandedTasks[task.id]) {
                        e.stopPropagation();
                      } else {
                        toggleTask(task.id);
                      }
                    }}
                    onBlur={(e) => {
                      const newDesc = e.currentTarget.innerText;
                      if (newDesc !== task.desc) {
                        handleSaveDescription(task.id, newDesc);
                      }
                    }}
                  >
                    {task.desc}
                  </p>
                  
                  {/* Subtle Metadata Pill Row */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px dashed var(--color-border)', paddingTop: '12px', marginTop: '12px' }}>
                    
                    {/* Date Row */}
                    <MiniDateRange 
                      startDate={task.startDate} 
                      endDate={task.endDate} 
                      onChange={(s, e) => {
                        updateTask(task.id, 'startDate', s);
                        updateTask(task.id, 'endDate', e);
                      }}
                    />

                    {/* Pills Row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      
                      {/* Category Pill (Primary) */}
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#e2e2e2', color: 'var(--color-black)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.7rem', fontWeight: 500 }}>
                        <Hash size={10} />
                        <input type="text" placeholder="channel..." value={task.channels} onChange={e => updateTask(task.id, 'channels', e.target.value)} style={{ border: 'none', background: 'transparent', color: 'inherit', fontSize: 'inherit', outline: 'none', width: task.channels ? `${Math.max(task.channels.length + 1, 8)}ch` : '60px', fontWeight: 'inherit' }} />
                      </div>

                      {/* Priority Pill */}
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--color-bg-grey)', color: 'var(--color-grey-text)', padding: '4px 8px', borderRadius: '16px', fontSize: '0.7rem' }}>
                        <Flag size={10} />
                        <PriorityDropdown value={task.priority} onChange={(val) => updateTask(task.id, 'priority', val)} />
                      </div>

                      {/* Recurring Pill */}
                      <button onClick={() => updateTask(task.id, 'recurring', !task.recurring)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: 'none', backgroundColor: 'var(--color-bg-grey)', color: 'var(--color-grey-text)', padding: '4px 8px', borderRadius: '16px', fontSize: '0.7rem', cursor: 'pointer' }}>
                        <Repeat size={10} /> {task.recurring ? 'Recurring' : 'One-off'}
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperimentationKanban;
