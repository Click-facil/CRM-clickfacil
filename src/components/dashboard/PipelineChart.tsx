import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PipelineChartProps {
  stats: Record<string, number>;
}

const stageLabels: Record<string, string> = {
  new: 'Novos',
  contacted: 'Contatados',
  proposal_sent: 'Propostas',
  negotiation: 'Negociação',
  won: 'Fechados',
  lost: 'Perdidos',
};

const stageColors: Record<string, string> = {
  new: 'hsl(200, 90%, 50%)',
  contacted: 'hsl(270, 60%, 55%)',
  proposal_sent: 'hsl(35, 95%, 55%)',
  negotiation: 'hsl(25, 100%, 50%)',
  won: 'hsl(145, 65%, 42%)',
  lost: 'hsl(0, 75%, 55%)',
};

export function PipelineChart({ stats }: PipelineChartProps) {
  const data = Object.entries(stats).map(([key, value]) => ({
    name: stageLabels[key] || key,
    value,
    key,
  }));

  return (
    <div className="bg-card rounded-xl p-6 card-shadow">
      <h3 className="text-lg font-semibold mb-6">Funil de Vendas</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={90}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={stageColors[entry.key]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
