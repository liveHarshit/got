export const SEASONS: string[][] = [
  ["Winter Is Coming", "The Kingsroad", "Lord Snow", "Cripples, Bastards, and Broken Things", "The Wolf and the Lion", "A Golden Crown", "You Win or You Die", "The Pointy End", "Baelor", "Fire and Blood"],
  ["The North Remembers", "The Night Lands", "What Is Dead May Never Die", "Garden of Bones", "The Ghost of Harrenhal", "The Old Gods and the New", "A Man Without Honor", "The Prince of Winterfell", "Blackwater", "Valar Morghulis"],
  ["Valar Dohaeris", "Dark Wings, Dark Words", "Walk of Punishment", "And Now His Watch Is Ended", "Kissed by Fire", "The Climb", "The Bear and the Maiden Fair", "Second Sons", "The Rains of Castamere", "Mhysa"],
  ["Two Swords", "The Lion and the Rose", "Breaker of Chains", "Oathkeeper", "First of His Name", "The Laws of Gods and Men", "Mockingbird", "The Mountain and the Viper", "The Watchers on the Wall", "The Children"],
  ["The Wars to Come", "The House of Black and White", "High Sparrow", "Sons of the Harpy", "Kill the Boy", "Unbowed, Unbent, Unbroken", "The Gift", "Hardhome", "The Dance of Dragons", "Mother's Mercy"],
  ["The Red Woman", "Home", "Oathbreaker", "Book of the Stranger", "The Door", "Blood of My Blood", "The Broken Man", "No One", "Battle of the Bastards", "The Winds of Winter"],
  ["Dragonstone", "Stormborn", "The Queen's Justice", "The Spoils of War", "Eastwatch", "Beyond the Wall", "The Dragon and the Wolf"],
  ["Winterfell", "A Knight of the Seven Kingdoms", "The Long Night", "The Last of the Starks", "The Bells", "The Iron Throne"],
];

/** Absolute episode index, 1-based. ep(1,1) = 1, ep(8,6) = 73. */
export function ep(season: number, episode: number): number {
  let n = 0;
  for (let i = 0; i < season - 1; i++) n += SEASONS[i]!.length;
  return n + episode;
}

export type HouseId =
  | "stark" | "targaryen" | "lannister" | "baratheon" | "greyjoy" | "tyrell"
  | "martell" | "tully" | "arryn" | "bolton" | "frey" | "dothraki";

export const HOUSES: Record<HouseId, { name: string; words: string }> = {
  stark: { name: "Stark", words: "Winter Is Coming" },
  targaryen: { name: "Targaryen", words: "Fire and Blood" },
  lannister: { name: "Lannister", words: "Hear Me Roar" },
  baratheon: { name: "Baratheon", words: "Ours Is the Fury" },
  greyjoy: { name: "Greyjoy", words: "We Do Not Sow" },
  tyrell: { name: "Tyrell", words: "Growing Strong" },
  martell: { name: "Martell", words: "Unbowed, Unbent, Unbroken" },
  tully: { name: "Tully", words: "Family, Duty, Honor" },
  arryn: { name: "Arryn", words: "As High as Honor" },
  bolton: { name: "Bolton", words: "Our Blades Are Sharp" },
  frey: { name: "Frey", words: "The Twins" },
  dothraki: { name: "Dothraki", words: "Great Grass Sea" },
};

export interface Character {
  id: string;
  name: string;
  house: HouseId;
  title?: string;
  /** Episode the character is first known to the viewer. */
  first: number;
  /** Episode of death; 0 = died before the series. */
  death?: number;
  /** Shown name before the true identity is revealed. */
  alias?: { name: string; until: number };
  bio: string;
}

export interface Relation {
  kind: "parent" | "spouse";
  from: string;
  to: string;
  /** Becomes visible at this episode. */
  start: number;
  /** Before this episode the `from` side is shown as Unknown. */
  hiddenUntil?: number;
  /** Believed relation that stops being true at this episode. */
  until?: number;
}

