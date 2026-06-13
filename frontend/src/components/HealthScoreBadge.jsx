import { Badge } from '@/components/ui/badge';

export function HealthScoreBadge({ score, rating }) {
  let variant = 'destructive';
  if (rating === 'Excellent') variant = 'success';
  else if (rating === 'Good') variant = 'default';
  else if (rating === 'Average') variant = 'warning';

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-xl border border-border h-full">
      <span className="text-4xl font-bold text-foreground mb-1">{score}</span>
      <span className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Health Score</span>
      <Badge variant={variant} className="text-sm px-3 py-1">
        {rating}
      </Badge>
    </div>
  );
}