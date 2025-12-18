// ============================================
// GAME STATE
// ============================================

let state = {
  currentRoom: "entrance",
  inventory: [],
  visited: new Set(["entrance"]),
  charactersPassed: {},
  conversationHistory: {},
  talkingTo: null,
  turnCount: 0,
  won: false
};

// ============================================
// RENDERING
// ============================================

function renderMap() {
  const room = CONFIG.rooms[state.currentRoom];
  if (!room.ascii) return;
  
  let mapHtml = room.ascii.map(row => {
    return row.split('').map(char => {
      let cls = '';
      if (char === '@') cls = 'player';
      else if (char === 'Z' || char === 'D' || char === 'H') cls = 'npc';
      else if (char === '│' || char === '─' || char === '┌' || char === '┐' || char === '└' || char === '┘' || char === '╬' || char === '▐' || char === '▌' || char === '█') cls = 'wall';
      else if (char === '═' || char === '║') cls = 'path';
      else if (char === '♣') cls = 'fog';
      else if (char === '≈' || char === '☼' || char === '·') cls = 'door';
      else if (char === '○') cls = 'npc';
      else cls = 'floor';
      return `<span class="${cls}">${char}</span>`;
    }).join('');
  }).join('\n');
  
  document.getElementById('map').innerHTML = mapHtml;
}

function formatText(text) {
  // Convert markdown-style formatting to HTML
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')  // **bold**
    .replace(/\*(.+?)\*/g, '<em>$1</em>')              // *italic*
    .replace(/\n/g, '<br>');                           // newlines
}

function addDialogue(type, speaker, text) {
  const dialogue = document.getElementById('dialogue');
  const entry = document.createElement('div');
  entry.className = `dialogue-entry ${type}`;
  entry.innerHTML = `<div class="speaker">${speaker}</div><div>${formatText(text)}</div>`;
  dialogue.appendChild(entry);
  dialogue.scrollTop = dialogue.scrollHeight;
}

function updateStatus() {
  const room = CONFIG.rooms[state.currentRoom];
  const passedCount = Object.values(state.charactersPassed).filter(v => v).length;
  const totalCharacters = Object.keys(CONFIG.characters).length;
  
  let html = `
    <div class="status-item">Location: <span>${room.name}</span></div>
    <div class="status-item">Philosophers convinced: <span>${passedCount}/${totalCharacters}</span></div>
  `;
  
  if (state.inventory.length > 0) {
    html += `<div class="status-item">Carrying: <span>${state.inventory.join(', ')}</span></div>`;
  }
  
  document.getElementById('status').innerHTML = html;
  updatePortrait();
}

function updatePortrait() {
  const room = CONFIG.rooms[state.currentRoom];
  let npcHere = null;
  
  // Find NPC in current room
  for (const [charId, char] of Object.entries(CONFIG.characters)) {
    if (char.room === state.currentRoom || room.blockedBy === charId) {
      npcHere = charId;
      break;
    }
  }
  
  const portraitBox = document.getElementById('portrait-box');
  const portraitImg = document.getElementById('portrait');
  const portraitName = document.getElementById('portrait-name');
  
  if (npcHere && CONFIG.characters[npcHere].portrait) {
    portraitImg.src = CONFIG.characters[npcHere].portrait;
    portraitName.textContent = CONFIG.characters[npcHere].name;
    portraitBox.style.display = 'block';
  } else {
    portraitBox.style.display = 'none';
  }
}

function setNarrator(text) {
  document.getElementById('narrator').innerHTML = text;
}

// ============================================
// AI INTERACTION
// ============================================

async function callAI(systemPrompt, messages) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 300,
        system: systemPrompt,
        messages: messages
      })
    });
    
    const data = await response.json();
    if (data.content && data.content[0]) {
      return data.content[0].text;
    }
    return null;
  } catch (e) {
    console.error("AI call failed:", e);
    return null;
  }
}

