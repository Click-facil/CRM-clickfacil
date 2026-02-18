import { Script } from "@/types/lead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ScriptCardProps {
  script: Script;
  onEdit: () => void;
  onDelete: () => void;
}

export function ScriptCard({ script, onEdit, onDelete }: ScriptCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{script.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-3">{script.content}</CardDescription>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" size="sm" onClick={onEdit}><Edit className="w-4 h-4 mr-2" /> Editar</Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-2" /> Apagar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}