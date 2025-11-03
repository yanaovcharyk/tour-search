import { useEffect, useRef, useState } from "react";
import { getHotels } from "../api/api.js";

export type Hotel = {
  id: number;
  name: string;
  img: string;
  cityId: number;
  cityName: string;
  countryId: string;
  countryName: string;
};

type HotelsMap = Record<string, Hotel>;
type Status = "idle" | "loading" | "success" | "error";

export function useHotels(countryID?: string) {
  const cacheRef = useRef<Map<string, HotelsMap>>(new Map());
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hotels, setHotels] = useState<HotelsMap>({});

  useEffect(() => {
    if (!countryID) return;

    const cached = cacheRef.current.get(countryID);
    if (cached) {
      setHotels(cached);
      setStatus("success");
      return;
    }

    let alive = true;
    (async () => {
      try {
        setStatus("loading");
        const res = await getHotels(countryID);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.message || `Помилка ${res.status}`);
        }
        const data = (await res.json()) as HotelsMap;
        if (!alive) return;
        cacheRef.current.set(countryID, data);
        setHotels(data);
        setStatus("success");
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Не вдалося завантажити готелі");
        setStatus("error");
      }
    })();

    return () => { alive = false; };
  }, [countryID]);

  return { status, error, hotels };
}
