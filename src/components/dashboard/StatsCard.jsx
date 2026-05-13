import React from 'react';
import { Card, Badge } from 'react-bootstrap';

const StatsCard = ({ label, value, grow, icon }) => {
  const getBadgeVariant = (text) => {
    if (text.includes('vs')) return 'primary-subtle';
    if (text.includes('+')) return 'success-subtle';
    return 'warning-subtle';
  };

  const getTextColor = (text) => {
    if (text.includes('vs')) return 'primary';
    if (text.includes('+')) return 'success';
    return 'dark';
  };

  return (
    <Card className="border-0 p-4 h-100 hover-lift transition-all" style={{ 
      borderRadius: '32px',
      border: '1px solid #9B89B366',
      boxShadow: '0 15px 35px rgba(155,137,179,0.12)'
    }}>
      <div className="d-flex justify-content-between mb-4">
        <div className="bg-light p-3 rounded-4">{icon}</div>
        <Badge 
          bg={getBadgeVariant(grow)} 
          className={`text-${getTextColor(grow)} fw-bold px-3 py-2 rounded-pill d-flex align-items-center`}
          style={{ color: grow.includes('vs') ? '#9B89B3' : '' }}
        >
          {grow}
        </Badge>
      </div>
      <p className="text-muted small fw-bold mb-1 text-uppercase ls-wide">{label}</p>
      <h3 className="fw-black mb-0 fs-2">{value}</h3>
    </Card>
  );
};

export default StatsCard;
