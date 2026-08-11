CREATE TABLE IF NOT EXISTS public.validated_saas_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subreddit TEXT NOT NULL,
    idea_name TEXT NOT NULL,
    problem TEXT NOT NULL,
    demand_level TEXT NOT NULL CHECK (demand_level IN ('Low', 'Medium', 'High')),
    existing_solutions JSONB DEFAULT '[]'::jsonb,
    similar_competitors JSONB DEFAULT '[]'::jsonb,
    user_complaints JSONB DEFAULT '[]'::jsonb,
    opportunity TEXT NOT NULL,
    monetization_model TEXT NOT NULL,
    pricing_hint TEXT NOT NULL,
    revenue_potential TEXT NOT NULL,
    go_to_market TEXT NOT NULL,
    score NUMERIC NOT NULL,
    verdict TEXT NOT NULL CHECK (verdict IN ('Weak', 'Decent', 'Strong')),
    source_threads JSONB NOT NULL DEFAULT '[]'::jsonb,
    analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.validated_saas_ideas ENABLE ROW LEVEL SECURITY;

-- Allow public read access to validated SaaS ideas
CREATE POLICY "Allow public read access to validated SaaS ideas"
    ON public.validated_saas_ideas
    FOR SELECT
    USING (true);

-- Allow insert access to validated SaaS ideas
CREATE POLICY "Allow insert access to validated SaaS ideas"
    ON public.validated_saas_ideas
    FOR INSERT
    WITH CHECK (true);

-- Grant privileges to anon and authenticated roles
GRANT SELECT, INSERT ON TABLE public.validated_saas_ideas TO anon, authenticated;
