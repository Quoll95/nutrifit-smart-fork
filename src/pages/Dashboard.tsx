import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MacroCard } from "@/components/MacroCard";
import { CircularProgress } from "@/components/CircularProgress";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Apple, Coffee, Utensils, Moon } from "lucide-react";

export default function Dashboard() {
  // Dati mock per la demo
  const dailyGoals = {
    calories: { current: 1247, target: 2000 },
    protein: { current: 87, target: 150 },
    carbs: { current: 143, target: 250 },
    fats: { current: 42, target: 65 }
  };

  const caloriesPercentage = (dailyGoals.calories.current / dailyGoals.calories.target) * 100;
  const remainingCalories = dailyGoals.calories.target - dailyGoals.calories.current;

  const recentMeals = [
    { icon: Coffee, name: "Colazione", calories: 320, time: "08:30" },
    { icon: Apple, name: "Spuntino", calories: 150, time: "10:15" },
    { icon: Utensils, name: "Pranzo", calories: 650, time: "13:00" },
    { icon: Apple, name: "Merenda", calories: 127, time: "16:00" },
  ];

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      {/* Calorie Overview Card */}
      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Calorie di oggi</h2>
            <p className="text-sm text-muted-foreground">Obiettivo giornaliero</p>
          </div>
          <CircularProgress 
            percentage={caloriesPercentage} 
            size={80} 
            color="primary"
          >
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {Math.round(caloriesPercentage)}%
              </div>
            </div>
          </CircularProgress>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Consumate</span>
            <span className="font-medium">{dailyGoals.calories.current} kcal</span>
          </div>
          <Progress value={caloriesPercentage} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rimanenti</span>
            <span className="font-medium text-primary">{remainingCalories} kcal</span>
          </div>
        </div>
      </Card>

      {/* Macronutrienti */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">Macronutrienti</h3>
        <div className="grid grid-cols-3 gap-3">
          <MacroCard
            title="Proteine"
            current={dailyGoals.protein.current}
            target={dailyGoals.protein.target}
            unit="g"
            color="protein"
          />
          <MacroCard
            title="Carboidrati"
            current={dailyGoals.carbs.current}
            target={dailyGoals.carbs.target}
            unit="g"
            color="carbs"
          />
          <MacroCard
            title="Grassi"
            current={dailyGoals.fats.current}
            target={dailyGoals.fats.target}
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
                <div className="p-2 rounded-lg bg-primary/10">
                  <meal.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{meal.name}</p>
                  <p className="text-xs text-muted-foreground">{meal.time}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-foreground">{meal.calories} kcal</span>
            </div>
          ))}
          
          <div className="flex items-center justify-between py-2 border-t border-border mt-3 pt-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-muted/50">
                <Moon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm text-muted-foreground">Cena</p>
                <p className="text-xs text-muted-foreground">Non registrata</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="h-7 px-3 text-xs">
              Aggiungi
            </Button>
          </div>
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