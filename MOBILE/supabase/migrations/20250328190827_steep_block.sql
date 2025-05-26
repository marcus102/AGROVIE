-- Create custom types
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

-- Create profiles table
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

-- Create user_documents table
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

-- Create verification_codes table
CREATE TABLE IF NOT EXISTS verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

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

-- Create indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_verification_status ON profiles(verification_status);
CREATE INDEX idx_profiles_docs_status ON profiles(docs_status);
CREATE INDEX idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX idx_user_documents_id_type ON user_documents(identification_type);
CREATE INDEX idx_user_documents_legal_type ON user_documents(legal_document_type);
CREATE INDEX idx_verification_codes_user_id ON verification_codes(user_id);
CREATE INDEX idx_verification_codes_code ON verification_codes(code);

-- Timestamp update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_documents_updated_at
  BEFORE UPDATE ON user_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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