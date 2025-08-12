-- Create the bookings table with all required fields
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    nationality VARCHAR(100),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    room_type VARCHAR(100) NOT NULL,
    guests INTEGER DEFAULT 1,
    nights INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'PKR',
    special_requests TEXT,
    purpose_of_visit VARCHAR(100),
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending',
    booking_status VARCHAR(20) DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    number VARCHAR(10) UNIQUE NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'available',
    floor INTEGER NOT NULL,
    max_occupancy INTEGER NOT NULL,
    amenities JSONB DEFAULT '[]',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the inquiries table
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new',
    reply TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the room_pricing table
CREATE TABLE IF NOT EXISTS public.room_pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_type VARCHAR(100) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'PKR',
    season_multiplier DECIMAL(3,2) DEFAULT 1.0,
    weekend_multiplier DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON public.bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at);

CREATE INDEX IF NOT EXISTS idx_rooms_type ON public.rooms(type);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_pricing ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access for bookings
CREATE POLICY "Allow public to insert bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to read bookings" ON public.bookings
    FOR SELECT USING (true);

CREATE POLICY "Allow public to update bookings" ON public.bookings
    FOR UPDATE USING (true);

-- Create policies for rooms
CREATE POLICY "Allow public to read rooms" ON public.rooms
    FOR SELECT USING (true);

-- Create policies for inquiries
CREATE POLICY "Allow public to insert inquiries" ON public.inquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to read inquiries" ON public.inquiries
    FOR SELECT USING (true);

-- Create policies for room pricing
CREATE POLICY "Allow public to read room pricing" ON public.room_pricing
    FOR SELECT USING (true);

-- Insert some sample room data
INSERT INTO public.rooms (number, type, floor, max_occupancy, amenities, description) VALUES
('101', 'Budget Room', 1, 2, '["WiFi", "TV", "Private Bathroom"]', 'Comfortable budget room with mountain view'),
('102', 'Budget Room', 1, 2, '["WiFi", "TV", "Private Bathroom"]', 'Comfortable budget room with mountain view'),
('201', 'Standard Room', 2, 3, '["WiFi", "TV", "Private Bathroom", "Mini Fridge"]', 'Standard room with modern amenities'),
('202', 'Standard Room', 2, 3, '["WiFi", "TV", "Private Bathroom", "Mini Fridge"]', 'Standard room with modern amenities'),
('301', 'Deluxe Room', 3, 4, '["WiFi", "TV", "Private Bathroom", "Mini Fridge", "Balcony"]', 'Deluxe room with balcony and mountain view'),
('302', 'Deluxe Room', 3, 4, '["WiFi", "TV", "Private Bathroom", "Mini Fridge", "Balcony"]', 'Deluxe room with balcony and mountain view'),
('401', 'Family Suite', 4, 6, '["WiFi", "TV", "Private Bathroom", "Mini Fridge", "Balcony", "Kitchenette"]', 'Spacious family suite with kitchenette')
ON CONFLICT (number) DO NOTHING;

-- Insert room pricing data
INSERT INTO public.room_pricing (room_type, base_price, currency) VALUES
('Budget Room', 4000, 'PKR'),
('Standard Room', 6000, 'PKR'),
('Deluxe Room', 8000, 'PKR'),
('Family Suite', 12000, 'PKR')
ON CONFLICT DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_pricing_updated_at BEFORE UPDATE ON public.room_pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
