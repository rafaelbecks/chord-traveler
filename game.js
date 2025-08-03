import { CONFIG } from './config.js';
import { Character } from './character.js';
import { TerrainManager } from './terrain.js';
import { MIDIController } from './midi.js';
import { BackgroundVisuals } from './visuals.js';
import { ParticleSystem } from './particles.js';
import { UIController, drawVectrexText } from './ui.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    
    this.setupCanvas();
    this.initializeGame();
    this.setupMIDI();
    this.setupEventListeners();
    
    this.gameLoop();
  }

  setupCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.terrainManager.generateTerrain();
    });
  }

  initializeGame() {
    // Initialize game components
    this.character = new Character(this.canvas);
    this.terrainManager = new TerrainManager(this.canvas);
    this.midiController = new MIDIController();
    this.backgroundVisuals = new BackgroundVisuals();
    this.particleSystem = new ParticleSystem();
    this.uiController = new UIController();
    
    // Game state
    this.camera = { x: 0 };
    this.difficulty = 'easy';
    this.chordTimeout = CONFIG.MIDI.CHORD_TIMEOUT;
    this.hue = 0;
    
    // Set up UI callbacks
    this.uiController.onDifficultyChange = (difficulty) => {
      this.difficulty = difficulty;
      this.terrainManager.setDifficulty(difficulty);
    };
    
    this.uiController.onChordTimeoutChange = (timeout) => {
      this.chordTimeout = timeout;
      this.midiController.setChordTimeout(timeout);
    };
    
    this.uiController.onRegenerate = () => {
      this.terrainManager.generateTerrain();
      this.character.reset();
      this.camera.x = 0;
    };
    
    // Set initial UI values
    this.uiController.setInitialValues(this.difficulty, this.chordTimeout);
    this.uiController.setDebugMessage('Waiting for MIDI input...');
  }

  setupMIDI() {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess()
        .then(this.onMIDISuccess.bind(this), this.onMIDIFailure.bind(this));
    } else {
      this.uiController.setDebugMessage('Web MIDI is not supported in this browser.');
    }
  }

  onMIDISuccess(midiAccess) {
    this.uiController.setDebugMessage('MIDI connected. Play something...');
    for (let input of midiAccess.inputs.values()) {
      input.onmidimessage = this.handleMIDIMessage.bind(this);
    }
  }

  onMIDIFailure() {
    this.uiController.setDebugMessage('Could not access your MIDI devices.');
  }

  handleMIDIMessage(message) {
    const { isNoteOn, note, velocity } = this.midiController.handleMIDIMessage(message);
    
    console.log('MIDI message:', { isNoteOn, note, velocity }); // Debug log
    
    if (isNoteOn) {
      const chord = this.midiController.detectChordOnNote();
      console.log('Detected chord:', chord); // Debug log
      if (chord) {
        this.processChord(chord);
      }
    }
  }

  processChord(chord) {
    console.log('Processing chord:', chord); // Debug log
    
    this.hue = chord.hue;
    this.character.changeHeadShape();
    
    const jumpPower = this.midiController.getJumpPower(chord.type, chord.bassNotes.length);
    const jumpDistance = this.midiController.getJumpDistance(chord.bassNotes.length);
    const glowIntensity = this.midiController.getGlowIntensity(chord.type);
    
    console.log('Jump power:', jumpPower, 'Jump distance:', jumpDistance, 'Chord type:', chord.type); // Debug log
    
    this.character.setGlowIntensity(glowIntensity);
    
    // Handle movement based on chord type
    if (chord.type === 'single') {
      console.log('Stepping forward'); // Debug log
      this.character.step();
    } else {
      console.log('Jumping!'); // Debug log
      this.character.jump(jumpPower, jumpDistance);
      this.particleSystem.createJumpParticles(
        this.character.x, 
        this.character.y + this.character.size * 0.5, 
        jumpPower, 
        this.hue
      );
    }
    
    this.uiController.updateDebugInfo(chord, jumpPower, jumpDistance, this.difficulty, this.chordTimeout);
  }

  setupEventListeners() {
    // Gravity loop
    setInterval(() => {
      this.character.update();
      
      // Check ground collision
      const collision = this.terrainManager.checkCollision(this.character);
      if (collision.collided) {
        this.character.land(collision.y);
      }
      
      // Fall to void
      if (this.character.isFallen()) {
        this.uiController.setDebugMessage('You fell!');
        this.character.reset();
        this.camera.x = 0;
        this.particleSystem.createFallParticles(this.character.x, this.character.y, this.hue);
      }
      
      // Update camera position
      this.camera.x = this.character.x - this.canvas.width / 4;
    }, 30);
  }

  gameLoop() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Update background visuals
    this.backgroundVisuals.update();

    // Get active notes for background
    let activeNotes = this.midiController.getActiveNotes();
    
    // Use initial chord if game hasn't started yet
    if (!this.midiController.isGameStarted() && activeNotes.length === 0) {
      activeNotes = this.midiController.getInitialChordNotes();
    }
    
    // Draw background visuals
    this.backgroundVisuals.drawGegoShapeBackground(this.ctx, activeNotes, this.hue);
    this.backgroundVisuals.drawBackgroundPattern(this.ctx, this.camera);

    // Draw terrain
    this.terrainManager.drawTerrain(this.ctx, this.camera, this.hue);

    // Update and draw particles
    this.particleSystem.update();
    this.particleSystem.draw(this.ctx);

    // Draw character
    this.character.draw(this.ctx, this.camera, this.hue);

    // Draw title if game hasn't started
    if (!this.midiController.isGameStarted()) {
      const titleX = (this.canvas.width - 670) / 2;
      const titleY = this.canvas.height / 3;
      drawVectrexText(this.ctx, "CHORD TRAVELER", titleX, titleY, 4, 'white');
    }

    requestAnimationFrame(() => this.gameLoop());
  }
}

// Start the game when the page loads
window.addEventListener('load', () => {
  new Game();
}); 