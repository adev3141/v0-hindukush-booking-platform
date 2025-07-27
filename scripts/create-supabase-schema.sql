-- Create tables for hotel booking system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number VARCHAR(20) NOT NULL,
  type VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  floor INTEGER NOT NULL DEFAULT 1,
  amenities TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning')),
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(5) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference VARCHAR(20) UNIQUE NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  room_id UUID REFERENCES rooms(id),
  room_type VARCHAR(50) NOT NULL,
  room_number VARCHAR(20) NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(5) DEFAULT 'USD',
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  booking_status VARCHAR(20) DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'checked-in', 'checked-out', 'cancelled')),
  special_requests TEXT,
  purpose_of_visit VARCHAR(100),
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'replied')),
  reply TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room pricing table
CREATE TABLE IF NOT EXISTS room_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_type VARCHAR(50) UNIQUE NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(5) DEFAULT 'USD',
  peak_season_multiplier DECIMAL(5,2) DEFAULT 1.25,
  group_discount DECIMAL(5,2) DEFAULT 0.10,
  extended_stay_discount DECIMAL(5,2) DEFAULT 0.15,
  corporate_discount DECIMAL(5,2) DEFAULT 0.20,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial room pricing
INSERT INTO room_pricing (room_type, base_price, currency, peak_season_multiplier, group_discount, extended_stay_discount, corporate_discount) VALUES
('dormitory_male', 2000, 'Rs', 1.25, 0.10, 0.15, 0.20),
('dormitory_female', 2000, 'Rs', 1.25, 0.10, 0.15, 0.20),
('budget_single', 6000, 'Rs', 1.25, 0.10, 0.15, 0.20),
('budget_double', 10000, 'Rs', 1.25, 0.10, 0.15, 0.20),
('standard', 80, 'USD', 1.25, 0.10, 0.15, 0.20),
('deluxe', 120, 'USD', 1.25, 0.10, 0.15, 0.20),
('family', 180, 'USD', 1.25, 0.10, 0.15, 0.20),
('executive', 220, 'USD', 1.25, 0.10, 0.15, 0.20);

-- Insert sample rooms
INSERT INTO rooms (number, type, capacity, floor, amenities, status, description, price, currency) VALUES
-- Male Dormitory Beds
('Bed 1', 'dormitory_male', 1, 1, '{"Shared accommodation","Clean washrooms","WiFi","Lockers","24/7 Power","Breakfast Included"}', 'available', 'Male dormitory bed with shared facilities', 2000, 'Rs'),
('Bed 2', 'dormitory_male', 1, 1, '{"Shared accommodation","Clean washrooms","WiFi","Lockers","24/7 Power","Breakfast Included"}', 'available', 'Male dormitory bed with shared facilities', 2000, 'Rs'),
('Bed 3', 'dormitory_male', 1, 1, '{"Shared accommodation","Clean washrooms","WiFi","Lockers","24/7 Power","Breakfast Included"}', 'occupied', 'Male dormitory bed with shared facilities', 2000, 'Rs'),
('Bed 4', 'dormitory_male', 1, 1, '{"Shared accommodation","Clean washrooms","WiFi","Lockers","24/7 Power","Breakfast Included"}', 'available', 'Male dormitory bed with shared facilities', 2000, 'Rs'),

-- Female Dormitory Beds
('Bed 1', 'dormitory_female', 1, 1, '{"Female-only accommodation","Clean washrooms","WiFi","Secure lockers","24/7 Power","Breakfast Included"}', 'available', 'Female dormitory bed with shared facilities', 2000, 'Rs'),
('Bed 2', 'dormitory_female', 1, 1, '{"Female-only accommodation","Clean washrooms","WiFi","Secure lockers","24/7 Power","Breakfast Included"}', 'available', 'Female dormitory bed with shared facilities', 2000, 'Rs'),
('Bed 3', 'dormitory_female', 1, 1, '{"Female-only accommodation","Clean washrooms","WiFi","Secure lockers","24/7 Power","Breakfast Included"}', 'occupied', 'Female dormitory bed with shared facilities', 2000, 'Rs'),

