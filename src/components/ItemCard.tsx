import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  typeName: string;
  itemName: string;
  imageUrl?: string | null;
  meta?: any;
};

const ItemCard: React.FC<Props> = ({ typeName, itemName, imageUrl, meta }) => {
  return (
    <Link to={`/type/${encodeURIComponent(typeName)}/item/${encodeURIComponent(itemName)}`} style={{ textDecoration: 'none' }}>
      <div className="card" role="button">
        {imageUrl ? (
          // allow svg and raster images
          <img src={imageUrl} alt={itemName} className="thumb" />
        ) : (
          <div className="thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{itemName.slice(0,1).toUpperCase()}</div>
        )}
        <div className="title">{meta?.title ?? itemName}</div>
        <div className="subtitle">{meta?.desc ?? 'No description'}</div>
      </div>
    </Link>
  );
};

export default ItemCard;
