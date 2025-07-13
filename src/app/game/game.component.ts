import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  active: boolean;
}

interface Player extends GameObject {
  lives: number;
  score: number;
}

interface Enemy extends GameObject {
  points: number;
  direction: number;
}

interface Bullet extends GameObject {
  isPlayerBullet: boolean;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-container" #gameContainer>
      <!-- Pantalla de inicio -->
      <div *ngIf="gameState === 'menu'" class="menu-screen">
        <h2>🚀 Space Invasion</h2>
        <p>¡Defiende la Tierra!</p>
        <button (click)="startGame()" class="start-button">Iniciar Juego</button>
        <div class="instructions">
          <h3>Instrucciones:</h3>
          <p>← → Mover nave</p>
          <p>ESPACIO Disparar</p>
          <p>P Pausar</p>
        </div>
      </div>

      <!-- Pantalla de juego -->
      <div *ngIf="gameState === 'playing'" class="game-screen">
        <div class="game-info">
          <div class="score">Puntuación: {{ player.score }}</div>
          <div class="lives">Vidas: {{ player.lives }}</div>
          <div class="level">Nivel: {{ currentLevel }}</div>
        </div>
        
        <canvas #gameCanvas 
                [width]="canvasWidth" 
                [height]="canvasHeight"
                class="game-canvas">
        </canvas>
        
        <div class="game-controls">
          <button (click)="pauseGame()" class="control-button">Pausar (P)</button>
        </div>
      </div>

      <!-- Pantalla de pausa -->
      <div *ngIf="gameState === 'paused'" class="pause-screen">
        <h2>Juego Pausado</h2>
        <button (click)="resumeGame()" class="resume-button">Continuar</button>
        <button (click)="restartGame()" class="restart-button">Reiniciar</button>
      </div>

      <!-- Pantalla de game over -->
      <div *ngIf="gameState === 'gameOver'" class="game-over-screen">
        <h2>Game Over</h2>
        <p>Puntuación final: {{ player.score }}</p>
        <p>Nivel alcanzado: {{ currentLevel }}</p>
        <button (click)="restartGame()" class="restart-button">Jugar de nuevo</button>
      </div>
    </div>
  `,
  styles: [`
    .game-container {
      width: 800px;
      height: 600px;
      background: #000;
      border: 2px solid #00ff88;
      border-radius: 10px;
      position: relative;
      overflow: hidden;
    }

    .menu-screen, .pause-screen, .game-over-screen {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
      z-index: 10;
    }

    .menu-screen h2, .pause-screen h2, .game-over-screen h2 {
      font-size: 2.5rem;
      color: #00ff88;
      margin-bottom: 20px;
      text-shadow: 0 0 10px #00ff88;
    }

    .start-button, .resume-button, .restart-button {
      background: #00ff88;
      color: #000;
      border: none;
      padding: 15px 30px;
      font-size: 1.2rem;
      border-radius: 5px;
      cursor: pointer;
      margin: 10px;
      font-weight: bold;
      transition: all 0.3s ease;
    }

    .start-button:hover, .resume-button:hover, .restart-button:hover {
      background: #00cc6a;
      transform: scale(1.05);
    }

    .instructions {
      margin-top: 30px;
      text-align: center;
    }

    .instructions h3 {
      color: #00ff88;
      margin-bottom: 10px;
    }

    .instructions p {
      margin: 5px 0;
      color: #cccccc;
    }

