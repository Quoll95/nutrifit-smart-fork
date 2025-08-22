import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MacroCard } from "@/components/MacroCard";
import { CircularProgress } from "@/components/CircularProgress";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Apple, Coffee, Utensils, Moon, Calendar, TrendingUp } from "lucide-react";
import { useUserGoals } from "@/hooks/useUserGoals";
import { useFoodEntries } from "@/hooks/useFoodEntries";
import { useState } from "react";

export default function Dashboard() {
  const [viewPeriod, setViewPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const { progress } = useUserGoals();
  const { meals, getMealEntries } = useFoodEntries();

  const currentProgress = progress[viewPeriod];
  const remainingCalories = currentProgress.calories.target - currentProgress.calories.current;

  const mealIcons = {
    'Colazione': Coffee,
    'Spuntino Mattina': Apple,
    'Pranzo': Utensils,
    'Spuntino Pomeriggio': Apple,
    'Cena': Moon
  };

  const recentMeals = meals.map(meal => {
    const mealEntries = getMealEntries(meal.id);
    const mealCalories = mealEntries.reduce((sum, entry) => {
      const multiplier = entry.serving_size / 100;
      return sum + (entry.calories_per_100g * multiplier);
    }, 0);
    
    return {
      icon: mealIcons[meal.name as keyof typeof mealIcons] || Utensils,
      name: meal.name,
      calories: Math.round(mealCalories),
      hasItems: mealEntries.length > 0
    };
  });

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      {/* Period Selection */}
      <div className="flex space-x-1 bg-muted/30 p-1 rounded-lg">
        {(['daily', 'weekly', 'monthly'] as const).map((period) => (
          <Button
            key={period}
            variant={viewPeriod === period ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewPeriod(period)}
            className="flex-1 h-8 text-xs"
          >
            {period === 'daily' ? 'Oggi' : period === 'weekly' ? 'Settimana' : 'Mese'}
          </Button>
        ))}
      </div>

      {/* Calorie Overview Card */}
      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Calorie {viewPeriod === 'daily' ? 'di oggi' : viewPeriod === 'weekly' ? 'settimanali' : 'mensili'}
            </h2>
            <p className="text-sm text-muted-foreground">
              Obiettivo {viewPeriod === 'daily' ? 'giornaliero' : viewPeriod === 'weekly' ? 'settimanale' : 'mensile'}
            </p>
          </div>
          <CircularProgress 
            percentage={currentProgress.calories.percentage} 
            size={80} 
            color="primary"
          >
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {Math.round(currentProgress.calories.percentage)}%
              </div>
            </div>
          </CircularProgress>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Consumate</span>
            <span className="font-medium">{currentProgress.calories.current} kcal</span>
          </div>
          <Progress value={currentProgress.calories.percentage} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rimanenti</span>
            <span className="font-medium text-primary">{Math.max(0, remainingCalories)} kcal</span>
          </div>
        </div>
      </Card>

      {/* Macronutrienti */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">Macronutrienti</h3>
        <div className="grid grid-cols-3 gap-3">
          <MacroCard
            title="Proteine"
            current={currentProgress.protein.current}
            target={currentProgress.protein.target}
            unit="g"
            color="protein"
          />
          <MacroCard
            title="Carboidrati"
            current={currentProgress.carbs.current}
            target={currentProgress.carbs.target}
            unit="g"
            color="carbs"
          />
          <MacroCard
            title="Grassi"
            current={currentProgress.fats.current}
            target={currentProgress.fats.target}
            unit="g"
            color="fats"
          />
        </div>
      </div>

      {/* Pasti di oggi */}
      <Card className="p-4 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Pasti di oggi</h3>
          <Button variant="ghost" size="sm" className="text-primary p-0">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {recentMeals.map((meal, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${meal.hasItems ? 'bg-primary/10' : 'bg-muted/50'}`}>
                  <meal.icon className={`w-4 h-4 ${meal.hasItems ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className={`font-medium text-sm ${meal.hasItems ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {meal.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {meal.hasItems ? `${meal.calories} kcal` : 'Non registrato'}
                  </p>
                </div>
              </div>
              {!meal.hasItems && (
                <Button size="sm" variant="outline" className="h-7 px-3 text-xs">
                  Aggiungi
                </Button>
              )}
              {meal.hasItems && (
                <span className="text-sm font-medium text-foreground">{meal.calories} kcal</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button className="h-12 bg-gradient-primary shadow-glow" size="lg">
          Aggiungi pasto
        </Button>
        <Button variant="outline" size="lg" className="h-12">
          Vedi dettagli
        </Button>
      </div>
    </div>
  );
}