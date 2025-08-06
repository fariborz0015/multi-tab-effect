// Modern Multi-Tab Effect JavaScript
class MultiTabEffect {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.id = Math.random().toString(36).substr(2, 9);
    
    this.setupCanvas();
    this.setupBall();
    this.setupEventListeners();
    this.setupInstructions();
    
    this.animate();
    this.startBroadcasting();
  }

  setupCanvas() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  setupBall() {
    this.defaultX = this.width / 2;
    this.defaultY = this.height / 2;
    this.ball = {
      x: this.defaultX,
      y: this.defaultY,
      r: 30,
      color: '#00ffff',
      glow: 0,
      pulse: 0
    };
    this.targetX = this.defaultX;
    this.targetY = this.defaultY;
    this.otherWindow = null;
  }

  setupEventListeners() {
    window.addEventListener('storage', (e) => this.handleStorageEvent(e));
    window.addEventListener('resize', () => this.handleResize());
    window.addEventListener('click', (e) => this.handleClick(e));
  }

  setupInstructions() {
    // Hide instructions after 5 seconds
    const instructions = document.querySelector('.instructions');
    if (instructions) {
      setTimeout(() => {
        instructions.style.opacity = '0';
        setTimeout(() => instructions.remove(), 300);
      }, 5000);
    }
  }

  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.defaultX = this.width / 2;
    this.defaultY = this.height / 2;
  }

  handleClick(e) {
    // Reset ball to center on click
    this.targetX = this.defaultX;
    this.targetY = this.defaultY;
    this.ball.glow = 1;
  }

  drawBall(x, y, r, color, glow = 0) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    
    // Create gradient for modern look
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, this.adjustColor(color, -30));
    
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // Add glow effect
    if (glow > 0) {
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 20 * glow;
      this.ctx.beginPath();
      this.ctx.arc(x, y, r + 5, 0, Math.PI * 2);
      this.ctx.fillStyle = color + '40';
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }
  }

  adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Smooth movement with easing
    const easing = 0.08;
    this.ball.x += (this.targetX - this.ball.x) * easing;
    this.ball.y += (this.targetY - this.ball.y) * easing;

    // Update glow effect
    this.ball.glow = Math.max(0, this.ball.glow - 0.02);
    this.ball.pulse = (this.ball.pulse + 0.05) % (Math.PI * 2);

    // Add subtle pulse effect
    const pulseSize = Math.sin(this.ball.pulse) * 2;
    
    this.drawBall(
      this.ball.x, 
      this.ball.y, 
      this.ball.r + pulseSize, 
      this.ball.color, 
      this.ball.glow
    );

    requestAnimationFrame(() => this.animate());
  }

  broadcast() {
    const data = {
      id: this.id,
      screenX: window.screenX,
      screenY: window.screenY,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      timestamp: Date.now()
    };
    localStorage.setItem('window-sync', JSON.stringify(data));
  }

  handleStorageEvent(e) {
    if (e.key === 'window-sync') {
      const data = JSON.parse(e.newValue);
      if (data.id !== this.id) {
        this.otherWindow = data;
        this.updateTargetPosition();
      }
    }
  }

  updateTargetPosition() {
    const myLeft = window.screenX;
    const myRight = window.screenX + window.outerWidth;
    const myTop = window.screenY;
    const myBottom = window.screenY + window.outerHeight;

    const otherLeft = this.otherWindow.screenX;
    const otherRight = this.otherWindow.screenX + this.otherWindow.outerWidth;
    const otherTop = this.otherWindow.screenY;
    const otherBottom = this.otherWindow.screenY + this.otherWindow.outerHeight;

    const threshold = 100;

    // Horizontal (X): Attract to walls
    if (Math.abs(myRight - otherLeft) < threshold) {
      this.targetX = this.width - this.ball.r - 30;
      this.ball.glow = 0.8;
    } else if (Math.abs(myLeft - otherRight) < threshold) {
      this.targetX = this.ball.r + 30;
      this.ball.glow = 0.8;
    } else {
      this.targetX = this.defaultX;
    }

    // Vertical (Y): Coordinate ball heights
    const yDiff = otherTop - myTop;
    if (Math.abs(yDiff) < 200) {
      const verticalOffset = yDiff * 0.3;
      this.targetY = this.defaultY + verticalOffset;
    } else {
      this.targetY = this.defaultY;
    }
  }

  startBroadcasting() {
    setInterval(() => this.broadcast(), 100);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MultiTabEffect();
}); 