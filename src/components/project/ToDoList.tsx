import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Plus } from 'lucide-react';
import type { ProjectData } from '../../types';

const ToDoList = ({ 
  project, 
  onUpdateTodo 
}: { 
  project?: ProjectData, 
  onUpdateTodo?: (updated: {id: number | string, text: string, done: boolean}[]) => void 
}) => {
  const [todos, setTodosState] = useState<{id: number | string, text: string, done: boolean}[]>(() => {
    if (project?.strategy?.todo) return project.strategy.todo;
    
    try {
      const saved = localStorage.getItem('doneapp_todo');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 1, text: 'Finalize brand guidelines and logo', done: true },
      { id: 2, text: 'Set up social media accounts (Twitter, LinkedIn)', done: true },
      { id: 3, text: 'Write MVP landing page copy', done: false },
      { id: 4, text: 'Design landing page wireframes', done: false },
      { id: 5, text: 'Setup Stripe billing logic', done: false },
      { id: 6, text: 'Draft first week of content calendar', done: false },
    ];
  });

  const setTodos = (newTodos: {id: number | string, text: string, done: boolean}[]) => {
    setTodosState(newTodos);
    if (onUpdateTodo) onUpdateTodo(newTodos);
  };

  useEffect(() => {
    if (!project) {
      localStorage.setItem('doneapp_todo', JSON.stringify(todos));
    }
  }, [todos, project]);

  const [newTask, setNewTask] = useState('');

  const toggleTodo = (id: number | string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const updateTodo = (id: number | string, text: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, text } : t));
  };

  const deleteTodo = (id: number | string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const handleAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTask.trim() !== '') {
      setTodos([...todos, { id: Date.now(), text: newTask.trim(), done: false }]);
      setNewTask('');
    }
  };

  const completedCount = todos.filter(t => t.done).length;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
        <h2 className="title-medium" style={{ fontSize: '1.2rem', marginBottom: 0 }}>Action Items</h2>
        <span style={{ color: 'var(--color-grey-text)', fontSize: '0.85rem' }}>{completedCount}/{todos.length} Completed</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {todos.map(todo => (
          <div key={todo.id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '12px 14px',
            backgroundColor: 'var(--color-bg-white)',
            borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
            transition: 'all 0.2s',
            opacity: todo.done ? 0.6 : 1
          }}
          className="fade-in-up"
          >
            <div style={{ cursor: 'pointer' }} onClick={() => toggleTodo(todo.id)}>
              {todo.done ? (
                <CheckCircle size={24} color={'var(--color-black)'} strokeWidth={1.5} />
              ) : (
                <Circle size={24} color={'var(--color-grey-text)'} strokeWidth={1.5} />
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              <span 
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const val = e.currentTarget.textContent?.trim();
                  if (val) {
                    updateTodo(todo.id, val);
                  } else {
                    deleteTodo(todo.id);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
                style={{ 
                  fontSize: '13px', 
                  textDecoration: todo.done ? 'line-through' : 'none',
                  color: todo.done ? 'var(--color-grey-text)' : 'var(--color-black)',
                  outline: 'none',
                  display: 'block',
                  width: '100%',
                  cursor: 'text',
                  lineHeight: '1.4'
                }}>
                {todo.text}
              </span>
            </div>
          </div>
        ))}

        {/* Add New Task Row */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          padding: '16px',
          marginTop: '8px',
          borderRadius: '12px',
          backgroundColor: 'transparent',
          border: '1px dashed var(--color-border)'
        }}>
          <Plus size={24} color={'var(--color-grey-text)'} strokeWidth={1.5} />
          <input 
            type="text" 
            placeholder="Add a new task..." 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleAdd}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '1.05rem',
              color: 'var(--color-black)',
              outline: 'none'
            }}
          />
        </div>

      </div>
    </div>
  );
};

export default ToDoList;
