import { useState } from 'react';
import type { GtmCard, GtmColumn, ProjectData } from '../../types';
import './StrategyKanban.css';

const MOCK_CARDS: GtmCard[] = [
  // Positioning
  { id: '1', column: 'Positioning', index: '1.1', title: 'Ideal Customers', content: 'Target early-stage tech founders who have just raised a seed round. Focus on LinkedIn and Twitter where they are most active. Reach out directly with value-first messages.' },
  { id: '2', column: 'Positioning', index: '1.2', title: 'Problems & Opportunities', content: 'Founders struggle to find their first 10 customers without a massive marketing budget. The market is saturated with complex tools but lacks simple, tactical guidance. Existing solutions are too expensive or too generic.' },
  { id: '3', column: 'Positioning', index: '1.3', title: 'Your Advantage', content: 'What have you lived, built, or learned that makes you the right person to solve this? Only you can answer this.' },
  { id: '4', column: 'Positioning', index: '1.4', title: 'Value Proposition', content: 'We help seed-stage founders land their first 10 paying customers in 30 days using a proven, minimalist GTM framework. No fluff, just results.' },
  // Product
  { id: '5', column: 'Product', index: '2.1', title: 'Product/Service', content: 'A 4-week intensive GTM coaching program combined with a minimalist strategy toolkit. High-touch support focused on immediate execution.' },
  { id: '6', column: 'Product', index: '2.2', title: 'Key Benefits', content: 'Stop wasting time on ineffective marketing hacks. Gain clarity on your target audience and land your first revenue-generating customers faster.' },
  { id: '7', column: 'Product', index: '2.3', title: 'Pricing', content: 'Fixed price of $1,500 for the 4-week program. Rationale: High value for founders at a critical stage where every dollar counts.' },
  { id: '8', column: 'Product', index: '2.4', title: 'Customer Experience', content: 'Founders feel empowered and focused. Steps: Discovery call -> Strategy workshop -> Weekly execution sprints -> First customers landed.' },
  // Promotion
  { id: '9', column: 'Promotion', index: '3.1', title: 'Message & Content', content: 'Core message: "GTM doesn\'t have to be complicated." Tone: Transparent, tactical, and founder-focused. Content: Daily GTM tips on LinkedIn.' },
  { id: '10', column: 'Promotion', index: '3.2', title: 'Attracting the right customers', content: 'Share "Teardowns" of successful early-stage GTMs. Offer free 15-minute strategy audits. Build in public on Twitter.' },
  { id: '11', column: 'Promotion', index: '3.3', title: 'Transform into paying customers', content: 'Offer: "The First 10" starter pack. CTA: Book a free strategy session. Proof: Show results from previous cohort.' },
  { id: '12', column: 'Promotion', index: '3.4', title: 'Retaining Customers Long-Term', content: 'Post-program alumni Slack group. Monthly GTM check-ins. Referral bonuses for bringing in other founders.' },
];

const COLUMNS: GtmColumn[] = ['Positioning', 'Product', 'Promotion'];

const StrategyKanban = ({ 
  project, 
  onUpdateCard 
}: { 
  project?: ProjectData, 
  onUpdateCard?: (id: string, newContent: string) => void 
}) => {
  const cards = project?.strategy?.cards && project.strategy.cards.length > 0 ? project.strategy.cards : MOCK_CARDS;
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (id: string | undefined) => {
    if (!id) return;
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };


  const handleSave = (id: string, newContent: string) => {
    if (onUpdateCard) {
      onUpdateCard(id, newContent);
    }
  };

  const cleanTitle = (index: string, title: string) => {
    if (!title) return '';
    if (title.startsWith(index)) return title.substring(index.length).trim();
    if (title.match(/^\d+\.\d+\s/)) return title.replace(/^\d+\.\d+\s/, '').trim();
    return title;
  };

  const renderContent = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} style={{ marginBottom: '8px' }}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="strategy-kanban">
      <div className="kanban-board">
        {COLUMNS.map((col, idx) => (
          <div key={col} className="kanban-col">
            <div className="kanban-col-header">
              <h3>{idx + 1} - {col.toUpperCase()}</h3>
            </div>
            <div className="kanban-cards">
              {cards.filter((c: GtmCard) => c.column === col).map((card: GtmCard) => {
                const cardId = card.id || card.index;
                const isExpanded = expandedCards[cardId];
                
                return (
                <div 
                  key={cardId} 
                  className={`kanban-card fade-in-up ${isExpanded ? 'expanded' : ''}`} 
                  onClick={() => toggleCard(cardId)} 
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  <div className="card-header">
                    <span className="card-index">{card.index}</span>
                    <h4 className="card-title">{cleanTitle(card.index, card.title)}</h4>
                  </div>
                  <div 
                    className="card-content" 
                    contentEditable={isExpanded}
                    suppressContentEditableWarning
                    style={{ 
                      lineHeight: '1.6',
                      display: '-webkit-box',
                      WebkitLineClamp: isExpanded ? 'unset' : 4,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      outline: 'none',
                      cursor: isExpanded ? 'text' : 'pointer',
                      minHeight: '1em'
                    }}
                    onBlur={(e) => {
                      const newContent = e.currentTarget.innerText;
                      if (newContent !== card.content) {
                        handleSave(cardId, newContent);
                      }
                    }}
                    onClick={(e) => {
                      if (isExpanded) {
                        e.stopPropagation();
                      }
                    }}
                  >
                    {renderContent(card.content)}
                  </div>
                </div>
              )})}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrategyKanban;
