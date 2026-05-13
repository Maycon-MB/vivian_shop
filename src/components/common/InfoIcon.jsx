import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { AlertCircle } from 'lucide-react';

const InfoIcon = ({ text }) => (
  <OverlayTrigger
    placement="top"
    overlay={<Tooltip id={`tooltip-${text.replace(/\s+/g, '-')}`}>{text}</Tooltip>}
  >
    <span className="info-icon shadow-sm">
        <AlertCircle size={10} strokeWidth={3} />
    </span>
  </OverlayTrigger>
);

export default InfoIcon;
