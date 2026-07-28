"use client";

import { redirect } from "next/navigation";

/** Backstore label “เมนูอาหาร” uses the same sellable menu library. */
export default function FoodMenuPage() {
  redirect("/menus");
}
