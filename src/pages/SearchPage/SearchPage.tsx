import { useState } from "react";
import { SearchForm } from "../../components/SearchForm/SearchForm";
import { SearchResults } from "../../components/SearchResults/SearchResults";
import { useSearchPrices } from "../../hooks/useSearchPrices";
import { useHotels } from "../../hooks/useHotels";
import styles from "./SearchPage.module.scss";

export function SearchPage() {
  const [countryID, setCountryID] = useState<string | null>(null);
  const { start, error, prices, isLoading } = useSearchPrices();
  const { status: hotelsStatus, error: hotelsError, hotels } = useHotels(countryID || undefined);

  const onSubmit = async (cid: string) => {
    setCountryID(cid);
    await start(cid);
  };

  const mergedError = error || hotelsError || null;
  const loading = isLoading || hotelsStatus === "loading";

  return (
    <div className={styles.page}>
      <SearchForm onSubmit={onSubmit} isLoading={loading} />
      {countryID && (
        <SearchResults
          prices={prices}
          hotelsMap={hotels}
          isLoading={loading}
          error={mergedError}
        />
      )}
    </div>
  );
}
