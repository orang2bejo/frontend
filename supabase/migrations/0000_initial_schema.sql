-- JastipDigital Schema
-- Timezone
SET TIME ZONE 'Asia/Jakarta';

-- Custom Types
CREATE TYPE user_role AS ENUM ('customer', 'driver', 'mitra', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'in_progress', 'shipped', 'completed', 'cancelled', 'price_confirmation', 'price_negotiation');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded', 'disputed');
CREATE TYPE specialist_order_status AS ENUM ('pending', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled');

-- Tables
CREATE TABLE "profiles" (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  roles user_role[] DEFAULT ARRAY['customer']::user_role[]
);

CREATE TABLE "drivers" (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_details JSONB,
  current_location GEOGRAPHY(Point),
  is_active BOOLEAN DEFAULT false,
  rating NUMERIC(3, 2) DEFAULT 5.00,
  total_orders INT DEFAULT 0
);

CREATE TABLE "orders" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  driver_id UUID REFERENCES auth.users(id),
  item_description TEXT NOT NULL,
  store_location TEXT,
  delivery_address TEXT NOT NULL,
  max_budget NUMERIC NOT NULL,
  final_price NUMERIC,
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'unpaid',
  customer_phone TEXT,
  customer_notes TEXT,
  review_submitted BOOLEAN DEFAULT FALSE
);

CREATE TABLE "reviews" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    driver_id UUID NOT NULL REFERENCES auth.users(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "wallets" (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC DEFAULT 0,
  commission_debt NUMERIC DEFAULT 0
);

CREATE TABLE "withdrawal_requests" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES auth.users(id),
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE TABLE "hall_of_fame_awards" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES auth.users(id),
    award_name TEXT NOT NULL,
    achieved_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "specializations" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE "mitra_specialists" (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT,
    base_location JSONB,
    service_radius INT,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    total_jobs INT DEFAULT 0
);

CREATE TABLE "mitra_specializations" (
    mitra_id UUID NOT NULL REFERENCES mitra_specialists(id),
    specialization_id UUID NOT NULL REFERENCES specializations(id),
    PRIMARY KEY (mitra_id, specialization_id)
);

CREATE TABLE "specialist_orders" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    customer_id UUID NOT NULL REFERENCES auth.users(id),
    mitra_id UUID REFERENCES auth.users(id),
    service_type TEXT NOT NULL,
    problem_description TEXT NOT NULL,
    customer_location JSONB,
    urgency_level TEXT,
    status specialist_order_status DEFAULT 'pending',
    final_agreed_price NUMERIC
);

CREATE TABLE "quotes" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES specialist_orders(id),
    mitra_id UUID NOT NULL REFERENCES auth.users(id),
    mitra_name TEXT, -- denormalized
    quoted_price NUMERIC NOT NULL,
    estimated_duration TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "mitra_reviews" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES specialist_orders(id),
    customer_id UUID NOT NULL REFERENCES auth.users(id),
    mitra_id UUID NOT NULL REFERENCES auth.users(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile." ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Add other RLS policies for other tables as needed...
