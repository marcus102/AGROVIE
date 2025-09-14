-- 1. Create custom types (grouped together)
CREATE TYPE user_role AS ENUM ('worker', 'technician', 'entrepreneur');
CREATE TYPE user_super_role AS ENUM ('user','admin', 'organization', 'government', 'moderator', 'technology', 'law', 'finance');
CREATE TYPE verification_status AS ENUM ('not_verified', 'verified');
CREATE TYPE docs_status AS ENUM ('accepted', 'rejected', 'pending', 'not_uploaded');
CREATE TYPE id_type AS ENUM ('id_card', 'passport', 'driver_license', 'residence_permit');
CREATE TYPE legal_doc_type AS ENUM ('business', 'certification', 'work_permit', 'insurance', 'experience');
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE availability_status AS ENUM ('available', 'not_available');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE user_nationality AS ENUM ('national', 'international', 'foreign');
CREATE TYPE user_account_status AS ENUM ('healthy', 'warning', 'suspended', 'deleted');
CREATE TYPE experience_level_type AS ENUM ('starter', 'qualified', 'expert');
CREATE TYPE mission_status_type AS ENUM ('in_review', 'online', 'rejected', 'completed', 'removed');
CREATE TYPE promotion_status_type AS ENUM ('in_review', 'online', 'expired', 'paused', 'canceled', 'rejected');
CREATE TYPE advantage_type AS ENUM ('transport', 'meal', 'accommodation', 'performance_bonus', 'other');
CREATE TYPE rating_type AS ENUM ('user', 'system');
CREATE TYPE price_status_type AS ENUM ('current', 'not_current');
CREATE TYPE document_status_type AS ENUM ('online', 'offline', 'removed', 'draft');
CREATE TYPE payment_status_type AS ENUM ('pending', 'completed', 'failed', 'canceled');
CREATE TYPE payment_type AS ENUM ('incoming', 'outgoing');
CREATE TYPE payment_method AS ENUM ('credit_card', 'bank_transfer', 'cash', 'mobile_payment', 'other');

-- 2. Create tables in dependency order
-- Core user tables first
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  super_role user_super_role NOT NULL DEFAULT 'user',
  role user_role NOT NULL,
  nationality user_nationality NOT NULL DEFAULT 'national',
  full_name text NOT NULL,
  phone text,
  actual_location text,
  bio text,
  availability_locations text[],
  availability_status availability_status NOT NULL DEFAULT 'available',
  status user_status NOT NULL DEFAULT 'active',
  skills text[],
  languages text[],
  specialization text[],
  certifications text[],
  work_experience text[],
  portfolio text[],
  profile_picture text,
  verification_status verification_status NOT NULL DEFAULT 'not_verified',
  docs_status docs_status NOT NULL DEFAULT 'not_uploaded',
  active boolean NOT NULL DEFAULT true,
  account_status user_account_status NOT NULL DEFAULT 'healthy',
  account_verified boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Identification Documents
  identification_type id_type,
  id_file_path text,
  
  -- Legal Documents
  legal_document_type legal_doc_type,
  legal_file_path text,
  
  status document_status NOT NULL DEFAULT 'pending',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT chk_document_presence CHECK (
    (identification_type IS NOT NULL AND id_file_path IS NOT NULL) OR
    (legal_document_type IS NOT NULL AND legal_file_path IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Mission-related tables
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, 
  user_phone text NOT NULL, 
  payment_method payment_method NOT NULL, 
  payment_reference text NOT NULL, 
  payment_type payment_type NOT NULL, 
  amount numeric(10, 2) NOT NULL CHECK (amount > 0), 
  otp_code text NOT NULL, 
  status payment_status_type NOT NULL DEFAULT 'pending', 
  description text, 
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), 
  updated_at timestamptz NOT NULL DEFAULT now() 
);

