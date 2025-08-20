import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Scan, Clock, Star, Apple } from "lucide-react";
import { useState } from "react";

export default function AddFood() {
  const [searchQuery, setSearchQuery] = useState("");

  const recentFoods = [
    { name: "Avena integrale", calories: 389, per: "100g", brand: "Quaker" },
    { name: "Petto di pollo", calories: 165, per: "100g", brand: "Generico" },
    { name: "Banana", calories: 89, per: "1 media", brand: "Generico" },
    { name: "Yogurt greco 0%", calories: 59, per: "100g", brand: "Fage" },
  ];

  const popularFoods = [
    { name: "Pasta di semola", calories: 371, per: "100g", brand: "Barilla" },
    { name: "Riso integrale", calories: 349, per: "100g", brand: "Generico" },
    { name: "Salmone", calories: 208, per: "100g", brand: "Generico" },
    { name: "Olio extravergine", calories: 884, per: "100ml", brand: "Generico" },
  ];

  const quickAdd = [
    { name: "Acqua", icon: "💧" },
    { name: "Caffè", icon: "☕" },
    { name: "Tè", icon: "🍵" },
    { name: "Frutta", icon: "🍎" },
  ];

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
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button className="bg-gradient-primary shadow-glow" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Cerca
            </Button>
            <Button variant="outline" size="sm">
              <Scan className="w-4 h-4 mr-2" />
              Scansiona
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
            >
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">{food.name}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-muted-foreground">{food.brand}</p>
                  <Badge variant="secondary" className="text-xs">
                    {food.calories} kcal/{food.per}
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
            >
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">{food.name}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-muted-foreground">{food.brand}</p>
                  <Badge variant="secondary" className="text-xs">
                    {food.calories} kcal/{food.per}
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
    </div>
  );
}