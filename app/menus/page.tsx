"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import ButtonLink from "../../components/ui/ButtonLink";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import SearchBar from "../../components/ui/SearchBar";
import SectionLink from "../../components/ui/SectionLink";
import StatCell from "../../components/ui/StatCell";
import { EMPTY_STATE } from "../copy/emptyStates";
import {
  getAllSavedMenus,
  updateSavedMenu,
} from "../repositories/SavedMenuRepository";
import type { SavedMenu } from "./builder/types";
import {
  COST_STATUS_LABEL,
  formatCostBaht,
  formatProfitDisplay,
  getSaleStatus,
  resolveMenuCost,
  SALE_STATUS_LABEL,
  type MenuCostStatus,
  type MenuSaleStatus,
  withSaleStatus,
} from "./saleStatus";
import { formatMenuBaht } from "./utils";

type LibraryFilter =
  | "all"
  | "active"
  | "draft"
  | "closed"
  | "calculated"
  | "no_recipe"
  | "cost_issue";

const FILTERS: { id: LibraryFilter; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "active", label: "เปิดขาย" },
  { id: "draft", label: "แบบร่าง" },
  { id: "closed", label: "ปิดขาย" },
  { id: "calculated", label: "คำนวณต้นทุนแล้ว" },
  { id: "no_recipe", label: "ยังไม่มีสูตร" },
  { id: "cost_issue", label: "สูตร/ต้นทุนไม่สมบูรณ์" },
];

type MenuRow = {
  menu: SavedMenu;
  saleStatus: MenuSaleStatus;
  costStatus: MenuCostStatus;
  cost: ReturnType<typeof resolveMenuCost>["cost"];
};

function matchesFilter(row: MenuRow, filter: LibraryFilter): boolean {
  if (filter === "all") return row.saleStatus !== "archived";
  if (filter === "active") return row.saleStatus === "active";
  if (filter === "draft") return row.saleStatus === "draft";
  if (filter === "closed") return row.saleStatus === "closed";
  if (filter === "calculated") return row.costStatus === "calculated";
  if (filter === "no_recipe") return row.costStatus === "no_recipe";
  if (filter === "cost_issue") {
    return (
      row.costStatus === "incomplete_recipe" ||
      row.costStatus === "missing_prices"
    );
  }
  return true;
}

