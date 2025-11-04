import { useCallback, useRef, useState, useEffect } from "react";
import {
  startSearchPrices,
  getSearchPrices,
  stopSearchPrices,
} from "../api/api.js";

type Price = {
  id: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  hotelID: string;
};

type PricesResponse = Record<string, Price>;
type Status =
  | "idle"
  | "waiting"
  | "fetching"
  | "success"
  | "error"
  | "cancelling";

const sleep = (ms: number) =>
  new Promise((r) => setTimeout(r, Math.max(0, ms)));

export function useSearchPrices() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [prices, setPrices] = useState<Price[]>([]);
  const activeToken = useRef<string | null>(null);
  const aliveRef = useRef(true);
  const requestIdRef = useRef(0);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setPrices([]);
  }, []);

  const stopActiveSearch = useCallback(async () => {
    if (!activeToken.current) return;
    setStatus("cancelling");
    try {
      await stopSearchPrices(activeToken.current);
    } catch (e) {
      console.warn("Не вдалося зупинити попередній пошук:", e);
    } finally {
      activeToken.current = null;
    }
  }, []);

  const start = useCallback(
    async (countryID: string) => {
      const currentRequestId = ++requestIdRef.current;

      if (activeToken.current) {
        await stopActiveSearch();
      }

      reset();
      setStatus("waiting");

      try {
        const res = await startSearchPrices(countryID);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.message || `Помилка ${res.status}`);
        }
        const { token, waitUntil } = (await res.json()) as {
          token: string;
          waitUntil: string;
        };

        activeToken.current = token;

        const delay = new Date(waitUntil).getTime() - Date.now();
        await sleep(delay);

        let attempts = 0;
        let lastErr: unknown = null;

        setStatus("fetching");
        while (attempts < 3) {
          try {
            const r = await getSearchPrices(token);
            if (!r.ok) {
              const e = await r.json().catch(() => ({}));
              throw new Error(e?.message || `Помилка ${r.status}`);
            }
            const body = (await r.json()) as { prices: PricesResponse };
            const list = Object.values(body.prices).sort(
              (a, b) => a.amount - b.amount
            );

            if (!aliveRef.current || requestIdRef.current !== currentRequestId)
              return;

            setPrices(list);
            setStatus("success");
            return;
          } catch (e) {
            lastErr = e;
            attempts += 1;
            if (attempts < 3) await sleep(500 * attempts);
          }
        }

        if (!aliveRef.current || requestIdRef.current !== currentRequestId)
          return;
        const message =
          lastErr instanceof Error
            ? lastErr.message
            : "Сталася помилка під час пошуку";
        setError(message);
        setStatus("error");
      } catch (e) {
        if (!aliveRef.current || requestIdRef.current !== currentRequestId)
          return;
        const message =
          e instanceof Error ? e.message : "Сталася помилка під час пошуку";
        setError(message);
        setStatus("error");
      }
    },
    [reset, stopActiveSearch]
  );

  const isLoading =
    status === "waiting" || status === "fetching" || status === "cancelling";

  return {
    status,
    error,
    prices,
    start,
    isLoading,
  };
}
