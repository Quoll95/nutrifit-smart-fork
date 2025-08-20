import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Diary() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const meals = [
    {
      name: "Colazione",
      calories: 320,
      foods: [
        { name: "Avena con latte", quantity: "50g", calories: 180 },
        { name: "Banana", quantity: "1 media", calories: 105 },
        { name: "Miele", quantity: "1 cucchiaio", calories: 35 }
      ]
    },
    {
      name: "Spuntino mattina",
      calories: 150,
      foods: [
        { name: "Yogurt greco", quantity: "150g", calories: 150 }
      ]
    },
    {
      name: "Pranzo",
      calories: 650,
      foods: [
        { name: "Petto di pollo", quantity: "150g", calories: 230 },
        { name: "Riso integrale", quantity: "80g", calories: 280 },
        { name: "Verdure miste", quantity: "200g", calories: 140 }
      ]
    },
    {
      name: "Merenda",
      calories: 127,
      foods: [
        { name: "Mandorle", quantity: "20g", calories: 127 }
      ]
    },
    {
      name: "Cena",
      calories: 0,
      foods: []
    }
  ];

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      {/* Date Navigation */}
      <Card className="p-4 shadow-card">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => changeDate('prev')}
            className="p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <h2 className="font-semibold text-foreground capitalize">
              {formatDate(selectedDate)}
            </h2>
            <p className="text-sm text-muted-foreground">
              Totale: {totalCalories} kcal
            </p>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => changeDate('next')}
            className="p-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Meals */}
      <div className="space-y-3">
        {meals.map((meal, mealIndex) => (
          <Card key={mealIndex} className="p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-foreground">{meal.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  {meal.calories} kcal
                </Badge>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-primary p-1"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {meal.foods.length > 0 ? (
              <div className="space-y-2">
                {meal.foods.map((food, foodIndex) => (
                  <div key={foodIndex} className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-medium text-foreground">{food.name}</p>
                      <p className="text-xs text-muted-foreground">{food.quantity}</p>
                    </div>
                    <span className="text-sm text-foreground">{food.calories} kcal</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Nessun alimento registrato
                </p>
                <Button size="sm" variant="outline">
                  Aggiungi alimento
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="p-4 shadow-card bg-gradient-success/5">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{totalCalories}</p>
            <p className="text-xs text-muted-foreground">Calorie totali</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-protein">87g</p>
            <p className="text-xs text-muted-foreground">Proteine</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-carbs">143g</p>
            <p className="text-xs text-muted-foreground">Carboidrati</p>
          </div>
        </div>
      </Card>
    </div>
  );
}