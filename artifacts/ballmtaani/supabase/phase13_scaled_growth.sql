-- ==============================================================================
-- BallMtaani Edge — Phase 13: Scaled Growth, Self-Service Partnerships,
-- Regional Expansion and Portfolio Optimization
-- ==============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. SCALE PROGRAMMES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scale_programmes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key                 TEXT NOT NULL UNIQUE,
  name                TEXT NOT NULL,
  scale_type          TEXT NOT NULL CHECK (scale_type IN (
                        'consumer','mobile','creator','publisher','b2b_api',
                        'telecom','competition','country','payment_provider',
                        'language','enterprise','product_plan')),
  target_scope        TEXT NOT NULL,
  current_stage       TEXT NOT NULL DEFAULT 'pilot' CHECK (current_stage IN (
                        'pilot','validated_pilot','limited_scale','channel_scale',
                        'market_scale','regional_scale','mature_operation')),
  proposed_stage      TEXT CHECK (proposed_stage IN (
                        'pilot','validated_pilot','limited_scale','channel_scale',
                        'market_scale','regional_scale','mature_operation')),
  status              TEXT NOT NULL DEFAULT 'analysis' CHECK (status IN (
                        'analysis','proposed','review','approved','active',
                        'paused','completed','rolled_back','rejected')),
  owner               TEXT NOT NULL,
  target_start_at     TIMESTAMPTZ,
  target_end_at       TIMESTAMPTZ,
  user_limit          INTEGER,
  partner_limit       INTEGER,
  budget_limit_minor  BIGINT,
  budget_currency     TEXT DEFAULT 'KES',
  infrastructure_limit TEXT,
  support_limit       TEXT,
  success_criteria    JSONB NOT NULL DEFAULT '[]',
  stop_conditions     JSONB NOT NULL DEFAULT '[]',
  rollback_plan       TEXT,
  approved_by         TEXT,
  approved_at         TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stage gate requirements per stage
CREATE TABLE IF NOT EXISTS scale_stage_requirements (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage                     TEXT NOT NULL,
  max_users                 INTEGER,
  max_partners              INTEGER,
  max_campaign_spend_minor  BIGINT,
  max_notification_volume   INTEGER,
  max_competitions          INTEGER,
  max_countries             INTEGER,
  max_api_monthly_requests  BIGINT,
  required_support_coverage TEXT,
  required_model_accuracy   NUMERIC(5,4),
  required_contribution_pct NUMERIC(5,2),
  requires_compliance_sign  BOOLEAN NOT NULL DEFAULT true,
  requires_executive_sign   BOOLEAN NOT NULL DEFAULT false,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO scale_stage_requirements (stage, max_users, max_partners, max_countries, requires_compliance_sign, requires_executive_sign)
VALUES
  ('pilot',            500,   5,  1, true,  false),
  ('validated_pilot',  2000,  20, 1, true,  false),
  ('limited_scale',    10000, 50, 2, true,  true),
  ('channel_scale',    30000, 150,3, true,  true),
  ('market_scale',     100000,500,5, true,  true),
  ('regional_scale',   500000,2000,10,true, true),
  ('mature_operation', NULL,  NULL,NULL,true,true)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. PARTNER APPLICATIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partner_applications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_user_id     UUID NOT NULL,
  requested_partner_type TEXT NOT NULL CHECK (requested_partner_type IN (
                           'creator','publisher','developer','small_media',
                           'telecom','enterprise','white_label')),
  organization_name     TEXT NOT NULL,
  market                TEXT NOT NULL DEFAULT 'KE',
  website               TEXT,
  intended_use          TEXT NOT NULL,
  expected_usage        TEXT,
  status                TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
                           'draft','submitted','automated_review','manual_review',
                           'approved','rejected','withdrawn','expired')),
  verification_level    TEXT NOT NULL DEFAULT 'none' CHECK (verification_level IN (
                           'none','email_verified','identity_review',
                           'organization_verified','domain_verified',
                           'payment_verified','contract_verified','enhanced_review')),
  risk_score            INTEGER CHECK (risk_score BETWEEN 0 AND 100),
  risk_outcome          TEXT CHECK (risk_outcome IN (
                           'auto_approve','limited_trial','manual_review',
                           'reject','enhanced_verification')),
  review_required       BOOLEAN NOT NULL DEFAULT false,
  reviewer              TEXT,
  reviewed_at           TIMESTAMPTZ,
  rejection_reason      TEXT,
  provisioned_tenant_id UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_applications_user ON partner_applications(applicant_user_id);
