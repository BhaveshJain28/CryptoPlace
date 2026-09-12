import React from 'react';
import './Sparkline.css';

const Sparkline = ({ data, width = 120, height = 40, color = '#10B981' }) => {
    if (!data || data.length === 0) return <div style={{width, height}}></div>;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1; // Prevent div by zero
    
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg 
            width={width} 
            height={height} 
            viewBox={`0 -5 ${width} ${height + 10}`} 
            className="sparkline"
            preserveAspectRatio="none"
        >
            <polyline 
                fill="none" 
                stroke={color} 
                strokeWidth="1.5" 
                points={points} 
                strokeLinecap="round" 
                strokeLinejoin="round" 
            />
        </svg>
    );
};

export default Sparkline;
