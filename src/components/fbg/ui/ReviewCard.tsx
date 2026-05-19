import Link from "next/link";

import ProgressBar from "./ProgressBar";
import ui from "./ui.module.css";

interface ReviewCardProps {
  href: string;
  title: string;
  subtitle: string;
  arabicSnippet?: string;
  percent: number;
}

export default function ReviewCard({
  href,
  title,
  subtitle,
  arabicSnippet,
  percent,
}: ReviewCardProps) {
  return (
    <Link className={ui.reviewCard} href={href}>
      <p className={ui.reviewMeta}>{title}</p>
      {arabicSnippet ? <p className={ui.reviewArabic}>{arabicSnippet}</p> : null}
      <p className={ui.reviewMeta}>{subtitle}</p>
      <ProgressBar percent={percent} />
      <p className={ui.reviewMeta} style={{ marginTop: "0.35rem" }}>
        {percent}% retention
      </p>
    </Link>
  );
}
