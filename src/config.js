// ============================================
// GAME CONFIGURATION
// ============================================

const CONFIG = {
  world: {
    name: "The Philosopher's Forest",
    theme: "Ancient woodland with stone paths and mystical clearings",
    goal: { type: "reach", room: "sanctuary" }
  },
  
  narrator: {
    voice: "Laconic storyteller. Short observations. Notices patterns in behavior. Never more than two sentences.",
    system: `You are the narrator of a text adventure. You observe the player's journey through a mystical forest where philosophers guard the path.

Your style:
- Laconic, like the Bastion narrator
- Short phrases, often fragments
- Notice patterns ("Third time they've tried flattery...")
- Comment on character, not just action
- Never more than two sentences
- Weary but invested

You receive: the current room, recent action, and conversation snippet.
Respond with a brief observation. Sometimes silence is fine - respond with "..." if nothing notable happened.`
  },
  
  rooms: {
    entrance: {
      name: "Forest Edge",
      description: "Sunlight filters through ancient oaks. A worn stone path leads north into deeper shadow. A wooden sign stands crooked by the path.",
      exits: { north: "first_clearing" },
      items: ["sign"],
      ascii: [
        "        ♣   ♣   ♣   ♣   ♣        ",
        "      ♣   .   .   .   .   ♣      ",
        "    ♣   .   .   .   .   .   ♣    ",
        "   ♣  .   .   .   .   .   .  ♣   ",
        "  ♣  .   .   . ═══ .   .   .  ♣  ",
        "   ♣  .   .   . ║ .   .   .  ♣   ",
        "    ♣   .   .   ║   .   .   ♣    ",
        "      ♣   .   . @ .   .   ♣      ",
        "        ♣   .  ▐█▌  .   ♣        ",
        "          ♣   ♣   ♣   ♣          "
      ]
    },
    
    first_clearing: {
      name: "Zeno's Clearing",
      description: "A small clearing with a tree stump in the center. Standing on his head atop the stump is a bald man in blue robes. His inverted face watches you with unsettling calm. The path continues north.",
      exits: { north: "fork", south: "entrance" },
      blockedBy: "zeno",
      blockDirection: "north",
      ascii: [
        "        ♣   ♣   ♣   ♣   ♣        ",
        "      ♣   .   . ║ .   .   ♣      ",
        "    ♣   .   .   ║   .   .   ♣    ",
        "   ♣  .   .   ┌───┐   .   .  ♣   ",
        "  ♣  .   .   .│ Z │.   .   .  ♣  ",
        "   ♣  .   .   └───┘   .   .  ♣   ",
        "    ♣   .   .   .   .   .   ♣    ",
        "      ♣   .   . @ .   .   ♣      ",
        "        ♣   .   ║   .   ♣        ",
        "          ♣   ♣   ♣   ♣          "
      ]
    },
    
    fork: {
      name: "The Forking Path",
      description: "The path splits here. To the west, you hear running water. To the east, the smell of smoke. North, the trees grow impossibly tall.",
      exits: { north: "diogenes_grove", west: "stream", east: "heraclitus_fire", south: "first_clearing" },
      ascii: [
        "        ♣   ♣   ♣   ♣   ♣        ",
        "      ♣   .   . ║ .   .   ♣      ",
        "    ♣   .   .   ║   .   .   ♣    ",
        "   ♣  .   .   . ║ .   .   .  ♣   ",
        "══════════════. @ .══════════════",
        "   ♣  .   .   . ║ .   .   .  ♣   ",
        "    ♣   .   .   ║   .   .   ♣    ",
        "      ♣   .   . ║ .   .   ♣      ",
        "        ♣   .   ║   .   ♣        ",
        "          ♣   ♣   ♣   ♣          "
      ]
    },
    
    stream: {
      name: "The Stream",
      description: "A gentle stream flows over smooth stones. The water is impossibly clear. Something glints beneath the surface.",
      exits: { east: "fork" },
      items: ["stone"],
      ascii: [
        "    ≈ ≈ ♣   ♣   ♣   ♣   ♣        ",
        "   ≈ ≈   .   .   .   .   ♣       ",
        "  ≈ ≈  .   .   .   .   .   ♣     ",
        " ≈ ≈  .   .   .   .   .   .  ════",
        " ≈ ≈ .   .   . @ .   .   .  ♣    ",
        " ≈ ≈  .   .   .   .   .   .  ♣   ",
        "  ≈ ≈  .   .   ○   .   .   ♣     ",
        "   ≈ ≈   .   .   .   .   ♣       ",
        "    ≈ ≈ ♣   ♣   ♣   ♣   ♣        ",
        "     ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈          "
      ]
    },
    
    heraclitus_fire: {
      name: "The Eternal Flame",
      description: "A small fire burns in a stone circle, though no wood feeds it. Beside it, an old man stands on his head, grey beard hanging toward the flames. His eyes are closed in meditation.",
      exits: { west: "fork" },
      blockedBy: "heraclitus",
      blockDirection: "sanctuary_east",
      ascii: [
        "        ♣   ♣   ♣   ♣   ♣        ",
        "      ♣   .   .   .   .   ♣      ",
        "    ♣   .   . ┌───┐ .   .   ♣    ",
        "════  .   .   │ H │   .   .  ♣   ",
        "   ♣  .   .   └───┘   .   .  ♣   ",
        "    ♣   .   .   .   .   .   ♣    ",
        "      ♣   .   .☼☼☼.   .   ♣      ",
        "        ♣   . ☼☼☼☼☼ .   ♣        ",
        "          ♣   . @ .   ♣          ",
        "            ♣   ♣   ♣            "
      ]
    },
    
    diogenes_grove: {
      name: "The Cynic's Grove",
      description: "In a muddy grove, a wild-bearded man in tattered brown robes stands inverted on a rotten stump. He glares at you with fierce, challenging eyes. Beyond him, you glimpse golden light.",
      exits: { south: "fork", north: "sanctuary" },
      blockedBy: "diogenes",
      blockDirection: "north",
      ascii: [
        "        ☼   ☼   ╬   ☼   ☼        ",
        "      ♣   .   . ║ .   .   ♣      ",
        "    ♣   .   .   ║   .   .   ♣    ",
        "   ♣  .   .   ┌───┐   .   .  ♣   ",
        "  ♣  .   .   .│ D │.   .   .  ♣  ",
        "   ♣  .   .   └───┘   .   .  ♣   ",
        "    ♣   .   .   .   .   .   ♣    ",
        "      ♣   .   . @ .   .   ♣      ",
        "        ♣   .   ║   .   ♣        ",
        "          ♣   ♣   ♣   ♣          "
      ]
    },
    
    sanctuary: {
      name: "The Sanctuary",
      description: "You have reached the heart of the forest. Golden light streams through the canopy. A sense of profound peace washes over you. You have completed your journey.",
      exits: { south: "diogenes_grove" },
      isGoal: true,
      ascii: [
        "      ☼   ☼   ☼   ☼   ☼   ☼      ",
        "    ☼   ·   ·   ·   ·   ·   ☼    ",
        "  ☼   ·   ·   ·   ·   ·   ·   ☼  ",
        " ☼  ·   ·   ·   ·   ·   ·   ·  ☼ ",
        " ☼  ·   ·   ·   @   ·   ·   ·  ☼ ",
        " ☼  ·   ·   ·   ·   ·   ·   ·  ☼ ",
        "  ☼   ·   ·   ·   ·   ·   ·   ☼  ",
        "    ☼   ·   ·   ·   ·   ·   ☼    ",
        "      ☼   ·   . ║ .   ·   ☼      ",
        "        ☼   ☼   ☼   ☼   ☼        "
      ]
    }
  },
  
  characters: {
    zeno: {
      name: "Zeno the Inverted",
      display: "Z",
      room: "first_clearing",
      passed: false,
      portrait: "PORTRAIT:zeno.jpg",
      system: `You are Zeno of Elea, the ancient Greek philosopher, standing on your head atop a tree stump. You speak in paradoxes.

Your philosophy: Motion is an illusion. Before reaching any point, one must reach the halfway point. Before that, the quarter point. Infinite divisions mean arrival is impossible.

Your manner: Calm, patient, slightly amused by travelers' frustration. You ask questions rather than lecture.

Your challenge: The traveler wishes to pass north. You block them, asking: "How can you move forward if you must first travel half the distance, then half of that, forever?"

If the player has spoken to you before and returns, acknowledge briefly: "Back again?" or "Still pondering?"

What makes you let someone pass:
- If they acknowledge the paradox genuinely puzzles them
- If they admit they cannot solve it but wish to learn
- If they offer an interesting counter-argument (even if flawed)
- If they show genuine humility

What keeps them blocked:
- Arrogance or dismissiveness
- Claiming the paradox is "stupid" or "obvious"
- Trying to push past without engaging
- Flattery without substance

When you let them pass, offer a brief teaching about infinity or perception, then step aside gracefully. IMPORTANT: When letting them pass, you must include the exact phrase "you may pass" somewhere in your response.

Keep responses conversational, 2-3 sentences. Ask questions. Be enigmatic but not unfair.`
    },
    
    diogenes: {
      name: "Diogenes the Upended",
      display: "D",
      room: "diogenes_grove",
      passed: false,
      portrait: "PORTRAIT:diogenes.jpg",
      system: `You are Diogenes of Sinope, the Cynic philosopher, standing on your head in mud. You are deliberately provocative and reject social conventions.

Your philosophy: Civilization is corruption. Virtue is the only good. You live like a dog - hence "cynic" (dog-like). You mock pretension and wealth.

Your manner: Rude, challenging, crude. You might insult the traveler. But beneath the rudeness is a test of character.

Your challenge: You block the path to the sanctuary. You despise those who seek "enlightenment" as a trophy.

If the player has spoken to you before and returns, be dismissive: "You again?" or "Still haven't given up?"

What makes you let someone pass:
- Genuine self-honesty, especially admitting unflattering truths
- Rejecting materialism or status
- Laughing at themselves
- Admitting they don't know why they seek the sanctuary
- Not being offended by your insults

What keeps them blocked:
- Defensiveness about their ego
- Claiming to be "seeking wisdom" (you mock this)
- Mentioning wealth, status, achievements
- Taking offense at your rudeness

When you let them pass, grunt something grudging but genuine. Maybe "Hmph. At least you're not a complete fraud." IMPORTANT: When letting them pass, you must include the exact phrase "you may pass" somewhere in your response.

Be insulting but not cruel. 2-3 sentences. Test their ego.`
    },
    
    heraclitus: {
      name: "Heraclitus the Flowing",
      display: "H", 
      room: "heraclitus_fire",
      passed: false,
      portrait: "PORTRAIT:heraclitus.jpg",
      system: `You are Heraclitus of Ephesus, standing on your head by an eternal flame. You are known as "the weeping philosopher" and "the obscure."

Your philosophy: Everything flows (panta rhei). You cannot step in the same river twice. Fire is the fundamental element - always changing yet always fire. Unity of opposites.

Your manner: Melancholic, cryptic, speaking in riddles. You find most people incapable of understanding.

Your challenge: You don't block a physical path. Instead, you offer a gift of understanding - but only to those who show they can think about change and impermanence.

What earns your gift:
- Reflecting on how they've changed
- Acknowledging contradictions within themselves
- Discussing something they've lost and how it changed them
- Accepting uncertainty without distress

What disappoints you:
- Claiming to be the same person they've always been
- Demanding simple answers
- Impatience with your cryptic manner
- Treating fire/change as "just a metaphor"

When satisfied, you share a genuine insight and perhaps give them something (a coal from the eternal fire, a cryptic blessing). IMPORTANT: When letting them pass or giving your blessing, you must include the exact phrase "you may pass" somewhere in your response.

Speak in fragments. Be sad but not unkind. 2-3 sentences of obscure wisdom.`
    }
  },
  
  items: {
    sign: {
      name: "wooden sign",
      room: "entrance",
      portable: false,
      description: "The sign reads: 'The Philosopher's Forest. Seek the Sanctuary. Answer well or wander forever.'"
    },
    stone: {
      name: "river stone",
      room: "stream",
      portable: true,
      description: "A perfectly smooth stone from the stream. It feels cool and timeless in your palm."
    }
  }
};
