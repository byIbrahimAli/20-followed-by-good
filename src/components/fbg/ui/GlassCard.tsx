import ui from "./ui.module.css";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export default function GlassCard({ children, className, id }: GlassCardProps) {
  return (
    <section className={`${ui.glassCard} ${className ?? ""}`.trim()} id={id}>
      {children}
    </section>
  );
}
