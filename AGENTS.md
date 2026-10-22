<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Spoiler logic lives in src/lib/tree.ts (getTreeState) driven by episode-indexed data in src/data/got.ts; keep UI free of reveal rules so tests in src/test/tree.test.ts cover them.
- GitHub Pages build: `GH_PAGES=1` in vite.config.ts switches to static SPA output under /got; .github/workflows/pages.yml builds and deploys it, because Pages serves only static files.
- Downloaded character portraits use CDN asset pointers resolved by the shared portrait lookup; identity gating stays in the existing Portrait renderer so photos cannot expose unrevealed characters.
