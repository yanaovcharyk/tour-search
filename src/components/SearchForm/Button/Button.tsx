import styles from "./Button.module.scss";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button = ({ type = "button", onClick, children }: ButtonProps) => (
  <button type={type} onClick={onClick} className={styles.button}>
    {children}
  </button>
);
