import styles from "./SearchResults.module.scss";
import type { Hotel } from "../../hooks/useHotels";
import { Link } from "react-router-dom";
import { formatDate, formatMoney } from "../../utils/formatters";

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


export function SearchResults({ prices, hotelsMap, isLoading, error }: Props) {
  return (
    <section className={styles.container} aria-live="polite">
      {isLoading && (
        <div className={styles.info}>Завантаження результатів…</div>
      )}

      {!!error && (
        <div className={`${styles.info} ${styles.error}`}>Помилка: {error}</div>
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
                  <Link
                    className={styles.link}
                    to={`/tour/${hotel.id}/${p.id}`}
                  >
                    Відкрити ціну
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
