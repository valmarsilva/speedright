import { useState, useEffect, useRef } from "react";

interface AddressData {
  street: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  fullAddress: string | null;
}

export const useReverseGeocode = (latitude: number | null, longitude: number | null) => {
  const [address, setAddress] = useState<AddressData>({
    street: null,
    neighborhood: null,
    city: null,
    state: null,
    fullAddress: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<{ lat: number; lon: number } | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (latitude === null || longitude === null) return;

    // Don't fetch if coordinates haven't changed significantly (50 meters threshold)
    if (lastFetchRef.current) {
      const latDiff = Math.abs(latitude - lastFetchRef.current.lat);
      const lonDiff = Math.abs(longitude - lastFetchRef.current.lon);
      // Approximately 50 meters
      if (latDiff < 0.0005 && lonDiff < 0.0005) return;
    }

    // Debounce to avoid too many requests
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "pt-BR,pt",
              "User-Agent": "SpeedometerApp/1.0",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Falha ao obter endereço");
        }

        const data = await response.json();

        if (data && data.address) {
          const addr = data.address;
          const street = addr.road || addr.pedestrian || addr.footway || addr.path || null;
          const neighborhood = addr.suburb || addr.neighbourhood || addr.district || null;
          const city = addr.city || addr.town || addr.village || addr.municipality || null;
          const state = addr.state || null;

          // Build full address
          const parts = [street, neighborhood, city].filter(Boolean);
          const fullAddress = parts.length > 0 ? parts.join(", ") : null;

          setAddress({
            street,
            neighborhood,
            city,
            state,
            fullAddress,
          });

          lastFetchRef.current = { lat: latitude, lon: longitude };
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    }, 2000); // Wait 2 seconds before fetching to respect rate limits

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [latitude, longitude]);

  return { address, isLoading, error };
};
