import styles from "./SearchResults.module.scss";
import type { Hotel } from "../../hooks/useHotels";

type Price = {
  id: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  hotelID: string;
};

type Props = {
  prices: Price[];
  hotelsMap: Record<string, Hotel>;
  isLoading: boolean;
  error?: string | null;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatMoney = (amount: number, currency: string) => {
  const nf = new Intl.NumberFormat("uk-UA");
  return `${nf.format(amount)} ${currency.toUpperCase()}`;
};

export function SearchResults({
  prices,
  hotelsMap,
  isLoading,
  error,
}: Props) {
  return (
    <section className={styles.container} aria-live="polite">
      {isLoading && <div className={styles.info}>Завантаження результатів…</div>}

      {!!error && (
        <div className={`${styles.info} ${styles.error}`}>
          Помилка: {error}
        </div>
      )}

      {!isLoading && !error && prices.length === 0 && (
        <div className={styles.info}>За вашим запитом турів не знайдено</div>
      )}

      {!isLoading && !error && prices.length > 0 && (
        <ul className={styles.grid}>
          {prices.map((p) => {
            const hotel = hotelsMap[p.hotelID];
            if (!hotel) return null;

            return (
              <li key={p.id} className={styles.card}>
                <img
                  className={styles.image}
                  src={hotel.img}
                  alt={hotel.name}
                  loading="lazy"
                />
                <div className={styles.body}>
                  <h3 className={styles.title}>{hotel.name}</h3>
                  <div className={styles.meta}>
                    {hotel.countryName}, {hotel.cityName}
                  </div>
                  <div className={styles.dates}>
                    Старт туру: {formatDate(p.startDate)}
                  </div>
                  <div className={styles.price}>
                    {formatMoney(p.amount, p.currency)}
                  </div>
                  <a
                    className={styles.link}
                    href={`/price/${p.id}?hotelId=${hotel.id}`}
                  >
                    Відкрити ціну
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
