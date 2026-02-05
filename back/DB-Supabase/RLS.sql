-- 1) Ensure the table exists and user_id is uuid (skip if already correct)
-- ALTER TABLE "documents" ALTER COLUMN "user_id" TYPE uuid USING "user_id"::uuid;

-- 2) Enable Row Level Security
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;

-- 3) Create index on the owner column for policy performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON "documents" ("user_id");

-- 4) SELECT policy: authenticated users can only read their own rows
CREATE POLICY documents_select_own ON "documents"
  FOR SELECT
  TO authenticated
  USING ( (SELECT auth.uid()) = "user_id" );

-- 5) INSERT policy: authenticated users may insert rows only for themselves
CREATE POLICY documents_insert_own ON "documents"
  FOR INSERT
  TO authenticated
  WITH CHECK ( (SELECT auth.uid()) = "user_id" );

-- 6) UPDATE policy: authenticated users can update only their own rows and can only set user_id to themselves
CREATE POLICY documents_update_own ON "documents"
  FOR UPDATE
  TO authenticated
  USING ( (SELECT auth.uid()) = "user_id" )
  WITH CHECK ( (SELECT auth.uid()) = "user_id" );

-- 7) DELETE policy: authenticated users can delete only their own rows
CREATE POLICY documents_delete_own ON "documents"
  FOR DELETE
  TO authenticated
  USING ( (SELECT auth.uid()) = "user_id" );