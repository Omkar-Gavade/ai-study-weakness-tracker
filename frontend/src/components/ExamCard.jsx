import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const ExamCard = ({ title, description, image, icon, route, color = 'var(--primary)' }) => {
  return (
    <Link to={route} className="stat-card exam-card-enhanced" style={{ textDecoration: 'none' }}>
      <div className="card-image-container">
        {image ? (
          <img src={image} alt={title} className="card-bg-image" />
        ) : (
          <div className="card-bg-placeholder" style={{ background: `linear-gradient(135deg, ${color}40, var(--card-bg))` }} />
        )}
        <div className="card-overlay-gradient" />
        <div className="card-icon-floating" style={{ background: `${color}20`, color: color }}>
          {icon}
        </div>
      </div>
      <div className="stat-info" style={{ padding: '1.5rem', position: 'relative', zIndex: 2 }}>
        <h3 style={{ color: 'var(--text-active)', fontSize: '1.4rem', marginBottom: '0.5rem', textTransform: 'none' }}>
          {title}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          {description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', color: color, fontWeight: '600', fontSize: '0.9rem' }}>
          सराव सुरू करा <ChevronRight size={16} style={{ marginLeft: '4px' }} />
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .exam-card-enhanced {
          overflow: hidden;
          padding: 0 !important;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.03) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        .exam-card-enhanced:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
        }
        
        .card-image-container {
          position: relative;
          height: 140px;
          overflow: hidden;
        }
        
        .card-bg-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        
        .exam-card-enhanced:hover .card-bg-image {
          transform: scale(1.1);
        }
        
        .card-overlay-gradient {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, transparent, var(--card-bg));
        }
        
        .card-icon-floating {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 3;
        }
        
        .card-bg-placeholder {
          width: 100%;
          height: 100%;
        }
      `}} />
    </Link>
  );
};

export default ExamCard;
