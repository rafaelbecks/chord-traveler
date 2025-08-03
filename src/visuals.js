import { CONFIG } from './config.js';

export class BackgroundVisuals {
  constructor() {
    this.backgroundTime = 0;
    this.gegoShapeNodes = [];
    this.gegoShapeConnections = [];
    this.lastGegoShapeChordSig = '';
  }

  update() {
    this.backgroundTime += 0.016; // Approximate 60fps
  }

  drawBackgroundPattern(ctx, camera) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    // Grid pattern
    const gridSize = CONFIG.VISUALS.BACKGROUND_GRID_SIZE;
    const offsetX = (camera.x * 0.1) % gridSize;
    const offsetY = 0;
    
    for (let x = -offsetX; x < ctx.canvas.width + gridSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
      ctx.stroke();
    }
    
    for (let y = offsetY; y < ctx.canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      ctx.stroke();
    }
  }

  drawGegoShapeBackground(ctx, notes, hue) {
    if (!notes || notes.length === 0) return;

    const chordSig = notes.map(n => n.midi).sort().join('-');
    const velocityAvg = notes.reduce((a, n) => a + n.velocity, 0) / notes.length;

    const numNodes = 4 + notes.length * 2;
    const deformAmount = 0.1 + velocityAvg * 0.2;
    const baseSize = 200;
    const radius = baseSize * (1 + velocityAvg * 0.8);
    const scale = 1 + velocityAvg * 0.5;

    // Only regenerate if chord changes
    if (chordSig !== this.lastGegoShapeChordSig) {
      this.gegoShapeNodes = [];

      for (let i = 0; i < numNodes; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 1;

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        this.gegoShapeNodes.push({ 
          x, y, z, 
          offset: Math.random() * 10,
          color: `hsl(${Math.random() * 360}, 80%, 60%)` // Random color for each node
        });
      }

      this.gegoShapeConnections = [];
      for (let i = 0; i < this.gegoShapeNodes.length; i++) {
        for (let j = i + 1; j < this.gegoShapeNodes.length; j++) {
          if (Math.random() < 0.4) {
            this.gegoShapeConnections.push([i, j]);
          }
        }
      }

      this.lastGegoShapeChordSig = chordSig;
    }

    const angle = this.backgroundTime * 0.15;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    ctx.save();
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.lineWidth = 1;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
    ctx.shadowBlur = 3;

    // Draw connections with gradient colors
    this.gegoShapeConnections.forEach(([i, j]) => {
      const a = this.gegoShapeNodes[i];
      const b = this.gegoShapeNodes[j];

      const ax = a.x * cos - a.z * sin;
      const az = a.x * sin + a.z * cos;
      const ay = a.y + Math.sin(this.backgroundTime * 0.001 + a.offset) * deformAmount;

      const bx = b.x * cos - b.z * sin;
      const bz = b.x * sin + b.z * cos;
      const by = b.y + Math.sin(this.backgroundTime * 0.001 + b.offset) * deformAmount;

      const x1 = ax * radius * az * scale;
      const y1 = ay * radius * az * scale;
      const x2 = bx * radius * bz * scale;
      const y2 = by * radius * bz * scale;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const r = 4 + velocityAvg * 4;
      const ux = dx / dist;
      const uy = dy / dist;

      // Create gradient between node colors
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, a.color);
      gradient.addColorStop(1, b.color);

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.moveTo(x1 + ux * r, y1 + uy * r);
      ctx.lineTo(x2 - ux * r, y2 - uy * r);
      ctx.stroke();
    });

    // Draw nodes with their individual colors
    this.gegoShapeNodes.forEach((node) => {
      const x = node.x * cos - node.z * sin;
      const z = node.x * sin + node.z * cos;
      const y = node.y + Math.sin(this.backgroundTime * 0.001 + node.offset) * deformAmount;

      const px = x * radius * z * scale;
      const py = y * radius * z * scale;
      const dotSize = 4 + velocityAvg * 4;

      ctx.beginPath();
      ctx.arc(px, py, dotSize, 0, Math.PI * 2);
      ctx.strokeStyle = node.color;
      ctx.fillStyle = node.color;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fill();
    });

    // Guarantee every node has at least one connection
    this.gegoShapeNodes.forEach((node, i) => {
      const hasConnection = this.gegoShapeConnections.some(([a, b]) => a === i || b === i);
      if (!hasConnection) {
        // Find closest node to connect to
        let closest = -1;
        let minDist = Infinity;
        for (let j = 0; j < this.gegoShapeNodes.length; j++) {
          if (i === j) continue;
          const dx = node.x - this.gegoShapeNodes[j].x;
          const dy = node.y - this.gegoShapeNodes[j].y;
          const dz = node.z - this.gegoShapeNodes[j].z;
          const dist = dx * dx + dy * dy + dz * dz;
          if (dist < minDist) {
            minDist = dist;
            closest = j;
          }
        }
        if (closest !== -1) {
          this.gegoShapeConnections.push([i, closest]);
        }
      }
    });

    ctx.restore();
  }
} 