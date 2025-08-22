// src/pages/Diary.tsx
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useFoodEntries } from "@/hooks/useFoodEntries";
import { useToast } from "@/hooks/use-toast";
import FoodSearchModalAdvanced from "@/components/FoodSearchModalAdvanced";
import FoodEntryCardAdvanced from "@/components/FoodEntryCardAdvanced";


export default function Diary() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [draggedEntry, setDraggedEntry] = useState<any>(null);

  const targetDate = selectedDate.toISOString().split("T")[0];

  // Use the single hook instance for this page (single source of truth)
  const {
    meals = [],
    foodEntries = [],
    loading,
    calculateDailyNutrition,
    getMealEntries,
    addFoodEntry,
    updateFoodEntry,
    deleteFoodEntry,
    refetch,
  } = useFoodEntries(targetDate);

  const { toast } = useToast();

  // Recalculate / refetch when date changes
  useEffect(() => {
    const doRefetch = async () => {
      if (refetch) await refetch();
    };
    doRefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  const dailyNutrition = calculateDailyNutrition ? calculateDailyNutrition() : {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    totalFiber: 0,
    totalSugar: 0,
    totalSodium: 0
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("it-IT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const changeDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
  };

  const handleAddFood = (mealId: string) => {
    setSelectedMealId(mealId);
    setIsSearchModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, entry: any) => {
    setDraggedEntry(entry);
    // store id in dataTransfer in case needed
    try { e.dataTransfer.setData("text/plain", entry.id); } catch (err) { /* ignore */ }
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetMealId: string) => {
    e.preventDefault();
    if (!draggedEntry) return;

    if (draggedEntry.meal_id === targetMealId) {
      setDraggedEntry(null);
      return;
    }

    try {
      const result = await updateFoodEntry?.(draggedEntry.id, { meal_id: targetMealId });
      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Errore durante lo spostamento",
        });
      } else {
        const targetMeal = meals.find((m) => m.id === targetMealId);
        toast({
          title: "Alimento spostato",
          description: `${draggedEntry.food_name} spostato in ${targetMeal?.name || "pasto"}`,
        });
        // refresh page data to show correct meal grouping and totals
        if (refetch) await refetch();
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore durante lo spostamento",
      });
    } finally {
      setDraggedEntry(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4 max-w-md mx-auto">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
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
          <Button variant="ghost" size="sm" onClick={() => changeDate("prev")} className="p-2">
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="text-center">
            <h2 className="font-semibold text-foreground capitalize">{formatDate(selectedDate)}</h2>
            <p className="text-sm text-muted-foreground">
              Totale: {Math.round(dailyNutrition.totalCalories || 0)} kcal
            </p>
          </div>

          <Button variant="ghost" size="sm" onClick={() => changeDate("next")} className="p-2">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Meals list */}
      <div className="space-y-3">
        {meals.map((meal) => {
          const mealEntries = getMealEntries ? getMealEntries(meal.id) : foodEntries.filter((fe) => fe.meal_id === meal.id);
          const mealCalories = mealEntries.reduce((sum: number, entry: any) => {
            const multiplier = (entry.serving_size || 0) / 100;
            return sum + ((entry.calories_per_100g || 0) * multiplier);
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

                <Button size="sm" variant="ghost" className="text-primary p-1" onClick={() => handleAddFood(meal.id)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {mealEntries.length > 0 ? (
                <div className="space-y-2">
                  {mealEntries.map((entry: any) => (
                    <FoodEntryCardAdvanced
                      key={entry.id}
                      entry={entry}
                      onDragStart={handleDragStart}
                      isDragging={draggedEntry?.id === entry.id}
                      // pass the page's handlers so all updates go through this hook instance
                      onUpdate={updateFoodEntry}
                      onDelete={deleteFoodEntry}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 border-2 border-dashed border-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Nessun alimento registrato</p>
                  <Button size="sm" variant="outline" onClick={() => handleAddFood(meal.id)}>
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
            <p className="text-xl font-bold text-primary">{Math.round(dailyNutrition.totalCalories || 0)}</p>
            <p className="text-xs text-muted-foreground">Calorie</p>
          </div>
          <div>
            <p className="text-xl font-bold text-protein">{Math.round(dailyNutrition.totalProtein || 0)}g</p>
            <p className="text-xs text-muted-foreground">Proteine</p>
          </div>
          <div>
            <p className="text-xl font-bold text-carbs">{Math.round(dailyNutrition.totalCarbs || 0)}g</p>
            <p className="text-xs text-muted-foreground">Carboidrati</p>
          </div>
          <div>
            <p className="text-xl font-bold text-fats">{Math.round(dailyNutrition.totalFats || 0)}g</p>
            <p className="text-xs text-muted-foreground">Grassi</p>
          </div>
        </div>
      </Card>

      <FoodSearchModalAdvanced
        isOpen={isSearchModalOpen}
        onClose={() => {
          setIsSearchModalOpen(false);
          setSelectedMealId(null);
          if (refetch) refetch();
        }}
        selectedMealId={selectedMealId}
        meals={meals}
        onAdded={async () => {
          if (refetch) await refetch();
          setSelectedMealId(null);
          setIsSearchModalOpen(false);
        }}
      />
    </div>
  );
}