export default function MenusPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<LibraryFilter>("all");
  const [savedMenus, setSavedMenus] = useState<SavedMenu[]>([]);

  function reload() {
    setSavedMenus(getAllSavedMenus());
  }

  useEffect(() => {
    queueMicrotask(() => {
      setSavedMenus(getAllSavedMenus());
    });
  }, [pathname]);

  const rows: MenuRow[] = useMemo(
    () =>
      savedMenus.map((menu) => {
        const { status, cost } = resolveMenuCost(menu);
        return {
          menu,
          saleStatus: getSaleStatus(menu),
          costStatus: status,
          cost,
        };
      }),
    [savedMenus]
  );

  const uncostedCount = useMemo(
    () => rows.filter((r) => r.costStatus !== "calculated").length,
    [rows]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (!matchesFilter(row, filter)) return false;
      if (!q) return true;
      return (
        row.menu.name.toLowerCase().includes(q) ||
        row.menu.category.toLowerCase().includes(q)
      );
    });
  }, [rows, filter, search]);

  function setStatus(menu: SavedMenu, saleStatus: MenuSaleStatus) {
    updateSavedMenu(
      withSaleStatus(
        { ...menu, updatedAt: new Date().toISOString() },
        saleStatus
      )
    );
    reload();
  }

  return (
    <AppShell title="เมนูขาย" backHref="/">
      <SearchBar
        placeholder="ค้นหาเมนูขาย..."
        value={search}
        onChange={setSearch}
      />

      {uncostedCount > 0 ? (
        <Card className="!p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="kl-type-helper">
              มี {uncostedCount} เมนูที่ยังไม่ได้คำนวณต้นทุน
            </p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="min-h-[40px]"
              onClick={() => setFilter("no_recipe")}
            >
              ดูรายการ
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`shrink-0 rounded-full border px-3 py-2 kl-type-caption min-h-[40px] ${
              filter === item.id
                ? "border-kl-brown bg-kl-brown text-kl-ivory"
                : "border-kl-border bg-kl-card text-kl-text"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <SectionLink
        variant="create"
        href="/menus/new"
        title="เพิ่มเมนูใหม่"
        module="menus"
      />

      {visible.length === 0 ? (
        search.trim() || filter !== "all" ? (
          <EmptyState
            {...EMPTY_STATE.menus.search}
            onAction={() => {
              setSearch("");
              setFilter("all");
            }}
          />
        ) : (
          <EmptyState {...EMPTY_STATE.menus.none} />
        )
      ) : (
        <div className="space-y-3">
          {visible.map(({ menu, saleStatus, costStatus, cost }) => {
            const profit = formatProfitDisplay(
              cost,
              costStatus,
              menu.sellingPrice
            );
            return (
              <Card key={menu.id} className="space-y-3 !p-3">
                <Link
                  href={`/menus/${menu.id}`}
                  className="block min-w-0 kl-pressable"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="kl-type-card-title">{menu.name}</h2>
                      <p className="kl-type-caption mt-1 text-kl-muted">
                        {menu.category || "ยังไม่ตั้งหมวด"}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge
                        tone={
                          saleStatus === "active"
                            ? "success"
                            : saleStatus === "draft"
                              ? "draft"
                              : "neutral"
                        }
                      >
                        {SALE_STATUS_LABEL[saleStatus]}
                      </Badge>
                      <span className="kl-type-caption text-kl-muted">
                        {COST_STATUS_LABEL[costStatus]}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <StatCell
                      label="ราคาขาย"
                      value={
                        menu.sellingPrice > 0
                          ? `฿${formatMenuBaht(menu.sellingPrice)}`
                          : "ยังไม่ตั้ง"
                      }
                      size="sm"
                    />
                    <StatCell
                      label="ต้นทุน"
                      value={formatCostBaht(cost, costStatus)}
                      size="sm"
                    />
                    <StatCell label="กำไร" value={profit.profit} size="sm" />
                    <StatCell label="GP" value={profit.gp} size="sm" />
                  </div>
                </Link>

                <div className="flex flex-wrap gap-2">
                  <ButtonLink
                    href={`/menus/${menu.id}/edit`}
                    variant="secondary"
                    size="sm"
                    className="min-h-[40px]"
                  >
                    แก้ไข
                  </ButtonLink>

                  {costStatus === "no_recipe" ? (
                    <>
                      <ButtonLink
                        href={`/recipes/builder?linkMenuId=${encodeURIComponent(menu.id)}&menuName=${encodeURIComponent(menu.name)}`}
                        size="sm"
                        className="min-h-[40px]"
                      >
                        สร้างสูตร
                      </ButtonLink>
                      <ButtonLink
                        href={`/menus/${menu.id}/edit`}
                        variant="secondary"
                        size="sm"
                        className="min-h-[40px]"
                      >
                        เชื่อมสูตร
                      </ButtonLink>
                    </>
                  ) : null}

                  {costStatus === "calculated" && menu.recipeId ? (
                    <ButtonLink
                      href={`/recipes/builder?id=${encodeURIComponent(menu.recipeId)}`}
                      variant="secondary"
                      size="sm"
                      className="min-h-[40px]"
                    >
                      ดูสูตร
                    </ButtonLink>
                  ) : null}

                  {costStatus === "incomplete_recipe" ||
                  costStatus === "missing_prices" ? (
                    <ButtonLink
                      href={
                        menu.recipeId
                          ? `/recipes/builder?id=${encodeURIComponent(menu.recipeId)}`
                          : `/menus/${menu.id}/edit`
                      }
                      variant="secondary"
                      size="sm"
                      className="min-h-[40px]"
                    >
                      แก้สูตร
                    </ButtonLink>
                  ) : null}

                  {saleStatus === "active" ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="min-h-[40px]"
                      onClick={() => setStatus(menu, "closed")}
                    >
                      ปิดขาย
                    </Button>
                  ) : saleStatus !== "archived" ? (
                    <Button
                      type="button"
                      size="sm"
                      className="min-h-[40px]"
                      onClick={() => setStatus(menu, "active")}
                      disabled={!(menu.sellingPrice > 0)}
                    >
                      เปิดขาย
                    </Button>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
