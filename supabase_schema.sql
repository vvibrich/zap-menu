/*
  -- TABLE: restaurants
  CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    whatsapp_number TEXT NOT NULL,
    address TEXT,
    colors JSONB DEFAULT '{"primary": "#ef4444", "secondary": "#ffffff"}'::jsonb,
    working_hours JSONB DEFAULT '{"open": "08:00", "close": "22:00"}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- TABLE: categories
  CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- TABLE: products
  CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- TABLE: product_options_groups
  CREATE TABLE product_options_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    min_options INTEGER DEFAULT 0,
    max_options INTEGER DEFAULT 1,
    required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- TABLE: product_options
  CREATE TABLE product_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES product_options_groups(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- TABLE: orders
  CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
    customer_name TEXT NOT NULL,
    items JSONB NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- RLS (Row Level Security) - Basic examples
  ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Public restaurants are viewable by everyone" ON restaurants FOR SELECT USING (true);
  CREATE POLICY "Owners can manage their own restaurants" ON restaurants FOR ALL USING (auth.uid() = user_id);

  ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Public categories are viewable by everyone" ON categories FOR SELECT USING (true);
  CREATE POLICY "Owners can manage their categories" ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM restaurants WHERE id = categories.restaurant_id AND user_id = auth.uid())
  );

  -- (Repeat similar policies for products, options, etc.)
*/
