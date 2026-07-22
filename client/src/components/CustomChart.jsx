import React, { useState } from 'react';

export default function CustomChart({ data, parameter }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex-center" style={{ height: '220px', color: 'var(--text-secondary)' }}>
        No historical vital data logged yet.
      </div>
    );
  }

  // We need data chronologically ascending (oldest first)
  const chartData = [...data]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-7); // limit to last 7 readings for readability

  const width = 600;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Get min/max Y based on the selected parameter
  let yMin = 0;
  let yMax = 100;
  let lines = []; // array of { points: [{x, y, rawValue}], color: string, gradientId: string, label: string }

  const extractValues = (param) => {
    if (param === 'bloodPressure') {
      const sys = chartData.map(d => d.systolic).filter(v => v !== undefined);
      const dia = chartData.map(d => d.diastolic).filter(v => v !== undefined);
      return { min: Math.min(...dia, ...sys, 50), max: Math.max(...sys, ...dia, 150) };
    } else if (param === 'heartRate') {
      const hr = chartData.map(d => d.heartRate).filter(v => v !== undefined);
      return { min: Math.min(...hr, 50), max: Math.max(...hr, 120) };
    } else if (param === 'temperature') {
      const temp = chartData.map(d => d.temperature).filter(v => v !== undefined);
      return { min: Math.min(...temp, 34), max: Math.max(...temp, 41) };
    } else if (param === 'spo2') {
      const o2 = chartData.map(d => d.spo2).filter(v => v !== undefined);
      return { min: Math.min(...o2, 85), max: Math.max(...o2, 100) };
    } else if (param === 'bloodSugar') {
      const sugar = chartData.map(d => d.bloodSugar).filter(v => v !== undefined);
      return { min: Math.min(...sugar, 60), max: Math.max(...sugar, 180) };
    } else if (param === 'sleepHours') {
      const sleep = chartData.map(d => d.sleepHours).filter(v => v !== undefined);
      return { min: Math.min(...sleep, 4), max: Math.max(...sleep, 10) };
    } else if (param === 'waterIntake') {
      const water = chartData.map(d => d.waterIntake).filter(v => v !== undefined);
      return { min: Math.min(...water, 500), max: Math.max(...water, 3000) };
    } else if (param === 'stepsCount') {
      const steps = chartData.map(d => d.stepsCount).filter(v => v !== undefined);
      return { min: Math.min(...steps, 2000), max: Math.max(...steps, 12000) };
    } else if (param === 'weight') {
      const wt = chartData.map(d => d.weight).filter(v => v !== undefined);
      return { min: Math.min(...wt, 45), max: Math.max(...wt, 100) };
    }
    return { min: 0, max: 100 };
  };

  const { min: valMin, max: valMax } = extractValues(parameter);
  yMin = Math.max(0, valMin - (parameter === 'temperature' ? 0.5 : 10));
  yMax = valMax + (parameter === 'temperature' ? 0.5 : 10);
  const yRange = yMax - yMin;

  // Map values to coordinates
  const getCoords = (value, index) => {
    if (value === undefined) return null;
    const x = paddingLeft + (index / (chartData.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((value - yMin) / yRange) * chartHeight;
    return { x, y };
  };

  if (parameter === 'bloodPressure') {
    const sysPoints = chartData
      .map((d, i) => {
        const coords = getCoords(d.systolic, i);
        return coords ? { ...coords, val: d.systolic, label: 'Systolic', date: d.timestamp } : null;
      })
      .filter(p => p !== null);

    const diaPoints = chartData
      .map((d, i) => {
        const coords = getCoords(d.diastolic, i);
        return coords ? { ...coords, val: d.diastolic, label: 'Diastolic', date: d.timestamp } : null;
      })
      .filter(p => p !== null);

    lines = [
      { points: sysPoints, color: 'var(--color-danger)', gradientId: 'sysGrad', label: 'Systolic' },
      { points: diaPoints, color: 'var(--color-info)', gradientId: 'diaGrad', label: 'Diastolic' }
    ];
  } else {
    let color = 'var(--color-primary)';
    let label = '';
    
    if (parameter === 'heartRate') { color = 'var(--color-danger)'; label = 'Heart Rate'; }
    if (parameter === 'temperature') { color = 'var(--color-warning)'; label = 'Temp'; }
    if (parameter === 'spo2') { color = 'var(--color-info)'; label = 'SpO2'; }
    if (parameter === 'bloodSugar') { color = 'var(--color-primary)'; label = 'Sugar'; }
    if (parameter === 'sleepHours') { color = 'var(--color-info)'; label = 'Sleep'; }
    if (parameter === 'waterIntake') { color = 'var(--color-info)'; label = 'Water'; }
    if (parameter === 'stepsCount') { color = 'var(--color-success)'; label = 'Steps'; }
    if (parameter === 'weight') { color = 'var(--color-warning)'; label = 'Weight'; }

    const points = chartData
      .map((d, i) => {
        const val = d[parameter];
        const coords = getCoords(val, i);
        return coords ? { ...coords, val, label, date: d.timestamp } : null;
      })
      .filter(p => p !== null);

    lines = [
      { points, color, gradientId: 'mainGrad', label }
    ];
  }

  // Y Axis Ticks
  const yTicksCount = 4;
  const yTicks = Array.from({ length: yTicksCount }, (_, i) => {
    const val = yMin + (i / (yTicksCount - 1)) * yRange;
    return {
      val: parameter === 'temperature' ? val.toFixed(1) : Math.round(val),
      y: paddingTop + chartHeight - (i / (yTicksCount - 1)) * chartHeight
    };
  });

  // X Axis Ticks (Format date strings: e.g. "Jun 17, 10:30")
  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + 
      ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatShortDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Legend */}
      <div className="flex-gap" style={{ justifyContent: 'flex-end', marginBottom: '12px', fontSize: '0.8rem' }}>
        {lines.map((line, idx) => (
          <div key={idx} className="flex-gap" style={{ gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '4px', background: line.color, borderRadius: '2px' }} />
            <span style={{ color: 'var(--text-secondary)' }}>{line.label}</span>
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          {/* Filters for neon glow */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          {/* Gradients */}
          {lines.map((line, idx) => (
            <linearGradient key={idx} id={line.gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={line.color} stopOpacity="0.0" />
            </linearGradient>
          ))}
        </defs>

        {/* Horizontal grid lines */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={paddingLeft}
              y1={tick.y}
              x2={width - paddingRight}
              y2={tick.y}
              stroke="var(--border-light)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={paddingLeft - 10}
              y={tick.y + 4}
              fill="var(--text-muted)"
              fontSize="10"
              textAnchor="end"
            >
              {tick.val}
            </text>
          </g>
        ))}

        {/* Draw Line and Area path */}
        {lines.map((line, lineIdx) => {
          if (line.points.length === 0) return null;

          // Build line path
          const pathD = line.points.reduce((acc, p, i) => {
            return acc + `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
          }, '');

          // Build area path
          const areaD = pathD + 
            ` L ${line.points[line.points.length - 1].x} ${paddingTop + chartHeight}` +
            ` L ${line.points[0].x} ${paddingTop + chartHeight} Z`;

          return (
            <g key={lineIdx}>
              {/* Fill Gradient Area */}
              <path d={areaD} fill={`url(#${line.gradientId})`} />

              {/* Line Stroke with Glow filter */}
              <path
                d={pathD}
                fill="none"
                stroke={line.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
              />

              {/* Data points */}
              {line.points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPoint && hoveredPoint.x === p.x && hoveredPoint.y === p.y ? 7 : 4}
                  fill="var(--bg-primary)"
                  stroke={line.color}
                  strokeWidth={hoveredPoint && hoveredPoint.x === p.x && hoveredPoint.y === p.y ? 3 : 2}
                  style={{ cursor: 'pointer', transition: 'r 0.15s ease, stroke-width 0.15s ease' }}
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </g>
          );
        })}

        {/* X Axis Date Labels */}
        {chartData.map((d, i) => {
          const x = paddingLeft + (i / (chartData.length - 1 || 1)) * chartWidth;
          return (
            <text
              key={i}
              x={x}
              y={height - 8}
              fill="var(--text-muted)"
              fontSize="9"
              textAnchor="middle"
            >
              {formatShortDate(d.timestamp)}
            </text>
          );
        })}
      </svg>

      {/* Tooltip Overlay */}
      {hoveredPoint && (
        <div className="glass-panel" style={{
          position: 'absolute',
          top: hoveredPoint.y - 75 > 0 ? hoveredPoint.y - 75 : 10,
          left: hoveredPoint.x - 70 > 0 ? hoveredPoint.x - 70 : 10,
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          zIndex: 10,
          pointerEvents: 'none',
          boxShadow: 'var(--shadow-glass)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(16, 20, 38, 0.95)',
          whiteSpace: 'nowrap'
        }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
            {formatDate(hoveredPoint.date)}
          </div>
          <div style={{ fontWeight: 700, color: hoveredPoint.stroke || 'white', display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span>{hoveredPoint.label}:</span>
            <span style={{ fontSize: '1rem' }}>{hoveredPoint.val}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>
              {parameter === 'temperature' ? '°C' : parameter === 'heartRate' ? 'bpm' : parameter === 'spo2' ? '%' : 'mmHg'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