CREATE INDEX IF NOT EXISTS idx_partner_applications_status ON partner_applications(status);

CREATE TABLE IF NOT EXISTS partner_application_documents (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_application_id UUID NOT NULL REFERENCES partner_applications(id) ON DELETE CASCADE,
  document_type          TEXT NOT NULL CHECK (document_type IN (
                           'national_id','business_registration','tax_certificate',
                           'domain_verification','bank_statement','signed_agreement',
                           'use_case_description','screenshot','other')),
  file_reference         TEXT NOT NULL, -- encrypted/signed S3 reference, never public URL
  status                 TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                           'pending','accepted','rejected','expired')),
  reviewed_by            TEXT,
  reviewed_at            TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. B2B SUBSCRIPTIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS b2b_subscriptions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                UUID NOT NULL,
  b2b_plan_id              TEXT NOT NULL,
  status                   TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN (
                             'trialing','active','past_due','suspended',
                             'cancelled','expired','terminated')),
  billing_cycle            TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN (
                             'monthly','annual','usage','base_plus_usage')),
  starts_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_start     TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end       TIMESTAMPTZ,
  trial_ends_at            TIMESTAMPTZ,
  cancelled_at             TIMESTAMPTZ,
  cancellation_effective_at TIMESTAMPTZ,
  billing_provider         TEXT NOT NULL DEFAULT 'manual',
  billing_reference        TEXT,
  usage_pricing_version    TEXT,
  included_api_requests    BIGINT NOT NULL DEFAULT 0,
  included_widget_views    BIGINT NOT NULL DEFAULT 0,
  overage_api_price_minor  INTEGER NOT NULL DEFAULT 0, -- per 1000 requests, minor units
  overage_currency         TEXT NOT NULL DEFAULT 'KES',
  grace_threshold_pct      NUMERIC(5,2) NOT NULL DEFAULT 10,
  hard_limit_multiplier    NUMERIC(5,2) NOT NULL DEFAULT 2.0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_b2b_subs_tenant ON b2b_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_b2b_subs_status ON b2b_subscriptions(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. BILLABLE USAGE EVENTS (immutable ledger)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS billable_usage_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL,
  api_client_id       UUID,
  subscription_id     UUID REFERENCES b2b_subscriptions(id),
  usage_type          TEXT NOT NULL CHECK (usage_type IN (
                        'api_request','premium_api_request','widget_view',
                        'webhook_delivery','data_export','active_seat',
                        'custom_domain','notification_delivery','storage_gb')),
  quantity            BIGINT NOT NULL DEFAULT 1,
  unit                TEXT NOT NULL DEFAULT 'count',
  event_key           TEXT NOT NULL UNIQUE, -- deduplication key
  source_reference    TEXT,
  occurred_at         TIMESTAMPTZ NOT NULL,
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  billing_period      TEXT NOT NULL, -- YYYY-MM
  pricing_version_id  TEXT,
  status              TEXT NOT NULL DEFAULT 'recorded' CHECK (status IN (
                        'recorded','excluded','adjusted','billed','disputed'))
);

CREATE INDEX IF NOT EXISTS idx_usage_tenant_period ON billable_usage_events(tenant_id, billing_period);
CREATE INDEX IF NOT EXISTS idx_usage_subscription ON billable_usage_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_usage_type ON billable_usage_events(usage_type);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. B2B INVOICES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS b2b_invoices (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            UUID NOT NULL,
  subscription_id      UUID REFERENCES b2b_subscriptions(id),
  invoice_number       TEXT NOT NULL UNIQUE,
  billing_period       TEXT NOT NULL,
  status               TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
                         'draft','open','partially_paid','paid','past_due',
                         'disputed','void','written_off','refunded')),
  subtotal_minor       BIGINT NOT NULL DEFAULT 0,
  discount_minor       BIGINT NOT NULL DEFAULT 0,
  tax_minor            BIGINT NOT NULL DEFAULT 0,
  total_minor          BIGINT NOT NULL DEFAULT 0,
  paid_minor           BIGINT NOT NULL DEFAULT 0,
  currency             TEXT NOT NULL DEFAULT 'KES',
  pricing_version      TEXT,
  due_at               TIMESTAMPTZ,
  issued_at            TIMESTAMPTZ,
  paid_at              TIMESTAMPTZ,
  payment_reference    TEXT,
  auto_approved        BOOLEAN NOT NULL DEFAULT false,
  approved_by          TEXT,
  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON b2b_invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON b2b_invoices(status);

