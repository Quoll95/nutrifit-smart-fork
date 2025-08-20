import { cn } from "@/lib/utils";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: 'primary' | 'protein' | 'carbs' | 'fats';
  children?: React.ReactNode;
  className?: string;
}

export const CircularProgress = ({ 
  percentage, 
  size = 120, 
  strokeWidth = 8,
  color = 'primary',
  children,
  className 
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    primary: "stroke-primary",
    protein: "stroke-protein",
    carbs: "stroke-carbs",
    fats: "stroke-fats"
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(colorClasses[color], "transition-all duration-500 ease-out")}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};