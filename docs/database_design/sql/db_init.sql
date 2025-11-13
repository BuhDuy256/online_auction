-- ============================================
-- Online Auction System - Database Initialization
-- DBMS: PostgreSQL 13+ (Supabase Compatible)
-- Generated from: relational_data_model_detail.md
-- Note: Run this script in Supabase SQL Editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For UUID and password hashing
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For similarity search (optional)

-- ============================================
-- 1. ENUM TYPES
-- ============================================

CREATE TYPE user_status_enum AS ENUM (
    'pending_verification',
    'active',
    'pending_upgrade',
    'suspended'
);

CREATE TYPE product_status_enum AS ENUM (
    'active',
    'sold',
    'expired',
    'removed'
);

CREATE TYPE order_status_enum AS ENUM (
    'pending',
    'payment_confirmed',
    'shipped',
    'completed',
    'cancelled'
);

CREATE TYPE otp_purpose_enum AS ENUM (
    'signup',
    'reset_password',
    'other'
);

CREATE TYPE upgrade_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected',
    'expired',
    'cancelled'
);

CREATE TYPE notification_channel_enum AS ENUM (
    'email',
    'in_app'
);

-- ============================================
-- 2. CORE USER TABLES
-- ============================================

-- Table: users (Without username field)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- bcrypt/scrypt hash
    address VARCHAR(500),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    positive_reviews INT NOT NULL DEFAULT 0,
    negative_reviews INT NOT NULL DEFAULT 0,
    status user_status_enum NOT NULL DEFAULT 'pending_verification',
    password_updated_at TIMESTAMP,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at for users
CREATE TRIGGER trigger_update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. OTP VERIFICATION (For Chat App & Auction)
-- ============================================

-- Table: otp_verifications (Chat app structure)
CREATE TABLE otp_verifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    otp VARCHAR(6) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for OTP queries
CREATE INDEX idx_otp_user_id ON otp_verifications(user_id);
CREATE INDEX idx_otp_created_at ON otp_verifications(created_at);
CREATE INDEX idx_otp_is_used ON otp_verifications(is_used);

