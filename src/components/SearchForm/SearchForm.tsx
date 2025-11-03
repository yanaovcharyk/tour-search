import { useEffect, useState, useRef } from "react";
import styles from "./SearchForm.module.scss";
import { Input } from "./Input/Input.js";
import { Dropdown } from "./Dropdown/Dropdown.js";
import { Button } from "./Button/Button.js";
import { getCountries, searchGeo } from "../../api/api.js";
import type { GeoEntity } from "../../types/geo.js";
import { useSearchPrices } from "../../hooks/useSearchPrices.js";

export const SearchForm = () => {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<GeoEntity[]>([]);
  const [selected, setSelected] = useState<GeoEntity | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  const { start, status, error, isLoading, prices } = useSearchPrices();

  const loadCountries = async () => {
    const res = await getCountries();
    const data = await res.json();
    const arr = Object.values(data) as Omit<GeoEntity, "type">[];

    const withType: GeoEntity[] = arr.map((item) => ({
      ...item,
      flag: "flag" in item ? (item as { flag?: string }).flag ?? "" : "",
      type: "country" as const,
    }));

    setOptions(withType);
  };

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (!isOpen) setIsOpen(true);

    if (!value.trim()) {
      await loadCountries();
      return;
    }

    const res = await searchGeo(value);
    const data = await res.json();
    const arr = Object.values(data) as GeoEntity[];
    setOptions(arr);
  };

  const handleInputClick = async () => {
    setIsOpen(true);
    if (!selected || selected.type === "country") {
      await loadCountries();
    } else {
      const res = await searchGeo(query);
      const data = await res.json();
      setOptions(Object.values(data) as GeoEntity[]);
    }
  };

  const handleSelect = (item: GeoEntity) => {
    setSelected(item);
    setQuery(item.name);
    setIsOpen(false);
  };

  const clearInput = () => {
    setQuery("");
    setSelected(null);
    loadCountries();
    setIsOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!inputRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);

    if (!selected) return;

    let countryID: string | undefined;

    if (selected.type === "country") {
      countryID = String(selected.id);
    } else if ("countryId" in selected && selected.countryId) {
      countryID = String(selected.countryId);
    } else {
      const anyCountry = options.find((o) => o.type === "country");
      if (anyCountry) {
        countryID = String(anyCountry.id);
      }
    }

    if (!countryID) {
      alert(
        "Щоб запустити пошук, оберіть країну або елемент з відомою країною."
      );
      return;
    }

    await start(countryID);
  };

  return (
    <>
      <div className={styles.wrapper}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>Форма пошуку турів</label>

          <div className={styles.inputBlock} ref={inputRef}>
            <Input
              value={query}
              placeholder="Куди хочете поїхати?"
              onChange={handleSearch}
              onClick={handleInputClick}
              onClear={clearInput}
            />
            {isOpen && options.length > 0 && (
              <Dropdown options={options} onSelect={handleSelect} />
            )}
          </div>

          <div className={styles.footer}>
            <Button type="submit">{isLoading ? "Пошук…" : "Знайти"}</Button>
          </div>
        </form>

        <div className={styles.statusBlock}>
          {isLoading && (
            <div style={{ marginTop: 12 }}>
              Завантаження… (очікуємо результати)
            </div>
          )}

          {status === "error" && (
            <div style={{ marginTop: 12, color: "#c00" }}>
              Помилка: {error || "Не вдалося отримати результати"}
            </div>
          )}

          {status === "success" && prices.length === 0 && (
            <div style={{ marginTop: 12 }}>
              За вашим запитом турів не знайдено
            </div>
          )}

          {status === "success" && prices.length > 0 && (
            <div style={{ marginTop: 12 }}>
              Знайдено пропозицій: {prices.length}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
