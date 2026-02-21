export type EngineType = "gasoline" | "diesel";
export type CylinderCount = 4 | 6;

export interface EngineConfig {
  type: EngineType;
  cylinders: CylinderCount;
}

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  type: "gasoline",
  cylinders: 4,
};

// Diesel-specific thresholds vary by cylinder count
export const DIESEL_THRESHOLDS = {
  4: {
    rpmWarning: 4000,
    rpmDanger: 4500,
    rpmMax: 5000,
    turboBoostWarning: 2.0,
    turboBoostDanger: 2.5,
    turboBoostMax: 3.0,
    egtWarning: 650,
    egtDanger: 750,
    egtMax: 900,
    railPressureWarning: 1800,
    railPressureDanger: 2000,
    railPressureMax: 2200,
  },
  6: {
    rpmWarning: 3800,
    rpmDanger: 4200,
    rpmMax: 4800,
    turboBoostWarning: 2.2,
    turboBoostDanger: 2.8,
    turboBoostMax: 3.5,
    egtWarning: 620,
    egtDanger: 700,
    egtMax: 850,
    railPressureWarning: 1800,
    railPressureDanger: 2200,
    railPressureMax: 2500,
  },
} as const;

export const GASOLINE_THRESHOLDS = {
  rpmWarning: 5500,
  rpmDanger: 6500,
  rpmMax: 8000,
} as const;
