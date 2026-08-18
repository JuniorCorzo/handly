DO $$
DECLARE
  v_user_id UUID := '9f0595fd-e977-4555-9a49-a11013c4ce68';
  v_org_id UUID;
  v_campaign_1_id UUID := gen_random_uuid();
  v_campaign_2_id UUID := gen_random_uuid();
  v_cp_1_id UUID := gen_random_uuid();
  v_cp_2_id UUID := gen_random_uuid();
  v_need_1_id UUID := gen_random_uuid();
  v_need_2_id UUID := gen_random_uuid();
  v_need_3_id UUID := gen_random_uuid();
BEGIN
  -- 1. Obtener la organización asociada a tu usuario
  SELECT org_id INTO v_org_id 
  FROM public.org_members 
  WHERE auth_user_id = v_user_id 
  LIMIT 1;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró ninguna organización vinculada al usuario % en org_members', v_user_id;
  END IF;

  -- 2. Crear Campañas
  INSERT INTO public.campaign (id, name, organization_id, created_at, updated_at)
  VALUES 
    (v_campaign_1_id, 'Respuesta Emergencia Temporal', v_org_id, NOW(), NOW()),
    (v_campaign_2_id, 'Campaña Invierno y Refugio', v_org_id, NOW(), NOW());

  -- 3. Crear Centros de Acopio vinculados a tu organización
  INSERT INTO public.collection_points (
    id, 
    location_adress, 
    organization_id, 
    latitude, 
    longitude, 
    open_time, 
    close_time, 
    created_at, 
    updated_at
  )
  VALUES 
    (
      v_cp_1_id, 
      'Av. Santa Fe 3200, Palermo, CABA, Argentina', 
      v_org_id, 
      -34.5875, 
      -58.4110, 
      '08:00:00', 
      '20:00:00', 
      NOW(), 
      NOW()
    ),
    (
      v_cp_2_id, 
      'Calle 50 N° 750, La Plata, Buenos Aires, Argentina', 
      v_org_id, 
      -34.9214, 
      -57.9545, 
      '09:00:00', 
      '18:00:00', 
      NOW(), 
      NOW()
    );

  -- 4. Crear Ítems de Necesidad
  INSERT INTO public.need_items (
    id, 
    campaign_id, 
    category, 
    item_name, 
    target_quantity, 
    unit, 
    urgency, 
    status, 
    created_at
  )
  VALUES 
    (
      v_need_1_id, 
      v_campaign_1_id, 
      'Agua y Alimentos', 
      'Bidones de Agua Potable 5L', 
      150, 
      'bidones', 
      'critical_4h', 
      'active', 
      NOW()
    ),
    (
      v_need_2_id, 
      v_campaign_1_id, 
      'Salud y Primeros Auxilios', 
      'Kits de Primeros Auxilios', 
      40, 
      'kits', 
      'urgent_12h', 
      'active', 
      NOW()
    ),
    (
      v_need_3_id, 
      v_campaign_2_id, 
      'Abrigo', 
      'Frazadas térmicas polares', 
      80, 
      'unidades', 
      'standard_24h', 
      'active', 
      NOW()
    );

  -- 5. Vincular Ítems con los Centros de Acopio (Tabla Pivote)
  INSERT INTO public.need_items_collection_points (need_item_id, collection_point_id, created_at)
  VALUES 
    (v_need_1_id, v_cp_1_id, NOW()),
    (v_need_1_id, v_cp_2_id, NOW()),
    (v_need_2_id, v_cp_1_id, NOW()),
    (v_need_3_id, v_cp_2_id, NOW());

END $$;