async function talkToCharacter(charId, playerMessage) {
  const char = CONFIG.characters[charId];
  if (!char) return;
  
  // Initialize conversation history
  if (!state.conversationHistory[charId]) {
    state.conversationHistory[charId] = [];
  }
  
  // Add player message to history
  state.conversationHistory[charId].push({
    role: "user",
    content: playerMessage
  });
  
  // Show player message
  addDialogue('player', 'You', playerMessage);
  
  // Get AI response
  setNarrator('<span class="loading">The philosopher considers</span>');
  
  const response = await callAI(char.system, state.conversationHistory[charId]);
  
  if (response) {
    state.conversationHistory[charId].push({
      role: "assistant", 
      content: response
    });
    
    addDialogue('character', char.name, response);
    
    // Check if they've passed (heuristic - look for phrases indicating passage)
    const passagePhrases = [
      'may pass', 'step aside', 'steps aside', 'let you', 'go on', 
      'proceed', 'path is yours', 'you may go', 'move along', 'way is open', 
      'hmph', 'pass freely', 'pass,', 'pass.', 'pass!',
      'way is clear', 'path awaits', 'journey on', 'continue north',
      'continue your', 'go forth', 'be on your way', 'you may proceed',
      'i shall not stop', 'won\'t stop you', 'blocking no more',
      'you\'ve earned', 'you have earned', 'well done', 'you pass'
    ];
    const lowerResponse = response.toLowerCase();
    if (passagePhrases.some(phrase => lowerResponse.includes(phrase)) && !state.charactersPassed[charId]) {
      state.charactersPassed[charId] = true;
      addDialogue('system', 'System', `${char.name} steps aside. The way forward is clear.`);
    }
    
    // Narrator observes
    await updateNarrator(`Player said to ${char.name}: "${playerMessage}". ${char.name} responded: "${response}"`);
  } else {
    addDialogue('system', 'System', 'The philosopher remains silent, lost in thought.');
  }
}

async function updateNarrator(context) {
  // Only narrate sometimes to avoid overload
  if (Math.random() > 0.7 && state.turnCount > 1) {
    return;
  }
  
  const narratorPrompt = CONFIG.narrator.system;
  const response = await callAI(narratorPrompt, [
    { role: "user", content: `Current room: ${CONFIG.rooms[state.currentRoom].name}. ${context}` }
  ]);
  
  if (response && response !== "...") {
    setNarrator(response);
  }
}

// ============================================
// GAME LOGIC
// ============================================

function describeRoom() {
  const room = CONFIG.rooms[state.currentRoom];
  addDialogue('room', room.name, room.description);
  
  // Mention exits
  const exits = Object.keys(room.exits);
  if (exits.length > 0) {
    addDialogue('system', 'Exits', exits.join(', '));
  }
  
  // Check for win - must convince ALL philosophers
  if (room.isGoal && !state.won) {
    const totalPhilosophers = Object.keys(CONFIG.characters).length;
    const passedCount = Object.values(state.charactersPassed).filter(v => v).length;
    
    if (passedCount >= totalPhilosophers) {
      state.won = true;
      addDialogue('system', '✨ Victory ✨', 'You have reached the Sanctuary. Your journey through the Philosopher\'s Forest is complete.');
      setNarrator('And so the kid made it. Not many do.');
    } else {
      const remaining = totalPhilosophers - passedCount;
      addDialogue('system', 'System', `You stand in the golden light, but something feels incomplete. ${remaining} philosopher${remaining > 1 ? 's' : ''} remain${remaining === 1 ? 's' : ''} unconvinced in the forest behind you.`);
      setNarrator('Almost. But wisdom cannot be skipped.');
    }
  }
}

function tryMove(direction) {
  const room = CONFIG.rooms[state.currentRoom];
  
  if (!room.exits[direction]) {
    addDialogue('system', 'System', `You cannot go ${direction} from here.`);
    return false;
  }
  
  // Check if blocked by character
  if (room.blockedBy && room.blockDirection === direction && !state.charactersPassed[room.blockedBy]) {
    const char = CONFIG.characters[room.blockedBy];
    addDialogue('system', 'System', `${char.name} blocks your path. Perhaps you should talk to them.`);
    return false;
  }
  
  // Move
  state.currentRoom = room.exits[direction];
  state.visited.add(state.currentRoom);
  renderMap();
  describeRoom();
  updateStatus();
  
  return true;
}

function lookAtItem(itemName) {
  // Check room items
  for (const [id, item] of Object.entries(CONFIG.items)) {
    if (item.room === state.currentRoom && item.name.toLowerCase().includes(itemName.toLowerCase())) {
      addDialogue('system', 'System', item.description);
      return true;
    }
  }
  
  // Check inventory
  if (state.inventory.some(i => i.toLowerCase().includes(itemName.toLowerCase()))) {
    const item = Object.values(CONFIG.items).find(i => i.name.toLowerCase().includes(itemName.toLowerCase()));
    if (item) {
      addDialogue('system', 'System', item.description);
      return true;
    }
  }
  
  addDialogue('system', 'System', `You don't see "${itemName}" here.`);
  return false;
}

