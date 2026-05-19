import ui from "./ui.module.css";

interface ChipProps {
  label: string;
  variant?: "neutral" | "error";
  onClick?: () => void;
}

export default function Chip({ label, variant = "neutral", onClick }: ChipProps) {
  const className = variant === "error" ? ui.chipError : ui.chip;
  return (
    <button className={className} onClick={onClick} type="button">
      {label}
    </button>
  );
}
