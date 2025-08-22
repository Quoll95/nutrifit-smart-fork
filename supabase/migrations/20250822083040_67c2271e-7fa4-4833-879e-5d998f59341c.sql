
-- Insert default meals for the mock user for testing
INSERT INTO meals (id, user_id, name, order_index, created_at, updated_at) 
VALUES 
  ('123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'Colazione', 0, NOW(), NOW()),
  ('123e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174000', 'Spuntino Mattina', 1, NOW(), NOW()),
  ('123e4567-e89b-12d3-a456-426614174003', '123e4567-e89b-12d3-a456-426614174000', 'Pranzo', 2, NOW(), NOW()),
  ('123e4567-e89b-12d3-a456-426614174004', '123e4567-e89b-12d3-a456-426614174000', 'Spuntino Pomeriggio', 3, NOW(), NOW()),
  ('123e4567-e89b-12d3-a456-426614174005', '123e4567-e89b-12d3-a456-426614174000', 'Cena', 4, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for testing with mock user
-- Allow all operations for the specific mock user ID
CREATE POLICY "Allow mock user operations on meals" ON meals
  FOR ALL USING (user_id = '123e4567-e89b-12d3-a456-426614174000');

CREATE POLICY "Allow mock user operations on food_entries" ON food_entries  
  FOR ALL USING (user_id = '123e4567-e89b-12d3-a456-426614174000');
