import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, Trash2, Check, X, GripVertical } from "lucide-react";
import { useFoodEntries } from "@/hooks/useFoodEntries";
import { useToast } from "@/hooks/use-toast";

interface FoodEntry {
  id: string;
  food_name: string;
  brand: string | null;
  serving_size: number;
  serving_unit: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
}

interface FoodEntryCardProps {
  entry: FoodEntry;
  onDragStart?: (e: React.DragEvent, entry: FoodEntry) => void;
  isDragging?: boolean;
}

export function FoodEntryCard({ entry, onDragStart, isDragging }: FoodEntryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    serving_size: entry.serving_size.toString(),
    serving_unit: entry.serving_unit
  });

  const { updateFoodEntry, deleteFoodEntry } = useFoodEntries();
  const { toast } = useToast();

  const calculateNutrition = (servingSize: number) => {
    const multiplier = servingSize / 100;
    return {
      calories: Math.round(entry.calories_per_100g * multiplier),
      protein: Math.round(entry.protein_per_100g * multiplier * 10) / 10,
      carbs: Math.round(entry.carbs_per_100g * multiplier * 10) / 10,
      fats: Math.round(entry.fats_per_100g * multiplier * 10) / 10,
    };
  };

  const currentNutrition = calculateNutrition(entry.serving_size);
  const editNutrition = calculateNutrition(parseFloat(editData.serving_size) || 0);

  const handleSave = async () => {
    try {
      const result = await updateFoodEntry(entry.id, {
        serving_size: parseFloat(editData.serving_size),
        serving_unit: editData.serving_unit
      });

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Errore durante l'aggiornamento"
        });
      } else {
        toast({
          title: "Alimento aggiornato",
          description: "Le modifiche sono state salvate"
        });
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore durante l'aggiornamento"
      });
    }
  };

  const handleDelete = async () => {
    if (confirm(`Vuoi eliminare ${entry.food_name}?`)) {
      try {
        const result = await deleteFoodEntry(entry.id);
        
        if (result?.error) {
          toast({
            variant: "destructive",
            title: "Errore",
            description: "Errore durante l'eliminazione"
          });
        } else {
          toast({
            title: "Alimento eliminato",
            description: `${entry.food_name} è stato rimosso dal diario`
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Errore durante l'eliminazione"
        });
      }
    }
  };

  const handleCancel = () => {
    setEditData({
      serving_size: entry.serving_size.toString(),
      serving_unit: entry.serving_unit
    });
    setIsEditing(false);
  };

  return (
    <Card 
      className={`p-3 transition-all ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'} cursor-move`}
      draggable
      onDragStart={(e) => onDragStart?.(e, entry)}
    >
      <div className="flex items-start space-x-3">
        <GripVertical className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{entry.food_name}</p>
              {entry.brand && (
                <p className="text-xs text-muted-foreground truncate">{entry.brand}</p>
              )}
              
              {isEditing ? (
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    type="number"
                    value={editData.serving_size}
                    onChange={(e) => setEditData(prev => ({ ...prev, serving_size: e.target.value }))}
                    className="w-16 h-8 text-xs"
                    min="0"
                    step="1"
                  />
                  <Select 
                    value={editData.serving_unit} 
                    onValueChange={(value) => setEditData(prev => ({ ...prev, serving_unit: value }))}
                  >
                    <SelectTrigger className="w-16 h-8 text-xs">
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
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  {entry.serving_size}{entry.serving_unit}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-1 ml-2">
              {isEditing ? (
                <>
                  <Button size="sm" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0">
                    <Check className="w-3 h-3 text-green-600" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 w-6 p-0">
                    <X className="w-3 h-3 text-red-600" />
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="h-6 w-6 p-0">
                    <Edit2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleDelete} className="h-6 w-6 p-0">
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-2">
            <Badge variant="secondary" className="text-xs">
              {isEditing ? editNutrition.calories : currentNutrition.calories} kcal
            </Badge>
            <span className="text-xs text-muted-foreground">
              P: {isEditing ? editNutrition.protein : currentNutrition.protein}g
            </span>
            <span className="text-xs text-muted-foreground">
              C: {isEditing ? editNutrition.carbs : currentNutrition.carbs}g
            </span>
            <span className="text-xs text-muted-foreground">
              F: {isEditing ? editNutrition.fats : currentNutrition.fats}g
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}