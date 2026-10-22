import { createFileRoute, useNavigate, ClientOnly } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, Search, Info, Skull, Sparkles, UserPlus } from "lucide-react";
import { SEASONS, HOUSES, ep, type HouseId } from "@/data/got";
import { getTreeState, getChanges, getRelatives, getCodex, epLabel, type TreePerson, type CodexEntry } from "@/lib/tree";
import { CharacterGuide } from "@/components/CharacterGuide";
import { FamilyTree, Portrait, houseText } from "@/components/FamilyTree";
import { PHOTO_CREDITS } from "@/data/credits";

type Search = { s?: number; e?: number; v?: "cast" };

export const Route = createFileRoute("/")({
  validateSearch: (raw: Record<string, unknown>): Search => {
    const s = Number(raw["s"]), e = Number(raw["e"]);
    if (!s || s < 1 || s > 8) return {};
    const max = SEASONS[s - 1]!.length;
    return { s, e: e >= 1 && e <= max ? e : 1, ...(raw["v"] === "cast" ? { v: "cast" as const } : {}) };
  },
  head: () => ({
    meta: [
      { title: "Westeros Bloodlines — Game of Thrones Family Tree" },
      { name: "description", content: "Spoiler-safe Game of Thrones family tree. Pick a season and episode to see who is who, and who is still unknown." },
      { property: "og:title", content: "Westeros Bloodlines — Game of Thrones Family Tree" },
      { property: "og:description", content: "Browse every house's family tree episode by episode, without spoilers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [focus, setFocus] = useState<HouseId | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showChanges, setShowChanges] = useState(true);
  const [showLegend, setShowLegend] = useState(false);

  const started = !!search.s;
  const s = search.s ?? 1;
  const e = search.e ?? 1;
  const at = ep(s, e);
  const state = useMemo(() => getTreeState(at), [at]);
  const changes = useMemo(() => getChanges(at), [at]);
  const codex = useMemo(() => getCodex(at), [at]);
  const view = search.v === "cast" ? "cast" : "tree";
  const selected: CodexEntry | TreePerson | null =
    codex.find((p) => p.id === selectedId) ?? state.people.find((p) => p.id === selectedId) ?? null;

  const go = (ns: number, ne: number) => navigate({ search: (prev) => ({ ...prev, s: ns, e: ne }) });
  const setView = (v: "tree" | "cast") => navigate({ search: { s, e, ...(v === "cast" ? { v } : {}) } });
  const step = (d: number) => {
    let ns = s, ne = e + d;
    if (ne < 1) { if (ns === 1) return; ns--; ne = SEASONS[ns - 1]!.length; }
    if (ne > SEASONS[ns - 1]!.length) { if (ns === 8) return; ns++; ne = 1; }
    go(ns, ne);
  };

  useEffect(() => { setShowChanges(true); }, [at]);
  useEffect(() => {
    if (selectedId && !state.people.some((p) => p.id === selectedId) && !codex.some((p) => p.id === selectedId)) setSelectedId(null);
  }, [state, codex, selectedId]);
  useEffect(() => {
    if (!started) return;
    const onKey = (ev: KeyboardEvent) => {
      if ((ev.target as HTMLElement).tagName === "INPUT" || (ev.target as HTMLElement).tagName === "SELECT") return;
      if (ev.key === "ArrowRight") step(1);
      if (ev.key === "ArrowLeft") step(-1);
      if (ev.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const houses = (Object.keys(HOUSES) as HouseId[]).filter((h) => state.people.some((p) => p.house === h));
  const matches = query.trim()
    ? codex.filter((p) => (p.house || p.group) && p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];
  const hasChanges = changes.newcomers.length + changes.deaths.length + changes.reveals.length > 0;

  if (!started) return <Landing onStart={go} />;

  return (
    <main className="fog flex h-dvh flex-col">
      <header className="z-30 flex flex-wrap items-center gap-3 border-b bg-background/85 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate({ search: {} })} className="font-display text-lg text-primary text-glow">
          Westeros Bloodlines
        </button>
        <div className="order-3 flex w-full items-center justify-center gap-2 md:order-none md:w-auto md:flex-1">
          <button aria-label="Previous episode" onClick={() => step(-1)} className="border p-2 text-primary hover:bg-accent"><ChevronLeft size={16} /></button>
          <EpisodePicker s={s} e={e} onChange={go} />
          <button aria-label="Next episode" onClick={() => step(1)} className="border p-2 text-primary hover:bg-accent"><ChevronRight size={16} /></button>
        </div>
        <div className="relative ml-auto">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            placeholder="Find a character"
            className="w-44 border bg-secondary py-2 pl-8 pr-2 text-sm outline-none focus:border-primary"
          />
          {matches.length > 0 && (
            <ul className="absolute right-0 top-full mt-1 w-60 border bg-popover shadow-xl">
              {matches.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => { setFocus(null); setSelectedId(p.id); setQuery(""); if (!p.inTree && view === "tree") setView("cast"); }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent"
                  >
                    <Portrait person={p} className="h-8 w-8 shrink-0" />
                    <span className="flex flex-col">
                      <span className="font-display text-xs">{p.name}</span>
                      <span className={`text-[10px] uppercase tracking-widest ${p.house ? houseText[p.house] : "text-muted-foreground"}`}>{p.house ? HOUSES[p.house].name : p.group}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className="z-20 flex items-center gap-2 overflow-x-auto border-b bg-background/60 px-4 py-2">
        <div role="tablist" className="mr-2 flex shrink-0 border">
          {([["tree", "Family tree"], ["cast", `Characters · ${codex.length}`]] as const).map(([v, label]) => (
            <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
              className={`px-3 py-1 font-display text-[10px] uppercase tracking-widest ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>
        {view === "tree" && <>
          <HouseChip active={focus === null} onClick={() => setFocus(null)}>All houses</HouseChip>
          {houses.map((h) => (
            <HouseChip key={h} house={h} active={focus === h} onClick={() => setFocus(focus === h ? null : h)}>{HOUSES[h].name}</HouseChip>
          ))}
        </>}
      </div>

      <div className="relative flex-1 overflow-hidden">
        {view === "cast" ? (
          <CharacterGuide entries={codex} selectedId={selectedId} onSelect={setSelectedId} />
        ) : (
        <ClientOnly fallback={<div className="p-8 font-display text-muted-foreground">Unrolling the scrolls…</div>}>
          <FamilyTree state={state} focusHouse={focus} selectedId={selectedId} onSelect={(p) => setSelectedId(p.id)} />
        </ClientOnly>
        )}

        {view === "tree" && focus && (
          <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 text-center">
            <div className={`font-display text-2xl text-glow ${houseText[focus]}`}>House {HOUSES[focus].name}</div>
            <div className="text-sm italic text-muted-foreground">“{HOUSES[focus].words}”</div>
          </div>
        )}

        {/* Episode changes */}
        {view === "tree" && hasChanges && showChanges && (
          <div className="absolute bottom-4 left-16 z-10 w-72 max-w-[calc(100%-5rem)] border bg-popover/95 p-4 shadow-xl backdrop-blur animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-display text-xs uppercase tracking-widest text-primary">In this episode</span>
              <button aria-label="Dismiss" onClick={() => setShowChanges(false)} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
            </div>
            <ul className="max-h-40 space-y-1.5 overflow-y-auto text-sm">
              {changes.reveals.map((t) => <li key={t} className="flex gap-2"><Sparkles size={14} className="mt-0.5 shrink-0 text-primary" />{t}</li>)}
              {changes.deaths.map((t) => <li key={t} className="flex gap-2"><Skull size={14} className="mt-0.5 shrink-0 text-destructive" />{t} dies</li>)}
              {changes.newcomers.map((t) => <li key={t} className="flex gap-2"><UserPlus size={14} className="mt-0.5 shrink-0 text-muted-foreground" />Meet {t}</li>)}
            </ul>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-10">
          {showLegend ? (
            <div className="w-56 border bg-popover/95 p-4 text-xs shadow-xl backdrop-blur">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-display uppercase tracking-widest text-primary">Legend</span>
                <button aria-label="Close legend" onClick={() => setShowLegend(false)}><X size={14} /></button>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><span className="h-px w-8 bg-primary" /> Parent → child</li>
                <li className="flex items-center gap-2"><span className="w-8 border-t border-dashed border-ember" /> Married</li>
                <li className="flex items-center gap-2"><span className="w-8 border-t border-dashed border-primary" /> ? Not yet revealed</li>
                <li className="flex items-center gap-2"><span className="flex h-5 w-8 items-center justify-center bg-unknown font-display text-primary">?</span> Unknown person</li>
                <li className="flex items-center gap-2"><Skull size={14} className="w-8 text-destructive" /> Greyed out = deceased</li>
              </ul>
              <p className="mt-3 text-muted-foreground">Tip: use ← → keys to move between episodes.</p>
              <p className="mt-2 text-muted-foreground">Character images © HBO, used for fan reference; some cast photos via Wikimedia Commons. Fan project, not affiliated with HBO.</p>
            </div>
          ) : (
            <button onClick={() => setShowLegend(true)} className="flex items-center gap-1.5 border bg-popover/90 px-3 py-2 font-display text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
              <Info size={12} /> Legend
            </button>
          )}
        </div>

        {selected && (
          <PersonDrawer
            person={selected}
            relatives={state.people.some((p) => p.id === selected.id) ? getRelatives(state, selected.id) : null}
            onClose={() => setSelectedId(null)}
            onPick={(id) => setSelectedId(id)}
          />
        )}
      </div>
    </main>
  );
}

function PersonDrawer({ person, relatives, onClose, onPick }: {
  person: CodexEntry | TreePerson;
  relatives: ReturnType<typeof getRelatives> | null;
  onClose: () => void;
  onPick: (id: string) => void;
}) {
  const groups: [string, TreePerson[]][] = relatives ? [["Parents", relatives.parents], ["Spouses", relatives.spouses], ["Children", relatives.children]] : [];
  const group = "group" in person ? person.group : undefined;
  const facts = "facts" in person ? person.facts : [];
  return (
    <aside className="absolute right-0 top-0 z-30 flex h-full w-full max-w-sm flex-col overflow-y-auto border-l bg-popover shadow-2xl animate-in slide-in-from-right">
      <div className="relative">
        <Portrait person={person} className="aspect-square w-full" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-popover to-transparent" />
        <button aria-label="Close" onClick={onClose} className="absolute right-3 top-3 border bg-background/70 p-1.5 text-foreground hover:bg-background"><X size={16} /></button>
      </div>
      <div className="-mt-10 flex flex-col gap-3 px-6 pb-8">
        <h2 className="relative font-display text-3xl text-primary text-glow">{person.name}</h2>
        {person.house ? (
          <p className={`font-display text-xs uppercase tracking-widest ${houseText[person.house]}`}>
            House {HOUSES[person.house].name} · <span className="normal-case italic text-muted-foreground">“{HOUSES[person.house].words}”</span>
          </p>
        ) : group ? <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">{group}</p>
        : <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">Identity unknown</p>}
        <div className="flex flex-wrap gap-2 text-xs">
          {person.title && <span className="border px-2 py-1">{person.title}</span>}
          <span className={`border px-2 py-1 ${person.dead ? "border-destructive text-destructive" : ""}`}>
            {person.dead ? "Deceased" : person.unknown ? "Status unknown" : "Alive"}
          </span>
        </div>
        <p className="text-lg leading-relaxed text-muted-foreground">{person.bio}</p>
        {facts.length > 0 && (
          <div>
            <h3 className="mb-2 mt-2 font-display text-xs uppercase tracking-widest text-foreground">The story so far</h3>
            <ol className="space-y-2 border-l border-primary/40 pl-4">
              {facts.map((f) => (
                <li key={f.at + f.text} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                  <span className="font-display text-[10px] tracking-widest text-primary">{epLabel(f.at)}</span>
                  <p className="text-sm text-foreground/90">{f.text}</p>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-[11px] italic text-muted-foreground">Only events up to your chosen episode are shown.</p>
          </div>
        )}
        {person.charId && (person.house || group) && PHOTO_CREDITS[person.charId] && (
          <p className="text-xs text-muted-foreground">
            Played by <span className="text-foreground">{PHOTO_CREDITS[person.charId]!.actor}</span> · Photo{" "}
            <a href={PHOTO_CREDITS[person.charId]!.source} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-primary">
              {PHOTO_CREDITS[person.charId]!.author || "Wikimedia Commons"}, {PHOTO_CREDITS[person.charId]!.license}
            </a>
          </p>
        )}
        {groups.filter(([, list]) => list.length).map(([label, list]) => (
          <div key={label}>
            <h3 className="mb-2 mt-2 font-display text-xs uppercase tracking-widest text-foreground">{label}</h3>
            <div className="flex flex-wrap gap-2">
              {list.map((r) => (
                <button key={r.id} onClick={() => onPick(r.id)} className="flex items-center gap-2 border bg-card py-1 pl-1 pr-3 text-left hover:border-primary">
                  <Portrait person={r} className="h-9 w-9" />
                  <span className="font-display text-xs">{r.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function Landing({ onStart }: { onStart: (s: number, e: number) => void }) {
  const [s, setS] = useState(1);
  const [e, setE] = useState(1);
  return (
    <main className="fog relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      <p className="font-display text-xs uppercase tracking-[0.5em] text-muted-foreground">A spoiler-safe guide to the Seven Kingdoms</p>
      <h1 className="mt-6 font-display text-5xl text-primary text-glow animate-flicker md:text-8xl">Westeros Bloodlines</h1>
      <p className="mt-6 max-w-xl text-xl text-muted-foreground">
        Who is whose child? Who is still a mystery? Tell us where you are in the story — the family tree will reveal only what you already know.
      </p>
      <div className="mt-12 flex w-full max-w-md flex-col items-center gap-4 border bg-card/60 p-6 backdrop-blur">
        <span className="font-display text-sm uppercase tracking-[0.3em] text-foreground">Where are you?</span>
        <EpisodePicker s={s} e={e} onChange={(ns, ne) => { setS(ns); setE(ne); }} />
        <button
          onClick={() => onStart(s, e)}
          className="w-full bg-primary px-8 py-3 font-display text-sm uppercase tracking-[0.3em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          Reveal the tree
        </button>
        <button onClick={() => onStart(8, 6)} className="text-xs text-muted-foreground underline-offset-4 hover:underline">
          I've seen it all — show everything
        </button>
      </div>
      <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {(Object.keys(HOUSES) as HouseId[]).filter((h) => h !== "dothraki").map((h) => (
          <span key={h} className={houseText[h]}>{HOUSES[h].name}</span>
        ))}
      </div>
    </main>
  );
}

function EpisodePicker({ s, e, onChange }: { s: number; e: number; onChange: (s: number, e: number) => void }) {
  const cls = "border bg-secondary px-3 py-2 font-display text-xs text-secondary-foreground outline-none focus:border-primary";
  return (
    <div className="flex min-w-0 gap-2">
      <select aria-label="Season" value={s} onChange={(ev) => onChange(Number(ev.target.value), 1)} className={cls}>
        {SEASONS.map((_, i) => <option key={i} value={i + 1}>Season {i + 1}</option>)}
      </select>
      <select aria-label="Episode" value={e} onChange={(ev) => onChange(s, Number(ev.target.value))} className={`${cls} min-w-0 max-w-[220px]`}>
        {SEASONS[s - 1]!.map((name, i) => <option key={i} value={i + 1}>E{i + 1} · {name}</option>)}
      </select>
    </div>
  );
}

function HouseChip({ active, onClick, children, house }: { active: boolean; onClick: () => void; children: React.ReactNode; house?: HouseId }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 border px-3 py-1 font-display text-[10px] uppercase tracking-widest transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : `${house ? houseText[house] : "text-muted-foreground"} hover:border-primary`}`}
    >
      {children}
    </button>
  );
}
