import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subValue?: string;
}

const StatsCard = ({ icon: Icon, label, value, subValue }: StatsCardProps) => {
  return (
    <div className="card-gradient rounded-xl p-4 border border-border/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-xl font-display font-bold text-foreground">{value}</p>
          {subValue && (
            <p className="text-xs text-muted-foreground">{subValue}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
