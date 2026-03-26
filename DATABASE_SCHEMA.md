# 🎨 Alternus Art Gallery - Database Schema

## Database Architecture

### Technology Stack
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Session
- **File Storage**: AWS S3 / Cloudinary

---

## 📊 Core Tables

### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ceo', 'artist', 'customer') NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### 2. Artists Table
```sql
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  bio TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  profile_image TEXT,
  cover_image TEXT,
  portfolio_images TEXT[], -- Array of image URLs
  website_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,

  -- Application Status
  application_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_date TIMESTAMP,
  rejected_date TIMESTAMP,
  rejection_reason TEXT,

  -- Artist Activity Status
  is_active BOOLEAN DEFAULT true,
  suspension_reason TEXT,
  suspended_at TIMESTAMP,

  -- Statistics
  total_artworks INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_artists_user ON artists(user_id);
CREATE INDEX idx_artists_status ON artists(application_status);
CREATE INDEX idx_artists_active ON artists(is_active);
```

### 3. Artworks Table
```sql
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,

  -- Artwork Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,

  -- Images
  primary_image TEXT NOT NULL,
  additional_images TEXT[], -- Array of image URLs

  -- Specifications
  medium VARCHAR(100), -- Oil, Acrylic, Watercolor, Digital, etc.
  style VARCHAR(100), -- Abstract, Realism, Impressionism, etc.
  width DECIMAL(8, 2), -- in cm
  height DECIMAL(8, 2), -- in cm
  depth DECIMAL(8, 2), -- in cm
  weight DECIMAL(8, 2), -- in kg
  year_created INTEGER,

  -- Status
  status ENUM('pending', 'approved', 'rejected', 'sold') DEFAULT 'pending',
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,

  -- Approval
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,

  -- Metadata
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_artworks_artist ON artworks(artist_id);
CREATE INDEX idx_artworks_status ON artworks(status);
CREATE INDEX idx_artworks_available ON artworks(is_available);
CREATE INDEX idx_artworks_price ON artworks(price);
```

### 4. Sales Table
```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Transaction Details
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  artwork_id UUID REFERENCES artworks(id),
  artist_id UUID REFERENCES artists(id),
  buyer_id UUID REFERENCES users(id),

  -- Pricing
  artwork_price DECIMAL(10, 2) NOT NULL,
  gallery_commission_rate DECIMAL(5, 2) DEFAULT 40.00, -- 40%
  gallery_commission DECIMAL(10, 2) NOT NULL, -- Calculated: price * 0.40
  artist_earning DECIMAL(10, 2) NOT NULL, -- Calculated: price * 0.60

  -- Payment
  payment_method VARCHAR(50), -- stripe, paypal, bank_transfer
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  payment_date TIMESTAMP,

  -- Payout to Artist
  payout_status ENUM('pending', 'processing', 'paid', 'failed') DEFAULT 'pending',
  payout_date TIMESTAMP,
  payout_reference VARCHAR(100),

  -- Metadata
  sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_transaction ON sales(transaction_id);
CREATE INDEX idx_sales_artwork ON sales(artwork_id);
CREATE INDEX idx_sales_artist ON sales(artist_id);
CREATE INDEX idx_sales_buyer ON sales(buyer_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_payment_status ON sales(payment_status);
CREATE INDEX idx_sales_payout_status ON sales(payout_status);
```

### 5. Admin Actions Log Table
```sql
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id),

  action_type ENUM(
    'artist_approved',
    'artist_rejected',
    'artist_suspended',
    'artwork_approved',
    'artwork_rejected',
    'artwork_removed',
    'payout_processed',
    'settings_changed'
  ) NOT NULL,

  entity_type VARCHAR(50), -- 'artist', 'artwork', 'sale'
  entity_id UUID,

  details JSONB, -- Additional metadata
  ip_address VARCHAR(45),
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_type ON admin_actions(action_type);
CREATE INDEX idx_admin_actions_date ON admin_actions(created_at);
```

### 6. Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),

  subject VARCHAR(255),
  message TEXT NOT NULL,

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,

  parent_message_id UUID REFERENCES messages(id), -- For threads

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_from ON messages(from_user_id);
CREATE INDEX idx_messages_to ON messages(to_user_id);
CREATE INDEX idx_messages_read ON messages(is_read);
```

### 7. Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),

  type VARCHAR(50) NOT NULL, -- 'new_sale', 'artist_approved', 'artwork_sold', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT,

  link_url TEXT, -- Where to redirect when clicked

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_date ON notifications(created_at);
```

