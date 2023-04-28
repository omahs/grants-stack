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

  return (
    <button
      disabled={disabled}
      onClick={() => onClick ? onClick() : null}
      className={`base-btn ${variant} ${styles?.join(" ")}`}
      type="button"
    >
      {children}
    </button>
  );
}

export default Button;
