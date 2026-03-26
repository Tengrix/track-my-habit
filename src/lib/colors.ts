export const TOPIC_COLORS = [
  "slate",
  "red",
  "orange",
  "amber",
  "emerald",
  "teal",
  "sky",
  "blue",
  "violet",
  "purple",
  "pink",
  "rose",
] as const;

export const TOPIC_COLOR_MAP: Record<string, { bg: string; text: string; border: string; dot: string; accent: string }> = {
  slate:   { bg: "bg-slate-100 dark:bg-slate-800/40",   text: "text-slate-700 dark:text-slate-300",   border: "border-slate-200 dark:border-slate-700",   dot: "bg-slate-400",   accent: "bg-slate-500" },
  red:     { bg: "bg-red-50 dark:bg-red-900/20",        text: "text-red-700 dark:text-red-300",       border: "border-red-200 dark:border-red-800",       dot: "bg-red-400",     accent: "bg-red-500" },
  orange:  { bg: "bg-orange-50 dark:bg-orange-900/20",  text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800", dot: "bg-orange-400",  accent: "bg-orange-500" },
  amber:   { bg: "bg-amber-50 dark:bg-amber-900/20",    text: "text-amber-700 dark:text-amber-300",   border: "border-amber-200 dark:border-amber-800",   dot: "bg-amber-400",   accent: "bg-amber-500" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20",text: "text-emerald-700 dark:text-emerald-300",border: "border-emerald-200 dark:border-emerald-800",dot: "bg-emerald-400",accent: "bg-emerald-500" },
  teal:    { bg: "bg-teal-50 dark:bg-teal-900/20",      text: "text-teal-700 dark:text-teal-300",     border: "border-teal-200 dark:border-teal-800",     dot: "bg-teal-400",    accent: "bg-teal-500" },
  sky:     { bg: "bg-sky-50 dark:bg-sky-900/20",        text: "text-sky-700 dark:text-sky-300",       border: "border-sky-200 dark:border-sky-800",       dot: "bg-sky-400",     accent: "bg-sky-500" },
  blue:    { bg: "bg-blue-50 dark:bg-blue-900/20",      text: "text-blue-700 dark:text-blue-300",     border: "border-blue-200 dark:border-blue-800",     dot: "bg-blue-400",    accent: "bg-blue-500" },
  violet:  { bg: "bg-violet-50 dark:bg-violet-900/20",  text: "text-violet-700 dark:text-violet-300", border: "border-violet-200 dark:border-violet-800", dot: "bg-violet-400",  accent: "bg-violet-500" },
  purple:  { bg: "bg-purple-50 dark:bg-purple-900/20",  text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800", dot: "bg-purple-400",  accent: "bg-purple-500" },
  pink:    { bg: "bg-pink-50 dark:bg-pink-900/20",      text: "text-pink-700 dark:text-pink-300",     border: "border-pink-200 dark:border-pink-800",     dot: "bg-pink-400",    accent: "bg-pink-500" },
  rose:    { bg: "bg-rose-50 dark:bg-rose-900/20",      text: "text-rose-700 dark:text-rose-300",     border: "border-rose-200 dark:border-rose-800",     dot: "bg-rose-400",    accent: "bg-rose-500" },
};

export function getTopicColors(color: string) {
  return TOPIC_COLOR_MAP[color] ?? TOPIC_COLOR_MAP.slate;
}
