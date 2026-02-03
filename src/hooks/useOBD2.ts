/// <reference types="@types/web-bluetooth" />
import { useState, useCallback, useRef } from "react";

// OBD-II PIDs (Parameter IDs)
const OBD_PIDS = {
  RPM: "010C",
  SPEED: "010D",
  THROTTLE: "0111",
  COOLANT_TEMP: "0105",
  INTAKE_TEMP: "010F",
  MAF: "0110",
  MAP: "010B",
  FUEL_LEVEL: "012F",
  ENGINE_LOAD: "0104",
  O2_VOLTAGE: "0114", // Bank 1, Sensor 1
  OIL_TEMP: "015C", // Not all vehicles support this
} as const;

export interface OBD2Data {
  rpm: number;
  speed: number;
  throttle: number;
  coolantTemp: number;
  intakeTemp: number;
  maf: number;
  map: number;
  fuelLevel: number;
  engineLoad: number;
  o2Voltage: number;
  oilTemp: number;
}

interface OBD2State {
  isConnected: boolean;
  isConnecting: boolean;
  data: OBD2Data;
  error: string | null;
  deviceName: string | null;
  isSupported: boolean;
}

const initialData: OBD2Data = {
  rpm: 0,
  speed: 0,
  throttle: 0,
  coolantTemp: 0,
  intakeTemp: 0,
  maf: 0,
  map: 0,
  fuelLevel: 0,
  engineLoad: 0,
  o2Voltage: 0,
  oilTemp: 0,
};

// ELM327 Bluetooth Service UUIDs
const ELM327_SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
const ELM327_CHARACTERISTIC_UUID = "0000fff1-0000-1000-8000-00805f9b34fb";
const ELM327_WRITE_UUID = "0000fff2-0000-1000-8000-00805f9b34fb";

// Alternative common UUIDs for different ELM327 adapters
const SERIAL_SERVICE_UUID = "00001101-0000-1000-8000-00805f9b34fb";

