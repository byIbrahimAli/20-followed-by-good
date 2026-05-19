"use client";

import AccountabilityPairCard from "@/components/fbg/community/AccountabilityPairCard";
import CircleLeaderboardCard from "@/components/fbg/community/CircleLeaderboardCard";
import NudgeArrivesCard from "@/components/fbg/community/NudgeArrivesCard";
import c from "@/components/fbg/community/community.module.css";
import TopAppBar from "@/components/fbg/ui/TopAppBar";

export default function CommunityPage() {
  return (
    <>
      <TopAppBar title="Community" />

      <div className={c.page}>
        <section>
          <CircleLeaderboardCard />
        </section>

        <section>
          <AccountabilityPairCard />
        </section>

        <section>
          <NudgeArrivesCard />
        </section>
      </div>
    </>
  );
}
