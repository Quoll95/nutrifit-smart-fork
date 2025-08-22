import React, { useEffect, useState } from "react";
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
import { Meal } from "@/hooks/useFoodEntries";


// Advanced Food Search Modal
// - quick add & popular sections that don't trigger the search flow
// - robust unit -> grams conversion (uses food.serving_weight_grams when available)
// - when 'pz' is selected and no piece weight exists, user is asked to provide peso/pezzo
// - previews macros updated live when unit/size changes

// Update the import path below to the actual location of Meal type definition
// Define the Meal type here if not available elsewhere

type Props = {
  isOpen: boolean
  onClose: () => void
  selectedMealId: string
  meals: Meal[]   
  onAdded: () => Promise<void>
}


// A handful of quick/popular items as examples — replace with your API if available
const SAMPLE_POPULAR: Partial<FoodItem>[] = [
  { id: "pop_pasta", name: "Pasta al pomodoro", brand: "",
    calories_per_100g: 160, protein_per_100g: 5.5, carbs_per_100g: 30, fats_per_100g: 2.0,
    serving_weight_grams: 180 // typical plate
  },
  { id: "pop_chicken", name: "Petto di pollo (grigliato)", brand: "",
    calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fats_per_100g: 3.6,
    serving_weight_grams: 120
  },
  { id: "pop_banana", name: "Banana media", brand: "",
    calories_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 23, fats_per_100g: 0.3,
    serving_weight_grams: 118
  }
];

const QUICK_ADD: { name: string; grams: number }[] = [
  { name: "Uovo sodo (1)", grams: 50 },
  { name: "Pane comune (1 fetta)", grams: 30 },
  { name: "Yogurt (125g)", grams: 125 }
];