const c = (
  id: string, name: string, house: HouseId, first: number, bio: string,
  extra: Partial<Character> = {},
): Character => ({ id, name, house, first, bio, ...extra });

export const CHARACTERS: Character[] = [
  c("rickard", "Rickard Stark", "stark", 1, "Former Lord of Winterfell, executed by the Mad King.", { death: 0 }),
  c("brandon", "Brandon Stark", "stark", 1, "Ned's elder brother, killed alongside his father.", { death: 0 }),
  c("eddard", "Eddard Stark", "stark", 1, "Lord of Winterfell and Warden of the North.", { title: "Hand of the King", death: ep(1, 9) }),
  c("lyanna", "Lyanna Stark", "stark", 1, "Ned's sister, whose death sparked Robert's Rebellion.", { death: 0 }),
  c("benjen", "Benjen Stark", "stark", 1, "First Ranger of the Night's Watch."),
  c("catelyn", "Catelyn Stark", "tully", 1, "Lady of Winterfell, born a Tully.", { death: ep(3, 9) }),
  c("robb", "Robb Stark", "stark", 1, "Eldest son of Ned, later King in the North.", { death: ep(3, 9) }),
  c("talisa", "Talisa Maegyr", "stark", ep(2, 2), "A healer from Volantis who wins Robb's heart.", { death: ep(3, 9) }),
  c("sansa", "Sansa Stark", "stark", 1, "Elder Stark daughter.", { title: "Lady of Winterfell" }),
  c("arya", "Arya Stark", "stark", 1, "Younger Stark daughter, never a lady."),
  c("bran", "Bran Stark", "stark", 1, "Stark son who sees far beyond the Wall."),
  c("rickon", "Rickon Stark", "stark", 1, "Youngest Stark child.", { death: ep(6, 9) }),
  c("jon", "Jon Snow", "stark", 1, "Raised at Winterfell, sworn to the Night's Watch.", { title: "Lord Commander" }),
  c("aerys", "Aerys II Targaryen", "targaryen", 1, "The Mad King, slain by Jaime Lannister.", { death: 0 }),
  c("rhaella", "Rhaella Targaryen", "targaryen", 1, "Queen to Aerys, died giving birth.", { death: 0 }),
  c("rhaegar", "Rhaegar Targaryen", "targaryen", 1, "Crown prince, killed by Robert at the Trident.", { death: 0 }),
  c("elia", "Elia Martell", "martell", ep(4, 1), "Rhaegar's wife, murdered in the Sack of King's Landing.", { death: 0 }),
  c("viserys", "Viserys Targaryen", "targaryen", 1, "Exiled heir who dreams of the throne.", { death: ep(1, 6) }),
  c("daenerys", "Daenerys Targaryen", "targaryen", 1, "Stormborn, Mother of Dragons.", { title: "Khaleesi", death: ep(8, 6) }),
  c("drogo", "Khal Drogo", "dothraki", 1, "A Dothraki khal who never lost a fight.", { death: ep(1, 10) }),
  c("tywin", "Tywin Lannister", "lannister", ep(1, 7), "Lord of Casterly Rock, the richest man in Westeros.", { title: "Hand of the King", death: ep(4, 10) }),
  c("joanna", "Joanna Lannister", "lannister", ep(1, 7), "Tywin's wife, died giving birth to Tyrion.", { death: 0 }),
  c("kevan", "Kevan Lannister", "lannister", ep(1, 7), "Tywin's loyal brother.", { death: ep(6, 10) }),
  c("lancel", "Lancel Lannister", "lannister", ep(1, 2), "Squire to King Robert.", { death: ep(6, 10) }),
  c("cersei", "Cersei Lannister", "lannister", 1, "Queen of the Seven Kingdoms.", { title: "Queen", death: ep(8, 5) }),
  c("jaime", "Jaime Lannister", "lannister", 1, "Kingsguard knight, the Kingslayer.", { death: ep(8, 5) }),
  c("tyrion", "Tyrion Lannister", "lannister", 1, "The Imp, who drinks and knows things.", { title: "Hand" }),
  c("joffrey", "Joffrey Baratheon", "lannister", 1, "Crown prince, later king.", { title: "King", death: ep(4, 2) }),
  c("myrcella", "Myrcella Baratheon", "lannister", 1, "Royal princess.", { death: ep(5, 10) }),
  c("tommen", "Tommen Baratheon", "lannister", 1, "Youngest royal prince.", { death: ep(6, 10) }),
  c("steffon", "Steffon Baratheon", "baratheon", ep(1, 4), "Father of the Baratheon brothers.", { death: 0 }),
  c("robert", "Robert Baratheon", "baratheon", 1, "King of the Seven Kingdoms.", { title: "King", death: ep(1, 7) }),
  c("stannis", "Stannis Baratheon", "baratheon", ep(2, 1), "Lord of Dragonstone, claimant to the throne.", { death: ep(5, 10) }),
  c("renly", "Renly Baratheon", "baratheon", 1, "Youngest Baratheon brother.", { death: ep(2, 5) }),
  c("selyse", "Selyse Baratheon", "baratheon", ep(3, 2), "Stannis's devout wife.", { death: ep(5, 10) }),
  c("shireen", "Shireen Baratheon", "baratheon", ep(3, 2), "Stannis's gentle daughter.", { death: ep(5, 9) }),
  c("gendry", "Gendry", "baratheon", ep(1, 4), "A blacksmith's apprentice in King's Landing."),
  c("balon", "Balon Greyjoy", "greyjoy", ep(2, 2), "Lord of the Iron Islands.", { death: ep(6, 2) }),
  c("euron", "Euron Greyjoy", "greyjoy", ep(6, 2), "Balon's brother, a reaver.", { death: ep(8, 5) }),
  c("theon", "Theon Greyjoy", "greyjoy", 1, "Ward of Winterfell.", { death: ep(8, 3) }),
  c("yara", "Yara Greyjoy", "greyjoy", ep(2, 2), "Balon's daughter, captain of the fleet."),
  c("hoster", "Hoster Tully", "tully", ep(3, 2), "Lord of Riverrun.", { death: ep(3, 3) }),
  c("lysa", "Lysa Arryn", "tully", ep(1, 5), "Lady of the Eyrie, Catelyn's sister.", { death: ep(4, 7) }),
  c("edmure", "Edmure Tully", "tully", ep(3, 3), "Heir to Riverrun."),
  c("jonarryn", "Jon Arryn", "arryn", 1, "Former Hand of the King.", { death: 0 }),
  c("robin", "Robin Arryn", "arryn", ep(1, 5), "Sickly young Lord of the Eyrie."),
  c("olenna", "Olenna Tyrell", "tyrell", ep(3, 2), "The Queen of Thorns.", { death: ep(7, 3) }),
  c("mace", "Mace Tyrell", "tyrell", ep(3, 5), "Lord of Highgarden.", { death: ep(6, 10) }),
  c("loras", "Loras Tyrell", "tyrell", ep(1, 4), "The Knight of Flowers.", { death: ep(6, 10) }),
  c("margaery", "Margaery Tyrell", "tyrell", ep(2, 3), "Ambitious rose of Highgarden.", { title: "Queen", death: ep(6, 10) }),
  c("doran", "Doran Martell", "martell", ep(5, 2), "Prince of Dorne.", { death: ep(6, 1) }),
  c("oberyn", "Oberyn Martell", "martell", ep(4, 1), "The Red Viper of Dorne.", { death: ep(4, 8) }),
  c("ellaria", "Ellaria Sand", "martell", ep(4, 1), "Oberyn's paramour."),
  c("roose", "Roose Bolton", "bolton", ep(1, 9), "Lord of the Dreadfort.", { death: ep(6, 2) }),
  c("ramsay", "Ramsay Bolton", "bolton", ep(3, 2), "A cruel captor at the Dreadfort.", { death: ep(6, 9), alias: { name: "The Boy", until: ep(3, 10) } }),
  c("walder", "Walder Frey", "frey", ep(1, 9), "Lord of the Crossing.", { death: ep(6, 10) }),
];

