// src/components/dashboard/PipelineChart.tsx

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PipelineChartProps {
  stats: Record<string, number>;
}

const STAGE_CONFIG = [
  { key: 'new',           label: 'Novos',      color: '#3b82f6' },
  { key: 'contacted',     label: 'Contatados', color: '#8b5cf6' },
  { key: 'proposal_sent', label: 'Proposta',   color: '#f59e0b' },
  { key: 'negotiation',   label: 'Negociação', color: '#f97316' },
  { key: 'won',           label: 'Fechados',   color: '#22c55e' },
  { key: 'lost',          label: 'Perdidos',   color: '#ef4444' },
  { key: 'refused',       label: 'Recusados',  color: '#6b7280' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-medium">{label}</p>
      <p style={{ color: payload[0].fill }}>{payload[0].value} leads</p>
    </div>
  );
};

export function PipelineChart({ stats }: PipelineChartProps) {
  const data = STAGE_CONFIG.map(s => ({
    name:  s.label,
    value: stats[s.key] || 0,
    color: s.color,
  }));

  const total = data.reduce((s, d) => s + d.value, 0);
  const maxValue = Math.max(...data.map(d => d.value), 100);
  const yTicks = Array.from({ length: Math.floor(maxValue / 10) + 1 }, (_, i) => i * 10);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-base font-semibold">Funil de Vendas</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}
              barCategoryGap="25%">
              <XAxis dataKey="name" hide />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} domain={[0, maxValue]} ticks={yTicks} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t justify-center flex-shrink-0">
          {STAGE_CONFIG.map(s => (
            <div key={s.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
              {s.label}
              <span className="font-semibold text-foreground">{stats[s.key] || 0}</span>
            </div>
          ))}
        </div>

        {total === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Nenhum lead no funil ainda
          </p>
        )}
      </CardContent>
    </Card>
  );
}