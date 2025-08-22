import React, { useState, useMemo } from "react";
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
  serving_size: number; // current stored size (may be grams or other unit depending on legacy data)
  serving_unit: string; // 'g' | 'ml' | 'pz' | 'cup'
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  // optional helpers (if available from DB)
  serving_weight_grams?: number; // peso per pezzo
  grams_per_ml?: number; // density
  cup_grams?: number;
}

interface Props {
  entry: FoodEntry;
  onDragStart?: (e: React.DragEvent, entry: FoodEntry) => void;
  isDragging?: boolean;
  onUpdate?: (id: string, updates: Partial<FoodEntry>) => Promise<any>;
  onDelete?: (id: string) => Promise<any>;
}


export default function FoodEntryCardAdvanced({ entry, onDragStart, isDragging, onDelete, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    serving_size: entry.serving_size.toString(),
    serving_unit: entry.serving_unit
  });
  const [pieceWeightOverride, setPieceWeightOverride] = useState<string>(entry.serving_weight_grams ? String(entry.serving_weight_grams) : "");


  const { toast } = useToast();

  // Convert a (size, unit) for this entry to grams using available metadata.
  const convertToGrams = (size: number, unit: string, overridePiece?: number | null) : number | null => {
    switch (unit) {
      case 'g':
        return size;
      case 'ml':
        return size * (entry.grams_per_ml || 1);
      case 'pz':
        if (entry.serving_weight_grams) return size * entry.serving_weight_grams;
        if (overridePiece && overridePiece > 0) return size * overridePiece;
        return null;
      case 'cup':
        if (entry.cup_grams) return size * entry.cup_grams;
        return size * 240; // fallback
      default:
        return null;
    }
  };

  const calculateFromGrams = (grams: number) => {
    const factor = grams / 100;
    return {
      calories: Math.round((entry.calories_per_100g || 0) * factor),
      protein: Math.round((entry.protein_per_100g || 0) * factor * 10) / 10,
      carbs: Math.round((entry.carbs_per_100g || 0) * factor * 10) / 10,
      fats: Math.round((entry.fats_per_100g || 0) * factor * 10) / 10,
    };
  };

  // Current (display) nutrition: try to convert stored entry to grams
  const currentGrams = useMemo(() => convertToGrams(entry.serving_size, entry.serving_unit, entry.serving_weight_grams ?? null), [entry]);
  const currentNutrition = currentGrams ? calculateFromGrams(currentGrams) : null;

  // Nutrition preview for edit values
  const editGrams = useMemo(() => {
    const size = parseFloat(editData.serving_size) || 0;
    const override = pieceWeightOverride ? parseFloat(pieceWeightOverride) : null;
    return convertToGrams(size, editData.serving_unit, override);
  }, [editData, pieceWeightOverride]);
  const editNutrition = editGrams ? calculateFromGrams(editGrams) : null;

  const handleSave = async () => {
    try {
      // convert edited values to grams for storage (normalize)
      const size = parseFloat(editData.serving_size) || 0;
      const override = pieceWeightOverride ? parseFloat(pieceWeightOverride) : null;
      const grams = convertToGrams(size, editData.serving_unit, override);

      if (editData.serving_unit === 'pz' && grams === null) {
        toast({ variant: 'destructive', title: 'Serve peso per pezzo', description: 'Inserisci il peso per pezzo (g) prima di salvare.' });
        return;
      }

      const payload: any = {
        serving_size: grams ?? size,
        serving_unit: grams ? 'g' : editData.serving_unit,
      };

      // include metadata if available so backend can keep piece weight
      if (override) payload.serving_weight_grams = override;

      const result = onUpdate ? await onUpdate(entry.id, payload) : null;
      if (result?.error) {
        toast({ variant: 'destructive', title: 'Errore', description: 'Errore durante l\'aggiornamento' });
      } else {
        toast({ title: 'Aggiornato', description: 'Voce aggiornata' });
        setIsEditing(false);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Errore durante l\'aggiornamento' });
    }
  };



  const handleDelete = async () => {
    if (!confirm(`Vuoi eliminare ${entry.food_name}?`)) return;
    try {
      const result = onDelete ? await onDelete(entry.id) : null;
      if (result?.error) {
        toast({ variant: 'destructive', title: 'Errore', description: 'Errore durante l\'eliminazione' });
      } else {
        toast({ title: 'Eliminato', description: `${entry.food_name} rimosso dal diario` });
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Errore durante l\'eliminazione' });
    }
  };

  const handleCancel = () => {
    setEditData({ serving_size: entry.serving_size.toString(), serving_unit: entry.serving_unit });
    setPieceWeightOverride(entry.serving_weight_grams ? String(entry.serving_weight_grams) : "");
    setIsEditing(false);
  };

  return (
    <Card className={`p-3 transition-all ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'} cursor-move`} draggable onDragStart={(e) => onDragStart?.(e, entry)}>
      <div className="flex items-start space-x-3">
        <GripVertical className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{entry.food_name}</p>
              {entry.brand && <p className="text-xs text-muted-foreground truncate">{entry.brand}</p>}

              {isEditing ? (
                <div className="flex items-center space-x-2 mt-2">
                  <Input type="number" value={editData.serving_size} onChange={(e) => setEditData(prev => ({ ...prev, serving_size: e.target.value }))} className="w-16 h-8 text-xs" min="0" step="1" />
                  <Select value={editData.serving_unit} onValueChange={(value) => setEditData(prev => ({ ...prev, serving_unit: value }))}>
                    <SelectTrigger className="w-16 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="pz">pz</SelectItem>
                      <SelectItem value="cup">cup</SelectItem>
                    </SelectContent>
                  </Select>

                  {editData.serving_unit === 'pz' && !entry.serving_weight_grams && (
                    <Input type="number" value={pieceWeightOverride} onChange={(e) => setPieceWeightOverride(e.target.value)} placeholder="peso/pezzo (g)" className="w-28 h-8 text-xs" />
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">{entry.serving_size}{entry.serving_unit}</p>
              )}
            </div>

            <div className="flex items-center space-x-1 ml-2">
              {isEditing ? (
                <>
                  <Button size="sm" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0"><Check className="w-3 h-3 text-green-600" /></Button>
                  <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 w-6 p-0"><X className="w-3 h-3 text-red-600" /></Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="h-6 w-6 p-0"><Edit2 className="w-3 h-3 text-muted-foreground" /></Button>
                  <Button size="sm" variant="ghost" onClick={handleDelete} className="h-6 w-6 p-0"><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-2">
            <Badge variant="secondary" className="text-xs">{(isEditing ? (editNutrition ? editNutrition.calories : '—') : (currentNutrition ? currentNutrition.calories : '—'))} kcal</Badge>
            <span className="text-xs text-muted-foreground">P: {(isEditing ? (editNutrition ? editNutrition.protein : '—') : (currentNutrition ? currentNutrition.protein : '—'))}g</span>
            <span className="text-xs text-muted-foreground">C: {(isEditing ? (editNutrition ? editNutrition.carbs : '—') : (currentNutrition ? currentNutrition.carbs : '—'))}g</span>
            <span className="text-xs text-muted-foreground">F: {(isEditing ? (editNutrition ? editNutrition.fats : '—') : (currentNutrition ? currentNutrition.fats : '—'))}g</span>
          </div>

          {(!currentNutrition && entry.serving_unit === 'pz') && (
            <p className="text-xs text-amber-600 mt-2">Impossibile calcolare i valori: peso per pezzo mancante. Modifica la voce e inserisci il peso per pezzo (g).</p>
          )}
        </div>
      </div>
    </Card>
  );
}
