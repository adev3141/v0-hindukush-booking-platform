-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'PKR',
    capacity INTEGER NOT NULL DEFAULT 2,
    amenities TEXT[],
    images TEXT[],
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table with all necessary fields
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    nationality VARCHAR(100),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    room_type VARCHAR(100) NOT NULL,
    guests INTEGER NOT NULL DEFAULT 1,
    nights INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'PKR',
    special_requests TEXT,
    purpose_of_visit VARCHAR(100),
    payment_method VARCHAR(50),
    booking_status VARCHAR(20) DEFAULT 'confirmed',
    payment_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    reply TEXT,
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample rooms data
INSERT INTO rooms (name, type, description, price, capacity, amenities, images) VALUES
('Deluxe Mountain View', 'Deluxe', 'Spacious room with stunning mountain views and modern amenities', 8500.00, 2, 
 ARRAY['WiFi', 'Air Conditioning', 'Mountain View', 'Private Bathroom', 'Mini Fridge'], 
 ARRAY['/placeholder.svg?height=300&width=400&text=Deluxe+Room']),
 
('Standard Twin Room', 'Standard', 'Comfortable twin bed room perfect for friends or colleagues', 6500.00, 2, 
 ARRAY['WiFi', 'Air Conditioning', 'Twin Beds', 'Private Bathroom'], 
 ARRAY['/placeholder.svg?height=300&width=400&text=Standard+Room']),
 
('Family Suite', 'Suite', 'Large family suite with separate living area and multiple beds', 12000.00, 4, 
 ARRAY['WiFi', 'Air Conditioning', 'Living Area', 'Kitchenette', 'Multiple Beds'], 
 ARRAY['/placeholder.svg?height=300&width=400&text=Family+Suite']),
 
('Economy Single', 'Economy', 'Budget-friendly single room with essential amenities', 4500.00, 1, 
 ARRAY['WiFi', 'Fan', 'Private Bathroom', 'Single Bed'], 
 ARRAY['/placeholder.svg?height=300&width=400&text=Economy+Room']);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type);
CREATE INDEX IF NOT EXISTS idx_rooms_available ON rooms(is_available);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we're using anon key)
-- Rooms policies
CREATE POLICY "Allow public read access to rooms" ON rooms
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to rooms" ON rooms
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to rooms" ON rooms
    FOR UPDATE USING (true);

-- Bookings policies
CREATE POLICY "Allow public read access to bookings" ON bookings
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to bookings" ON bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to bookings" ON bookings
    FOR UPDATE USING (true);

-- Inquiries policies
CREATE POLICY "Allow public read access to inquiries" ON inquiries
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to inquiries" ON inquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to inquiries" ON inquiries
    FOR UPDATE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
