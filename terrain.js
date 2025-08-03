import { CONFIG } from './config.js';

export class TerrainManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.terrain = [];
    this.difficulty = 'easy';
    this.generateTerrain();
  }

  generateTerrain() {
    this.terrain = [];
    let x = 0;
    const groundY = this.canvas.height - 70;
    const settings = CONFIG.DIFFICULTY[this.difficulty.toUpperCase()];

    // Ensure safe starting area (no holes for first few segments)
    const safeStartSegments = CONFIG.TERRAIN.SAFE_START_SEGMENTS;
    let segmentCount = 0;

    while (x < this.canvas.width * 3) {
      const segmentWidth = CONFIG.TERRAIN.SEGMENT_WIDTH_MIN + Math.random() * (CONFIG.TERRAIN.SEGMENT_WIDTH_MAX - CONFIG.TERRAIN.SEGMENT_WIDTH_MIN);
      const terrainType = Math.random();
      
      // Force ground for the first few segments
      if (segmentCount < safeStartSegments) {
        this.terrain.push({
          x: x,
          width: segmentWidth,
          y: groundY,
          height: CONFIG.TERRAIN.GROUND_HEIGHT,
          type: 'ground'
        });
      } else {
        if (terrainType < settings.gapChance) {
          // Gap/valley
          x += segmentWidth;
          continue;
        } else if (terrainType < settings.gapChance + settings.mountainChance) {
          // Mountain (higher platform)
          const mountainHeight = settings.mountainHeight.min + Math.random() * (settings.mountainHeight.max - settings.mountainHeight.min);
          this.terrain.push({
            x: x,
            width: segmentWidth,
            y: groundY - mountainHeight,
            height: CONFIG.TERRAIN.GROUND_HEIGHT,
            type: 'mountain'
          });
        } else if (terrainType < settings.gapChance + settings.mountainChance + settings.valleyChance) {
          // Valley (lower platform)
          const valleyDepth = settings.valleyDepth.min + Math.random() * (settings.valleyDepth.max - settings.valleyDepth.min);
          this.terrain.push({
            x: x,
            width: segmentWidth,
            y: groundY + valleyDepth,
            height: CONFIG.TERRAIN.GROUND_HEIGHT,
            type: 'valley'
          });
        } else {
          // Normal ground
          this.terrain.push({
            x: x,
            width: segmentWidth,
            y: groundY,
            height: CONFIG.TERRAIN.GROUND_HEIGHT,
            type: 'ground'
          });
        }
      }
      x += segmentWidth;
      segmentCount++;
    }
  }

  drawTerrain(ctx, camera, hue) {
    this.terrain.forEach(seg => {
      const x = seg.x - camera.x;
      const terrainType = seg.type || 'ground';
      
      // Retro wireframe style - no fills, only lines
      const gridSpacing = CONFIG.TERRAIN.GRID_SPACING;
      const gridColor = `hsla(${hue}, 100%, 70%, 0.8)`;
      const gridGlow = `hsla(${hue}, 100%, 70%, 0.3)`;
      
      ctx.strokeStyle = gridColor;
      ctx.shadowColor = gridGlow;
      ctx.shadowBlur = 5;
      ctx.lineWidth = 1;
      
      // Draw wireframe grid for each terrain segment
      const gridWidth = Math.floor(seg.width / gridSpacing);
      const gridHeight = Math.floor(seg.height / gridSpacing);
      
      // Vertical lines
      for (let i = 0; i <= gridWidth; i++) {
        const gridX = x + i * gridSpacing;
        ctx.beginPath();
        ctx.moveTo(gridX, seg.y);
        ctx.lineTo(gridX, seg.y + seg.height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let i = 0; i <= gridHeight; i++) {
        const gridY = seg.y + i * gridSpacing;
        ctx.beginPath();
        ctx.moveTo(x, gridY);
        ctx.lineTo(x + seg.width, gridY);
        ctx.stroke();
      }
      
      // Top edge highlight with stronger glow
      ctx.strokeStyle = `hsla(${hue}, 100%, 90%, 1)`;
      ctx.shadowColor = `hsla(${hue}, 100%, 70%, 0.8)`;
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, seg.y);
      ctx.lineTo(x + seg.width, seg.y);
      ctx.stroke();
      
      // Side edges for 3D effect
      ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.6)`;
      ctx.shadowBlur = 3;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + seg.width, seg.y);
      ctx.lineTo(x + seg.width, seg.y + seg.height);
      ctx.stroke();
      
      // Additional geometric details for mountains (more complex grid)
      if (terrainType === 'mountain') {
        ctx.strokeStyle = `hsla(${hue + 30}, 100%, 70%, 0.4)`;
        ctx.shadowBlur = 2;
        ctx.lineWidth = 0.5;
        
        // Diagonal lines for mountain texture
        for (let i = 0; i < seg.width; i += gridSpacing * 2) {
          ctx.beginPath();
          ctx.moveTo(x + i, seg.y);
          ctx.lineTo(x + i + gridSpacing, seg.y + seg.height);
          ctx.stroke();
        }
      }
      
      // Reset shadow
      ctx.shadowBlur = 0;
    });
  }

  checkCollision(character) {
    for (let seg of this.terrain) {
      if (
        character.x >= seg.x &&
        character.x <= seg.x + seg.width &&
        character.y + character.size * 0.7 >= seg.y &&
        character.y + character.size * 0.7 <= seg.y + seg.height
      ) {
        return {
          collided: true,
          segment: seg,
          y: seg.y - character.size * 0.7
        };
      }
    }
    return { collided: false };
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    this.generateTerrain();
  }

  getTerrain() {
    return this.terrain;
  }
} 