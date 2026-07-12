"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ensureBiCacheVersion } from "../../lib/bi/localCache";
import { showInfoToast } from "../../app/lib/biInfoToast";

/**
 * Runs once on client mount: bump BI_CACHE_VERSION and purge business localStorage.
 */
export default function BiCacheBootstrap({ children }: { children: ReactNode }) {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const result = ensureBiCacheVersion();
    if (result.shouldNotify) {
      showInfoToast(
        "ล้างแคชเก่าแล้ว — โหลดข้อมูลจากฐานข้อมูล (Supabase เป็นแหล่งจริง)"
      );
    }
  }, []);

  return <>{children}</>;
}
