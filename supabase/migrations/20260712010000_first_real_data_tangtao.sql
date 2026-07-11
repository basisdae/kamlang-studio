-- First Real Data Setup — ตั้งเตา
-- Archive seed UUIDs only + insert 39 real catalog rows
-- Safe: does not drop schema, does not touch activity logs, does not delete non-seed rows

begin;

-- ---------------------------------------------------------------------------
-- 1) Detach POS decision group (seed sample)
-- ---------------------------------------------------------------------------
update public.bi_asset_decision_groups
set selected_asset_id = null,
    updated_at = timezone('utc', now())
where id = '22222222-2222-2222-2222-222222222201'
  and workspace_id = '11111111-1111-1111-1111-111111111111';

update public.bi_assets
set decision_group_id = null,
    updated_at = timezone('utc', now())
where workspace_id = '11111111-1111-1111-1111-111111111111'
  and decision_group_id = '22222222-2222-2222-2222-222222222201';

-- ---------------------------------------------------------------------------
-- 2) Archive seed assets (confirmed seed UUIDs only)
-- ---------------------------------------------------------------------------
update public.bi_assets
set is_archived = true,
    notes = coalesce(notes, '') || case
      when coalesce(notes, '') = '' then '[archived seed]'
      when notes like '%[archived seed]%' then ''
      else E'\n[archived seed]'
    end,
    updated_at = timezone('utc', now())
where workspace_id = '11111111-1111-1111-1111-111111111111'
  and id in (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0008',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0009',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0011',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0012',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0013',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0014',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0015',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa00a1',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa00a2'
  );

-- ---------------------------------------------------------------------------
-- 3) Remove seed purchases + seed budget lines (seed IDs only)
-- ---------------------------------------------------------------------------
delete from public.bi_asset_purchases
where workspace_id = '11111111-1111-1111-1111-111111111111'
  and id in (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002'
  );

delete from public.bi_budget_items
where workspace_id = '11111111-1111-1111-1111-111111111111'
  and id in (
    'cccccccc-cccc-cccc-cccc-cccccccc0001',
    'cccccccc-cccc-cccc-cccc-cccccccc0002',
    'cccccccc-cccc-cccc-cccc-cccccccc0003',
    'cccccccc-cccc-cccc-cccc-cccccccc0008',
    'cccccccc-cccc-cccc-cccc-cccccccc0010'
  );

delete from public.bi_asset_decision_groups
where workspace_id = '11111111-1111-1111-1111-111111111111'
  and id = '22222222-2222-2222-2222-222222222201';

