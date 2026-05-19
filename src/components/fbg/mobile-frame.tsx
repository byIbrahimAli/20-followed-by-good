import styles from "./mobile-frame.module.css";

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className={styles.outer}>
      <div className={styles.device}>
        <div className={styles.viewport}>{children}</div>
      </div>
    </div>
  );
}
