import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPrice, getHotel } from "../../api/api";
import styles from "./TourPage.module.scss";
import {
  MapPin,
  Building2,
  Calendar,
  Wifi,
  Waves,
  UtensilsCrossed,
  Dumbbell,
  ParkingCircle,
  Shirt,
} from "lucide-react";
import { formatDate, formatMoney } from "../../utils/formatters";

type Price = {
  id: string;
  amount: number;
  currency?: string;
  startDate: string;
  endDate: string;
};

type Hotel = {
  id: string;
  name: string;
  countryName: string;
  cityName: string;
  img: string;
  description?: string;
  services?: Record<string, string>;
};

export function TourPage() {
  const { priceId, hotelId } = useParams();

  const [price, setPrice] = useState<Price | null>(null);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!priceId || !hotelId) return;

    (async () => {
      try {
        setLoading(true);

        const [priceResp, hotelResp] = await Promise.all([
          getPrice(priceId),
          getHotel(Number(hotelId)),
        ]);

        if (!priceResp.ok || !hotelResp.ok) {
          throw new Error("Помилка отримання даних");
        }

        const [priceData, hotelData] = await Promise.all([
          priceResp.json(),
          hotelResp.json(),
        ]);

        setPrice(priceData);
        setHotel(hotelData);
      } catch (e) {
        console.error(e);
        setError("Не вдалося завантажити дані туру");
      } finally {
        setLoading(false);
      }
    })();
  }, [priceId, hotelId]);

  const serviceIcons: Record<string, { icon: React.ReactNode; label: string }> =
    {
      wifi: { icon: <Wifi size={14} />, label: "Wi-Fi" },
      aquapark: { icon: <Waves size={14} />, label: "Басейн" },
      tennis_court: { icon: <Dumbbell size={14} />, label: "Теніс" },
      laundry: { icon: <Shirt size={14} />, label: "Прання" },
      parking: { icon: <ParkingCircle size={14} />, label: "Паркінг" },
      food: { icon: <UtensilsCrossed size={14} />, label: "Харчування" },
    };

  if (loading) return <div className={styles.center}>Завантаження…</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!hotel || !price)
    return <div className={styles.center}>Дані відсутні</div>;

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>{hotel.name}</h2>

        <div className={styles.meta}>
          <span>
            {" "}
            <MapPin size={18} /> {hotel.countryName}
          </span>
          <span>
            <Building2 size={18} /> {hotel.cityName}
          </span>
        </div>

        <img className={styles.image} src={hotel.img} alt={hotel.name} />

        <div className={styles.section}>
          <h3>Опис</h3>
          <p>{hotel.description || "Немає опису для цього готелю."}</p>
        </div>

        {hotel.services && Object.keys(hotel.services).length > 0 && (
          <div className={styles.section}>
            <h3>Сервіси</h3>
            <ul className={styles.services}>
              {Object.entries(hotel.services)
                .filter(([, val]) => val === "yes")
                .map(([key]) => {
                  const s = serviceIcons[key];
                  if (!s) return null;
                  return (
                    <li key={key}>
                      {s.icon}
                      <span>{s.label}</span>
                    </li>
                  );
                })}
            </ul>
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.date}>
            <Calendar size={18} /> {formatDate(price.startDate)}
          </div>
          <div className={styles.priceWrapper}>
            <div className={styles.price}>
              {formatMoney(price.amount, price.currency)}
            </div>

            <Link to="/" className={styles.button}>
              Відкрити ціну
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
