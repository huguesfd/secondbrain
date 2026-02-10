type ManualStatus = "IN_PROGRESS" | "MASTERED" | null;
type ComputedStatus = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "MASTERED";

export type NodeRow = {
  subjectSlug: string;
  nodeSlug: string;
  title: string;
  level: number;
  manualStatus: ManualStatus;
};

export type EdgeRow = {
  subjectSlug: string;
  from: string; // prereq nodeSlug
  to: string;   // dependent nodeSlug
};

export const nodeKey = (subjectSlug: string, nodeSlug: string) => `${subjectSlug}/${nodeSlug}`;

export function prereqsFor(subjectSlug: string, nodeSlug: string, edges: EdgeRow[]): string[] {
  return edges
    .filter(e => e.subjectSlug === subjectSlug && e.to === nodeSlug)
    .map(e => nodeKey(subjectSlug, e.from));
}

export function computeStatuses(nodes: NodeRow[], edges: EdgeRow[]): Map<string, ComputedStatus> {
  const map = new Map<string, ComputedStatus>();
  const byKey = new Map(nodes.map(n => [nodeKey(n.subjectSlug, n.nodeSlug), n]));

  const getStatus = (key: string): ComputedStatus => {
    if (map.has(key)) return map.get(key)!;
    const n = byKey.get(key);
    if (!n) return "LOCKED";

    if (n.manualStatus === "MASTERED") { map.set(key, "MASTERED"); return "MASTERED"; }
    if (n.manualStatus === "IN_PROGRESS") { map.set(key, "IN_PROGRESS"); return "IN_PROGRESS"; }

    const prereqKeys = prereqsFor(n.subjectSlug, n.nodeSlug, edges);
    if (prereqKeys.length === 0) { map.set(key, "AVAILABLE"); return "AVAILABLE"; }

    const ok = prereqKeys.every(pk => getStatus(pk) === "MASTERED");
    const status: ComputedStatus = ok ? "AVAILABLE" : "LOCKED";
    map.set(key, status);
    return status;
  };

  for (const n of nodes) getStatus(nodeKey(n.subjectSlug, n.nodeSlug));
  return map;
}

export function subjectProgress(subjectSlug: string, nodes: NodeRow[], statuses: Map<string, ComputedStatus>) {
  const subjectNodes = nodes.filter(n => n.subjectSlug === subjectSlug);
  const total = subjectNodes.length || 0;
  const mastered = subjectNodes.filter(n => statuses.get(nodeKey(n.subjectSlug, n.nodeSlug)) === "MASTERED").length;
  return { total, mastered, progress: total ? mastered / total : 0 };
}