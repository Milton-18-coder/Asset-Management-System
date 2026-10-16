import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

export const PriceHistoryChart = ({ data = [], height = 190 }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-36 flex items-center justify-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-400">
        No price history points recorded.
      </div>
    );
  }

  // Sort chronologically ascending
  const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Single data point view
  if (sorted.length === 1) {
    const p = sorted[0];
    const cleanDate = p.date ? (p.date.includes('T') ? p.date.split('T')[0] : p.date) : 'N/A';
    return (
      <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Single Baseline Purchase</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
              ₹{Number(p.price).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-500">per unit</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supplied by <strong className="text-slate-700 dark:text-slate-300">{p.vendor}</strong> on {cleanDate}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
          <DollarSign className="w-6 h-6" />
        </div>
      </div>
    );
  }

  const prices = sorted.map((d) => Number(d.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  
  const paddingX = 55;
  const paddingTop = 42;
  const paddingBottom = 28;
  const svgWidth = 560;
  const svgHeight = Math.max(height, 190);

  const priceRange = maxPrice === minPrice ? 1 : maxPrice - minPrice;
  const adjustedMin = Math.max(0, minPrice - priceRange * 0.12);
  const adjustedMax = maxPrice + priceRange * 0.18;
  const adjustedRange = adjustedMax - adjustedMin || 1;

  const points = sorted.map((d, index) => {
    const x = paddingX + (index / (sorted.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingBottom - ((Number(d.price) - adjustedMin) / adjustedRange) * (svgHeight - paddingTop - paddingBottom);
    const cleanDate = d.date ? (d.date.includes('T') ? d.date.split('T')[0] : d.date) : '';
    return { ...d, x, y, priceNum: Number(d.price), cleanDate };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${svgHeight - paddingBottom} L ${points[0].x},${svgHeight - paddingBottom} Z`;

  const firstPrice = points[0].priceNum;
  const lastPrice = points[points.length - 1].priceNum;
  const diff = lastPrice - firstPrice;
  const pctChange = ((diff / firstPrice) * 100).toFixed(1);

  return (
    <div className="space-y-2">
      {/* Chart Header Info */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">Historical Price Trend</span>
          <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold ${
              diff > 0
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                : diff < 0
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {diff > 0 ? <TrendingUp className="w-3 h-3" /> : diff < 0 ? <TrendingDown className="w-3 h-3" /> : null}
            {diff > 0 ? `+${pctChange}%` : diff < 0 ? `${pctChange}%` : 'Stable (0%)'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span>Min: <strong className="text-slate-700 dark:text-slate-300">₹{minPrice.toLocaleString('en-IN')}</strong></span>
          <span>Max: <strong className="text-slate-700 dark:text-slate-300">₹{maxPrice.toLocaleString('en-IN')}</strong></span>
          <span>Avg: <strong className="text-indigo-600 dark:text-indigo-400">₹{Math.round(avgPrice).toLocaleString('en-IN')}</strong></span>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative bg-slate-50/70 dark:bg-slate-900/70 rounded-2xl p-2 border border-slate-200/70 dark:border-slate-800/80 overflow-hidden">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <filter id="pillShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={svgWidth - paddingX}
            y2={paddingTop}
            stroke="currentColor"
            strokeDasharray="3 3"
            className="text-slate-200 dark:text-slate-800"
          />
          <line
            x1={paddingX}
            y1={svgHeight - paddingBottom}
            x2={svgWidth - paddingX}
            y2={svgHeight - paddingBottom}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
          />

          {/* Area under line */}
          <path d={areaD} fill="url(#priceGradient)" />

          {/* Price Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data points and Permanent Price Values on each Edge */}
          {points.map((pt, i) => {
            const formattedPrice = `₹${pt.priceNum.toLocaleString('en-IN')}`;
            const badgeWidth = Math.max(56, formattedPrice.length * 7.5 + 12);
            const badgeHeight = 20;

            return (
              <g key={pt.id || i} className="cursor-pointer group">
                {/* Permanent Value Badge at the Edge */}
                <g transform={`translate(${pt.x}, ${pt.y - 12})`}>
                  {/* Subtle Badge Pointer Triangle */}
                  <polygon
                    points="-4,-2 4,-2 0,4"
                    className="fill-indigo-600 dark:fill-indigo-500"
                  />
                  {/* Badge Background Pill */}
                  <rect
                    x={-badgeWidth / 2}
                    y={-badgeHeight}
                    width={badgeWidth}
                    height={badgeHeight}
                    rx={badgeHeight / 2}
                    filter="url(#pillShadow)"
                    className="fill-indigo-600 dark:fill-indigo-500 stroke-white dark:stroke-slate-900 stroke-[1.5]"
                  />
                  {/* Badge Price Text */}
                  <text
                    x="0"
                    y={-badgeHeight / 2 + 3.5}
                    textAnchor="middle"
                    className="fill-white font-mono font-bold text-[10.5px] select-none tracking-tight"
                  >
                    {formattedPrice}
                  </text>
                </g>

                {/* Node Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="6"
                  className="fill-white dark:fill-slate-900 stroke-indigo-600 stroke-[3] transition-all group-hover:r-7 group-hover:stroke-indigo-500"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />

                {/* Bottom Date Label */}
                <text
                  x={pt.x}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-mono font-medium"
                >
                  {pt.cleanDate ? pt.cleanDate.slice(0, 7) : ''}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-20 bg-slate-900/95 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-700 pointer-events-none transition-all transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(hoveredPoint.x / svgWidth) * 100}%`,
              top: `${Math.max(8, (hoveredPoint.y / svgHeight) * 100 - 16)}%`,
            }}
          >
            <div className="flex items-center gap-1.5 font-bold text-indigo-300 mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="font-mono text-sm">₹{hoveredPoint.priceNum.toLocaleString('en-IN')} / unit</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Vendor: <span className="font-semibold text-white">{hoveredPoint.vendor}</span>
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {hoveredPoint.cleanDate || hoveredPoint.date}</span>
              <span>· Qty: {hoveredPoint.quantity}</span>
              {hoveredPoint.invoiceNumber && <span>· Inv: {hoveredPoint.invoiceNumber}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceHistoryChart;

