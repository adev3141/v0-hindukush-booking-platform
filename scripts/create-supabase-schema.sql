-- Enable RLS (Row Level Security)
ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.bookings;

-- Create bookings table
CREATE TABLE public.bookings (
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
    nights INTEGER DEFAULT 1,
    total_amount DECIMAL(10,2) DEFAULT 0,
    special_requests TEXT,
    emergency_name VARCHAR(255),
    emergency_phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    payment_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policy to allow public insert (for bookings)
CREATE POLICY "Allow public insert" ON public.bookings
    FOR INSERT WITH CHECK (true);

-- Create RLS policy to allow public select (for viewing bookings)
CREATE POLICY "Allow public select" ON public.bookings
    FOR SELECT USING (true);

-- Create index for better performance
CREATE INDEX idx_bookings_reference ON public.bookings(booking_reference);
CREATE INDEX idx_bookings_email ON public.bookings(email);
CREATE INDEX idx_bookings_dates ON public.bookings(check_in, check_out);

-- Insert some sample data for testing
INSERT INTO public.bookings (
    booking_reference,
    guest_name,
    email,
    phone,
    nationality,
    check_in,
    check_out,
    room_type,
    guests,
    nights,
    total_amount,
    status,
    payment_status
) VALUES (
    'HK123456',
    'John Doe',
    'john@example.com',
    '+1234567890',
    'American',
    '2024-02-01',
    '2024-02-03',
    'Deluxe Room',
    2,
    2,
    16000.00,
    'confirmed',
    'paid'
);
