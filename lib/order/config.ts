/**
 * Public order page config — no fake URLs.
 * Set NEXT_PUBLIC_ORDER_LINE_OA_URL when LINE OA is ready.
 */

export const ORDER_SHOP_NAME = "ตั้งเตา";

export const ORDER_TRIAL_BANNER =
  "ทดลองหน้าสั่งอาหาร — ยังไม่ส่งออเดอร์";

export const ORDER_TRIAL_RESULT_BANNER =
  "โหมดทดลอง — ยังไม่ได้ส่งออเดอร์เข้าร้าน";

export const ORDER_WELCOME_TAGLINE = "สั่งง่าย รับหน้าร้านหรือจัดส่ง";

/** Empty until env is set — never invent a LINE link. */
export function getOrderLineOaUrl(): string | null {
  const raw = (process.env.NEXT_PUBLIC_ORDER_LINE_OA_URL || "").trim();
  return raw.length > 0 ? raw : null;
}

export const ORDER_DELIVERY_LINE_NOTICE =
  "ออเดอร์จัดส่งจะได้รับการยืนยันหลังจากติดต่อและชำระเงินผ่าน LINE ของร้านแล้ว";
