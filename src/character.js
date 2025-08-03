import { CONFIG } from './config.js';

export class Character {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = canvas.width / 4;
    this.y = canvas.height - 120;
    this.size = CONFIG.CHARACTER.SIZE;
    this.vx = 0;
    this.vy = 0;
    this.onGround = true;
    this.gravity = CONFIG.CHARACTER.GRAVITY;
    this.stepSize = CONFIG.CHARACTER.STEP_SIZE;
    this.color = 'white';
    this.head = 'circle';
    this.jumpPower = 0;
    this.jumpDistance = 0;
    this.isJumping = false;
    this.glowIntensity = 0;
    this.headShapeIndex = 0;
    this.headShapes = ['circle', 'square', 'triangle', 'hexagon'];
  }

  update() {
    this.vy += this.gravity;
    this.y += this.vy;
    
    // Move horizontally and apply air resistance
    this.x += this.vx;
    this.vx *= 0.95; // Air resistance
  }

  jump(jumpPower, jumpDistance) {
    if (this.onGround) {
      this.vy = -jumpPower;
      this.vx = jumpDistance;
      this.onGround = false;
      this.isJumping = true;
      this.jumpPower = jumpPower;
      this.jumpDistance = jumpDistance;
    }
  }

  step() {
    this.x += this.stepSize;
  }

  land(y) {
    this.y = y;
    this.vy = 0;
    this.vx = 0;
    this.onGround = true;
    if (this.isJumping) {
      this.isJumping = false;
      this.glowIntensity = 0;
    }
  }

  reset() {
    this.x = this.canvas.width / 4;
    this.y = this.canvas.height - 120;
    this.vy = 0;
    this.vx = 0;
    this.isJumping = false;
    this.glowIntensity = 0;
    this.jumpDistance = 0;
  }

  setGlowIntensity(intensity) {
    this.glowIntensity = intensity;
  }

  changeHeadShape() {
    this.head = this.headShapes[this.headShapeIndex % this.headShapes.length];
    this.headShapeIndex++;
  }

  draw(ctx, camera, hue) {
    const x = this.x - camera.x;
    const y = this.y;
    const s = this.size;
    
    ctx.save();
    ctx.translate(x, y);
    
    // Dynamic glow effect based on chord complexity
    if (this.glowIntensity > 0) {
      const glowRadius = 20 + (this.glowIntensity * 30);
      const glowAlpha = 0.3 + (this.glowIntensity * 0.4);
      
      ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
      ctx.shadowBlur = glowRadius;
      
      // Draw glow outline
      ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${glowAlpha})`;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, -s * 0.8, s * 0.15, 0, 2 * Math.PI);
      ctx.stroke();
    }
    
    // Main character stroke
    ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 0;

    // Head (dynamic shape with enhanced geometry) - thinner
    switch (this.head) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, -s * 0.8, s * 0.15, 0, 2 * Math.PI);
        ctx.stroke();
        // Inner detail
        ctx.beginPath();
        ctx.arc(0, -s * 0.8, s * 0.08, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case 'square':
        ctx.strokeRect(-s * 0.15, -s * 0.95, s * 0.3, s * 0.3);
        // Inner cross
        ctx.beginPath();
        ctx.moveTo(-s * 0.08, -s * 0.85);
        ctx.lineTo(s * 0.08, -s * 0.65);
        ctx.moveTo(-s * 0.08, -s * 0.65);
        ctx.lineTo(s * 0.08, -s * 0.85);
        ctx.stroke();
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.1);
        ctx.lineTo(-s * 0.2, -s * 0.7);
        ctx.lineTo(s * 0.2, -s * 0.7);
        ctx.closePath();
        ctx.stroke();
        // Inner triangle
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.95);
        ctx.lineTo(-s * 0.12, -s * 0.8);
        ctx.lineTo(s * 0.12, -s * 0.8);
        ctx.closePath();
        ctx.stroke();
        break;
      case 'hexagon':
        const r = s * 0.15;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const px = r * Math.cos(angle);
          const py = -s * 0.8 + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        // Inner hexagon
        const innerR = s * 0.08;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const px = innerR * Math.cos(angle);
          const py = -s * 0.8 + innerR * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        break;
    }

    // Body (thinner geometric torso)
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.6);
    ctx.lineTo(-s * 0.2, 0);
    ctx.lineTo(s * 0.2, 0);
    ctx.closePath();
    ctx.stroke();
    
    // Body detail lines
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.5);
    ctx.lineTo(0, -s * 0.25);
    ctx.moveTo(-s * 0.1, -s * 0.35);
    ctx.lineTo(s * 0.1, -s * 0.35);
    ctx.stroke();

    // Legs (thinner and longer)
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, 0);
    ctx.lineTo(-s * 0.25, s * 0.4);
    ctx.lineTo(-s * 0.25, s * 0.7);
    ctx.moveTo(s * 0.2, 0);
    ctx.lineTo(s * 0.25, s * 0.4);
    ctx.lineTo(s * 0.25, s * 0.7);
    ctx.stroke();
    
    // Knee joints
    ctx.beginPath();
    ctx.arc(-s * 0.25, s * 0.4, s * 0.03, 0, 2 * Math.PI);
    ctx.arc(s * 0.25, s * 0.4, s * 0.03, 0, 2 * Math.PI);
    ctx.stroke();

    // Arms (thinner and longer)
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, -s * 0.4);
    ctx.lineTo(-s * 0.3, -s * 0.25);
    ctx.lineTo(-s * 0.35, -s * 0.1);
    ctx.moveTo(s * 0.2, -s * 0.4);
    ctx.lineTo(s * 0.3, -s * 0.25);
    ctx.lineTo(s * 0.35, -s * 0.1);
    ctx.stroke();
    
    // Shoulder joints
    ctx.beginPath();
    ctx.arc(-s * 0.2, -s * 0.4, s * 0.03, 0, 2 * Math.PI);
    ctx.arc(s * 0.2, -s * 0.4, s * 0.03, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  isFallen() {
    return this.y > this.canvas.height + 100;
  }
} 