-- =============================================================================
-- BallMtaani Edge — Phase 14
-- Cross-Sport Expansion, Marketplace, Corporate Structuring,
-- Institutional Investment and Strategic Exit Readiness
-- =============================================================================

-- ---------------------------------------------------------------------------
-- PART 1: SPORTS REGISTRY & CROSS-SPORT INFRASTRUCTURE
-- ---------------------------------------------------------------------------

CREATE TYPE sport_status AS ENUM (
  'research','internal_beta','public_beta','supported','paused','retired'
);
CREATE TYPE sport_opportunity_status AS ENUM (
  'identified','research','data_review','model_research','commercial_review',
  'internal_pilot','public_beta','active','paused','rejected','retired'
);
CREATE TYPE sport_opportunity_decision AS ENUM (
  'approve_research','approve_internal_pilot','approve_public_beta',
  'activate','defer','reject'
);
CREATE TYPE sport_onboarding_status AS ENUM (
  'discovered','research','data_contract_review','historical_import',
  'identity_modelling','feature_design','baseline_model','walk_forward_backtest',
  'calibration','internal_shadow','internal_beta','public_beta',
  'supported','paused','rejected','retired'
);
CREATE TYPE participant_type AS ENUM ('team','individual','mixed');
CREATE TYPE scoring_type AS ENUM ('goals','points','runs','games','sets','time','other');
CREATE TYPE event_structure AS ENUM ('match','race','tournament','series','league','cup','other');

