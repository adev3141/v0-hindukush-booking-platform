-- Create Supabase schema
CREATE SCHEMA IF NOT EXISTS supabase;

-- Set the search path to the Supabase schema
SET search_path TO supabase;

-- Add room_pricing table after the existing tables
CREATE TABLE IF NOT EXISTS room_pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_type TEXT NOT NULL UNIQUE,
    base_price DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'PKR',
    season_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    weekend_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default pricing data
INSERT INTO room_pricing (room_type, base_price, currency, season_multiplier, weekend_multiplier) VALUES
('Standard Room', 6000.00, 'PKR', 1.2, 1.3),
('Deluxe Room', 8000.00, 'PKR', 1.2, 1.3),
('Family Suite', 12000.00, 'PKR', 1.3, 1.4),
('Executive Suite', 15000.00, 'PKR', 1.3, 1.5)
ON CONFLICT (room_type) DO NOTHING;

-- Enable RLS on room_pricing
ALTER TABLE room_pricing ENABLE ROW LEVEL SECURITY;

-- Create policies for room_pricing
CREATE POLICY "Allow public read access to room_pricing" ON room_pricing
    FOR SELECT USING (true);

CREATE POLICY "Allow service role full access to room_pricing" ON room_pricing
    FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for room_pricing
CREATE INDEX IF NOT EXISTS idx_room_pricing_room_type ON room_pricing(room_type);
CREATE INDEX IF NOT EXISTS idx_room_pricing_created_at ON room_pricing(created_at);

-- Add trigger for updated_at on room_pricing
CREATE TRIGGER update_room_pricing_updated_at
    BEFORE UPDATE ON room_pricing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- /** rest of code here **/
