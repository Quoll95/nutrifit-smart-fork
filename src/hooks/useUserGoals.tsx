import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFoodEntries } from './useFoodEntries';

interface UserGoals {
  id: string;
  user_id: string;
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fats: number;
  created_at: string;
  updated_at: string;
}

interface NutritionProgress {
  calories: { current: number; target: number; percentage: number };
  protein: { current: number; target: number; percentage: number };
  carbs: { current: number; target: number; percentage: number };
  fats: { current: number; target: number; percentage: number };
}

interface PeriodProgress {
  daily: NutritionProgress;
  weekly: NutritionProgress;
  monthly: NutritionProgress;
}

export function useUserGoals(selectedDate?: string) {
  // Mock user for testing
  const mockUser = { id: '123e4567-e89b-12d3-a456-426614174000' };
  const user = mockUser;
  
  const [goals, setGoals] = useState<UserGoals>({
    id: 'mock-goals',
    user_id: mockUser.id,
    daily_calories: 2000,
    daily_protein: 150,
    daily_carbs: 250,
    daily_fats: 67,
    created_at: '',
    updated_at: ''
  });
  const [loading, setLoading] = useState(false);

  const currentDate = selectedDate || new Date().toISOString().split('T')[0];
  const { calculateDailyNutrition } = useFoodEntries(currentDate);

  useEffect(() => {
    // Mock data - skip database calls for testing
    setLoading(false);
    /* 
    if (user) {
      fetchUserGoals();
    }
    */
  }, [user]);

  const fetchUserGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user goals:', error);
        return;
      }

      if (data) {
        setGoals(data);
      } else {
        // Create default goals if none exist
        await createDefaultGoals();
      }
    } catch (error) {
      console.error('Error fetching user goals:', error);
    }
  };

  const createDefaultGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_goals')
        .insert({
          user_id: user.id,
          daily_calories: 2000,
          daily_protein: 150,
          daily_carbs: 250,
          daily_fats: 67,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating default goals:', error);
        return;
      }

      setGoals(data);
    } catch (error) {
      console.error('Error creating default goals:', error);
    }
  };

  const updateGoals = async (updates: Partial<Omit<UserGoals, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_goals')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating goals:', error);
        return { error };
      }

      setGoals(data);
      return { data };
    } catch (error) {
      console.error('Error updating goals:', error);
      return { error };
    }
  };

  // Calculate nutrition progress for different periods
  const calculateProgress = (): PeriodProgress => {
    const dailyNutrition = calculateDailyNutrition();
    
    // For weekly and monthly, we'd need to fetch data for those periods
    // For now using mock multipliers as example
    const weeklyNutrition = {
      totalCalories: dailyNutrition.totalCalories * 5.2, // Average 5.2 days progress
      totalProtein: dailyNutrition.totalProtein * 5.2,
      totalCarbs: dailyNutrition.totalCarbs * 5.2,
      totalFats: dailyNutrition.totalFats * 5.2,
    };

    const monthlyNutrition = {
      totalCalories: dailyNutrition.totalCalories * 18.5, // Average 18.5 days progress
      totalProtein: dailyNutrition.totalProtein * 18.5,
      totalCarbs: dailyNutrition.totalCarbs * 18.5,
      totalFats: dailyNutrition.totalFats * 18.5,
    };

    const createNutritionProgress = (current: any, daily: boolean = false, multiplier: number = 1): NutritionProgress => ({
      calories: {
        current: Math.round(current.totalCalories),
        target: goals.daily_calories * multiplier,
        percentage: Math.min((current.totalCalories / (goals.daily_calories * multiplier)) * 100, 100)
      },
      protein: {
        current: Math.round(current.totalProtein * 10) / 10,
        target: goals.daily_protein * multiplier,
        percentage: Math.min((current.totalProtein / (goals.daily_protein * multiplier)) * 100, 100)
      },
      carbs: {
        current: Math.round(current.totalCarbs * 10) / 10,
        target: goals.daily_carbs * multiplier,
        percentage: Math.min((current.totalCarbs / (goals.daily_carbs * multiplier)) * 100, 100)
      },
      fats: {
        current: Math.round(current.totalFats * 10) / 10,
        target: goals.daily_fats * multiplier,
        percentage: Math.min((current.totalFats / (goals.daily_fats * multiplier)) * 100, 100)
      }
    });

    return {
      daily: createNutritionProgress(dailyNutrition, true, 1),
      weekly: createNutritionProgress(weeklyNutrition, false, 7),
      monthly: createNutritionProgress(monthlyNutrition, false, 30)
    };
  };

  return {
    goals,
    loading,
    updateGoals,
    progress: calculateProgress(),
    refetch: fetchUserGoals
  };
}