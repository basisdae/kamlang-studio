# Restaurant Language Guide V1

Natural Thai copy for restaurant owners, cooks, and kitchen staff.  
**Scope:** display strings only — no business logic or UI layout changes.

---

## Principles

1. **Speak like a kitchen**, not like ERP software.
2. **Prefer verbs owners use daily:** วางแผน, ซื้อของ, เตรียม, ผลิต, เช็คของ.
3. **Avoid:** workspace, notification, import/export jargon, `localStorage`, `JSON`, `demo`, raw `id`, English product labels in Thai UI.
4. **Keep industry terms when owners know them:** สต๊อก (nav shortcut), เป้ากำไร, แบบร่าง, รายการสั่งล่วงหน้า.

---

## Canonical terms (use consistently)

| Avoid (ERP / technical) | Use instead |
|-------------------------|-------------|
| Workspace / ready state label | **พร้อมเปิดร้าน** |
| Today's Area / รายละเอียดวันนี้ | **งานวันนี้** |
| Menu Today | **รายการสั่งล่วงหน้า** |
| Notification / การแจ้งเตือน | **สิ่งที่ต้องจัดการ** |
| Complete (status) | **เสร็จแล้ว** |
| Draft (status) | **แบบร่าง** |
| Standard recipe/menu | **สูตรตัวอย่าง** / **เมนูตัวอย่าง** |
| Saved menu | **เมนูของคุณ** |
| Draft recipe section | **สูตรที่ยังไม่เสร็จ** |
| Activity / กิจกรรม | **บันทึกล่าสุด** |
| Import / นำเข้าข้อมูล | **โหลดจาก Excel** / **บันทึกลงร้าน** |
| Export backup | **ดาวน์โหลดไฟล์สำรอง** |
| Restore / กู้คืน | **เอาข้อมูลกลับมา** |
| GP เป้าหมาย | **เป้ากำไร (%)** |
| Food Cost | **สัดส่วนต้นทุนอาหาร** |
| Packaging (label) | **บรรจุภัณฑ์** |
| แพ็กเกจ | **บรรจุภัณฑ์** |
| หักสต๊อก / รับเข้าสต๊อก | **หักของ** / **เอาเข้าครัว** |
| สต๊อก (long copy) | **ของในครัว** / **ของที่เหลือ** |
| สถานะการผลิต | **ขั้นตอนวันนี้** |
| เปิดหน้าพนักงาน | **เปิดงานครัววันนี้** |
| KL Builder (browser title) | **กำลัง...บิ้วเด้อ** |

---

## Wording changes by area

### Home (`app/home/`)

| Before | After | Location |
|--------|-------|----------|
| เช็คสต๊อก | ดูของที่เหลือ | `copy.ts` → stock CTA |
| แจ้งเตือน | สิ่งที่ต้องจัดการ | `HomeNotificationBadge.tsx` |
| รายละเอียดวันนี้ | งานวันนี้ | `HomeTodayPage.tsx` aria-label |
| เปิดหน้าพนักงาน | เปิดงานครัววันนี้ | `HomeStaffViewLink.tsx` |

### Production (`app/production/`)

| Before | After | Location |
|--------|-------|----------|
| ผลิตแล้ว (status) | เสร็จแล้ว | `copy.ts` |
| วัตถุดิบที่ต้องเตรียม | ของที่ต้องเตรียม | `copy.ts` |
| แพ็กเกจที่ต้องเตรียม | บรรจุภัณฑ์ที่ต้องเตรียม | `copy.ts` |
| สถานะการผลิต | ขั้นตอนวันนี้ | `copy.ts` |
| เป้าผลิตและสถานะงานวันนี้ | เมนูที่ต้องทำและความคืบหน้าวันนี้ | `page.tsx` |
| สถานะ | ขั้นตอน | `ProductionHero.tsx` |
| หักสต๊อกแล้ว | หักของแล้ว | `ProductionTodayHeader`, `ProductionDeductedBanner` |
| ยืนยันหักสต๊อก | ยืนยันหักของ | `ProductionDeductConfirmSheet.tsx` |
| สต๊อกไม่พอ — หักไม่ได้ | ของไม่พอ — หักไม่ได้ | `ProductionDeductConfirmSheet.tsx` |
| แผนผลิตนี้หักสต๊อกไปแล้ว | แผนนี้หักของในครัวไปแล้ว | `page.tsx`, banner |

### Today / kitchen (`app/today/`)

| Before | After | Location |
|--------|-------|----------|
| ไม่มีแพ็กเกจในแผนวันนี้ | ไม่มีบรรจุภัณฑ์ในแผนวันนี้ | `page.tsx` |

### Notifications (`app/notifications/`, `notificationService.ts`)

