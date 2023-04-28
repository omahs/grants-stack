import { useNavigate } from "react-router-dom";

export enum ButtonVariants {
  primary = "primary",
  secondary = "secondary",
  outline = "outline",
  danger = "danger",
  outlineDanger = "danger-outline",
}

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant: ButtonVariants;
  disabled?: boolean;
  styles?: string[];
}

function Button({
  onClick,
  children,
  variant,
  disabled,
  styles,
}: ButtonProps) {

  const clickHandler = () => {
    if (onClick) onClick();
  };

  return (
    <button
      disabled={disabled}
      onClick={clickHandler}
      className={`base-btn ${variant} ${styles?.join(" ")}`}
      type="button"
    >
      {children}
    </button>
  );
}

export default Button;
