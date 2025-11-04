import styles from "./Button.module.scss";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const Button = ({ type = "button", onClick, children, disabled }: ButtonProps) => (
  <button type={type} onClick={onClick} className={styles.button} disabled={disabled}>
    {children}
  </button>
);
