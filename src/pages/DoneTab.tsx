import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { MARKETING_QUOTES } from '../types';
import './DoneTab.css';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { GTM_GENERATION_PROMPT } from '../prompts';
import StrategyKanban from '../components/project/StrategyKanban';

const DoneTab = ({ lang, onShowAuth }: { lang: 'FR' | 'EN', onShowAuth: () => void }) => {
  const { user } = useAuth();
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const [showAuthLocal, setShowAuthLocal] = useState(false);
  const [pendingProject, setPendingProject] = useState<any | null>(null);
  
  const navigate = useNavigate();

  // Handle auto-save after login
  useEffect(() => {
    const savePending = async () => {
      if (user && pendingProject) {
        try {
          const { data, error } = await supabase.from('projects').insert([{
            user_id: user.id,
            name: (pendingProject.idea || '').substring(0, 30) + '...',
            idea: pendingProject.idea,
            strategy_json: pendingProject.strategy
          }]).select();

          if (error) throw error;
          
          setPendingProject(null);
          setShowAuthLocal(false);
          setIsGenerating(false);
          navigate(`/project/${data[0].id}`);
        } catch (err) {
          console.error("Auto-save failed:", err);
        }
      }
    };
    savePending();
  }, [user, pendingProject, navigate]);

  const UI_STRINGS = {
    FR: {
      title: <>Décrivez votre idée,<br /><i>je vais générer une<br className="mobile-break" /> Stratégie Go-to-Market</i></>,
      placeholder: "Décrivez votre idée de projet ici...",
      generating_error: "Échec de la génération. Raison : "
    },
    EN: {
      title: <>Describe your idea,<br /><i>I will generate a<br className="mobile-break" /> Go-to-Market Strategy</i></>,
      placeholder: "Describe your project idea here...",
      generating_error: "Failed to generate strategy. Reason: "
    }
  };

  const generateStrategy = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API key missing.");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const todayStr = new Date().toISOString().split('T')[0];
      const prompt = `${GTM_GENERATION_PROMPT}\n\nUser Project Idea: ${idea}\nToday's date is ${todayStr}.\n\nCRITICAL REQUIREMENT: You MUST write your entire response strictly in ${lang === 'FR' ? 'FRENCH' : 'ENGLISH'}. Do not use any other language.\n\nJSON output strictly.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Robust JSON extraction
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const potentialJson = jsonMatch[0];
          try {
            parsed = JSON.parse(potentialJson);
          } catch (e2) {
            const cleaned = potentialJson
              .replace(/```json\n?|```/g, '')
              .replace(/\/\/.*/g, '')
              .replace(/\/\*[\s\S]*?\*\//g, '')
              .replace(/,(\s*[\]\}])/g, '$1')
              .trim();
            try {
              parsed = JSON.parse(cleaned);
            } catch (e3) {
              throw new Error(lang === 'FR' ? "Réponse malformée." : "Malformed response.");
            }
          }
        } else {
          throw new Error(lang === 'FR' ? "Pas de JSON trouvé." : "No JSON found.");
        }
      }
      
      if(parsed.experiments) localStorage.setItem('doneapp_experiments', JSON.stringify(parsed.experiments));
      if(parsed.content) localStorage.setItem('doneapp_posts', JSON.stringify(parsed.content));
      if(parsed.todo) localStorage.setItem('doneapp_todo', JSON.stringify(parsed.todo));

      if (!user) {
        setPendingProject({ idea, strategy: parsed });
        setIsGenerating(false);
        setShowAuthLocal(true);
        onShowAuth();
        return;
      }

      const { data, error } = await supabase.from('projects').insert([{
        user_id: user.id,
        name: idea.substring(0, 30) + '...',
        idea: idea,
        strategy_json: parsed
      }]).select();

      if (error) throw error;
      
      setProgress(100);
      setIsGenerating(false);
      navigate(`/project/${data[0].id}`);
    } catch (error: any) {
      console.error("Failed to generate:", error);
      alert((lang === 'FR' ? "Échec : " : "Failed: ") + (error.message || error));
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let progressInterval: ReturnType<typeof setInterval>;

    if (isGenerating) {
      interval = setInterval(() => {
        setQuoteIndex((prev) => (prev + 1) % MARKETING_QUOTES.length);
      }, 6500);

      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + (prev < 50 ? 5 : (prev < 80 ? 2 : 0.5));
        });
      }, 800);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim() && !isGenerating) {
      generateStrategy();
    }
  };

  if (showAuthLocal && pendingProject) {
    return (
      <div className="done-tab-container" style={{ overflow: 'hidden' }}>
        <div className="blurred-preview">
          <div className="preview-header-mock">
            <h2 className="title-small">{lang === 'FR' ? 'Votre Stratégie' : 'Your Strategy'}</h2>
          </div>
          <StrategyKanban project={{ id: 'temp', name: idea, idea, createdAt: new Date().toISOString(), strategy: pendingProject.strategy }} />
        </div>
        
        {/* The actual Auth UI is now handled by the global modal in App.tsx */}
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="generating-screen">
        <div className="quote-container fade-in-up" key={quoteIndex}>
          <p className="quote-text">"{MARKETING_QUOTES[quoteIndex].text[lang]}"</p>
          <p className="quote-author">— {MARKETING_QUOTES[quoteIndex].author}</p>
        </div>
        
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="done-tab-container">
      <div className="done-content-wrapper">
        <div className="main-prompt fade-in-up">
          <h1 className="title-medium" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', fontWeight: 400 }}>
            {UI_STRINGS[lang].title}
          </h1>
        </div>

        <div className="input-area-wrapper slide-up">
          <div className="minimal-input-container">
          <form onSubmit={handleSubmit} className="input-form">
            <textarea
              className="minimal-input"
              placeholder={UI_STRINGS[lang].placeholder}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              disabled={isGenerating}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            
            <div className="input-actions-row">
              <button 
                type="submit" 
                className="minimal-submit-btn" 
                disabled={!idea.trim() || isGenerating}
                aria-label="Generate"
              >
                <Send size={16} strokeWidth={1.5} />
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
};

export default DoneTab;