-- ---------------------------------------------------------------------------
-- 4) Insert 39 real catalog rows (idempotent upsert by fixed UUID)
-- IDs: eeeeeeee-eeee-eeee-eeee-eeeeeeee00xx
-- ---------------------------------------------------------------------------
insert into public.bi_assets (
  id, workspace_id, name, category, brand, model, quantity, unit,
  estimated_unit_price, actual_unit_price, supplier_name, purchase_channel,
  purchase_url, priority, status, purchase_date, specifications, notes,
  warranty_months, warranty_expires_at, serial_number, decision_group_id, is_archived
) values
-- D ซอสและเครื่องปรุง (1–8)
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0001','11111111-1111-1111-1111-111111111111','ซอสมะเขือเทศโรซ่า','ซอสและเครื่องปรุง','โรซ่า',null,1,'ขวด',30,null,'แม็คโคร / ร้านเบเกอรี่','store',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 30 บาท',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0002','11111111-1111-1111-1111-111111111111','ซอสพริกโรซ่า','ซอสและเครื่องปรุง','โรซ่า',null,1,'ขวด',30,null,'แม็คโคร / ร้านเบเกอรี่','store',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 30 บาท',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0003','11111111-1111-1111-1111-111111111111','มายองเนสกลิ่นชีส aro','ซอสและเครื่องปรุง','aro',null,1,'ขวด',120,null,'แม็คโคร','store',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 120 บาท',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0004','11111111-1111-1111-1111-111111111111','ซอสพิซซ่า เพียวฟู้ดส์','ซอสและเครื่องปรุง','เพียวฟู้ดส์',null,1,'ขวด',89,null,'แม็คโคร / ร้านเบเกอรี่','store',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 89 บาท',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0005','11111111-1111-1111-1111-111111111111','มายองเนส Best Foods','ซอสและเครื่องปรุง','Best Foods',null,1,'ขวด',62,null,'แม็คโคร / ร้านเบเกอรี่','store',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 62 บาท',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0006','11111111-1111-1111-1111-111111111111','นูเทลล่า','ซอสและเครื่องปรุง','Nutella',null,1,'ชิ้น',1000,null,'แม็คโคร / Shopee','store',null,'must','planned',null,'{"note":"ขนาดมีผลต่อราคา"}'::jsonb,'ช่วงราคาประมาณ 139–1,000+ บาท · ใช้สูงสุด 1,000 เป็นงบประมาณเผื่อ · ขนาดสินค้ามีผลต่อราคา',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0007','11111111-1111-1111-1111-111111111111','น้ำพริกเผา aro','ซอสและเครื่องปรุง','aro',null,1,'กระปุก',null,null,'แม็คโคร','store',null,'must','planned',null,'{}'::jsonb,'ราคายังไม่ระบุในภาพ',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0008','11111111-1111-1111-1111-111111111111','แยมมะนาว','ซอสและเครื่องปรุง',null,null,1,'กระปุก',null,null,'แม็คโคร','store',null,'must','planned',null,'{}'::jsonb,'ราคายังไม่ระบุในภาพ · สูตรผสมน้ำพริกเผา: น้ำพริกเผา aro 150 กรัม ผสมกับแยมมะนาว 50 กรัม คนให้เข้ากัน',null,null,null,null,false),
-- D เนื้อสัตว์และของแปรรูป (9–14)
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0009','11111111-1111-1111-1111-111111111111','ไส้กรอกแฟรงค์หนังกรอบ aro','เนื้อสัตว์และของแปรรูป','aro',null,1,'แพ็ค',139,null,'แม็คโคร','store',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 139 บาท',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0010','11111111-1111-1111-1111-111111111111','แฮมหมู P.P. Food','เนื้อสัตว์และของแปรรูป','P.P. Food',null,1,'แพ็ค',80,null,'แม็คโคร','store',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 80 บาท',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0011','11111111-1111-1111-1111-111111111111','เบคอน aro','เนื้อสัตว์และของแปรรูป','aro',null,1,'แพ็ค',89,null,'แม็คโคร','store',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 89 บาท',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0012','11111111-1111-1111-1111-111111111111','ไข่กุ้ง aro','เนื้อสัตว์และของแปรรูป','aro',null,1,'แพ็ค',289,null,'แม็คโคร','store',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 289 บาท',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0013','11111111-1111-1111-1111-111111111111','เบคอนแผ่นสไลซ์ BMP','เนื้อสัตว์และของแปรรูป','BMP',null,1,'แพ็ค',159,null,'แม็คโคร','store',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 159 บาท',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0014','11111111-1111-1111-1111-111111111111','ไข่นกกระทา aro','เนื้อสัตว์และของแปรรูป','aro',null,1,'แพ็ค',159,null,'แม็คโคร','store',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 159 บาท',null,null,null,null,false),
-- D วัตถุดิบเพิ่มเติม (15–20)
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0015','11111111-1111-1111-1111-111111111111','หมูหยองจีนเชียง','วัตถุดิบเพิ่มเติม',null,null,1,'กิโลกรัม',370,null,'Shopee','marketplace',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 370 บาท/กิโลกรัม',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0016','11111111-1111-1111-1111-111111111111','ฝอยทอง','วัตถุดิบเพิ่มเติม',null,null,1,'กิโลกรัม',180,null,'Shopee','marketplace',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 180 บาท/กิโลกรัม',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0017','11111111-1111-1111-1111-111111111111','ข้าวโพดต้ม','วัตถุดิบเพิ่มเติม',null,null,1,'ฝัก',15,null,'แม็คโคร / ตลาดสด','store',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 15 บาท/ฝัก',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0018','11111111-1111-1111-1111-111111111111','มะพร้าวอ่อน','วัตถุดิบเพิ่มเติม',null,null,1,'กิโลกรัม',120,null,'ตลาดสด','store',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 120 บาท/กิโลกรัม',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0019','11111111-1111-1111-1111-111111111111','เผือกต้ม / มันม่วงนึ่ง หั่นเอง','วัตถุดิบเพิ่มเติม',null,null,1,'กิโลกรัม',100,null,'แม็คโคร / ตลาดสด','store',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 100 บาท/กิโลกรัม',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0020','11111111-1111-1111-1111-111111111111','ช็อกโกแลตชิพ Bake Master','วัตถุดิบเพิ่มเติม','Bake Master',null,1,'กิโลกรัม',190,null,'ร้านเบเกอรี่','store',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 190 บาท/กิโลกรัม',null,null,null,null,false),
-- E อุปกรณ์ผสมแป้ง (21–29) · กระปุกเก็บแป้ง = รายการเดียว ไม่ซ้ำ
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0021','11111111-1111-1111-1111-111111111111','ชามผสมสแตนเลส ขนาด 30 ซม.','อุปกรณ์ผสมแป้ง',null,null,3,'ใบ',80,null,'Shopee / แม็คโคร','store',null,'must','planned',null,'{"size":"30 ซม.","material":"สแตนเลส"}'::jsonb,'ราคาประมาณ 80 บาท · ตามภาพ 2–3 ใบ',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0022','11111111-1111-1111-1111-111111111111','ตะกร้อมือขนาดใหญ่','อุปกรณ์ผสมแป้ง',null,null,1,'ชิ้น',90,null,'Shopee / แม็คโคร','store',null,'must','in_use',null,'{}'::jsonb,'ราคาประมาณ 90 บาท · มีแล้ว',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0023','11111111-1111-1111-1111-111111111111','ตะกร้อไฟฟ้า','อุปกรณ์ผสมแป้ง',null,null,1,'เครื่อง',900,null,'Shopee / แม็คโคร','marketplace',null,'must','in_use',null,'{}'::jsonb,'ราคาประมาณ 900 บาท · มีแล้ว',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0024','11111111-1111-1111-1111-111111111111','กระชอนร่อนแป้ง','อุปกรณ์ผสมแป้ง',null,null,1,'ชิ้น',55,null,'Shopee / แม็คโคร','store',null,'must','in_use',null,'{}'::jsonb,'ราคาประมาณ 55 บาท · มีแล้ว',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0025','11111111-1111-1111-1111-111111111111','เครื่องชั่งดิจิทัล','อุปกรณ์ผสมแป้ง',null,null,1,'เครื่อง',900,null,'Shopee / แม็คโคร','marketplace',null,'must','in_use',null,'{}'::jsonb,'ช่วงราคาประมาณ 190–900 บาท · ใช้สูงสุด 900 เป็นงบประมาณเผื่อ · มีแล้ว',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0026','11111111-1111-1111-1111-111111111111','เหยือกตวง 2,000 ml','อุปกรณ์ผสมแป้ง',null,null,1,'ใบ',39,null,'Shopee / แม็คโคร','store',null,'must','planned',null,'{"size":"2,000 ml"}'::jsonb,'ราคาประมาณ 39 บาท',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0027','11111111-1111-1111-1111-111111111111','ช้อนตวง','อุปกรณ์ผสมแป้ง',null,null,1,'ชุด',100,null,'Shopee / ร้านเบเกอรี่','store',null,'must','planned',null,'{}'::jsonb,'ช่วงราคาประมาณ 20–100 บาท · ใช้สูงสุด 100 เป็นงบประมาณเผื่อ',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0028','11111111-1111-1111-1111-111111111111','พายใหญ่','อุปกรณ์ผสมแป้ง',null,null,1,'ชิ้น',50,null,'Shopee / ร้านเบเกอรี่','store',null,'must','in_use',null,'{}'::jsonb,'ราคาประมาณ 50 บาท · มีแล้ว',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0029','11111111-1111-1111-1111-111111111111','กระปุกเก็บแป้ง ขนาด 2,900–3,000 ml','อุปกรณ์ผสมแป้ง',null,null,1,'ใบ',100,null,'Shopee / ร้านเบเกอรี่','store',null,'must','planned',null,'{"size":"2,900–3,000 ml","uses":["ผสมแป้ง","ทำขนมโตเกียว"]}'::jsonb,'ช่วงราคาประมาณ 79–100 บาท · ใช้สูงสุด 100 · ใช้ร่วมหมวดผสมแป้งและทำขนมโตเกียว (ไม่ Duplicate)',null,null,null,null,false),
-- F อุปกรณ์ทำขนมโตเกียว (30–39) · ไม่ซ้ำกระปุก
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0030','11111111-1111-1111-1111-111111111111','เตาโตเกียว ขนาด 15 × 24 นิ้ว','อุปกรณ์ทำขนมโตเกียว',null,null,1,'เครื่อง',3000,null,'ช่องทางออนไลน์','online',null,'must','planned',null,'{"size":"15 × 24 นิ้ว"}'::jsonb,'ช่วงราคาประมาณ 2,700–3,000 บาท · ใช้สูงสุด 3,000 เป็นงบประมาณเผื่อ · ต้องจัดหา',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0031','11111111-1111-1111-1111-111111111111','ถังแก๊ส 15 กก.','อุปกรณ์ทำขนมโตเกียว',null,'15 กก.',1,'ถัง',2700,null,'ร้านขายแก๊ส','store',null,'must','planned',null,'{"size":"15 กก."}'::jsonb,'ราคา 2,700 บาท (ตัวเลขแดงบนภาพ = ราคา ไม่ใช่มีแล้ว) · ต้องจัดหา',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0032','11111111-1111-1111-1111-111111111111','กระบอกแบ่งแป้ง 400/500 ml','อุปกรณ์ทำขนมโตเกียว',null,null,1,'ชิ้น',200,null,'Shopee / ร้านเบเกอรี่','store',null,'must','in_use',null,'{"size":"400/500 ml"}'::jsonb,'ช่วงราคาประมาณ 20–200 บาท · ใช้สูงสุด 200 · มีแล้ว',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0033','11111111-1111-1111-1111-111111111111','กระบอกม้วนโตเกียว ขนาด 2.6 × 10.5 นิ้ว','อุปกรณ์ทำขนมโตเกียว',null,null,1,'ชิ้น',39,null,'Shopee / ร้านเบเกอรี่','store',null,'must','planned',null,'{"size":"2.6 × 10.5 นิ้ว"}'::jsonb,'ราคาประมาณ 39 บาท',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0034','11111111-1111-1111-1111-111111111111','ขวดลายเส้น','อุปกรณ์ทำขนมโตเกียว',null,null,1,'ชิ้น',20,null,'Shopee / แม็คโคร','store',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 20 บาท',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0035','11111111-1111-1111-1111-111111111111','ขวดซอส','อุปกรณ์ทำขนมโตเกียว',null,null,1,'ชิ้น',20,null,'Shopee / แม็คโคร','store',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 20 บาท',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0036','11111111-1111-1111-1111-111111111111','ตะแกรงพักขนม','อุปกรณ์ทำขนมโตเกียว',null,null,1,'ใบ',59,null,'Shopee / ร้านเบเกอรี่','store',null,'must','planned',null,'{}'::jsonb,'ราคาประมาณ 59 บาท',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0037','11111111-1111-1111-1111-111111111111','กล่องพลาสติกเก็บไส้','อุปกรณ์ทำขนมโตเกียว',null,null,1,'ใบ',50,null,'Shopee / แม็คโคร','store',null,'must','in_use',null,'{"material":"พลาสติก"}'::jsonb,'ช่วงราคาประมาณ 20–50 บาท · ใช้สูงสุด 50 · มีแล้ว',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0038','11111111-1111-1111-1111-111111111111','ถุงมือพลาสติก','อุปกรณ์ทำขนมโตเกียว',null,null,1,'กล่อง',100,null,'Shopee / แม็คโคร','store',null,'must','planned',null,'{}'::jsonb,'ช่วงราคาประมาณ 10–100 บาท · ใช้สูงสุด 100 เป็นงบประมาณเผื่อ',null,null,null,null,false),
('eeeeeeee-eeee-eeee-eeee-eeeeeeee0039','11111111-1111-1111-1111-111111111111','เกรียง','อุปกรณ์ทำขนมโตเกียว',null,null,1,'ชิ้น',100,null,'Shopee / ร้านเบเกอรี่','store',null,'must','in_use',null,'{}'::jsonb,'ช่วงราคาประมาณ 89–100 บาท · ใช้สูงสุด 100 · มีแล้ว',null,null,null,null,false)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  brand = excluded.brand,
  model = excluded.model,
  quantity = excluded.quantity,
  unit = excluded.unit,
  estimated_unit_price = excluded.estimated_unit_price,
  actual_unit_price = excluded.actual_unit_price,
  supplier_name = excluded.supplier_name,
  purchase_channel = excluded.purchase_channel,
  priority = excluded.priority,
  status = excluded.status,
  specifications = excluded.specifications,
  notes = excluded.notes,
  is_archived = false,
  decision_group_id = null,
  updated_at = timezone('utc', now());

