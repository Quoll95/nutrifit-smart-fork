import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  height: number | null;
  weight: number | null;
  age: number | null;
  gender: string | null;
  activity_level: string | null;
  goal: string | null;
  created_at: string;
  updated_at: string;
}

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

interface UserPreferences {
  id: string;
  user_id: string;
  theme: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchGoals();
      fetchPreferences();
    } else {
      setProfile(null);
      setGoals(null);
      setPreferences(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching goals:', error);
        return;
      }

      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        return;
      }

      setPreferences(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return { error };
      }

      setProfile(data);
      return { data };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error };
    }
  };

  const updateGoals = async (updates: Partial<UserGoals>) => {
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

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating preferences:', error);
        return { error };
      }

      setPreferences(data);
      return { data };
    } catch (error) {
      console.error('Error updating preferences:', error);
      return { error };
    }
  };

  const calculateOptimalCalories = async () => {
    if (!profile?.height || !profile?.weight || !profile?.age || !profile?.gender || !profile?.activity_level || !profile?.goal) {
      return null;
    }

    try {
      const { data, error } = await supabase.rpc('calculate_daily_calories', {
        p_weight: profile.weight,
        p_height: profile.height,
        p_age: profile.age,
        p_gender: profile.gender,
        p_activity_level: profile.activity_level,
        p_goal: profile.goal
      });

      if (error) {
        console.error('Error calculating calories:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error calculating calories:', error);
      return null;
    }
  };

  return {
    profile,
    goals,
    preferences,
    loading,
    updateProfile,
    updateGoals,
    updatePreferences,
    calculateOptimalCalories,
    refetch: () => {
      fetchProfile();
      fetchGoals();
      fetchPreferences();
    }
  };
}