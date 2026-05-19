export interface CategoryDisplay {
  icon: string;
  color: string;
}

const CATEGORY_DISPLAY: Record<string, CategoryDisplay> = {
  Anger: { icon: "local_fire_department", color: "#f97316" },
  "Mindful Time": { icon: "schedule", color: "#eab308" },
  Speech: { icon: "forum", color: "#a78bfa" },
  "Prayer Consistency": { icon: "mosque", color: "#95d3ba" },
  Honesty: { icon: "gavel", color: "#94a3b8" },
  "Lower Gaze": { icon: "visibility_off", color: "#f472b6" },
  Contentment: { icon: "favorite", color: "#fb923c" },
  Gratitude: { icon: "volunteer_activism", color: "#86efac" },
  Family: { icon: "family_restroom", color: "#67e8f9" },
  "Self-Discipline": { icon: "fitness_center", color: "#d4a574" },
  Reflection: { icon: "self_improvement", color: "#a8a29e" },
};

const DEFAULT_DISPLAY: CategoryDisplay = {
  icon: "bookmark",
  color: "#95d3ba",
};

export const getCategoryDisplay = (category: string): CategoryDisplay =>
  CATEGORY_DISPLAY[category] ?? DEFAULT_DISPLAY;
