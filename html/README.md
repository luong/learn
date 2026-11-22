# HTML Terminal

A static HTML/CSS/JavaScript playground with Monaco, Emmet, and a live preview.

From the repository root:

```sh
python3 -m http.server 8000
```

Open **http://localhost:8000/html/**. The GitHub Pages path is `/learn/html/`. Use HTTP or HTTPS so editor workers can load.

- **HTML / CSS / JavaScript**: separate editor models with independent undo histories. HTML accepts a body fragment or a full document. CSS is appended to the document head; JavaScript runs after the body. Changes refresh the preview after 300 ms. Refresh runs the current code again; Ctrl/⌘ + Enter also refreshes.
- **Editor**: syntax highlighting, completion, line numbers, and HTML/CSS Emmet abbreviations. Accept an Emmet suggestion with Tab or Enter. A basic textarea editor remains available if Monaco cannot load.
- **Preview**: a browser-style title bar shows the HTML `<title>`, updates when JavaScript changes `document.title`, and uses Untitled when no title is set. Desktop fills the available panel; Tablet and Mobile use 768px and 390px layout widths, scaled down to fit when needed. Drag the divider, or focus it and use the arrow keys. On narrow screens the editor and preview stack vertically.
- **Console**: captures log/info/warn/error, JavaScript errors, and unhandled rejections. Errors open the console. Each preview refresh clears it; the display is capped at 200 entries.
- **Local saving**: code, active tab, preview size, and divider position are saved on this browser/origin. Closing and reopening the browser restores them. Storage errors appear in the footer.
- **Project menu**: Open imports `.html`, `.css`, `.js`, or an HTML Terminal `.json` project. Opening HTML replaces the whole document and clears the separate CSS/JS tabs. CSS/JS imports replace only that tab. Download HTML exports one standalone HTML file; Download project preserves the three separate code tabs. Reset confirms before clearing all three tabs.
- **Isolation**: preview runs in an iframe with `sandbox="allow-scripts allow-modals"`, without same-origin access. Preview code cannot access the app's document or localStorage. JavaScript alert(), confirm(), and prompt() dialogs are enabled. Popups and form submissions are not enabled. Console messages are checked against the preview window and its current render token.
- This runs plain browser HTML/CSS/JavaScript. External URLs referenced by a project still need network access. Relative URLs resolve from this app's URL.

Vendored dependencies: Monaco Editor **0.52.2** (`vendor/monaco/LICENSE`) and emmet-monaco-es **5.7.0** (`vendor/EMMET-LICENSE`). App and editor assets load locally; there is no build step, backend, or required CDN.
