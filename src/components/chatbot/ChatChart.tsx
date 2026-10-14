import { useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import type { ChatBlock } from '@/hooks/useChatbot';

// Palet kategorikal tervalidasi (urutan tetap, tidak diputar ulang)
const SERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'];
const GRID = '#e1e0d9';
const AXIS = '#c3c2b7';
const MUTED = '#898781';

const compactNumber = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${(n / 1e12).toLocaleString('id-ID', { maximumFractionDigits: 1 })} T`;
  if (abs >= 1e9) return `${(n / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`;
  if (abs >= 1e6) return `${(n / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  if (abs >= 1e3) return `${(n / 1e3).toLocaleString('id-ID', { maximumFractionDigits: 1 })} rb`;
  return n.toLocaleString('id-ID', { maximumFractionDigits: 1 });
};

// Label sumbu Y dibuat ringkas (tanpa "Rp"); satuan lengkap ada di judul dan tooltip
const axisTick = (value: number, unit?: string) =>
  (unit ?? "").trim() === "%" ? `${compactNumber(value)}%` : compactNumber(value);

const formatValue = (value: number, unit?: string, compact = false) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  const u = (unit ?? '').trim();
  if (u.toLowerCase() === 'rp') {
    return compact ? `Rp ${compactNumber(value)}` : `Rp ${value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
  }
  if (u === '%') return `${value.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`;
  const num = compact ? compactNumber(value) : value.toLocaleString('id-ID', { maximumFractionDigits: 2 });
  return u ? `${num} ${u}` : num;
};

interface TooltipEntry {
  name?: string;
  value?: number;
  color?: string;
  payload?: { label?: string; fill?: string };
}

// Teks legenda memakai warna tinta, bukan warna seri
const legendText = (value: string) => <span style={{ color: '#52514e' }}>{value}</span>;

const ChartTooltip = ({ active, payload, label, unit }: { active?: boolean; payload?: TooltipEntry[]; label?: string; unit?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-medium text-gray-900">{label ?? payload[0]?.payload?.label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-gray-600">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color ?? p.payload?.fill }} />
          <span>{p.name}</span>
          <span className="ml-auto pl-3 font-medium tabular-nums text-gray-900">{formatValue(Number(p.value), unit)}</span>
        </div>
      ))}
    </div>
  );
};

export const ChatChart = ({ block }: { block: ChatBlock }) => {
  const [showTable, setShowTable] = useState(false);
  const labels = block.labels ?? [];
  const series = (block.series ?? []).filter((s) => Array.isArray(s.values)).slice(0, SERIES_COLORS.length);
  const unit = block.unit;

  // Data recharts: satu baris per label, satu kolom per seri (s0, s1, ...)
  const data = labels.map((label, i) => {
    const row: Record<string, string | number> = { label };
    series.forEach((s, si) => { row[`s${si}`] = Number(s.values[i] ?? 0); });
    return row;
  });

  if (labels.length === 0 || series.length === 0) return null;

  const showLegend = series.length >= 2;
  // Miringkan label sumbu X hanya kalau tidak muat ditulis mendatar
  const tiltLabels = labels.reduce((sum, l) => sum + String(l).length, 0) > 48;
  const axisProps = { stroke: AXIS, tick: { fill: MUTED, fontSize: 11 }, tickLine: false };
  const yAxis = (
    <YAxis {...axisProps} axisLine={false} width={52} tickFormatter={(v: number) => axisTick(v, unit)} />
  );

  // Pie maksimal 6 irisan; label irisan ditampilkan sebagai legenda teks di bawah grafik
  const isPie = block.chartType === 'pie';
  const pieData = isPie
    ? labels.slice(0, 6).map((label, i) => ({
        label,
        name: label,
        value: Number(series[0].values[i] ?? 0),
        fill: SERIES_COLORS[i % SERIES_COLORS.length],
      }))
    : [];
  const pieTotal = pieData.reduce((sum, d) => sum + d.value, 0) || 1;

  let chart: JSX.Element;
  if (isPie) {
    chart = (
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          innerRadius="55%"
          outerRadius="90%"
          stroke="#ffffff"
          strokeWidth={2}
          isAnimationActive={false}
        >
          {pieData.map((d) => <Cell key={d.label} fill={d.fill} />)}
        </Pie>
        <Tooltip content={<ChartTooltip unit={unit} />} />
      </PieChart>
    );
  } else if (block.chartType === 'line') {
    chart = (
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        {yAxis}
        <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: AXIS }} />
        {showLegend && <Legend wrapperStyle={{ fontSize: 11 }} formatter={legendText} />}
        {series.map((s, i) => (
          <Line
            key={i}
            type="monotone"
            dataKey={`s${i}`}
            name={s.name}
            stroke={SERIES_COLORS[i]}
            strokeWidth={2}
            dot={{ r: 4, fill: SERIES_COLORS[i], strokeWidth: 2, stroke: '#ffffff' }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    );
  } else {
    chart = (
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barGap={2}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" {...axisProps} interval={0} angle={tiltLabels ? -30 : 0} textAnchor={tiltLabels ? 'end' : 'middle'} height={tiltLabels ? 56 : 30} />
        {yAxis}
        <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
        {showLegend && <Legend wrapperStyle={{ fontSize: 11 }} formatter={legendText} />}
        {series.map((s, i) => (
          <Bar key={i} dataKey={`s${i}`} name={s.name} fill={SERIES_COLORS[i]} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
        ))}
      </BarChart>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-[#fcfcfb] p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        {block.title && <div className="text-xs font-semibold text-gray-900">{block.title}</div>}
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="ml-auto shrink-0 text-[11px] text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline"
        >
          {showTable ? 'Lihat grafik' : 'Lihat tabel'}
        </button>
      </div>

      {showTable ? (
        <div className="max-h-64 overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-1 pr-2 font-medium">Kategori</th>
                {series.map((s, i) => <th key={i} className="py-1 pr-2 text-right font-medium">{s.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {labels.map((label, li) => (
                <tr key={li} className="border-b border-gray-100 last:border-0">
                  <td className="py-1 pr-2 text-gray-700">{label}</td>
                  {series.map((s, si) => (
                    <td key={si} className="py-1 pr-2 text-right tabular-nums text-gray-900">{formatValue(Number(s.values[li] ?? 0), unit)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className={isPie ? 'h-40 w-full' : 'h-56 w-full'}>
            <ResponsiveContainer width="100%" height="100%">{chart}</ResponsiveContainer>
          </div>
          {isPie && (
            <ul className="mt-2 space-y-1 text-xs">
              {pieData.map((d) => (
                <li key={d.label} className="flex items-center gap-2 text-gray-700">
                  <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: d.fill }} />
                  <span className="min-w-0 flex-1 truncate">{d.label}</span>
                  <span className="tabular-nums text-gray-900">{formatValue(d.value, unit)}</span>
                  <span className="w-10 text-right tabular-nums text-gray-500">{Math.round((d.value / pieTotal) * 100)}%</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};
