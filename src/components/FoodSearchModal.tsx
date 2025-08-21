import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Minus } from "lucide-react";
import { FoodService, FoodItem } from "@/services/foodService";
import { useFoodEntries } from "@/hooks/useFoodEntries";
import { useToast } from "@/hooks/use-toast";

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMealId?: string | null;
}

export function FoodSearchModal({ isOpen, onClose, selectedMealId }: FoodSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servingSize, setServingSize] = useState("100");
  const [servingUnit, setServingUnit] = useState("g");
  const [isAdding, setIsAdding] = useState(false);

  const { addFoodEntry, meals } = useFoodEntries();
  const { toast } = useToast();

  useEffect(() => {
    let isCancelled = false;
    
    if (searchQuery.length >= 2) {
      FoodService.searchFoods(searchQuery).then(results => {
        if (!isCancelled) {
          setSearchResults(results);
        }
      });
    } else {
      setSearchResults([]);
    }
    
    return () => {
      isCancelled = true;
    };
  }, [searchQuery]);

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setSearchResults([]);
    setSearchQuery(food.name);
  };

  const calculateNutrition = () => {
    if (!selectedFood) return null;
    return FoodService.calculateNutrition(selectedFood, parseFloat(servingSize) || 0, servingUnit);
  };

  const handleAddFood = async () => {
    if (!selectedFood) return;

    setIsAdding(true);
    try {
      const nutrition = calculateNutrition();
      if (!nutrition) return;

      const result = await addFoodEntry({
        meal_id: selectedMealId,
        food_name: selectedFood.name,
        brand: selectedFood.brand || null,
        serving_size: parseFloat(servingSize),
        serving_unit: servingUnit,
        calories_per_100g: selectedFood.calories_per_100g,
        protein_per_100g: selectedFood.protein_per_100g,
        carbs_per_100g: selectedFood.carbs_per_100g,
        fats_per_100g: selectedFood.fats_per_100g,
        fiber_per_100g: selectedFood.fiber_per_100g || 0,
        sugar_per_100g: selectedFood.sugar_per_100g || 0,
        sodium_per_100g: selectedFood.sodium_per_100g || 0,
        consumed_date: new Date().toISOString().split('T')[0],
        consumed_at: new Date().toISOString(),
      });

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Errore durante l'aggiunta dell'alimento",
        });
      } else {
        toast({
          title: "Alimento aggiunto",
          description: `${selectedFood.name} aggiunto al diario`,
        });
        onClose();
        resetForm();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore durante l'aggiunta dell'alimento",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const resetForm = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedFood(null);
    setServingSize("100");
    setServingUnit("g");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const adjustServingSize = (delta: number) => {
    const current = parseFloat(servingSize) || 0;
    const newSize = Math.max(0, current + delta);
    setServingSize(newSize.toString());
  };

  const nutrition = calculateNutrition();
  const selectedMeal = meals.find(m => m.id === selectedMealId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Aggiungi alimento
            {selectedMeal && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                - {selectedMeal.name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="food-search">Cerca alimento</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="food-search"
                placeholder="Es. pasta, pollo, banana..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && !selectedFood && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              <Label>Risultati ricerca</Label>
              {searchResults.map((food, index) => (
                <div
                  key={index}
                  onClick={() => handleFoodSelect(food)}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{food.name}</p>
                      {food.brand && (
                        <p className="text-xs text-muted-foreground">{food.brand}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {food.calories_per_100g} kcal/100g
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Food Details */}
          {selectedFood && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
              <div>
                <h3 className="font-medium">{selectedFood.name}</h3>
                {selectedFood.brand && (
                  <p className="text-sm text-muted-foreground">{selectedFood.brand}</p>
                )}
              </div>

              {/* Serving Size */}
              <div className="space-y-2">
                <Label>Porzione</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustServingSize(-10)}
                    disabled={parseFloat(servingSize) <= 10}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Input
                    type="number"
                    value={servingSize}
                    onChange={(e) => setServingSize(e.target.value)}
                    className="w-20 text-center"
                    min="0"
                    step="1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustServingSize(10)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Select value={servingUnit} onValueChange={setServingUnit}>
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="pz">pz</SelectItem>
                      <SelectItem value="cup">cup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Nutrition Info */}
              {nutrition && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-2 bg-background rounded">
                    <p className="font-semibold text-primary">{nutrition.calories}</p>
                    <p className="text-xs text-muted-foreground">kcal</p>
                  </div>
                  <div className="text-center p-2 bg-background rounded">
                    <p className="font-semibold text-protein">{nutrition.protein}g</p>
                    <p className="text-xs text-muted-foreground">proteine</p>
                  </div>
                  <div className="text-center p-2 bg-background rounded">
                    <p className="font-semibold text-carbs">{nutrition.carbs}g</p>
                    <p className="text-xs text-muted-foreground">carboidrati</p>
                  </div>
                  <div className="text-center p-2 bg-background rounded">
                    <p className="font-semibold text-fats">{nutrition.fats}g</p>
                    <p className="text-xs text-muted-foreground">grassi</p>
                  </div>
                </div>
              )}

              {/* Quick Portions */}
              <div className="space-y-2">
                <Label>Porzioni comuni</Label>
                <div className="flex flex-wrap gap-2">
                  {[50, 100, 150, 200, 250].map((size) => (
                    <Button
                      key={size}
                      variant="outline"
                      size="sm"
                      onClick={() => setServingSize(size.toString())}
                      className={servingSize === size.toString() ? "bg-primary text-primary-foreground" : ""}
                    >
                      {size}g
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleAddFood}
                  disabled={isAdding || !servingSize || parseFloat(servingSize) <= 0}
                  className="flex-1 bg-gradient-primary shadow-glow"
                >
                  {isAdding ? "Aggiunta..." : "Aggiungi al diario"}
                </Button>
                <Button variant="outline" onClick={() => setSelectedFood(null)}>
                  Cambia
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}