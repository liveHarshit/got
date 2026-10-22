import { CHARACTERS, RELATIONS, type Character, type HouseId } from "@/data/got";

export interface TreePerson {
  id: string;
  unknown: boolean;
  name: string;
  house: HouseId | null;
  dead: boolean;
  title?: string;
  bio: string;
  /** Character id for real people, used for portraits. */
  charId?: string;
}

export interface TreeLink {
  id: string;
  kind: "parent" | "spouse";
  source: string;
  target: string;
  unknown: boolean;
}

export interface TreeState {
  people: TreePerson[];
  links: TreeLink[];
}

const byId = new Map(CHARACTERS.map((ch) => [ch.id, ch]));

function toPerson(ch: Character, at: number): TreePerson {
  const aliased = ch.alias && at < ch.alias.until;
  return {
    id: ch.id,
    charId: ch.id,
    unknown: false,
    name: aliased ? ch.alias!.name : ch.name,
    house: aliased ? null : ch.house,
    dead: ch.death !== undefined && ch.death <= at,
    ...(!aliased && ch.title ? { title: ch.title } : {}),
    bio: aliased ? "Identity unknown." : ch.bio,
  };
}

/** Resolve what a viewer knows at absolute episode `at`. */
export function getTreeState(at: number): TreeState {
  const visible = new Set(CHARACTERS.filter((ch) => ch.first <= at).map((ch) => ch.id));
  const people: TreePerson[] = CHARACTERS.filter((ch) => visible.has(ch.id)).map((ch) => toPerson(ch, at));
  const links: TreeLink[] = [];

  RELATIONS.forEach((rel, i) => {
    if (rel.start > at) return;
    if (rel.until !== undefined && at >= rel.until) return;
    if (!visible.has(rel.to)) return;
    const hidden = rel.hiddenUntil !== undefined && at < rel.hiddenUntil;
    if (hidden) {
      const uid = `unknown-${i}`;
      people.push({
        id: uid,
        unknown: true,
        name: "Unknown",
        house: null,
        dead: false,
        bio: rel.kind === "parent" ? "This parent has not been revealed yet." : "Not yet revealed.",
      });
      links.push({ id: `l${i}`, kind: rel.kind, source: uid, target: rel.to, unknown: true });
      return;
    }
    if (!visible.has(rel.from)) return;
    links.push({ id: `l${i}`, kind: rel.kind, source: rel.from, target: rel.to, unknown: false });
  });

  return { people, links };
}

export function getCharacter(id: string) {
  return byId.get(id);
}

export interface EpisodeChanges {
  newcomers: string[];
  deaths: string[];
  reveals: string[];
}

/** What a viewer learns in episode `at` compared to the episode before. */
export function getChanges(at: number): EpisodeChanges {
  const name = (id: string) => byId.get(id)?.name ?? id;
  const newcomers = at === 1 ? [] : CHARACTERS.filter((ch) => ch.first === at).map((ch) => ch.name);
  const deaths = CHARACTERS.filter((ch) => ch.death === at && ch.first <= at).map((ch) => ch.name);
  const reveals: string[] = [];
  RELATIONS.forEach((rel) => {
    if (rel.hiddenUntil === at) reveals.push(`${name(rel.from)} is revealed as ${name(rel.to)}'s parent`);
    else if (rel.start === at && rel.start > 1 && rel.until === undefined && rel.hiddenUntil === undefined && rel.kind === "parent" && RELATIONS.some((o) => o.to === rel.to && o.until === at))
      reveals.push(`${name(rel.from)} is the true parent of ${name(rel.to)}`);
    else if (rel.start === at && rel.kind === "spouse" && at > 1 && byId.get(rel.from)!.first < at && byId.get(rel.to)!.first < at) reveals.push(`${name(rel.from)} & ${name(rel.to)} are wed`);
  });
  CHARACTERS.forEach((ch) => { if (ch.alias?.until === at) reveals.push(`${ch.alias.name} is ${ch.name}`); });
  return { newcomers, deaths, reveals: Array.from(new Set(reveals)) };
}

/** Direct relatives of a person in the given state. */
export function getRelatives(state: TreeState, id: string) {
  const find = (pid: string) => state.people.find((p) => p.id === pid)!;
  const parents = state.links.filter((l) => l.kind === "parent" && l.target === id).map((l) => find(l.source));
  const children = state.links.filter((l) => l.kind === "parent" && l.source === id).map((l) => find(l.target));
  const spouses = state.links.filter((l) => l.kind === "spouse" && (l.source === id || l.target === id))
    .map((l) => find(l.source === id ? l.target : l.source));
  return { parents, children, spouses };
}

import { FIGURES, FACTS } from "@/data/people";
import { SEASONS } from "@/data/got";

export interface CodexEntry extends TreePerson {
  /** Affiliation for characters outside the great houses. */
  group?: string;
  /** Known facts up to the chosen episode, oldest first. */
  facts: { at: number; text: string }[];
  inTree: boolean;
}

/** "S3E9" label for an absolute episode. */
export function epLabel(at: number): string {
  let n = at;
  for (let s = 0; s < SEASONS.length; s++) {
    if (n <= SEASONS[s]!.length) return `S${s + 1}E${n}`;
    n -= SEASONS[s]!.length;
  }
  return "";
}

const factsFor = (id: string, at: number) =>
  (FACTS[id] ?? []).filter(([when]) => when <= at).map(([when, text]) => ({ at: when, text }));

/** Every character a viewer has met by episode `at`, with only what they know so far. */
export function getCodex(at: number): CodexEntry[] {
  const family: CodexEntry[] = CHARACTERS.filter((ch) => ch.first <= at).map((ch) => {
    const p = toPerson(ch, at);
    return { ...p, inTree: true, facts: p.house ? factsFor(ch.id, at) : [] };
  });
  const others: CodexEntry[] = FIGURES.filter((f) => f.first <= at).map((f) => ({
    id: f.id,
    charId: f.id,
    unknown: false,
    name: f.name,
    house: null,
    group: f.group,
    dead: f.death !== undefined && f.death <= at,
    ...(f.title ? { title: f.title } : {}),
    bio: f.bio,
    inTree: false,
    facts: factsFor(f.id, at),
  }));
  return [...family, ...others];
}
