-- Fan Zone Polls Feature (Supabase PostgreSQL Migration)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. FAN ZONE POLLS TABLE
CREATE TABLE IF NOT EXISTS public.fan_zone_polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fan_zone_id TEXT NOT NULL REFERENCES public.fan_zones(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- array of {id, text}
    votes JSONB NOT NULL, -- object: {option_id: count}
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    closes_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active' -- 'active' | 'closed'
);

CREATE INDEX IF NOT EXISTS idx_fan_zone_polls_fan_zone_id ON public.fan_zone_polls(fan_zone_id);
CREATE INDEX IF NOT EXISTS idx_fan_zone_polls_status ON public.fan_zone_polls(status);
CREATE INDEX IF NOT EXISTS idx_fan_zone_polls_closes_at ON public.fan_zone_polls(closes_at);

-- 2. POLL VOTES TABLE (Track individual votes for user history)
CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES public.fan_zone_polls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    option_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(poll_id, user_id) -- One vote per user per poll
);

CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON public.poll_votes(user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.fan_zone_polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;

-- RLS Policies

-- fan_zone_polls: anyone can view, authenticated users can vote
ALTER TABLE public.fan_zone_polls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view polls" ON public.fan_zone_polls;
CREATE POLICY "Anyone can view polls"
    ON public.fan_zone_polls FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Only zone admins can create polls" ON public.fan_zone_polls;
CREATE POLICY "Only zone admins can create polls"
    ON public.fan_zone_polls FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid() AND
            (raw_user_meta_data->>'role' = 'admin' OR raw_user_meta_data->>'role' = 'editor')
        )
    );

DROP POLICY IF EXISTS "Admins can update own polls" ON public.fan_zone_polls;
CREATE POLICY "Admins can update own polls"
    ON public.fan_zone_polls FOR UPDATE
    USING (created_by = auth.uid());

-- poll_votes: anyone authenticated can vote
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view poll votes" ON public.poll_votes;
CREATE POLICY "Anyone can view poll votes"
    ON public.poll_votes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can vote" ON public.poll_votes;
CREATE POLICY "Authenticated users can vote"
    ON public.poll_votes FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
