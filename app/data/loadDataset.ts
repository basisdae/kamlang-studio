import { getDataSource, type DataSource } from "./config";

/**
 * Pick demo or user JSON for a named dataset.
 * Repositories import seeds; seeds call this helper.
 */
export function loadDataset<T>(dataset: string, demo: T, user: T): T {
  const source = getDataSource();

  if (source === "empty") {
    if (Array.isArray(demo)) {
      return [] as T;
    }
    return user;
  }

  if (source === "user") {
    return user;
  }

  return demo;
}

export function getActiveDataSourceLabel(): DataSource {
  return getDataSource();
}

const TODAY_TOKEN = "__TODAY__";

/**
 * Demo production plans use __TODAY__ so the sample plan always matches today.
 */
export function resolveProductionDemoDates<
  T extends { id: string; date: string },
>(plans: T[]): T[] {
  const today = new Date().toISOString().slice(0, 10);

  return plans.map((plan) => {
    if (plan.date !== TODAY_TOKEN) {
      return plan;
    }

    return {
      ...plan,
      date: today,
      id: plan.id.replace(TODAY_TOKEN, today),
    };
  });
}
