-- Fix security warnings by adding SET search_path to functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1))
  );
  
  -- Create default goals
  INSERT INTO public.user_goals (user_id)
  VALUES (NEW.id);
  
  -- Create default meals
  INSERT INTO public.meals (user_id, name, order_index) VALUES
    (NEW.id, 'Colazione', 0),
    (NEW.id, 'Spuntino Mattina', 1),
    (NEW.id, 'Pranzo', 2),
    (NEW.id, 'Spuntino Pomeriggio', 3),
    (NEW.id, 'Cena', 4);
    
  -- Create default preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_daily_calories(
  p_weight DECIMAL,
  p_height DECIMAL,
  p_age INTEGER,
  p_gender TEXT,
  p_activity_level TEXT,
  p_goal TEXT
) RETURNS INTEGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  bmr DECIMAL;
  activity_multiplier DECIMAL;
  tdee DECIMAL;
  goal_adjustment DECIMAL;
BEGIN
  -- Calculate BMR using Mifflin-St Jeor Equation
  IF p_gender = 'male' THEN
    bmr := 10 * p_weight + 6.25 * p_height - 5 * p_age + 5;
  ELSE
    bmr := 10 * p_weight + 6.25 * p_height - 5 * p_age - 161;
  END IF;
  
  -- Apply activity level multiplier
  CASE p_activity_level
    WHEN 'sedentary' THEN activity_multiplier := 1.2;
    WHEN 'lightly_active' THEN activity_multiplier := 1.375;
    WHEN 'moderately_active' THEN activity_multiplier := 1.55;
    WHEN 'very_active' THEN activity_multiplier := 1.725;
    WHEN 'extremely_active' THEN activity_multiplier := 1.9;
    ELSE activity_multiplier := 1.55;
  END CASE;
  
  tdee := bmr * activity_multiplier;
  
  -- Apply goal adjustment
  CASE p_goal
    WHEN 'lose_weight' THEN goal_adjustment := -500; -- 500 calorie deficit
    WHEN 'gain_weight' THEN goal_adjustment := 500;  -- 500 calorie surplus
    ELSE goal_adjustment := 0; -- maintain weight
  END CASE;
  
  RETURN ROUND(tdee + goal_adjustment);
END;
$$;