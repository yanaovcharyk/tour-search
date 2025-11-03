import styles from "./Input.module.scss";

interface InputProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onClick?: () => void;
  onClear?: () => void;
}

export const Input = ({
  value,
  placeholder,
  onChange,
  onClick,
  onClear,
}: InputProps) => {
  return (
    <div className={styles.field}>
      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={onClick}
      />
      {value && (
        <button type="button" className={styles.clear} onClick={onClear}>
          ×
        </button>
      )}
    </div>
  );
};
