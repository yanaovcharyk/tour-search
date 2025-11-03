import { useCallback, useRef, useState, useEffect } from "react";
import { startSearchPrices, getSearchPrices } from "../api/api.js";

type Price = {
  id: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  hotelID: string;
};

type PricesResponse = Record<string, Price>;
type Status = "idle" | "waiting" | "fetching" | "success" | "error";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, Math.max(0, ms)));

export function useSearchPrices() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [prices, setPrices] = useState<Price[]>([]);

  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setPrices([]);
  }, []);

  const start = useCallback(async (countryID: string) => {
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
          const list = Object.values(body.prices).sort((a, b) => a.amount - b.amount);

          if (!aliveRef.current) return;
          setPrices(list);
          setStatus("success");
          return;
        } catch (e) {
          lastErr = e;

          attempts += 1;
          if (attempts < 3) await sleep(500 * attempts);
        }
      }

      if (!aliveRef.current) return;
      const message =
        lastErr instanceof Error
          ? lastErr.message
          : "Сталася помилка під час пошуку";
      setError(message);
      setStatus("error");
    } catch (e) {
      if (!aliveRef.current) return;
      const message =
        e instanceof Error ? e.message : "Сталася помилка під час пошуку";
      setError(message);
      setStatus("error");
    }
  }, [reset]);

  return {
    status,
    error,
    prices,
    start,
    isLoading: status === "waiting" || status === "fetching",
  };
}
