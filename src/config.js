// Game Configuration
export const CONFIG = {
  // Character settings
  CHARACTER: {
    SIZE: 60,
    GRAVITY: 1,
    STEP_SIZE: 30,
    INITIAL_X: 0,
    INITIAL_Y: 0
  },

  // Terrain settings
  TERRAIN: {
    GRID_SPACING: 8,
    SEGMENT_WIDTH_MIN: 80,
    SEGMENT_WIDTH_MAX: 120,
    SAFE_START_SEGMENTS: 3,
    GROUND_HEIGHT: 20
  },

  // MIDI settings
  MIDI: {
    BASS_THRESHOLD: 60, // Middle C is 60
    CHORD_TIMEOUT: 150, // ms to consider notes part of same chord
    CHORD_TIMEOUT_MIN: 50,
    CHORD_TIMEOUT_MAX: 300
  },

  // Difficulty settings
  DIFFICULTY: {
    EASY: {
      gapChance: 0.1,
      mountainChance: 0.15,
      valleyChance: 0.1,
      mountainHeight: { min: 40, max: 60 },
      valleyDepth: { min: 15, max: 30 }
    },
    MEDIUM: {
      gapChance: 0.15,
      mountainChance: 0.2,
      valleyChance: 0.15,
      mountainHeight: { min: 50, max: 80 },
      valleyDepth: { min: 20, max: 45 }
    },
    HARD: {
      gapChance: 0.2,
      mountainChance: 0.25,
      valleyChance: 0.2,
      mountainHeight: { min: 60, max: 100 },
      valleyDepth: { min: 25, max: 60 }
    }
  },

  // Jump power settings
  JUMP_POWER: {
    SINGLE: 0,
    MAJOR: 15,
    MINOR: 15,
    MAJOR7: 20,
    MINOR7: 20,
    DOMINANT7: 20,
    EXTENDED: 25,
    COMPLEX: 30,
    CLUSTER: 10,
    BASS_MULTIPLIER: 3
  },

  // Visual settings
  VISUALS: {
    BACKGROUND_GRID_SIZE: 50,
    PARTICLE_LIFE_MIN: 30,
    PARTICLE_LIFE_MAX: 50,
    GLOW_INTENSITY: {
      SINGLE: 0,
      MAJOR: 0.3,
      MINOR: 0.3,
      MAJOR7: 0.6,
      MINOR7: 0.6,
      DOMINANT7: 0.6,
      EXTENDED: 0.8,
      COMPLEX: 1.0,
      CLUSTER: 0.2
    }
  },

  // Initial chord types
  INITIAL_CHORDS: [
    [60, 64, 67], // C major
    [60, 63, 67], // C minor
    [62, 66, 69], // D major
    [64, 68, 71], // E major
    [65, 69, 72], // F major
    [67, 71, 74], // G major
    [69, 73, 76], // A major
    [71, 75, 78]  // B major
  ]
}; 