CREATE TABLE IF NOT EXISTS missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payment_id uuid REFERENCES payments(id) ON DELETE CASCADE,
  
  -- Mission Metadata
  mission_title text NOT NULL,
  mission_description text NOT NULL,
  location text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status mission_status_type NOT NULL DEFAULT 'in_review',
  
  -- Actor Requirements
  needed_actor user_role NOT NULL,
  actor_specialization jsonb DEFAULT '{}',
  needed_actor_amount INTEGER NOT NULL,
  required_experience_level experience_level_type NOT NULL,
  applicants uuid[] DEFAULT '{}',
  
  -- Farming-Specific Fields
  surface_area NUMERIC CHECK (surface_area > 0),
  surface_unit TEXT CHECK (surface_unit IN ('hectares', 'acres')),
  
  -- Financials
  original_price jsonb NOT NULL DEFAULT '{"price": 0, "status": "current"}'::jsonb,
  adjustment_price jsonb NOT NULL DEFAULT '{"price": 0, "status": "not_current"}'::jsonb,
  final_price NUMERIC NOT NULL,
  proposed_advantages advantage_type[] DEFAULT '{}',
  
  -- Logistics
  equipment boolean DEFAULT false,
  mission_images text[] DEFAULT '{}',
  
  -- Technical
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT chk_dates CHECK (end_date >= start_date),
  CONSTRAINT chk_original_price CHECK (
    (original_price->>'price')::numeric >= 0 AND
    original_price->>'status' IN ('current', 'not_current')
  ),
  CONSTRAINT chk_adjustment_price CHECK (
    (adjustment_price->>'price')::numeric >= 0 AND
    adjustment_price->>'status' IN ('current', 'not_current')
  ),
  CONSTRAINT chk_final_price CHECK ((final_price)::numeric >= 0)
);

-- Update payments table to add mission_id after missions table is created
ALTER TABLE payments ADD COLUMN mission_id uuid REFERENCES missions(id) ON DELETE CASCADE DEFAULT NULL;

