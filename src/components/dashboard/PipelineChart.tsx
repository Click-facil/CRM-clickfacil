import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { PIPELINE_COLUMNS } from "@/types/lead";

interface PipelineChartProps {
  stats: Record<string, number>;
}

export function PipelineChart({ stats }: PipelineChartProps) {
  const chartData = PIPELINE_COLUMNS.map(col => ({
    name: col.title,
    value: stats[col.id] || 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de Vendas</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}