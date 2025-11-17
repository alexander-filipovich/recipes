import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  name: string;
  count?: number;
};

const TypeCard: React.FC<Props> = ({ name, count }) => {
  return (
    <Link to={`/type/${encodeURIComponent(name)}`} style={{ textDecoration: 'none' }}>
      <div className="card" role="button" aria-label={`Open ${name}`}>
        <div className="thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#fff', opacity: 0.9 }}>{name.slice(0,1).toUpperCase()}</div>
        </div>
        <div className="title">{name}</div>
        <div className="subtitle">{count ?? 0} items</div>
      </div>
    </Link>
  );
};

export default TypeCard;