CREATE TABLE IF NOT EXISTS b2b_invoice_line_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID NOT NULL REFERENCES b2b_invoices(id) ON DELETE CASCADE,
  line_type       TEXT NOT NULL CHECK (line_type IN (
                    'base_subscription','api_overage','premium_api_overage',
                    'widget_view_overage','additional_seat','custom_domain',
                    'premium_support','implementation_service','data_export',
                    'webhook_volume','tax','discount','adjustment')),
  description     TEXT NOT NULL,
  quantity        BIGINT NOT NULL DEFAULT 1,
  unit_price_minor BIGINT NOT NULL DEFAULT 0,
  total_minor     BIGINT NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'KES',
  pricing_version TEXT,
  usage_period    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. BILLING DISPUTES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS b2b_billing_disputes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id          UUID NOT NULL REFERENCES b2b_invoices(id),
  tenant_id           UUID NOT NULL,
  disputed_line_id    UUID REFERENCES b2b_invoice_line_items(id),
  reason              TEXT NOT NULL,
  evidence_reference  TEXT,
  status              TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
                        'open','under_review','resolved_accepted',
                        'resolved_rejected','adjustment_issued','closed')),
  adjustment_amount_minor BIGINT,
  adjustment_currency TEXT DEFAULT 'KES',
  resolution_notes    TEXT,
  opened_by           TEXT NOT NULL,
  reviewed_by         TEXT,
  resolved_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usage adjustments (never modify original ledger)
