import { CONFIG } from './config.js';

export class Particle {
  constructor(x, y, vx, vy, life, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2; // gravity
    this.life--;
  }
  
  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.strokeStyle = `hsla(${this.color}, 100%, 70%, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 2, this.y - this.vy * 2);
    ctx.stroke();
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  addParticle(x, y, vx, vy, life, color) {
    this.particles.push(new Particle(x, y, vx, vy, life, color));
  }

  createJumpParticles(x, y, jumpPower, hue) {
    const particleCount = Math.floor(jumpPower / 2);
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 2 + Math.random() * 3;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 2;
      this.addParticle(
        x,
        y,
        vx,
        vy,
        CONFIG.VISUALS.PARTICLE_LIFE_MIN + Math.random() * 20,
        hue
      );
    }
  }

  createFallParticles(x, y, hue) {
    for (let i = 0; i < 20; i++) {
      const vx = (Math.random() - 0.5) * 8;
      const vy = -Math.random() * 4;
      this.addParticle(
        x,
        y,
        vx,
        vy,
        60 + Math.random() * 40,
        hue
      );
    }
  }

  update() {
    this.particles = this.particles.filter(particle => {
      particle.update();
      return particle.life > 0;
    });
  }

  draw(ctx) {
    this.particles.forEach(particle => particle.draw(ctx));
  }
} 