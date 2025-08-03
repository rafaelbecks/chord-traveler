import { CONFIG } from './config.js';

// Vectrex-style retro font
export function drawVectrexText(ctx, text, x, y, size = 1, color = 'white') {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = size * 3;
  
  const charWidth = size * 12;
  const charHeight = size * 16;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i].toUpperCase();
    const charX = x + i * charWidth;
    drawVectrexChar(ctx, char, charX, y, size);
  }
  
  ctx.restore();
}

function drawVectrexChar(ctx, char, x, y, size) {
  const segments = getVectrexSegments(char);
  const scale = size;
  
  ctx.beginPath();
  segments.forEach(segment => {
    ctx.moveTo(x + segment[0] * scale, y + segment[1] * scale);
    ctx.lineTo(x + segment[2] * scale, y + segment[3] * scale);
  });
  ctx.stroke();
}

function getVectrexSegments(char) {
  const segments = {
    'C': [[2,0, 2,16], [2,0, 10,0], [2,16, 10,16]],
    'H': [[2,0, 2,16], [10,0, 10,16], [2,8, 10,8]],
    'O': [[2,0, 10,0], [10,0, 10,16], [10,16, 2,16], [2,16, 2,0]],
    'R': [[2,0, 2,16], [2,0, 10,0], [10,0, 10,8], [10,8, 2,8], [2,8, 10,16]],
    'D': [[2,0, 2,16], [2,0, 8,0], [8,0, 10,8], [10,8, 8,16], [8,16, 2,16]],
    'T': [[2,0, 10,0], [6,0, 6,16]],
    'A': [[2,16, 6,0], [6,0, 10,16], [3,8, 9,8]],
    'V': [[2,0, 6,16], [6,16, 10,0]],
    'E': [[2,0, 2,16], [2,0, 10,0], [2,8, 8,8], [2,16, 10,16]],
    'L': [[2,0, 2,16], [2,16, 10,16]],
    ' ': []
  };
  
  return segments[char] || [];
}

export class UIController {
  constructor() {
    this.difficultySelect = document.getElementById('difficulty');
    this.chordTimeoutSlider = document.getElementById('chordTimeout');
    this.timeoutValueDisplay = document.getElementById('timeoutValue');
    this.regenerateButton = document.getElementById('regenerate');
    this.debugEl = document.getElementById('debug');
    this.infoButton = document.getElementById('infoButton');
    this.modal = document.getElementById('modal');
    this.closeModal = document.getElementById('closeModal');
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.difficultySelect.addEventListener('change', (e) => {
      this.onDifficultyChange?.(e.target.value);
    });

    this.chordTimeoutSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      this.timeoutValueDisplay.textContent = value + 'ms';
      this.onChordTimeoutChange?.(value);
    });

    this.regenerateButton.addEventListener('click', () => {
      this.onRegenerate?.();
    });

    this.infoButton.addEventListener('click', () => {
      this.showModal();
    });

    this.closeModal.addEventListener('click', () => {
      this.hideModal();
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hideModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.style.display === 'flex') {
        this.hideModal();
      }
    });
  }

  setInitialValues(difficulty, chordTimeout) {
    this.difficultySelect.value = difficulty;
    this.chordTimeoutSlider.value = chordTimeout;
    this.timeoutValueDisplay.textContent = chordTimeout + 'ms';
  }

  updateDebugInfo(chord, jumpPower, jumpDistance, difficulty, chordTimeout) {
    const jumpText = chord.type === 'single' ? 'Step' : `Jump (H:${jumpPower}, D:${jumpDistance})`;
    const bassInfo = chord.bassNotes.length > 0 ? ` | Bass: ${chord.bassNotes.join(',')}` : '';
    const difficultyInfo = ` | ${difficulty.toUpperCase()} | ${chordTimeout}ms`;
    this.debugEl.textContent = `Chord: ${chord.type} (${chord.noteNames.join(', ')})${bassInfo} - ${jumpText}${difficultyInfo}`;
    
    // Add visual feedback to debug element
    this.debugEl.style.borderColor = `hsl(${chord.hue || 0}, 100%, 70%)`;
    this.debugEl.style.boxShadow = `0 0 10px hsl(${chord.hue || 0}, 100%, 50%)`;
    
    // Reset border after a short delay
    setTimeout(() => {
      this.debugEl.style.borderColor = 'white';
      this.debugEl.style.boxShadow = 'none';
    }, 200);
  }

  setDebugMessage(message) {
    this.debugEl.textContent = message;
  }

  showModal() {
    this.modal.style.display = 'flex';
  }

  hideModal() {
    this.modal.style.display = 'none';
  }
} 