-- ---------------------------------------------------------------------------
-- 5) Budget lines from real assets only (actual_amount null → ซื้อจริง 0)
-- IDs: ffffffff-ffff-ffff-ffff-ffffffffff00xx matching asset 00xx
-- ---------------------------------------------------------------------------
insert into public.bi_budget_items (
  id, workspace_id, asset_id, decision_group_id, name, category,
  planned_amount, actual_amount, priority, status, notes
)
select
  ('ffffffff-ffff-ffff-ffff-ffffeeee' || right(a.id::text, 4))::uuid,
  a.workspace_id,
  a.id,
  null,
  a.name,
  a.category,
  case
    when a.estimated_unit_price is null then null
    else round((a.estimated_unit_price * a.quantity)::numeric, 2)
  end,
  null,
  a.priority,
  case
    when a.status = 'in_use' then 'received'
    else 'ready_to_buy'
  end,
  coalesce(a.notes, '')
from public.bi_assets a
where a.workspace_id = '11111111-1111-1111-1111-111111111111'
  and a.is_archived = false
  and a.id::text like 'eeeeeeee-eeee-eeee-eeee-eeeeeeee%'
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  asset_id = excluded.asset_id,
  planned_amount = excluded.planned_amount,
  actual_amount = null,
  priority = excluded.priority,
  status = excluded.status,
  notes = excluded.notes,
  updated_at = timezone('utc', now());

commit;