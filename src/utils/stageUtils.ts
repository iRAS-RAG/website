import dayjs from "dayjs";
import type { PlannedStage } from "../types/batch";
import type { IFeedType } from "../types/operatorBatch";

function normalize(input?: string | null): string {
  return (input ?? "").toString().trim().toLowerCase();
}

export function getActiveStage(stages?: PlannedStage[] | null, batchStageName?: string): PlannedStage | undefined {
  if (!stages || stages.length === 0) return undefined;
  const now = dayjs();

  // 1) prefer actual start/end dates
  for (const st of stages) {
    if (st.actualStartDate) {
      const aS = dayjs(st.actualStartDate);
      const aE = st.actualEndDate ? dayjs(st.actualEndDate) : null;
      const started = now.isSame(aS) || now.isAfter(aS);
      const notEnded = !aE || now.isSame(aE) || now.isBefore(aE);
      if (started && notEnded) return st;
    }
  }

  // 2) then use estimated dates
  for (const st of stages) {
    if (st.estimatedStartDate) {
      const eS = dayjs(st.estimatedStartDate);
      const eE = st.estimatedEndDate ? dayjs(st.estimatedEndDate) : null;
      const started = now.isSame(eS) || now.isAfter(eS);
      const notEnded = !eE || now.isSame(eE) || now.isBefore(eE);
      if (started && notEnded) return st;
    }
  }

  // 3) fallback to matching by stage name
  if (batchStageName) {
    const target = normalize(batchStageName);
    const byName = stages.find((s) => normalize(s.stageName) === target);
    if (byName) return byName;
  }

  // 4) choose the most recent past stage (by actualStartDate or estimatedStartDate)
  const pastWithStart = stages
    .map((st) => {
      const start = st.actualStartDate ? dayjs(st.actualStartDate) : st.estimatedStartDate ? dayjs(st.estimatedStartDate) : null;
      return { st, start };
    })
    .filter((x) => x.start && (x.start.isBefore(now) || x.start.isSame(now)))
    .sort((a, b) => b.start!.valueOf() - a.start!.valueOf());

  if (pastWithStart.length > 0) return pastWithStart[0].st;

  // 5) final fallback: first stage
  return stages[0];
}

export function filterFeedTypesForStage(feedTypes: IFeedType[] | undefined, stage?: PlannedStage | undefined): IFeedType[] {
  if (!Array.isArray(feedTypes)) return [];
  if (!stage || !Array.isArray(stage.feedTypeNames) || stage.feedTypeNames.length === 0) return feedTypes;

  const allowed = new Set(stage.feedTypeNames.map((n) => normalize(n)));

  return feedTypes.filter((ft) => {
    const name = normalize((ft as any).name ?? "");
    const id = normalize(String((ft as any).id ?? ""));
    return allowed.has(name) || allowed.has(id);
  });
}
