const files = import.meta.glob("@/assets/characters/*.jpg", { eager: true, import: "default" }) as Record<string, string>;
const assets = import.meta.glob("@/assets/portraits/*.asset.json", { eager: true, import: "default" }) as Record<string, { url: string }>;

const map: Record<string, string> = {};
// Pages has no Lovable asset proxy; use the same hosted asset on that deployment.
const assetOrigin = "https://id-preview--d5f86451-65e1-4017-9339-2488f12be427.lovable.app";
for (const [path, url] of Object.entries(files)) {
  const filename = path.split("/").pop();
  if (!filename) continue;
  const id = filename.replace(".jpg", "");
  map[id] = url;
}
for (const [path, asset] of Object.entries(assets)) {
  const filename = path.split("/").pop();
  if (!filename) continue;
  map[filename.replace(".jpg.asset.json", "")] = import.meta.env.BASE_URL === "/got/" ? `${assetOrigin}${asset.url}` : asset.url;
}

export function portraitFor(id: string): string | undefined {
  return map[id];
}
