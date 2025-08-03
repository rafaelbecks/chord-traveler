import { CONFIG } from './config.js';

export class MIDIController {
  constructor() {
    this.recentNotes = [];
    this.chordTimeout = CONFIG.MIDI.CHORD_TIMEOUT;
    this.gameStarted = false;
    this.initialChord = this.generateInitialChord();
  }

  generateInitialChord() {
    const chordTypes = CONFIG.INITIAL_CHORDS;
    return chordTypes[Math.floor(Math.random() * chordTypes.length)];
  }

  getNoteName(note) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return noteNames[note % 12];
  }

  getChordType(notes) {
    if (notes.length < 2) return 'single';
    
    const sortedNotes = [...notes].sort((a, b) => a - b);
    const intervals = [];
    
    for (let i = 1; i < sortedNotes.length; i++) {
      intervals.push((sortedNotes[i] - sortedNotes[i-1]) % 12);
    }
    
    // Major triad: root, major third (4 semitones), perfect fifth (7 semitones)
    if (notes.length === 3 && intervals.includes(4) && intervals.includes(7)) {
      return 'major';
    }
    
    // Minor triad: root, minor third (3 semitones), perfect fifth (7 semitones)
    if (notes.length === 3 && intervals.includes(3) && intervals.includes(7)) {
      return 'minor';
    }
    
    // Major 7th: major triad + major seventh (11 semitones)
    if (notes.length === 4 && intervals.includes(4) && intervals.includes(7) && intervals.includes(11)) {
      return 'major7';
    }
    
    // Minor 7th: minor triad + minor seventh (10 semitones)
    if (notes.length === 4 && intervals.includes(3) && intervals.includes(7) && intervals.includes(10)) {
      return 'minor7';
    }
    
    // Dominant 7th: major triad + minor seventh (10 semitones)
    if (notes.length === 4 && intervals.includes(4) && intervals.includes(7) && intervals.includes(10)) {
      return 'dominant7';
    }
    
    // Complex chords (5+ notes or unusual intervals)
    if (notes.length >= 5) {
      return 'complex';
    }
    
    // Extended chords (9ths, 11ths, 13ths)
    if (notes.length >= 4) {
      return 'extended';
    }
    
    return 'cluster';
  }



  getJumpPower(chordType, bassCount = 0) {
    let basePower = 0;
    
    switch (chordType) {
      case 'single': basePower = CONFIG.JUMP_POWER.SINGLE; break;
      case 'major': basePower = CONFIG.JUMP_POWER.MAJOR; break;
      case 'minor': basePower = CONFIG.JUMP_POWER.MINOR; break;
      case 'major7': basePower = CONFIG.JUMP_POWER.MAJOR7; break;
      case 'minor7': basePower = CONFIG.JUMP_POWER.MINOR7; break;
      case 'dominant7': basePower = CONFIG.JUMP_POWER.DOMINANT7; break;
      case 'extended': basePower = CONFIG.JUMP_POWER.EXTENDED; break;
      case 'complex': basePower = CONFIG.JUMP_POWER.COMPLEX; break;
      case 'cluster': basePower = CONFIG.JUMP_POWER.CLUSTER; break;
      default: basePower = 0;
    }
    
    // Add extra height for each bass note
    return basePower + (bassCount * CONFIG.JUMP_POWER.BASS_MULTIPLIER);
  }

  getJumpDistance(bassCount) {
    // Each bass note adds horizontal distance
    return bassCount * 15;
  }

  getGlowIntensity(chordType) {
    const intensities = CONFIG.VISUALS.GLOW_INTENSITY;
    return intensities[chordType.toUpperCase()] || 0;
  }

  handleMIDIMessage(message) {
    const [status, note, velocity] = message.data;
    const isNoteOn = status === 144 && velocity > 0;
    const isNoteOff = status === 128 || (status === 144 && velocity === 0);

    if (isNoteOn) {
      // Mark game as started on first MIDI input
      if (!this.gameStarted) {
        this.gameStarted = true;
      }
      
      // Add note with timestamp
      this.recentNotes.push({
        note: note,
        timestamp: Date.now()
      });
    }

    return { isNoteOn, note, velocity };
  }

  detectChordOnNote() {
    const now = Date.now();
    
    // Clean up old notes
    this.recentNotes = this.recentNotes.filter(note => now - note.timestamp < this.chordTimeout);
    
    // Get all notes within the time window
    const allNotes = this.recentNotes.map(note => note.note);
    const uniqueNotes = [...new Set(allNotes)];
    
    console.log('All notes detected:', uniqueNotes); // Debug log
    
    if (uniqueNotes.length === 0) return null;
    
    const trebleNotes = uniqueNotes.filter(note => note >= CONFIG.MIDI.BASS_THRESHOLD);
    const bassNotes = uniqueNotes.filter(note => note < CONFIG.MIDI.BASS_THRESHOLD);
    
    console.log('Treble notes:', trebleNotes, 'Bass notes:', bassNotes); // Debug log
    
    // Use ALL notes to determine chord type, not just treble notes
    const chordType = this.getChordType(uniqueNotes);
    
    console.log('Chord type determined:', chordType); // Debug log
    
    return {
      notes: uniqueNotes,
      trebleNotes: trebleNotes,
      bassNotes: bassNotes,
      type: chordType,
      noteNames: uniqueNotes.map(note => this.getNoteName(note)),
      noteCount: uniqueNotes.length,
      hue: uniqueNotes.length > 0 ? (uniqueNotes[0] * 5) % 360 : 0
    };
  }

  getActiveNotes() {
    return Array.from(this.recentNotes).map(note => ({
      midi: note.note,
      velocity: 0.5 // Default velocity for background
    }));
  }

  getInitialChordNotes() {
    return this.initialChord.map(note => ({
      midi: note,
      velocity: 0.5
    }));
  }

  setChordTimeout(timeout) {
    this.chordTimeout = timeout;
  }

  isGameStarted() {
    return this.gameStarted;
  }
} 