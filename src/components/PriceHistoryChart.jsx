import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

export const PriceHistoryChart = ({ data = [], height = 180 }) => {
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
    return (
      <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Single Baseline Purchase</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
              ₹{Number(p.price).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">per unit</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supplied by <strong className="text-slate-700 dark:text-slate-300">{p.vendor}</strong> on {p.date}
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
  const paddingX = 45;
  const paddingY = 25;
  const svgWidth = 560;
  const svgHeight = height;

  const priceRange = maxPrice === minPrice ? 1 : maxPrice - minPrice;
  const priceRangeWithMargin = priceRange * 1.3;
  const adjustedMin = Math.max(0, minPrice - priceRange * 0.15);

  const points = sorted.map((d, index) => {
    const x = paddingX + (index / (sorted.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - ((Number(d.price) - adjustedMin) / priceRangeWithMargin) * (svgHeight - paddingY * 2);
    return { ...d, x, y, priceNum: Number(d.price) };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${svgHeight - paddingY} L ${points[0].x},${svgHeight - paddingY} Z`;

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
          <span>Min: <strong className="text-slate-700 dark:text-slate-300">₹{minPrice.toLocaleString()}</strong></span>
          <span>Max: <strong className="text-slate-700 dark:text-slate-300">₹{maxPrice.toLocaleString()}</strong></span>
          <span>Avg: <strong className="text-indigo-600 dark:text-indigo-400">₹{Math.round(avgPrice).toLocaleString()}</strong></span>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative bg-slate-50/70 dark:bg-slate-900/70 rounded-2xl p-2 border border-slate-200/70 dark:border-slate-800/80 overflow-hidden">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={svgWidth - paddingX}
            y2={paddingY}
            stroke="currentColor"
            strokeDasharray="3 3"
            className="text-slate-200 dark:text-slate-800"
          />
          <line
            x1={paddingX}
            y1={svgHeight - paddingY}
            x2={svgWidth - paddingX}
            y2={svgHeight - paddingY}
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
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data points */}
          {points.map((pt, i) => (
            <g key={pt.id || i} className="cursor-pointer group">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="6"
                className="fill-white dark:fill-slate-900 stroke-indigo-600 stroke-[3] transition-all group-hover:r-8 group-hover:stroke-indigo-500"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              <text
                x={pt.x}
                y={svgHeight - 8}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-mono font-medium"
              >
                {pt.date ? pt.date.slice(0, 7) : ''}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-20 bg-slate-900/95 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-700 pointer-events-none transition-all transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(hoveredPoint.x / svgWidth) * 100}%`,
              top: `${Math.max(10, (hoveredPoint.y / svgHeight) * 100 - 12)}%`,
            }}
          >
            <div className="flex items-center gap-1.5 font-bold text-indigo-300 mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="font-mono text-sm">₹{hoveredPoint.priceNum.toLocaleString()} / unit</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Vendor: <span className="font-semibold text-white">{hoveredPoint.vendor}</span>
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {hoveredPoint.date}</span>
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
