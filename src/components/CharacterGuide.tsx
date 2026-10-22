import { useMemo, useState } from "react";
import { Search, Skull } from "lucide-react";
import { HOUSES } from "@/data/got";
import type { CodexEntry } from "@/lib/tree";
import { Portrait, houseText, houseBorder } from "@/components/FamilyTree";

const HOUSE_FILTER = "Great houses";

export function CharacterGuide({ entries, selectedId, onSelect }: {
  entries: CodexEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [filter, setFilter] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "alive" | "dead">("all");

  const known = entries.filter((p) => p.house || p.group);
  const groups = useMemo(
    () => [HOUSE_FILTER, ...Array.from(new Set(known.map((p) => p.group).filter(Boolean) as string[]))],
    [known],
  );
  const list = known
    .filter((p) => !filter || (filter === HOUSE_FILTER ? !!p.house : p.group === filter))
    .filter((p) => status === "all" || (status === "dead") === p.dead)
    .filter((p) => !q.trim() || p.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const chip = (active: boolean) =>
    `shrink-0 border px-3 py-1 font-display text-[10px] uppercase tracking-widest transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:border-primary hover:text-foreground"}`;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-primary text-glow">Characters of Westeros</h1>
            <p className="text-muted-foreground">Everyone you have met so far — and only what you know about them.</p>
          </div>
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search characters"
              className="w-56 border bg-secondary py-2 pl-8 pr-2 text-sm outline-none focus:border-primary" />
          </div>
        </div>
        <div className="mb-3 flex gap-2 overflow-x-auto py-2">
          <button className={chip(filter === null)} onClick={() => setFilter(null)}>Everyone</button>
          {groups.map((g) => <button key={g} className={chip(filter === g)} onClick={() => setFilter(filter === g ? null : g)}>{g}</button>)}
        </div>
        <div className="mb-5 flex gap-2">
          {(["all", "alive", "dead"] as const).map((s) => (
            <button key={s} className={chip(status === s)} onClick={() => setStatus(s)}>{s === "all" ? "Any status" : s === "alive" ? "Alive" : "Deceased"}</button>
          ))}
          <span className="ml-auto self-center text-xs text-muted-foreground">{list.length} shown</span>
        </div>

        {list.length === 0 ? (
          <p className="py-16 text-center font-display text-muted-foreground">No one by that name… yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 pb-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {list.map((p) => (
              <li key={p.id}>
                <button onClick={() => onSelect(p.id)}
                  className={`group w-full overflow-hidden border bg-card text-left shadow-lg transition-transform hover:-translate-y-1 ${p.house ? houseBorder[p.house] : "border-border"} ${selectedId === p.id ? "ring-2 ring-primary" : ""}`}>
                  <div className="relative">
                    <Portrait person={p} className="aspect-[3/4] w-full" />
                    {p.dead && <Skull size={16} className="absolute right-2 top-2 text-destructive" />}
                  </div>
                  <div className="p-2.5">
                    <div className={`font-display text-sm leading-tight ${p.dead ? "text-muted-foreground" : ""}`}>{p.name}</div>
                    <div className={`mt-1 font-display text-[10px] uppercase tracking-widest ${p.house ? houseText[p.house] : "text-muted-foreground"}`}>
                      {p.house ? `House ${HOUSES[p.house].name}` : p.group}
                    </div>
                    {p.facts.length > 0 && <div className="mt-1 text-[10px] text-muted-foreground">{p.facts.length} known event{p.facts.length > 1 ? "s" : ""}</div>}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
