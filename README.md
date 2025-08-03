# Chord Traveler

A generative web game controlled by MIDI input. Navigate a character across procedurally generated terrain using musical chords.

## Controls

- **Single note**: Step forward
- **3-note chord**: Jump
- **4+ note chord**: Higher jump
- **Bass notes**: Increase jump distance

## Setup

1. Connect a MIDI controller to your computer
2. Open `index.html` in a web browser
3. Allow MIDI access when prompted
4. Start playing


## Files

- `game.js` - Main game logic
- `character.js` - Character movement and rendering
- `terrain.js` - Terrain generation and collision
- `midi.js` - MIDI input handling and chord detection
- `visuals.js` - Background visual effects
- `particles.js` - Particle system
- `ui.js` - User interface and controls
- `config.js` - Game configuration 