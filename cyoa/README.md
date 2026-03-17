# The Crossroads Chronicle

An interactive branching story built with Angular 19, Bootstrap 5, and jQuery.

## Requirements

- [Node.js](https://nodejs.org) version 18 or higher

---

## How to run

**Step 1 — Install dependencies** (once only):
```
npm install
```

**Step 2 — Build the app:**
```
npx ng build
```

**Step 3 — Start the server:**
```
node serve.js
```

**Step 4 — Open your browser at:**
```
http://localhost:3000
```

---

## Editing the story

All story content lives in **`public/story.json`**. Open it in any text editor.

The file has two sections:

### `meta` — UI labels and settings
```json
"meta": {
  "title": "Your Story Title",
  "subtitle": "A tagline",
  "startSceneId": "start"
}
```

### `scenes` — the branching content
```json
{
  "id": "my_scene",
  "title": "Scene Title",
  "narrative": "First paragraph.\n\nSecond paragraph.",
  "choices": [
    { "id": "c1", "text": "Button text", "nextSceneId": "next_scene_id" }
  ],
  "isEnding": false
}
```

Use `\n\n` in narrative text to create paragraph breaks.  
Set `"isEnding": true` and leave `"choices": []` for ending scenes.  
Every `nextSceneId` must match the `id` of an existing scene.

After editing `story.json`, re-run `npx ng build` then `node serve.js`.
