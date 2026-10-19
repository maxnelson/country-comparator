Paste this into a Claude Code session on maxnelson/country-comparator after design/handoff-blue-refresh/ is committed:

---

Apply the design refresh in `design/handoff-blue-refresh/`. Read its README.md first; it lists every change file by file.

- Copy the files under `drop-in/` over their matching repo paths (tokens.css, favicon.svg, the new mark-bars-white.svg, and Header.jsx/.module.css).
- Make the edits listed for ComparisonTable.module.css, ComparisonTable.jsx, Picker.module.css and index.html.
- Afterwards, `grep -r "\-\-mint-\|\-\-teal-" src` must return nothing.
- Layout, copy and behavior stay exactly as they are; this is a color and token pass only.
- Don't copy anything from `reference/` into src; it's visual reference only.
- Record a decision in ROADMAP.md: "D6 Visual identity: single blue brand ramp (blue-700 #2569B8), rounded-bars mark, tokenized radii/shadows/motion".
- Leave `design/handoff-blue-refresh/` in the repo.

Finish the usual way: lint, test and build green, desktop and 390px screenshots in both normal and Edit mode, then commit, push, and tell me when it's live.
