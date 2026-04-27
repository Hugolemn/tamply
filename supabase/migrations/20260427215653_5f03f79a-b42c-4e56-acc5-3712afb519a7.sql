-- Enum statut demande
CREATE TYPE public.stamp_status AS ENUM ('en_attente', 'valide', 'refuse');

-- Table shops
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  owner_nom TEXT,
  logo_url TEXT,
  couleur TEXT NOT NULL DEFAULT '#FFD700',
  description_recompense TEXT NOT NULL DEFAULT '1 frite gratuite',
  tampons_requis INTEGER NOT NULL DEFAULT 10,
  stripe_customer_id TEXT,
  statut_abonnement TEXT NOT NULL DEFAULT 'essai',
  trial_end TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table customers
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  numero_telephone TEXT NOT NULL,
  total_tampons INTEGER NOT NULL DEFAULT 0,
  total_recompenses INTEGER NOT NULL DEFAULT 0,
  derniere_visite TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shop_id, numero_telephone)
);

CREATE INDEX idx_customers_shop ON public.customers(shop_id);

-- Table stamp_requests
CREATE TABLE public.stamp_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  numero_telephone TEXT NOT NULL,
  statut public.stamp_status NOT NULL DEFAULT 'en_attente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  validated_at TIMESTAMPTZ
);

CREATE INDEX idx_stamp_requests_shop_status ON public.stamp_requests(shop_id, statut);
CREATE INDEX idx_stamp_requests_customer ON public.stamp_requests(customer_id);

-- Enable RLS
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamp_requests ENABLE ROW LEVEL SECURITY;

-- Policies SHOPS
-- Le gérant gère son shop
CREATE POLICY "owner_select_shop" ON public.shops
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "owner_insert_shop" ON public.shops
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner_update_shop" ON public.shops
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
-- Lecture publique limitée (le client doit pouvoir afficher logo + nom + couleur + récompense via le QR)
CREATE POLICY "public_read_shop" ON public.shops
  FOR SELECT TO anon USING (true);

-- Policies CUSTOMERS
-- Le gérant lit ses clients
CREATE POLICY "owner_select_customers" ON public.customers
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shops s WHERE s.id = shop_id AND s.owner_id = auth.uid()));
CREATE POLICY "owner_update_customers" ON public.customers
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shops s WHERE s.id = shop_id AND s.owner_id = auth.uid()));
-- Le client (anon) peut créer son enregistrement et le relire
CREATE POLICY "public_insert_customer" ON public.customers
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_select_customer" ON public.customers
  FOR SELECT TO anon USING (true);

-- Policies STAMP_REQUESTS
CREATE POLICY "owner_select_requests" ON public.stamp_requests
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shops s WHERE s.id = shop_id AND s.owner_id = auth.uid()));
CREATE POLICY "owner_update_requests" ON public.stamp_requests
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shops s WHERE s.id = shop_id AND s.owner_id = auth.uid()));
-- Le client (anon) peut créer une demande et la suivre
CREATE POLICY "public_insert_request" ON public.stamp_requests
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_select_request" ON public.stamp_requests
  FOR SELECT TO anon USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.stamp_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;

-- Trigger : à la validation, incrémente les compteurs et gère la récompense
CREATE OR REPLACE FUNCTION public.handle_stamp_validation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_required INTEGER;
BEGIN
  IF NEW.statut = 'valide' AND OLD.statut = 'en_attente' THEN
    SELECT tampons_requis INTO v_required FROM public.shops WHERE id = NEW.shop_id;

    UPDATE public.customers
    SET total_tampons = total_tampons + 1,
        derniere_visite = now()
    WHERE id = NEW.customer_id;

    -- Si la carte est complète, on offre la récompense et on remet à 0
    UPDATE public.customers
    SET total_tampons = 0,
        total_recompenses = total_recompenses + 1
    WHERE id = NEW.customer_id AND total_tampons >= v_required;

    NEW.validated_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_stamp_validation
BEFORE UPDATE ON public.stamp_requests
FOR EACH ROW EXECUTE FUNCTION public.handle_stamp_validation();