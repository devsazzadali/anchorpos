-- Migration 015: Notification Templates
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), business_id UUID NOT NULL REFERENCES businesses(id),
  type VARCHAR(50) NOT NULL CHECK (type IN ('new_sale','payment_received','order_confirm','ledger','stock_alert')),
  channel VARCHAR(20) DEFAULT 'email' CHECK (channel IN ('email','sms')),
  subject VARCHAR(500), body TEXT, variables TEXT[], is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), business_id UUID NOT NULL,
  template_id UUID REFERENCES notification_templates(id), recipient VARCHAR(255), channel VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
  error_message TEXT, sent_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_templates_own" ON notification_templates FOR ALL USING (business_id = auth_business_id());
