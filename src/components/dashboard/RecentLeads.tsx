import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Lead } from "@/types/lead";
import { Button } from "../ui/button";

interface RecentLeadsProps {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
}

export function RecentLeads({ leads, onViewLead }: RecentLeadsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads Recentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {leads.map((lead) => (
          <div key={lead.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{lead.companyName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{lead.companyName}</p>
                <p className="text-sm text-muted-foreground">{lead.niche}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => onViewLead(lead)}>Ver</Button>
          </div>
        ))}
        {leads.length === 0 && <p className="text-sm text-muted-foreground text-center">Nenhum lead recente.</p>}
      </CardContent>
    </Card>
  );
}