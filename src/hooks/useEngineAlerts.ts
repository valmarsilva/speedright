import { useEffect, useRef, useCallback, useState } from "react";
import { OBD2Data } from "@/hooks/useOBD2";
import type { DieselData } from "@/hooks/useDieselOBD2";
import type { EngineType, CylinderCount } from "@/types/engine";
import { DIESEL_THRESHOLDS, GASOLINE_THRESHOLDS } from "@/types/engine";

export interface EngineAlert {
  id: string;
  label: string;
  value: number;
  unit: string;
  threshold: number;
  level: "warning" | "danger";
}

export const useEngineAlerts = (
  data: OBD2Data,
  isConnected: boolean,
  soundEnabled: boolean = true,
  engineType: EngineType = "gasoline",
  dieselData?: DieselData,
  cylinders: CylinderCount = 4,
) => {
  const [activeAlerts, setActiveAlerts] = useState<EngineAlert[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastAlertSoundRef = useRef<number>(0);
  const isPlayingRef = useRef(false);

  const playAlertSound = useCallback((level: "warning" | "danger") => {
    if (!soundEnabled || isPlayingRef.current) return;
    const now = Date.now();
    if (now - lastAlertSoundRef.current < 4000) return;
    lastAlertSoundRef.current = now;
    isPlayingRef.current = true;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (level === "danger") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(660, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(660, ctx.currentTime + 0.3);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.45);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.02);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.14);
        gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.16);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.29);
        gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.31);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.6);
      } else {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.02);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      }

      osc.onended = () => { isPlayingRef.current = false; };
    } catch {
      isPlayingRef.current = false;
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (!isConnected) {
      setActiveAlerts([]);
      return;
    }

    const alerts: EngineAlert[] = [];

    // Common alerts (RPM, coolant, oil)
    const rpmWarning = engineType === "diesel" ? DIESEL_THRESHOLDS[cylinders].rpmWarning : GASOLINE_THRESHOLDS.rpmWarning;
    const rpmDanger = engineType === "diesel" ? DIESEL_THRESHOLDS[cylinders].rpmDanger : GASOLINE_THRESHOLDS.rpmDanger;

    if (data.rpm >= rpmDanger) {
      alerts.push({ id: "rpm", label: "RPM CRÍTICO", value: Math.round(data.rpm), unit: "rpm", threshold: rpmDanger, level: "danger" });
    } else if (data.rpm >= rpmWarning) {
      alerts.push({ id: "rpm", label: "RPM Alto", value: Math.round(data.rpm), unit: "rpm", threshold: rpmWarning, level: "warning" });
    }

    if (data.coolantTemp >= 110) {
      alerts.push({ id: "coolant", label: "SUPERAQUECIMENTO!", value: Math.round(data.coolantTemp), unit: "°C", threshold: 110, level: "danger" });
    } else if (data.coolantTemp >= 100) {
      alerts.push({ id: "coolant", label: "Temp. Água Alta", value: Math.round(data.coolantTemp), unit: "°C", threshold: 100, level: "warning" });
    }

    if (data.oilTemp >= 135) {
      alerts.push({ id: "oil", label: "ÓLEO CRÍTICO!", value: Math.round(data.oilTemp), unit: "°C", threshold: 135, level: "danger" });
    } else if (data.oilTemp >= 120) {
      alerts.push({ id: "oil", label: "Temp. Óleo Alta", value: Math.round(data.oilTemp), unit: "°C", threshold: 120, level: "warning" });
    }

    // Diesel-specific alerts
    if (engineType === "diesel" && dieselData) {
      const dt = DIESEL_THRESHOLDS[cylinders];

      if (dieselData.turboBoost >= dt.turboBoostDanger) {
        alerts.push({ id: "turbo", label: "TURBO CRÍTICO!", value: dieselData.turboBoost, unit: "bar", threshold: dt.turboBoostDanger, level: "danger" });
      } else if (dieselData.turboBoost >= dt.turboBoostWarning) {
        alerts.push({ id: "turbo", label: "Pressão Turbo Alta", value: dieselData.turboBoost, unit: "bar", threshold: dt.turboBoostWarning, level: "warning" });
      }

      if (dieselData.egt >= dt.egtDanger) {
        alerts.push({ id: "egt", label: "EGT CRÍTICO!", value: Math.round(dieselData.egt), unit: "°C", threshold: dt.egtDanger, level: "danger" });
      } else if (dieselData.egt >= dt.egtWarning) {
        alerts.push({ id: "egt", label: "EGT Alta", value: Math.round(dieselData.egt), unit: "°C", threshold: dt.egtWarning, level: "warning" });
      }

      if (dieselData.railPressure >= dt.railPressureDanger) {
        alerts.push({ id: "rail", label: "RAIL CRÍTICO!", value: Math.round(dieselData.railPressure), unit: "bar", threshold: dt.railPressureDanger, level: "danger" });
      } else if (dieselData.railPressure >= dt.railPressureWarning) {
        alerts.push({ id: "rail", label: "Pressão Rail Alta", value: Math.round(dieselData.railPressure), unit: "bar", threshold: dt.railPressureWarning, level: "warning" });
      }

      if (dieselData.dpfStatus === "blocked") {
        alerts.push({ id: "dpf", label: "DPF BLOQUEADO!", value: dieselData.dpfPressure, unit: "kPa", threshold: 12, level: "danger" });
      } else if (dieselData.dpfStatus === "regenerating") {
        alerts.push({ id: "dpf", label: "DPF Regenerando", value: dieselData.dpfTemp, unit: "°C", threshold: 550, level: "warning" });
      }
    }

    setActiveAlerts(alerts);

    if (alerts.length > 0) {
      const hasDanger = alerts.some(a => a.level === "danger");
      playAlertSound(hasDanger ? "danger" : "warning");
    }
  }, [data.rpm, data.coolantTemp, data.oilTemp, isConnected, engineType, cylinders, dieselData, playAlertSound]);

  useEffect(() => {
    return () => { audioContextRef.current?.close(); };
  }, []);

  return { activeAlerts };
};
