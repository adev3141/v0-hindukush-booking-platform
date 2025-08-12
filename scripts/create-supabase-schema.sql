-- Create bookings table with updated schema
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference VARCHAR(20) NOT NULL UNIQUE,
  guest_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  nationality VARCHAR(100),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  room_id UUID REFERENCES rooms(id),
  room_type VARCHAR(100) NOT NULL,
  room_number VARCHAR(20),
  guests INTEGER NOT NULL DEFAULT 1,
  nights INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'PKR',
  special_requests TEXT,
  purpose_of_visit VARCHAR(100),
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  booking_status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (for public booking form)
CREATE POLICY insert_bookings_policy ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow authenticated users to view all bookings
CREATE POLICY select_bookings_policy ON bookings
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to update bookings
CREATE POLICY update_bookings_policy ON bookings
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create rooms table if it doesn't exist
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number VARCHAR(20) NOT NULL UNIQUE,
  type VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  floor INTEGER NOT NULL,
  max_occupancy INTEGER NOT NULL DEFAULT 2,
  amenities TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inquiries table if it doesn't exist
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  reply TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create room_pricing table if it doesn't exist
CREATE TABLE IF NOT EXISTS room_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_type VARCHAR(100) NOT NULL UNIQUE,
  base_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'PKR',
  season_multiplier DECIMAL(3,2) DEFAULT 1.0,
  weekend_multiplier DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample room pricing data if not exists
INSERT INTO room_pricing (room_type, base_price, currency)
VALUES 
  ('Budget Room', 4000, 'PKR'),
  ('Standard Room', 6000, 'PKR'),
  ('Deluxe Room', 8000, 'PKR'),
  ('Family Suite', 12000, 'PKR')
ON CONFLICT (room_type) DO NOTHING;

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the updated_at timestamp
CREATE TRIGGER update_bookings_timestamp
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_rooms_timestamp
BEFORE UPDATE ON rooms
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_inquiries_timestamp
BEFORE UPDATE ON inquiries
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_room_pricing_timestamp
BEFORE UPDATE ON room_pricing
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
