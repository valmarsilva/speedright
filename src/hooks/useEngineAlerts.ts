import { useEffect, useRef, useCallback, useState } from "react";
import { OBD2Data } from "@/hooks/useOBD2";

export interface EngineAlert {
  id: string;
  label: string;
  value: number;
  unit: string;
  threshold: number;
  level: "warning" | "danger";
}

interface AlertThresholds {
  rpmWarning: number;
  rpmDanger: number;
  coolantWarning: number;
  coolantDanger: number;
  oilWarning: number;
  oilDanger: number;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  rpmWarning: 5500,
  rpmDanger: 6500,
  coolantWarning: 100,
  coolantDanger: 110,
  oilWarning: 120,
  oilDanger: 135,
};

export const useEngineAlerts = (data: OBD2Data, isConnected: boolean, soundEnabled: boolean = true) => {
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
    const t = DEFAULT_THRESHOLDS;

    if (data.rpm >= t.rpmDanger) {
      alerts.push({ id: "rpm", label: "RPM CRÍTICO", value: Math.round(data.rpm), unit: "rpm", threshold: t.rpmDanger, level: "danger" });
    } else if (data.rpm >= t.rpmWarning) {
      alerts.push({ id: "rpm", label: "RPM Alto", value: Math.round(data.rpm), unit: "rpm", threshold: t.rpmWarning, level: "warning" });
    }

    if (data.coolantTemp >= t.coolantDanger) {
      alerts.push({ id: "coolant", label: "SUPERAQUECIMENTO!", value: Math.round(data.coolantTemp), unit: "°C", threshold: t.coolantDanger, level: "danger" });
    } else if (data.coolantTemp >= t.coolantWarning) {
      alerts.push({ id: "coolant", label: "Temp. Água Alta", value: Math.round(data.coolantTemp), unit: "°C", threshold: t.coolantWarning, level: "warning" });
    }

    if (data.oilTemp >= t.oilDanger) {
      alerts.push({ id: "oil", label: "ÓLEO CRÍTICO!", value: Math.round(data.oilTemp), unit: "°C", threshold: t.oilDanger, level: "danger" });
    } else if (data.oilTemp >= t.oilWarning) {
      alerts.push({ id: "oil", label: "Temp. Óleo Alta", value: Math.round(data.oilTemp), unit: "°C", threshold: t.oilWarning, level: "warning" });
    }

    setActiveAlerts(alerts);

    if (alerts.length > 0) {
      const hasDanger = alerts.some(a => a.level === "danger");
      playAlertSound(hasDanger ? "danger" : "warning");
    }
  }, [data.rpm, data.coolantTemp, data.oilTemp, isConnected, playAlertSound]);

  useEffect(() => {
    return () => { audioContextRef.current?.close(); };
  }, []);

  return { activeAlerts };
};
