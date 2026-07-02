import demoProduction from "../data/demo/production.json";
import userProduction from "../data/user/production.json";
import {
  loadDataset,
  resolveProductionDemoDates,
} from "../data/loadDataset";
import { isDemoDataSource } from "../data/config";
import type { ProductionPlanSeed } from "./types";

/** Production plan master data — demo or user JSON via loadDataset. */
export function getProductionPlanSeeds(): ProductionPlanSeed[] {
  const plans = loadDataset(
    "production",
    demoProduction as ProductionPlanSeed[],
    userProduction as ProductionPlanSeed[]
  );

  if (isDemoDataSource()) {
    return resolveProductionDemoDates(plans);
  }

  return plans;
}
