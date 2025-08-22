import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Scan, Clock, Star } from "lucide-react";
import { useState } from "react";
import { FoodService } from "@/services/foodService";
import { FoodSearchModal } from "@/components/FoodSearchModal";
import FoodSearchModalAdvanced from "@/components/FoodSearchModalAdvanced";
import { useFoodEntries } from "@/hooks/useFoodEntries";

export default function AddFood() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const { meals } = useFoodEntries();

  const recentFoods = FoodService.getRecentFoods();
  const popularFoods = FoodService.getPopularFoods();

  const quickAdd = [
    { name: "Acqua", icon: "💧", food: { name: "Acqua", calories_per_100g: 0, protein_per_100g: 0, carbs_per_100g: 0, fats_per_100g: 0 } },
    { name: "Caffè", icon: "☕", food: { name: "Caffè", calories_per_100g: 2, protein_per_100g: 0.1, carbs_per_100g: 0.3, fats_per_100g: 0 } },
    { name: "Tè", icon: "🍵", food: { name: "Tè verde", calories_per_100g: 1, protein_per_100g: 0, carbs_per_100g: 0.3, fats_per_100g: 0 } },
    { name: "Frutta", icon: "🍎", food: { name: "Mela", calories_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14.0, fats_per_100g: 0.2 } },
  ];

  const handleSearchClick = () => {
    setSelectedMealId(null);
    setIsSearchModalOpen(true);
  };

  const handleFoodClick = (mealId: string | null = null) => {
    setSelectedMealId(mealId);
    setIsSearchModalOpen(true);
  };

  const handleBarcodeSearch = async () => {
    setIsScanning(true);
    try {
      // Simulate barcode scanning
      const food = await FoodService.getFoodByBarcode("1234567890");
      if (food) {
        // Open modal with found food
        setSelectedMealId(null);
        setIsSearchModalOpen(true);
      }
    } catch (error) {
      console.error('Barcode scan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      {/* Search Bar */}
      <Card className="p-4 shadow-card">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cerca alimenti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              onFocus={handleSearchClick}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleSearchClick} className="bg-gradient-primary shadow-glow" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Cerca
            </Button>
            <Button variant="outline" size="sm" onClick={handleBarcodeSearch} disabled={isScanning}>
              <Scan className="w-4 h-4 mr-2" />
              {isScanning ? "Scansiona..." : "Scansiona"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Add */}
      <Card className="p-4 shadow-card">
        <h3 className="font-semibold mb-3 text-foreground">Aggiungi rapidamente</h3>
        <div className="grid grid-cols-4 gap-2">
          {quickAdd.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-16 flex-col space-y-1"
              size="sm"
              onClick={() => handleFoodClick()}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs">{item.name}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Recent Foods */}
      <Card className="p-4 shadow-card">
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Recenti</h3>
        </div>
        
        <div className="space-y-2">
          {recentFoods.map((food, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleFoodClick()}
            >
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">{food.name}</p>
                <div className="flex items-center space-x-2">
                  {food.brand && <p className="text-xs text-muted-foreground">{food.brand}</p>}
                  <Badge variant="secondary" className="text-xs">
                    {food.calories_per_100g} kcal/100g
                  </Badge>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-primary">
                <span className="text-sm">+</span>
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Popular Foods */}
      <Card className="p-4 shadow-card">
        <div className="flex items-center space-x-2 mb-3">
          <Star className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Popolari</h3>
        </div>
        
        <div className="space-y-2">
          {popularFoods.map((food, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleFoodClick()}
            >
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">{food.name}</p>
                <div className="flex items-center space-x-2">
                  {food.brand && <p className="text-xs text-muted-foreground">{food.brand}</p>}
                  <Badge variant="secondary" className="text-xs">
                    {food.calories_per_100g} kcal/100g
                  </Badge>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-primary">
                <span className="text-sm">+</span>
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Meals Quick Add */}
      {meals.length > 0 && (
        <Card className="p-4 shadow-card">
          <h3 className="font-semibold mb-3 text-foreground">Aggiungi a pasto</h3>
          <div className="grid grid-cols-2 gap-2">
            {meals.slice(0, 4).map((meal) => (
              <Button
                key={meal.id}
                variant="outline"
                size="sm"
                onClick={() => handleFoodClick(meal.id)}
                className="text-left justify-start"
              >
                {meal.name}
              </Button>
            ))}
          </div>
        </Card>
      )}

      <FoodSearchModalAdvanced
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        selectedMealId={selectedMealId}
      />
    </div>
  );
}