import React from 'react';

export function DonutChart({ data, title }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 52, cx = 70, cy = 70, stroke = 18;
  const circumference = 2 * Math.PI * r;

  const slices = data.reduce((acc, d) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : null;
    const prevOffset = prev ? prev.offset + prev.d.value / total : 0;
    return [...acc, { d, offset: prevOffset }];
  }, []);

  return (
    <div className="flex flex-col h-full justify-between">
      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-display tracking-tight mb-4">{title}</p>
      <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
        <div className="relative w-[140px] h-[140px] flex-shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" className="dark:stroke-slate-800" strokeWidth={stroke} />
            {slices.map(({ d, offset }, i) => {
              const pct = d.value / total;
              const dash = pct * circumference;
              const gap = circumference - dash;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={-offset * circumference}
                  strokeLinecap="butt"
                  className="transition-all duration-500 ease-out"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none font-display">
              {total}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 font-semibold">
              Total
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 flex-1 w-full">
          {data.map(d => (
            <div key={d.label} className="flex items-center gap-2.5 text-xs">
              <span className="w-3 h-3 rounded-md flex-shrink-0 shadow-sm" style={{ backgroundColor: d.color }} />
              <span className="text-slate-600 dark:text-slate-400 font-medium">{d.label}</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold ml-auto">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BarChart({ data, title }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex flex-col h-full justify-between">
      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-display tracking-tight mb-4">{title}</p>
      <div className="space-y-3.5">
        {data.map(d => (
          <div key={d.label} className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-24 flex-shrink-0 truncate">
              {d.label}
            </span>
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(d.value / max) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 w-8 text-right font-display">
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
