import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ChevronDown, Check } from 'lucide-react';
import type { ProjectData } from '../../types';

type ViewMode = 'Quarter' | 'Month' | 'Week' | 'Day';
type ContentPost = { id: string; date: string; theme: string; content: string; category: string; link: string; experiment: string; };

const ExperimentDropdown = ({ value, onChange, options }: { value: string; onChange: (val: string) => void; options: {id: string | number, title: string}[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedTheme = options.find(o => String(o.id) === value)?.title || 'Linked experiment...';

  return (
    <div style={{ position: 'relative', outline: 'none' }} tabIndex={0} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsOpen(false); }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: 'none', backgroundColor: 'var(--color-bg-grey)', fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: value ? 'inherit' : '#a3a3a3' }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedTheme}</span>
        <ChevronDown size={14} color="#a3a3a3" />
      </div>
      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px',
          background: 'var(--color-bg-white)', border: '1px solid var(--color-border)',
          borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          padding: '6px', zIndex: 110, display: 'flex', flexDirection: 'column', gap: '2px', animation: 'fadeIn 0.2s ease', maxHeight: '200px', overflowY: 'auto'
        }}>
          <button type="button" onClick={() => { onChange(''); setIsOpen(false); }}
             style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.9rem', border: 'none', background: 'transparent', borderRadius: '8px', cursor: 'pointer', color: !value ? 'var(--color-black)' : 'var(--color-grey-text)', fontWeight: !value ? 500 : 400 }}
             onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-grey)'}
             onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
             None
          </button>
          {options.map(opt => (
            <button key={opt.id} type="button" onClick={() => { onChange(String(opt.id)); setIsOpen(false); }}
              style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.9rem', border: 'none', background: 'transparent', borderRadius: '8px', cursor: 'pointer', color: String(opt.id) === value ? 'var(--color-black)' : 'var(--color-grey-text)', fontWeight: String(opt.id) === value ? 500 : 400 }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-grey)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
               <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{opt.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ContentCalendar = ({ 
  project, 
  onUpdateContent 
}: { 
  project?: ProjectData, 
  onUpdateContent?: (updated: ContentPost[]) => void 
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [view, setView] = useState<ViewMode>(window.innerWidth < 768 ? 'Day' : 'Month');
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [posts, setPostsState] = useState<ContentPost[]>(() => {
    if (project?.strategy?.content) return project.strategy.content;
    return [
      { id: '1', date: new Date().toISOString().split('T')[0], theme: 'Launch Announcement', content: 'We are live! Go check out the tool.', category: 'Marketing', link: 'https://doneapp.com', experiment: '' }
    ];
  });

  const setPosts = (newPosts: ContentPost[]) => {
    setPostsState(newPosts);
    if (onUpdateContent) onUpdateContent(newPosts);
  };
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [modalData, setModalData] = useState<Omit<ContentPost, 'id'>>({ date: '', theme: '', content: '', category: '', link: '', experiment: '' });
  const [experiments, setExperiments] = useState<{id: string | number, title: string}[]>(() => {
    if (project?.strategy?.experiments) return project.strategy.experiments.map((t: any) => ({ id: t.id, title: t.title }));
    return [];
  });

  useEffect(() => {
    if (!project) {
      try {
        const savedExp = localStorage.getItem('doneapp_experiments');
        if (savedExp) {
          setExperiments(JSON.parse(savedExp).map((t: any) => ({ id: String(t.id), title: t.title })));
        }
      } catch {}
    }
  }, [project]);

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; 
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const navigateDate = (dir: 1 | -1) => {
    const newDate = new Date(currentDate);
    if (view === 'Month' || view === 'Quarter') {
      newDate.setMonth(currentDate.getMonth() + dir * (view === 'Quarter' ? 3 : 1));
    } else if (view === 'Week') {
      newDate.setDate(currentDate.getDate() + dir * 7);
    } else {
      newDate.setDate(currentDate.getDate() + dir);
    }
    setCurrentDate(newDate);
  };

  const openAddModal = (dateStr: string) => {
    setEditingPostId(null);
    setModalData({ date: dateStr, theme: '', content: '', category: '', link: '', experiment: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (e: React.MouseEvent, post: ContentPost) => {
    e.stopPropagation();
    setEditingPostId(post.id);
    setModalData({ date: post.date, theme: post.theme, content: post.content, category: post.category, link: post.link, experiment: post.experiment });
    setIsModalOpen(true);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    let newPosts;
    if (editingPostId) {
      newPosts = posts.map(p => p.id === editingPostId ? { ...modalData, id: p.id } : p);
    } else {
      newPosts = [...posts, { id: Date.now().toString(), ...modalData }];
    }
    setPosts(newPosts);
    setIsModalOpen(false);
  };

  const handleDeletePost = () => {
    if (editingPostId) {
      setPosts(posts.filter(p => p.id !== editingPostId));
    }
    setIsModalOpen(false);
  };

  const renderBadge = (category: string) => {
    return (
      <span style={{ 
        display: 'inline-block',
        fontSize: '0.65rem', 
        padding: '2px 6px', 
        borderRadius: '4px',
        backgroundColor: '#f1f1f1',
        color: '#333',
        fontWeight: 500,
        marginBottom: '4px'
      }}>
        {category || 'Uncategorized'}
      </span>
    );
  };

  const renderMonthView = () => {
    const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i);
    const regularDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: isMobile ? '4px' : '8px' }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} style={{ fontSize: isMobile ? '0.65rem' : '0.75rem', color: 'var(--color-grey-text)', textAlign: 'center', marginBottom: '8px', fontWeight: 500 }}>{isMobile ? d[0] : d}</div>
        ))}
        {blanks.map(b => <div key={`blank-${b}`} style={{ minHeight: isMobile ? '60px' : '100px', backgroundColor: 'transparent' }} />)}
        {regularDays.map(d => {
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dayPosts = posts.filter(p => p.date === dateStr);
          const isToday = dateStr === new Date().toISOString().split('T')[0];

          return (
            <div key={d} 
              onClick={() => openAddModal(dateStr)}
              style={{ 
              minHeight: isMobile ? '60px' : '100px', 
              border: isToday ? '1px solid var(--color-black)' : '1px solid var(--color-border)',
              borderRadius: isMobile ? '6px' : '8px',
              padding: isMobile ? '4px' : '8px',
              backgroundColor: isToday ? 'var(--color-bg-white)' : 'transparent',
              transition: 'background-color 0.2s ease',
              cursor: 'pointer'
            }}
            className="calendar-day-hover"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '2px' : '8px' }}>
                <span style={{ fontSize: isMobile ? '0.7rem' : '0.85rem', fontWeight: isToday ? 600 : 400, color: isToday ? 'var(--color-black)' : 'var(--color-grey-text)' }}>{d}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {dayPosts.map(post => (
                  <div key={post.id} onClick={(e) => openEditModal(e, post)} style={{ padding: '6px', backgroundColor: 'var(--color-bg-white)', borderRadius: '6px', fontSize: '0.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                    {isMobile ? (
                       <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-black)', margin: '0 auto' }} />
                    ) : (
                      <>
                        {renderBadge(post.category)}
                        {post.experiment && (
                          <div 
                            onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'experimentation' })); }}
                            style={{ fontSize: '0.65rem', color: '#a3a3a3', marginBottom: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            🔗 {experiments.find(exp => String(exp.id) === post.experiment)?.title || 'Linked Exp.'}
                          </div>
                        )}
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.theme}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderListView = (title: string, filteredPosts: ContentPost[]) => (
    <div style={{ padding: isMobile ? '16px' : '24px', backgroundColor: 'var(--color-bg-white)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '16px' : '24px' }}>
        <h3 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 500 }}>{title}</h3>
        <button 
          onClick={() => openAddModal(currentDate.toISOString().split('T')[0])}
          style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: 'var(--color-bg-grey)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Add to this day
        </button>
      </div>
      {filteredPosts.length === 0 ? (
        <p style={{ color: 'var(--color-grey-text)', fontStyle: 'italic', fontSize: '0.9rem' }}>No posts scheduled.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredPosts.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(post => (
            <div key={post.id} onClick={(e) => openEditModal(e, post)} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--color-bg-grey)', cursor: 'pointer' }}>
              <div style={{ minWidth: '80px', fontSize: '0.85rem', color: 'var(--color-grey-text)' }}>
                {new Date(post.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
              <div>{renderBadge(post.category)}</div>
              <div style={{ fontWeight: 500, fontSize: isMobile ? '13px' : '0.95rem' }}>{post.theme}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (view === 'Month') return renderMonthView();
    if (view === 'Day') return renderListView(`Agenda for ${currentDate.toLocaleDateString()}`, posts.filter(p => p.date === currentDate.toISOString().split('T')[0]));
    if (view === 'Week') return renderListView(`Week of ${currentDate.toLocaleDateString()}`, posts.filter(p => Math.abs(new Date(p.date).getTime() - currentDate.getTime()) / 86400000 <= 4));
    if (view === 'Quarter') return renderListView(`Q${Math.floor(currentDate.getMonth() / 3) + 1} ${currentDate.getFullYear()}`, posts.filter(p => new Date(p.date).getFullYear() === currentDate.getFullYear() && Math.floor(new Date(p.date).getMonth() / 3) === Math.floor(currentDate.getMonth() / 3)));
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <style>
        {`
          .calendar-day-hover:hover {
            background-color: var(--color-bg-white) !important;
            border-color: rgba(0,0,0,0.1) !important;
          }
        `}
      </style>

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '24px', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '24px', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => navigateDate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
              <ChevronLeft size={isMobile ? 18 : 20} color="var(--color-grey-text)" />
            </button>
            <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.2rem', fontWeight: 500, minWidth: isMobile ? '110px' : '140px', textAlign: 'center' }}>
              {view === 'Month' || view === 'Week' || view === 'Day' ? `${isMobile ? currentDate.toLocaleString('default', { month: 'short' }) : monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}` : `Q${Math.floor(currentDate.getMonth() / 3) + 1} ${currentDate.getFullYear()}`}
            </h2>
            <button onClick={() => navigateDate(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={20} color="var(--color-grey-text)" />
            </button>
          </div>

          <div style={{ position: 'relative', outline: 'none' }} tabIndex={0} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsViewDropdownOpen(false); }}>
            <button 
              onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--color-bg-white)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)', padding: '6px 16px',
                fontSize: '0.85rem', cursor: 'pointer', outline: 'none'
              }}
            >
              {view} <ChevronDown size={14} color="var(--color-grey-text)" />
            </button>
            
            {isViewDropdownOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                background: 'var(--color-bg-white)', border: '1px solid var(--color-border)',
                borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                padding: '8px', minWidth: '160px', zIndex: 100,
                display: 'flex', flexDirection: 'column', gap: '2px', animation: 'fadeIn 0.2s ease', outline: 'none'
              }}>
                {['Day', 'Week', 'Month', 'Quarter'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setView(opt as ViewMode); setIsViewDropdownOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      width: '100%', padding: '10px 14px', background: 'transparent',
                      border: 'none', borderRadius: '10px', textAlign: 'left',
                      fontSize: '0.9rem', cursor: 'pointer',
                      color: opt === view ? 'var(--color-black)' : 'var(--color-grey-text)',
                      fontWeight: opt === view ? 500 : 400,
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-grey)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {opt === view ? <Check size={16} /> : <div style={{width: 16}}/>} {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fade-in-up">
        {renderContent()}
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000, backdropFilter: 'blur(8px)',
          padding: isMobile ? '16px' : '0'
        }} onClick={() => setIsModalOpen(false)}>
          <div style={{
            backgroundColor: 'var(--color-bg-white)', padding: isMobile ? '20px' : '32px', borderRadius: '24px',
            width: '100%', maxWidth: '500px', 
            maxHeight: isMobile ? '90vh' : 'auto',
            overflowY: isMobile ? 'auto' : 'visible',
            boxShadow: isMobile ? '0 4px 12px rgba(0,0,0,0.05)' : '0 20px 40px rgba(0,0,0,0.1)', 
            animation: 'fadeIn 0.3s ease'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 500 }}>{editingPostId ? 'Edit Post' : 'Add Post'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-grey-text)' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSavePost} style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: isMobile ? '11px' : '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em', color: '#a3a3a3', marginBottom: '4px' }}>Theme</label>
                <input autoFocus type="text" required value={modalData.theme} onChange={e => setModalData({...modalData, theme: e.target.value})} style={{ width: '100%', padding: isMobile ? '10px 12px' : '14px 16px', borderRadius: '12px', border: 'none', backgroundColor: 'var(--color-bg-grey)', fontSize: isMobile ? '13px' : '0.95rem', outline: 'none', fontFamily: 'inherit' }} placeholder="Theme or title" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: isMobile ? '11px' : '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em', color: '#a3a3a3', marginBottom: '4px' }}>Content</label>
                <textarea rows={3} value={modalData.content} onChange={e => setModalData({...modalData, content: e.target.value})} style={{ width: '100%', padding: isMobile ? '10px 12px' : '14px 16px', borderRadius: '12px', border: 'none', backgroundColor: 'var(--color-bg-grey)', fontSize: isMobile ? '13px' : '0.95rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} placeholder="Post content..." />
              </div>

              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '12px' : '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: isMobile ? '11px' : '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em', color: '#a3a3a3', marginBottom: '4px' }}>Category</label>
                  <input type="text" value={modalData.category} onChange={e => setModalData({...modalData, category: e.target.value})} style={{ width: '100%', padding: isMobile ? '10px 12px' : '14px 16px', borderRadius: '12px', border: 'none', backgroundColor: 'var(--color-bg-grey)', fontSize: isMobile ? '13px' : '0.95rem', outline: 'none', fontFamily: 'inherit' }} placeholder="e.g. Marketing" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: isMobile ? '11px' : '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em', color: '#a3a3a3', marginBottom: '4px' }}>Date</label>
                  <input type="date" required value={modalData.date} onChange={e => setModalData({...modalData, date: e.target.value})} style={{ width: '100%', padding: isMobile ? '10px 12px' : '14px 16px', borderRadius: '12px', border: 'none', backgroundColor: 'var(--color-bg-grey)', fontSize: isMobile ? '13px' : '0.95rem', outline: 'none', fontFamily: 'inherit' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '12px' : '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: isMobile ? '11px' : '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em', color: '#a3a3a3', marginBottom: '4px' }}>Link</label>
                  <input type="url" value={modalData.link} onChange={e => setModalData({...modalData, link: e.target.value})} style={{ width: '100%', padding: isMobile ? '10px 12px' : '14px 16px', borderRadius: '12px', border: 'none', backgroundColor: 'var(--color-bg-grey)', fontSize: isMobile ? '13px' : '0.95rem', outline: 'none', fontFamily: 'inherit' }} placeholder="https://..." />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: isMobile ? '11px' : '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em', color: '#a3a3a3', marginBottom: '4px' }}>Experiment</label>
                  <ExperimentDropdown value={modalData.experiment} onChange={val => setModalData({...modalData, experiment: val})} options={experiments} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                {editingPostId && (
                  <button type="button" onClick={handleDeletePost} style={{ backgroundColor: 'transparent', color: '#ff3b30', padding: isMobile ? '10px 16px' : '14px 20px', borderRadius: '12px', border: '1px solid rgba(255,59,48,0.15)', fontSize: isMobile ? '13px' : '0.95rem', fontWeight: 500, cursor: 'pointer' }}>
                    Delete
                  </button>
                )}
                <button type="submit" style={{ flex: 1, backgroundColor: 'var(--color-black)', color: 'var(--color-bg-white)', padding: isMobile ? '10px 16px' : '14px 20px', borderRadius: '12px', border: 'none', fontSize: isMobile ? '13px' : '0.95rem', fontWeight: 500, cursor: 'pointer' }}>
                  {editingPostId ? 'Save Changes' : 'Schedule Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCalendar;