CREATE TABLE IF NOT EXISTS usage_adjustments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_event_id    UUID NOT NULL REFERENCES billable_usage_events(id),
  adjustment_type      TEXT NOT NULL CHECK (adjustment_type IN (
                         'credit','correction','dispute_resolution','goodwill')),
  quantity_delta       BIGINT NOT NULL,
  reason               TEXT NOT NULL,
  approved_by          TEXT NOT NULL,
  dispute_id           UUID REFERENCES b2b_billing_disputes(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. CUSTOMER SUCCESS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customer_success_accounts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL UNIQUE,
  partner_id        UUID,
  segment           TEXT NOT NULL CHECK (segment IN (
                      'publisher','api_customer','enterprise','telecom',
                      'creator','small_media')),
  assigned_manager  TEXT,
  lifecycle_stage   TEXT NOT NULL DEFAULT 'onboarding' CHECK (lifecycle_stage IN (
                      'onboarding','implementation','launched','adopting',
                      'healthy','expanding','at_risk','renewal','churned')),
  health_score      INTEGER CHECK (health_score BETWEEN 0 AND 100),
  health_label      TEXT CHECK (health_label IN ('Healthy','Watch','At risk','Critical')),
  renewal_date      DATE,
  contract_value_minor BIGINT,
  contract_currency TEXT DEFAULT 'KES',
  adoption_status   TEXT NOT NULL DEFAULT 'not_started' CHECK (adoption_status IN (
                      'not_started','in_progress','launched','optimizing','mature')),
  risk_status       TEXT NOT NULL DEFAULT 'none' CHECK (risk_status IN (
                      'none','watch','elevated','critical')),
  next_review_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_success_plans (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_success_account_id UUID NOT NULL REFERENCES customer_success_accounts(id),
  objectives                  TEXT NOT NULL,
  success_metrics             JSONB NOT NULL DEFAULT '[]',
  implementation_steps        JSONB NOT NULL DEFAULT '[]',
  product_adoption_targets    JSONB NOT NULL DEFAULT '[]',
  training_requirements       TEXT,
  owner                       TEXT NOT NULL,
  start_at                    TIMESTAMPTZ NOT NULL,
  review_at                   TIMESTAMPTZ NOT NULL,
  status                      TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
                                'draft','active','completed','cancelled')),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. SALES ACTIVITIES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales_activities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id  UUID NOT NULL,
  activity_type   TEXT NOT NULL CHECK (activity_type IN (
                    'call','meeting','email','demo','technical_review',
                    'security_review','proposal','negotiation','follow_up',
                    'renewal_review')),
  subject         TEXT NOT NULL,
  outcome         TEXT,
  next_action     TEXT,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner           TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_activities_opportunity ON sales_activities(opportunity_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. MARKET READINESS ASSESSMENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_readiness_assessments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code          TEXT NOT NULL,
  market_name           TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'market_research' CHECK (status IN (
                          'market_research','compliance_review','payment_review',
                          'data_review','model_review','partner_discovery',
                          'internal_pilot','closed_beta','commercial_pilot',
                          'limited_launch','scaled_launch','paused','rejected')),
  audience_score        INTEGER CHECK (audience_score BETWEEN 0 AND 100),
  competition_score     INTEGER CHECK (competition_score BETWEEN 0 AND 100),
  model_score           INTEGER CHECK (model_score BETWEEN 0 AND 100),
  payment_score         INTEGER CHECK (payment_score BETWEEN 0 AND 100),
  compliance_score      INTEGER CHECK (compliance_score BETWEEN 0 AND 100),
  data_protection_score INTEGER CHECK (data_protection_score BETWEEN 0 AND 100),
  localization_score    INTEGER CHECK (localization_score BETWEEN 0 AND 100),
  support_score         INTEGER CHECK (support_score BETWEEN 0 AND 100),
  partner_score         INTEGER CHECK (partner_score BETWEEN 0 AND 100),
  cost_score            INTEGER CHECK (cost_score BETWEEN 0 AND 100),
  revenue_score         INTEGER CHECK (revenue_score BETWEEN 0 AND 100),
  overall_score         INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  owner                 TEXT NOT NULL,
  reviewed_at           TIMESTAMPTZ,
  decision              TEXT CHECK (decision IN ('proceed','pause','reject','escalate')),
  decision_notes        TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(country_code)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. MARKET CONFIGURATIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_configurations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code         TEXT NOT NULL UNIQUE,
  market_name          TEXT NOT NULL,
  currency_code        TEXT NOT NULL,
  default_language     TEXT NOT NULL DEFAULT 'en',
  default_timezone     TEXT NOT NULL DEFAULT 'Africa/Nairobi',
  available_languages  TEXT[] NOT NULL DEFAULT ARRAY['en'],
  is_active            BOOLEAN NOT NULL DEFAULT false,
  requires_local_legal BOOLEAN NOT NULL DEFAULT true,
  data_residency_note  TEXT,
  support_channels     TEXT[] NOT NULL DEFAULT ARRAY['email'],
  campaign_rules       JSONB NOT NULL DEFAULT '{}',
  partner_eligibility  TEXT[] NOT NULL DEFAULT ARRAY['publisher','developer'],
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Market-specific plan prices (integer minor units)
CREATE TABLE IF NOT EXISTS market_plan_prices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id        UUID NOT NULL REFERENCES market_configurations(id),
  plan_key         TEXT NOT NULL,
  price_minor      BIGINT NOT NULL CHECK (price_minor >= 0),
  currency_code    TEXT NOT NULL,
  billing_cycle    TEXT NOT NULL DEFAULT 'monthly',
  is_active        BOOLEAN NOT NULL DEFAULT true,
  effective_from   DATE NOT NULL,
  effective_until  DATE,
  pricing_version  TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(market_id, plan_key, billing_cycle, effective_from)
);

