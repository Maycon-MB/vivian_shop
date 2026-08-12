import React from 'react';
import InfoIcon from '../common/InfoIcon';

const LocalInfoIcon = ({ text }) => (
    <div className="d-inline-block ms-2 cursor-help opacity-50 hover-opacity-100 transition-all">
        <InfoIcon text={text} />
    </div>
);

export default LocalInfoIcon;
