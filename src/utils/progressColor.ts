export const PROGRESS_COLORS = {
  complete:    "#4caf50",  // green  — poll finished / petition over goal
  inProgress:  "#f97316",  // orange — poll started / petition has signatures
  empty:       "#4b5563",  // grey   — nothing yet
} as const;

/**
 * Returns the correct progress bar colour based on how far along something is.
 * @param progress  0–1 value
 * @param complete  explicit override — pass true when the item is definitively done
 *                  (e.g. poll `state === "completed"`, petition `signatures >= goal`)
 */
export function getProgressColor(progress: number, complete: boolean): string {
  if (complete || progress >= 1) return PROGRESS_COLORS.complete;
  if (progress > 0)              return PROGRESS_COLORS.inProgress;
  return PROGRESS_COLORS.empty;
}