-- Market legal documents
CREATE TABLE IF NOT EXISTS market_legal_documents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code   TEXT NOT NULL,
  language_code  TEXT NOT NULL DEFAULT 'en',
  doc_type       TEXT NOT NULL CHECK (doc_type IN (
                   'terms','subscription_terms','privacy_notice','refund_policy',
                   'responsible_use','cookie_notice','partner_terms',
                   'referral_terms','data_processing_agreement')),
  version        TEXT NOT NULL,
  effective_date DATE NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'draft' CHECK (approval_status IN (
                   'draft','legal_review','approved','active','superseded')),
  content_url    TEXT,
  approved_by    TEXT,
  approved_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(country_code, language_code, doc_type, version)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. PAYMENT PROVIDER CONFIGURATIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_provider_configurations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id             UUID NOT NULL REFERENCES market_configurations(id),
  provider_key          TEXT NOT NULL CHECK (provider_key IN (
                          'mpesa_ke','airtel_money','mtn_momo','orange_money',
                          'stripe','flutterwave','paystack','bank_transfer',
                          'manual_invoice','other')),
  status                TEXT NOT NULL DEFAULT 'research' CHECK (status IN (
                          'research','sandbox','approved','active',
                          'degraded','paused','retired')),
  supported_currencies  TEXT[] NOT NULL DEFAULT ARRAY['KES'],
  supported_plan_types  TEXT[] NOT NULL DEFAULT ARRAY['consumer'],
  settlement_currency   TEXT NOT NULL DEFAULT 'KES',
  configuration_ref     TEXT, -- points to encrypted config store, not inline secrets
  callback_url          TEXT,
  reconciliation_method TEXT NOT NULL DEFAULT 'manual',
  fee_model             JSONB NOT NULL DEFAULT '{}',
  priority              INTEGER NOT NULL DEFAULT 10,
  health_status         TEXT NOT NULL DEFAULT 'unknown' CHECK (health_status IN (
                          'unknown','healthy','degraded','down')),
  last_health_check     TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(market_id, provider_key)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. PORTFOLIO ITEMS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_type        TEXT NOT NULL CHECK (portfolio_type IN (
                          'plan','product','competition','channel','partner',
                          'country','language','payment_provider')),
  reference_id          TEXT NOT NULL,
  name                  TEXT NOT NULL,
  current_status        TEXT NOT NULL DEFAULT 'maintain' CHECK (current_status IN (
                          'invest','grow','maintain','optimize',
                          'harvest','merge','pause','retire')),
  strategic_value       INTEGER NOT NULL DEFAULT 50 CHECK (strategic_value BETWEEN 0 AND 100),
  revenue_minor         BIGINT NOT NULL DEFAULT 0,
  variable_cost_minor   BIGINT NOT NULL DEFAULT 0,
  contribution_minor    BIGINT GENERATED ALWAYS AS (revenue_minor - variable_cost_minor) STORED,
  currency_code         TEXT NOT NULL DEFAULT 'KES',
  growth_rate_pct       NUMERIC(8,2),
  retention_pct         NUMERIC(5,2),
  operational_complexity INTEGER NOT NULL DEFAULT 50 CHECK (operational_complexity BETWEEN 0 AND 100),
  compliance_risk       INTEGER NOT NULL DEFAULT 50 CHECK (compliance_risk BETWEEN 0 AND 100),
  support_burden        INTEGER NOT NULL DEFAULT 50 CHECK (support_burden BETWEEN 0 AND 100),
  recommendation        TEXT CHECK (recommendation IN (
                          'invest','grow','maintain','optimize',
                          'harvest','merge','pause','retire')),
  reviewed_at           TIMESTAMPTZ,
  owner                 TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(portfolio_type, reference_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. INVESTMENT PROPOSALS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investment_proposals (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                    TEXT NOT NULL,
  investment_type          TEXT NOT NULL CHECK (investment_type IN (
                             'data_provider','model','mobile','marketing',
                             'telecom_integration','country_expansion',
                             'competition_expansion','language','enterprise_feature',
                             'support_staffing','infrastructure','security',
                             'compliance','other')),
  description              TEXT NOT NULL,
  requested_amount_minor   BIGINT NOT NULL CHECK (requested_amount_minor >= 0),
  currency                 TEXT NOT NULL DEFAULT 'KES',
  expected_revenue_minor   BIGINT NOT NULL DEFAULT 0,
  expected_cost_savings_minor BIGINT NOT NULL DEFAULT 0,
  expected_contribution_minor BIGINT NOT NULL DEFAULT 0,
  strategic_value          INTEGER NOT NULL CHECK (strategic_value BETWEEN 0 AND 100),
  risk_level               INTEGER NOT NULL CHECK (risk_level BETWEEN 0 AND 100),
  reversibility            INTEGER NOT NULL CHECK (reversibility BETWEEN 0 AND 100),
  time_to_value_months     INTEGER,
  payback_period_months    INTEGER,
  start_at                 DATE,
  owner                    TEXT NOT NULL,
  status                   TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
                             'draft','review','approved','rejected',
                             'active','paused','completed')),
  decision                 TEXT,
  decision_notes           TEXT,
  decided_by               TEXT,
  decided_at               TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. OPERATIONAL CAPACITY SNAPSHOTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS operational_capacity_snapshots (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period              TEXT NOT NULL, -- YYYY-MM
  function_name       TEXT NOT NULL CHECK (function_name IN (
                        'product','engineering','model_operations','data_operations',
                        'customer_support','partner_success','sales','marketing',
                        'finance','compliance','security','mobile','infrastructure')),
  available_capacity  INTEGER NOT NULL CHECK (available_capacity BETWEEN 0 AND 100),
  committed_capacity  INTEGER NOT NULL CHECK (committed_capacity BETWEEN 0 AND 100),
  utilization         INTEGER GENERATED ALWAYS AS (
                        LEAST(100, ROUND(committed_capacity::numeric / NULLIF(available_capacity,0) * 100))
                      ) STORED,
  backlog             TEXT,
  risk_level          TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN (
                        'low','medium','high','critical')),
  owner               TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(period, function_name)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. API CHANGELOG ENTRIES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_changelog_entries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_version         TEXT NOT NULL,
  change_type         TEXT NOT NULL CHECK (change_type IN (
                        'feature','improvement','deprecation',
                        'breaking','security','bug_fix')),
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  effective_at        TIMESTAMPTZ NOT NULL,
  deprecation_at      TIMESTAMPTZ,
  sunset_at           TIMESTAMPTZ,
  migration_reference TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 16. PHASE 13 FEATURE FLAGS (all default OFF)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO edge_feature_flags (key, name, is_enabled, description, phase)
