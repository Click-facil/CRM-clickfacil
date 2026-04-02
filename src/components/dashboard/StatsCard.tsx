import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle: string;
  variant?: 'primary' | 'success' | 'warning' | 'destructive';
}

export function StatsCard({ title, value, icon: Icon, subtitle }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-3 px-4">
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground truncate leading-none mb-0.5">{title}</p>
          <p className="text-lg font-bold leading-none">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}