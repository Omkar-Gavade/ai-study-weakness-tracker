/**
 * SubjectCard — Reusable subject selection card
 *
 * Usage: <SubjectCard subject={subjectObj} route="/quizzes/mpsc/group-a/history" />
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const SubjectCard = ({ subject, route }) => {
  return (
    <Link
      to={route}
      style={{ textDecoration: 'none' }}
      className="subject-card-link"
    >
      <div
        className="subject-card"
        style={{ '--accent': subject.color }}
      >
        {/* Coloured top strip */}
        <div className="subject-card-bar" />

        {/* Emoji icon */}
        <div className="subject-emoji">{subject.emoji}</div>

        {/* Content */}
        <div className="subject-card-body">
          <h3 className="subject-card-title">{subject.name}</h3>
          <p className="subject-card-desc">{subject.desc}</p>
        </div>

        {/* Footer */}
        <div className="subject-card-footer">
          <span>विषय निवडा</span>
          <ChevronRight size={16} />
        </div>
      </div>
    </Link>
  );
};

export default SubjectCard;