-- Table: user_otps (Auction system - more detailed)
CREATE TABLE user_otps (
    otp_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    purpose otp_purpose_enum NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    consumed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Unique constraint: only one active OTP per purpose per user
CREATE UNIQUE INDEX idx_user_otps_active 
ON user_otps(user_id, purpose) 
WHERE consumed_at IS NULL;

-- ============================================
-- 4. RBAC TABLES (Roles & Permissions)
-- ============================================

-- Table: roles
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Table: permissions
CREATE TABLE permissions (
    permission_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Table: users_roles (many-to-many)
CREATE TABLE users_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- Table: roles_permissions (many-to-many)
CREATE TABLE roles_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);

-- ============================================
-- 5. REFRESH TOKENS (Session Management)
-- ============================================

-- Table: refresh_tokens
CREATE TABLE refresh_tokens (
    token_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    device_info TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- ============================================
-- 6. UPGRADE REQUESTS
-- ============================================

-- Table: upgrade_requests
CREATE TABLE upgrade_requests (
    request_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    status upgrade_status_enum NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 7. CHAT SYSTEM (From Chat App)
-- ============================================

-- Table: conversations
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    is_group BOOLEAN DEFAULT FALSE,
    creator_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: conversation_participants
CREATE TABLE conversation_participants (
    user_id INT NOT NULL,
    conversation_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, conversation_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Table: messages
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for chat queries
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- ============================================
-- 8. PRODUCT CATEGORIES
-- ============================================

-- Table: categories (2-level hierarchy)
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    parent_id INT,
    FOREIGN KEY (parent_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    UNIQUE(parent_id, slug),
    CHECK (parent_id IS NULL OR parent_id != category_id)
);

-- Function: Check 2-level hierarchy constraint
CREATE OR REPLACE FUNCTION check_category_two_levels()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM categories 
            WHERE category_id = NEW.parent_id 
            AND parent_id IS NOT NULL
        ) THEN
            RAISE EXCEPTION 'Cannot create category: parent must be a root category (grandchildren not allowed)';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Enforce 2-level hierarchy
CREATE TRIGGER trigger_check_category_two_levels
BEFORE INSERT OR UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION check_category_two_levels();

-- Function: Auto-generate slug from name
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
        NEW.slug := trim(both '-' from NEW.slug);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-generate slug
CREATE TRIGGER trigger_auto_generate_slug
BEFORE INSERT OR UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION auto_generate_slug();

-- ============================================
-- 9. PRODUCTS & AUCTIONS
-- ============================================

-- Table: products
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    category_id INT NOT NULL,
    seller_id INT NOT NULL,
    highest_bidder_id INT,
    name VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    current_price NUMERIC(15, 2) NOT NULL,
    buy_now_price NUMERIC(15, 2),
    start_price NUMERIC(15, 2) NOT NULL,
    step_price NUMERIC(15, 2) NOT NULL,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NOT NULL,
    bid_count INT NOT NULL DEFAULT 0,
    auto_extend BOOLEAN NOT NULL DEFAULT FALSE,
    status product_status_enum NOT NULL DEFAULT 'active',
    fts TSVECTOR,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (highest_bidder_id) REFERENCES users(id) ON DELETE SET NULL,
    CHECK (end_time > start_time),
    CHECK (step_price > 0),
    CHECK (start_price > 0),
    CHECK (current_price >= start_price),
    CHECK (buy_now_price IS NULL OR buy_now_price >= start_price)
);

-- Indexes for products
CREATE INDEX idx_products_status_endtime ON products(status, end_time);
CREATE INDEX idx_products_category_status ON products(category_id, status);
CREATE INDEX idx_products_fts ON products USING GIN(fts);

-- Table: product_descriptions
CREATE TABLE product_descriptions (
    description_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    author_id INT NOT NULL,
    content TEXT NOT NULL,
    lang VARCHAR(10) NOT NULL DEFAULT 'vi',
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(product_id, version)
);

-- Table: product_images
CREATE TABLE product_images (
    image_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Function: Update FTS column
CREATE OR REPLACE FUNCTION update_product_fts()
RETURNS TRIGGER AS $$
DECLARE
    category_name TEXT;
    latest_description TEXT;
BEGIN
    SELECT c.name INTO category_name
    FROM categories c
    WHERE c.category_id = NEW.category_id;
    
    SELECT pd.content INTO latest_description
    FROM product_descriptions pd
    WHERE pd.product_id = NEW.product_id
    ORDER BY pd.version DESC
    LIMIT 1;
    
    NEW.fts := 
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(latest_description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(category_name, '')), 'C');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update FTS
CREATE TRIGGER trigger_update_product_fts
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_product_fts();

-- ============================================
-- 10. BIDDING SYSTEM
-- ============================================

-- Table: bids
CREATE TABLE bids (
    bid_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    bidder_id INT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    is_auto BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (bidder_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (amount > 0)
);

CREATE INDEX idx_bids_product_time ON bids(product_id, created_at DESC);
CREATE INDEX idx_bids_bidder ON bids(bidder_id);

-- Table: auto_bids
CREATE TABLE auto_bids (
    auto_bid_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    bidder_id INT NOT NULL,
    max_amount NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (bidder_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(product_id, bidder_id),
    CHECK (max_amount > 0)
);

CREATE INDEX idx_autobids_product_time ON auto_bids(product_id, created_at ASC);

-- Function: Update product on bid
CREATE OR REPLACE FUNCTION update_product_on_bid_insert()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET 
        current_price = NEW.amount,
        highest_bidder_id = NEW.bidder_id,
        bid_count = bid_count + 1
    WHERE product_id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update product on bid
CREATE TRIGGER trigger_update_product_on_bid
AFTER INSERT ON bids
FOR EACH ROW
EXECUTE FUNCTION update_product_on_bid_insert();

-- Function: Auto-extend auction
CREATE OR REPLACE FUNCTION auto_extend_on_late_bid()
RETURNS TRIGGER AS $$
DECLARE
    threshold_minutes INT;
    extend_minutes INT;
    time_remaining INTERVAL;
BEGIN
    SELECT setting_value::INT INTO threshold_minutes
    FROM system_settings
    WHERE setting_key = 'auto_extend_threshold_minutes';
    
    SELECT setting_value::INT INTO extend_minutes
    FROM system_settings
    WHERE setting_key = 'auto_extend_duration_minutes';
    
    IF EXISTS (
        SELECT 1 FROM products
        WHERE product_id = NEW.product_id
        AND auto_extend = TRUE
    ) THEN
        SELECT (end_time - CURRENT_TIMESTAMP) INTO time_remaining
        FROM products
        WHERE product_id = NEW.product_id;
        
        IF time_remaining <= (threshold_minutes || ' minutes')::INTERVAL THEN
            UPDATE products
            SET end_time = end_time + (extend_minutes || ' minutes')::INTERVAL
            WHERE product_id = NEW.product_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-extend
CREATE TRIGGER trigger_auto_extend_on_late_bid
AFTER INSERT ON bids
FOR EACH ROW
EXECUTE FUNCTION auto_extend_on_late_bid();

-- Table: product_rejections
CREATE TABLE product_rejections (
    rejection_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    bidder_id INT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (bidder_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(product_id, bidder_id)
);

-- ============================================
-- 11. WATCHLIST & COMMENTS
-- ============================================

-- Table: watchlist
CREATE TABLE watchlist (
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Table: product_comments
CREATE TABLE product_comments (
    comment_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    parent_id INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES product_comments(comment_id) ON DELETE CASCADE
);

CREATE INDEX idx_comments_product ON product_comments(product_id, created_at);
CREATE INDEX idx_comments_parent ON product_comments(parent_id);

-- ============================================
-- 12. ORDERS & INVOICES
-- ============================================

-- Table: orders
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL UNIQUE,
    winner_id INT NOT NULL,
    seller_id INT NOT NULL,
    final_price NUMERIC(15, 2) NOT NULL,
    status order_status_enum NOT NULL DEFAULT 'pending',
    cancellation_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT,
    FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Table: invoices
CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    shipping_address TEXT,
    payment_proof_url VARCHAR(500),
    shipping_tracking_code VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Table: order_chat
CREATE TABLE order_chat (
    message_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_chat_order ON order_chat(order_id, created_at ASC);

-- ============================================
-- 13. REVIEWS & RATINGS
-- ============================================

-- Table: reviews
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewered_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating IN (1, -1)),
    content TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewered_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(order_id, reviewer_id, reviewered_id)
);

-- Function: Update user rating on review insert
CREATE OR REPLACE FUNCTION update_user_rating_on_review_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.rating = 1 THEN
        UPDATE users
        SET positive_reviews = positive_reviews + 1
        WHERE id = NEW.reviewered_id;
    ELSIF NEW.rating = -1 THEN
        UPDATE users
        SET negative_reviews = negative_reviews + 1
        WHERE id = NEW.reviewered_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update rating on insert
CREATE TRIGGER trigger_update_rating_insert
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_user_rating_on_review_insert();

-- Function: Update user rating on review update
CREATE OR REPLACE FUNCTION update_user_rating_on_review_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.rating != NEW.rating THEN
        IF OLD.rating = 1 THEN
            UPDATE users
            SET positive_reviews = positive_reviews - 1
            WHERE id = NEW.reviewered_id;
        ELSIF OLD.rating = -1 THEN
            UPDATE users
            SET negative_reviews = negative_reviews - 1
            WHERE id = NEW.reviewered_id;
        END IF;
        
        IF NEW.rating = 1 THEN
            UPDATE users
            SET positive_reviews = positive_reviews + 1
            WHERE id = NEW.reviewered_id;
        ELSIF NEW.rating = -1 THEN
            UPDATE users
            SET negative_reviews = negative_reviews + 1
            WHERE id = NEW.reviewered_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update rating on update
CREATE TRIGGER trigger_update_rating_update
AFTER UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_user_rating_on_review_update();

-- ============================================
-- 14. NOTIFICATIONS
-- ============================================

-- Table: notifications
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    channel notification_channel_enum NOT NULL DEFAULT 'in_app',
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    action_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- ============================================
-- 15. SYSTEM SETTINGS
-- ============================================

-- Table: system_settings
CREATE TABLE system_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value VARCHAR(255) NOT NULL,
    description TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('auto_extend_threshold_minutes', '5', 'Time threshold in minutes before auction end to trigger auto-extend'),
('auto_extend_duration_minutes', '10', 'Duration in minutes to extend auction when triggered'),
('new_product_highlight_minutes', '60', 'Products posted within N minutes are highlighted as NEW'),
('min_rating_percentage', '80', 'Minimum rating percentage (0-100) required to bid');

-- ============================================
-- 16. INITIAL DATA (Roles, Permissions)
-- ============================================

-- Insert default roles
INSERT INTO roles (name) VALUES
('admin'),
('seller'),
('bidder');

-- Insert default permissions
INSERT INTO permissions (name) VALUES
('user.view'),
('user.create'),
('user.update'),
('user.delete'),
('product.view'),
('product.create'),
('product.update'),
('product.delete'),
('bid.place'),
('bid.view'),
('order.view'),
('order.manage'),
('category.view'),
('category.create'),
('category.update'),
('category.delete'),
('admin.dashboard'),
('admin.users'),
('admin.settings');

-- Assign permissions to admin
INSERT INTO roles_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.name = 'admin';

-- Assign permissions to seller
INSERT INTO roles_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.name = 'seller'
AND p.name IN (
    'product.view', 'product.create', 'product.update',
    'bid.view',
    'order.view', 'order.manage'
);

-- Assign permissions to bidder
INSERT INTO roles_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.name = 'bidder'
AND p.name IN (
    'product.view',
    'bid.place', 'bid.view',
    'order.view'
);

-- ============================================
-- 17. HELPER FUNCTIONS
-- ============================================

-- Function: Calculate user rating percentage
CREATE OR REPLACE FUNCTION get_user_rating_percentage(p_user_id INT)
RETURNS NUMERIC AS $$
DECLARE
    total_reviews INT;
    positive_count INT;
BEGIN
    SELECT positive_reviews, negative_reviews
    INTO positive_count, total_reviews
    FROM users
    WHERE id = p_user_id;
    
    total_reviews := positive_count + total_reviews;
    
    IF total_reviews = 0 THEN
        RETURN 100;
    END IF;
    
    RETURN ROUND((positive_count::NUMERIC / total_reviews) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Function: Get nested comments tree
CREATE OR REPLACE FUNCTION get_comment_tree(p_product_id INT)
RETURNS TABLE (
    comment_id INT,
    product_id INT,
    user_id INT,
    content TEXT,
    parent_id INT,
    level INT,
    path INT[],
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE comment_tree AS (
        SELECT 
            c.comment_id,
            c.product_id,
            c.user_id,
            c.content,
            c.parent_id,
            0 as level,
            ARRAY[c.comment_id] as path,
            c.created_at
        FROM product_comments c
        WHERE c.product_id = p_product_id
        AND c.parent_id IS NULL
        
        UNION ALL
        
        SELECT 
            c.comment_id,
            c.product_id,
            c.user_id,
            c.content,
            c.parent_id,
            ct.level + 1,
            ct.path || c.comment_id,
            c.created_at
        FROM product_comments c
        JOIN comment_tree ct ON c.parent_id = ct.comment_id
    )
    SELECT * FROM comment_tree
    ORDER BY path;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 18. VIEWS (Useful queries)
-- ============================================

-- View: Active auctions with details
CREATE VIEW active_auctions AS
SELECT 
    p.product_id,
    p.name,
    p.current_price,
    p.buy_now_price,
    p.bid_count,
    p.end_time,
    (p.end_time - CURRENT_TIMESTAMP) as time_remaining,
    c.name as category_name,
    u.full_name as seller_name,
    u.positive_reviews,
    u.negative_reviews
FROM products p
JOIN categories c ON p.category_id = c.category_id
JOIN users u ON p.seller_id = u.id
WHERE p.status = 'active'
AND p.end_time > CURRENT_TIMESTAMP;

-- View: User statistics
CREATE VIEW user_stats AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.email,
    u.status,
    u.is_verified,
    u.positive_reviews,
    u.negative_reviews,
    CASE 
        WHEN (u.positive_reviews + u.negative_reviews) = 0 THEN 100
        ELSE ROUND((u.positive_reviews::NUMERIC / (u.positive_reviews + u.negative_reviews)) * 100, 2)
    END as rating_percentage,
    COUNT(DISTINCT p.product_id) as products_sold,
    COUNT(DISTINCT b.bid_id) as total_bids
FROM users u
LEFT JOIN products p ON u.id = p.seller_id
LEFT JOIN bids b ON u.id = b.bidder_id
GROUP BY u.id;

-- ============================================
-- 19. SAMPLE DATA
-- ============================================

-- Insert sample verified users (without username)
INSERT INTO users (full_name, email, password, address, is_verified) VALUES
('John Doe', 'john.doe@example.com', '$2b$10$K7L/YJ4i4aVOuBmxJ7BHWOFbVVjPsJCh3kH6RgJYq6yGqIJXDq4Hy', '123 Main St, New York, NY', TRUE),
('Jane Smith', 'jane.smith@example.com', '$2b$10$K7L/YJ4i4aVOuBmxJ7BHWOFbVVjPsJCh3kH6RgJYq6yGqIJXDq4Hy', '456 Oak Ave, Los Angeles, CA', TRUE),
('Bob Wilson', 'bob.wilson@example.com', '$2b$10$K7L/YJ4i4aVOuBmxJ7BHWOFbVVjPsJCh3kH6RgJYq6yGqIJXDq4Hy', '789 Pine Rd, Chicago, IL', TRUE);

-- Assign roles to users (using email to find users)
INSERT INTO users_roles (user_id, role_id)
SELECT u.id, r.role_id
FROM users u, roles r
WHERE u.email = 'john.doe@example.com' AND r.name = 'seller'
UNION
SELECT u.id, r.role_id
FROM users u, roles r
WHERE u.email = 'jane.smith@example.com' AND r.name = 'bidder'
UNION
SELECT u.id, r.role_id
FROM users u, roles r
WHERE u.email = 'bob.wilson@example.com' AND r.name = 'admin';

-- Insert sample conversations
INSERT INTO conversations (name, is_group, creator_id) VALUES
(NULL, FALSE, 1),
('Auction Discussions', TRUE, 1);

-- Insert conversation participants
INSERT INTO conversation_participants (user_id, conversation_id) VALUES
(1, 1),
(2, 1),
(1, 2),
(2, 2),
(3, 2);

-- Insert sample messages
INSERT INTO messages (conversation_id, sender_id, body) VALUES
(1, 1, 'Hi, is the vintage watch still available?'),
(1, 2, 'Yes, it is! Would you like to bid?'),
(2, 1, 'Welcome to the auction discussion group!'),
(2, 2, 'Thanks for adding me!'),
(2, 3, 'Excited to participate in the auctions!');

-- ============================================
-- 20. COMPLETION MESSAGE
-- ============================================

SELECT 'Database initialization completed successfully!' AS status;
SELECT 'Total users: ' || COUNT(*) AS info FROM users;
SELECT 'Total verified users: ' || COUNT(*) AS info FROM users WHERE is_verified = TRUE;
SELECT 'Total conversations: ' || COUNT(*) AS info FROM conversations;
SELECT 'Total messages: ' || COUNT(*) AS info FROM messages;