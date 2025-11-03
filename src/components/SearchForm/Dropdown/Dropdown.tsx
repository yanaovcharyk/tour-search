import styles from "./Dropdown.module.scss";
import { Building2, Bed } from "lucide-react";
import type { GeoEntity } from "../../../types/geo";

export const Dropdown = ({
  options,
  onSelect,
}: {
  options: GeoEntity[];
  onSelect: (item: GeoEntity) => void;
}) => {
  return (
    <ul className={styles.dropdown}>
      {options.map((item) => (
        <li
          key={item.id}
          className={styles.option}
          onClick={() => onSelect(item)}
        >
          <span className={styles.icon}>
            {item.type === "country" && item.flag && (
              <img src={item.flag} alt={item.name} width={18} />
            )}
            {item.type === "city" && <Building2 size={18} />}
            {item.type === "hotel" && <Bed size={18} />}
          </span>
          <span>{item.name}</span>
        </li>
      ))}
    </ul>
  );
};
