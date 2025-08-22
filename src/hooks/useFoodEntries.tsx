import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
// Commented out for testing - will be re-enabled later  
// import { useAuth } from '@/contexts/AuthContext';

interface FoodEntry {
  id: string;
  user_id: string;
  meal_id: string | null;
  food_name: string;
  brand: string | null;
  serving_size: number;
  serving_unit: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g: number | null;
  sugar_per_100g: number | null;
  sodium_per_100g: number | null;
  consumed_date: string;
  consumed_at: string;
  created_at: string;
  updated_at: string;
}

export interface Meal {
  id: string;
  user_id: string;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface DailyNutrition {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
}

export function useFoodEntries(date?: string) {
  const mockUser = { id: '123e4567-e89b-12d3-a456-426614174000' };
  const user = mockUser;

  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [meals, setMeals] = useState<Meal[]>([/* same mock meals as before */]);
  const [loading, setLoading] = useState(false);
  const targetDate = date || new Date().toISOString().split('T')[0];

  // fetch helpers (now return Promises)
  const fetchMeals = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index');

      if (error) {
        console.error('Error fetching meals:', error);
        return;
      }
      setMeals(data || []);
    } catch (err) {
      console.error('Error fetching meals:', err);
    }
  };

  const fetchFoodEntries = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('food_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('consumed_date', targetDate)
        .order('consumed_at');

      if (error) {
        console.error('Error fetching food entries:', error);
        setFoodEntries([]);
        return;
      }

      // ensure determinisitc ordering and fill missing fields
      const safeData = (data || []).map((d: any) => ({
        ...d,
        serving_size: d.serving_size ?? 0,
        serving_unit: d.serving_unit ?? 'g',
        meal_id: d.meal_id ?? null,
      }));
      setFoodEntries(safeData);
    } catch (err) {
      console.error('Error fetching food entries:', err);
      setFoodEntries([]);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) {
        setFoodEntries([]);
        setMeals([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      await fetchMeals();
      await fetchFoodEntries();
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [user, targetDate]);

  // add/update/delete now force a refetch of server data to keep single source consistent
  const addFoodEntry = async (entry: Omit<FoodEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'no-user' };

    try {
      // ensure consumed_date: if not provided, use targetDate
      const payload = { ...entry, user_id: user.id, consumed_date: entry.consumed_date || targetDate };
      const { data, error } = await supabase
        .from('food_entries')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('Error adding food entry:', error);
        return { error };
      }

      // refresh server state (preferred to local push to avoid inconsistencies)
      await fetchFoodEntries();
      return { data };
    } catch (err) {
      console.error('Error adding food entry:', err);
      return { error: err };
    }
  };

  const updateFoodEntry = async (id: string, updates: Partial<FoodEntry>) => {
    if (!user) return { error: 'no-user' };
    try {
      const { data, error } = await supabase
        .from('food_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating food entry:', error);
        return { error };
      }

      // refresh server state for consistency
      await fetchFoodEntries();
      return { data };
    } catch (err) {
      console.error('Error updating food entry:', err);
      return { error: err };
    }
  };

  const deleteFoodEntry = async (id: string) => {
    if (!user) return { error: 'no-user' };
    try {
      const { error } = await supabase
        .from('food_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting food entry:', error);
        return { error };
      }

      await fetchFoodEntries();
      return { success: true };
    } catch (err) {
      console.error('Error deleting food entry:', err);
      return { error: err };
    }
  };

  // meals CRUD keep as before but force refetches after write
  const addMeal = async (name: string) => {
    if (!user) return { error: 'no-user' };
    try {
      const newOrderIndex = meals.length;
      const { data, error } = await supabase
        .from('meals')
        .insert({ user_id: user.id, name, order_index: newOrderIndex })
        .select()
        .single();

      if (error) { console.error('Error adding meal:', error); return { error }; }
      await fetchMeals();
      return { data };
    } catch (err) { console.error(err); return { error: err }; }
  };

  const updateMeal = async (id: string, updates: Partial<Meal>) => {
    if (!user) return { error: 'no-user' };
    try {
      const { data, error } = await supabase
        .from('meals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) return { error };
      await fetchMeals();
      return { data };
    } catch (err) { console.error(err); return { error: err }; }
  };

  const deleteMeal = async (id: string) => {
    if (!user) return { error: 'no-user' };
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) return { error };
      await fetchMeals();
      return { success: true };
    } catch (err) { console.error(err); return { error: err }; }
  };

  // Calculate daily nutrition totals (keep as function that reads current state)
  const calculateDailyNutrition = (): DailyNutrition => {
    return foodEntries.reduce((totals, entry) => {
      const multiplier = (entry.serving_size || 0) / 100;
      return {
        totalCalories: totals.totalCalories + ((entry.calories_per_100g || 0) * multiplier),
        totalProtein: totals.totalProtein + ((entry.protein_per_100g || 0) * multiplier),
        totalCarbs: totals.totalCarbs + ((entry.carbs_per_100g || 0) * multiplier),
        totalFats: totals.totalFats + ((entry.fats_per_100g || 0) * multiplier),
        totalFiber: totals.totalFiber + ((entry.fiber_per_100g || 0) * multiplier),
        totalSugar: totals.totalSugar + ((entry.sugar_per_100g || 0) * multiplier),
        totalSodium: totals.totalSodium + ((entry.sodium_per_100g || 0) * multiplier),
      };
    }, {
      totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0, totalFiber: 0, totalSugar: 0, totalSodium: 0
    });
  };

  const getMealEntries = (mealId: string | null) => {
    return foodEntries.filter(entry => entry.meal_id === mealId);
  };

  const refetch = async () => {
    setLoading(true);
    await fetchMeals();
    await fetchFoodEntries();
    setLoading(false);
  };

  return {
    foodEntries,
    meals,
    loading,
    addFoodEntry,
    updateFoodEntry,
    deleteFoodEntry,
    addMeal,
    updateMeal,
    deleteMeal,
    calculateDailyNutrition,
    getMealEntries,
    refetch,
  };
}
