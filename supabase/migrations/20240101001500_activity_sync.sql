-- Migration 016: Activity Log & Sync Log
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), business_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id), subject_type VARCHAR(50), subject_id UUID,
  action VARCHAR(50), properties JSONB, ip_address INET, created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), business_id UUID NOT NULL, device_id VARCHAR(100),
  table_name VARCHAR(50), operation VARCHAR(10) CHECK (operation IN ('INSERT','UPDATE','DELETE')),
  record_id UUID, payload JSONB, synced_at TIMESTAMPTZ DEFAULT NOW(),
  conflict BOOLEAN DEFAULT FALSE, conflict_resolution VARCHAR(50)
);
CREATE INDEX idx_activity_log_business ON activity_log(business_id);
CREATE INDEX idx_activity_log_subject ON activity_log(subject_type, subject_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_log_own" ON activity_log FOR ALL USING (business_id = auth_business_id());
CREATE POLICY "sync_log_own" ON sync_log FOR ALL USING (business_id = auth_business_id());