| Before | After | Location |
|--------|-------|----------|
| การแจ้งเตือน | สิ่งที่ต้องจัดการ | `page.tsx` title |
| สิ่งที่ควรดูแลตอนนี้ | เรื่องที่ควรเช็คตอนนี้ | `page.tsx` description |
| ไม่มีการแจ้งเตือนตอนนี้ | ไม่มีอะไรต้องรีบดู | `NotificationList.tsx` |
| สต๊อกใกล้หมด / สต๊อกหมด | ของใกล้หมด / ของหมด | `NotificationCard.tsx` |
| มี N รายการที่สต๊อกหมด | มี N รายการที่ของหมด | `notificationService.ts` |
| ยังไม่เคยสำรองข้อมูลในเครื่องนี้ | ยังไม่เคยสำรองข้อมูล | `notificationService.ts` |

### Activity (`app/activity/`, activity log messages)

| Before | After | Location |
|--------|-------|----------|
| กิจกรรมล่าสุด | บันทึกล่าสุด | `page.tsx` |
| สิ่งที่เปลี่ยนแปลง | สิ่งที่เพิ่งทำในร้าน | `page.tsx` |
| ยังไม่มีกิจกรรม | ยังไม่มีบันทึก | `ActivityTimeline.tsx` |
| การนำเข้า…ปรับสต๊อก | โหลดจาก Excel…ปรับของ | `ActivityTimeline.tsx` |
| ส่งออกไฟล์สำรองข้อมูล | ดาวน์โหลดไฟล์สำรองข้อมูล | `backupService.ts` |
| กู้คืนข้อมูลสำรอง N กลุ่ม | เอาข้อมูลกลับมา N ส่วน | `backupService.ts` |
| นำเข้า… | โหลด… | `importWriteService.ts` |
| รับเข้าสต๊อกจากซื้อของ | เอาเข้าครัวจากซื้อของ | `inventoryReceiveService.ts` |

### Recipes (`app/recipes/`)

| Before | After | Location |
|--------|-------|----------|
| แบบร่างสูตร | สูตรที่ยังไม่เสร็จ | `page.tsx` section |
| สูตรมาตรฐาน | สูตรตัวอย่าง | `page.tsx` section |
| ยังไม่มีแบบร่างสูตร | ยังไม่มีสูตรที่ยังไม่เสร็จ | `page.tsx` empty |

### Menus (`app/menus/`)

| Before | After | Location |
|--------|-------|----------|
| เมนูขายที่บันทึก | เมนูของคุณ | `page.tsx` section |
| เมนูมาตรฐาน | เมนูตัวอย่าง | `page.tsx` section |
| ยังไม่มีเมนูขายที่บันทึก | ยังไม่มีเมนูของคุณ | `page.tsx` empty |
| เมนูมาตรฐานที่แก้ไขไม่ได้ | เมนูตัวอย่างที่แก้ไขไม่ได้ | `[id]/edit/page.tsx` |

### Purchase (`app/purchase/`)

| Before | After | Location |
|--------|-------|----------|
| วัตถุดิบที่ต้องซื้อ | ของที่ต้องซื้อ | `PurchaseListItems.tsx` |
| หน่วยสต๊อก | หน่วยในครัว | `PurchaseListItems.tsx` |
| รับเข้าสต๊อก | เอาเข้าครัว | `PurchaseReceiveBar`, `PurchaseReceiveSheet` |
| ยืนยันรับเข้า | ยืนยันเอาเข้าครัว | `PurchaseReceiveSheet.tsx` |

### Inventory (`app/inventory/`)

| Before | After | Location |
|--------|-------|----------|
| ยังไม่มีข้อมูลสต๊อกในระบบ | ยังไม่มีข้อมูลของในครัว | `page.tsx` |
| สรุปสต๊อก | สรุปของในครัว | `InventoryHero.tsx` |
| ทุกอย่างปกติ | ของพอใช้ | `InventoryHero.tsx` |
| ปรับสต๊อก | ปรับจำนวนของ | `InventoryAdjustSheet.tsx` |
| อัปเดตสต๊อก | อัปเดตของในครัว | `InventoryAdjustSheet.tsx` |
| นับสต๊อกเช้า | นับของเช้า | placeholder |

### Search (`app/search/`)

| Before | After | Location |
|--------|-------|----------|
| สต๊อก (group label) | ของในครัว | `types.ts` |
| …และสต๊อก | …และของในครัว | `SearchResults.tsx` |

### Costing (`app/costing/`)

| Before | After | Location |
|--------|-------|----------|
| Food Cost | สัดส่วนต้นทุนอาหาร | `page.tsx` |
| Packaging | บรรจุภัณฑ์ | `page.tsx` |

