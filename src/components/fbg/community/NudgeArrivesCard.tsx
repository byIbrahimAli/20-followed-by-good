"use client";

import DemoInteract from "@/components/fbg/DemoInteract";

import c from "./community.module.css";

export default function NudgeArrivesCard() {
  return (
    <article className={c.card}>
      <DemoInteract className={c.nudgeHeader} type="button">
        <span className={`${c.avatar} ${c.avatarBr}`}>BR</span>
        <span>
          <p className={c.nudgeSender}>Bilal sent you a reminder</p>
          <p className={c.nudgeTime}>2 minutes ago</p>
        </span>
      </DemoInteract>

      <DemoInteract className={c.messageBubble} type="button">
        3 ayat waiting for you, akhi. Don&apos;t let them slip. I just did mine — your
        turn.
      </DemoInteract>

      <DemoInteract className={c.infoBox} type="button">
        He can see that you have reviews due — never why you logged them.
      </DemoInteract>

      <DemoInteract className={c.primaryCta} type="button">
        Start my 3 reviews →
      </DemoInteract>
    </article>
  );
}