-- Budget Single Rooms
('101', 'budget_single', 1, 1, '{"Private room","Attached bathroom","WiFi","Mountain view","24/7 Power","Breakfast Included"}', 'occupied', 'Budget single room with attached bathroom', 6000, 'Rs'),
('102', 'budget_single', 1, 1, '{"Private room","Attached bathroom","WiFi","Mountain view","24/7 Power","Breakfast Included"}', 'available', 'Budget single room with attached bathroom', 6000, 'Rs'),
('103', 'budget_single', 1, 1, '{"Private room","Attached bathroom","WiFi","Mountain view","24/7 Power","Breakfast Included"}', 'available', 'Budget single room with attached bathroom', 6000, 'Rs'),

-- Budget Double Rooms
('201', 'budget_double', 2, 2, '{"Private room for 2","Attached bathroom","WiFi","Garden view","24/7 Power","Breakfast Included"}', 'available', 'Budget double room with attached bathroom', 10000, 'Rs'),
('202', 'budget_double', 2, 2, '{"Private room for 2","Attached bathroom","WiFi","Garden view","24/7 Power","Breakfast Included"}', 'available', 'Budget double room with attached bathroom', 10000, 'Rs'),
('203', 'budget_double', 2, 2, '{"Private room for 2","Attached bathroom","WiFi","Garden view","24/7 Power","Breakfast Included"}', 'maintenance', 'Budget double room with attached bathroom', 10000, 'Rs'),

-- Standard Rooms
('301', 'standard', 2, 3, '{"Garden View","Inverter AC (Heating/Cooling)","24/7 Power","Free WiFi","Breakfast Included","Private Bathroom"}', 'available', 'Comfortable standard room with garden view', 80, 'USD'),
('302', 'standard', 2, 3, '{"Garden View","Inverter AC (Heating/Cooling)","24/7 Power","Free WiFi","Breakfast Included","Private Bathroom"}', 'available', 'Comfortable standard room with garden view', 80, 'USD'),
('303', 'standard', 2, 3, '{"Garden View","Inverter AC (Heating/Cooling)","24/7 Power","Free WiFi","Breakfast Included","Private Bathroom"}', 'occupied', 'Comfortable standard room with garden view', 80, 'USD'),

-- Deluxe Rooms
('401', 'deluxe', 3, 4, '{"Garden View","Inverter AC (Heating/Cooling)","24/7 Power","Free WiFi","Breakfast Included","Work Desk","Mini Bar","Private Bathroom"}', 'available', 'Spacious deluxe room with premium furnishings', 120, 'USD'),
('402', 'deluxe', 3, 4, '{"Garden View","Inverter AC (Heating/Cooling)","24/7 Power","Free WiFi","Breakfast Included","Work Desk","Mini Bar","Private Bathroom"}', 'available', 'Spacious deluxe room with premium furnishings', 120, 'USD'),

-- Family Suites
('501', 'family', 5, 5, '{"Garden Access","Inverter AC (Heating/Cooling)","24/7 Power","Free WiFi","Breakfast Included","Living Area","2 Bathrooms"}', 'available', 'Perfect for families with separate living area', 180, 'USD'),
('502', 'family', 5, 5, '{"Garden Access","Inverter AC (Heating/Cooling)","24/7 Power","Free WiFi","Breakfast Included","Living Area","2 Bathrooms"}', 'cleaning', 'Perfect for families with separate living area', 180, 'USD'),