VALUES
  ('EDGE_NATIONAL_SCALE_ENABLED',              'National Scale Mode',             false, 'Enables national consumer scaling beyond pilot limits', 'phase13'),
  ('EDGE_SELF_SERVICE_PARTNERS_ENABLED',       'Self-Service Partner Registration',false, 'Enables partner self-registration flow', 'phase13'),
  ('EDGE_SELF_SERVICE_API_ENABLED',            'Self-Service API Clients',         false, 'Partners can create API clients without manual review', 'phase13'),
  ('EDGE_SELF_SERVICE_WIDGETS_ENABLED',        'Self-Service Widgets',             false, 'Partners can create widgets without manual review', 'phase13'),
  ('EDGE_PARTNER_TRIALS_ENABLED',              'Partner Trials',                   false, 'Time/usage-limited partner trial plans', 'phase13'),
  ('EDGE_AUTOMATED_TENANT_PROVISIONING_ENABLED','Automated Tenant Provisioning',   false, 'Auto-provision tenants after partner approval', 'phase13'),
  ('EDGE_B2B_AUTOMATED_BILLING_ENABLED',       'B2B Automated Billing',            false, 'Automated invoice generation for B2B subscriptions', 'phase13'),
  ('EDGE_USAGE_BASED_BILLING_ENABLED',         'Usage-Based Billing',              false, 'Metered usage overage billing', 'phase13'),
  ('EDGE_REGIONAL_MARKETS_ENABLED',            'Regional Markets',                 false, 'Multi-market configuration and localization', 'phase13'),
  ('EDGE_MULTI_CURRENCY_ENABLED',              'Multi-Currency',                   false, 'Multi-currency pricing and invoicing', 'phase13'),
  ('EDGE_REGIONAL_PAYMENTS_ENABLED',           'Regional Payment Providers',       false, 'Non-KE payment provider routing', 'phase13'),
  ('EDGE_CUSTOMER_SUCCESS_ENABLED',            'Customer Success System',          false, 'CS accounts, health scoring and renewal forecasting', 'phase13'),
  ('EDGE_REVENUE_RETENTION_ENABLED',           'Revenue Retention Reporting',      false, 'GRR/NRR and consumer renewal tracking', 'phase13'),
  ('EDGE_PORTFOLIO_OPTIMIZATION_ENABLED',      'Portfolio Optimization',           false, 'Competition/product/partner portfolio management', 'phase13'),
  ('EDGE_CAPITAL_ALLOCATION_ENABLED',          'Capital Allocation Framework',     false, 'Investment proposals and payback scoring', 'phase13'),
  ('EDGE_SALES_AUTOMATION_ENABLED',            'Sales Operations Automation',      false, 'Stage-gated sales pipeline and forecasting', 'phase13')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 17. INDEXES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_portfolio_type ON portfolio_items(portfolio_type);
CREATE INDEX IF NOT EXISTS idx_portfolio_status ON portfolio_items(current_status);
CREATE INDEX IF NOT EXISTS idx_market_assessments_country ON market_readiness_assessments(country_code);
CREATE INDEX IF NOT EXISTS idx_market_assessments_status ON market_readiness_assessments(status);
CREATE INDEX IF NOT EXISTS idx_cs_accounts_lifecycle ON customer_success_accounts(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_cs_accounts_health ON customer_success_accounts(health_label);
CREATE INDEX IF NOT EXISTS idx_investment_proposals_status ON investment_proposals(status);
CREATE INDEX IF NOT EXISTS idx_capacity_snapshots_period ON operational_capacity_snapshots(period);