export const useOBD2 = () => {
  const [state, setState] = useState<OBD2State>({
    isConnected: false,
    isConnecting: false,
    data: initialData,
    error: null,
    deviceName: null,
    isSupported: typeof navigator !== "undefined" && "bluetooth" in navigator,
  });

  const deviceRef = useRef<BluetoothDevice | null>(null);
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const writeCharacteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const responseBufferRef = useRef<string>("");

  const parseOBDResponse = useCallback((response: string, pid: string): number => {
    // Remove whitespace and get hex bytes
    const cleaned = response.replace(/\s/g, "").toUpperCase();
    
    // Find the response for our PID (format: 41 XX YY ZZ...)
    const pidByte = pid.substring(2, 4);
    const regex = new RegExp(`41${pidByte}([0-9A-F]+)`);
    const match = cleaned.match(regex);
    
    if (!match) return 0;
    
    const hexData = match[1];
    
    switch (pid) {
      case OBD_PIDS.RPM: {
        // RPM = ((A * 256) + B) / 4
        const a = parseInt(hexData.substring(0, 2), 16);
        const b = parseInt(hexData.substring(2, 4), 16);
        return ((a * 256) + b) / 4;
      }
      case OBD_PIDS.SPEED: {
        // Speed in km/h = A
        return parseInt(hexData.substring(0, 2), 16);
      }
      case OBD_PIDS.THROTTLE: {
        // Throttle position = (A * 100) / 255
        const a = parseInt(hexData.substring(0, 2), 16);
        return (a * 100) / 255;
      }
      case OBD_PIDS.COOLANT_TEMP:
      case OBD_PIDS.INTAKE_TEMP:
      case OBD_PIDS.OIL_TEMP: {
        // Temperature = A - 40 (in Celsius)
        const a = parseInt(hexData.substring(0, 2), 16);
        return a - 40;
      }
      case OBD_PIDS.MAF: {
        // MAF = ((A * 256) + B) / 100 (g/s)
        const a = parseInt(hexData.substring(0, 2), 16);
        const b = parseInt(hexData.substring(2, 4), 16);
        return ((a * 256) + b) / 100;
      }
      case OBD_PIDS.MAP: {
        // MAP = A (kPa)
        return parseInt(hexData.substring(0, 2), 16);
      }
      case OBD_PIDS.FUEL_LEVEL: {
        // Fuel level = (A * 100) / 255
        const a = parseInt(hexData.substring(0, 2), 16);
        return (a * 100) / 255;
      }
      case OBD_PIDS.ENGINE_LOAD: {
        // Engine load = (A * 100) / 255
        const a = parseInt(hexData.substring(0, 2), 16);
        return (a * 100) / 255;
      }
      case OBD_PIDS.O2_VOLTAGE: {
        // O2 voltage = A / 200 (volts)
        const a = parseInt(hexData.substring(0, 2), 16);
        return a / 200;
      }
      default:
        return 0;
    }
  }, []);

  const sendCommand = useCallback(async (command: string): Promise<string> => {
    if (!writeCharacteristicRef.current) {
      throw new Error("Not connected");
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(command + "\r");
    
    await writeCharacteristicRef.current.writeValue(data);
    
    // Wait for response
    return new Promise((resolve) => {
      setTimeout(() => {
        const response = responseBufferRef.current;
        responseBufferRef.current = "";
        resolve(response);
      }, 200);
    });
  }, []);

  const initializeELM327 = useCallback(async () => {
    // Reset adapter
    await sendCommand("ATZ");
    await new Promise(r => setTimeout(r, 1000));
    
    // Disable echo
    await sendCommand("ATE0");
    
    // Set protocol to auto
    await sendCommand("ATSP0");
    
    // Disable line feeds
    await sendCommand("ATL0");
    
    // Disable spaces
    await sendCommand("ATS0");
    
    // Set headers off
    await sendCommand("ATH0");
  }, [sendCommand]);

  const pollData = useCallback(async () => {
    if (!state.isConnected) return;

    try {
      const responses = await Promise.allSettled([
        sendCommand(OBD_PIDS.RPM),
        sendCommand(OBD_PIDS.THROTTLE),
        sendCommand(OBD_PIDS.COOLANT_TEMP),
        sendCommand(OBD_PIDS.MAF),
        sendCommand(OBD_PIDS.MAP),
        sendCommand(OBD_PIDS.ENGINE_LOAD),
        sendCommand(OBD_PIDS.O2_VOLTAGE),
        sendCommand(OBD_PIDS.OIL_TEMP),
      ]);

      const newData = { ...state.data };

      if (responses[0].status === "fulfilled") {
        newData.rpm = parseOBDResponse(responses[0].value, OBD_PIDS.RPM);
      }
      if (responses[1].status === "fulfilled") {
        newData.throttle = parseOBDResponse(responses[1].value, OBD_PIDS.THROTTLE);
      }
      if (responses[2].status === "fulfilled") {
        newData.coolantTemp = parseOBDResponse(responses[2].value, OBD_PIDS.COOLANT_TEMP);
      }
      if (responses[3].status === "fulfilled") {
        newData.maf = parseOBDResponse(responses[3].value, OBD_PIDS.MAF);
      }
      if (responses[4].status === "fulfilled") {
        newData.map = parseOBDResponse(responses[4].value, OBD_PIDS.MAP);
      }
      if (responses[5].status === "fulfilled") {
        newData.engineLoad = parseOBDResponse(responses[5].value, OBD_PIDS.ENGINE_LOAD);
      }
      if (responses[6].status === "fulfilled") {
        newData.o2Voltage = parseOBDResponse(responses[6].value, OBD_PIDS.O2_VOLTAGE);
      }
      if (responses[7].status === "fulfilled") {
        newData.oilTemp = parseOBDResponse(responses[7].value, OBD_PIDS.OIL_TEMP);
      }

      setState(prev => ({ ...prev, data: newData }));
    } catch (error) {
      console.error("Error polling OBD2 data:", error);
    }
  }, [state.isConnected, state.data, sendCommand, parseOBDResponse]);

  const connect = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({ 
        ...prev, 
        error: "Web Bluetooth não suportado neste navegador. Use Chrome no Android ou Desktop." 
      }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Request Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: "OBD" },
          { namePrefix: "ELM" },
          { namePrefix: "OBDII" },
          { namePrefix: "Vgate" },
          { namePrefix: "V-LINK" },
        ],
        optionalServices: [ELM327_SERVICE_UUID, SERIAL_SERVICE_UUID],
      });

      deviceRef.current = device;

      // Connect to GATT server
      const server = await device.gatt?.connect();
      if (!server) throw new Error("Falha ao conectar ao dispositivo");

      // Get service
      let service: BluetoothRemoteGATTService;
      try {
        service = await server.getPrimaryService(ELM327_SERVICE_UUID);
      } catch {
        service = await server.getPrimaryService(SERIAL_SERVICE_UUID);
      }

      // Get characteristics
      const characteristics = await service.getCharacteristics();
      
      for (const char of characteristics) {
        if (char.properties.notify || char.properties.read) {
          characteristicRef.current = char;
          
          // Start notifications
          await char.startNotifications();
          char.addEventListener("characteristicvaluechanged", (event) => {
            const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
            if (value) {
              const decoder = new TextDecoder();
              responseBufferRef.current += decoder.decode(value);
            }
          });
        }
        if (char.properties.write || char.properties.writeWithoutResponse) {
          writeCharacteristicRef.current = char;
        }
      }

      // Initialize ELM327
      await initializeELM327();

      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        deviceName: device.name || "OBD-II Adapter",
      }));

      // Start polling
      pollingIntervalRef.current = window.setInterval(pollData, 500);

      // Handle disconnection
      device.addEventListener("gattserverdisconnected", () => {
        disconnect();
      });

    } catch (error) {
      console.error("OBD2 connection error:", error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : "Erro ao conectar",
      }));
    }
  }, [state.isSupported, initializeELM327, pollData]);

  const disconnect = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }

    deviceRef.current = null;
    characteristicRef.current = null;
    writeCharacteristicRef.current = null;

    setState(prev => ({
      ...prev,
      isConnected: false,
      data: initialData,
      deviceName: null,
    }));
  }, []);

  // Demo mode for testing without actual OBD device
  const connectDemo = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnected: true,
      deviceName: "Demo Mode",
    }));

    // Simulate data
    pollingIntervalRef.current = window.setInterval(() => {
      setState(prev => ({
        ...prev,
        data: {
          rpm: 800 + Math.random() * 6200,
          speed: Math.random() * 180,
          throttle: Math.random() * 100,
          coolantTemp: 80 + Math.random() * 30,
          intakeTemp: 20 + Math.random() * 40,
          maf: 5 + Math.random() * 200,
          map: 30 + Math.random() * 70,
          fuelLevel: 50 + Math.random() * 50,
          engineLoad: Math.random() * 100,
          o2Voltage: 0.1 + Math.random() * 0.9,
          oilTemp: 90 + Math.random() * 30,
        },
      }));
    }, 500);
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    connectDemo,
  };
};