const r = (kind: Relation["kind"], from: string, to: string, start = 1, extra: Partial<Relation> = {}): Relation =>
  ({ kind, from, to, start, ...extra });

const kids = (parents: string[], children: string[], start = 1, extra: Partial<Relation> = {}) =>
  parents.flatMap((p) => children.map((ch) => r("parent", p, ch, start, extra)));

export const RELATIONS: Relation[] = [
  ...kids(["rickard"], ["brandon", "eddard", "lyanna", "benjen"]),
  r("spouse", "eddard", "catelyn"),
  ...kids(["eddard", "catelyn"], ["robb", "sansa", "arya", "bran", "rickon"]),
  // Jon: believed son of Ned; mother unknown until the Tower of Joy vision.
  r("parent", "eddard", "jon", 1, { until: ep(6, 10) }),
  r("parent", "lyanna", "jon", 1, { hiddenUntil: ep(6, 10) }),
  r("parent", "rhaegar", "jon", ep(6, 10), { hiddenUntil: ep(7, 7) }),
  r("spouse", "rhaegar", "lyanna", ep(7, 7)),
  r("spouse", "robb", "talisa", ep(2, 10)),
  ...kids(["hoster"], ["catelyn", "lysa", "edmure"], ep(3, 2)),
  r("spouse", "jonarryn", "lysa", ep(1, 5)),
  ...kids(["jonarryn", "lysa"], ["robin"], ep(1, 5)),
  r("spouse", "aerys", "rhaella"),
  ...kids(["aerys", "rhaella"], ["rhaegar", "viserys", "daenerys"]),
  r("spouse", "rhaegar", "elia", ep(4, 1)),
  r("spouse", "drogo", "daenerys"),
  r("spouse", "tywin", "joanna", ep(1, 7)),
  ...kids(["tywin", "joanna"], ["cersei", "jaime", "tyrion"], ep(1, 7)),
  ...kids(["kevan"], ["lancel"], ep(1, 7)),
  r("spouse", "robert", "cersei"),
  ...kids(["cersei"], ["joffrey", "myrcella", "tommen"]),
  ...kids(["robert"], ["joffrey", "myrcella", "tommen"], 1, { until: ep(1, 7) }),
  ...kids(["jaime"], ["joffrey", "myrcella", "tommen"], ep(1, 7)),
  ...kids(["steffon"], ["robert", "stannis", "renly"], ep(1, 4)),
  r("spouse", "stannis", "selyse", ep(3, 2)),
  ...kids(["stannis", "selyse"], ["shireen"], ep(3, 2)),
  r("parent", "robert", "gendry", ep(1, 4), { hiddenUntil: ep(1, 7) }),
  ...kids(["balon"], ["theon", "yara"], ep(2, 2)),
  ...kids(["olenna"], ["mace"], ep(3, 5)),
  ...kids(["mace"], ["loras", "margaery"], ep(3, 5)),
  r("spouse", "renly", "margaery", ep(2, 3)),
  r("spouse", "joffrey", "margaery", ep(4, 2)),
  r("spouse", "tommen", "margaery", ep(5, 3)),
  r("spouse", "oberyn", "ellaria", ep(4, 1)),
  r("parent", "roose", "ramsay", ep(3, 2), { hiddenUntil: ep(3, 10) }),
  r("spouse", "tyrion", "sansa", ep(3, 8)),
  r("spouse", "ramsay", "sansa", ep(5, 6)),
];