-- Executive Suites
('601', 'executive', 2, 6, '{"Park View","Inverter AC (Heating/Cooling)","24/7 Power","High-Speed WiFi","Breakfast Included","Conference Room Access","Mini Bar","Work Desk","Premium Bedding"}', 'available', 'Premium executive suite for corporate clients', 220, 'USD'),
('602', 'executive', 2, 6, '{"Park View","Inverter AC (Heating/Cooling)","24/7 Power","High-Speed WiFi","Breakfast Included","Conference Room Access","Mini Bar","Work Desk","Premium Bedding"}', 'available', 'Premium executive suite for corporate clients', 220, 'USD');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
    ref TEXT;
    exists_check INTEGER;
BEGIN
    LOOP
        ref := 'HKH-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
        SELECT COUNT(*) INTO exists_check FROM bookings WHERE booking_reference = ref;
        EXIT WHEN exists_check = 0;
    END LOOP;
    RETURN ref;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate booking reference
CREATE OR REPLACE FUNCTION set_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_reference IS NULL OR NEW.booking_reference = '' THEN
    NEW.booking_reference := generate_booking_reference();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_booking_reference
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_booking_reference();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_pricing_updated_at
  BEFORE UPDATE ON room_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample bookings for testing
INSERT INTO bookings (guest_name, email, phone, check_in, check_out, room_type, room_number, guests, total_amount, currency, payment_status, booking_status, special_requests) VALUES
('Ahmed Khan', 'ahmed.khan@example.com', '+92 300 1234567', '2024-02-15', '2024-02-18', 'deluxe', '401', 2, 360, 'USD', 'paid', 'confirmed', 'Late check-in requested'),
('Sarah Johnson', 'sarah.j@example.com', '+92 321 9876543', '2024-02-20', '2024-02-25', 'family', '501', 4, 900, 'USD', 'pending', 'confirmed', 'Ground floor room preferred'),
('Michael Brown', 'michael.b@example.com', '+92 333 4567890', '2024-02-10', '2024-02-12', 'budget_single', '101', 1, 12000, 'Rs', 'paid', 'checked-in', ''),
('Emma Wilson', 'emma.w@example.com', '+92 345 6789012', '2024-02-05', '2024-02-10', 'executive', '601', 2, 1100, 'USD', 'paid', 'checked-out', 'Airport pickup arranged'),
('Ali Hassan', 'ali.h@example.com', '+92 312 3456789', '2024-02-25', '2024-02-28', 'dormitory_male', 'Bed 3', 1, 2000, 'Rs', 'pending', 'confirmed', 'Vegetarian meals only');

-- Insert sample inquiries for testing
INSERT INTO inquiries (name, email, phone, message, status, reply) VALUES
('Fatima Ahmed', 'fatima.a@example.com', '+92 321 1234567', 'I am interested in booking a female dormitory bed for 3 nights in March. Do you have availability?', 'new', ''),
('John Smith', 'john.s@example.com', '+92 300 9876543', 'Do you offer airport pickup services? We will be arriving at Chitral Airport on March 20.', 'replied', 'Yes, we offer airport pickup services for Rs 1,500. Please confirm your flight details.'),
('Ayesha Khan', 'ayesha.k@example.com', '+92 333 5678901', 'We are a group of 10 backpackers. Do you offer special rates for groups booking dormitory beds?', 'new', ''),
('Robert Chen', 'robert.c@example.com', '+92 345 2345678', 'Is it possible to arrange a guided tour to Kalash Valley from your hotel?', 'replied', 'Yes, we can arrange guided tours to Kalash Valley. The cost is Rs 5,000 per person for a full day tour.');

-- Enable Row Level Security (RLS)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_pricing ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for now (you can restrict these later)
CREATE POLICY "Allow all operations on rooms" ON rooms FOR ALL USING (true);
CREATE POLICY "Allow all operations on bookings" ON bookings FOR ALL USING (true);
CREATE POLICY "Allow all operations on inquiries" ON inquiries FOR ALL USING (true);
CREATE POLICY "Allow all operations on room_pricing" ON room_pricing FOR ALL USING (true);