    .game-screen {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .game-info {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      display: flex;
      justify-content: space-between;
      color: #00ff88;
      font-weight: bold;
      z-index: 5;
    }

    .game-canvas {
      display: block;
      background: #000;
    }

    .game-controls {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 5;
    }

    .control-button {
      background: rgba(0, 255, 136, 0.2);
      color: #00ff88;
      border: 1px solid #00ff88;
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .control-button:hover {
      background: rgba(0, 255, 136, 0.3);
    }
  `]
})
export class GameComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: false }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  
  canvasWidth = 800;
  canvasHeight = 600;
  
  gameState: 'menu' | 'playing' | 'paused' | 'gameOver' = 'menu';
  
  player: Player = {
    x: 0,
    y: 0,
    width: 40,
    height: 30,
    speed: 5,
    active: true,
    lives: 3,
    score: 0
  };
  
  enemies: Enemy[] = [];
  playerBullets: Bullet[] = [];
  enemyBullets: Bullet[] = [];
  
  currentLevel = 1;
  enemySpeed = 1;
  enemyDirection = 1;
  enemyDropDistance = 20;
  
  // Ajustes de velocidad base
  basePlayerSpeed = 420; // nave mucho más rápida
  baseBulletSpeed = 400; // balas más lentas
  baseEnemySpeed = 22;   // enemigos más lentos
  maxPlayerBullets = 5; // hasta 5 balas en pantalla

  private animationId: number = 0;
  private keys: { [key: string]: boolean } = {};
  private canvasReady = false;
  private lastTimestamp: number = 0;
  
  private backgroundMusic: HTMLAudioElement | null = null;
  private shootSound: HTMLAudioElement | null = null;
  private enemyShootSound: HTMLAudioElement | null = null;
  private gameOverSound: HTMLAudioElement | null = null;
  private damageSound: HTMLAudioElement | null = null;
  private nextLevelSound: HTMLAudioElement | null = null;
  private bossMusic: HTMLAudioElement | null = null;
  private winSound: HTMLAudioElement | null = null;

  showLevelMessage = false;
  levelMessage = '';

  showBossIntro = false;
  bossIntroProgress = 0;
  bossMaxHealth = 30;
  bossHealth = 30;

  // Para el disparo circular del jefe
  timeToNextBossCircle = 0;

  ngOnInit() {
    this.backgroundMusic = new Audio('assets/music/space.mp3');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.5;
    this.bossMusic = new Audio('assets/music/boss.mp3');
    this.bossMusic.loop = true;
    this.bossMusic.volume = 0.5;
    this.shootSound = new Audio('assets/sfx/pew.mp3');
    this.shootSound.volume = 0.5;
    this.enemyShootSound = new Audio('assets/sfx/shots.mp3');
    this.enemyShootSound.volume = 0.5;
    this.gameOverSound = new Audio('assets/sfx/gameover.mp3');
    this.gameOverSound.volume = 0.7;
    this.damageSound = new Audio('assets/sfx/damage.mp3');
    this.damageSound.volume = 0.7;
    this.nextLevelSound = new Audio('assets/sfx/next-level.mp3');
    this.nextLevelSound.volume = 0.8;
    this.winSound = new Audio('assets/sfx/win.mp3');
    this.winSound.volume = 0.8;
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.canvasReady = true;
      this.draw();
      // Reproducir música al cargar el canvas
      this.playMusic();
    });
  }
  
  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.stopMusic();
  }
  
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    this.keys[event.code] = true;
    
    if (event.code === 'Space' && this.gameState === 'playing') {
      event.preventDefault();
      this.shoot();
    }
    
    if (event.code === 'KeyP' && this.gameState === 'playing') {
      this.pauseGame();
    }
  }
  
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    this.keys[event.code] = false;
  }
  
  initializeGame() {
    this.player.x = this.canvasWidth / 2 - this.player.width / 2;
    this.player.y = this.canvasHeight - this.player.height - 20;
    this.player.lives = 3;
    this.player.score = 0;
    this.currentLevel = 1;
    this.enemySpeed = 1;
    this.enemyDirection = 1;
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.createEnemies();
  }
  
  createEnemies() {
    this.enemies = [];
    const rows = 5;
    const cols = 10;
    const enemyWidth = 40;
    const enemyHeight = 30;
    const spacing = 60;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const enemy: Enemy = {
          x: col * spacing + 50,
          y: row * spacing + 50,
          width: enemyWidth,
          height: enemyHeight,
          speed: this.enemySpeed,
          active: true,
          points: (rows - row) * 10,
          direction: 1
        };
        this.enemies.push(enemy);
      }
    }
  }
  
  startGame() {
    if (!this.canvasReady) return;
    this.initializeGame();
    this.gameState = 'playing';
    setTimeout(() => this.draw(), 0);
    this.lastTimestamp = performance.now();
    this.gameLoop(this.lastTimestamp);
    this.playMusic();
  }
  
  playMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic.play().catch(() => {});
      // Refuerzo el loop manualmente
      this.backgroundMusic.onended = () => {
        this.backgroundMusic!.currentTime = 0;
        this.backgroundMusic!.play().catch(() => {});
      };
    }
  }

  pauseMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
    }
  }

  stopMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
    if (this.bossMusic) {
      this.bossMusic.pause();
      this.bossMusic.currentTime = 0;
    }
  }

  pauseGame() {
    this.gameState = 'paused';
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.pauseMusic();
  }
  
  resumeGame() {
    this.gameState = 'playing';
    this.lastTimestamp = performance.now();
    this.gameLoop(this.lastTimestamp);
    this.playMusic();
  }
  
  restartGame() {
    this.initializeGame();
    this.gameState = 'playing';
    setTimeout(() => this.draw(), 0);
    this.lastTimestamp = performance.now();
    this.gameLoop(this.lastTimestamp);
    this.playMusic();
  }
  
  playShootSound() {
    if (this.shootSound) {
      this.shootSound.currentTime = 0;
      this.shootSound.play().catch(() => {});
    }
  }

  playEnemyShootSound() {
    if (this.enemyShootSound) {
      this.enemyShootSound.currentTime = 0;
      this.enemyShootSound.play().catch(() => {});
    }
  }

  playGameOverSound() {
    if (this.gameOverSound) {
      this.gameOverSound.currentTime = 0;
      this.gameOverSound.play().catch(() => {});
    }
  }

  playDamageSound() {
    if (this.damageSound) {
      this.damageSound.currentTime = 0;
      this.damageSound.play().catch(() => {});
    }
  }

  playNextLevelSound() {
    if (this.nextLevelSound) {
      this.nextLevelSound.currentTime = 0;
      this.nextLevelSound.play().catch(() => {});
    }
  }

  playWinSound() {
    if (this.winSound) {
      this.winSound.currentTime = 0;
      this.winSound.play().catch(() => {});
    }
  }

  showLevelTransition(level: number) {
    this.levelMessage = `¡Nivel ${level}!`;
    this.showLevelMessage = true;
    setTimeout(() => {
      this.showLevelMessage = false;
    }, 2000);
  }

  shoot() {
    if (this.playerBullets.length < this.maxPlayerBullets) {
      const bullet: Bullet = {
        x: this.player.x + this.player.width / 2 - 2,
        y: this.player.y,
        width: 4,
        height: 14, // balas más largas para que parezcan más juntas
        speed: this.baseBulletSpeed,
        active: true,
        isPlayerBullet: true
      };
      this.playerBullets.push(bullet);
      this.playShootSound();
    }
  }
  
  enemyShoot() {
    if (this.enemies.length > 0 && Math.random() < 0.04) {
      const randomEnemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];
      if (randomEnemy.active) {
        const bullet: Bullet = {
          x: randomEnemy.x + randomEnemy.width / 2 - 2,
          y: randomEnemy.y + randomEnemy.height,
          width: 4,
          height: 10,
          speed: this.baseBulletSpeed * 0.5,
          active: true,
          isPlayerBullet: false
        };
        this.enemyBullets.push(bullet);
        this.playEnemyShootSound(); // Sonido de disparo alien
      }
    }
  }
  
  updatePlayer(delta: number) {
    const moveAmount = this.basePlayerSpeed * delta;
    if (this.keys['ArrowLeft'] && this.player.x > 0) {
      this.player.x -= moveAmount;
      if (this.player.x < 0) this.player.x = 0;
    }
    if (this.keys['ArrowRight'] && this.player.x < this.canvasWidth - this.player.width) {
      this.player.x += moveAmount;
      if (this.player.x > this.canvasWidth - this.player.width) this.player.x = this.canvasWidth - this.player.width;
    }
  }
  
  updateEnemies(delta: number) {
    let shouldChangeDirection = false;
    const speed = this.baseEnemySpeed + (this.currentLevel - 1) * 7;
    for (const enemy of this.enemies) {
      if (enemy.active) {
        enemy.x += speed * delta * enemy.direction;
        if (enemy.x <= 0 || enemy.x >= this.canvasWidth - enemy.width) {
          shouldChangeDirection = true;
        }
        // Solo termina el juego si un alien llega a la línea del jugador
        if (enemy.y + enemy.height >= this.player.y) {
          this.gameOver();
          return;
        }
      }
    }
    if (shouldChangeDirection) {
      for (const enemy of this.enemies) {
        if (enemy.active) {
          enemy.direction *= -1;
          enemy.y += this.enemyDropDistance;
        }
      }
      this.enemyDirection *= -1;
    }
  }
  
  updateBullets(delta: number) {
    // Balas del jugador
    const bulletSpeed = this.baseBulletSpeed;
    this.playerBullets = this.playerBullets.filter(bullet => {
      bullet.y -= bulletSpeed * delta;
      return bullet.active && bullet.y > 0;
    });
    // Balas enemigas
    this.enemyBullets = this.enemyBullets.filter(bullet => {
      if ((bullet as any).dx !== undefined && (bullet as any).dy !== undefined) {
        bullet.x += (bullet as any).dx * bullet.speed * delta;
        bullet.y += (bullet as any).dy * bullet.speed * delta;
      } else {
        bullet.y += bulletSpeed * 0.5 * delta;
      }
      return bullet.active && bullet.y < this.canvasHeight && bullet.x > 0 && bullet.x < this.canvasWidth;
    });
  }
  
  checkCollisions() {
    // Colisión entre balas del jugador y enemigos
    for (const bullet of this.playerBullets) {
      for (const enemy of this.enemies) {
        if (bullet.active && enemy.active && this.isColliding(bullet, enemy)) {
          bullet.active = false;
          // Si es jefe
          if (this.currentLevel === 3 && this.enemies.length === 1) {
            this.bossHealth--;
            if (this.bossHealth <= 0) {
              enemy.active = false;
              this.player.score += enemy.points;
              this.levelMessage = '!Yoou win!';
              this.showLevelMessage = true;
              this.playWinSound();
              // No ocultar el mensaje, dejarlo fijo
              // Aquí puedes poner lógica de victoria/final
            }
          } else {
            enemy.active = false;
            this.player.score += enemy.points;
            if (this.enemies.every(e => !e.active)) {
              this.nextLevel();
            }
          }
        }
      }
    }
    // Colisión entre balas enemigas y jugador
    for (const bullet of this.enemyBullets) {
      if (bullet.active && this.isColliding(bullet, this.player)) {
        bullet.active = false;
        this.player.lives--;
        this.playDamageSound();
        if (this.player.lives <= 0) {
          this.gameOver();
        }
      }
    }
    // Ya no se pierde por contacto directo con los enemigos
  }
  
  isColliding(obj1: GameObject, obj2: GameObject): boolean {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  }
  
  nextLevel() {
    this.currentLevel++;
    this.enemySpeed += 0.5;
    this.createEnemies();
    this.playNextLevelSound();
    this.showLevelTransition(this.currentLevel);
    // Carga previa al jefe
    if (this.currentLevel === 3) {
      this.showBossIntro = true;
      this.bossIntroProgress = 0;
      let interval = setInterval(() => {
        this.bossIntroProgress += 10; // aún más rápido (0.5 segundos)
        if (this.bossIntroProgress >= 100) {
          clearInterval(interval);
          this.showBossIntro = false;
          this.startBossFight();
        }
      }, 5); // 0.5 segundos
      this.stopMusic();
      if (this.bossMusic) {
        this.bossMusic.currentTime = 0;
        this.bossMusic.play().catch(() => {});
        this.bossMusic.onended = () => {
          this.bossMusic!.currentTime = 0;
          this.bossMusic!.play().catch(() => {});
        };
      }
    }
  }

  startBossFight() {
    // Solo un jefe gigante
    this.enemies = [{
      x: this.canvasWidth / 2 - 80,
      y: 60,
      width: 160,
      height: 80,
      speed: 0,
      active: true,
      points: 500,
      direction: 1
    }];
    this.bossHealth = this.bossMaxHealth;
    this.timeToNextBossCircle = 1; // cada 1 segundo exacto
  }

  gameOver() {
    this.gameState = 'gameOver';
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.stopMusic();
    this.playGameOverSound();
  }
  
  draw() {
    if (!this.gameCanvas || !this.gameCanvas.nativeElement) return;
    const ctx = this.gameCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    // Limpiar canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    // Barra de mapa vertical y centrada a la derecha (de abajo hacia arriba)
    ctx.save();
    const barX = this.canvasWidth - 50;
    const barY = this.canvasHeight / 2 - 100;
    ctx.fillStyle = '#222';
    ctx.fillRect(barX, barY, 16, 200);
    // Progreso de abajo hacia arriba
    ctx.fillStyle = '#00ff88';
    let progress = Math.min((this.currentLevel - 1) / 2, 1); // 0 en nivel 1, 0.5 en 2, 1 en 3
    ctx.fillRect(barX, barY + 200 - 200 * progress, 16, 200 * progress);
    // Niveles alineados a la derecha, de abajo hacia arriba
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'right';
    ctx.fillText('Nivel 1', barX - 10, barY + 200);
    ctx.fillText('Nivel 2', barX - 10, barY + 100);
    ctx.fillText('Nivel 3', barX - 10, barY + 10);
    // Cara del jefe arriba
    ctx.font = '22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('👾', barX + 20, barY);
    ctx.restore();
    // Barra de carga/mapa antes del jefe (solo animación, no barra principal)
    if (this.showBossIntro) {
      ctx.save();
      ctx.fillStyle = '#222';
      ctx.fillRect(this.canvasWidth / 2 - 150, this.canvasHeight / 2 - 20, 300, 30);
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(this.canvasWidth / 2 - 150, this.canvasHeight / 2 - 20, 3 * this.bossIntroProgress, 30);
      ctx.font = 'bold 36px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText('¡Prepárate!', this.canvasWidth / 2, this.canvasHeight / 2 - 40);
      ctx.restore();
      return;
    }
    // Dibujar nave (triángulo futurista)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.player.x + this.player.width / 2, this.player.y); // punta
    ctx.lineTo(this.player.x, this.player.y + this.player.height); // esquina izq
    ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height); // esquina der
    ctx.closePath();
    ctx.fillStyle = '#00ffea';
    ctx.shadowColor = '#00ffea';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();
    // Dibujar cabina
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.player.x + this.player.width / 2, this.player.y + this.player.height * 0.7, this.player.width * 0.15, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
    // Dibujar enemigos (pixel art tipo Space Invaders)
    for (const enemy of this.enemies) {
      if (enemy.active) {
        this.drawAlien(ctx, enemy.x, enemy.y, enemy.width, enemy.height, enemy.points);
      }
    }
    // Dibujar balas del jugador
    ctx.fillStyle = '#00ff88';
    for (const bullet of this.playerBullets) {
      if (bullet.active) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      }
    }
    // Dibujar balas enemigas
    ctx.fillStyle = '#ff4444';
    for (const bullet of this.enemyBullets) {
      if (bullet.active) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      }
    }
    // Si es jefe, dibujar barra de vida SOLO si está activo y vida > 0
    if (this.currentLevel === 3 && this.enemies.length === 1 && this.enemies[0].active && this.bossHealth > 0) {
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.fillRect(this.enemies[0].x, this.enemies[0].y - 20, this.enemies[0].width, 10);
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(this.enemies[0].x, this.enemies[0].y - 20, this.enemies[0].width * (this.bossHealth / 30), 10);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(this.enemies[0].x, this.enemies[0].y - 20, this.enemies[0].width, 10);
      ctx.restore();
    }
    // Mensaje de nivel o victoria
    if (this.showLevelMessage) {
      // Si es victoria, oscurecer pantalla
      if (this.levelMessage === '!Yoou win!') {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        ctx.restore();
      }
      ctx.save();
      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 20;
      ctx.fillText(this.levelMessage, this.canvasWidth / 2, this.canvasHeight / 2);
      ctx.restore();
    }
  }

  // Dibuja un alien tipo Space Invader pixelado
  private drawAlien(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, points: number) {
    // El color depende de los puntos (fila)
    let color = '#ffeb3b';
    if (points >= 40) color = '#ff4081';
    else if (points >= 30) color = '#7c4dff';
    else if (points >= 20) color = '#00e676';
    // Pixel art: matriz 8x8
    const pixel = w / 8;
    const shape = [
      [0,1,1,0,0,1,1,0],
      [1,0,1,1,1,1,0,1],
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [1,1,0,1,1,0,1,1],
      [1,1,1,1,1,1,1,1],
      [0,1,1,0,0,1,1,0],
      [1,0,0,0,0,0,0,1],
    ];
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = color;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (shape[row][col]) {
          ctx.fillRect(x + col * pixel, y + row * pixel, pixel, pixel);
        }
      }
    }
    ctx.restore();
  }
  
  gameLoop(timestamp: number) {
    if (this.gameState === 'playing') {
      const delta = (timestamp - this.lastTimestamp) / 1000; // en segundos
      this.lastTimestamp = timestamp;
      this.updatePlayer(delta);
      this.updateEnemies(delta);
      this.updateBullets(delta);
      this.enemyShoot();
      // Disparo circular del jefe
      if (this.currentLevel === 3 && this.enemies.length === 1 && this.enemies[0].active && this.bossHealth > 0) {
        this.timeToNextBossCircle -= delta;
        if (this.timeToNextBossCircle <= 0) {
          this.bossCircularShoot();
          this.timeToNextBossCircle = 1;
        }
      }
      this.checkCollisions();
      this.draw();
      this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }
  }

  bossCircularShoot() {
    const boss = this.enemies[0];
    const centerX = boss.x + boss.width / 2;
    const centerY = boss.y + boss.height / 2;
    const numBullets = 12;
    const angleStep = (2 * Math.PI) / numBullets;
    for (let i = 0; i < numBullets; i++) {
      const angle = i * angleStep;
      const speed = this.baseBulletSpeed * 0.5;
      this.enemyBullets.push({
        x: centerX,
        y: centerY,
        width: 6,
        height: 6,
        speed: speed,
        active: true,
        isPlayerBullet: false,
        // Extra: dirección personalizada
        dx: Math.cos(angle),
        dy: Math.sin(angle)
      } as any);
    }
    this.playEnemyShootSound();
  }
} 