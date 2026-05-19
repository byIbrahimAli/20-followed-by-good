import Link from "next/link";

import ui from "./ui.module.css";

interface ReviewCardProps {
  href: string;
  title: string;
  subtitle: string;
  arabicSnippet?: string;
  memorized: boolean;
}

export default function ReviewCard({
  href,
  title,
  subtitle,
  arabicSnippet,
  memorized,
}: ReviewCardProps) {
  return (
    <Link className={ui.reviewCard} href={href}>
      <div className={ui.reviewCardHeader}>
        <p className={ui.reviewMeta}>{title}</p>
        <span
          className={memorized ? ui.statusBadgeMemorized : ui.statusBadgeLearning}
        >
          <span className={ui.materialIcon} aria-hidden>
            {memorized ? "check_circle" : "school"}
          </span>
          {memorized ? "Memorized" : "Learning"}
        </span>
      </div>
      {arabicSnippet ? <p className={ui.reviewArabic}>{arabicSnippet}</p> : null}
      <p className={ui.reviewMeta}>{subtitle}</p>
    </Link>
  );
}
