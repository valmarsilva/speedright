import { useEffect, useRef, useCallback } from "react";

export const useSpeedAlert = (isOverLimit: boolean, enabled: boolean = true) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastAlertRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);

  const playAlertSound = useCallback(() => {
    if (!enabled || isPlayingRef.current) return;
    
    // Prevent playing too frequently (minimum 3 seconds between alerts)
    const now = Date.now();
    if (now - lastAlertRef.current < 3000) return;
    lastAlertRef.current = now;
    isPlayingRef.current = true;

    try {
      // Create or resume audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Create oscillator for beep sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Alert sound: two quick beeps
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      
      // Volume envelope
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.25);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);

      oscillator.onended = () => {
        isPlayingRef.current = false;
      };
    } catch (error) {
      console.warn("Could not play alert sound:", error);
      isPlayingRef.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (isOverLimit && enabled) {
      playAlertSound();
    }
  }, [isOverLimit, enabled, playAlertSound]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { playAlertSound };
};
