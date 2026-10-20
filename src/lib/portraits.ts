const files = import.meta.glob("@/assets/characters/*.jpg", { eager: true, import: "default" }) as Record<string, string>;

const map: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const id = path.split("/").pop()!.replace(".jpg", "");
  map[id] = url;
}

export function portraitFor(id: string): string | undefined {
  return map[id];
}
