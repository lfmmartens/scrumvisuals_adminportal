-- ============================================
-- Visual Templates table
-- Run directly on PostgreSQL (MCP bridge blocks DDL)
-- ============================================

CREATE TABLE IF NOT EXISTS visual_templates (
    template_id         VARCHAR(80) PRIMARY KEY,
    display_name        VARCHAR(200) NOT NULL,
    framework_type      VARCHAR(80) NOT NULL,
    category            VARCHAR(40) NOT NULL,
    orientation         VARCHAR(10) NOT NULL DEFAULT 'landscape',
    zone_count          INTEGER DEFAULT 0,
    zone_map            JSONB DEFAULT '[]'::jsonb,
    cloudinary_public_id VARCHAR(255),
    png_url             TEXT,
    svg_url             TEXT,
    thumbnail_url       TEXT,
    tags                TEXT[] DEFAULT '{}',
    notes               TEXT DEFAULT '',
    status              VARCHAR(20) NOT NULL DEFAULT 'draft',
    version             INTEGER DEFAULT 1,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups by framework type + status (used in image generation)
CREATE INDEX IF NOT EXISTS idx_vt_framework_status
    ON visual_templates (framework_type, status);

-- Index for admin portal listing
CREATE INDEX IF NOT EXISTS idx_vt_status
    ON visual_templates (status);

-- ============================================
-- Controlled vocabulary tables (enum management)
-- ============================================

CREATE TABLE IF NOT EXISTS admin_enums (
    enum_type   VARCHAR(40) NOT NULL,  -- 'framework_type', 'category', 'zone_position', 'zone_size', 'zone_role'
    enum_value  VARCHAR(80) NOT NULL,
    sort_order  INTEGER DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (enum_type, enum_value)
);

-- Seed framework types from existing catalog
INSERT INTO admin_enums (enum_type, enum_value, sort_order) VALUES
    ('framework_type', 'sailboat', 1),
    ('framework_type', '4ls', 2),
    ('framework_type', 'starfish', 3),
    ('framework_type', 'mad-sad-glad', 4),
    ('framework_type', 'start-stop-continue', 5),
    ('framework_type', 'hot-air-balloon', 6),
    ('framework_type', 'team-radar', 7),
    ('framework_type', 'futurespective', 8),
    ('framework_type', 'triz', 9),
    ('framework_type', 'circles-soup', 10),
    ('framework_type', 'double-diamond', 11),
    ('framework_type', 'crazy-8s', 12),
    ('framework_type', 'scamper', 13),
    ('framework_type', 'brainwriting', 14),
    ('framework_type', 'how-might-we', 15),
    ('framework_type', 'assumption-mapping', 16),
    ('framework_type', 'lotus-blossom', 17),
    ('framework_type', 'impact-effort-matrix', 18),
    ('framework_type', 'moscow', 19),
    ('framework_type', 'wsjf', 20),
    ('framework_type', 'rice-scoring', 21),
    ('framework_type', 'dot-voting', 22),
    ('framework_type', 'swot', 23),
    ('framework_type', 'business-model-canvas', 24),
    ('framework_type', 'lean-canvas', 25),
    ('framework_type', 'value-proposition-canvas', 26),
    ('framework_type', 'strategy-pyramid', 27),
    ('framework_type', 'growth-horizons', 28),
    ('framework_type', 'wardley-map', 29),
    ('framework_type', 'three-boxes', 30),
    ('framework_type', 'okr-canvas', 31),
    ('framework_type', 'north-star', 32),
    ('framework_type', 'fishbone-ishikawa', 33),
    ('framework_type', 'five-whys', 34),
    ('framework_type', 'pre-mortem', 35),
    ('framework_type', 'a3', 36),
    ('framework_type', 'journey-map', 37),
    ('framework_type', 'customer-touchpoints', 38),
    ('framework_type', 'value-chain', 39),
    ('framework_type', 'value-stream-map', 40),
    ('framework_type', 'user-story-map', 41),
    ('framework_type', 'event-storming', 42),
    ('framework_type', 'kanban-board', 43),
    ('framework_type', 'gap-analysis', 44),
    ('framework_type', 'empathy-map', 45),
    ('framework_type', 'jobs-to-be-done', 46),
    ('framework_type', 'stakeholder-analysis', 47),
    ('framework_type', 'team-canvas', 48),
    ('framework_type', 'personal-maps', 49),
    ('framework_type', 'delegation-poker', 50),
    ('framework_type', 'planning-poker', 51),
    ('framework_type', 'dependency-map', 52),
    ('framework_type', 'now-next-later', 53),
    ('framework_type', '1-2-4-all', 54),
    ('framework_type', 'world-cafe', 55),
    ('framework_type', 'open-space', 56),
    ('framework_type', 'lean-coffee', 57),
    ('framework_type', 'fishbowl', 58),
    ('framework_type', 'data-landscape', 59),
    ('framework_type', 'analytics-maturity', 60),
    ('framework_type', 'data-monetization', 61),
    ('framework_type', 'data-management', 62),
    ('framework_type', 'generative-ai-canvas', 63),
    ('framework_type', 'ai-use-case-canvas', 64),
    ('framework_type', 'value-curve', 65),
    ('framework_type', 'priority-matrix', 66),
    ('framework_type', 'convergent-flow', 67),
    ('framework_type', 'orbit-map', 68)
ON CONFLICT DO NOTHING;

-- Seed categories
INSERT INTO admin_enums (enum_type, enum_value, sort_order) VALUES
    ('category', 'Reflection', 1),
    ('category', 'Ideation', 2),
    ('category', 'Convergent', 3),
    ('category', 'Strategic', 4),
    ('category', 'Causal', 5),
    ('category', 'Flow', 6),
    ('category', 'Empathy', 7),
    ('category', 'Estimation', 8),
    ('category', 'Participation', 9),
    ('category', 'Data & AI', 10)
ON CONFLICT DO NOTHING;

-- Seed zone positions
INSERT INTO admin_enums (enum_type, enum_value, sort_order) VALUES
    ('zone_position', 'top-left', 1),
    ('zone_position', 'top-center', 2),
    ('zone_position', 'top-right', 3),
    ('zone_position', 'center-left', 4),
    ('zone_position', 'center', 5),
    ('zone_position', 'center-right', 6),
    ('zone_position', 'bottom-left', 7),
    ('zone_position', 'bottom-center', 8),
    ('zone_position', 'bottom-right', 9),
    ('zone_position', 'full-width', 10),
    ('zone_position', 'left-column', 11),
    ('zone_position', 'right-column', 12),
    ('zone_position', 'left-half', 13),
    ('zone_position', 'right-half', 14)
ON CONFLICT DO NOTHING;

-- Seed zone sizes
INSERT INTO admin_enums (enum_type, enum_value, sort_order) VALUES
    ('zone_size', 'narrow', 1),
    ('zone_size', 'medium', 2),
    ('zone_size', 'wide', 3),
    ('zone_size', 'full', 4)
ON CONFLICT DO NOTHING;

-- Seed zone roles
INSERT INTO admin_enums (enum_type, enum_value, sort_order) VALUES
    ('zone_role', 'input', 1),
    ('zone_role', 'output', 2),
    ('zone_role', 'reflection', 3),
    ('zone_role', 'friction', 4),
    ('zone_role', 'goal', 5),
    ('zone_role', 'risk', 6),
    ('zone_role', 'action', 7),
    ('zone_role', 'neutral', 8)
ON CONFLICT DO NOTHING;
