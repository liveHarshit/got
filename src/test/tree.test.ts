import { describe, it, expect } from "vitest";
import { getTreeState } from "@/lib/tree";
import { ep } from "@/data/got";

const parentsOf = (at: number, child: string) => {
  const s = getTreeState(at);
  return s.links
    .filter((l) => l.kind === "parent" && l.target === child)
    .map((l) => (l.unknown ? "?" : l.source))
    .sort();
};

describe("getTreeState", () => {
  it("counts 73 episodes", () => expect(ep(8, 6)).toBe(73));
  it("Jon's mother is unknown at S6E9", () => expect(parentsOf(ep(6, 9), "jon")).toEqual(["?", "eddard"]));
  it("Lyanna revealed at S6E10, father unknown", () => expect(parentsOf(ep(6, 10), "jon")).toEqual(["?", "lyanna"]));
  it("Rhaegar revealed at S7E7", () => expect(parentsOf(ep(7, 7), "jon")).toEqual(["lyanna", "rhaegar"]));
  it("Joffrey's father is Robert before S1E7", () => expect(parentsOf(ep(1, 6), "joffrey")).toEqual(["cersei", "robert"]));
  it("Joffrey's father is Jaime from S1E7", () => expect(parentsOf(ep(1, 7), "joffrey")).toEqual(["cersei", "jaime"]));
  it("Ned is alive at S1E8 and dead at S1E9", () => {
    expect(getTreeState(ep(1, 8)).people.find((p) => p.id === "eddard")!.dead).toBe(false);
    expect(getTreeState(ep(1, 9)).people.find((p) => p.id === "eddard")!.dead).toBe(true);
  });
  it("Tywin is not shown before S1E7", () => {
    expect(getTreeState(ep(1, 6)).people.some((p) => p.id === "tywin")).toBe(false);
  });
});

import { getChanges } from "@/lib/tree";
describe("getChanges", () => {
  it("S1E9 records Ned's death", () => expect(getChanges(ep(1, 9)).deaths).toContain("Eddard Stark"));
  it("S6E10 reveals Lyanna as Jon's parent", () =>
    expect(getChanges(ep(6, 10)).reveals).toContain("Lyanna Stark is revealed as Jon Snow's parent"));
  it("S1E7 reveals Jaime as Joffrey's true parent", () =>
    expect(getChanges(ep(1, 7)).reveals).toContain("Jaime Lannister is the true parent of Joffrey Baratheon"));
});

describe("no spoilers in episode notes", () => {
  it("S6E10 does not mention Rhaegar as Jon's parent", () =>
    expect(getChanges(ep(6, 10)).reveals.some((r) => r.includes("Rhaegar"))).toBe(false));
  it("S7E7 reveals Rhaegar as Jon's parent", () =>
    expect(getChanges(ep(7, 7)).reveals).toContain("Rhaegar Targaryen is revealed as Jon Snow's parent"));
});

import { getCodex } from "@/lib/tree";
const entry = (at: number, id: string) => getCodex(at).find((p) => p.id === id);
describe("character guide", () => {
  it("includes non-family characters once met", () => {
    expect(entry(ep(1, 2), "varys")).toBeUndefined();
    expect(entry(ep(1, 3), "varys")!.group).toBe("Small Council");
  });
  it("Hodor alive at S6E4, dead at S6E5", () => {
    expect(entry(ep(6, 4), "hodor")!.dead).toBe(false);
    expect(entry(ep(6, 5), "hodor")!.dead).toBe(true);
  });
  it("hides future facts", () => {
    expect(entry(ep(4, 6), "littlefinger")!.facts.some((f) => f.text.includes("Moon Door"))).toBe(false);
    expect(entry(ep(4, 7), "littlefinger")!.facts.some((f) => f.text.includes("Moon Door"))).toBe(true);
  });
  it("aliased Ramsay has no facts before reveal", () => expect(entry(ep(3, 9), "ramsay")!.facts).toEqual([]));
});
