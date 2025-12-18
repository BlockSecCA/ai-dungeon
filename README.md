# AI Dungeon Explorer

A text adventure game where players navigate a forest guarded by Greek philosophers. Each philosopher presents a unique challenge that must be overcome through dialogue.

## Structure

```
ai-dungeon/
├── src/
│   ├── index.html      # HTML template with injection points
│   ├── styles.css      # All CSS styles
│   ├── config.js       # Game content (rooms, NPCs, prompts)
│   ├── engine.js       # Game logic and AI interaction
│   └── assets/         # Portrait images
│       ├── zeno.jpg
│       ├── diogenes.jpg
│       └── heraclitus.jpg
├── dist/
│   └── ai-dungeon.html # Built output (generated)
├── build.py            # Build script
└── README.md
```

## Building

```bash
python build.py
```

Output: `dist/ai-dungeon.html`

The build script:
1. Reads all source files
2. Embeds portrait images as base64
3. Combines everything into a single HTML file

## Running

**In Claude Artifact Sandbox:**
- Upload `dist/ai-dungeon.html` as an artifact
- Uses claude.ai proxy for API calls (no key needed)

**Standalone:**
- Open in browser
- Requires Anthropic API key configured
- Add `anthropic-dangerous-direct-browser-access` header

## Editing

### Adding rooms

Edit `src/config.js`, add to `rooms` object:

```javascript
new_room: {
  name: "Room Name",
  description: "Description text.",
  exits: { north: "other_room" },
  ascii: [
    "  ♣   ♣   ♣  ",
    " ♣  . @ .  ♣ ",
    "  ♣   ♣   ♣  "
  ]
}
```

### Adding NPCs

Edit `src/config.js`, add to `characters` object:

```javascript
new_npc: {
  name: "NPC Name",
  display: "N",           // Character shown on map
  room: "room_id",
  passed: false,
  portrait: "PORTRAIT:npc.jpg",  // Will be embedded at build time
  system: `System prompt defining NPC personality...`
}
```

### Blocking paths

Add to room definition:
```javascript
blockedBy: "npc_id",
blockDirection: "north"
```

## ASCII Map Characters

| Char | Class | Use |
|------|-------|-----|
| @ | player | Player position |
| Z,D,H | npc | NPC positions |
| ♣ | fog | Trees/forest |
| ═ ║ | path | Walkable paths |
| ┌┐└┘│ | wall | Structures |
| ☼ | door | Light/special |
| ≈ | door | Water |
| . | floor | Ground |

## License

MIT
