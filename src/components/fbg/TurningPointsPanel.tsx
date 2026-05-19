import Link from "next/link";

import ui from "@/components/fbg/ui/ui.module.css";
import type { TurningPointsSummary } from "@/lib/fbg/turning-points";

interface TurningPointsPanelProps {
  summary: TurningPointsSummary;
}

export default function TurningPointsPanel({ summary }: TurningPointsPanelProps) {
  return (
    <section className={ui.turningPointsCard}>
      <h2 className={ui.turningPointsTitle}>Your turning points</h2>
      <p className={ui.turningPointsSubtitle}>
        Every slip became an ayah held in your heart
      </p>

      <div className={ui.turningPointsStats}>
        <article className={ui.turningPointsStat}>
          <p className={ui.turningPointsStatValue}>{summary.ayatRetained}</p>
          <p className={ui.turningPointsStatLabel}>ayat retained</p>
        </article>
        <article className={ui.turningPointsStat}>
          <p className={ui.turningPointsStatValue}>{summary.dueToReview}</p>
          <p className={ui.turningPointsStatLabel}>due to review</p>
        </article>
      </div>

      {summary.recentByTag.length > 0 ? (
        <ul className={ui.turningPointsList}>
          {summary.recentByTag.map((entry) => (
            <li className={ui.turningPointsRow} key={entry.category}>
              <Link className={ui.turningPointsLink} href={entry.href}>
                <span
                  className={ui.turningPointsIcon}
                  style={{ color: entry.iconColor }}
                >
                  <span className={ui.materialIcon} aria-hidden>
                    {entry.icon}
                  </span>
                </span>
                <span className={ui.turningPointsText}>
                  <span className={ui.turningPointsCategory}>{entry.category}</span>
                  <span className={ui.turningPointsArrow}> → </span>
                  <span className={ui.turningPointsReference}>{entry.reference}</span>
                  <span className={ui.turningPointsDot}> · </span>
                  <span
                    className={
                      entry.memorized
                        ? ui.turningPointsStatusMemorized
                        : ui.turningPointsStatusReview
                    }
                  >
                    {entry.statusLabel}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={ui.turningPointsEmpty}>
          Log a slip on Home to start building your turning points.
        </p>
      )}
    </section>
  );
}