### 8. Financial Reports Table
```sql
CREATE TABLE financial_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  report_type ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  total_sales INTEGER,
  total_revenue DECIMAL(12, 2),
  total_commission DECIMAL(12, 2),
  total_artist_payouts DECIMAL(12, 2),

  report_data JSONB, -- Detailed breakdown

  generated_by UUID REFERENCES users(id),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_type ON financial_reports(report_type);
CREATE INDEX idx_reports_period ON financial_reports(period_start, period_end);
```

---

## 🔗 Relationships

```
users (1) ----< (many) artists
artists (1) ----< (many) artworks
artworks (1) ----< (many) sales
users (1) ----< (many) sales (as buyer)
artists (1) ----< (many) sales
users (1) ----< (many) admin_actions
users (1) ----< (many) messages (sent)
users (1) ----< (many) messages (received)
users (1) ----< (many) notifications
```

---

## 📈 Key Business Metrics Queries

### CEO Dashboard Stats
```sql
-- Total Revenue (All Time)
SELECT SUM(artwork_price) as total_revenue
FROM sales
WHERE payment_status = 'completed';

-- Gallery Commission (40%)
SELECT SUM(gallery_commission) as total_commission
FROM sales
WHERE payment_status = 'completed';

-- Artist Earnings (60%)
SELECT SUM(artist_earning) as total_artist_earnings
FROM sales
WHERE payment_status = 'completed';

-- Pending Artist Applications
SELECT COUNT(*) as pending_applications
FROM artists
WHERE application_status = 'pending';

-- Top Selling Artists
SELECT
  a.display_name,
  COUNT(s.id) as total_sales,
  SUM(s.artist_earning) as total_earned
FROM artists a
JOIN sales s ON a.id = s.artist_id
WHERE s.payment_status = 'completed'
GROUP BY a.id, a.display_name
ORDER BY total_sales DESC
LIMIT 10;

-- Monthly Revenue Trend
SELECT
  DATE_TRUNC('month', sale_date) as month,
  COUNT(*) as total_sales,
  SUM(artwork_price) as revenue,
  SUM(gallery_commission) as commission
FROM sales
WHERE payment_status = 'completed'
GROUP BY month
ORDER BY month DESC;
```

---

## 🔐 Security & Access Control

### Role-Based Permissions
```javascript
const PERMISSIONS = {
  ceo: [
    'view_dashboard',
    'approve_artists',
    'reject_artists',
    'suspend_artists',
    'approve_artworks',
    'reject_artworks',
    'view_sales',
    'process_payouts',
    'view_reports',
    'export_data',
    'view_logs',
    'send_messages'
  ],
  artist: [
    'upload_artwork',
    'view_own_sales',
    'edit_profile',
    'view_own_earnings'
  ],
  customer: [
    'browse_artworks',
    'purchase_artwork',
    'view_own_orders'
  ]
};
```

---

## 📊 Data Flow

### Artist Application Flow
1. Artist applies → `artists.application_status = 'pending'`
2. CEO reviews → Views application details
3. CEO approves/rejects → Update status + log action
4. If approved → Artist can upload artworks
5. If rejected → Send rejection reason via message

### Artwork Upload & Approval Flow
1. Artist uploads → `artworks.status = 'pending'`
2. CEO reviews → Views artwork details
3. CEO approves/rejects → Update status + log action
4. If approved → `artworks.is_available = true`
5. Artwork appears in gallery

### Sales & Commission Flow
1. Customer purchases → Create sale record
2. Payment processed → `sales.payment_status = 'completed'`
3. Calculate commission:
   - Gallery: price × 0.40
   - Artist: price × 0.60
4. Update artwork status → `artworks.status = 'sold'`
5. Payout to artist → `sales.payout_status = 'paid'`

---

## 🚀 Performance Optimizations

### Indexes
- All foreign keys indexed
- Frequently queried fields indexed
- Composite indexes for complex queries

### Caching Strategy
- Cache dashboard stats (Redis)
- Invalidate on new sales/approvals
- TTL: 5 minutes

### Database Views (for complex queries)
```sql
CREATE VIEW artist_stats AS
SELECT
  a.id,
  a.display_name,
  COUNT(DISTINCT aw.id) as total_artworks,
  COUNT(DISTINCT s.id) as total_sales,
  COALESCE(SUM(s.artist_earning), 0) as total_earnings
FROM artists a
LEFT JOIN artworks aw ON a.id = aw.artist_id
LEFT JOIN sales s ON a.id = s.artist_id AND s.payment_status = 'completed'
GROUP BY a.id, a.display_name;
```

---

This schema is production-ready and scalable for a real art gallery platform.
