import React, { useState } from 'react';

/**
 * Format Indian Currency Short Notation
 */
function formatCurrencyShort(num) {
  const val = Number(num) || 0;
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)}Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)}L`;
  }
  if (val >= 1000) {
    return `₹${(val / 1000).toFixed(1)}k`;
  }
  return `₹${val}`;
}

/**
 * 1. Grouped Bar Chart (Volume & Value by Department - Dual Scale Calibrated)
 * Displays permanent values above each bar
 */
export function GroupedBarChart({ data = [], title, subtitle }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [viewMode, setViewMode] = useState('both'); // 'both' | 'volume' | 'capital'

  const maxVolume = Math.max(...data.map(d => d.volume || 0), 1);
  const maxValue = Math.max(...data.map(d => d.value || 0), 1);
  const chartHeight = 175;

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
        <div>
          {title && <h3 className="text-sm font-bold text-slate-800 dark:text-white font-display">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-bold">
          <button
            onClick={() => setViewMode('both')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              viewMode === 'both' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Both (Dual)
          </button>
          <button
            onClick={() => setViewMode('volume')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              viewMode === 'volume' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Units Only
          </button>
          <button
            onClick={() => setViewMode('capital')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              viewMode === 'capital' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Capital (₹) Only
          </button>
        </div>
      </div>

      <div className="relative pt-8 pb-2">
        {/* Y-Axis guide lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-10 border-b border-slate-300 dark:border-slate-700">
          <div className="border-b border-slate-400 border-dashed w-full" />
          <div className="border-b border-slate-400 border-dashed w-full" />
          <div className="border-b border-slate-400 border-dashed w-full" />
          <div className="border-b border-slate-400 w-full" />
        </div>

        {/* Bars Container */}
        <div className="relative flex items-end justify-between gap-1.5 sm:gap-3 h-[210px] px-1 sm:px-2">
          {data.map((d, i) => {
            const volHeight = Math.max(((d.volume || 0) / maxVolume) * chartHeight * 0.75, 12);
            const valHeight = Math.max(((d.value || 0) / maxValue) * chartHeight * 0.75, 12);
            const isHovered = hoveredIdx === i;

            return (
              <div
                key={d.label}
                className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Floating Detailed Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute -top-16 z-30 bg-slate-900 text-white text-[11px] py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <p className="font-bold text-indigo-300">{d.label}</p>
                    <p className="text-slate-300">
                      Units: <span className="font-bold text-indigo-400">{d.volume} units</span> • Capital: <span className="font-bold text-emerald-400">₹{d.value?.toLocaleString('en-IN')}</span>
                    </p>
                  </div>
                )}

                <div className="flex items-end gap-1 sm:gap-1.5 w-full justify-center">
                  {/* Volume Bar (Purple) with PERMANENT VALUE on top */}
                  {(viewMode === 'both' || viewMode === 'volume') && (
                    <div className="w-full max-w-[20px] flex flex-col items-center">
                      <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 mb-0.5 font-mono leading-none tracking-tight">
                        {d.volume}
                      </span>
                      <div
                        style={{ height: `${volHeight}px` }}
                        className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-indigo-500 group-hover:from-indigo-500 group-hover:to-indigo-400 transition-all duration-300 shadow-xs"
                        title={`Units: ${d.volume}`}
                      />
                    </div>
                  )}

                  {/* Value Bar (Green) with PERMANENT VALUE on top */}
                  {(viewMode === 'both' || viewMode === 'capital') && (
                    <div className="w-full max-w-[20px] flex flex-col items-center">
                      <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 mb-0.5 font-mono leading-none tracking-tight">
                        {formatCurrencyShort(d.value)}
                      </span>
                      <div
                        style={{ height: `${valHeight}px` }}
                        className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-500 group-hover:from-emerald-500 group-hover:to-emerald-400 transition-all duration-300 shadow-xs"
                        title={`Capital: ₹${d.value?.toLocaleString('en-IN')}`}
                      />
                    </div>
                  )}
                </div>

                {/* X-Axis Label */}
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate mt-2 max-w-[50px] sm:max-w-[70px] text-center" title={d.label}>
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Scales */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-4">
          {(viewMode === 'both' || viewMode === 'volume') && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-indigo-500" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                Asset Units (Peak: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{maxVolume} units</strong>)
              </span>
            </div>
          )}
          {(viewMode === 'both' || viewMode === 'capital') && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                Invested Capital (Peak: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{formatCurrencyShort(maxValue)}</strong>)
              </span>
            </div>
          )}
        </div>

        <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">
          Live Permanent Values Displayed Above Bars
        </span>
      </div>
    </div>
  );
}

/**
 * 2. Horizontal Bar Chart (Supplier Ranking & Spend Share)
 */
export function HorizontalBarChart({ data = [], title, subtitle }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {title && <h3 className="text-sm font-bold text-slate-800 dark:text-white font-display">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">{subtitle}</p>}
      </div>

      <div className="space-y-4 my-auto">
        {data.map((d, i) => {
          const pct = Math.round((d.value / total) * 100);
          const widthPct = Math.max((d.value / max) * 100, 4);

          return (
            <div key={d.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={d.label}>
                  {d.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px] font-semibold">{pct}% share</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    ₹{d.value?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${widthPct}%` }}
                  className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full rounded-full transition-all duration-700 ease-out"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
        <span>Cumulative Supplier Capital:</span>
        <span className="font-bold text-slate-800 dark:text-white font-mono">₹{total.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}

/**
 * 3. Histogram Chart (Asset Cost Bins & Life Distribution)
 * Displays permanent frequency/count badges above every bar
 */