function takeItem(itemName) {
  for (const [id, item] of Object.entries(CONFIG.items)) {
    if (item.room === state.currentRoom && item.name.toLowerCase().includes(itemName.toLowerCase())) {
      if (!item.portable) {
        addDialogue('system', 'System', `You can't take the ${item.name}.`);
        return false;
      }
      item.room = null;
      state.inventory.push(item.name);
      addDialogue('system', 'System', `You take the ${item.name}.`);
      updateStatus();
      return true;
    }
  }
  addDialogue('system', 'System', `You don't see "${itemName}" here.`);
  return false;
}

async function processCommand(input) {
  const cmd = input.toLowerCase().trim();
  state.turnCount++;
  
  const room = CONFIG.rooms[state.currentRoom];
  
  // Find NPC in current room
  let npcHere = null;
  for (const [charId, char] of Object.entries(CONFIG.characters)) {
    if (char.room === state.currentRoom || room.blockedBy === charId) {
      npcHere = charId;
      break;
    }
  }
  
  // Movement commands still work
  if (cmd.startsWith('go ') || cmd.startsWith('move ') || cmd.startsWith('walk ')) {
    const dir = cmd.split(' ')[1];
    tryMove(dir);
    return;
  }
  
  if (['north', 'south', 'east', 'west', 'n', 's', 'e', 'w'].includes(cmd)) {
    const dirMap = { n: 'north', s: 'south', e: 'east', w: 'west' };
    tryMove(dirMap[cmd] || cmd);
    return;
  }
  
  // Look
  if (cmd === 'look' || cmd === 'l') {
    describeRoom();
    return;
  }
  
  if (cmd.startsWith('look at ') || cmd.startsWith('examine ') || cmd.startsWith('read ')) {
    const target = cmd.replace(/^(look at |examine |read )/, '');
    lookAtItem(target);
    return;
  }
  
  // Take
  if (cmd.startsWith('take ') || cmd.startsWith('get ') || cmd.startsWith('pick up ')) {
    const item = cmd.replace(/^(take |get |pick up )/, '');
    takeItem(item);
    return;
  }
  
  // Inventory
  if (cmd === 'inventory' || cmd === 'i') {
    if (state.inventory.length === 0) {
      addDialogue('system', 'System', 'You are not carrying anything.');
    } else {
      addDialogue('system', 'System', `You are carrying: ${state.inventory.join(', ')}`);
    }
    return;
  }
  
  // Help
  if (cmd === 'help' || cmd === '?') {
    addDialogue('system', 'Commands', 
      'Movement: arrow keys or north/south/east/west<br>' +
      'Look: look, look at [thing], examine [thing]<br>' +
      'Items: take [item], inventory<br>' +
      'Conversation: just type - if someone is here, they will hear you'
    );
    return;
  }
  
  // Context-based: if NPC present, talk to them
  if (npcHere) {
    state.talkingTo = npcHere;
    await talkToCharacter(npcHere, input);
    return;
  }
  
  // No NPC - narrator comments on talking to air
  const lonelySays = [
    "Talking to the trees. They don't answer.",
    "Words drift into the empty air.",
    "No one here to listen.",
    "The forest absorbs your words in silence.",
    "..."
  ];
  setNarrator(lonelySays[Math.floor(Math.random() * lonelySays.length)]);
  addDialogue('player', 'You', input);
  addDialogue('system', 'System', 'There is no one here to talk to.');
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
  document.getElementById('game-title').textContent = CONFIG.world.name;
  
  renderMap();
  describeRoom();
  updateStatus();
  
  const input = document.getElementById('input');
  const sendBtn = document.getElementById('send');
  
  async function handleInput() {
    const text = input.value.trim();
    if (!text) return;
    
    input.value = '';
    sendBtn.disabled = true;
    input.disabled = true;
    
    await processCommand(text);
    
    sendBtn.disabled = false;
    input.disabled = false;
    input.focus();
  }
  
  sendBtn.addEventListener('click', handleInput);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleInput();
    }
  });
  
  // Arrow key movement
  document.addEventListener('keydown', (e) => {
    // Skip if typing in input field with content
    if (document.activeElement === input && input.value.length > 0) return;
    
    const arrowMap = {
      'ArrowUp': 'north',
      'ArrowDown': 'south',
      'ArrowLeft': 'west',
      'ArrowRight': 'east'
    };
    
    if (arrowMap[e.key]) {
      e.preventDefault();
      
      // If talking, end conversation first
      if (state.talkingTo) {
        const charName = CONFIG.characters[state.talkingTo].name;
        addDialogue('system', 'System', `You turn away from ${charName}.`);
        state.talkingTo = null;
      }
      
      tryMove(arrowMap[e.key]);
      updateStatus();
    }
  });
  
  input.focus();
}

init();
