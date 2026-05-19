"use client";

import DemoInteract from "@/components/fbg/DemoInteract";
import ui from "@/components/fbg/ui/ui.module.css";

import c from "./community.module.css";

export default function AccountabilityPairCard() {
  return (
    <article className={c.card}>
      <h2 className={c.cardTitle}>Your sahib in deen</h2>
      <p className={c.cardSubtitle}>
        One trusted partner. Mutual encouragement, no judgement.
      </p>

      <DemoInteract className={c.partnerRow} type="button">
        <span className={`${c.avatar} ${c.avatarBr}`}>BR</span>
        <span>
          <p className={c.partnerName}>Bilal R.</p>
          <p className={c.partnerMeta}>Paired 18 days · both on track</p>
        </span>
      </DemoInteract>

      <div className={c.statsRow}>
        <DemoInteract className={c.statBox} type="button">
          <p className={c.statValue}>9</p>
          <p className={c.statLabel}>your reviews due</p>
        </DemoInteract>
        <DemoInteract className={c.statBox} type="button">
          <p className={c.statValue}>4</p>
          <p className={c.statLabel}>Bilal&apos;s reviews due</p>
        </DemoInteract>
      </div>

      <div className={c.actionRow}>
        <DemoInteract className={c.outlineBtn} type="button">
          <span className={ui.materialIcon} aria-hidden>
            send
          </span>
          Send dua
        </DemoInteract>
        <DemoInteract className={c.outlineBtn} type="button">
          <span className={ui.materialIcon} aria-hidden>
            notifications
          </span>
          Nudge
        </DemoInteract>
      </div>
    </article>
  );
}
