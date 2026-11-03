# Physics Activation Protocol

A single-page study-session tool for a physics undergraduate. It uses browser `localStorage` only: no account and no backend are required.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. Use `npm run build` to type-check and generate a production build.

## Controls

- Space starts or pauses the timer when focus is not in a form field.
- N marks the current block complete.
- The timer is timestamp-based, so it remains accurate after the tab is backgrounded.
