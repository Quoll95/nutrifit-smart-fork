import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

interface Meal {
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
  const { user } = useAuth();
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const targetDate = date || new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      fetchMeals();
      fetchFoodEntries();
    } else {
      setFoodEntries([]);
      setMeals([]);
      setLoading(false);
    }
  }, [user, targetDate]);

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
    } catch (error) {
      console.error('Error fetching meals:', error);
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
        return;
      }

      setFoodEntries(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching food entries:', error);
      setLoading(false);
    }
  };

  const addFoodEntry = async (entry: Omit<FoodEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('food_entries')
        .insert({
          ...entry,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding food entry:', error);
        return { error };
      }

      setFoodEntries(prev => [...prev, data]);
      return { data };
    } catch (error) {
      console.error('Error adding food entry:', error);
      return { error };
    }
  };

  const updateFoodEntry = async (id: string, updates: Partial<FoodEntry>) => {
    if (!user) return;

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

      setFoodEntries(prev => prev.map(entry => entry.id === id ? data : entry));
      return { data };
    } catch (error) {
      console.error('Error updating food entry:', error);
      return { error };
    }
  };

  const deleteFoodEntry = async (id: string) => {
    if (!user) return;

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

      setFoodEntries(prev => prev.filter(entry => entry.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting food entry:', error);
      return { error };
    }
  };

  const addMeal = async (name: string) => {
    if (!user) return;

    const newOrderIndex = meals.length;

    try {
      const { data, error } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          name,
          order_index: newOrderIndex,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding meal:', error);
        return { error };
      }

      setMeals(prev => [...prev, data]);
      return { data };
    } catch (error) {
      console.error('Error adding meal:', error);
      return { error };
    }
  };

  const updateMeal = async (id: string, updates: Partial<Meal>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('meals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating meal:', error);
        return { error };
      }

      setMeals(prev => prev.map(meal => meal.id === id ? data : meal));
      return { data };
    } catch (error) {
      console.error('Error updating meal:', error);
      return { error };
    }
  };

  const deleteMeal = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting meal:', error);
        return { error };
      }

      setMeals(prev => prev.filter(meal => meal.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting meal:', error);
      return { error };
    }
  };

  // Calculate daily nutrition totals
  const calculateDailyNutrition = (): DailyNutrition => {
    return foodEntries.reduce(
      (totals, entry) => {
        const multiplier = entry.serving_size / 100;
        
        return {
          totalCalories: totals.totalCalories + (entry.calories_per_100g * multiplier),
          totalProtein: totals.totalProtein + (entry.protein_per_100g * multiplier),
          totalCarbs: totals.totalCarbs + (entry.carbs_per_100g * multiplier),
          totalFats: totals.totalFats + (entry.fats_per_100g * multiplier),
          totalFiber: totals.totalFiber + ((entry.fiber_per_100g || 0) * multiplier),
          totalSugar: totals.totalSugar + ((entry.sugar_per_100g || 0) * multiplier),
          totalSodium: totals.totalSodium + ((entry.sodium_per_100g || 0) * multiplier),
        };
      },
      {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
        totalFiber: 0,
        totalSugar: 0,
        totalSodium: 0,
      }
    );
  };

  const getMealEntries = (mealId: string | null) => {
    return foodEntries.filter(entry => entry.meal_id === mealId);
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
    refetch: () => {
      fetchMeals();
      fetchFoodEntries();
    }
  };
}