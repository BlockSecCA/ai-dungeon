# AI Dungeon Explorer

A text adventure that runs inside a Claude artifact — where the NPCs are Claude itself.

Navigate a forest guarded by three Greek philosophers. Each one blocks your path and will only let you pass if you engage them in genuine conversation. No dialogue trees — you talk to them in natural language, and they judge whether your responses show real understanding.

- **Zeno** tests whether you genuinely grapple with his paradox, or just dismiss it
- **Diogenes** tests whether you can take an insult and be honest about yourself
- **Heraclitus** tests whether you understand impermanence and change

A Bastion-style narrator watches your attempts and comments on your patterns.

## How it works

The game is a single self-contained HTML file. When loaded as a Claude artifact, API calls route through claude.ai's built-in proxy — so the philosophers are live Claude conversations, powered by your existing plan. No API key needed.

Each philosopher has a system prompt with specific criteria for what earns passage and what doesn't. Flattery won't work on Zeno. Claiming to seek wisdom will get you mocked by Diogenes. Demanding simple answers disappoints Heraclitus.

## Quick start

**In Claude (recommended):**
1. Upload `dist/ai-dungeon.html` as an artifact
2. Play — the artifact sandbox handles API calls automatically

**Standalone:**
1. Open `dist/ai-dungeon.html` in a browser
2. Requires an Anthropic API key and the `anthropic-dangerous-direct-browser-access` header

## Building from source

```bash
python build.py
```

The build script reads all source files, embeds portrait images as base64, and combines everything into `dist/ai-dungeon.html`.

## Project structure

```
ai-dungeon/
├── src/
│   ├── index.html      # HTML template
│   ├── styles.css       # Styles
│   ├── config.js        # Rooms, NPCs, system prompts
│   ├── engine.js        # Game logic and AI interaction
│   └── assets/          # Philosopher portraits
├── dist/
│   └── ai-dungeon.html  # Built output (single file)
└── build.py             # Build script
```

## Extending

### Adding rooms

Edit `src/config.js`, add to `rooms`:

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

Each NPC is a system prompt with clear pass/fail criteria:

```javascript
new_npc: {
  name: "NPC Name",
  display: "N",
  room: "room_id",
  passed: false,
  portrait: "PORTRAIT:npc.jpg",
  system: `System prompt defining personality, challenge,
           what earns passage, and what doesn't...`
}
```

### Blocking paths

```javascript
blockedBy: "npc_id",
blockDirection: "north"
```

## License

MIT
