import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useFoodEntries } from "@/hooks/useFoodEntries";
import { FoodSearchModal } from "@/components/FoodSearchModal";
import { FoodEntryCard } from "@/components/FoodEntryCard";
import FoodEntryCardAdvanced from "@/components/FoodEntryCardAdvanced";
import { useToast } from "@/hooks/use-toast";
import FoodSearchModalAdvanced from "@/components/FoodSearchModalAdvanced";

export default function Diary() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [draggedEntry, setDraggedEntry] = useState<any>(null);

  const targetDate = selectedDate.toISOString().split('T')[0];
  const { meals, foodEntries, loading, calculateDailyNutrition, getMealEntries, updateFoodEntry } = useFoodEntries(targetDate);
  const { toast } = useToast();

  const dailyNutrition = calculateDailyNutrition();

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

  const handleAddFood = (mealId: string) => {
    setSelectedMealId(mealId);
    setIsSearchModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, entry: any) => {
    setDraggedEntry(entry);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetMealId: string) => {
    e.preventDefault();
    
    if (draggedEntry && draggedEntry.meal_id !== targetMealId) {
      try {
        const result = await updateFoodEntry(draggedEntry.id, {
          meal_id: targetMealId
        });

        if (result?.error) {
          toast({
            variant: "destructive",  
            title: "Errore",
            description: "Errore durante lo spostamento"
          });
        } else {
          const targetMeal = meals.find(m => m.id === targetMealId);
          toast({
            title: "Alimento spostato",
            description: `${draggedEntry.food_name} spostato in ${targetMeal?.name}`
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Errore", 
          description: "Errore durante lo spostamento"
        });
      }
    }
    
    setDraggedEntry(null);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4 max-w-md mx-auto">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i} className="p-4 h-24 bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

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
              Totale: {Math.round(dailyNutrition.totalCalories)} kcal
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
        {meals.map((meal) => {
          const mealEntries = getMealEntries(meal.id);
          const mealCalories = mealEntries.reduce((sum, entry) => {
            const multiplier = entry.serving_size / 100;
            return sum + (entry.calories_per_100g * multiplier);
          }, 0);

          return (
            <Card 
              key={meal.id} 
              className="p-4 shadow-card"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, meal.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-foreground">{meal.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(mealCalories)} kcal
                  </Badge>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-primary p-1"
                  onClick={() => handleAddFood(meal.id)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {mealEntries.length > 0 ? (
                <div className="space-y-2">
                  {mealEntries.map((entry) => (
                    <FoodEntryCardAdvanced
                      key={entry.id}
                      entry={entry}
                      onDragStart={handleDragStart}
                      isDragging={draggedEntry?.id === entry.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 border-2 border-dashed border-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Nessun alimento registrato
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAddFood(meal.id)}
                  >
                    Aggiungi alimento
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="p-4 shadow-card bg-gradient-success/5">
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-xl font-bold text-primary">{Math.round(dailyNutrition.totalCalories)}</p>
            <p className="text-xs text-muted-foreground">Calorie</p>
          </div>
          <div>
            <p className="text-xl font-bold text-protein">{Math.round(dailyNutrition.totalProtein)}g</p>
            <p className="text-xs text-muted-foreground">Proteine</p>
          </div>
          <div>
            <p className="text-xl font-bold text-carbs">{Math.round(dailyNutrition.totalCarbs)}g</p>
            <p className="text-xs text-muted-foreground">Carboidrati</p>
          </div>
          <div>
            <p className="text-xl font-bold text-fats">{Math.round(dailyNutrition.totalFats)}g</p>
            <p className="text-xs text-muted-foreground">Grassi</p>
          </div>
        </div>
      </Card>

      <FoodSearchModalAdvanced
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        selectedMealId={selectedMealId}
      />
    </div>
  );
}