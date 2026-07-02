/**
 * Global business settings — persisted in LocalStorage.
 *
 * Single source of truth for restaurant-wide defaults.
 * Services will read via getSettings() in future tasks.
 *
 * @see app/settings/README.md
 */
import { defaultSettings } from "../settings/seed";
import type {
  KlBusinessProfile,
  KlSettings,
  KlSettingsPatch,
} from "../settings/types";
import {
  applySettingsPatch,
  isSetupComplete,
  normalizeSettings,
  validateSettings,
} from "../settings/utils";

export const KL_SETTINGS_KEY = "kl-settings";

function readRaw(): unknown {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(KL_SETTINGS_KEY);
    if (!raw) return null;

    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function writeSettings(settings: KlSettings): void {
  localStorage.setItem(KL_SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * Returns merged settings (saved + defaults).
 * On server or first visit, returns seeded defaults.
 */
export function getSettings(): KlSettings {
  const saved = readRaw();

  if (!saved) {
    return { ...defaultSettings };
  }

  return normalizeSettings(saved);
}

/** Business profile for the current workspace (single-store for now). */
export function getBusinessProfile(): KlBusinessProfile {
  return getSettings().business;
}

/** Merge a partial business profile patch, validate, and persist. */
export function updateBusinessProfile(
  patch: Partial<KlBusinessProfile>
): KlBusinessProfile {
  return updateSettings({ business: patch }).business;
}

/**
 * Deep-merge a patch into current settings, validate, and persist.
 */
export function updateSettings(patch: KlSettingsPatch): KlSettings {
  const current = getSettings();
  const next = applySettingsPatch(current, patch);

  validateSettings(next);
  writeSettings(next);

  return next;
}

/** Whether first-time setup has been completed in this workspace. */
export function isInitialSetupComplete(): boolean {
  if (typeof window === "undefined") return false;

  return isSetupComplete(getSettings());
}

/**
 * Reset to seeded defaults (utility for tests / future settings UI).
 */
export function resetSettings(): KlSettings {
  const next: KlSettings = {
    ...defaultSettings,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    writeSettings(next);
  }

  return next;
}
