-- MySQL-compatible schema for Luxe Skincare Application
use nelysahdb;

-- Products table
CREATE TABLE products (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  image TEXT NULL,
  images LONGTEXT,
  category VARCHAR(100) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  featured TINYINT(1) DEFAULT 0,
  benefits TEXT,
  ingredients TEXT,
  how_to_use TEXT NOT NULL,
  stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id CHAR(36) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  shipping_address TEXT NOT NULL,
  order_total DECIMAL(10, 2) NOT NULL CHECK (order_total >= 0),
  payment_method VARCHAR(50) NOT NULL,
  order_status VARCHAR(50) DEFAULT 'pending',
  tracking_code VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
  id CHAR(36) PRIMARY KEY,
  order_id CHAR(36) NOT NULL,
  product_id CHAR(36),
  quantity INT NOT NULL CHECK (quantity > 0),
  price_per_item DECIMAL(10, 2) NOT NULL CHECK (price_per_item >= 0),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Testimonials table
CREATE TABLE testimonials (
    id CHAR(36) NOT NULL PRIMARY KEY,      -- UUID for uniqueness
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    quote TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    image VARCHAR(255),                    -- URL or path to image (optional)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Admin users table
CREATE TABLE admin_users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  is_admin TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  
);
-- Blog posts table
CREATE TABLE blog_posts (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  image TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  author_id CHAR(36), -- allow NULL for SET NULL to work
  published TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES admin_users(id) ON DELETE SET NULL
);


CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,         -- UUID (CHAR(36) for string UUID)
    email VARCHAR(255) NOT NULL UNIQUE,       -- User email, unique
    password VARCHAR(255) NOT NULL,           -- Hashed 
    full_name VARCHAR(255),
    display_name VARCHAR(255),
    phone VARCHAR(255),
    shipping_address VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    avatar_url TEXT,
    website TEXT,
    is_driver TINYINT(1) DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Optional: track when user was created
);
-- Indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);