### Setup & settings (`app/setup/`, `app/settings/`)

| Before | After | Location |
|--------|-------|----------|
| เริ่มต้นใช้งาน KL Builder | เริ่มต้นใช้งาน | `setup/page.tsx` |
| ค่า GP เป้าหมาย | เป้ากำไร / ค่าเป้ากำไร | `SetupForm`, `SettingsForm`, validation |
| นำเข้าข้อมูลจาก Excel | โหลดจาก Excel | `SetupCompleteCard.tsx` |
| ข้อมูลและสำรอง | สำรองข้อมูล | `settings/page.tsx`, `data/page.tsx` |
| ส่งออกหรือกู้คืนข้อมูลผู้ใช้ในเครื่อง | ดาวน์โหลดหรือเอาข้อมูลกลับมา | settings cards |
| ส่งออกข้อมูลสำรอง | ดาวน์โหลดไฟล์สำรอง | `BackupExportCard.tsx` |
| บันทึก…ไฟล์ JSON | บันทึก…เป็นไฟล์ | `BackupExportCard.tsx` |
| กลุ่มข้อมูล | ส่วน | backup UI |
| กู้คืนข้อมูลสำรอง | เอาข้อมูลกลับมา | `BackupRestoreCard.tsx` |
| localStorage / demo | ข้อมูลเดิม / ข้อมูลตัวอย่าง | `BackupConfirmSheet`, `data/page.tsx` |

### Import (`app/import/`)

| Before | After | Location |
|--------|-------|----------|
| นำเข้าข้อมูล | โหลดจาก Excel | `page.tsx` title |
| นำเข้าข้อมูล (button) | บันทึกลงร้าน | `page.tsx` |
| demo seed / ผู้ใช้ในเครื่อง | ข้อมูลตัวอย่าง / ที่คุณสร้าง | `page.tsx` helper |
| พร้อมนำเข้า (ขั้นตอนบันทึกยังไม่เปิด) | พร้อมบันทึกลงร้าน | `ImportResultPanel.tsx` |
| สรุปการนำเข้า / นำเข้าสำเร็จ | สรุปการโหลด / บันทึกสำเร็จ | `ImportSuccessSummary.tsx` |
| แพ็กเกจ | บรรจุภัณฑ์ | `types.ts` |
| ชีต ingredients… | แท็บ … ในไฟล์ Excel | `types.ts` |
| ไม่นำเข้ารายการที่ซ้ำ | ไม่บันทึกรายการที่ซ้ำ | `ImportConflictSheet.tsx` |
| ซ้ำ id | ซ้ำรหัส | `ImportConflictSheet.tsx` |
| ยืนยันนำเข้า | ยืนยันบันทึก | `ImportConflictSheet.tsx` |

### Shared components

| Before | After | Location |
|--------|-------|----------|
| ยังไม่มีประวัติเวอร์ชัน | ยังไม่มีประวัติการแก้ไข | `VersionHistoryPanel.tsx` |
| ย้อนกลับเวอร์ชันนี้ | ใช้แบบนี้แทน | `VersionHistoryPanel.tsx` |
| KL Builder | กำลัง...บิ้วเด้อ | `layout.tsx` metadata |

---

## Intentionally unchanged

These terms already match kitchen language or are short nav labels:

- **หน้าแรก**, **แผนผลิต**, **ซื้อของ**, **สูตร**, **เมนูขาย**, **วัตถุดิบ**
- **สต๊อก** — kept in bottom nav and page title (widely used in F&B)
- **แบบร่าง** — production draft status (matches requirement)
- **พร้อมเปิดร้าน** — home ready state
- **รายการสั่งล่วงหน้า** — staff pre-orders section
- **เป้าผลิตวันนี้**, **กำลังผลิต**, **เตรียมแล้ว**, **ผลิตแล้ว** (progress labels)

---

## Copy modules (centralized)

| File | Covers |
|------|--------|
| `app/home/copy.ts` | Home hero, cards, setup banner |
| `app/production/copy.ts` | Production sections, status, progress |

Other screens use inline strings. Future passes can extract more into `app/copy/` per module.

---

## Review checklist

- [ ] Home — hero, cards, notification chip
- [ ] Production + Today — status **เสร็จแล้ว**, kitchen link
- [ ] Notifications — title **สิ่งที่ต้องจัดการ**
- [ ] Recipes / Menus — **ตัวอย่าง** vs **ของคุณ**
- [ ] Purchase / Inventory — **เอาเข้าครัว**, **ของในครัว**
- [ ] Settings / Import / Backup — no technical jargon
- [ ] Activity log — reads like a kitchen diary

---

*V1 — Restaurant Language Audit. Copy only; no logic or layout changes.*
