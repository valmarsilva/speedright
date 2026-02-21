import { useState, useCallback, useRef } from "react";
import type { CylinderCount } from "@/types/engine";

// Diesel-specific OBD-II PIDs (Mode 01 standard + extended)
const DIESEL_PIDS = {
  TURBO_BOOST: "0133",      // Absolute Barometric Pressure (used to calc boost)
  INTAKE_MAP: "010B",        // Intake Manifold Absolute Pressure
  EGT_BANK1: "0178",         // Exhaust Gas Temperature Bank 1
  RAIL_PRESSURE: "0123",     // Fuel Rail Gauge Pressure (diesel)
  DPF_TEMP: "017C",          // DPF Temperature
  DPF_PRESSURE: "017A",      // DPF Differential Pressure  
  EGR_COMMANDED: "012C",     // Commanded EGR
  EGR_ERROR: "012D",         // EGR Error
  BOOST_PRESSURE: "0170",    // Boost Pressure Control
} as const;

export interface DieselData {
  turboBoost: number;       // bar
  egt: number;              // °C Exhaust Gas Temperature
  railPressure: number;     // bar
  dpfTemp: number;          // °C DPF Temperature
  dpfPressure: number;      // kPa DPF Differential Pressure
  dpfStatus: "ok" | "regenerating" | "blocked";
  egrRate: number;          // % EGR rate
  egrError: number;         // % EGR error
  boostPressure: number;    // kPa
}

export const initialDieselData: DieselData = {
  turboBoost: 0,
  egt: 0,
  railPressure: 0,
  dpfTemp: 0,
  dpfPressure: 0,
  dpfStatus: "ok",
  egrRate: 0,
  egrError: 0,
  boostPressure: 0,
};

export const useDieselOBD2 = (cylinders: CylinderCount = 4) => {
  const [dieselData, setDieselData] = useState<DieselData>(initialDieselData);
  const demoIntervalRef = useRef<number | null>(null);

  const parseDieselResponse = useCallback((response: string, pid: string): number => {
    const cleaned = response.replace(/\s/g, "").toUpperCase();
    const pidByte = pid.substring(2, 4);
    const regex = new RegExp(`41${pidByte}([0-9A-F]+)`);
    const match = cleaned.match(regex);
    if (!match) return 0;
    const hex = match[1];

    switch (pid) {
      case DIESEL_PIDS.TURBO_BOOST:
      case DIESEL_PIDS.INTAKE_MAP: {
        // MAP in kPa, convert to bar relative to atmosphere
        const kpa = parseInt(hex.substring(0, 2), 16);
        return Math.max((kpa - 101.325) / 100, 0);
      }
      case DIESEL_PIDS.EGT_BANK1: {
        // EGT = ((A * 256) + B) / 10 - 40
        const a = parseInt(hex.substring(0, 2), 16);
        const b = parseInt(hex.substring(2, 4), 16);
        return ((a * 256) + b) / 10 - 40;
      }
      case DIESEL_PIDS.RAIL_PRESSURE: {
        // Rail pressure = ((A * 256) + B) * 10 (kPa) -> bar
        const a = parseInt(hex.substring(0, 2), 16);
        const b = parseInt(hex.substring(2, 4), 16);
        return ((a * 256) + b) * 10 / 100;
      }
      case DIESEL_PIDS.DPF_TEMP: {
        // Same as EGT formula
        const a = parseInt(hex.substring(0, 2), 16);
        const b = parseInt(hex.substring(2, 4), 16);
        return ((a * 256) + b) / 10 - 40;
      }
      case DIESEL_PIDS.DPF_PRESSURE: {
        // Differential pressure in Pa -> kPa
        const a = parseInt(hex.substring(0, 2), 16);
        const b = parseInt(hex.substring(2, 4), 16);
        return ((a * 256) + b) / 1000;
      }
      case DIESEL_PIDS.EGR_COMMANDED: {
        // EGR % = A * 100 / 255
        return parseInt(hex.substring(0, 2), 16) * 100 / 255;
      }
      case DIESEL_PIDS.EGR_ERROR: {
        // EGR Error = (A - 128) * 100 / 128
        return (parseInt(hex.substring(0, 2), 16) - 128) * 100 / 128;
      }
      case DIESEL_PIDS.BOOST_PRESSURE: {
        // Boost in kPa
        const a = parseInt(hex.substring(0, 2), 16);
        const b = parseInt(hex.substring(2, 4), 16);
        return (a * 256) + b;
      }
      default:
        return 0;
    }
  }, []);

  const startDemoMode = useCallback(() => {
    const baseBoost = cylinders === 6 ? 1.8 : 1.4;
    const baseEgt = cylinders === 6 ? 450 : 400;
    const baseRail = cylinders === 6 ? 1600 : 1400;

    demoIntervalRef.current = window.setInterval(() => {
      const rpmFactor = 0.3 + Math.random() * 0.7;
      const dpfTemp = 300 + Math.random() * 350;
      const dpfPressure = 2 + Math.random() * 15;
      
      let dpfStatus: DieselData["dpfStatus"] = "ok";
      if (dpfPressure > 12) dpfStatus = "blocked";
      else if (dpfTemp > 550) dpfStatus = "regenerating";

      setDieselData({
        turboBoost: baseBoost * rpmFactor + Math.random() * 0.5,
        egt: baseEgt + rpmFactor * 250 + Math.random() * 50,
        railPressure: baseRail + rpmFactor * 400 + Math.random() * 100,
        dpfTemp,
        dpfPressure,
        dpfStatus,
        egrRate: 10 + Math.random() * 35,
        egrError: -5 + Math.random() * 10,
        boostPressure: (baseBoost * rpmFactor + Math.random() * 0.3) * 100,
      });
    }, 500);
  }, [cylinders]);

  const stopDemoMode = useCallback(() => {
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
    setDieselData(initialDieselData);
  }, []);

  return {
    dieselData,
    setDieselData,
    parseDieselResponse,
    startDemoMode,
    stopDemoMode,
    DIESEL_PIDS,
  };
};
