-- Mode de fidélité par boutique
ALTER TABLE public.shops 
  ADD COLUMN IF NOT EXISTS loyalty_mode text NOT NULL DEFAULT 'tampons',
  ADD COLUMN IF NOT EXISTS montant_tranche numeric(10,2) NOT NULL DEFAULT 5.00,
  ADD COLUMN IF NOT EXISTS points_par_tranche integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS points_requis integer NOT NULL DEFAULT 100;

-- Validation du mode (tampons ou points)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'shops_loyalty_mode_check'
  ) THEN
    ALTER TABLE public.shops 
      ADD CONSTRAINT shops_loyalty_mode_check 
      CHECK (loyalty_mode IN ('tampons', 'points'));
  END IF;
END$$;

-- Solde de points par client
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS total_points integer NOT NULL DEFAULT 0;

-- Montant d'achat saisi par le client (mode points uniquement)
ALTER TABLE public.stamp_requests
  ADD COLUMN IF NOT EXISTS montant_achat numeric(10,2);

-- Mettre à jour le trigger pour gérer les 2 modes
CREATE OR REPLACE FUNCTION public.handle_stamp_validation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_mode text;
  v_tampons_requis integer;
  v_points_requis integer;
  v_montant_tranche numeric(10,2);
  v_points_par_tranche integer;
  v_points_gagnes integer;
BEGIN
  IF NEW.statut = 'valide' AND OLD.statut = 'en_attente' THEN
    SELECT loyalty_mode, tampons_requis, points_requis, montant_tranche, points_par_tranche
      INTO v_mode, v_tampons_requis, v_points_requis, v_montant_tranche, v_points_par_tranche
    FROM public.shops WHERE id = NEW.shop_id;

    IF v_mode = 'points' THEN
      -- Calcul des points gagnés à partir du montant
      IF NEW.montant_achat IS NULL OR NEW.montant_achat <= 0 OR v_montant_tranche <= 0 THEN
        v_points_gagnes := 0;
      ELSE
        v_points_gagnes := FLOOR(NEW.montant_achat / v_montant_tranche)::integer * v_points_par_tranche;
      END IF;

      UPDATE public.customers
      SET total_points = total_points + v_points_gagnes,
          derniere_visite = now()
      WHERE id = NEW.customer_id;

      -- Récompense atteinte : on retranche les points requis et on incrémente le compteur
      UPDATE public.customers
      SET total_points = total_points - v_points_requis,
          total_recompenses = total_recompenses + 1
      WHERE id = NEW.customer_id AND total_points >= v_points_requis;
    ELSE
      -- Mode tampons (existant)
      UPDATE public.customers
      SET total_tampons = total_tampons + 1,
          derniere_visite = now()
      WHERE id = NEW.customer_id;

      UPDATE public.customers
      SET total_tampons = 0,
          total_recompenses = total_recompenses + 1
      WHERE id = NEW.customer_id AND total_tampons >= v_tampons_requis;
    END IF;

    NEW.validated_at := now();
  END IF;
  RETURN NEW;
END;
$function$;

-- S'assurer que le trigger existe
DROP TRIGGER IF EXISTS stamp_validation_trigger ON public.stamp_requests;
CREATE TRIGGER stamp_validation_trigger
  BEFORE UPDATE ON public.stamp_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_stamp_validation();