export function HistogramChart({ bins = [], title, subtitle, unit = 'assets' }) {
  const maxCount = Math.max(...bins.map(b => b.count), 1);
  const totalCount = bins.reduce((s, b) => s + b.count, 0) || 1;

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {title && <h3 className="text-sm font-bold text-slate-800 dark:text-white font-display">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">{subtitle}</p>}
      </div>

      <div className="relative pt-6 pb-2">
        <div className="flex items-end justify-between gap-2 sm:gap-3 h-[180px] px-2 border-b border-slate-200 dark:border-slate-800">
          {bins.map((bin, i) => {
            const barHeight = Math.max((bin.count / maxCount) * 135, 8);
            const pct = totalCount > 0 ? Math.round((bin.count / totalCount) * 100) : 0;

            return (
              <div key={bin.range} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                {/* Count Badge on Top - PERMANENTLY VISIBLE */}
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 mb-1 font-mono leading-none">
                  {bin.count} <span className="text-[8px] font-normal text-slate-400">({pct}%)</span>
                </span>

                <div
                  style={{ height: `${barHeight}px` }}
                  className={`w-full rounded-t-lg transition-all duration-500 group-hover:brightness-110 shadow-xs ${
                    bin.highlight
                      ? 'bg-gradient-to-t from-rose-500 to-amber-500'
                      : 'bg-gradient-to-t from-indigo-600 to-violet-500'
                  }`}
                />

                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate mt-2 text-center max-w-[65px]" title={bin.range}>
                  {bin.range}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
        <span>Sample Size: <strong className="text-slate-700 dark:text-slate-300">{totalCount} {unit}</strong></span>
        <span>Distribution Model: <strong className="text-indigo-600 dark:text-indigo-400">Normal Bracket</strong></span>
      </div>
    </div>
  );
}

/**
 * 4. Multi-Line & Area Trend Graph (Price & Maintenance Curves)
 * Permanently displays values above each node point with anti-overlap positioning
 */
export function TrendLineChart({ data = [], title, subtitle }) {
  const [activePoint, setActivePoint] = useState(null);

  if (!data || data.length === 0) return null;

  const width = 520;
  const height = 200;
  const paddingX = 35;
  const paddingTop = 32;
  const paddingBottom = 30;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const minVal = Math.min(...data.map(d => d.value), 0);
  const range = maxVal - minVal || 1;

  // Calculate SVG coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * (width - paddingX * 2);
    const y = height - paddingBottom - ((d.value - minVal) / range) * (height - paddingTop - paddingBottom);
    return { x, y, ...d };
  });

  // Construct SVG Path
  const linePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Shaded area path
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {title && <h3 className="text-sm font-bold text-slate-800 dark:text-white font-display">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">{subtitle}</p>}
      </div>

      <div className="relative w-full overflow-hidden my-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingTop} x2={width - paddingX} y2={paddingTop} stroke="#cbd5e1" strokeDasharray="3 3" opacity="0.4" />
          <line x1={paddingX} y1={(height - paddingBottom + paddingTop) / 2} x2={width - paddingX} y2={(height - paddingBottom + paddingTop) / 2} stroke="#cbd5e1" strokeDasharray="3 3" opacity="0.4" />
          <line x1={paddingX} y1={height - paddingBottom} x2={width - paddingX} y2={height - paddingBottom} stroke="#cbd5e1" opacity="0.6" />

          {/* Shaded Area */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line Curve */}
          <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive Dots and Permanent Node Value Labels */}
          {points.map((p, i) => {
            const formattedVal = p.value >= 100000 ? `₹${(p.value / 100000).toFixed(1)}L` : (p.value >= 1000 ? `₹${(p.value / 1000).toFixed(1)}k` : `₹${p.value}`);
            const badgeWidth = Math.max(48, formattedVal.length * 6.5 + 10);
            const badgeHeight = 16;
            const labelY = p.y - 12;

            return (
              <g
                key={i}
                className="cursor-pointer group"
                onMouseEnter={() => setActivePoint(p)}
                onMouseLeave={() => setActivePoint(null)}
              >
                {/* Permanent Node Value Pill Badge */}
                <g transform={`translate(${p.x}, ${labelY})`}>
                  <rect
                    x={-badgeWidth / 2}
                    y={-badgeHeight}
                    width={badgeWidth}
                    height={badgeHeight}
                    rx={badgeHeight / 2}
                    className="fill-indigo-600 dark:fill-indigo-500 shadow-xs"
                  />
                  <text
                    x="0"
                    y={-badgeHeight / 2 + 3}
                    textAnchor="middle"
                    className="fill-white font-mono font-bold text-[9px] select-none"
                  >
                    {formattedVal}
                  </text>
                </g>

                {/* Node circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={activePoint?.label === p.label ? 6 : 4}
                  fill="#ffffff"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  className="transition-all duration-200 group-hover:r-6"
                />

                {/* X-axis label under node */}
                <text
                  x={p.x}
                  y={height - paddingBottom + 15}
                  textAnchor="middle"
                  className="fill-slate-500 dark:fill-slate-400 font-semibold text-[8.5px]"
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay with exact currency */}
        {activePoint && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1.5 px-3 rounded-xl shadow-xl pointer-events-none z-20">
            <span className="font-bold text-indigo-300">{activePoint.label}: </span>
            <span className="font-mono font-bold text-emerald-400">₹{activePoint.value?.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
        <span>Timeline: <strong className="text-slate-700 dark:text-slate-300">{data[0]?.label} ➔ {data[data.length - 1]?.label}</strong></span>
        <span>Inflation Trajectory: <strong className="text-emerald-600 dark:text-emerald-400">Live Database Benchmark</strong></span>
      </div>
    </div>
  );
}
