/**
 * GroupCard — Reusable group selection card (e.g., MPSC Group A/B/C)
 *
 * Usage: <GroupCard group={groupObj} route="/quizzes/mpsc/group-a" />
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const GroupCard = ({ group, route }) => {
  return (
    <Link to={route} style={{ textDecoration: 'none' }} className="group-card-link">
      <div
        className="group-card"
        style={{ '--accent': group.color, borderColor: `${group.color}33` }}
      >
        {/* Big emoji */}
        <div
          className="group-emoji-box"
          style={{ background: `${group.color}18`, border: `1px solid ${group.color}44` }}
        >
          <span className="group-emoji">{group.emoji}</span>
        </div>

        {/* Content */}
        <div className="group-card-content">
          <h3 className="group-card-title" style={{ color: group.color }}>{group.name}</h3>
          <p className="group-card-desc">{group.desc}</p>
        </div>

        {/* Arrow */}
        <ChevronRight size={22} style={{ color: group.color, flexShrink: 0 }} />
      </div>
    </Link>
  );
};

export default GroupCard;