-- Additional tables
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating_type rating_type NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  metadata jsonb DEFAULT '{}'::jsonb,
  rated_user uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT chk_rated_user CHECK (
    (rating_type = 'system' AND rated_user IS NULL) OR
    (rating_type = 'user' AND rated_user IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  images text[] DEFAULT '{}',
  title text NOT NULL,
  description text NOT NULL,
  reading_time integer NOT NULL CHECK (reading_time > 0),
  theme text NOT NULL,
  tags text[] DEFAULT '{}',
  status document_status_type NOT NULL DEFAULT 'draft',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_tags_array CHECK (array_length(tags, 1) <= 10)
);

-- 3. Enable RLS for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for all tables
-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Documents policies
CREATE POLICY "Users can read own documents"
  ON user_documents
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own documents"
  ON user_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own documents"
  ON user_documents
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own documents"
  ON user_documents
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Verification codes policies
CREATE POLICY "Users can read own verification codes"
  ON verification_codes
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own verification codes"
  ON verification_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own verification codes"
  ON verification_codes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Payments policies
CREATE POLICY "Users can read their own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payments"
  ON payments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Missions policies
CREATE POLICY "Users can read all missions"
  ON missions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create missions"
  ON missions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missions"
  ON missions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own missions"
  ON missions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ratings policies
CREATE POLICY "Users can read all ratings"
  ON ratings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create ratings"
  ON ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON ratings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users can read online documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (status = 'online');

CREATE POLICY "Users can create documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Create indexes for all tables
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_verification_status ON profiles(verification_status);
CREATE INDEX idx_profiles_docs_status ON profiles(docs_status);
CREATE INDEX idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX idx_user_documents_id_type ON user_documents(identification_type);
CREATE INDEX idx_user_documents_legal_type ON user_documents(legal_document_type);
CREATE INDEX idx_verification_codes_user_id ON verification_codes(user_id);
CREATE INDEX idx_verification_codes_code ON verification_codes(code);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_user_phone ON payments(user_phone);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_type ON payments(payment_type);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_missions_user_id ON missions(user_id);
CREATE INDEX idx_missions_needed_actor ON missions(needed_actor);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_start_date ON missions(start_date);
CREATE INDEX idx_missions_end_date ON missions(end_date);
CREATE INDEX idx_missions_location ON missions USING gin (to_tsvector('french', location));
CREATE INDEX idx_missions_mission_title ON missions USING gin (to_tsvector('french', mission_title));
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_rated_user ON ratings(rated_user);
CREATE INDEX idx_ratings_rating_type ON ratings(rating_type);
CREATE INDEX idx_ratings_rating ON ratings(rating);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_theme ON documents USING gin (to_tsvector('french', theme));
CREATE INDEX idx_documents_title ON documents USING gin (to_tsvector('french', title));
CREATE INDEX idx_documents_tags ON documents USING gin (tags);

-- 6. Create functions
-- Timestamp update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Verification code generation function
CREATE OR REPLACE FUNCTION generate_verification_code(user_id uuid)
RETURNS text AS $$
DECLARE
  code text;
BEGIN
  code := floor(random() * 900000 + 100000)::text;
  
  INSERT INTO verification_codes (user_id, code, expires_at)
  VALUES (user_id, code, now() + interval '15 minutes');
  
  RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced verification function
CREATE OR REPLACE FUNCTION verify_code(user_id uuid, input_code text)
RETURNS boolean AS $$
DECLARE
  code_record verification_codes%ROWTYPE;
BEGIN
  SELECT *
  INTO code_record
  FROM verification_codes vc
  WHERE vc.user_id = verify_code.user_id
    AND vc.expires_at > now()
    AND vc.attempts < 3
  ORDER BY vc.created_at DESC
  LIMIT 1;

  IF code_record IS NULL THEN
    RETURN false;
  END IF;

  IF code_record.code = input_code THEN
    UPDATE verification_codes
    SET attempts = 3
    WHERE id = code_record.id;

    UPDATE profiles
    SET verification_status = 'verified'
    WHERE id = verify_code.user_id;

    RETURN true;
  ELSE
    UPDATE verification_codes
    SET attempts = attempts + 1
    WHERE id = code_record.id;

    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_documents_updated_at
  BEFORE UPDATE ON user_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON missions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- -- Create ALL custom types first
-- CREATE TYPE experience_level_type AS ENUM ('starter', 'qualified', 'expert');
-- CREATE TYPE mission_status_type AS ENUM ('in_review', 'online', 'rejected', 'completed', 'removed');
-- CREATE TYPE promotion_status_type AS ENUM ('in_review', 'online', 'expired', 'paused', 'canceled', 'rejected');
-- CREATE TYPE advantage_type AS ENUM ('transport', 'meal', 'accommodation', 'performance_bonus', 'other');
-- CREATE TYPE rating_type AS ENUM ('user', 'system');
-- CREATE TYPE price_status_type AS ENUM ('current', 'not_current');
-- CREATE TYPE document_status_type AS ENUM ('online', 'offline', 'removed', 'draft');
-- CREATE TYPE payment_status_type AS ENUM ('pending', 'completed', 'failed', 'canceled');
-- CREATE TYPE payment_type AS ENUM ('incoming', 'outgoing');
-- CREATE TYPE payment_method AS ENUM ('credit_card', 'bank_transfer', 'cash', 'mobile_payment', 'other');
-- CREATE TYPE user_role AS ENUM ('worker', 'technician', 'entrepreneur');
-- CREATE TYPE user_super_role AS ENUM ('user','admin', 'organization', 'government', 'moderator', 'technology', 'law', 'finance');
-- CREATE TYPE verification_status AS ENUM ('not_verified', 'verified');
-- CREATE TYPE docs_status AS ENUM ('accepted', 'rejected', 'pending', 'not_uploaded');
-- CREATE TYPE id_type AS ENUM ('id_card', 'passport', 'driver_license', 'residence_permit');
-- CREATE TYPE legal_doc_type AS ENUM ('business', 'certification', 'work_permit', 'insurance', 'experience');
-- CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected');
-- CREATE TYPE availability_status AS ENUM ('available', 'not_available');
-- CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
-- CREATE TYPE user_nationality AS ENUM ('national', 'international', 'foreign');
-- CREATE TYPE user_account_status AS ENUM ('healthy', 'warning', 'suspended', 'deleted');

-- -- Create core user profile table first
-- CREATE TABLE IF NOT EXISTS profiles (
--   id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   super_role user_super_role NOT NULL DEFAULT 'user',
--   role user_role NOT NULL,
--   nationality user_nationality NOT NULL DEFAULT 'national',
--   full_name text NOT NULL,
--   phone text,
--   actual_location text,
--   bio text,
--   availability_locations text[],
--   availability_status availability_status NOT NULL DEFAULT 'available',
--   status user_status NOT NULL DEFAULT 'active',
--   skills text[],
--   languages text[],
--   specialization text[],
--   certifications text[],
--   work_experience text[],
--   portfolio text[],
--   profile_picture text,
--   verification_status verification_status NOT NULL DEFAULT 'not_verified',
--   docs_status docs_status NOT NULL DEFAULT 'not_uploaded',
--   active boolean NOT NULL DEFAULT true,
--   account_status user_account_status NOT NULL DEFAULT 'healthy',
--   account_verified boolean NOT NULL DEFAULT false,
--   metadata jsonb DEFAULT '{}'::jsonb,
--   created_at timestamptz NOT NULL DEFAULT now(),
--   updated_at timestamptz NOT NULL DEFAULT now()
-- );

-- -- Payments table (missions will reference this)
-- CREATE TABLE IF NOT EXISTS payments (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
--   user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, 
--   mission_id uuid DEFAULT NULL,  -- Will be properly referenced after missions creation
--   user_phone text NOT NULL, 
--   payment_method payment_method NOT NULL, 
--   payment_reference text NOT NULL, 
--   payment_type payment_type NOT NULL, 
--   amount numeric(10, 2) NOT NULL CHECK (amount > 0), 
--   otp_code text NOT NULL, 
--   status payment_status_type NOT NULL DEFAULT 'pending', 
--   description text, 
--   metadata jsonb DEFAULT '{}'::jsonb,
--   created_at timestamptz NOT NULL DEFAULT now(), 
--   updated_at timestamptz NOT NULL DEFAULT now() 
-- );

-- -- Missions table with proper references
-- CREATE TABLE IF NOT EXISTS missions (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
--   payment_id uuid REFERENCES payments(id) ON DELETE CASCADE,
  
--   -- Mission Metadata
--   mission_title text NOT NULL,
--   mission_description text NOT NULL,
--   location text NOT NULL,
--   start_date date NOT NULL,
--   end_date date NOT NULL,
--   status mission_status_type NOT NULL DEFAULT 'in_review',
  
--   -- Actor Requirements
--   needed_actor user_role NOT NULL,
--   actor_specialization jsonb DEFAULT '{}',
--   needed_actor_amount INTEGER NOT NULL,
--   required_experience_level experience_level_type NOT NULL,
--   applicants uuid[] DEFAULT '{}',
  
--   -- Farming-Specific Fields
--   surface_area NUMERIC CHECK (surface_area > 0),
--   surface_unit TEXT CHECK (surface_unit IN ('hectares', 'acres')),
  
--   -- Financials
--   original_price jsonb NOT NULL DEFAULT '{"price": 0, "status": "current"}'::jsonb,
--   adjustment_price jsonb NOT NULL DEFAULT '{"price": 0, "status": "not_current"}'::jsonb,
--   final_price NUMERIC NOT NULL,
--   proposed_advantages advantage_type[] DEFAULT '{}',
  
--   -- Logistics
--   equipment boolean DEFAULT false,
--   mission_images text[] DEFAULT '{}',
  
--   -- Technical
--   metadata jsonb DEFAULT '{}',
--   created_at timestamptz NOT NULL DEFAULT now(),
--   updated_at timestamptz NOT NULL DEFAULT now(),
  
--   CONSTRAINT chk_dates CHECK (end_date >= start_date),
--   CONSTRAINT chk_original_price CHECK (
--     (original_price->>'price')::numeric >= 0 AND
--     original_price->>'status' IN ('current', 'not_current')
--   ),
--   CONSTRAINT chk_adjustment_price CHECK (
--     (adjustment_price->>'price')::numeric >= 0 AND
--     adjustment_price->>'status' IN ('current', 'not_current')
--   ),
--   CONSTRAINT chk_final_price CHECK (final_price >= 0)
-- );

-- -- Now properly add mission reference to payments
-- ALTER TABLE payments ADD CONSTRAINT fk_mission_id 
--   FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE SET NULL;

-- -- User documents table
-- CREATE TABLE IF NOT EXISTS user_documents (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
--   identification_type id_type,
--   id_file_path text,
--   legal_document_type legal_doc_type,
--   legal_file_path text,
--   status document_status NOT NULL DEFAULT 'pending',
--   metadata jsonb DEFAULT '{}'::jsonb,
--   created_at timestamptz NOT NULL DEFAULT now(),
--   updated_at timestamptz NOT NULL DEFAULT now(),
  
--   CONSTRAINT chk_document_presence CHECK (
--     (identification_type IS NOT NULL AND id_file_path IS NOT NULL) OR
--     (legal_document_type IS NOT NULL AND legal_file_path IS NOT NULL)
--   )
-- );

-- -- Ratings table
-- CREATE TABLE IF NOT EXISTS ratings (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
--   rating_type rating_type NOT NULL,
--   rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
--   comment text,
--   metadata jsonb DEFAULT '{}'::jsonb,
--   rated_user uuid REFERENCES profiles(id) ON DELETE CASCADE,
--   created_at timestamptz NOT NULL DEFAULT now(),
--   updated_at timestamptz NOT NULL DEFAULT now(),
  
--   CONSTRAINT chk_rated_user CHECK (
--     (rating_type = 'system' AND rated_user IS NULL) OR
--     (rating_type = 'user' AND rated_user IS NOT NULL)
--   )
-- );

-- -- Documents table
-- CREATE TABLE IF NOT EXISTS documents (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
--   images text[] DEFAULT '{}',
--   title text NOT NULL,
--   description text NOT NULL,
--   reading_time integer NOT NULL CHECK (reading_time > 0),
--   theme text NOT NULL,
--   tags text[] DEFAULT '{}',
--   status document_status_type NOT NULL DEFAULT 'draft',
--   metadata jsonb DEFAULT '{}'::jsonb,
--   created_at timestamptz NOT NULL DEFAULT now(),
--   updated_at timestamptz NOT NULL DEFAULT now(),
--   CONSTRAINT chk_tags_array CHECK (array_length(tags, 1) <= 10)
-- );

-- -- Verification codes table
-- CREATE TABLE IF NOT EXISTS verification_codes (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--   code text NOT NULL,
--   attempts integer NOT NULL DEFAULT 0,
--   expires_at timestamptz NOT NULL,
--   created_at timestamptz NOT NULL DEFAULT now()
-- );

-- -- Enable RLS for all tables
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- -- Policies: Combined from both schemas
-- -- Payments Policies
-- CREATE POLICY "Users can manage own payments" ON payments
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- -- Missions Policies
-- CREATE POLICY "Public mission visibility" ON missions
--   FOR SELECT USING (status IN ('online', 'completed'));

-- CREATE POLICY "Full mission control for owners" ON missions
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- -- Ratings Policies
-- CREATE POLICY "Public rating visibility" ON ratings
--   FOR SELECT USING (true);

-- CREATE POLICY "User rating management" ON ratings
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- -- Documents Policies
-- CREATE POLICY "Published document visibility" ON documents
--   FOR SELECT USING (status = 'online');

-- CREATE POLICY "User document management" ON documents
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- -- Profile Policies
-- CREATE POLICY "User profile access" ON profiles
--   USING (auth.uid() = id)
--   WITH CHECK (auth.uid() = id);

-- -- User Documents Policies
-- CREATE POLICY "User document access" ON user_documents
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- -- Verification Codes Policy
-- CREATE POLICY "Code owner access" ON verification_codes
--   USING (auth.uid() = user_id);

-- -- Indexes: Combined from both schemas
-- CREATE INDEX idx_payments_user ON payments(user_id);
-- CREATE INDEX idx_missions_location ON missions USING GIN (to_tsvector('french', location));
-- CREATE INDEX idx_ratings_relationships ON ratings(user_id, rated_user);
-- CREATE INDEX idx_documents_search ON documents USING GIN(to_tsvector('french', theme));
-- CREATE INDEX idx_profiles_verification ON profiles(verification_status);
-- CREATE INDEX idx_user_docs_status ON user_documents(status);

-- -- Timestamp update function (single definition)
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN NEW.updated_at = now(); RETURN NEW; END;
-- $$ LANGUAGE plpgsql;

-- -- Apply triggers to all tables with updated_at
-- CREATE TRIGGER update_payments_timestamp BEFORE UPDATE ON payments
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_missions_timestamp BEFORE UPDATE ON missions
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_ratings_timestamp BEFORE UPDATE ON ratings
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_documents_timestamp BEFORE UPDATE ON documents
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON profiles
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_user_docs_timestamp BEFORE UPDATE ON user_documents
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -- Verification functions (single definitions)
-- CREATE OR REPLACE FUNCTION generate_verification_code(user_id uuid)
-- RETURNS text AS $$
-- DECLARE code text;
-- BEGIN
--   code := floor(random() * 900000 + 100000)::text;
--   INSERT INTO verification_codes (user_id, code, expires_at)
--   VALUES (user_id, code, now() + interval '15 minutes');
--   RETURN code;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE OR REPLACE FUNCTION verify_code(user_id uuid, input_code text)
-- RETURNS boolean AS $$
-- DECLARE code_record verification_codes%ROWTYPE;
-- BEGIN
--   SELECT * INTO code_record FROM verification_codes 
--   WHERE user_id = verify_code.user_id 
--     AND expires_at > now() 
--     AND attempts < 3
--   ORDER BY created_at DESC LIMIT 1;

--   IF NOT FOUND THEN RETURN false; END IF;

--   IF code_record.code = input_code THEN
--     UPDATE verification_codes SET attempts = 3 WHERE id = code_record.id;
--     UPDATE profiles SET verification_status = 'verified' WHERE id = user_id;
--     RETURN true;
--   ELSE
--     UPDATE verification_codes SET attempts = attempts + 1 WHERE id = code_record.id;
--     RETURN false;
--   END IF;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
