import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  active: boolean;
}

export function StatusBadge({ active }: StatusBadgeProps) {
  return (
    <Badge
      variant={active ? 'default' : 'secondary'}
      className={active ? 'bg-success text-white hover:bg-success/90' : 'bg-gray-400 text-white hover:bg-gray-400/90'}
    >
      {active ? 'Ativo' : 'Desativado'}
    </Badge>
  );
}