export default function FoodSearchModalAdvanced({ isOpen, onClose, selectedMealId }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servingSize, setServingSize] = useState("100");
  const [servingUnit, setServingUnit] = useState("g");
  const [isAdding, setIsAdding] = useState(false);
  const [pieceWeightOverride, setPieceWeightOverride] = useState<string>("");

  const { addFoodEntry, meals, refetch } = useFoodEntries();
  const { toast } = useToast();

  useEffect(() => {
    let active = true;
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        FoodService.searchFoods(searchQuery).then(results => {
          if (active) setSearchResults(results);
        }).catch(() => {
          if (active) setSearchResults([]);
        });
      }, 300);
      return () => { active = false; clearTimeout(timer); };
    } else {
      setSearchResults([]);
    }
    return () => { active = false; };
  }, [searchQuery]);

  // Converts the provided size/unit to grams using the food metadata when available.
  // Returns grams or null if conversion not possible (e.g. missing piece weight and unit is 'pz').
  const convertToGrams = (food: FoodItem, size: number, unit: string, pieceOverride?: number | null): number | null => {
    if (!food) return null;
    switch (unit) {
      case "g":
        return size;
      case "ml":
        // assume density if provided (grams_per_ml) else fallback 1g/ml
        // Use optional field density if FoodItem includes it
        const density = (food as any).grams_per_ml || 1;
        return size * density;
      case "pz":
        // if food declares serving_weight_grams (peso/pezzo) use it, else use override
        if ((food as any).serving_weight_grams) {
          return size * ((food as any).serving_weight_grams as number);
        }
        if (pieceOverride && pieceOverride > 0) return size * pieceOverride;
        return null; // caller must prompt the user
      case "cup":
        // if food has cup_grams use it, else fallback to 240g per cup (common default)
        if ((food as any).cup_grams) return size * ((food as any).cup_grams as number);
        return size * 240;
      default:
        return null;
    }
  };

  const calcFromFood = (food: FoodItem, size: number, unit: string, pieceOverride?: number | null) => {
    const grams = convertToGrams(food, size, unit, pieceOverride ?? null);
    if (grams === null) return null;
    const factor = grams / 100;
    const calories = Math.round((food.calories_per_100g || 0) * factor);
    const protein = Math.round((food.protein_per_100g || 0) * factor * 10) / 10;
    const carbs = Math.round((food.carbs_per_100g || 0) * factor * 10) / 10;
    const fats = Math.round((food.fats_per_100g || 0) * factor * 10) / 10;
    return { calories, protein, carbs, fats, grams };
  };

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setSearchResults([]);
    setSearchQuery(food.name);
    // If food has a serving weight defined, select unit as "pz" for convenience.
    if ((food as any).serving_weight_grams) {
      setServingUnit("pz");
      setServingSize("1");
    } else {
      setServingUnit("g");
      setServingSize("100");
    }
    setPieceWeightOverride("");
  };

  // quick add uses baked-in grams and directly calls addFoodEntry without searching
  const handleQuickAdd = async (name: string, grams: number) => {
    setIsAdding(true);
    try {
      // build a lightweight entry using approximate per-100g macros from FoodService if available
      let approx = null;
      try {
        approx = await FoodService.lookupByName(name);
      } catch {
        approx = null;
      }
      const f: any = approx || {
        name,
        calories_per_100g: 0,
        protein_per_100g: 0,
        carbs_per_100g: 0,
        fats_per_100g: 0
      };

      const multiplier = grams / 100;
      const entry = {
        meal_id: selectedMealId,
        food_name: name,
        brand: f.brand || null,
        serving_size: grams,
        serving_unit: "g",
        calories_per_100g: f.calories_per_100g || 0,
        protein_per_100g: f.protein_per_100g || 0,
        carbs_per_100g: f.carbs_per_100g || 0,
        fats_per_100g: f.fats_per_100g || 0,
        fiber_per_100g: f.fiber_per_100g || 0,
        sugar_per_100g: f.sugar_per_100g || 0,
        sodium_per_100g: f.sodium_per_100g || 0,
        consumed_date: new Date().toISOString().split("T")[0],
        consumed_at: new Date().toISOString()
      };

      const result = await addFoodEntry(entry as any);
      if (result?.error) {
        toast({ variant: "destructive", title: "Errore", description: "Errore durante l'aggiunta rapida" });
      } else {
        toast({ title: "Aggiunto", description: `${name} aggiunto al diario` });
        refetch();
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Errore", description: "Errore durante l'aggiunta rapida" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddFood = async () => {
    if (!selectedFood) return;
    setIsAdding(true);
    try {
      const size = parseFloat(servingSize) || 0;
      const pieceOverride = pieceWeightOverride ? parseFloat(pieceWeightOverride) : undefined;
      const calc = calcFromFood(selectedFood, size, servingUnit, pieceOverride ?? null);
      if (!calc) {
        toast({ variant: "destructive", title: "Serve peso per pezzo", description: "Imposta il peso per pezzo (g) o scegli un'unità diversa" });
        setIsAdding(false);
        return;
      }

      const result = await addFoodEntry({
        meal_id: selectedMealId,
        food_name: selectedFood.name,
        brand: selectedFood.brand || null,
        serving_size: calc.grams,
        serving_unit: "g",
        calories_per_100g: selectedFood.calories_per_100g,
        protein_per_100g: selectedFood.protein_per_100g,
        carbs_per_100g: selectedFood.carbs_per_100g,
        fats_per_100g: selectedFood.fats_per_100g,
        fiber_per_100g: selectedFood.fiber_per_100g || 0,
        sugar_per_100g: selectedFood.sugar_per_100g || 0,
        sodium_per_100g: selectedFood.sodium_per_100g || 0,
        consumed_date: new Date().toISOString().split('T')[0],
        consumed_at: new Date().toISOString(),
      } as any);

      if (result?.error) {
        toast({ variant: "destructive", title: "Errore", description: "Errore durante l'aggiunta dell'alimento" });
      } else {
        toast({ title: "Alimento aggiunto", description: `${selectedFood.name} aggiunto al diario` });
        refetch();
        onClose();
        resetForm();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Errore", description: "Errore durante l'aggiunta dell'alimento" });
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
    setPieceWeightOverride("");
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

  const nutritionPreview = selectedFood ? calcFromFood(selectedFood, parseFloat(servingSize) || 0, servingUnit, pieceWeightOverride ? parseFloat(pieceWeightOverride) : null) : null;

  const selectedMeal = meals.find(m => m.id === selectedMealId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Aggiungi alimento
            {selectedMeal && (
              <span className="text-sm font-normal text-muted-foreground ml-2">- {selectedMeal.name}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Top: Quick Add + Popular (only shown when no selected food to avoid confusion) */}
          {!selectedFood && (
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label>Inserisci rapidamente</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {QUICK_ADD.map((q) => (
                    <Button key={q.name} size="sm" variant="ghost" onClick={() => handleQuickAdd(q.name, q.grams)}>
                      {q.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Più popolari</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SAMPLE_POPULAR.map((p) => (
                    <Button key={p.id} size="sm" variant="outline" onClick={() => handleFoodSelect(p as FoodItem)}>
                      {p.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="food-search">Cerca alimento</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input id="food-search" placeholder="Es. pasta, pollo, banana..." value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelectedFood(null); }} className="pl-10" />
            </div>

            {searchResults.length > 0 && !selectedFood && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <Label>Risultati ricerca</Label>
                {searchResults.map((food, index) => (
                  <div key={index} onClick={() => handleFoodSelect(food)} className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{food.name}</p>
                        {food.brand && <p className="text-xs text-muted-foreground">{food.brand}</p>}
                      </div>
                      <Badge variant="secondary" className="text-xs">{food.calories_per_100g} kcal/100g</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Food Details */}
          {selectedFood && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
              <div>
                <h3 className="font-medium">{selectedFood.name}</h3>
                {selectedFood.brand && <p className="text-sm text-muted-foreground">{selectedFood.brand}</p>}
              </div>

              <div className="space-y-2">
                <Label>Porzione</Label>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => adjustServingSize(- (servingUnit === 'pz' ? 1 : 10))} disabled={(parseFloat(servingSize) || 0) <= (servingUnit === 'pz' ? 1 : 10)}>
                    <Minus className="w-3 h-3" />
                  </Button>

                  <Input type="number" value={servingSize} onChange={(e) => setServingSize(e.target.value)} className="w-20 text-center" min="0" step={servingUnit === 'pz' ? "1" : "1"} />

                  <Button variant="outline" size="sm" onClick={() => adjustServingSize(servingUnit === 'pz' ? 1 : 10)}>
                    <Plus className="w-3 h-3" />
                  </Button>

                  <Select value={servingUnit} onValueChange={setServingUnit}>
                    <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="pz">pz</SelectItem>
                      <SelectItem value="cup">cup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* If user selected 'pz' and food has no known piece weight, ask for it */}
                {servingUnit === 'pz' && !(selectedFood as any).serving_weight_grams && (
                  <div className="mt-2">
                    <Label>Peso per pezzo (g)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" value={pieceWeightOverride} onChange={(e) => setPieceWeightOverride(e.target.value)} className="w-32" placeholder="es. 50" />
                      <p className="text-xs text-muted-foreground">Inserisci il peso medio di 1 pezzo se lo conosci (obbligatorio per usare 'pz').</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Nutrition Info */}
              {nutritionPreview ? (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-2 bg-background rounded">
                    <p className="font-semibold text-primary">{nutritionPreview.calories}</p>
                    <p className="text-xs text-muted-foreground">kcal</p>
                    <p className="text-xs text-muted-foreground">({Math.round(nutritionPreview.grams)} g)</p>
                  </div>

                  <div className="text-center p-2 bg-background rounded">
                    <p className="font-semibold text-protein">{nutritionPreview.protein}g</p>
                    <p className="text-xs text-muted-foreground">proteine</p>
                  </div>

                  <div className="text-center p-2 bg-background rounded">
                    <p className="font-semibold text-carbs">{nutritionPreview.carbs}g</p>
                    <p className="text-xs text-muted-foreground">carboidrati</p>
                  </div>

                  <div className="text-center p-2 bg-background rounded">
                    <p className="font-semibold text-fats">{nutritionPreview.fats}g</p>
                    <p className="text-xs text-muted-foreground">grassi</p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Impossibile calcolare i valori: fornisci peso/pezzo o scegli un'altra unità.</div>
              )}

              {/* Quick Portions */}
              <div className="space-y-2">
                <Label>Porzioni comuni</Label>
                <div className="flex flex-wrap gap-2">
                  {[50, 100, 150, 200, 250].map((size) => (
                    <Button key={size} variant={servingUnit === 'g' && servingSize === size.toString() ? "default" : "outline"} size="sm" onClick={() => { setServingUnit('g'); setServingSize(size.toString()); }}>
                      {size}g
                    </Button>
                  ))}

                  {/* quick '1 pezzo' shortcut when serving_weight exists */}
                  {(selectedFood as any).serving_weight_grams && (
                    <Button size="sm" onClick={() => { setServingUnit('pz'); setServingSize('1'); }}>
                      1 pezzo ({(selectedFood as any).serving_weight_grams}g)
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleAddFood} disabled={isAdding || !nutritionPreview} className="flex-1 bg-gradient-primary shadow-glow">
                  {isAdding ? "Aggiunta..." : "Aggiungi al diario"}
                </Button>
                <Button variant="outline" onClick={() => setSelectedFood(null)}>Cambiare</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
