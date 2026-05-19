import ui from "./ui.module.css";

interface ProgressBarProps {
  percent: number;
}

export default function ProgressBar({ percent }: ProgressBarProps) {
  return (
    <div className={ui.progressBar}>
      <div className={ui.progressFill} style={{ width: `${Math.min(100, percent)}%` }} />
    </div>
  );
}
