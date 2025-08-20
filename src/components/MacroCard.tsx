import { Card } from "@/components/ui/card";
import { CircularProgress } from "./CircularProgress";
import { cn } from "@/lib/utils";

interface MacroCardProps {
  title: string;
  current: number;
  target: number;
  unit: string;
  color: 'primary' | 'protein' | 'carbs' | 'fats';
  className?: string;
}

export const MacroCard = ({ title, current, target, unit, color, className }: MacroCardProps) => {
  const percentage = Math.min((current / target) * 100, 100);
  
  const colorClasses = {
    primary: "text-primary",
    protein: "text-protein", 
    carbs: "text-carbs",
    fats: "text-fats"
  };

  return (
    <Card className={cn("p-4 shadow-card hover:shadow-glow transition-all", className)}>
      <div className="flex flex-col items-center space-y-2">
        <CircularProgress 
          percentage={percentage} 
          size={80} 
          strokeWidth={6}
          color={color}
        >
          <div className="text-center">
            <div className={cn("text-lg font-bold", colorClasses[color])}>
              {current}
            </div>
            <div className="text-xs text-muted-foreground">
              /{target}
            </div>
          </div>
        </CircularProgress>
        
        <div className="text-center">
          <h3 className="font-medium text-sm text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{unit}</p>
        </div>
      </div>
    </Card>
  );
};