-- Sports master registry
CREATE TABLE sports (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key                         TEXT UNIQUE NOT NULL,
  name                        TEXT NOT NULL,
  status                      sport_status NOT NULL DEFAULT 'research',
  default_timezone            TEXT NOT NULL DEFAULT 'Africa/Nairobi',
  scoring_type                scoring_type NOT NULL,
  participant_type            participant_type NOT NULL,
  event_structure             event_structure NOT NULL,
  supported_markets           TEXT[] DEFAULT '{}',
  active_model_version        TEXT,
  responsible_use_config      JSONB NOT NULL DEFAULT '{}',
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sport opportunity scorecards (evaluated before any onboarding)
CREATE TABLE sport_opportunities (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_key                   TEXT UNIQUE NOT NULL,
  sport_name                  TEXT NOT NULL,
  target_markets              TEXT[] DEFAULT '{}',
  status                      sport_opportunity_status NOT NULL DEFAULT 'identified',
  audience_score              SMALLINT CHECK (audience_score BETWEEN 0 AND 100),
  data_availability_score     SMALLINT CHECK (data_availability_score BETWEEN 0 AND 100),
  data_quality_score          SMALLINT CHECK (data_quality_score BETWEEN 0 AND 100),
  modelling_feasibility_score SMALLINT CHECK (modelling_feasibility_score BETWEEN 0 AND 100),
  licensing_score             SMALLINT CHECK (licensing_score BETWEEN 0 AND 100),
  payment_score               SMALLINT CHECK (payment_score BETWEEN 0 AND 100),
  competition_score           SMALLINT CHECK (competition_score BETWEEN 0 AND 100),
  partner_demand_score        SMALLINT CHECK (partner_demand_score BETWEEN 0 AND 100),
  revenue_score               SMALLINT CHECK (revenue_score BETWEEN 0 AND 100),
  cost_score                  SMALLINT CHECK (cost_score BETWEEN 0 AND 100),
  strategic_fit_score         SMALLINT CHECK (strategic_fit_score BETWEEN 0 AND 100),
  responsible_use_risk_score  SMALLINT CHECK (responsible_use_risk_score BETWEEN 0 AND 100),
  operating_complexity_score  SMALLINT CHECK (operating_complexity_score BETWEEN 0 AND 100),
  overall_score               SMALLINT GENERATED ALWAYS AS (
    ROUND(
      COALESCE(audience_score,0)              * 0.10 +
      COALESCE(data_availability_score,0)     * 0.12 +
      COALESCE(data_quality_score,0)          * 0.08 +
      COALESCE(modelling_feasibility_score,0) * 0.15 +
      COALESCE(licensing_score,0)             * 0.08 +
      COALESCE(revenue_score,0)               * 0.10 +
      COALESCE(strategic_fit_score,0)         * 0.10 +
      (100 - COALESCE(responsible_use_risk_score,0)) * 0.08 +
      (100 - COALESCE(operating_complexity_score,0)) * 0.07 +
      COALESCE(partner_demand_score,0)        * 0.06 +
      COALESCE(cost_score,0)                  * 0.06
    )::INTEGER
  ) STORED,
  decision                    sport_opportunity_decision,
  notes                       TEXT,
  owner                       TEXT NOT NULL,
  reviewed_at                 TIMESTAMPTZ,
  next_review_at              TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sport onboarding workflow tracking
CREATE TABLE sport_onboarding_workflows (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id                    UUID NOT NULL REFERENCES sports(id),
  status                      sport_onboarding_status NOT NULL DEFAULT 'discovered',
  data_source_key             TEXT,
  data_contract_reference     TEXT,
  historical_seasons_imported INTEGER DEFAULT 0,
  baseline_model_key          TEXT,
  backtest_run_at             TIMESTAMPTZ,
  calibration_run_at          TIMESTAMPTZ,
  performance_ledger_url      TEXT,
  internal_beta_started_at    TIMESTAMPTZ,
  public_beta_started_at      TIMESTAMPTZ,
  blocking_issues             TEXT[],
  owner                       TEXT NOT NULL,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sport-specific model registry (separate from football)
CREATE TABLE sport_model_versions (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id                    UUID NOT NULL REFERENCES sports(id),
  version_key                 TEXT NOT NULL,
  model_type                  TEXT NOT NULL, -- e.g. 'elo','logistic_regression','gradient_boost'
  target_outcome              TEXT NOT NULL, -- e.g. 'home_win','point_spread'
  feature_names               TEXT[] NOT NULL DEFAULT '{}',
  training_seasons            TEXT[],
  val_log_loss                NUMERIC(8,6),
  val_brier_score             NUMERIC(8,6),
  val_calibration_slope       NUMERIC(8,6),
  beats_baseline              BOOLEAN,
  baseline_type               TEXT,
  is_active                   BOOLEAN NOT NULL DEFAULT FALSE,
  released_at                 TIMESTAMPTZ,
  retired_at                  TIMESTAMPTZ,
  notes                       TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_sport_model_one_active
  ON sport_model_versions(sport_id, target_outcome)
  WHERE is_active = TRUE;

-- Multi-sport entitlement keys catalogue
CREATE TABLE sport_entitlement_catalogue (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entitlement_key             TEXT UNIQUE NOT NULL,
  sport_id                    UUID REFERENCES sports(id),
  tier                        TEXT NOT NULL, -- 'basic','premium','all_access'
  description                 TEXT,
  is_active                   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- PART 2: MARKETPLACE
-- ---------------------------------------------------------------------------

CREATE TYPE seller_type AS ENUM (
  'verified_analyst','sports_writer','data_analyst','creator',
  'publisher','media_house','data_provider','ballmtaani_internal','enterprise_partner'
);
CREATE TYPE seller_app_status AS ENUM (
  'draft','submitted','automated_review','manual_review',
  'approved','rejected','suspended','terminated'
);
CREATE TYPE seller_status AS ENUM (
  'active','suspended','terminated','on_review'
);
CREATE TYPE verification_level AS ENUM (
  'none','email_verified','identity_verified','organization_verified',
  'payout_verified','fully_verified'
);
CREATE TYPE product_type AS ENUM (
  'match_preview','statistical_report','competition_report','team_report',
  'historical_dataset','model_report','creator_bundle',
  'publisher_syndication','educational','api_package','widget_package','white_label'
);
CREATE TYPE billing_type AS ENUM (
  'free','one_time','subscription','licence','enterprise_quote'
);
CREATE TYPE delivery_type AS ENUM (
  'article','pdf_report','dashboard','api','widget',
  'data_export','notification_bundle','course'
);
CREATE TYPE product_status AS ENUM (
  'draft','pending_moderation','approved','suspended','retired'
);
CREATE TYPE moderation_status AS ENUM (
  'pending','approved','changes_requested','rejected','suspended','removed'
);
CREATE TYPE order_status AS ENUM (
  'pending','paid','fulfilled','cancelled','refunded',
  'partially_refunded','disputed','reversed'
);
CREATE TYPE earnings_status AS ENUM (
  'pending','available','payable','paid','held','reversed','disputed'
);
CREATE TYPE dispute_category AS ENUM (
  'not_delivered','materially_different','duplicate_charge','unauthorized',
  'misleading_claim','copyright_concern','technical_access_failure','refund_request'
);
CREATE TYPE dispute_status AS ENUM (
  'open','under_review','resolved_accepted','resolved_rejected',
  'adjustment_issued','closed'
);
CREATE TYPE review_moderation_status AS ENUM (
  'pending','approved','removed'
);

-- Seller applications
CREATE TABLE seller_applications (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                       UUID NOT NULL,
  partner_id                    UUID,
  seller_type                   seller_type NOT NULL,
  display_name                  TEXT NOT NULL,
  biography                     TEXT,
  intended_products             TEXT[],
  experience                    TEXT,
  website                       TEXT,
  social_links                  JSONB DEFAULT '{}',
  identity_verification_status  TEXT NOT NULL DEFAULT 'not_started',
  organization_verification_status TEXT NOT NULL DEFAULT 'not_started',
  payout_verification_status    TEXT NOT NULL DEFAULT 'not_started',
  content_review_status         TEXT NOT NULL DEFAULT 'not_started',
  risk_score                    SMALLINT,
  status                        seller_app_status NOT NULL DEFAULT 'draft',
  reviewed_by                   TEXT,
  reviewed_at                   TIMESTAMPTZ,
  rejection_reason              TEXT,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Approved seller profiles (public-facing)
CREATE TABLE marketplace_sellers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE,
  partner_id          UUID,
  display_name        TEXT NOT NULL,
  slug                TEXT UNIQUE NOT NULL,
  seller_type         seller_type NOT NULL,
  status              seller_status NOT NULL DEFAULT 'active',
  verification_level  verification_level NOT NULL DEFAULT 'none',
  biography           TEXT,
  avatar_url          TEXT,
  languages           TEXT[] DEFAULT '{}',
  supported_sports    TEXT[] DEFAULT '{}',
  supported_competitions TEXT[] DEFAULT '{}',
  average_rating      NUMERIC(3,2) DEFAULT 0,
  rating_count        INTEGER DEFAULT 0,
  sales_count         INTEGER DEFAULT 0,
  refund_rate         NUMERIC(5,2) DEFAULT 0,
  dispute_rate        NUMERIC(5,2) DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seller payout profiles (protected — not public)
CREATE TABLE seller_payout_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID NOT NULL UNIQUE REFERENCES marketplace_sellers(id),
  payout_method   TEXT NOT NULL, -- 'mpesa','bank_transfer','partner_account','manual'
  -- Destination details stored as opaque reference to secure vault, not raw
  destination_reference TEXT NOT NULL, -- vault key or masked reference
  currency        TEXT NOT NULL DEFAULT 'KES',
  minimum_payout_minor BIGINT NOT NULL DEFAULT 100000, -- KES 1,000
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Marketplace products
CREATE TABLE marketplace_products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id           UUID NOT NULL REFERENCES marketplace_sellers(id),
  product_type        product_type NOT NULL,
  sport_id            UUID REFERENCES sports(id),
  competition_id      TEXT, -- competition key reference
  title               TEXT NOT NULL,
  slug                TEXT UNIQUE NOT NULL,
  summary             TEXT NOT NULL,
  description         TEXT,
  language            TEXT NOT NULL DEFAULT 'en',
  price_minor         BIGINT NOT NULL DEFAULT 0, -- integer minor units
  currency            TEXT NOT NULL DEFAULT 'KES',
  billing_type        billing_type NOT NULL DEFAULT 'one_time',
  delivery_type       delivery_type NOT NULL,
  entitlement_keys    TEXT[] DEFAULT '{}',
  status              product_status NOT NULL DEFAULT 'draft',
  moderation_status   moderation_status NOT NULL DEFAULT 'pending',
  moderation_notes    TEXT,
  version             INTEGER NOT NULL DEFAULT 1,
  has_performance_claims BOOLEAN NOT NULL DEFAULT FALSE,
  performance_claim_reference TEXT, -- points to auditable record if true
  disclaimer          TEXT NOT NULL DEFAULT 'Statistical analysis only. Outcomes are inherently uncertain.',
  published_at        TIMESTAMPTZ,
  retired_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_guaranteed_claims CHECK (
    title NOT ILIKE '%guaranteed%' AND
    title NOT ILIKE '%sure bet%' AND
    title NOT ILIKE '%fixed match%' AND
    summary NOT ILIKE '%100% accurate%' AND
    summary NOT ILIKE '%never loses%'
  )
);

-- Product versions (preserve history)
CREATE TABLE marketplace_product_versions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          UUID NOT NULL REFERENCES marketplace_products(id),
  version             INTEGER NOT NULL,
  title               TEXT NOT NULL,
  description_reference TEXT,
  content_reference   TEXT,
  price_minor         BIGINT NOT NULL,
  currency            TEXT NOT NULL,
  status              product_status NOT NULL,
  moderation_status   moderation_status NOT NULL DEFAULT 'pending',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, version)
);

-- Marketplace orders
CREATE TABLE marketplace_orders (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_user_id           UUID NOT NULL,
  seller_id               UUID NOT NULL REFERENCES marketplace_sellers(id),
  product_id              UUID NOT NULL REFERENCES marketplace_products(id),
  product_version_id      UUID REFERENCES marketplace_product_versions(id),
  quantity                INTEGER NOT NULL DEFAULT 1,
  unit_price_minor        BIGINT NOT NULL, -- server-validated at checkout
  gross_amount_minor      BIGINT NOT NULL,
  discount_amount_minor   BIGINT NOT NULL DEFAULT 0,
  tax_amount_minor        BIGINT NOT NULL DEFAULT 0,
  total_amount_minor      BIGINT NOT NULL,
  currency                TEXT NOT NULL,
  payment_id              TEXT, -- reference to payments ledger
  status                  order_status NOT NULL DEFAULT 'pending',
  entitlement_granted_at  TIMESTAMPTZ,
  refund_eligible_until   TIMESTAMPTZ, -- computed: order time + refund window
  refunded_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT positive_amounts CHECK (
    unit_price_minor >= 0 AND
    gross_amount_minor >= 0 AND
    total_amount_minor >= 0
  )
);

-- Commission rules
CREATE TABLE marketplace_commission_rules (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_type         seller_type,
  product_type        product_type,
  commission_pct      NUMERIC(5,2) NOT NULL,
  fixed_fee_minor     BIGINT NOT NULL DEFAULT 0,
  currency            TEXT NOT NULL DEFAULT 'KES',
  starts_at           TIMESTAMPTZ NOT NULL,
  ends_at             TIMESTAMPTZ,
  status              TEXT NOT NULL DEFAULT 'active',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seller earnings (immutable ledger entries)
CREATE TABLE marketplace_earnings (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                UUID NOT NULL REFERENCES marketplace_orders(id),
  seller_id               UUID NOT NULL REFERENCES marketplace_sellers(id),
  gross_amount_minor      BIGINT NOT NULL,
  platform_commission_minor BIGINT NOT NULL,
  payment_fee_minor       BIGINT NOT NULL DEFAULT 0,
  tax_withheld_minor      BIGINT NOT NULL DEFAULT 0,
  seller_net_minor        BIGINT NOT NULL,
  currency                TEXT NOT NULL,
  status                  earnings_status NOT NULL DEFAULT 'pending',
  available_at            TIMESTAMPTZ, -- after refund window passes
  paid_at                 TIMESTAMPTZ,
  reversed_at             TIMESTAMPTZ,
  reversal_reason         TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT earnings_reconcile CHECK (
    seller_net_minor = gross_amount_minor - platform_commission_minor - payment_fee_minor - tax_withheld_minor
  )
);

-- Marketplace reviews (verified buyers only)
CREATE TABLE marketplace_reviews (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL REFERENCES marketplace_orders(id),
  buyer_user_id       UUID NOT NULL,
  product_id          UUID NOT NULL REFERENCES marketplace_products(id),
  seller_id           UUID NOT NULL REFERENCES marketplace_sellers(id),
  rating              SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title               TEXT,
  body                TEXT,
  moderation_status   review_moderation_status NOT NULL DEFAULT 'pending',
  seller_response     TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id) -- one review per order
);

-- Marketplace disputes
CREATE TABLE marketplace_disputes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES marketplace_orders(id),
  buyer_user_id   UUID NOT NULL,
  seller_id       UUID NOT NULL REFERENCES marketplace_sellers(id),
  dispute_type    dispute_category NOT NULL,
  description     TEXT NOT NULL,
  status          dispute_status NOT NULL DEFAULT 'open',
  assigned_to     TEXT,
  resolution      TEXT,
  refund_amount_minor BIGINT,
  currency        TEXT,
  opened_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- PART 3: DATA AND MODEL LICENSING
-- ---------------------------------------------------------------------------

CREATE TABLE licensed_products (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key                     TEXT UNIQUE NOT NULL,
  name                    TEXT NOT NULL,
  licence_type            TEXT NOT NULL, -- 'prediction_feed','widget','white_label','data_export'
  sport_id                UUID REFERENCES sports(id),
  market                  TEXT,
  description             TEXT,
  included_data           TEXT[],
  included_model_outputs  TEXT[],
  excluded_data           TEXT[],
  attribution_requirements TEXT NOT NULL,
  pricing_model           TEXT NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'draft', -- 'draft','active','retired'
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE licensing_agreements (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID,
  partner_id              UUID,
  licensed_product_id     UUID NOT NULL REFERENCES licensed_products(id),
  territory               TEXT NOT NULL,
  starts_at               TIMESTAMPTZ NOT NULL,
  ends_at                 TIMESTAMPTZ,
  permitted_use           TEXT NOT NULL,
  prohibited_use          TEXT NOT NULL,
  attribution_terms       TEXT NOT NULL,
  modification_rights     TEXT NOT NULL DEFAULT 'none',
  sublicensing_allowed    BOOLEAN NOT NULL DEFAULT FALSE,
  usage_limits            JSONB DEFAULT '{}',
  fee_minor               BIGINT,
  currency                TEXT DEFAULT 'KES',
  status                  TEXT NOT NULL DEFAULT 'active', -- 'active','suspended','expired','terminated'
  agreement_reference     TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- PART 4: CORPORATE STRUCTURE
-- ---------------------------------------------------------------------------

CREATE TYPE entity_type AS ENUM (
  'operating_company','holding_company','subsidiary',
  'regional_entity','special_purpose_vehicle'
);
CREATE TYPE entity_status AS ENUM (
  'planned','active','dormant','winding_down','dissolved'
);

CREATE TABLE corporate_entities (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name                  TEXT NOT NULL,
  trading_name                TEXT,
  entity_type                 entity_type NOT NULL,
  jurisdiction                TEXT NOT NULL,
  registration_number         TEXT,
  tax_reference               TEXT,
  incorporation_date          DATE,
  status                      entity_status NOT NULL DEFAULT 'planned',
  parent_entity_id            UUID REFERENCES corporate_entities(id),
  registered_address_reference TEXT,
  primary_currency            TEXT NOT NULL DEFAULT 'KES',
  financial_year_end          TEXT, -- e.g. '12-31'
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE shareholders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_or_entity_type TEXT NOT NULL, -- 'individual','company','trust'
  display_name          TEXT NOT NULL,
  legal_reference       TEXT, -- document reference — NOT stored inline
  contact_reference     TEXT,
  status                TEXT NOT NULL DEFAULT 'active',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE share_classes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_entity_id UUID NOT NULL REFERENCES corporate_entities(id),
  name                TEXT NOT NULL,
  class_key           TEXT NOT NULL, -- 'ordinary_a','preference_a'
  voting_rights       TEXT NOT NULL DEFAULT '1_per_share',
  dividend_rights     TEXT,
  liquidation_rights  TEXT,
  conversion_terms    TEXT,
  authorized_shares   BIGINT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (corporate_entity_id, class_key)
);

CREATE TABLE shareholdings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shareholder_id      UUID NOT NULL REFERENCES shareholders(id),
  corporate_entity_id UUID NOT NULL REFERENCES corporate_entities(id),
  share_class_id      UUID NOT NULL REFERENCES share_classes(id),
  shares_held         BIGINT NOT NULL CHECK (shares_held > 0),
  issue_price_minor   BIGINT, -- minor units
  currency            TEXT DEFAULT 'KES',
  issue_date          DATE NOT NULL,
  certificate_reference TEXT,
  status              TEXT NOT NULL DEFAULT 'active', -- 'active','transferred','cancelled'
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE equity_grants (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_entity_id         UUID NOT NULL REFERENCES corporate_entities(id),
  recipient_reference         TEXT NOT NULL, -- vault/HR reference
  grant_type                  TEXT NOT NULL, -- 'option','rsu','advisory_grant','restricted_share'
  share_class_id              UUID REFERENCES share_classes(id),
  total_units                 BIGINT NOT NULL,
  exercise_price_minor        BIGINT,
  currency                    TEXT DEFAULT 'KES',
  grant_date                  DATE NOT NULL,
  vesting_start               DATE NOT NULL,
  vesting_schedule_reference  TEXT,
  cliff_months                SMALLINT DEFAULT 0,
  status                      TEXT NOT NULL DEFAULT 'proposed', -- 'proposed','approved','active','vested','exercised','forfeited','expired'
  approval_reference          TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE convertible_instruments (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_entity_id         UUID NOT NULL REFERENCES corporate_entities(id),
  investor_reference          TEXT NOT NULL,
  instrument_type             TEXT NOT NULL, -- 'convertible_note','safe_like','shareholder_loan','bridge'
  principal_minor             BIGINT NOT NULL,
  currency                    TEXT NOT NULL DEFAULT 'KES',
  issue_date                  DATE NOT NULL,
  maturity_date               DATE,
  interest_rate_pct           NUMERIC(5,3),
  valuation_cap_minor         BIGINT,
  discount_rate_pct           NUMERIC(5,2),
  conversion_terms_reference  TEXT,
  status                      TEXT NOT NULL DEFAULT 'outstanding', -- 'outstanding','converted','repaid','expired','cancelled'
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- PART 5: INTELLECTUAL PROPERTY
-- ---------------------------------------------------------------------------

CREATE TYPE ip_asset_type AS ENUM (
  'source_code','model','dataset','trademark','domain','design',
  'content','documentation','patent_candidate','trade_secret'
);
CREATE TYPE ip_status AS ENUM (
  'active','pending_registration','registered','abandoned','transferred','disputed'
);

CREATE TABLE intellectual_property_assets (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type              ip_asset_type NOT NULL,
  title                   TEXT NOT NULL,
  description             TEXT,
  owner_entity_id         UUID NOT NULL REFERENCES corporate_entities(id),
  creator_reference       TEXT, -- HR/contractor reference
  creation_date           DATE,
  registration_reference  TEXT,
  jurisdiction            TEXT,
  status                  ip_status NOT NULL DEFAULT 'active',
  repository_reference    TEXT,
  assignment_status       TEXT NOT NULL DEFAULT 'unconfirmed', -- 'unconfirmed','assigned','assumed_employment','disputed'
  third_party_components  TEXT[],
  open_source_dependencies TEXT[],
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ip_assignments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_asset_id         UUID NOT NULL REFERENCES intellectual_property_assets(id),
  assignor_reference  TEXT NOT NULL,
  assignee_entity_id  UUID NOT NULL REFERENCES corporate_entities(id),
  assignment_date     DATE NOT NULL,
  agreement_reference TEXT,
  scope               TEXT,
  status              TEXT NOT NULL DEFAULT 'active', -- 'active','superseded','disputed'
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Open-source dependency inventory
CREATE TABLE open_source_inventory (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name        TEXT NOT NULL,
  package_version     TEXT NOT NULL,
  licence             TEXT NOT NULL,
  licence_risk        TEXT NOT NULL DEFAULT 'unknown', -- 'permissive','weak_copyleft','strong_copyleft','unknown','proprietary_restriction'
  usage               TEXT NOT NULL,
  distribution_impact TEXT NOT NULL DEFAULT 'unknown', -- 'none','internal_only','distributed','saas'
  is_modified         BOOLEAN NOT NULL DEFAULT FALSE,
  notice_required     BOOLEAN NOT NULL DEFAULT FALSE,
  source_disclosure_required BOOLEAN NOT NULL DEFAULT FALSE,
  is_flagged          BOOLEAN NOT NULL DEFAULT FALSE,
  flag_reason         TEXT,
  reviewed_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (package_name, package_version)
);

-- ---------------------------------------------------------------------------
-- PART 6: CONTRACT REGISTER
-- ---------------------------------------------------------------------------

CREATE TYPE contract_type AS ENUM (
  'data_provider','payment_provider','telecom','publisher','enterprise',
  'employee','contractor','investor','licensing','software',
  'hosting','marketing','creator'
);
CREATE TYPE contract_status AS ENUM (
  'draft','active','expired','terminated','under_review','disputed'
);

CREATE TABLE material_contracts (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_type           contract_type NOT NULL,
  counterparty            TEXT NOT NULL,
  entity_id               UUID REFERENCES corporate_entities(id),
  title                   TEXT NOT NULL,
  effective_date          DATE,
  expiry_date             DATE,
  renewal_terms           TEXT,
  termination_terms       TEXT,
  has_exclusivity         BOOLEAN NOT NULL DEFAULT FALSE,
  change_of_control_clause TEXT, -- 'consent_required','termination_right','notification_only','none','unknown'
  assignment_restriction  TEXT,
  financial_commitment_minor BIGINT,
  currency                TEXT DEFAULT 'KES',
  contract_reference      TEXT, -- vault/document reference
  status                  contract_status NOT NULL DEFAULT 'active',
  owner                   TEXT,
  review_at               DATE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- PART 7: INVESTOR PIPELINE & CORPORATE INVESTMENT
-- ---------------------------------------------------------------------------

CREATE TYPE investor_status AS ENUM (
  'identified','introduced','initial_meeting','information_shared',
  'active_discussion','diligence','term_sheet','negotiation',
  'committed','closed','paused','declined','lost'
);
CREATE TYPE financing_round_status AS ENUM (
  'planning','preparing','active','soft_circled','first_close',
  'closed','paused','cancelled'
);
CREATE TYPE diligence_status AS ENUM (
  'requested','in_progress','ready','shared','follow_up','closed'
);

CREATE TABLE investor_opportunities (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_name           TEXT NOT NULL,
  investor_type           TEXT NOT NULL, -- 'angel','vc','strategic_media','telecom','sports_tech','cvf','dfi','pe'
  geography               TEXT,
  investment_stage        TEXT,
  typical_ticket_min_minor BIGINT,
  typical_ticket_max_minor BIGINT,
  currency                TEXT DEFAULT 'USD',
  strategic_fit           SMALLINT CHECK (strategic_fit BETWEEN 0 AND 100),
  sector_fit              SMALLINT CHECK (sector_fit BETWEEN 0 AND 100),
  relationship_source     TEXT,
  status                  investor_status NOT NULL DEFAULT 'identified',
  probability             SMALLINT CHECK (probability BETWEEN 0 AND 100),
  proposed_amount_minor   BIGINT,
  proposed_instrument     TEXT,
  investor_fit_score      SMALLINT,
  owner                   TEXT,
  next_action             TEXT,
  next_action_at          TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE financing_rounds (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_entity_id     UUID NOT NULL REFERENCES corporate_entities(id),
  name                    TEXT NOT NULL,
  round_type              TEXT NOT NULL, -- 'pre_seed','seed','series_a','bridge','strategic','revenue_based'
  target_amount_minor     BIGINT NOT NULL,
  currency                TEXT NOT NULL DEFAULT 'USD',
  pre_money_valuation_minor BIGINT,
  post_money_valuation_minor BIGINT,
  instrument_type         TEXT, -- 'equity','convertible_note','safe_like','revenue_based'
  status                  financing_round_status NOT NULL DEFAULT 'planning',
  opened_at               TIMESTAMPTZ,
  target_close_at         TIMESTAMPTZ,
  closed_at               TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE diligence_requests (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_opportunity_id     UUID NOT NULL REFERENCES investor_opportunities(id),
  category                    TEXT NOT NULL, -- 'corporate','legal','product_technical','commercial','financial','data_model','people'
  request                     TEXT NOT NULL,
  priority                    TEXT NOT NULL DEFAULT 'normal', -- 'critical','high','normal','low'
  status                      diligence_status NOT NULL DEFAULT 'requested',
  owner                       TEXT,
  document_reference          TEXT,
  response                    TEXT,
  access_level                TEXT NOT NULL DEFAULT 'standard', -- 'summary','standard','confirmatory','restricted'
  due_at                      TIMESTAMPTZ,
  completed_at                TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- PART 8: STRATEGIC TRANSACTIONS
-- ---------------------------------------------------------------------------

CREATE TABLE strategic_transaction_opportunities (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type        TEXT NOT NULL, -- 'minority_investment','majority_investment','distribution_agreement','joint_venture','technology_licensing','data_licensing','white_label','spin_off','asset_sale','acquisition','merger','mbo'
  counterparty            TEXT NOT NULL,
  strategic_rationale     TEXT NOT NULL,
  proposed_scope          TEXT,
  estimated_value_minor   BIGINT,
  currency                TEXT DEFAULT 'USD',
  control_impact          TEXT, -- 'none','minor','significant','full'
  shareholder_impact      TEXT,
  employee_impact         TEXT,
  customer_impact         TEXT,
  product_impact          TEXT,
  data_impact             TEXT,
  regulatory_complexity   SMALLINT CHECK (regulatory_complexity BETWEEN 0 AND 100),
  execution_complexity    SMALLINT CHECK (execution_complexity BETWEEN 0 AND 100),
  risk_score              SMALLINT CHECK (risk_score BETWEEN 0 AND 100),
  status                  TEXT NOT NULL DEFAULT 'identified',
  owner                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- PART 9: TECHNICAL DEBT REGISTER
-- ---------------------------------------------------------------------------

CREATE TABLE technical_debt_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area            TEXT NOT NULL, -- 'frontend','mobile','api','data','model','infrastructure','security','billing','marketplace','multi_tenant','regional'
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  impact          TEXT NOT NULL, -- 'low','medium','high','critical'
  risk            TEXT NOT NULL,
  effort          TEXT NOT NULL, -- 'small','medium','large','xlarge'
  owner           TEXT,
  target_resolution DATE,
  status          TEXT NOT NULL DEFAULT 'open', -- 'open','in_progress','resolved','accepted_risk'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- PART 10: BOARD RECORDS
-- ---------------------------------------------------------------------------

CREATE TABLE board_meetings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_entity_id UUID NOT NULL REFERENCES corporate_entities(id),
  meeting_date        DATE NOT NULL,
  meeting_type        TEXT NOT NULL, -- 'board','agm','egm','committee'
  agenda_reference    TEXT,
  minutes_reference   TEXT,
  attendees           TEXT[],
  decisions           TEXT[],
  action_items        TEXT[],
  status              TEXT NOT NULL DEFAULT 'draft', -- 'draft','circulated','approved'
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE board_resolutions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_entity_id UUID NOT NULL REFERENCES corporate_entities(id),
  resolution_type     TEXT NOT NULL,
  title               TEXT NOT NULL,
  text_reference      TEXT,
  approved_at         TIMESTAMPTZ NOT NULL,
  approvers           TEXT[],
  effective_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- PART 11: FEATURE FLAGS — Phase 14
-- ---------------------------------------------------------------------------

INSERT INTO edge_feature_flags (key, description, enabled) VALUES
  ('EDGE_CROSS_SPORT_ENABLED',           'Enable multi-sport infrastructure and navigation',         FALSE),
  ('EDGE_BASKETBALL_RESEARCH_ENABLED',   'Enable basketball opportunity research and data import',   FALSE),
  ('EDGE_RUGBY_RESEARCH_ENABLED',        'Enable rugby opportunity research and data import',        FALSE),
  ('EDGE_CRICKET_RESEARCH_ENABLED',      'Enable cricket opportunity research and data import',      FALSE),
  ('EDGE_TENNIS_RESEARCH_ENABLED',       'Enable tennis opportunity research and data import',       FALSE),
  ('EDGE_MULTI_SPORT_PLANS_ENABLED',     'Enable multi-sport plan catalogue (Weekend Pass, All-Sports Pro)', FALSE),
  ('EDGE_MARKETPLACE_ENABLED',           'Enable marketplace public listing',                        FALSE),
  ('EDGE_SELLER_APPLICATIONS_ENABLED',   'Enable seller application submissions',                    FALSE),
  ('EDGE_MARKETPLACE_PAYMENTS_ENABLED',  'Enable marketplace purchase flow and payment',             FALSE),
  ('EDGE_MARKETPLACE_PAYOUTS_ENABLED',   'Enable seller payout processing',                         FALSE),
  ('EDGE_DATA_LICENSING_ENABLED',        'Enable data licensing product records',                    FALSE),
  ('EDGE_MODEL_LICENSING_ENABLED',       'Enable model licensing product records',                   FALSE),
  ('EDGE_CORPORATE_RECORDS_ENABLED',     'Enable corporate entity and shareholder records (internal)', FALSE),
  ('EDGE_CAP_TABLE_ENABLED',             'Enable cap table and share registry (restricted)',         FALSE),
  ('EDGE_IP_REGISTER_ENABLED',           'Enable IP asset and assignment registry',                  FALSE),
  ('EDGE_INVESTOR_PIPELINE_ENABLED',     'Enable investor opportunity pipeline (restricted)',        FALSE),
  ('EDGE_INVESTOR_DATA_ROOM_ENABLED',    'Enable investor data room with access controls',           FALSE),
  ('EDGE_STRATEGIC_TRANSACTIONS_ENABLED','Enable strategic transaction scorecards (restricted)',     FALSE),
  ('EDGE_EXIT_READINESS_ENABLED',        'Enable exit readiness scorecard',                          FALSE)
ON CONFLICT (key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- PART 12: INDEXES
-- ---------------------------------------------------------------------------

CREATE INDEX idx_sport_opportunities_status ON sport_opportunities(status);
CREATE INDEX idx_sport_onboarding_sport_id ON sport_onboarding_workflows(sport_id);
CREATE INDEX idx_seller_apps_status ON seller_applications(status);
CREATE INDEX idx_marketplace_products_status ON marketplace_products(status, moderation_status);
CREATE INDEX idx_marketplace_products_seller ON marketplace_products(seller_id);
CREATE INDEX idx_marketplace_orders_buyer ON marketplace_orders(buyer_user_id);
CREATE INDEX idx_marketplace_earnings_seller ON marketplace_earnings(seller_id, status);
CREATE INDEX idx_marketplace_disputes_status ON marketplace_disputes(status);
CREATE INDEX idx_shareholdings_shareholder ON shareholdings(shareholder_id);
CREATE INDEX idx_shareholdings_entity ON shareholdings(corporate_entity_id);
CREATE INDEX idx_ip_assets_owner ON intellectual_property_assets(owner_entity_id);
CREATE INDEX idx_ip_assignments_asset ON ip_assignments(ip_asset_id);
CREATE INDEX idx_material_contracts_status ON material_contracts(status);
CREATE INDEX idx_investor_opps_status ON investor_opportunities(status);
CREATE INDEX idx_diligence_requests_opp ON diligence_requests(investor_opportunity_id);
CREATE INDEX idx_tech_debt_status ON technical_debt_items(status, impact);

-- ---------------------------------------------------------------------------
-- PART 13: SEED — Initial sport opportunities (evaluated, not approved)
-- ---------------------------------------------------------------------------

INSERT INTO sport_opportunities (sport_key, sport_name, target_markets, status, owner,
  audience_score, data_availability_score, data_quality_score, modelling_feasibility_score,
  licensing_score, payment_score, competition_score, partner_demand_score,
  revenue_score, cost_score, strategic_fit_score, responsible_use_risk_score, operating_complexity_score)
VALUES
  ('basketball', 'Basketball', ARRAY['KE','NG','ZA'], 'data_review', 'Head of Sports Intelligence',
   72, 65, 60, 62, 55, 70, 58, 50, 55, 60, 70, 20, 55),
  ('rugby', 'Rugby', ARRAY['KE','ZA','UG'], 'research', 'Head of Sports Intelligence',
   60, 55, 55, 58, 50, 65, 50, 45, 48, 65, 65, 15, 50),
  ('cricket', 'Cricket', ARRAY['KE','ZA','NG'], 'research', 'Head of Sports Intelligence',
   65, 70, 65, 60, 60, 68, 55, 55, 60, 62, 68, 18, 52),
  ('tennis', 'Tennis', ARRAY['KE','ZA'], 'identified', 'Head of Sports Intelligence',
   50, 75, 70, 72, 65, 62, 55, 35, 50, 55, 55, 15, 48),
  ('athletics', 'Athletics', ARRAY['KE','ET','UG'], 'identified', 'Head of Sports Intelligence',
   68, 45, 40, 35, 40, 60, 40, 30, 35, 50, 72, 12, 45)
ON CONFLICT (sport_key) DO NOTHING;

COMMENT ON TABLE sport_opportunities IS 'Cross-sport opportunity scorecards. Overall score is computed. No sport proceeds to onboarding without decision=approve_research minimum.';
COMMENT ON TABLE marketplace_products IS 'All products subject to moderation. DB constraint prevents guaranteed-outcome language in title/summary.';
COMMENT ON TABLE shareholdings IS 'Shares stored as integer BIGINT units. Never use floating-point percentages as the authoritative ownership record.';
COMMENT ON TABLE marketplace_earnings IS 'CHECK constraint enforces accounting identity: net = gross - commission - fees - tax.';
COMMENT ON TABLE intellectual_property_assets IS 'assignment_status=unconfirmed means ownership is not yet confirmed by an assignment agreement.';
