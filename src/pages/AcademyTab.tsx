
import { Play } from 'lucide-react';
import './AcademyTab.css';

const MOCK_VIDEOS = [
  { id: 1, title: 'How to Position your B2B SaaS in 2026', author: 'GTM Experts', duration: '14:20', views: '12K views', thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=600' },
  { id: 2, title: 'Cold Email Masterclass: 50% Open Rates', author: 'DoneApp Team', duration: '28:15', views: '45K views', thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600' },
  { id: 3, title: 'Pricing Strategies for Consumer Apps', author: 'Growth Academy', duration: '09:45', views: '8K views', thumbnail: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=600' },
  { id: 4, title: 'Product Hunt Launch Checklist', author: 'DoneApp Team', duration: '12:10', views: '32K views', thumbnail: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=600' },
  { id: 5, title: 'Building a Waitlist of 10,000 Users', author: 'Startup Growth', duration: '41:00', views: '100K views', thumbnail: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600' },
  { id: 6, title: 'Setting Up Your Content Engine', author: 'GTM Experts', duration: '18:30', views: '5K views', thumbnail: 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=600' }
];

const AcademyTab = () => {
  return (
    <div className="container academy-container" style={{ paddingTop: '1rem' }}>
      <div className="video-grid">
        {MOCK_VIDEOS.map(video => (
          <div key={video.id} className="video-card slide-up">
            <div className="thumbnail-wrapper">
              <img src={video.thumbnail} alt={video.title} className="thumbnail-img" />
              <div className="duration-badge">{video.duration}</div>
              <div className="play-overlay">
                <Play fill="white" size={32} strokeWidth={1} color="white" />
              </div>
            </div>
            <div className="video-info">
              <h3 className="video-title">{video.title}</h3>
              <p className="video-meta">{video.author} • {video.views}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AcademyTab;
